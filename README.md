<p align="center">
  <img src="frontend/public/hulogo.png" alt="Fleet Management System" width="120">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-11-red?logo=nestjs&logoColor=white" alt="NestJS 11">
  <img src="https://img.shields.io/badge/next.js-14-black?logo=next.js&logoColor=white" alt="Next.js 14">
  <img src="https://img.shields.io/badge/flutter-3-02569B?logo=flutter&logoColor=white" alt="Flutter 3">
  <img src="https://img.shields.io/badge/postgresql-15-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 15">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache 2.0">
  <img src="https://img.shields.io/badge/status-active-success" alt="Active">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#api">API</a>
</p>

---

<p align="center">
  <strong>Production-grade fleet management for universities</strong>
  <br>
  Trip requests, multi-level approvals, real-time GPS tracking, fuel & maintenance — all in one system.
  <br>
  Clone, seed, and go.
</p>

---

## Quick Start

Clone the repo and run each layer.

```sh
git clone https://github.com/etrnkz/Fleet-Management-System.git
cd Fleet-Management-System
```

### Backend

```sh
cd Backend
cp .env.example .env    # configure database credentials
npm install
npm run migrate
npm run seed
npm run start:dev       # http://localhost:3000
```

### Frontend

```sh
cd frontend
npm install
npm run dev             # http://localhost:3010
```

### Mobile (Android)

```sh
cd Mobile/fleet_mobile
flutter pub get
flutter run
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | `admin@haramaya.edu.et` | `Password@123` |
| Transport Office | `transport@haramaya.edu.et` | `Password@123` |
| Driver | `driver@haramaya.edu.et` | `Password@123` |
| Employee | `emp.computer-science@haramaya.edu.et` | `Password@123` |

> Change all default passwords before deploying to production.

## Features

| Area | Description |
|------|-------------|
| Trip Requests | Submit, approve/reject, multi-level workflow |
| GPS Tracking | Real-time vehicle locations, geofencing, alerts |
| Fuel Tracking | Record consumption, per-vehicle analytics |
| Maintenance | Request repairs, track status, cost history |
| Driver Management | Assign vehicles, license tracking |
| Notifications | In-app + email + SMS alerts |
| Audit Log | Full action history with filters |
| Role-Based Access | 12 roles with granular permissions |
| Mobile App | Driver trip management + gate scanner |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript, PostgreSQL 15, TypeORM, Socket.IO, JWT |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Mobile | Flutter 3 (Dart) — Android |
| Deployment | PM2, Docker, GitHub Actions CI |

## API

The backend exposes a REST API at `http://localhost:3000/api/v1`. See [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) for endpoint documentation.

## Project Structure

```
Fleet-Management-System/
├── Backend/          NestJS REST API + WebSocket server
├── frontend/         Next.js web app — all roles
├── Mobile/
│   └── fleet_mobile/ Flutter app — Driver & Gate Scanner
└── docs/             Documentation, diagrams
```

## License

Licensed under the Apache License 2.0 — see [LICENSE](LICENSE) for details.

Copyright 2025 Haramaya University Department of Information Technology
