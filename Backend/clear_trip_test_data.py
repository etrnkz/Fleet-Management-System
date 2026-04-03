#!/usr/bin/env python3
"""
Remove all trip requests and related tracking/feedback/approvals for local testing.

PostgreSQL (default): prints scripts/clear-trip-data.postgres.sql — run with psql (API stopped).

SQLite (opt-in: DB_TYPE=sqlite or USE_SQLITE=true): executes deletes on the .db file.

Optional: delete trip-related notifications (keeps users/vehicles/drivers):
  python clear_trip_test_data.py --notifications
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Clear trip test data from the fleet DB")
    parser.add_argument(
        "--notifications",
        action="store_true",
        help="Also DELETE all rows from notifications (inbox)",
    )
    args = parser.parse_args()
    load_dotenv()

    if not use_sqlite():
        sql_path = ROOT / "scripts" / "clear-trip-data.postgres.sql"
        print("PostgreSQL (default). Stop the API, then run:")
        print("Stop the API, then run the SQL file, for example:")
        print(f'  psql "$DATABASE_URL" -f {sql_path.as_posix()}')
        print("or:")
        print(
            f'  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f {sql_path.as_posix()}'
        )
        if sql_path.is_file():
            print("\n--- File contents ---\n")
            print(sql_path.read_text(encoding="utf-8"))
        return 0

    sqlite_path = os.getenv("SQLITE_PATH") or str(ROOT / "fleet_management.db")
    db_file = Path(sqlite_path)
    if not db_file.is_file():
        print(f"SQLite database not found: {db_file}", file=sys.stderr)
        print("Set SQLITE_PATH in .env or create a DB by starting the API once.", file=sys.stderr)
        return 1

    stmts = [
        "PRAGMA foreign_keys = OFF;",
        "UPDATE fuel_records SET tripId = NULL WHERE tripId IS NOT NULL;",
        "DELETE FROM gps_locations;",
        "DELETE FROM trip_feedback;",
        "DELETE FROM approvals;",
    ]
    if args.notifications:
        stmts.append("DELETE FROM notifications;")
    stmts.extend(
        [
            "DELETE FROM trip_requests;",
            "PRAGMA foreign_keys = ON;",
        ]
    )

    conn = sqlite3.connect(str(db_file))
    try:
        for s in stmts:
            conn.execute(s)
        conn.commit()
    finally:
        conn.close()

    print(f"Cleared trip-related tables in {db_file}")
    if args.notifications:
        print("Also cleared notifications.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
