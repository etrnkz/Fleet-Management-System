#!/usr/bin/env bash
# Tests Postgres using only DB_* lines from .env.
# Do NOT use: export $(grep .env | xargs) — values like EMAIL_FROM=...<noreply@...>
# break the shell because < and > are operators.
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

# Strip optional surrounding " on DB values (dotenv-style)
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

echo "Testing: ${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c 'SELECT 1 AS ok'
