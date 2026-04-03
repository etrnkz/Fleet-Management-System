#!/usr/bin/env python3
"""
Seed all test accounts in one go (calls the existing Python seed scripts in order).

Requires: Python 3 + requests, API running and reachable.

  cd Backend
  python seed_all.py

Remote API:

  FLEET_API_BASE=https://your-api.com/api/v1 python seed_all.py

Optional: append --with-vehicles to also run create_test_vehicles_drivers.py (may need DTO updates).

create_test_users.py seeds every role: User, DepartmentHead, Dean, CollegeHead, President,
DeploymentTeam, TransportOffice, Gate, MaintenanceTeam, Driver, SystemAdmin, Developer, etc.

Default password for seeded users: password123
"""
from __future__ import annotations

import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")
HEALTH_URL = f"{BASE}/health"

STEPS = [
    "create_test_users.py",
]


def wait_for_api(timeout_sec: int = 120) -> None:
    if os.environ.get("SEED_SKIP_HEALTH_WAIT") == "1":
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


def main() -> None:
    extra = []
    if "--with-vehicles" in sys.argv[1:]:
        extra.append("create_test_vehicles_drivers.py")

    wait_for_api()

    env = os.environ.copy()
    env["FLEET_API_BASE"] = BASE

    for script in STEPS + extra:
        path = os.path.join(ROOT, script)
        if not os.path.isfile(path):
            print(f"Skip missing: {script}", file=sys.stderr)
            continue
        print(f"\n=== {script} ===\n")
        r = subprocess.run([sys.executable, path], cwd=ROOT, env=env)
        if r.returncode != 0:
            sys.exit(r.returncode)

    print(
        "\nDone. Default password: password123\n"
        "  developer@test.com; employee, depthead, dean, collegehead, president,\n"
        "  deployment, transport, gate, maintenance, driver (@test.com),\n"
        "  sysadmin@hu.edu.et, superadmin@hu.edu.et, developer@hu.edu.et\n"
    )


if __name__ == "__main__":
    main()
