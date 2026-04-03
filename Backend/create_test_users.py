#!/usr/bin/env python3
"""
Create all test users for Fleet Management System (every UserRole used by the apps).

Requires: API running. Set FLEET_API_BASE if not local, e.g.:
  FLEET_API_BASE=https://api.example.com/api/v1 python3 create_test_users.py

Default password for all seeded accounts: password123
"""

import os
import requests
from typing import Any, Dict, List, Optional

BASE_URL = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")
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


def print_colored(text: str, color: str = Colors.WHITE) -> None:
    print(f"{color}{text}{Colors.RESET}")


def api_call(
    method: str,
    endpoint: str,
    body: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    headers = dict(HEADERS_JSON)
    if token:
        headers["Authorization"] = f"Bearer {token}"
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "POST":
            response = requests.post(url, json=body, headers=headers, timeout=TIMEOUT)
        elif method == "GET":
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
        else:
            raise ValueError(f"Unsupported method: {method}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print_colored(f"Error: {e}", Colors.RED)
        if getattr(e, "response", None) is not None and e.response is not None:
            print_colored(f"Response: {e.response.text}", Colors.RED)
        return None


def post_register(body: Dict[str, Any]) -> str:
    """
    POST /auth/register. Returns 'created' | 'exists' | 'error'
    """
    try:
        r = requests.post(
            f"{BASE_URL}/auth/register",
            headers=HEADERS_JSON,
            json=body,
            timeout=TIMEOUT,
        )
        if r.status_code in (200, 201):
            return "created"
        if r.status_code == 409:
            return "exists"
        print_colored(f"  HTTP {r.status_code}: {r.text[:800]}", Colors.RED)
        return "error"
    except requests.exceptions.RequestException as e:
        print_colored(f"  Request error: {e}", Colors.RED)
        return "error"


def main() -> None:
    print_colored("=" * 50, Colors.CYAN)
    print_colored("Fleet Management System — seed all test users", Colors.CYAN)
    print_colored("=" * 50, Colors.CYAN)
    print()
    print_colored(f"API: {BASE_URL}", Colors.GRAY)
    print()

    # Step 0: Developer (bootstrap)
    print_colored("Step 0: Developer user...", Colors.YELLOW)
    dev_body = {
        "email": "developer@test.com",
        "password": "password123",
        "name": "System Developer",
        "role": "Developer",
        "phoneNumber": "+251911234566",
    }
    outcome = post_register(dev_body)
    if outcome == "created":
        print_colored("✓ developer@test.com created", Colors.GREEN)
    elif outcome == "exists":
        print_colored("○ developer@test.com already exists", Colors.YELLOW)
    else:
        print_colored("✗ Could not create developer — fix API and retry", Colors.RED)
        return

    print_colored("Logging in as developer...", Colors.YELLOW)
    login_response = api_call(
        "POST",
        "/auth/login",
        {
            "email": "developer@test.com",
            "password": "password123",
        },
    )
    if not login_response or "access_token" not in login_response:
        print_colored("✗ Failed to login as developer", Colors.RED)
        return
    token = login_response["access_token"]
    print_colored("✓ Developer token OK", Colors.GREEN)
    print()

    # College + department
    print_colored("Step 1: College...", Colors.YELLOW)
    college = api_call(
        "POST",
        "/colleges",
        {
            "name": "College of Business and Economics",
            "code": "CBE",
            "description": "College of Business and Economics",
        },
        token,
    )
    if college:
        college_id = college["id"]
        print_colored(f"✓ College CBE ({college_id})", Colors.GREEN)
    else:
        colleges = api_call("GET", "/colleges", None, token)
        if not colleges:
            print_colored("✗ No college — cannot attach users", Colors.RED)
            return
        college = next((c for c in colleges if c.get("code") == "CBE"), colleges[0])
        college_id = college["id"]
        print_colored(f"○ Using college {college.get('name')} ({college_id})", Colors.YELLOW)
    print()

    print_colored("Step 2: Department...", Colors.YELLOW)
    department = api_call(
        "POST",
        "/departments",
        {
            "name": "Department of Management",
            "code": "MGT",
            "collegeId": college_id,
            "description": "Department of Management",
        },
        token,
    )
    if department:
        department_id = department["id"]
        print_colored(f"✓ Department MGT ({department_id})", Colors.GREEN)
    else:
        departments = api_call("GET", "/departments", None, token)
        if not departments:
            print_colored("✗ No department — cannot attach users", Colors.RED)
            return
        department = next((d for d in departments if d.get("code") == "MGT"), departments[0])
        department_id = department["id"]
        print_colored(
            f"○ Using department {department.get('name')} ({department_id})",
            Colors.YELLOW,
        )
    print()

    # All workflow + ops roles (matches UserRole enum)
    users: List[Dict[str, Any]] = [
        {
            "name": "Employee User",
            "email": "employee@test.com",
            "password": "password123",
            "role": "User",
            "phoneNumber": "+251911234567",
            "departmentId": department_id,
            "app": "Employee portal",
        },
        {
            "name": "Department Head",
            "email": "depthead@test.com",
            "password": "password123",
            "role": "DepartmentHead",
            "phoneNumber": "+251911234568",
            "departmentId": department_id,
            "app": "Department head portal",
        },
        {
            "name": "College Dean",
            "email": "dean@test.com",
            "password": "password123",
            "role": "Dean",
            "phoneNumber": "+251911234569",
            "collegeId": college_id,
            "app": "College dean portal",
        },
        {
            "name": "College Head",
            "email": "collegehead@test.com",
            "password": "password123",
            "role": "CollegeHead",
            "phoneNumber": "+251911234576",
            "collegeId": college_id,
            "app": "College head role (enum CollegeHead)",
        },
        {
            "name": "University President",
            "email": "president@test.com",
            "password": "password123",
            "role": "President",
            "phoneNumber": "+251911234570",
            "app": "President portal",
        },
        {
            "name": "Deployment Team",
            "email": "deployment@test.com",
            "password": "password123",
            "role": "DeploymentTeam",
            "phoneNumber": "+251911234571",
            "app": "Deployment office portal",
        },
        {
            "name": "Transport Office",
            "email": "transport@test.com",
            "password": "password123",
            "role": "TransportOffice",
            "phoneNumber": "+251911234572",
            "app": "Transport admin portal",
        },
        {
            "name": "Gate Security",
            "email": "gate@test.com",
            "password": "password123",
            "role": "Gate",
            "phoneNumber": "+251911234573",
            "app": "Gate scanner app",
        },
        {
            "name": "Maintenance Team Lead",
            "email": "maintenance@test.com",
            "password": "password123",
            "role": "MaintenanceTeam",
            "phoneNumber": "+251911234574",
            "app": "Maintenance portal",
        },
        {
            "name": "Test Driver",
            "email": "driver@test.com",
            "password": "password123",
            "role": "Driver",
            "phoneNumber": "+251911234575",
            "app": "Driver app / portal",
        },
        {
            "name": "System Administrator",
            "email": "sysadmin@hu.edu.et",
            "password": "password123",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123456",
            "app": "System admin portal",
        },
        {
            "name": "Super Administrator",
            "email": "superadmin@hu.edu.et",
            "password": "password123",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123457",
            "app": "System admin portal",
        },
        {
            "name": "Developer Campus",
            "email": "developer@hu.edu.et",
            "password": "password123",
            "role": "Developer",
            "phoneNumber": "+251911123458",
            "app": "Developer (second account)",
        },
    ]

    print_colored("Step 3: Register all role users (public /auth/register)...", Colors.YELLOW)
    print()

    created_users: List[Dict[str, Any]] = []
    for user_data in users:
        name = user_data["name"]
        print_colored(f"  {name} ({user_data['role']})...", Colors.CYAN)
        reg_data: Dict[str, Any] = {
            "email": user_data["email"],
            "password": user_data["password"],
            "name": user_data["name"],
            "role": user_data["role"],
            "phoneNumber": user_data["phoneNumber"],
        }
        if "departmentId" in user_data:
            reg_data["departmentId"] = user_data["departmentId"]
        if "collegeId" in user_data:
            reg_data["collegeId"] = user_data["collegeId"]

        out = post_register(reg_data)
        if out == "created":
            print_colored(f"    ✓ created {user_data['email']}", Colors.GREEN)
        elif out == "exists":
            print_colored(f"    ○ already exists {user_data['email']}", Colors.YELLOW)
        else:
            print_colored(f"    ✗ failed {user_data['email']}", Colors.RED)
        created_users.append(user_data)
        print()

    print_colored("=" * 50, Colors.CYAN)
    print_colored("Done. Password for all: password123", Colors.GREEN)
    print_colored("=" * 50, Colors.CYAN)
    print()
    print_colored("Accounts:", Colors.YELLOW)
    print_colored("  developer@test.com (Developer)", Colors.GRAY)
    for u in created_users:
        print_colored(f"  {u['email']} ({u['role']}) — {u.get('app', '')}", Colors.GRAY)
    print()
    print_colored(
        "Next: optional vehicles/drivers → python3 create_test_vehicles_drivers.py",
        Colors.YELLOW,
    )
    print_colored("Or: python3 seed_all.py   (users only; add --with-vehicles for vehicles)", Colors.YELLOW)
    print()


if __name__ == "__main__":
    main()
