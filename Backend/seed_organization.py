#!/usr/bin/env python3
"""
Create or ensure all colleges and departments from organization_catalog.py.

Requires Developer JWT (same as seed_all.py).

  cd Backend
  python seed_organization.py

Uses FLEET_API_BASE like seed_all.py.
"""

from __future__ import annotations

import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

import requests

from organization_catalog import ORGANIZATION

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
    print("ERROR: API did not respond.", file=sys.stderr)
    sys.exit(1)


def _auth_headers(token: str) -> Dict[str, str]:
    return {**HEADERS_JSON, "Authorization": f"Bearer {token}"}


def list_colleges(token: str) -> List[Dict[str, Any]]:
    r = requests.get(f"{BASE}/colleges", headers=_auth_headers(token), timeout=TIMEOUT)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else []


def list_departments(token: str) -> List[Dict[str, Any]]:
    r = requests.get(f"{BASE}/departments", headers=_auth_headers(token), timeout=TIMEOUT)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else []


def ensure_college(token: str, name: str, code: str) -> str:
    body = {"name": name, "code": code, "description": name}
    r = requests.post(
        f"{BASE}/colleges",
        json=body,
        headers=_auth_headers(token),
        timeout=TIMEOUT,
    )
    if r.status_code == 201:
        return str(r.json()["id"])
    if r.status_code in (400, 409):
        for c in list_colleges(token):
            if c.get("code") == code:
                return str(c["id"])
        print_c(f"College POST {r.status_code} but code {code} not found: {r.text[:300]}", Colors.RED)
        return ""
    r.raise_for_status()
    return ""


def ensure_department(
    token: str,
    name: str,
    code: str,
    college_id: str,
) -> str:
    body = {
        "name": name,
        "code": code,
        "collegeId": college_id,
        "description": name,
    }
    r = requests.post(
        f"{BASE}/departments",
        json=body,
        headers=_auth_headers(token),
        timeout=TIMEOUT,
    )
    if r.status_code == 201:
        return str(r.json()["id"])
    if r.status_code in (400, 409):
        for d in list_departments(token):
            if d.get("code") == code:
                return str(d["id"])
        print_c(f"Department POST {r.status_code} but code {code} not found: {r.text[:300]}", Colors.RED)
        return ""
    r.raise_for_status()
    return ""


def seed_organization_catalog(token: str, verbose: bool = True) -> Tuple[int, int]:
    """Ensure ORGANIZATION exists. Returns (college_count_created_or_ok, dept_count)."""
    colleges_ok = 0
    depts_ok = 0
    for row in ORGANIZATION:
        cid = ensure_college(token, row["name"], row["code"])
        if not cid:
            print_c(f"✗ college {row['code']}", Colors.RED)
            continue
        colleges_ok += 1
        if verbose:
            print_c(f"  college {row['code']}: {row['name']}", Colors.GRAY)
        for d in row["departments"]:
            did = ensure_department(token, d["name"], d["code"], cid)
            if not did:
                print_c(f"✗ dept {d['code']}", Colors.RED)
                continue
            depts_ok += 1
            if verbose:
                print_c(f"    dept {d['code']}: {d['name']}", Colors.GRAY)
    return (colleges_ok, depts_ok)


def resolve_default_seed_org(token: str) -> Tuple[Optional[str], Optional[str]]:
    """
    College of Business and Economics + Management, for demo users.
    Prefers CBE_MGT; falls back to legacy MGT under CBE.
    """
    colleges = list_colleges(token)
    departments = list_departments(token)
    cbe = next((c for c in colleges if c.get("code") == "CBE"), None)
    if not cbe:
        return None, None
    cbe_id = str(cbe["id"])
    for code in ("CBE_MGT", "MGT"):
        for d in departments:
            if d.get("code") != code:
                continue
            coll = d.get("college")
            coll_id = None
            if isinstance(coll, dict) and coll.get("id") is not None:
                coll_id = str(coll["id"])
            elif d.get("collegeId") is not None:
                coll_id = str(d["collegeId"])
            if coll_id == cbe_id:
                return cbe_id, str(d["id"])
    return cbe_id, None


def developer_token() -> str:
    login = requests.post(
        f"{BASE}/auth/login",
        json={"email": "developer@test.com", "password": "password123"},
        headers=HEADERS_JSON,
        timeout=TIMEOUT,
    )
    if not login.ok:
        print_c("Login developer@test.com failed — run seed_all.py first.", Colors.RED)
        sys.exit(1)
    data = login.json()
    return str(data["access_token"])


def main() -> None:
    wait_for_api()
    print_c("Seeding colleges & departments from organization_catalog…", Colors.CYAN)
    token = developer_token()
    seed_organization_catalog(token, verbose=True)
    c_id, d_id = resolve_default_seed_org(token)
    print_c(f"Default seed org: college={c_id}, management dept={d_id}", Colors.GREEN)


if __name__ == "__main__":
    main()
