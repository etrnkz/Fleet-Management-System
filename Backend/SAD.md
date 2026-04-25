# System Architecture Document — Fleet Management System

## 1. Overview

A multi-role university fleet management system built with NestJS + PostgreSQL. Handles trip requests, multi-level approvals, vehicle/driver allocation, real-time GPS tracking, maintenance, and fuel management.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | NestJS 11 |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO (WebSocket) |
| Queue | Bull (Redis-backed) |
| Email | Nodemailer (SMTP) |
| SMS | Brevo Transactional SMS |
| Process Manager | PM2 |

---

## 3. Entity Relationship Diagram

```
colleges ──< departments ──< users >── colleges
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                 drivers    trip_requests  audit_logs
                    │           │
                 vehicles   approvals
                    │           │
               fuel_records  trip_feedback
                    │
               gps_locations
                    │
           maintenance_requests
                    │
             notifications
```

### Key Relationships

| Entity | Relationship | Entity |
|---|---|---|
| User | 1:1 | Driver (profile) |
| Driver | M:1 | Vehicle (pre-assigned) |
| Vehicle | M:1 | Driver (assigned driver) |
| TripRequest | M:1 | User (requester) |
| TripRequest | M:1 | Vehicle (allocated) |
| TripRequest | M:1 | Driver (allocated) |
| TripRequest | 1:M | Approval |
| TripRequest | 1:1 | TripFeedback |
| TripRequest | 1:M | GpsLocation |
| Vehicle | 1:M | MaintenanceRequest |
| Vehicle | 1:M | FuelRecord |
| User | 1:M | Notification |
| User | 1:M | AuditLog |

---

## 4. Database Schema (Normalized to 3NF)

### `users`
- PK: `id` (uuid)
- `email` UNIQUE, `name`, `role` (enum), `phoneNumber`, `profileImage`
- FK: `departmentId` → departments, `collegeId` → colleges
- Indexes: `email` (unique), `role`, `isActive`

### `colleges`
- PK: `id`, `name`, `code` UNIQUE
- FK: `headId` → users

### `departments`
- PK: `id`, `name`, `code` UNIQUE
- FK: `collegeId` → colleges, `headId` → users

### `vehicles`
- PK: `id`, `plateNumber` UNIQUE, `vehicleId` UNIQUE
- `make`, `model`, `year`, `capacity`, `fuelType`, `fuelCapacity`, `fuelEfficiency`
- `status` (Active/Maintenance/Inactive), `currentMileage`
- `vipGeoRestrictionEnabled`, `restrictedZones` (jsonb)
- FK: `assignedDriverId` → drivers
- Indexes: `status`, `plateNumber`

### `drivers`
- PK: `id`
- `licenseNumber` UNIQUE, `licenseExpiry`, `experienceYears`, `status`, `rating`
- `totalTrips`, `totalDistance`
- FK: `userId` → users (1:1), `assignedVehicleId` → vehicles
- Indexes: `status`, `assignedVehicleId` (partial unique where NOT NULL)

### `trip_requests`
- PK: `id`, `requestNumber` UNIQUE
- `tripType`, `tripCategory`, `purpose`, `destination`
- `startDateTime`, `endDateTime`, `passengerCount`
- `state` (14 states), `currentApprovalLevel`
- `estimatedFuelCost`, `actualFuelCost`, `estimatedDistance`, `actualDistance`
- `completedAt`, `rejectedAt`, `rejectionReason`
- FK: `requesterId`, `allocatedVehicleId`, `allocatedDriverId`, `deploymentTeamMemberId`, `transportOfficerId`, `rejectedById`
- Indexes: `state`, `createdAt`, `requesterId`

### `approvals`
- PK: `id`
- `approvalLevel` (enum), `status` (enum), `comments`, `dueDate`, `approvedAt`
- FK: `tripRequestId` → trip_requests (CASCADE), `approverId` → users

### `trip_feedback`
- PK: `id`
- `overallRating`, `driverRating`, `vehicleRating`, `punctualityRating`
- `comments`, `suggestions`, `wouldRecommend`, `issues` (json)
- FK: `tripRequestId` → trip_requests (1:1), `submittedById` → users

### `gps_locations`
- PK: `id`
- `tripId` (uuid), `latitude`, `longitude`, `speed`, `heading`, `altitude`, `accuracy`
- `isOffline`, `metadata` (text/json), `timestamp`
- FK: `tripId` → trip_requests (CASCADE)
- Indexes: `(tripId, timestamp)` composite

### `maintenance_requests`
- PK: `id`, `requestNumber` UNIQUE
- `issueDescription`, `priority`, `status`
- `inspectionNotes`, `estimatedCost`, `actualCost`, `completionNotes`, `rejectionReason`
- `inspectedAt`, `approvedAt`, `completedAt`
- FK: `vehicleId` → vehicles, `submittedById`, `inspectedById`, `approvedById` → users

### `fuel_records`
- PK: `id`
- `vehicleId` (uuid FK), `tripId` (uuid FK nullable), `recordedById` (uuid FK)
- `type` (Refuel/TripConsumption/Adjustment)
- `quantity`, `pricePerLiter`, `totalCost`, `mileageAtRefuel`
- `station`, `receiptNumber`, `notes`
- Indexes: `(vehicleId, createdAt)`, `type`

### `notifications`
- PK: `id`
- `type` (enum), `title`, `message`, `data` (jsonb)
- `isRead`, `readAt`, `sentAt`
- FK: `recipientId` → users (CASCADE)
- Indexes: `(isRead, sentAt)`

### `audit_logs`
- PK: `id`
- `action` (enum), `entityType` (enum), `entityId`
- `oldValues` (jsonb), `newValues` (jsonb)
- `ipAddress`, `userAgent`, `description`
- FK: `userId` → users (nullable)
- Indexes: `(entityType, entityId)`, `(userId, createdAt)`, `(action, createdAt)`

### `workflow_configurations`
- PK: `id`, `name`, `tripType`, `isActive`, `steps` (jsonb)

---

## 5. Trip State Machine

```
DRAFT
  └─ submit() ──────────────────────────────────────────────────────────┐
                                                                         │
  ┌── PENDING_DEPARTMENT ──approve()──> PENDING_COLLEGE                 │
  │   PENDING_COLLEGE    ──approve()──> PENDING_PRESIDENT               │
  │   PENDING_PRESIDENT  ──approve()──> APPROVED_FOR_ALLOCATION         │
  │                                                                      │
  │   (VIP/SERVICE skip dept/college, go straight to PENDING_PRESIDENT) │
  │   (President/Dean skip all, go straight to APPROVED_FOR_ALLOCATION) │
  │                                                                      │
  └── APPROVED_FOR_ALLOCATION ──allocate()──> CAR_ALLOCATED             │
      CAR_ALLOCATED ──confirm-transport()──> READY                      │
      READY ──gate-scan()──> IN_PROGRESS                                │
      IN_PROGRESS ──employee-complete()──> PENDING_RETURN               │
      PENDING_RETURN ──gate-scan-return()──> COMPLETED ✓                │
                                                                         │
  Any state ──reject()──> REJECTED                                      │
  Any state ──cancel()──> CANCELLED                                     │
  Timeout ──────────────> AUTO_REJECTED_TIMEOUT                         │
```

---

## 6. Role-Based Access Control

| Role | Permissions |
|---|---|
| User | Submit trips, view own trips, complete trips, submit feedback |
| DepartmentHead | Approve/reject department-level trips |
| Dean / CollegeHead | Approve/reject college-level trips |
| President | Final approval, view all trips |
| DeploymentTeam | Allocate vehicles and drivers to approved trips |
| TransportOffice | Confirm transport, manage fuel, maintenance oversight |
| MaintenanceTeam | Inspect and complete maintenance requests |
| Driver | View assigned trips, start/complete trips, report maintenance |
| Gate | Scan QR to start trips and confirm vehicle return |
| SystemAdmin | Full user management, system configuration |
| Developer | Full access |

---

## 7. API Structure

```
/api/v1/
├── auth/          login, logout, refresh, forgot-password, reset-password
├── users/         CRUD, profile, bulk-invite, driver-profile
├── colleges/      CRUD
├── departments/   CRUD
├── vehicles/      CRUD, assign-driver, geofence, statistics
├── drivers/       CRUD, assign-vehicle, statistics
├── trips/         Full lifecycle (create→submit→approve→allocate→start→complete)
│   └── gate/      QR scan start + return
├── maintenance/   Full lifecycle (submit→inspect→approve→start→complete)
├── fuel/          CRUD, statistics, efficiency
├── tracking/      GPS location, route, live map
├── notifications/ List, mark-read
├── audit/         Logs, statistics
└── system-admin/  User management, statistics, bulk operations
```

---

## 8. Real-time Architecture

WebSocket namespace: `/tracking`

| Event | Direction | Description |
|---|---|---|
| `join-trip` | Client→Server | Subscribe to specific trip updates |
| `join-live` | Client→Server | Subscribe to all active vehicle locations |
| `update-location` | Client→Server | Driver sends GPS position |
| `location-update` | Server→Client | New GPS point for a trip |
| `vehicle-location` | Server→Client | Live map update (all vehicles) |
| `live-snapshot` | Server→Client | Initial state on join-live |
| `notification` | Server→Client | Real-time notification push |

---

## 9. Security

- JWT access tokens (7h default, 45d with "keep me signed in")
- JWT refresh tokens with rotation
- Token blacklist on logout
- `whitelist: true` on ValidationPipe (rejects unknown fields)
- `ClassSerializerInterceptor` globally (strips `@Exclude()` fields like password)
- Role-based guards on all protected endpoints
- Rate limiting via `@nestjs/throttler`
- CORS configured per environment

---

## 10. Normalization Notes

### 3NF Compliance
- All entities are in 3NF — no transitive dependencies
- `FuelRecord.totalCost` is computed (`quantity × pricePerLiter`) but stored for query performance (acceptable denormalization)
- `Driver.totalTrips` and `Driver.totalDistance` are aggregates stored for performance (acceptable)
- `Vehicle.restrictedZones` stored as `jsonb` — acceptable for variable-length structured data

### Known Design Decisions
- `Driver ↔ Vehicle` bidirectional FK — both `driver.assignedVehicleId` and `vehicle.assignedDriverId` exist. This is intentional for query performance (avoid joins in both directions). Enforced as consistent by the service layer.
- `GpsLocation.tripId` stored as both raw column and FK — allows efficient queries without join overhead on high-volume GPS data.
- `Notification.data` as `jsonb` — flexible payload for different notification types without schema migration.
