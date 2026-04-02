#!/usr/bin/env bash
# Same as recreate-database.postgres.sql but runs via: sudo -u postgres psql
# Use on VPS when TCP password auth fails but local "peer" auth works (typical Ubuntu Postgres).
# Reads only DB_NAME from Backend/.env (optional; default fleet_management).
set -euo pipefail
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_DIR"

DB_NAME="fleet_management"
if [[ -f .env ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line//[$' \t']/}" ]] && continue
    case "$line" in
      DB_NAME=*) DB_NAME="${line#*=}" ;;
    esac
  done < .env
fi
strip_dq() {
  local v="$1"
  if [[ "$v" == \"*\" ]]; then v="${v:1:$((${#v} - 2))}"; fi
  printf '%s' "$v"
}
DB_NAME=$(strip_dq "$DB_NAME")

SQL_FILE="$BACKEND_DIR/scripts/recreate-database.postgres.sql"
TMP_SQL="$(mktemp)"
trap 'rm -f "$TMP_SQL"' EXIT
sed "s/fleet_management/${DB_NAME//\//\\/}/g" "$SQL_FILE" > "$TMP_SQL"

echo "Recreating database \"$DB_NAME\" as OS user postgres (peer auth) …"
sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 -f "$TMP_SQL"
echo "Done. Next: npm run migrate   (or sync schema via API in dev)"
