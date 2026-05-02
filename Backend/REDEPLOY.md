# Backend — Redeploy Guide

Run all commands from the Backend directory on the server.

---

## Code update only (no DB reset) — most common

```bash
cd /root/Fleet-Management-System/Backend

git pull origin master
rm -rf dist
npm run build
pm2 restart fleet-api
pm2 logs fleet-api --lines 30 --nostream
```

---

## Full reset (drop DB, rebuild, migrate, seed, restart)

Use this when you need a clean slate — new deployment or schema change.

```bash
cd /root/Fleet-Management-System/Backend

# 1. Pull latest
git pull origin master

# 2. Stop app
pm2 stop fleet-api

# 3. Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS fleet_management;"
sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER postgres;"

# 4. Install dependencies
npm ci

# 5. Clean build
rm -rf dist
npm run build

# 6. Run migrations (creates all tables)
npm run migration:run

# 7. Seed system accounts only (Admin, President, Transport, Deployment, Gate)
npm run seed

# 8. Restart PM2
pm2 delete fleet-api
pm2 start ecosystem.config.cjs
pm2 save

# 9. Verify
pm2 status
curl http://localhost:3000/api/v1/health
```

---

## Full reset one-liner

```bash
cd /root/Fleet-Management-System/Backend && git pull origin master && pm2 stop fleet-api && sudo -u postgres psql -c "DROP DATABASE IF EXISTS fleet_management;" && sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER postgres;" && npm ci && rm -rf dist && npm run build && npm run migration:run && npm run seed && pm2 delete fleet-api && pm2 start ecosystem.config.cjs && pm2 save
```

---

## Seed options

| Command | What it creates |
|---------|----------------|
| `npm run seed` | 5 system accounts only (Admin, President, Transport, Deployment, Gate) |
| `npm run seed:all` | Everything: system accounts + all colleges/departments + driver + deans/heads/employees (demo) |

---

## Default accounts after `npm run seed`

| Role | Email | Password |
|------|-------|----------|
| SystemAdmin | admin@haramaya.edu.et | Password@123 |
| President | president@haramaya.edu.et | Password@123 |
| TransportOffice | transport@haramaya.edu.et | Password@123 |
| DeploymentTeam | deployment@haramaya.edu.et | Password@123 |
| Gate | gate@haramaya.edu.et | Password@123 |

All other users (Deans, Dept Heads, Employees, Drivers) are created via the System Admin panel.

---

## Reset stuck drivers/vehicles (without DB wipe)

```bash
# Reset all drivers to Available
psql -U postgres -d fleet_management -c "UPDATE drivers SET status = 'Available' WHERE status = 'OnTrip';"

# Reset all vehicles to Active
psql -U postgres -d fleet_management -c "UPDATE vehicles SET status = 'Active' WHERE status = 'Maintenance';"
```

---

## Verify tables after migration

```bash
sudo -u postgres psql -d fleet_management -c "\dt"
```

Expected tables: `audit_logs`, `colleges`, `departments`, `drivers`, `fuel_records`, `gps_locations`, `maintenance_requests`, `migrations`, `notifications`, `trip_feedback`, `trip_requests`, `users`, `vehicles`, `workflow_configurations`

---

## PM2 commands

```bash
pm2 status                          # check running processes
pm2 logs fleet-api --lines 50       # view recent logs
pm2 restart fleet-api               # restart without rebuild
pm2 stop fleet-api                  # stop
pm2 delete fleet-api                # remove from PM2 list
pm2 start ecosystem.config.cjs      # start fresh
pm2 save                            # persist process list across reboots
```
