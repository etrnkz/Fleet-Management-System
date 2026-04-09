#!/usr/bin/env bash
# Full DB setup: generate migration from entities, run it, seed.
# Usage: bash scripts/setup-db.sh
# Run from Backend/ directory.

set -euo pipefail

echo "==> Building..."
npm run build

echo "==> Generating migration from current entities..."
node -r dotenv/config ./node_modules/typeorm/cli.js migration:generate \
  src/migrations/InitialSchema \
  -d ./dist/src/data-source.js

echo "==> Running migration..."
npm run migration:run

echo "==> Seeding..."
npm run seed

echo ""
echo "Done. Database is ready."
