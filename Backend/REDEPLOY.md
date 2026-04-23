# Backend — Clear DB & Redeploy

Run all commands from `/root/Fleet-Management-System/Backend` on the VPS.

---

## Full Reset (drop DB, rebuild, migrate, seed, restart)

```bash
cd /root/Fleet-Management-System/Backend

# 1. Pull latest code
git pull origin main

# 2. Stop the app
pm2 stop fleet-api

# 3. Drop and recreate the database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS fleet_management;"
sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER postgres;"

# 4. Install dependencies
npm ci

# 5. Clean build (removes stale dist files)
rm -rf dist
npm run build

# 6. Run migrations (creates all tables)
npm run migration:run

# 7. Seed initial data
npm run seed

# 8. Restart PM2
pm2 delete fleet-api
pm2 start ecosystem.config.cjs
pm2 save

# 9. Verify
pm2 status
sudo -u postgres psql -d fleet_management -c "\dt"
curl http://localhost:3000/api/v1/health
```

---

## One-liner

```bash
cd /root/Fleet-Management-System/Backend && git pull origin main && pm2 stop fleet-api && sudo -u postgres psql -c "DROP DATABASE IF EXISTS fleet_management;" && sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER postgres;" && npm ci && rm -rf dist && npm run build && npm run migration:run && npm run seed && pm2 delete fleet-api && pm2 start ecosystem.config.cjs && pm2 save
```

---

## Code update only (no DB reset)

```bash
cd /root/Fleet-Management-System/Backend
git pull origin main
rm -rf dist
npm run build
pm2 restart fleet-api
pm2 logs fleet-api --lines 20 --nostream
```

---

## Reset stuck drivers/vehicles (without DB wipe)

```bash
# Reset all drivers to Available
psql -U postgres -d fleet_management -c "UPDATE drivers SET status = 'Available' WHERE status = 'OnTrip';"

# Reset all vehicles to Active (except Inactive ones)
psql -U postgres -d fleet_management -c "UPDATE vehicles SET status = 'Active' WHERE status = 'Maintenance';"
```

---

## Default accounts after seed

| Role | Email | Password |
|---|---|---|
| SystemAdmin | admin@haramaya.edu.et | Password@123 |
| President | president@haramaya.edu.et | Password@123 |
| TransportOffice | transport@haramaya.edu.et | Password@123 |
| DeploymentTeam | deployment@haramaya.edu.et | Password@123 |
| Driver | driver@haramaya.edu.et | Password@123 |
| Gate | gate@haramaya.edu.et | Password@123 |
| Employee (test) | postman@haramaya.edu.et | Password@123 |
| Dean (CCI) | dean.computing-and-inform@haramaya.edu.et | Password@123 |
| Dept Head (CS) | head.computer-science@haramaya.edu.et | Password@123 |

> All seeded users share the same password: `Password@123`

---

## Verify tables after migration

```bash
sudo -u postgres psql -d fleet_management -c "\dt"
```

Expected tables: `approvals`, `audit_logs`, `colleges`, `departments`, `drivers`, `fuel_records`, `gps_locations`, `maintenance_requests`, `migrations`, `notifications`, `trip_feedback`, `trip_requests`, `users`, `vehicles`, `workflow_configurations`
