#!/usr/bin/env python3
"""
Automated trip lifecycle (terminal output):
  Employee creates + submits -> Dept -> Dean -> President -> Deploy allocates
  -> Transport confirms -> Transport starts -> Transport completes

Requires API at http://localhost:3000 and seeded users (create_test_users.py, etc.).
Optional env: API_BASE_URL, PASSWORD (default password123)
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    sys.exit(1)

BASE = os.environ.get("API_BASE_URL", "http://localhost:3000/api/v1").rstrip("/")
PASSWORD = os.environ.get("PASSWORD", "password123")
HEADERS_JSON = {"Content-Type": "application/json"}


def log(msg: str = "") -> None:
    print(msg)


def fail(msg: str, resp: requests.Response | None = None) -> None:
    log(f"ERROR: {msg}")
    if resp is not None:
        log(f"  HTTP {resp.status_code}: {resp.text[:2000]}")
    sys.exit(1)


def wait_for_api(timeout: int = 120) -> None:
    from urllib.parse import urlparse

    u = urlparse(BASE)
    health_url = f"{u.scheme}://{u.netloc}/api/v1/health"
    log(f"Waiting for API: {health_url} (timeout {timeout}s)...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(health_url, timeout=3)
            if r.status_code == 200:
                log("API is up.\n")
                return
        except Exception:
            pass
        time.sleep(1)
    fail("API did not become ready. Start the backend: cd Backend && npm run start:dev")


def login(email: str) -> dict:
    r = requests.post(
        f"{BASE}/auth/login",
        headers=HEADERS_JSON,
        json={"email": email, "password": PASSWORD},
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail(f"Login failed for {email}", r)
    data = r.json()
    return {"token": data["access_token"], "user": data.get("user", {})}


def auth_header(token: str) -> dict:
    return {**HEADERS_JSON, "Authorization": f"Bearer {token}"}


def ensure_vehicle(deployment_token: str) -> tuple[str, str]:
    r = requests.get(f"{BASE}/vehicles", headers=auth_header(deployment_token), timeout=30)
    if r.status_code != 200:
        fail("List vehicles failed", r)
    vehicles = r.json()
    if isinstance(vehicles, list) and len(vehicles) > 0:
        v = vehicles[0]
        log(f"Using existing vehicle: {v.get('plateNumber')} ({v['id']})")
        return v["id"], v["plateNumber"]

    ts = int(time.time())
    body = {
        "plateNumber": f"AA-{ts % 100000}",
        "make": "Toyota",
        "model": "Coaster",
        "year": 2022,
        "capacity": 30,
        "fuelType": "Diesel",
        "status": "Active",
        "currentMileage": 10000,
    }
    r = requests.post(
        f"{BASE}/vehicles",
        headers=auth_header(deployment_token),
        json=body,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Create vehicle failed", r)
    v = r.json()
    log(f"Created vehicle: {v.get('plateNumber')} ({v['id']})")
    return v["id"], v["plateNumber"]


def ensure_driver(deployment_token: str) -> str:
    dlogin = login("driver@test.com")
    user_id = dlogin["user"]["id"]

    r = requests.get(f"{BASE}/drivers", headers=auth_header(deployment_token), timeout=30)
    if r.status_code != 200:
        fail("List drivers failed", r)
    drivers = r.json()
    if isinstance(drivers, list):
        for d in drivers:
            u = d.get("user") or {}
            if u.get("id") == user_id:
                log(f"Using existing driver profile: {d['id']} ({u.get('name', '')})")
                return d["id"]

    ts = int(time.time())
    body = {
        "userId": user_id,
        "licenseNumber": f"DL-AUTO-{ts % 1000000}",
        "licenseExpiry": "2030-12-31",
        "experienceYears": 8,
    }
    r = requests.post(
        f"{BASE}/drivers",
        headers=auth_header(deployment_token),
        json=body,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Create driver failed", r)
    d = r.json()
    log(f"Created driver profile: {d['id']}")
    return d["id"]


def main() -> None:
    wait_for_api()

    log("=" * 64)
    log("Fleet Management — automated trip lifecycle")
    log("=" * 64)

    log("\n[1] Authenticating roles...")
    em = login("employee@test.com")
    dh = login("depthead@test.com")
    dn = login("dean@test.com")
    pr = login("president@test.com")
    dep = login("deployment@test.com")
    tr = login("transport@test.com")

    log("  employee, depthead, dean, president, deployment, transport: OK")

    log("\n[2] Ensuring vehicle + driver for allocation...")
    vehicle_id, plate = ensure_vehicle(dep["token"])
    driver_id = ensure_driver(dep["token"])

    log("\n[3] Employee creates trip (Normal, 72h+ ahead)...")
    start = datetime.now(timezone.utc) + timedelta(days=3)
    end = start + timedelta(hours=8)
    trip_body = {
        "tripType": "Normal",
        "destination": "Addis Ababa Conference Center",
        "purpose": "Automated end-to-end workflow run",
        "startDateTime": start.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "endDateTime": end.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "passengerCount": 4,
    }
    r = requests.post(
        f"{BASE}/trips",
        headers=auth_header(em["token"]),
        json=trip_body,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Create trip failed", r)
    trip = r.json()
    trip_id = trip["id"]
    log(f"  Trip ID: {trip_id}")
    log(f"  State after create: {trip.get('state')}")

    log("\n[4] Submit for approval...")
    r = requests.post(
        f"{BASE}/trips/{trip_id}/submit",
        headers=auth_header(em["token"]),
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Submit trip failed", r)
    trip = r.json()
    log(f"  State: {trip.get('state')}")

    log("\n[5] Approvals (department -> college -> president)...")
    for label, tok in (
        ("Department head", dh["token"]),
        ("Dean", dn["token"]),
        ("President", pr["token"]),
    ):
        r = requests.post(
            f"{BASE}/trips/{trip_id}/approve",
            headers=auth_header(tok),
            json={"comments": f"Approved by {label} (automation)"},
            timeout=30,
        )
        if r.status_code not in (200, 201):
            fail(f"{label} approve failed", r)
        trip = r.json()
        log(f"  {label}: OK -> state={trip.get('state')}")

    log("\n[6] Deployment allocates vehicle + driver...")
    r = requests.post(
        f"{BASE}/trips/{trip_id}/allocate",
        headers=auth_header(dep["token"]),
        json={
            "vehicleId": vehicle_id,
            "driverId": driver_id,
            "estimatedFuelCost": 120.0,
            "estimatedDistance": 75.0,
        },
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Allocate failed", r)
    trip = r.json()
    log(f"  State: {trip.get('state')}")

    log("\n[7] Transport confirms...")
    r = requests.post(
        f"{BASE}/trips/{trip_id}/confirm-transport",
        headers=auth_header(tr["token"]),
        json={"fuelApproved": True},
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Confirm transport failed", r)
    trip = r.json()
    log(f"  State: {trip.get('state')}")

    log("\n[8] Start trip (transport office)...")
    r = requests.post(
        f"{BASE}/trips/{trip_id}/start",
        headers=auth_header(tr["token"]),
        json={"plateNumber": plate, "scannerValidation": True},
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Start trip failed", r)
    trip = r.json()
    log(f"  State: {trip.get('state')}")

    log("\n[9] Complete trip...")
    r = requests.post(
        f"{BASE}/trips/{trip_id}/complete",
        headers=auth_header(tr["token"]),
        json={
            "actualDistance": 78.5,
            "actualFuelCost": 118.0,
            "finalMileage": 10078,
            "notes": "Automated completion",
        },
        timeout=30,
    )
    if r.status_code not in (200, 201):
        fail("Complete trip failed", r)
    trip = r.json()
    log(f"  Final state: {trip.get('state')}")

    log("\n[10] Final trip snapshot (GET)...")
    r = requests.get(f"{BASE}/trips/{trip_id}", headers=auth_header(em["token"]), timeout=30)
    if r.status_code != 200:
        fail("Get trip failed", r)
    final = r.json()

    log("\n" + "=" * 64)
    log("SUCCESS — Trip lifecycle finished")
    log("=" * 64)
    summary = {
        "tripId": final.get("id"),
        "requestNumber": final.get("requestNumber"),
        "destination": final.get("destination"),
        "state": final.get("state"),
        "vehiclePlate": (final.get("allocatedVehicle") or {}).get("plateNumber"),
        "driverName": ((final.get("allocatedDriver") or {}).get("user") or {}).get("name"),
        "completedAt": final.get("completedAt"),
        "actualFuelCost": final.get("actualFuelCost"),
        "actualDistance": final.get("actualDistance"),
    }
    log(json.dumps(summary, indent=2))
    log("")


if __name__ == "__main__":
    main()
