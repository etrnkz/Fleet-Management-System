# Fleet Management System — Haramaya University

A production-grade, full-stack Fleet Management System for Haramaya University. Digitizes vehicle fleet operations including trip requests, multi-level approvals, real-time GPS tracking, driver management, fuel tracking, and maintenance — replacing a fully manual paper-based process.

---

## 📦 Repository Structure

```
Fleet-Management-System/
├── Backend/                          # NestJS REST API + WebSocket server
│   ├── src/                          # Source code (modules, controllers, services)
│   ├── scripts/                      # DB setup, migration, deployment scripts
│   ├── postman/                      # Postman collection for API testing
│   ├── Dockerfile
│   ├── ecosystem.config.cjs          # PM2 configuration
│   ├── DEPLOY.md                     # Deployment guide
│   └── SAD.md                        # System Architecture Document
│
├── frontend/
│   └── apps/
│       ├── employee/                 # Employee app (port 3008) — trip requests
│       ├── transport-admin/          # Transport Office (port 3001) — fleet ops
│       ├── system-admin/             # System Admin (port 3007) — user management
│       ├── college-dean/             # College Dean (port 3002) — approvals
│       ├── department/               # Department Head (port 3003) — approvals
│       ├── deployment-office/        # Deployment Office (port 3005) — allocation
│       ├── president/                # President (port 3009) — final approvals
│       ├── driver/                   # Driver web (port 3004) — trip management
│       └── admin/                    # Combined Admin (port 3010) — full overview
│
├── Mobile/
│   ├── fleet_driver/                 # Flutter Driver app — GPS + QR codes
│   ├── fleet_gate/                   # Flutter Gate Scanner — QR departure/return
│   └── gps-sender/                   # Android native GPS sender utility
│
├── docs/
│   ├── DEFENSE.md                    # Project defense guide (45 Q&A)
│   ├── DATABASE_NORMALIZATION_ANALYSIS.md
│   ├── DATABASE_NORMALIZATION_SUMMARY.md
│   ├── FUEL_PRICE_DOCUMENTATION.md
│   ├── QUICK_REFERENCE.md
│   ├── RUN_NORMALIZATION_MIGRATIONS.md
│   ├── database-schema.md
│   ├── geofence-feature.md
│   ├── gps-location-feature.md
│   ├── use-case-diagram.md
│   ├── vip-security-features.md
│   ├── activity-diagrams/            # Per-role activity diagrams
│   ├── database/                     # SQL normalization migration scripts
│   └── tools/
│       └── live-tracking-map.html    # Standalone live GPS tracking map
│
├── scripts/                          # Cross-app deployment & dev scripts
│   ├── dev-all-webs.mjs              # Start all frontend apps at once
│   ├── deploy-all.ps1                # Deploy all apps
│   └── vercel-deploy-all.mjs         # Vercel deployment
│
├── .gitignore
├── README.md
└── render.yaml                       # Render.com deployment config
```

---

## 🚀 Features

- **Multi-level Approval Workflow** — Department → College → President (configurable per college)
- **Real-time GPS Tracking** — WebSocket broadcasting, live map, 5-second updates
- **Two-step Trip Completion** — Employee marks done → Gate scans vehicle return
- **QR Code Verification** — Driver app generates QR; gate scanner verifies departure & return
- **Geofence Violation Detection** — VIP vehicles trigger alerts when entering restricted zones
- **Role-Based Access Control** — 12 distinct roles with granular permissions
- **Fuel Cost Estimation** — Real-time calculation from GPS distance during trips
- **Maintenance Management** — Full workflow from request to completion
- **Audit Trail** — Immutable log of every action with user, timestamp, and IP
- **Email Notifications** — Triggered at every workflow state transition
- **Rate Limiting** — 10 requests/60s per IP to prevent abuse
- **Offline GPS Buffering** — Driver app stores locations when offline, bulk-uploads on reconnect

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | NestJS 11 (Node.js + TypeScript) |
| Database | PostgreSQL 15 |
| ORM | TypeORM 0.3 |
| Real-time | Socket.IO 4 (WebSocket) |
| Authentication | JWT (access + refresh tokens) + bcrypt |
| Frontend | Next.js 14 (React + TypeScript + Tailwind CSS) |
| Mobile | Flutter (Dart) |
| Process Manager | PM2 |
| Tunnel / HTTPS | Cloudflare Tunnel |
| API Docs | Swagger / OpenAPI |

---

## 👥 User Roles

| Role | Description | Port |
|------|-------------|------|
| User / Employee | Requests trips, tracks status | 3008 |
| DepartmentHead | Approves at department level | 3003 |
| CollegeHead | Approves at college level | 3002 |
| Dean | Dean-level approval | 3002 |
| President | Final approval authority | 3009 |
| DeploymentTeam | Assigns vehicles and drivers | 3005 |
| TransportOffice | Manages fleet operations | 3001 |
| MaintenanceTeam | Handles vehicle maintenance | 3001 |
| Driver | Drives vehicles, sends GPS | Mobile App |
| Gate | Scans QR codes at gate | Mobile App |
| SystemAdmin | Full system access | 3007 |
| Developer | Developer access | 3007 |

---

## 🔄 Trip State Machine

```
DRAFT → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_PRESIDENT
      → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → PENDING_TRANSPORT_CONFIRM
      → READY
      → (Gate departure scan) → IN_PROGRESS
      → (Employee marks done) → PENDING_RETURN
      → (Gate return scan)    → COMPLETED

Side exits: REJECTED | AUTO_REJECTED_TIMEOUT | CANCELLED
```

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your database credentials and JWT secrets
```

### Database

```bash
# Create database
psql -U postgres -f scripts/create-database.sql

# Run migrations
npm run migration:run

# Seed initial data (users, colleges, departments, vehicles, drivers)
npm run seed
```

### Running

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# With PM2
pm2 start ecosystem.config.cjs
```

### API Documentation

With the backend running, open Swagger at:
```
http://localhost:3000/api/docs
```

---

## 🌐 Frontend Setup

Each app is independent. Navigate to the app folder and run:

```bash
cd frontend/apps/employee   # or any other app
npm install
npm run dev
```

### All Apps

| App | Command | URL |
|-----|---------|-----|
| Employee | `npm run dev` in `apps/employee` | http://localhost:3008 |
| Transport Admin | `npm run dev` in `apps/transport-admin` | http://localhost:3001 |
| System Admin | `npm run dev` in `apps/system-admin` | http://localhost:3007 |
| College Dean | `npm run dev` in `apps/college-dean` | http://localhost:3002 |
| Department | `npm run dev` in `apps/department` | http://localhost:3003 |
| Deployment Office | `npm run dev` in `apps/deployment-office` | http://localhost:3005 |
| President | `npm run dev` in `apps/president` | http://localhost:3009 |
| Driver | `npm run dev` in `apps/driver` | http://localhost:3004 |
| Admin (combined) | `npm run dev` in `apps/admin` | http://localhost:3010 |

---

## 📱 Mobile Apps Setup

### Prerequisites
- Flutter SDK 3.x
- Android Studio / Xcode
- Android device or emulator

### Driver App

```bash
cd Mobile/fleet_driver
flutter pub get
flutter run                          # debug
flutter build apk --release          # production APK
```

### Gate Scanner App

```bash
cd Mobile/fleet_gate
flutter pub get
flutter run
flutter build apk --release
```

### GPS Sender (Android Native Utility)

```bash
cd Mobile/gps-sender
# Open in Android Studio and build
# Used for testing GPS tracking independently of the driver app
```

---

## 🔑 Default Credentials (Development / Seeded)

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@haramaya.edu.et | Password@123 |
| Transport Office | transport@haramaya.edu.et | Password@123 |
| Driver | john@driver.com | Password@123 |
| Gate | gate@haramaya.edu.et | Password@123 |
| Employee | employee@haramaya.edu.et | Password@123 |
| Department Head | dept.head@haramaya.edu.et | Password@123 |
| President | president@haramaya.edu.et | Password@123 |

> ⚠️ Change all passwords before production deployment.

---

## 📡 GPS Tracking

The Driver app sends GPS location every **5 seconds** via REST API:

```
POST /api/v1/tracking/:tripId/location
{ latitude, longitude, speed, heading, altitude, accuracy }
```

The backend saves the location and broadcasts it via WebSocket to all subscribed viewers. Open `live-tracking-map.html` in a browser to see the live map.

**WebSocket endpoint**: `ws://localhost:3000/tracking`

---

## 🔐 Security

- JWT access tokens (short-lived) + refresh tokens (long-lived)
- bcrypt password hashing (10 salt rounds)
- Role-based access control on every endpoint
- Rate limiting: 10 requests / 60 seconds per IP
- CORS whitelist
- Input validation with class-validator
- SQL injection prevention via TypeORM parameterized queries
- Token blacklist on logout
- Audit logging for all state-changing operations

---

## 🗄️ Database

14 tables: `users`, `colleges`, `departments`, `drivers`, `vehicles`, `trip_requests`, `approvals`, `trip_feedback`, `gps_locations`, `fuel_records`, `maintenance_requests`, `notifications`, `audit_logs`, `workflow_configurations`

Schema is normalized to **Third Normal Form (3NF)**. See `DATABASE_NORMALIZATION_ANALYSIS.md` for full analysis.

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `docs/DEFENSE.md` | Full project defense guide with 45 examiner Q&A |
| `docs/DATABASE_NORMALIZATION_ANALYSIS.md` | Complete 3NF normalization analysis |
| `docs/DATABASE_NORMALIZATION_SUMMARY.md` | Normalization summary with migration guide |
| `docs/FUEL_PRICE_DOCUMENTATION.md` | Fuel price system documentation |
| `docs/QUICK_REFERENCE.md` | Quick command reference |
| `docs/database/` | SQL normalization migration scripts |
| `docs/activity-diagrams/` | Per-role activity diagrams |
| `docs/tools/live-tracking-map.html` | Standalone live GPS tracking map |
| `Backend/SAD.md` | System Architecture Document |
| `Backend/DEPLOY.md` | Production deployment guide |
| `Backend/REDEPLOY.md` | Redeployment guide |

---

## 🚀 Production Deployment

```bash
# 1. Prepare environment (generates strong JWT secrets, sets NODE_ENV=production)
cd Backend
powershell -ExecutionPolicy Bypass -File scripts/prepare-production.ps1   # Windows
bash scripts/prepare-production.sh                                         # Linux

# 2. Build
npm run build

# 3. Run migrations
npm run migration:run

# 4. Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 📋 API Testing

A complete Postman collection is included:

```bash
# Install Newman
npm install -g newman

# Run collection
npm run test:api
```

Collection: `Backend/postman/collections/Fleet_Management_API.postman_collection.json`

---

## 🏛️ Project

**Institution**: Haramaya University, Ethiopia  
**Department**: Computer Science  
**Type**: Final Year Project — Full-Stack Web & Mobile Application  
**Defense Guide**: See `docs/DEFENSE.md` for complete technical documentation and 45 examiner Q&A pairs.
