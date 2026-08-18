# Fleet Management System — Haramaya University

Production-grade full-stack Fleet Management System. Digitizes vehicle fleet operations including trip requests, multi-level approvals, real-time GPS tracking, driver management, fuel tracking, and maintenance.

## Repository Structure

```
Fleet-Management-System/
├── Backend/          NestJS REST API + WebSocket server (PostgreSQL, TypeORM)
├── frontend/         Next.js web app — all roles, role-based routing
├── Mobile/
│   └── fleet_mobile/ Flutter app — Driver & Gate Scanner (unified)
└── docs/             Documentation, diagrams, analysis
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript, PostgreSQL 15, TypeORM, Socket.IO, JWT |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Mobile | Flutter 3 (Dart) — Android |
| Deployment | PM2, Docker |

## Getting Started

### Backend

```bash
cd Backend
cp .env.example .env    # configure database credentials
npm install
npm run migrate
npm run seed
npm run start:dev       # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:3010
```

### Mobile

```bash
cd Mobile/fleet_mobile
flutter pub get
flutter run
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@haramaya.edu.et | Password@123 |
| Transport Office | transport@haramaya.edu.et | Password@123 |
| Driver | driver@haramaya.edu.et | Password@123 |
| Employee | emp.computer-science@haramaya.edu.et | Password@123 |

> **Note**: Change all default passwords before deploying to production.

## API

The backend exposes a REST API at `http://localhost:3000/api/v1`. See [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) for endpoint documentation.

## License

Licensed under the Apache License 2.0 — see [LICENSE](LICENSE) for details.

Copyright 2025 Haramaya University Department of Information Technology
