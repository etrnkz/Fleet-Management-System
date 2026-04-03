#!/usr/bin/env python3
"""
System admin test accounts are created by create_test_users.py (sysadmin@, superadmin@, developer@hu.edu.et).
This entrypoint is kept for old scripts/docs that still call this file.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
if __name__ == "__main__":
    print("→ create_system_admin_users.py forwards to create_test_users.py (all roles)\n")
    r = subprocess.run(
        [sys.executable, os.path.join(ROOT, "create_test_users.py")] + sys.argv[1:],
        cwd=ROOT,
        env=os.environ.copy(),
    )
    sys.exit(r.returncode)
