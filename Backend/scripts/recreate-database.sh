#!/usr/bin/env bash
# Drop and recreate PostgreSQL DB from Backend/.env (TCP: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME).
# Requires DB_PASSWORD to match the Postgres role. If TCP auth fails on VPS, use: ./scripts/recreate-database-sudo.sh
# Tip: DB_HOST=127.0.0.1 avoids ::1 (IPv6) when pg_hba differs for local vs loopback.
set -euo pipefail
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_DIR"

if [[ ! -f .env ]]; then
  echo "No .env in $BACKEND_DIR"
  exit 1
fi

DB_HOST="localhost"
DB_PORT="5432"
DB_USERNAME="postgres"
DB_PASSWORD=""
DB_NAME="fleet_management"

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line//[$' \t']/}" ]] && continue
  case "$line" in
    DB_HOST=*) DB_HOST="${line#*=}" ;;
    DB_PORT=*) DB_PORT="${line#*=}" ;;
    DB_USERNAME=*) DB_USERNAME="${line#*=}" ;;
    DB_PASSWORD=*) DB_PASSWORD="${line#*=}" ;;
    DB_NAME=*) DB_NAME="${line#*=}" ;;
  esac
done < .env

strip_dq() {
  local v="$1"
  if [[ "$v" == \"*\" ]]; then v="${v:1:$((${#v} - 2))}"; fi
  printf '%s' "$v"
}
DB_HOST=$(strip_dq "$DB_HOST")
DB_PORT=$(strip_dq "$DB_PORT")
DB_USERNAME=$(strip_dq "$DB_USERNAME")
DB_PASSWORD=$(strip_dq "$DB_PASSWORD")
DB_NAME=$(strip_dq "$DB_NAME")

if [[ -z "$DB_PASSWORD" ]]; then
  echo "DB_PASSWORD is empty in .env"
  exit 1
fi

SQL_FILE="$BACKEND_DIR/scripts/recreate-database.postgres.sql"
TMP_SQL="$(mktemp)"
trap 'rm -f "$TMP_SQL"' EXIT

# Inject DB name into SQL (single source: .env DB_NAME)
sed "s/fleet_management/${DB_NAME//\//\\/}/g" "$SQL_FILE" > "$TMP_SQL"

echo "Recreating database \"$DB_NAME\" on ${DB_USERNAME}@${DB_HOST}:${DB_PORT} …"
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -v ON_ERROR_STOP=1 -f "$TMP_SQL"
echo "Done. Next: npm run migrate   (or start API with DB_SYNCHRONIZE=true once for dev)"
