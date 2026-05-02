# Fleet Management System — Haramaya University

Production-grade full-stack Fleet Management System. Digitizes vehicle fleet operations including trip requests, multi-level approvals, real-time GPS tracking, driver management, fuel tracking, and maintenance.

---

## Repository Structure

```
Fleet-Management-System/
├── Backend/          NestJS REST API + WebSocket server (PostgreSQL, TypeORM)
├── frontend/         Unified Next.js web app — all 8 roles, role-based routing
├── Mobile/
│   └── fleet_mobile/ Flutter app — Driver & Gate Scanner (unified)
└── docs/             Defense guide, normalization analysis, diagrams
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript, PostgreSQL 15, TypeORM, Socket.IO, JWT |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Mobile | Flutter 3 (Dart) — Android |
| Deployment | PM2, Cloudflare Tunnel, Docker |

---

## Web App — Role Dashboards

Single Next.js app. After login, users are routed automatically by role:

| Role | Path |
|------|------|
| Employee | `/employee/dashboard` |
| Department Head | `/department/dashboard` |
| College Dean | `/college-dean/dashboard` |
| President | `/president/dashboard` |
| Transport Office | `/transport-admin/dashboard` |
| Deployment Office | `/deployment-office/dashboard` |
| Driver | `/driver/dashboard` |
| System Admin | `/system-admin/dashboard` |

---

## Mobile App — `fleet_mobile`

One app, two interfaces — role is detected automatically on login:

- **Driver** — GPS tracking, trip management, maintenance reports, QR display
- **Gate** — QR scanner, scan history, departure/return gate log

---

## Trip Workflow

```
DRAFT → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_PRESIDENT
      → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → READY
      → IN_PROGRESS → PENDING_RETURN → COMPLETED
```

---

## Setup

### Backend
```bash
cd Backend
npm install
cp .env.example .env        # configure DB credentials
npm run migration:run
npm run seed
npm run start:dev
# Swagger: http://localhost:3000/api/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:3001
```

### Mobile
```bash
cd Mobile/fleet_mobile
flutter pub get
flutter run                  # or: flutter build apk --release
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@haramaya.edu.et | Password@123 |
| Transport Office | transport@haramaya.edu.et | Password@123 |
| Driver | driver@haramaya.edu.et | Password@123 |
| Employee | emp.computer-science@haramaya.edu.et | Password@123 |

---

## Documentation

| File | Description |
|------|-------------|
| `docs/DEFENSE.md` | Project defense guide — 45 examiner Q&A |
| `docs/DATABASE_NORMALIZATION_ANALYSIS.md` | 3NF normalization analysis |
| `docs/QUICK_REFERENCE.md` | Quick command reference |
| `Backend/DEPLOY.md` | Production deployment guide |
| `Backend/REDEPLOY.md` | Re-deployment / update guide |
| `Backend/postman/` | Postman collection + environments |

---

**Haramaya University — Department of Information Technology**  
Final Year Project — Full-Stack Web and Mobile Application
