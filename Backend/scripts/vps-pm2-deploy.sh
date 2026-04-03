#!/usr/bin/env bash
# Ubuntu VPS: install deps, build, run DB migrations, (re)start PM2.
# Usage (from repo):  bash Backend/scripts/vps-pm2-deploy.sh
# Prereqs: Node 20+, PostgreSQL + Redis reachable, .env in Backend/, pm2 installed globally.

set -euo pipefail

BACKEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_ROOT"

if [[ ! -f .env ]]; then
  echo "Create Backend/.env (see Backend/.env.example)." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source ./.env
set +a

export NODE_ENV="${NODE_ENV:-production}"

echo "==> npm ci --omit=dev"
npm ci --omit=dev

echo "==> npm run build"
npm run build

echo "==> npm run migration:run (requires dist/ from build above)"
npm run migration:run

echo "==> pm2 reload or start"
if pm2 describe fleet-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save
echo "Done. API: http://127.0.0.1:${PORT:-3000}/api/v1/health"
