#!/usr/bin/env python3
"""
Maintenance + driver (and all other) test users are created by create_test_users.py.
This entrypoint is kept for old scripts/docs that still call this file.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
if __name__ == "__main__":
    print("→ create_maintenance_users.py forwards to create_test_users.py (all roles)\n")
    r = subprocess.run(
        [sys.executable, os.path.join(ROOT, "create_test_users.py")] + sys.argv[1:],
        cwd=ROOT,
        env=os.environ.copy(),
    )
    sys.exit(r.returncode)
