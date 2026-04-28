# Fleet Management System - Haramaya University

A production-grade full-stack Fleet Management System. Digitizes vehicle fleet operations including trip requests, multi-level approvals, real-time GPS tracking, driver management, fuel tracking, and maintenance.

---

## Repository Structure

- **Backend/** - NestJS REST API + WebSocket server (20 modules, PostgreSQL, TypeORM)
- **frontend/** - Unified Next.js web app (single app, all 8 roles, role-based routing)
- **Mobile/fleet_driver/** - Flutter Driver app (GPS tracking + QR codes)
- **Mobile/fleet_gate/** - Flutter Gate Scanner (QR departure/return scanning)
- **docs/** - Defense guide, normalization analysis, diagrams, SQL scripts

---

## Frontend - Unified App (Single Port)

All roles in one Next.js app. After login, users are routed to their role dashboard:

- employee/ - Trip requests and tracking
- transport-admin/ - Fleet operations
- system-admin/ - User and system management
- college-dean/ - College-level approvals
- department/ - Department-level approvals
- deployment-office/ - Vehicle allocation
- president/ - Final approvals
- driver/ - Driver trip management

---

## Tech Stack

- Backend: NestJS 11, TypeScript, PostgreSQL 15, TypeORM, Socket.IO, JWT
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Mobile: Flutter (Dart)
- Deployment: PM2, Cloudflare Tunnel, Docker

---

## Trip States

DRAFT > PENDING_DEPARTMENT > PENDING_COLLEGE > PENDING_PRESIDENT > APPROVED_FOR_ALLOCATION > CAR_ALLOCATED > PENDING_TRANSPORT_CONFIRM > READY > IN_PROGRESS > PENDING_RETURN > COMPLETED

---

## Setup

### Backend
cd Backend && npm install && cp .env.example .env
npm run migration:run && npm run seed && npm run start:dev
Swagger: http://localhost:3000/api/docs

### Frontend
cd frontend && npm install && npm run dev
Runs on http://localhost:3000

### Mobile
cd Mobile/fleet_driver && flutter pub get && flutter run
cd Mobile/fleet_gate && flutter pub get && flutter run

---

## Default Credentials

admin@haramaya.edu.et / Password@123 (System Admin)
transport@haramaya.edu.et / Password@123 (Transport Office)
john@driver.com / Password@123 (Driver)
gate@haramaya.edu.et / Password@123 (Gate)
employee@haramaya.edu.et / Password@123 (Employee)

---

## Documentation

- docs/DEFENSE.md - Project defense guide with 45 examiner Q&A
- docs/DATABASE_NORMALIZATION_ANALYSIS.md - 3NF normalization analysis
- docs/QUICK_REFERENCE.md - Quick command reference
- Backend/SAD.md - System Architecture Document
- Backend/DEPLOY.md - Production deployment guide

---

Haramaya University - Department of Information Technology
Final Year Project - Full-Stack Web and Mobile Application
