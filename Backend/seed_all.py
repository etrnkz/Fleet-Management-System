#!/usr/bin/env python3
"""
Single entrypoint: seed university colleges/departments (signup dropdowns), test users,
one vehicle, one driver profile.

Requires: Python 3 + requests, API running.

  cd Backend
  python seed_all.py

Remote:

  FLEET_API_BASE=https://your-api.com/api/v1 python seed_all.py

Options:
  SEED_SKIP_HEALTH_WAIT=1  — do not wait for /health
  --no-wait-health         — same as above

Default password for all seeded user accounts: password123
"""

from __future__ import annotations

import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

import requests

from organization_catalog import ORGANIZATION
from seed_organization import resolve_default_seed_org, seed_organization_catalog

BASE = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")
HEALTH_URL = f"{BASE}/health"
HEADERS_JSON = {"Content-Type": "application/json"}
TIMEOUT = 60


class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    WHITE = "\033[97m"
    GRAY = "\033[90m"
    RESET = "\033[0m"


def print_c(text: str, color: str = Colors.WHITE) -> None:
    print(f"{color}{text}{Colors.RESET}")


def wait_for_api(timeout_sec: int = 120) -> None:
    if os.environ.get("SEED_SKIP_HEALTH_WAIT") == "1" or "--no-wait-health" in sys.argv:
        return
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
    print("ERROR: API did not respond. Start the backend, then run again.", file=sys.stderr)
    print("  Or: SEED_SKIP_HEALTH_WAIT=1 python seed_all.py", file=sys.stderr)
    sys.exit(1)


def api_call(
    method: str,
    endpoint: str,
    body: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None,
) -> Optional[Any]:
    headers = dict(HEADERS_JSON)
    if token:
        headers["Authorization"] = f"Bearer {token}"
    url = f"{BASE}{endpoint}"
    try:
        if method == "POST":
            r = requests.post(url, json=body, headers=headers, timeout=TIMEOUT)
        elif method == "GET":
            r = requests.get(url, headers=headers, timeout=TIMEOUT)
        else:
            raise ValueError(method)
        r.raise_for_status()
        if r.text:
            return r.json()
        return None
    except requests.exceptions.RequestException as e:
        print_c(f"Error: {e}", Colors.RED)
        if getattr(e, "response", None) is not None and e.response is not None:
            print_c(e.response.text[:800], Colors.RED)
        return None


def post_register(body: Dict[str, Any]) -> str:
    try:
        r = requests.post(
            f"{BASE}/auth/register",
            headers=HEADERS_JSON,
            json=body,
            timeout=TIMEOUT,
        )
        if r.status_code in (200, 201):
            return "created"
        if r.status_code == 409:
            return "exists"
        print_c(f"  HTTP {r.status_code}: {r.text[:800]}", Colors.RED)
        return "error"
    except requests.exceptions.RequestException as e:
        print_c(f"  Request error: {e}", Colors.RED)
        return "error"


def seed_users(token: str, college_id: str, department_id: str) -> None:
    users: List[Dict[str, Any]] = [
        {
            "name": "Employee User",
            "email": "employee@test.com",
            "password": "password123",
            "role": "User",
            "phoneNumber": "+251911234567",
            "departmentId": department_id,
        },
        {
            "name": "Department Head",
            "email": "depthead@test.com",
            "password": "password123",
            "role": "DepartmentHead",
            "phoneNumber": "+251911234568",
            "departmentId": department_id,
        },
        {
            "name": "College Dean",
            "email": "dean@test.com",
            "password": "password123",
            "role": "Dean",
            "phoneNumber": "+251911234569",
            "collegeId": college_id,
        },
        {
            "name": "College Head",
            "email": "collegehead@test.com",
            "password": "password123",
            "role": "CollegeHead",
            "phoneNumber": "+251911234576",
            "collegeId": college_id,
        },
        {
            "name": "University President",
            "email": "president@test.com",
            "password": "password123",
            "role": "President",
            "phoneNumber": "+251911234570",
        },
        {
            "name": "Deployment Team",
            "email": "deployment@test.com",
            "password": "password123",
            "role": "DeploymentTeam",
            "phoneNumber": "+251911234571",
        },
        {
            "name": "Transport Office",
            "email": "transport@test.com",
            "password": "password123",
            "role": "TransportOffice",
            "phoneNumber": "+251911234572",
        },
        {
            "name": "Gate Security",
            "email": "gate@test.com",
            "password": "password123",
            "role": "Gate",
            "phoneNumber": "+251911234573",
        },
        {
            "name": "Maintenance Team Lead",
            "email": "maintenance@test.com",
            "password": "password123",
            "role": "MaintenanceTeam",
            "phoneNumber": "+251911234574",
        },
        {
            "name": "Test Driver",
            "email": "driver@test.com",
            "password": "password123",
            "role": "Driver",
            "phoneNumber": "+251911234575",
        },
        {
            "name": "System Administrator",
            "email": "sysadmin@hu.edu.et",
            "password": "password123",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123456",
        },
        {
            "name": "Super Administrator",
            "email": "superadmin@hu.edu.et",
            "password": "password123",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123457",
        },
        {
            "name": "Developer Campus",
            "email": "developer@hu.edu.et",
            "password": "password123",
            "role": "Developer",
            "phoneNumber": "+251911123458",
        },
    ]

    print_c("Registering role users (/auth/register)...", Colors.YELLOW)
    for u in users:
        print_c(f"  {u['name']} ({u['role']})", Colors.CYAN)
        reg: Dict[str, Any] = {
            "email": u["email"],
            "password": u["password"],
            "name": u["name"],
            "role": u["role"],
            "phoneNumber": u["phoneNumber"],
        }
        if "departmentId" in u:
            reg["departmentId"] = u["departmentId"]
        if "collegeId" in u:
            reg["collegeId"] = u["collegeId"]
        out = post_register(reg)
        if out == "created":
            print_c(f"    ✓ {u['email']}", Colors.GREEN)
        elif out == "exists":
            print_c(f"    ○ exists {u['email']}", Colors.YELLOW)
        else:
            print_c(f"    ✗ {u['email']}", Colors.RED)
        print()


def find_user_id_by_email(token: str, email: str) -> Optional[str]:
    users = api_call("GET", "/users", None, token)
    if not isinstance(users, list):
        return None
    for u in users:
        if u.get("email") == email:
            return u.get("id")
    return None


def main() -> None:
    os.environ.setdefault("FLEET_API_BASE", BASE)
    wait_for_api()

    print_c("=" * 56, Colors.CYAN)
    print_c("Fleet Management — seed_all (users + 1 vehicle + 1 driver)", Colors.CYAN)
    print_c("=" * 56, Colors.CYAN)
    print_c(f"API: {BASE}", Colors.GRAY)
    print()

    # Developer
    print_c("Developer user...", Colors.YELLOW)
    out = post_register(
        {
            "email": "developer@test.com",
            "password": "password123",
            "name": "System Developer",
            "role": "Developer",
            "phoneNumber": "+251911234566",
        }
    )
    if out == "error":
        print_c("✗ Cannot create developer", Colors.RED)
        sys.exit(1)
    print_c(
        "✓ developer@test.com"
        if out == "created"
        else "○ developer@test.com (exists)",
        Colors.GREEN if out == "created" else Colors.YELLOW,
    )

    login = api_call(
        "POST",
        "/auth/login",
        {"email": "developer@test.com", "password": "password123"},
    )
    if not login or "access_token" not in login:
        print_c("✗ Developer login failed", Colors.RED)
        sys.exit(1)
    token = login["access_token"]
    print()

    # Full university org (dropdowns + approvals); demo users stay on CBE / Management
    dept_total = sum(len(row["departments"]) for row in ORGANIZATION)
    print_c(
        f"Colleges & departments ({len(ORGANIZATION)} colleges, {dept_total} departments)...",
        Colors.YELLOW,
    )
    seed_organization_catalog(token, verbose=False)
    college_id, department_id = resolve_default_seed_org(token)
    if not college_id or not department_id:
        print_c(
            "✗ Could not resolve College of Business and Economics + Management (CBE_MGT or MGT)",
            Colors.RED,
        )
        sys.exit(1)
    print_c(
        f"✓ catalog applied; seed users → college CBE, dept Management ({department_id})",
        Colors.GREEN,
    )
    print()

    seed_users(token, college_id, department_id)

    # One vehicle
    print_c("One vehicle (POST /vehicles)...", Colors.YELLOW)
    vehicle_body = {
        "plateNumber": "AA-12345",
        "make": "Toyota",
        "model": "Coaster",
        "year": 2020,
        "capacity": 30,
        "fuelType": "Diesel",
        "status": "Active",
    }
    try:
        vr = requests.post(
            f"{BASE}/vehicles",
            headers={**HEADERS_JSON, "Authorization": f"Bearer {token}"},
            json=vehicle_body,
            timeout=TIMEOUT,
        )
        if vr.status_code == 201:
            print_c("✓ vehicle AA-12345", Colors.GREEN)
        elif vr.status_code == 409:
            print_c("○ vehicle AA-12345 already exists", Colors.YELLOW)
        else:
            print_c(f"✗ vehicles {vr.status_code}: {vr.text[:500]}", Colors.RED)
    except requests.exceptions.RequestException as e:
        print_c(f"✗ {e}", Colors.RED)
    print()

    # One driver profile (links to User driver@test.com)
    print_c("One driver profile (POST /drivers)...", Colors.YELLOW)
    driver_user_id = find_user_id_by_email(token, "driver@test.com")
    if not driver_user_id:
        print_c("✗ driver@test.com user not found — register users first", Colors.RED)
        sys.exit(1)

    driver_body = {
        "userId": driver_user_id,
        "licenseNumber": "DL-SEED-001",
        "licenseExpiry": "2030-12-31",
        "experienceYears": 5,
        "specializations": "Fleet seed",
        "notes": "Created by seed_all.py",
    }
    try:
        r = requests.post(
            f"{BASE}/drivers",
            headers={**HEADERS_JSON, "Authorization": f"Bearer {token}"},
            json=driver_body,
            timeout=TIMEOUT,
        )
        if r.status_code == 201:
            print_c("✓ driver profile for driver@test.com", Colors.GREEN)
        elif r.status_code == 409:
            print_c("○ driver profile already exists", Colors.YELLOW)
        else:
            print_c(f"✗ drivers POST {r.status_code}: {r.text[:600]}", Colors.RED)
    except requests.exceptions.RequestException as e:
        print_c(f"✗ {e}", Colors.RED)

    print()
    print_c("=" * 56, Colors.CYAN)
    print_c("Done. Password: password123", Colors.GREEN)
    print_c(
        "  developer@test.com + all roles; 1× vehicle AA-12345; 1× driver (driver@test.com)",
        Colors.GRAY,
    )
    print_c("=" * 56, Colors.CYAN)


if __name__ == "__main__":
    main()
