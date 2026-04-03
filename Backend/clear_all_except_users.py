#!/usr/bin/env python3
"""
Wipe all application data but keep user accounts (email, password hash, roles, names).

Removes: trips, vehicles, drivers, fuel, maintenance, notifications, audit logs, GPS,
workflow config, colleges, departments (and clears users' department/college links).

Stop the API before running.

PostgreSQL (default): prints scripts/clear-all-but-users.postgres.sql — run with psql.

SQLite (DB_TYPE=sqlite or USE_SQLITE=true):
  python clear_all_except_users.py --yes

After reset, re-seed colleges/departments/workflows if you need them:
  npm run seed:all
  (or recreate org structure in admin / signup-metadata flow)
"""
from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)


def use_sqlite() -> bool:
    t = (os.getenv("DB_TYPE") or "").strip().lower()
    if t == "sqlite":
        return True
    return (os.getenv("USE_SQLITE") or "").strip().lower() == "true"


SQLITE_RESET = """
PRAGMA foreign_keys = OFF;

UPDATE fuel_records SET tripId = NULL WHERE tripId IS NOT NULL;

DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM gps_locations;
DELETE FROM trip_feedback;
DELETE FROM approvals;
DELETE FROM trip_requests;
DELETE FROM fuel_records;
DELETE FROM maintenance_requests;
DELETE FROM vehicles;
DELETE FROM drivers;
DELETE FROM workflow_configurations;

UPDATE users SET departmentId = NULL, collegeId = NULL;
UPDATE colleges SET headId = NULL;
UPDATE departments SET headId = NULL;
DELETE FROM departments;
DELETE FROM colleges;

PRAGMA foreign_keys = ON;
"""


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Delete all data except the users table (credentials preserved)",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Required confirmation flag (destructive)",
    )
    args = parser.parse_args()
    if not args.yes:
        print(
            "This will delete ALL data except user accounts. Re-run with --yes to confirm.",
            file=sys.stderr,
        )
        return 1

    load_dotenv()

    if not use_sqlite():
        sql_path = ROOT / "scripts" / "clear-all-but-users.postgres.sql"
        print("PostgreSQL (default). Stop the API, then run:")
        print(f'  psql "$DATABASE_URL" -f {sql_path.as_posix()}')
        print("or:")
        print(
            f'  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f {sql_path.as_posix()}'
        )
        if sql_path.is_file():
            print("\n--- SQL file ---\n")
            print(sql_path.read_text(encoding="utf-8"))
        return 0

    sqlite_path = os.getenv("SQLITE_PATH") or str(ROOT / "fleet_management.db")
    db_file = Path(sqlite_path)
    if not db_file.is_file():
        print(f"SQLite database not found: {db_file}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(str(db_file))
    try:
        conn.executescript(SQLITE_RESET)
        conn.commit()
    finally:
        conn.close()

    print(f"Reset complete (users kept): {db_file}")
    print("Tip: run `npm run seed:all` to restore colleges, departments, and sample accounts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
