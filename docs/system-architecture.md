# Fleet Management System — System Architecture

---

## Architecture Overview

The system follows a **three-tier client-server architecture** with a clear separation between the presentation layer, application layer, and data layer. Real-time communication is handled through a WebSocket layer that runs alongside the REST API.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                        │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Employee   │  │  Transport   │  │    Driver    │  ... 9 portals │
│  │   Portal     │  │  Admin Portal│  │   Portal     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                        │
│         └─────────────────┴──────────────────┘                       │
│                           │                                           │
│              Next.js 14 (Single App, Role-Based Routing)             │
│              Middleware enforces role-to-path access                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HTTPS REST + WebSocket (WSS)
┌───────────────────────────▼─────────────────────────────────────────┐
│                     APPLICATION LAYER (VPS)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    NestJS REST API                              │  │
│  │                                                                 │  │
│  │  Auth  │  Trips  │  Vehicles  │  Drivers  │  Tracking          │  │
│  │  Users │  Workflow│  Fuel     │  Maintenance│  Notifications   │  │
│  │  Audit │  SystemAdmin         │  Email/SMS                     │  │
│  │                                                                 │  │
│  │  JWT Guards + RolesGuard on every endpoint                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                  Socket.io WebSocket Server                     │  │
│  │   /notifications namespace  │  /tracking namespace             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    Bull Job Queue                               │  │
│  │   Approval timeout jobs (48h delay, persisted in Redis)        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                    PM2 Process Manager                                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                       DATA LAYER (VPS)                               │
│                                                                       │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐    │
│  │      PostgreSQL 15        │   │          Redis 7              │    │
│  │                           │   │                               │    │
│  │  14 tables                │   │  Bull job queue               │    │
│  │  UUID primary keys        │   │  Token blacklist              │    │
│  │  TypeORM migrations       │   │  Push subscription cache      │    │
│  │  Indexed queries          │   │                               │    │
│  └──────────────────────────┘   └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

External Services:
  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐
  │  SMTP Server │   │  SMS Provider│   │  Web Push (VAPID)        │
  │  (Email)     │   │  (Brevo API) │   │  Browser notifications   │
  └──────────────┘   └──────────────┘   └──────────────────────────┘
```

---

## Deployment Architecture

```
Internet
    │
    ├──► Vercel CDN ──► Next.js Frontend (Static + SSR)
    │                   NEXT_PUBLIC_API_URL → Backend VPS
    │
    └──► VPS (Linux)
              │
              ├── PM2 ──► NestJS API (port 3000)
              │              │
              │              ├── PostgreSQL (port 5432)
              │              └── Redis (port 6379)
              │
              └── Nginx (optional reverse proxy / SSL termination)
```

---

## Module Architecture (Backend)

Each NestJS module is self-contained with its own controller, service, and entities:

```
Backend/src/
├── auth/           JWT strategy, guards, login/logout/refresh
├── users/          User CRUD, profile, password change
├── colleges/       College management
├── departments/    Department management
├── trips/          Trip lifecycle (13 states), approvals, feedback
│   ├── gate-scan.controller.ts   QR scan endpoint (Gate role)
│   └── utils/trip-qr.util.ts     QR payload parsing
├── vehicles/       Fleet inventory, geofence configuration
├── drivers/        Driver profiles, vehicle assignment
├── workflow/       Bull queue jobs, 48h timeout scheduling
├── notifications/  WebSocket gateway, email, SMS, web push
├── tracking/       GPS location storage, Haversine calc, geofence eval
├── fuel/           Fuel records, cost analysis, efficiency
├── maintenance/    Maintenance request lifecycle
├── audit/          Audit log for all system actions
├── system-admin/   User management, broadcast, statistics
├── email/          Nodemailer SMTP integration
└── sms/            Brevo SMS API integration
```

---

## Frontend Architecture (Next.js)

```
frontend/src/
├── app/
│   ├── (dashboard)/
│   │   ├── college-dean/     Dean / CollegeHead portal
│   │   ├── department/       DepartmentHead portal
│   │   ├── deployment-office/ DeploymentTeam portal
│   │   ├── driver/           Driver portal
│   │   ├── employee/         Employee (User) portal
│   │   ├── president/        President portal
│   │   ├── system-admin/     SystemAdmin portal
│   │   └── transport-admin/  TransportOffice portal
│   ├── login/                Public login page
│   ├── signup/               Public registration page
│   ├── forgot-password/      Public password reset request
│   └── reset-password/       Public password reset form
├── components/
│   ├── PhoneInput.tsx        Country-code phone validation
│   ├── PasswordInput.tsx     Password show/hide toggle
│   ├── EmailInput.tsx        Email input with icon
│   ├── TripRequestForm.tsx   Trip submission form (Employee)
│   ├── EmployeeShell.tsx     Layout wrapper for employee portal
│   ├── Map.tsx               Leaflet map for live tracking
│   ├── Toast.tsx             Toast notification component
│   ├── ConfirmModal.tsx      Confirmation dialog
│   ├── ThemeProvider.tsx     Dark/light theme context
│   └── PushNotificationPrompt.tsx  Browser push permission
├── hooks/
│   ├── useDriverGpsTracking.ts  GPS tracking with offline queue
│   └── useNotifications.ts      WebSocket notification hook
├── lib/
│   ├── api.ts               Unified API client (all roles)
│   ├── logout.ts            Clear session and redirect
│   ├── fuelPrices.ts        Fuel price config (localStorage)
│   └── pushNotifications.ts VAPID web push subscription
├── middleware.ts             Role-based route protection
└── public/
    └── sw.js                Service worker for web push
```

---

## Data Flow — Trip Request

```
Employee (Browser)
    │  POST /trips  →  POST /trips/:id/submit
    ▼
NestJS TripsService
    │  Validates 48h rule, determines approval routing
    │  Saves to PostgreSQL
    │  Schedules Bull timeout job in Redis
    │  Sends notification via NotificationsService
    ▼
NotificationsService
    │  Saves Notification to PostgreSQL
    │  Emits via Socket.io to approver's browser
    │  Sends email via Nodemailer
    │  Sends SMS via Brevo API
    ▼
Approver (Browser)
    │  Receives real-time notification
    │  POST /trips/:id/approve
    ▼
NestJS TripsService
    │  Advances state, creates next Approval record
    │  Reschedules timeout job
    │  Notifies next approver
    ▼
... (chain continues until APPROVED_FOR_ALLOCATION)
```

---

## Data Flow — GPS Tracking

```
Driver App (Browser)
    │  navigator.geolocation.watchPosition() every ≥4s
    │  POST /tracking/:tripId/location
    ▼
NestJS TrackingService
    │  Saves GpsLocation to PostgreSQL
    │  Calculates distance (Haversine formula)
    │  Evaluates geofence zones
    │  Calculates live fuel cost
    │  Calls enrichLocationForBroadcast()
    ▼
NotificationsGateway (Socket.io /tracking namespace)
    │  Broadcasts enriched payload to all Transport Office clients
    ▼
Transport Office (Browser)
    │  Receives vehicle-location event
    │  Updates vehicle icon on Leaflet map
    │  Updates fuel stats in real time
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS (TLS) for all client-server communication |
| Authentication | JWT access token (7h) + refresh token (7d) |
| Authorization | RolesGuard on every API endpoint |
| Route protection | Next.js middleware enforces role-to-path mapping |
| Password storage | bcrypt with 10 salt rounds |
| Token revocation | In-memory blacklist on logout |
| Input validation | class-validator DTOs (backend) + client-side validation |
| CORS | Whitelist of allowed origins |
| Session expiry | Auto-logout when refresh token expires |
