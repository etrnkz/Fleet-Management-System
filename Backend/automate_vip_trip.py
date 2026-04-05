#!/usr/bin/env python3
"""
Automate a full VIP trip lifecycle:
create -> submit -> approve -> allocate -> confirm -> start -> complete.

Prerequisites:
  - API is running
  - seed_all.py has already created default users/vehicle/driver

Usage:
  cd Backend
  python automate_vip_trip.py
"""

from __future__ import annotations

import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import requests

BASE = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")
HEALTH_URL = f"{BASE}/health"
TIMEOUT = 60
HEADERS_JSON = {"Content-Type": "application/json"}


def wait_for_api(timeout_sec: int = 120) -> None:
    print(f"Waiting for API health: {HEALTH_URL} (up to {timeout_sec}s)...")
    deadline = time.monotonic() + timeout_sec
    while time.monotonic() < deadline:
        try:
            req = urllib.request.Request(HEALTH_URL, method="GET")
            with urllib.request.urlopen(req, timeout=5) as r:
                if r.status == 200:
                    print("API is up.")
                    return
        except (urllib.error.URLError, OSError, TimeoutError):
            pass
        time.sleep(1)
    raise RuntimeError("API did not respond. Start backend and retry.")


def auth_headers(token: str) -> Dict[str, str]:
    return {**HEADERS_JSON, "Authorization": f"Bearer {token}"}


def login(email: str, password: str = "password123") -> str:
    r = requests.post(
        f"{BASE}/auth/login",
        headers=HEADERS_JSON,
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    r.raise_for_status()
    data = r.json()
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"No access_token for {email}")
    return str(token)


def get_trip(trip_id: str, token: str) -> Dict[str, Any]:
    r = requests.get(f"{BASE}/trips/{trip_id}", headers=auth_headers(token), timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def post_json(path: str, token: str, body: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.post(
        f"{BASE}{path}",
        headers=auth_headers(token),
        json=body,
        timeout=TIMEOUT,
    )
    r.raise_for_status()
    return r.json() if r.text else {}


def find_pending_trip_id(token: str, trip_id: str) -> bool:
    r = requests.get(f"{BASE}/trips/pending/approvals", headers=auth_headers(token), timeout=TIMEOUT)
    r.raise_for_status()
    data = r.json()
    if not isinstance(data, list):
        return False
    return any(x.get("id") == trip_id for x in data)


def main() -> None:
    wait_for_api()

    print("Logging in default users...")
    employee_token = login("employee@test.com")
    dept_head_token = login("depthead@test.com")
    dean_token = login("dean@test.com")
    president_token = login("president@test.com")
    deployment_token = login("deployment@test.com")
    transport_token = login("transport@test.com")
    driver_token = login("driver@test.com")
    print("Logged in.")

    now = datetime.now(timezone.utc)
    start = now + timedelta(hours=72)
    end = start + timedelta(hours=4)

    create_body = {
        "tripType": "VIP",
        "purpose": "Automated VIP request for end-to-end workflow validation",
        "destination": "Addis Ababa - VIP Program Office",
        "startDateTime": start.isoformat().replace("+00:00", "Z"),
        "endDateTime": end.isoformat().replace("+00:00", "Z"),
        "passengerCount": 3,
    }
    trip = post_json("/trips", employee_token, create_body)
    trip_id = str(trip["id"])
    print(f"Created VIP trip: {trip_id} (state={trip.get('state')})")

    trip = post_json(f"/trips/{trip_id}/submit", employee_token, {})
    print(f"Submitted trip: state={trip.get('state')}")

    approvers = [
        ("Department Head", dept_head_token),
        ("Dean", dean_token),
        ("President", president_token),
    ]
    approval_attempts = 0
    while True:
        current = get_trip(trip_id, transport_token)
        state = current.get("state")
        if state == "APPROVED_FOR_ALLOCATION":
            print("Approval chain complete.")
            break
        if approval_attempts > 10:
            raise RuntimeError(f"Approval flow did not converge. Current state: {state}")

        progressed = False
        for role_name, token in approvers:
            if find_pending_trip_id(token, trip_id):
                post_json(
                    f"/trips/{trip_id}/approve",
                    token,
                    {"comments": f"Auto-approved by {role_name}"},
                )
                print(f"{role_name} approved trip.")
                progressed = True
                approval_attempts += 1
                break
        if not progressed:
            raise RuntimeError(
                f"No approver has trip in pending approvals. Current state: {state}"
            )

    v_resp = requests.get(f"{BASE}/vehicles/available", headers=auth_headers(deployment_token), timeout=TIMEOUT)
    d_resp = requests.get(f"{BASE}/drivers/available", headers=auth_headers(deployment_token), timeout=TIMEOUT)
    v_resp.raise_for_status()
    d_resp.raise_for_status()
    vehicles = v_resp.json() if isinstance(v_resp.json(), list) else []
    drivers = d_resp.json() if isinstance(d_resp.json(), list) else []
    if not vehicles:
        raise RuntimeError("No available vehicle found for allocation.")
    if not drivers:
        raise RuntimeError("No available driver found for allocation.")

    vehicle = vehicles[0]
    driver = drivers[0]
    print(f"Allocating vehicle={vehicle.get('plateNumber')} driver={driver.get('licenseNumber')}")
    trip = post_json(
        f"/trips/{trip_id}/allocate",
        deployment_token,
        {
            "vehicleId": vehicle["id"],
            "driverId": driver["id"],
            "estimatedFuelCost": 3500,
            "estimatedDistance": 180,
        },
    )
    print(f"Allocated: state={trip.get('state')}")

    trip = post_json(
        f"/trips/{trip_id}/confirm-transport",
        transport_token,
        {
            "fuelApproved": True,
            "comments": "Auto-confirmed for automation run",
            "estimatedFuelCost": 3400,
            "estimatedDistance": 175,
        },
    )
    print(f"Transport confirmed: state={trip.get('state')}")

    plate = str((trip.get("allocatedVehicle") or {}).get("plateNumber") or vehicle.get("plateNumber"))
    trip = post_json(
        f"/trips/{trip_id}/start",
        driver_token,
        {
            "plateNumber": plate,
            "scannerValidation": True,
        },
    )
    print(f"Started trip: state={trip.get('state')}")

    current_mileage = float(vehicle.get("currentMileage") or 0)
    trip = post_json(
        f"/trips/{trip_id}/complete",
        driver_token,
        {
            "actualDistance": 172.4,
            "actualFuelCost": 3325.75,
            "finalMileage": current_mileage + 172.4,
        },
    )
    print(f"Completed trip: state={trip.get('state')}")
    print(f"Done. VIP trip completed successfully: {trip_id}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
