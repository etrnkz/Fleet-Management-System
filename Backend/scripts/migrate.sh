#!/usr/bin/env bash
# Run from repo root or from Backend/: applies TypeORM migrations using .env in Backend/.
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: No .env in $BACKEND_DIR"
  echo "  cp .env.production.example .env"
  echo "  Edit DB_PASSWORD, JWT_*, etc., then re-run this script."
  exit 1
fi

echo "==> Building (compiles migrations to dist/)..."
npm run build

echo "==> Running pending migrations..."
npm run migration:run

echo "==> Done. Start or restart API: pm2 restart fleet-api"
