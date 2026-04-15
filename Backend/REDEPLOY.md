# Backend Redeploy — Full Reset

Run all commands from the **Backend directory** on the VPS (`cd ~/Fleet-Management-System/Backend`).

---

## 1. Pull latest code

```bash
cd ~/Fleet-Management-System
git pull origin main
cd Backend
```

---

## 2. Stop the running app

```bash
pm2 stop fleet-api
```

---

## 3. Drop and recreate the database

```bash
sudo -u postgres psql <<'EOF'
DROP DATABASE IF EXISTS fleet_management;
CREATE DATABASE fleet_management OWNER fleet_user;
GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;
\q
EOF
```

> Replace `fleet_user` with your actual DB user if different (check `.env` → `DB_USERNAME`).

---

## 4. Install dependencies

```bash
npm ci
```

---

## 5. Build

```bash
npm run build
```

---

## 6. Run migrations (creates all tables)

```bash
npm run migration:run
```

> This runs `InitialSchema` which creates all tables. Verify with:
> ```bash
> sudo -u postgres psql -d fleet_management -c "\dt"
> ```
> You should see ~15 tables (users, vehicles, drivers, trip_requests, etc.).

---

## 7. Seed initial data

```bash
npm run seed
```

> Creates default admin, colleges, departments, and sample data.
> Default admin: `admin@haramaya.edu.et` / `Admin@1234` — **change after first login**.

---

## 8. Restart PM2

```bash
pm2 delete fleet-api
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 9. Verify

```bash
pm2 status
pm2 logs fleet-api --lines 50
curl http://localhost:3000/api/v1/health
```

---

## One-liner (copy-paste the whole block)

```bash
cd ~/Fleet-Management-System && git pull origin main && cd Backend && \
pm2 stop fleet-api && \
sudo -u postgres psql -c "DROP DATABASE IF EXISTS fleet_management;" && \
sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER fleet_user;" && \
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;" && \
npm ci && \
npm run build && \
npm run migration:run && \
npm run seed && \
pm2 delete fleet-api && \
pm2 start ecosystem.config.cjs && \
pm2 save && \
pm2 logs fleet-api --lines 30
```
