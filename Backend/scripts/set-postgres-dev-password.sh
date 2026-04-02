#!/usr/bin/env bash
# TESTING ONLY - sets role "postgres" password to "postgres" (matches Backend/.env.example defaults).
# Run on Linux/VPS once if migration:run fails with password authentication failed:
#   cd Backend && bash scripts/set-postgres-dev-password.sh
# Do not use on production servers.
set -euo pipefail
echo ">>> Setting PostgreSQL user 'postgres' password to 'postgres' (testing default)."
sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 \
  -c "ALTER USER postgres WITH PASSWORD 'postgres';"
echo ">>> Done. Ensure Backend/.env has: DB_USERNAME=postgres  DB_PASSWORD=postgres"
