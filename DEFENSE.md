# Fleet Management System - Haramaya University
## Project Defense Guide

---

## Table of Contents

1. [Project Title & Abstract](#1-project-title--abstract)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Real-time Features](#6-real-time-features)
7. [Security Implementation](#7-security-implementation)
8. [Mobile Applications](#8-mobile-applications)
9. [Workflow & Business Logic](#9-workflow--business-logic)
10. [Testing & Deployment](#10-testing--deployment)
11. [Q&A - Examiner Questions & Answers](#11-qa---examiner-questions--answers)

---

## 1. Project Title & Abstract

### Title
**Fleet Management System for Haramaya University**

### Abstract

Haramaya University, like many large institutions in Ethiopia, manages a significant fleet of vehicles used for administrative trips, field research, student transport, and official university business. Prior to this system, the entire process  from requesting a vehicle to approving the trip, assigning a driver, tracking the journey, and recording fuel consumption  was handled manually using paper forms, phone calls, and spreadsheets. This approach was slow, error-prone, non-transparent, and difficult to audit.

The **Fleet Management System** is a full-stack digital platform designed to automate and streamline every aspect of the university's vehicle fleet operations. It replaces paper-based workflows with a structured, role-aware digital system that enforces multi-level approval chains, provides real-time GPS tracking of vehicles, manages driver assignments, tracks fuel consumption and maintenance, and generates a complete audit trail of all actions.

The system consists of three major components:
- A **NestJS REST API backend** serving as the central business logic and data layer
- A **Next.js web frontend** for administrative staff, approvers, and managers
- **Two Flutter mobile applications**: one for drivers (GPS tracking, trip management) and one for gate security personnel (QR code scanning for departure and return verification)

Key innovations include a configurable multi-level approval workflow that adapts to the university's organizational hierarchy, real-time WebSocket-based GPS tracking with geofence violation detection for VIP vehicles, a two-step trip completion mechanism using QR codes, and comprehensive audit logging for accountability and transparency.

The system was built to serve Haramaya University specifically, but its architecture is general enough to be adapted for any institution managing a vehicle fleet.

---

## 2. System Architecture

### Overview

The system follows a classic **3-tier architecture**:

```

                        CLIENT TIER                          
        
    Next.js Web        Driver App      Gate Scanner   
    (TypeScript)       (Flutter)       App (Flutter)  
        

              HTTP/REST         HTTP/REST          HTTP/REST
              WebSocket                          

                 APPLICATION TIER                          
      
                NestJS API Server (Node.js)                
              
       REST    WebSocket     Auth / Guards          
     Controllers  Gateway      JWT / RBAC             
              
           
             Services / Business Logic                   
           
           
             TypeORM (Data Access Layer)                 
           
      

            

                       DATA TIER                               
      
                PostgreSQL Database                          
                (14 tables, relational)                      
      

```

### Component Breakdown

**Client Tier**
- **Next.js Web App**: Used by administrators, approvers (Department Heads, College Heads, President), Transport Office, Maintenance Team, and Deployment Team. Provides dashboards, trip management, fleet overview, and live tracking maps.
- **Driver Flutter App**: Used by drivers to view assigned trips, send GPS location every 5 seconds, generate QR codes for trip verification, and receive notifications.
- **Gate Scanner Flutter App**: Used by gate security to scan QR codes when vehicles depart and return, enforcing physical verification of trip start and end.

**Application Tier**
- **NestJS API Server**: The core of the system. Handles all business logic, authentication, authorization, data validation, and real-time communication. Exposes 50+ REST endpoints under `/api/v1/` and a WebSocket namespace `/tracking`.
- **PM2 Process Manager**: Keeps the Node.js server running in production, handles restarts on crash, and manages logs.
- **Cloudflare Tunnel**: Provides secure HTTPS access to the server without exposing ports directly to the internet.

**Data Tier**
- **PostgreSQL**: Relational database with 14 tables storing all system data. Chosen for ACID compliance, complex query support, and reliability.

### Request Flow Example (Trip Request)

```
User (Web)  POST /api/v1/trip-requests
            JwtAuthGuard validates token
            RolesGuard checks role
            TripRequestsController
            TripRequestsService (business logic)
            TypeORM  PostgreSQL (INSERT)
            AuditService logs action
            NotificationService sends email
            Response returned to client
```

### GPS Tracking Flow

```
Driver App  POST /api/v1/tracking/:tripId/location (every 5s)
            Backend saves to gps_locations table
            Backend emits via Socket.IO to /tracking namespace
            Web clients subscribed to trip receive live update
            Map updates in real-time
```

---

## 3. Technology Stack

### Backend: NestJS (Node.js + TypeScript)

**What it is**: NestJS is a progressive Node.js framework built with TypeScript that uses decorators and dependency injection, inspired by Angular's architecture.

**Why NestJS over plain Express?**
- NestJS provides a structured, opinionated architecture (modules, controllers, services, guards, interceptors) that enforces separation of concerns. Express is minimal and unopinionated, which leads to inconsistent code structure in large teams.
- Built-in dependency injection container makes testing and swapping implementations easy.
- Decorators (`@Controller`, `@Get`, `@UseGuards`, `@Roles`) make the code self-documenting.
- First-class TypeScript support with full type safety.
- Built-in support for WebSockets, validation pipes, interceptors, and exception filters.
- Swagger/OpenAPI integration is trivial with `@nestjs/swagger`.

**Why Node.js?**
- Non-blocking I/O is ideal for a system with many concurrent connections (GPS updates every 5 seconds from multiple drivers, WebSocket connections from multiple viewers).
- Large ecosystem (npm) with mature libraries for JWT, bcrypt, TypeORM, Socket.IO.
- JavaScript/TypeScript is shared with the frontend, reducing context switching.

### Database: PostgreSQL

**Why PostgreSQL over MongoDB?**
- The fleet management domain has highly relational data: users belong to departments, departments belong to colleges, trips have approvals, approvals reference users and trips, GPS locations reference trips. Relational data fits naturally in a relational database.
- PostgreSQL provides ACID transactions, ensuring that multi-step operations (e.g., approving a trip and updating its status) are atomic.
- Complex queries with JOINs across multiple tables are efficient and natural in SQL.
- MongoDB's document model would require embedding or manual reference management for this level of relational complexity.
- PostgreSQL supports JSON columns for flexible data when needed, giving the best of both worlds.

### ORM: TypeORM

**Why TypeORM?**
- TypeORM integrates natively with NestJS and TypeScript, allowing entity definitions as TypeScript classes with decorators.
- Provides a migration system for safe schema evolution in production.
- Repository pattern abstracts database queries, making services testable.
- Supports complex relations (OneToMany, ManyToOne, ManyToMany) with lazy/eager loading.
- Parameterized queries by default prevent SQL injection.

### Frontend: Next.js (React + TypeScript)

**Why Next.js?**
- Server-side rendering (SSR) and static generation improve initial load performance.
- File-based routing simplifies navigation structure.
- Built-in API routes allow lightweight backend-for-frontend patterns.
- React's component model enables reusable UI components (trip cards, approval buttons, tracking maps).
- TypeScript integration provides type safety across the full stack.

### Styling: Tailwind CSS

**Why Tailwind?**
- Utility-first CSS eliminates the need to write custom CSS files for most components.
- Consistent design system with spacing, colors, and typography scales.
- Purges unused styles in production for minimal bundle size.

### Mobile: Flutter (Dart)

**Why Flutter?**
- Single codebase compiles to native Android and iOS apps.
- Dart's strong typing and Flutter's widget system enable rapid UI development.
- Excellent GPS/location plugins (`geolocator`) and QR code plugins (`mobile_scanner`, `qr_flutter`).
- Hot reload speeds up development iteration.
- Two separate apps (Driver + Gate) keep each app focused and simple for its specific user role.

### Real-time: Socket.IO (WebSocket)

**Why Socket.IO over raw WebSocket?**
- Socket.IO provides automatic reconnection, room/namespace support, and fallback to HTTP long-polling if WebSocket is unavailable.
- Namespaces (`/tracking`) allow logical separation of real-time channels.
- Broadcasting to specific rooms (per trip) is built-in.

### Authentication: JWT (JSON Web Tokens)

**Why JWT?**
- Stateless authentication: the server does not need to store session data. The token itself contains the user's identity and roles.
- Scalable: any server instance can validate a token without shared session storage.
- Access token (short-lived) + refresh token (long-lived) pattern balances security and user experience.

### Deployment: PM2 + Cloudflare Tunnel

**Why PM2?**
- Process manager for Node.js that keeps the app running after crashes, restarts on file changes, and provides log management.
- Cluster mode can utilize multiple CPU cores.

**Why Cloudflare Tunnel?**
- Provides HTTPS without needing to configure SSL certificates manually on the VPS.
- Hides the server's IP address, adding a layer of DDoS protection.
- No need to open inbound firewall ports.

---

## 4. Database Design

### Entity-Relationship Overview

The database contains **14 tables** organized around the core domain entities: users, organizational structure, vehicles, drivers, trips, and supporting data.

### Table Descriptions

#### 1. `users`
Stores all user accounts in the system.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email address |
| password | VARCHAR | bcrypt hashed password |
| firstName | VARCHAR | First name |
| lastName | VARCHAR | Last name |
| role | ENUM | One of 12 roles |
| departmentId | UUID | FK  departments |
| isActive | BOOLEAN | Soft enable/disable |
| createdAt | TIMESTAMP | Record creation time |

**Note**: `college_id` was intentionally removed during 3NF normalization. A user's college is derived transitively through their department (user  department  college). Storing `college_id` directly on users would be a transitive dependency violation.

#### 2. `colleges`
University colleges/faculties (e.g., College of Agriculture, College of Engineering).
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | College name |
| code | VARCHAR | Short code |
| headId | UUID | FK  users (College Head) |

#### 3. `departments`
Departments within colleges.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Department name |
| collegeId | UUID | FK  colleges |
| headId | UUID | FK  users (Dept Head) |

#### 4. `drivers`
Driver profiles linked to user accounts.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK  users (1:1) |
| licenseNumber | VARCHAR | Driver's license |
| licenseExpiry | DATE | License expiry date |
| isAvailable | BOOLEAN | Availability status |

#### 5. `vehicles`
Fleet vehicles managed by the university.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plateNumber | VARCHAR | License plate |
| make | VARCHAR | Manufacturer |
| model | VARCHAR | Model name |
| year | INTEGER | Manufacturing year |
| capacity | INTEGER | Passenger capacity |
| fuelType | ENUM | PETROL / DIESEL |
| status | ENUM | AVAILABLE / IN_USE / MAINTENANCE |
| isVip | BOOLEAN | VIP vehicle flag (geofence applies) |
| currentDriverId | UUID | FK  drivers (nullable) |

**Note**: The circular dependency between `vehicles` and `drivers` (vehicle has a driver, driver is assigned to a vehicle) was resolved by introducing a `vehicle_driver_assignments` junction table to track assignment history, while `currentDriverId` on vehicles tracks the current assignment.

#### 6. `trip_requests`
Core table for all trip bookings.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| requesterId | UUID | FK  users |
| vehicleId | UUID | FK  vehicles (nullable until allocated) |
| driverId | UUID | FK  drivers (nullable until allocated) |
| purpose | TEXT | Trip purpose description |
| destination | VARCHAR | Trip destination |
| departureTime | TIMESTAMP | Planned departure |
| returnTime | TIMESTAMP | Planned return |
| status | ENUM | Current workflow state |
| passengerCount | INTEGER | Number of passengers |
| qrCode | TEXT | Generated QR code data |
| totalDistance | DECIMAL | GPS-calculated distance (km) |
| estimatedFuelCost | DECIMAL | Calculated fuel cost (Birr) |

#### 7. `approvals`
Records each approval/rejection action in the workflow.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tripRequestId | UUID | FK  trip_requests |
| approverId | UUID | FK  users |
| level | ENUM | DEPARTMENT / COLLEGE / PRESIDENT |
| status | ENUM | PENDING / APPROVED / REJECTED |
| comment | TEXT | Approver's comment |
| decidedAt | TIMESTAMP | When decision was made |

#### 8. `trip_feedback`
Post-trip ratings and feedback from requesters.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tripRequestId | UUID | FK  trip_requests (1:1) |
| rating | INTEGER | 1-5 star rating |
| comment | TEXT | Feedback text |
| submittedAt | TIMESTAMP | Submission time |

#### 9. `gps_locations`
Real-time GPS data points from driver app.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tripRequestId | UUID | FK  trip_requests |
| latitude | DECIMAL(10,8) | GPS latitude |
| longitude | DECIMAL(11,8) | GPS longitude |
| speed | DECIMAL | Speed in km/h |
| heading | DECIMAL | Direction in degrees |
| altitude | DECIMAL | Altitude in meters |
| accuracy | DECIMAL | GPS accuracy in meters |
| recordedAt | TIMESTAMP | When location was recorded |

#### 10. `fuel_records`
Fuel consumption records per trip or refueling event.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicleId | UUID | FK  vehicles |
| tripRequestId | UUID | FK  trip_requests (nullable) |
| liters | DECIMAL | Fuel quantity |
| pricePerLiter | DECIMAL | Actual price at time of record |
| totalCost | DECIMAL | Computed total cost |
| recordedBy | UUID | FK  users |
| recordedAt | TIMESTAMP | Record timestamp |

**Note**: `pricePerLiter` is stored per record (not referenced from a global table) to preserve historical accuracy. The price at the time of fueling is what matters, not the current price.

#### 11. `maintenance_requests`
Vehicle maintenance and repair records.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicleId | UUID | FK  vehicles |
| requestedBy | UUID | FK  users |
| description | TEXT | Issue description |
| status | ENUM | PENDING / IN_PROGRESS / COMPLETED |
| scheduledDate | DATE | Planned maintenance date |
| completedDate | DATE | Actual completion date |
| cost | DECIMAL | Maintenance cost |

#### 12. `notifications`
System notifications sent to users.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK  users (recipient) |
| title | VARCHAR | Notification title |
| message | TEXT | Notification body |
| type | ENUM | INFO / WARNING / SUCCESS / ERROR |
| isRead | BOOLEAN | Read status |
| relatedEntityId | UUID | Related trip/vehicle ID |
| createdAt | TIMESTAMP | Creation time |

#### 13. `audit_logs`
Immutable audit trail of all significant system actions.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK  users (actor) |
| action | VARCHAR | Action performed |
| entityType | VARCHAR | Type of entity affected |
| entityId | UUID | ID of affected entity |
| oldValues | JSONB | State before change |
| newValues | JSONB | State after change |
| ipAddress | VARCHAR | Client IP address |
| userAgent | VARCHAR | Client user agent |
| createdAt | TIMESTAMP | When action occurred |

#### 14. `workflow_configurations`
Configurable approval workflow settings per organizational unit.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| collegeId | UUID | FK  colleges (nullable) |
| requiresDepartmentApproval | BOOLEAN | Enable dept level |
| requiresCollegeApproval | BOOLEAN | Enable college level |
| requiresPresidentApproval | BOOLEAN | Enable president level |
| approvalTimeoutHours | INTEGER | Hours before auto-rejection |

### Database Normalization

#### First Normal Form (1NF)
**Violation found**: The original design stored `restrictedZones` as a JSON array column in the `vehicles` table, and `issues` as a JSON array in `trip_feedback`. JSON arrays in a single column violate 1NF because they are not atomic values.

**Fix applied**:
- Created `restricted_zones` table with individual zone records linked to vehicles.
- Created `trip_feedback_issues` table with individual issue records linked to feedback.

#### Second Normal Form (2NF)
**Violation found**: In `fuel_records`, columns like `vehiclePlateNumber` and `vehicleMake` were derived from `vehicleId`  a partial dependency on a non-key attribute.

**Fix applied**: Removed redundant vehicle columns from `fuel_records`. Vehicle information is accessed via JOIN with the `vehicles` table.

#### Third Normal Form (3NF)
**Violation found**: `users` table had a `college_id` column. However, `college_id` is transitively dependent on `department_id` (user  department  college). This is a transitive dependency.

**Fix applied**: Removed `college_id` from `users`. College is now always derived through the department relationship.

### Key Relationships

```
colleges (1)  (N) departments
departments (1)  (N) users
users (1)  (1) drivers
vehicles (1)  (N) trip_requests
users (1)  (N) trip_requests (as requester)
trip_requests (1)  (N) approvals
trip_requests (1)  (N) gps_locations
trip_requests (1)  (1) trip_feedback
vehicles (1)  (N) fuel_records
vehicles (1)  (N) maintenance_requests
users (1)  (N) notifications
users (1)  (N) audit_logs
```

---

## 5. API Design

### REST Principles Applied

The API follows REST (Representational State Transfer) principles:

1. **Resource-based URLs**: Endpoints are named after resources, not actions.
   -  `GET /api/v1/trip-requests` (correct)
   -  `GET /api/v1/getTripRequests` (incorrect)

2. **HTTP verbs for actions**:
   - `GET`  Read data
   - `POST`  Create new resource
   - `PATCH`  Partial update
   - `PUT`  Full replacement
   - `DELETE`  Remove resource

3. **Stateless**: Each request contains all information needed (JWT token in Authorization header). No server-side session state.

4. **Consistent response format**: All responses use a standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Trip request created successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

5. **Versioning**: All endpoints are prefixed with `/api/v1/` to allow future API versions without breaking existing clients.

### Endpoint Categories

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Auth | `/api/v1/auth` | login, register, refresh, logout, forgot-password |
| Users | `/api/v1/users` | CRUD, role management |
| Colleges | `/api/v1/colleges` | CRUD |
| Departments | `/api/v1/departments` | CRUD |
| Vehicles | `/api/v1/vehicles` | CRUD, status updates |
| Drivers | `/api/v1/drivers` | CRUD, availability |
| Trip Requests | `/api/v1/trip-requests` | CRUD, status transitions |
| Approvals | `/api/v1/approvals` | approve, reject |
| GPS Tracking | `/api/v1/tracking` | location updates, history |
| Fuel | `/api/v1/fuel` | CRUD fuel records |
| Maintenance | `/api/v1/maintenance` | CRUD maintenance requests |
| Notifications | `/api/v1/notifications` | list, mark-read |
| Audit | `/api/v1/audit` | read-only audit log |
| Workflow Config | `/api/v1/workflow-config` | read, update |

### Authentication Flow

```
1. POST /api/v1/auth/login
   Body: { email, password }
   Response: { accessToken, refreshToken, user }

2. Include in all subsequent requests:
   Header: Authorization: Bearer <accessToken>

3. When accessToken expires (401 response):
   POST /api/v1/auth/refresh
   Body: { refreshToken }
   Response: { accessToken, refreshToken }

4. On logout:
   POST /api/v1/auth/logout
    accessToken added to blacklist
    refreshToken invalidated
```

### Swagger Documentation

The API is fully documented with Swagger/OpenAPI, accessible at `/api/docs` in development. Every endpoint has:
- Description and summary
- Request body schema with validation rules
- Response schemas for success and error cases
- Authentication requirements
- Role requirements

---

## 6. Real-time Features

### WebSocket Architecture

The system uses **Socket.IO** for real-time bidirectional communication, specifically for live GPS tracking.

**Namespace**: `/tracking`

**Events**:
| Event | Direction | Description |
|-------|-----------|-------------|
| `subscribe` | Client  Server | Subscribe to a specific trip's updates |
| `unsubscribe` | Client  Server | Stop receiving updates for a trip |
| `location_update` | Server  Client | New GPS location for a trip |
| `geofence_violation` | Server  Client | VIP vehicle entered restricted zone |
| `trip_status_change` | Server  Client | Trip status changed |

### GPS Tracking Flow (Detailed)

```
Step 1: Driver starts trip (status: IN_PROGRESS)
Step 2: Flutter Driver App starts location timer (every 5 seconds)
Step 3: App calls Geolocator.getCurrentPosition()
Step 4: App sends POST /api/v1/tracking/:tripId/location
        Body: {
          latitude: 9.4123,
          longitude: 41.9876,
          speed: 45.2,
          heading: 180.0,
          altitude: 2100.0,
          accuracy: 5.0,
          recordedAt: "2024-01-15T10:30:00Z"
        }
Step 5: Backend validates JWT and trip ownership
Step 6: Backend saves location to gps_locations table
Step 7: Backend emits 'location_update' event to Socket.IO room
        Room name: "trip_<tripId>"
Step 8: All web clients subscribed to that room receive the update
Step 9: Frontend map (Leaflet.js or Google Maps) updates marker position
```

### Geofence Detection

For vehicles marked as `isVip = true`, the backend checks each incoming GPS location against defined restricted zones:

```typescript
// Pseudocode
function checkGeofence(location, vehicle) {
  if (!vehicle.isVip) return;
  
  const restrictedZones = await getRestrictedZones(vehicle.id);
  for (const zone of restrictedZones) {
    const distance = haversineDistance(
      location.latitude, location.longitude,
      zone.centerLat, zone.centerLng
    );
    if (distance <= zone.radiusMeters) {
      emitGeofenceViolation(vehicle, zone, location);
      notifyAdmins(vehicle, zone);
    }
  }
}
```

The **Haversine formula** calculates the great-circle distance between two GPS coordinates on Earth's surface.

### Offline GPS Buffering

If the driver loses internet connectivity, the Flutter app buffers GPS points locally. When connectivity is restored, it sends a bulk upload:

```
POST /api/v1/tracking/:tripId/locations/bulk
Body: { locations: [ ...array of location objects... ] }
```

The backend processes them in chronological order, saving all buffered points and broadcasting the latest position.

### Fuel Cost Estimation

During an active trip, the backend calculates estimated fuel cost in real-time:

```
1. Retrieve all GPS points for the trip
2. Calculate total distance using Haversine between consecutive points
3. Look up vehicle's fuel type (PETROL or DIESEL)
4. Apply fuel consumption rate (L/100km, vehicle-specific or default)
5. Multiply by current fuel price:
   - Petrol: 132.18 Birr/L
   - Diesel: 139.84 Birr/L
6. Return estimated cost
```

---

## 7. Security Implementation

### Authentication: JWT with Refresh Tokens

**Access Token**:
- Short-lived (15 minutes to 1 hour)
- Contains: `{ sub: userId, email, role, iat, exp }`
- Signed with `HS256` algorithm using `JWT_SECRET`
- Sent in `Authorization: Bearer <token>` header

**Refresh Token**:
- Long-lived (7-30 days)
- Stored in database (hashed) for validation
- Used only to obtain new access tokens
- Invalidated on logout

**Token Blacklist**:
- On logout, the access token's `jti` (JWT ID) is added to an in-memory blacklist
- Every request checks the blacklist before processing
- Prevents use of stolen tokens after logout

### Password Security: bcrypt

```typescript
// Hashing (registration)
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verification (login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Why bcrypt?**
- Adaptive hashing: salt rounds can be increased as hardware gets faster
- Built-in salt prevents rainbow table attacks
- Intentionally slow to resist brute-force attacks
- 10 salt rounds = ~100ms per hash, acceptable for login but impractical for bulk attacks

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Role-Based Access Control (RBAC)

```typescript
// Guard checks user role against required roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORT_OFFICE, UserRole.SYSTEM_ADMIN)
@Patch(':id/allocate')
allocateVehicle(@Param('id') id: string, @Body() dto: AllocateDto) {
  return this.tripService.allocate(id, dto);
}
```

The `RolesGuard` extracts the user's role from the JWT payload and compares it against the `@Roles()` decorator. If the role is not in the allowed list, a `403 Forbidden` response is returned.

### Rate Limiting (Throttling)

```typescript
// Global throttle: 10 requests per 60 seconds per IP
ThrottlerModule.forRoot([{
  ttl: 60000,  // 60 seconds
  limit: 10,   // max 10 requests
}])
```

Prevents brute-force attacks on login endpoints and API abuse.

### Input Validation

All incoming data is validated using `class-validator` decorators on DTOs:

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

The global `ValidationPipe` rejects any request with invalid data before it reaches the controller.

### SQL Injection Prevention

TypeORM uses **parameterized queries** by default. User input is never interpolated directly into SQL strings:

```typescript
// Safe - TypeORM parameterizes automatically
const user = await this.userRepo.findOne({ where: { email } });

// Also safe - QueryBuilder with parameters
const trips = await this.tripRepo
  .createQueryBuilder('trip')
  .where('trip.requesterId = :userId', { userId })
  .getMany();
```

### CORS Configuration

Cross-Origin Resource Sharing is configured with a whitelist of allowed origins:

```typescript
app.enableCors({
  origin: allowedOrigins,  // Array of trusted domains
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true,
});
```

Only requests from trusted frontend domains are accepted. This prevents malicious websites from making API calls on behalf of authenticated users (CSRF-like attacks).

### Audit Logging

Every significant action is logged:
```typescript
await this.auditService.log({
  userId: currentUser.id,
  action: 'TRIP_APPROVED',
  entityType: 'TripRequest',
  entityId: tripId,
  oldValues: { status: 'PENDING_DEPARTMENT' },
  newValues: { status: 'PENDING_COLLEGE' },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

This creates an immutable record of who did what, when, and from where.

---

## 8. Mobile Applications

### Driver App (Flutter)

The Driver App is used by vehicle drivers to manage their assigned trips and send real-time GPS location data.

**Key Features**:

1. **Authentication**: Login with university credentials. JWT tokens stored securely using `flutter_secure_storage`.

2. **Trip Dashboard**: Shows all trips assigned to the driver, filtered by status (upcoming, in-progress, completed).

3. **GPS Tracking**:
   - Uses `geolocator` package to access device GPS
   - Sends location every 5 seconds using a `Timer.periodic` callback
   - Requests `LocationPermission.always` for background tracking
   - Buffers locations when offline, uploads in bulk when reconnected

4. **QR Code Generation**:
   - Uses `qr_flutter` package to generate QR codes
   - QR code contains the trip ID and a verification hash
   - QR code is hidden when trip is `IN_PROGRESS` (to prevent premature scanning)
   - Shown when trip is `READY` (for departure scan) and `PENDING_RETURN` (for return scan)

5. **Trip Acceptance/Rejection**: Driver can accept or reject assigned trips before departure.

6. **Notifications**: Receives push notifications for new assignments and trip status changes.

**GPS Implementation Detail**:
```dart
Timer.periodic(Duration(seconds: 5), (timer) async {
  if (currentTripStatus != TripStatus.IN_PROGRESS) {
    timer.cancel();
    return;
  }
  
  Position position = await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high,
  );
  
  await apiService.sendLocation(tripId, LocationDto(
    latitude: position.latitude,
    longitude: position.longitude,
    speed: position.speed * 3.6, // m/s to km/h
    heading: position.heading,
    altitude: position.altitude,
    accuracy: position.accuracy,
    recordedAt: DateTime.now().toUtc(),
  ));
  
  // Update UI
  setState(() { currentPosition = position; });
});
```

### Gate Scanner App (Flutter)

The Gate Scanner App is used by gate security personnel to verify vehicle departures and returns using QR codes.

**Key Features**:

1. **Smart QR Scanning**: Uses `mobile_scanner` package for camera-based QR code reading.

2. **Intelligent State Detection**: The app automatically determines what action to take based on the trip's current status:
   - If trip status is `READY`  This is a **departure scan**  Transitions trip to `IN_PROGRESS`
   - If trip status is `PENDING_RETURN`  This is a **return scan**  Transitions trip to `COMPLETED`
   - Any other status  Shows an error (invalid scan)

3. **Single Smart Button**: The UI has one scan button that adapts its label and action based on context, reducing user error.

4. **Scan History**: Maintains a local list of the last 50 scans with timestamps, trip details, and scan results. Useful for security audit purposes.

5. **Offline Handling**: If the network is unavailable when scanning, the app queues the scan and retries when connectivity is restored.

**Scan Flow**:
```
Gate officer opens app  Taps "Scan" button
 Camera opens, scans QR code on driver's phone
 App extracts tripId from QR data
 App calls GET /api/v1/trip-requests/:tripId
 Checks current status
 If READY: calls PATCH /api/v1/trip-requests/:tripId/depart
 If PENDING_RETURN: calls PATCH /api/v1/trip-requests/:tripId/return
 Shows success/failure feedback
 Adds to scan history
```

---

## 9. Workflow & Business Logic

### Trip State Machine

The trip request follows a strict state machine with defined transitions:

```
                    
                      DRAFT   (saved but not submitted)
                    
                          submit()
                         
              
                PENDING_DEPARTMENT    Department Head reviews
              
                          approve()
                         
               
                  PENDING_COLLEGE     College Head reviews
               
                           approve()
                          
               
                  PENDING_PRESIDENT    President reviews
               
                           approve()
                          
           
             APPROVED_FOR_ALLOCATION       Deployment Team assigns vehicle/driver
           
                           allocate()
                          
                
                  CAR_ALLOCATED     Vehicle and driver assigned
                
                          transportConfirm()
                         
           
             PENDING_TRANSPORT_CONFIRM     Transport Office confirms
           
                           confirm()
                          
                   
                     READY     Gate scans QR  departure
                   
                         gateScanDeparture()
                        
                
                  IN_PROGRESS    Trip is active, GPS tracking live
                
                         employeeMarksDone()
                        
               
                PENDING_RETURN    Gate scans QR  return
               
                         gateScanReturn()
                        
                
                   COMPLETED     Trip finished
                

At any point before IN_PROGRESS:
   reject()  REJECTED
   timeout  AUTO_REJECTED_TIMEOUT
   requester cancels  CANCELLED
```

### Approval Workflow Configuration

The approval levels are configurable per college via `workflow_configurations`:

- A small department might only require Department Head approval
- A major trip might require all three levels (Department  College  President)
- The system skips levels that are disabled in the configuration

### Two-Step Trip Completion

The two-step completion ensures physical verification:

1. **Employee marks done**: The trip requester (or driver) marks the trip as complete from the web/app. Status  `PENDING_RETURN`
2. **Gate scans return**: The gate officer physically scans the QR code when the vehicle returns to campus. Status  `COMPLETED`

This prevents false completions  a trip cannot be marked complete unless the vehicle physically returns through the gate.

### Approval Timeout

Each approval level has a configurable timeout (e.g., 48 hours). If an approver does not act within the timeout window, the system automatically rejects the trip with status `AUTO_REJECTED_TIMEOUT`. This prevents trips from being stuck indefinitely in the approval queue.

### Notification Triggers

Notifications are sent at each state transition:
- Trip submitted  Department Head notified
- Department approved  College Head notified
- All approvals done  Deployment Team notified
- Vehicle allocated  Driver notified
- Trip ready  Requester notified
- Trip completed  Requester asked for feedback

---

## 10. Testing & Deployment

### API Testing with Postman

A complete Postman collection is included at `Backend/postman/collections/Fleet_Management_API.postman_collection.json`.

The collection covers:
- Authentication flows (login, refresh, logout)
- All CRUD operations for each module
- Trip workflow state transitions
- GPS location submission
- Error cases and validation

**Running tests**:
```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run collection
newman run Backend/postman/collections/Fleet_Management_API.postman_collection.json \
  --environment Backend/postman/environments/local.json
```

### Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd Fleet-Management-System

# 2. Install backend dependencies
cd Backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secrets

# 4. Create database
psql -U postgres -f scripts/create-database.sql

# 5. Run migrations
npm run migration:run

# 6. Seed initial data
npm run seed

# 7. Start development server
npm run start:dev
```

### Production Deployment

The production environment runs on a Linux VPS with the following setup:

```bash
# 1. Build the application
npm run build

# 2. Configure PM2
# ecosystem.config.cjs defines the app configuration

# 3. Start with PM2
pm2 start ecosystem.config.cjs

# 4. Save PM2 process list (survives reboots)
pm2 save
pm2 startup

# 5. Cloudflare Tunnel connects the server to the internet
cloudflared tunnel run fleet-management
```

### PM2 Configuration (`ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [{
    name: 'fleet-management-api',
    script: 'dist/main.js',
    instances: 'max',        // Use all CPU cores
    exec_mode: 'cluster',    // Cluster mode for load balancing
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    restart_delay: 5000,     // Wait 5s before restart
    max_restarts: 10,        // Max 10 restarts before giving up
  }]
};
```

### Database Migrations

TypeORM migrations provide version-controlled schema changes:

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/AddNewColumn

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

Migrations ensure that schema changes are applied consistently across development, staging, and production environments without data loss.

### Environment Variables

Key environment variables (never committed to git):
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fleet_management
DATABASE_USER=postgres
DATABASE_PASSWORD=<secret>
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_USER=<email>
SMTP_PASS=<app-password>
```

---

## 11. Q&A - Examiner Questions & Answers

---

### Q1: Why did you choose NestJS over plain Express.js?

**Answer**: NestJS provides a structured, opinionated architecture that enforces separation of concerns through modules, controllers, services, guards, and interceptors. In a large system like this with 14+ modules, plain Express would result in inconsistent code organization across the team. NestJS's dependency injection container makes unit testing straightforward  you can inject mock services without changing production code. The decorator-based approach (`@Controller`, `@Get`, `@UseGuards`) makes the code self-documenting. NestJS also has first-class integration with TypeORM, Socket.IO, Swagger, and class-validator, which are all used in this project. Express would require manually wiring all of these together.

---

### Q2: Why did you choose PostgreSQL over MongoDB?

**Answer**: The fleet management domain has highly relational data. Users belong to departments, departments belong to colleges, trips have multiple approvals, each approval references a user and a trip, GPS locations reference trips, and so on. This web of relationships is exactly what relational databases are designed for. PostgreSQL provides ACID transactions, ensuring that multi-step operations (like approving a trip and updating its status atomically) either fully succeed or fully fail. Complex queries with JOINs across multiple tables are efficient and natural in SQL. MongoDB's document model would require either embedding (causing data duplication) or manual reference management (losing referential integrity). PostgreSQL also supports JSONB columns for flexible data when needed, giving the best of both worlds.

---

### Q3: How does JWT authentication work in this system?

**Answer**: JWT (JSON Web Token) is a compact, self-contained token format. When a user logs in, the server creates two tokens:

1. **Access Token** (short-lived, ~15 minutes): Contains the user's ID, email, and role encoded in Base64. Signed with a secret key using HMAC-SHA256. The client sends this in every request as `Authorization: Bearer <token>`.

2. **Refresh Token** (long-lived, ~7 days): Used only to get a new access token when the current one expires.

The server validates the access token by re-computing the signature and comparing it. If the signature matches and the token hasn't expired, the request is authenticated. The token is stateless  the server doesn't store it. The user's identity is extracted from the token payload itself.

On logout, the access token's unique ID (`jti`) is added to a blacklist. Every request checks this blacklist, so even a valid token cannot be used after logout.

---

### Q4: How does WebSocket work and why is it used for GPS tracking?

**Answer**: WebSocket is a protocol that establishes a persistent, bidirectional connection between client and server over a single TCP connection. Unlike HTTP (which is request-response), WebSocket allows the server to push data to clients at any time without the client asking.

For GPS tracking, this is essential. If we used HTTP polling (client asks "any new location?" every second), we'd have hundreds of unnecessary requests per minute per viewer. With WebSocket, the server pushes each new GPS point to all subscribed viewers the moment it arrives, with minimal overhead.

The flow: Driver app sends GPS via REST POST  Backend saves to DB  Backend emits `location_update` event via Socket.IO to all clients in the trip's room  Web clients receive the event and update the map marker. This gives sub-second latency for location updates.

---

### Q5: What is database normalization and how did you apply it?

**Answer**: Normalization is the process of organizing a database to reduce data redundancy and improve data integrity. There are multiple normal forms (1NF, 2NF, 3NF, etc.), each eliminating a specific type of anomaly.

**1NF (First Normal Form)**: Every column must contain atomic (indivisible) values. We found that `restrictedZones` was stored as a JSON array in the vehicles table  not atomic. We created a separate `restricted_zones` table with one row per zone.

**2NF (Second Normal Form)**: No partial dependencies (non-key columns depending on only part of a composite key). In `fuel_records`, vehicle details like plate number were redundantly stored. We removed them and use JOINs instead.

**3NF (Third Normal Form)**: No transitive dependencies (non-key column A depends on non-key column B which depends on the key). Users had a `college_id` column, but college is already determined by `department_id` (user  department  college). We removed `college_id` from users.

---

### Q6: How is GPS tracked in real-time?

**Answer**: The Flutter Driver App uses the `geolocator` package to access the device's GPS hardware. A `Timer.periodic` runs every 5 seconds and calls `Geolocator.getCurrentPosition()` with high accuracy. The resulting coordinates (latitude, longitude, speed, heading, altitude, accuracy) are sent via HTTP POST to `/api/v1/tracking/:tripId/location`.

The backend receives this, validates the JWT and trip ownership, saves the point to the `gps_locations` table, then immediately emits a `location_update` Socket.IO event to all clients subscribed to that trip's room. Web clients listening on the WebSocket receive this event and update the map marker position. The entire cycle takes under 1 second, giving near-real-time tracking.

---

### Q7: How is security implemented in this system?

**Answer**: Security is implemented in multiple layers:

1. **Authentication**: JWT tokens with short expiry. Refresh token rotation.
2. **Authorization**: Role-based access control (RBAC) with guards on every endpoint.
3. **Password security**: bcrypt hashing with 10 salt rounds.
4. **Input validation**: class-validator on all DTOs rejects malformed input before it reaches business logic.
5. **SQL injection prevention**: TypeORM parameterized queries  user input never interpolated into SQL.
6. **Rate limiting**: 10 requests per 60 seconds per IP prevents brute-force attacks.
7. **CORS**: Whitelist of allowed origins prevents cross-site request forgery.
8. **Token blacklist**: Invalidated tokens cannot be reused after logout.
9. **Audit logging**: Every action is recorded with user, timestamp, and IP address.
10. **HTTPS**: Cloudflare Tunnel provides TLS encryption for all traffic.

---

### Q8: What design patterns are used in this system?

**Answer**:

1. **Repository Pattern**: TypeORM repositories abstract database access. Services use `this.tripRepo.findOne()` rather than writing raw SQL. This makes services testable by injecting mock repositories.

2. **Dependency Injection**: NestJS's IoC container injects dependencies (services, repositories) into constructors. This decouples components and enables testing.

3. **Observer Pattern**: Socket.IO's event system implements the Observer pattern. The tracking gateway is the subject; web clients are observers. When a GPS update arrives, all observers (subscribed clients) are notified.

4. **Strategy Pattern**: The approval workflow uses different strategies depending on the workflow configuration. The system selects which approval levels to apply based on the `workflow_configurations` table.

5. **Decorator Pattern**: NestJS guards, interceptors, and pipes are decorators that wrap controller methods with cross-cutting concerns (auth, logging, transformation) without modifying the core logic.

6. **State Machine Pattern**: The trip request follows a strict state machine with defined valid transitions. Invalid transitions are rejected.

7. **Factory Pattern**: The TypeORM factory (`typeorm.factory.ts`) creates database connection configurations based on the environment.

---

### Q9: How does the approval workflow work?

**Answer**: The approval workflow is a configurable multi-level process. When a trip request is submitted, the system checks the `workflow_configurations` table for the requester's college to determine which approval levels are required.

For each required level, an `approvals` record is created with status `PENDING`. The appropriate approver (Department Head, College Head, or President) receives a notification. When they approve, the approval record is updated to `APPROVED` and the trip moves to the next level. If they reject, the trip moves to `REJECTED` and all subsequent approvals are cancelled.

The workflow is configurable: a college can disable the department level (trips go straight to college head) or require all three levels. This flexibility accommodates different organizational structures within the university.

---

### Q10: What happens if the server crashes?

**Answer**: PM2 (Process Manager 2) monitors the Node.js process. If it crashes, PM2 automatically restarts it within seconds (with a configurable restart delay of 5 seconds). PM2 is configured with `pm2 startup` to survive server reboots  it registers as a system service that starts automatically.

For data integrity, PostgreSQL's WAL (Write-Ahead Logging) ensures that committed transactions are not lost even if the database crashes. Any transaction that was committed before the crash is recoverable.

For in-flight GPS data, the Flutter app buffers locations locally when the server is unreachable and uploads them in bulk when the connection is restored. The token blacklist (in-memory) is lost on restart, but this is acceptable  it means recently-logged-out tokens could theoretically be used for a brief window, which is a known trade-off of in-memory blacklists. A Redis-based blacklist would solve this for production at scale.

---

### Q11: How do you handle concurrent requests?

**Answer**: Node.js handles concurrency through its event loop  it processes I/O operations asynchronously without blocking. When one request is waiting for a database query, the event loop processes other requests. This is why Node.js can handle thousands of concurrent connections efficiently.

For database-level concurrency, PostgreSQL handles concurrent writes with row-level locking. TypeORM uses transactions for operations that must be atomic (e.g., approving a trip and updating its status). If two approvers try to approve the same trip simultaneously, the database transaction ensures only one succeeds.

PM2 cluster mode runs multiple Node.js processes (one per CPU core), distributing incoming requests across them. This multiplies throughput for CPU-bound operations.

---

### Q12: What is CORS and why is it needed?

**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a different domain than the one that served the page. Without CORS headers, a browser will block requests from `https://fleet.haramaya.edu` to `https://api.fleet.haramaya.edu` because they are different origins (different subdomain).

The backend configures CORS to explicitly allow requests from trusted origins (the web frontend's domain). This prevents malicious websites from making API calls on behalf of authenticated users  if a user visits a malicious site while logged into the fleet system, the browser will block that site's attempts to call the fleet API.

CORS is a browser-enforced policy. Mobile apps and server-to-server calls are not subject to CORS restrictions.

---

### Q13: How does bcrypt work?

**Answer**: bcrypt is a password hashing function designed to be slow and resistant to brute-force attacks. It works as follows:

1. **Salt generation**: A random 22-character salt is generated. This ensures that two users with the same password get different hashes.
2. **Key stretching**: The password and salt are processed through the Blowfish cipher in a loop. The number of iterations is `2^saltRounds` (with saltRounds=10, that's 1024 iterations).
3. **Output**: The hash includes the algorithm version, salt rounds, salt, and hash  all in one string like `$2b$10$...`.

When verifying, bcrypt extracts the salt from the stored hash, re-hashes the input password with the same salt and rounds, and compares. The intentional slowness (~100ms per hash) makes brute-force attacks impractical  an attacker can only try ~10 passwords per second per core.

---

### Q14: What is rate limiting and how is it implemented?

**Answer**: Rate limiting restricts how many requests a client can make in a given time window. It prevents brute-force attacks (trying thousands of passwords), denial-of-service attacks, and API abuse.

In this system, `@nestjs/throttler` is configured globally: 10 requests per 60 seconds per IP address. If a client exceeds this limit, they receive a `429 Too Many Requests` response.

The throttler uses an in-memory store (or can be configured with Redis for distributed deployments) to track request counts per IP. The `ThrottlerGuard` is applied globally, so every endpoint is protected by default. Specific endpoints (like health checks) can be exempted with `@SkipThrottle()`.

---

### Q15: How does TypeORM work?

**Answer**: TypeORM is an Object-Relational Mapper (ORM) that bridges TypeScript classes and database tables. You define entities as TypeScript classes with decorators:

```typescript
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plateNumber: string;

  @OneToMany(() => TripRequest, trip => trip.vehicle)
  trips: TripRequest[];
}
```

TypeORM maps these classes to database tables, handles INSERT/UPDATE/DELETE/SELECT operations, manages relationships (OneToMany, ManyToOne, ManyToMany), and provides a QueryBuilder for complex queries. It also manages migrations  tracking schema changes as versioned files that can be applied or reverted.

The Repository pattern is used: `this.vehicleRepo.findOne({ where: { id } })` generates `SELECT * FROM vehicles WHERE id = $1` with the ID as a parameterized value.

---

### Q16: What is the difference between REST and WebSocket?

**Answer**:

| Aspect | REST (HTTP) | WebSocket |
|--------|-------------|-----------|
| Connection | New connection per request | Persistent connection |
| Direction | Client initiates (request-response) | Bidirectional |
| Overhead | HTTP headers on every request | Minimal after handshake |
| Use case | CRUD operations, data retrieval | Real-time updates, live data |
| Scalability | Stateless, easy to scale | Stateful, requires sticky sessions or pub/sub |

In this system, REST is used for all CRUD operations (creating trips, approving, etc.) because these are discrete actions with clear request-response semantics. WebSocket is used only for GPS tracking because the server needs to push updates to clients continuously without clients polling.

---

### Q17: How does the QR code system work?

**Answer**: When a trip is allocated and confirmed, the backend generates a QR code containing the trip ID and a cryptographic hash (HMAC) of the trip ID signed with a server secret. This prevents forgery  you cannot create a valid QR code without knowing the server secret.

The QR code data looks like: `{"tripId": "uuid", "hash": "hmac-sha256-value"}`.

The Driver App displays this QR code using the `qr_flutter` package. The Gate Scanner App uses `mobile_scanner` to read the QR code. When scanned, the app sends the QR data to the backend, which:
1. Verifies the HMAC hash
2. Looks up the trip
3. Checks the current status (READY or PENDING_RETURN)
4. Performs the appropriate state transition
5. Returns success/failure

The QR code is hidden in the Driver App when the trip is `IN_PROGRESS` to prevent the gate from scanning it again mid-trip.

---

### Q18: What is role-based access control (RBAC)?

**Answer**: RBAC is an authorization model where permissions are assigned to roles, and users are assigned roles. Instead of checking individual user permissions, the system checks the user's role.

In this system, there are 12 roles (User, DepartmentHead, CollegeHead, Dean, President, DeploymentTeam, TransportOffice, MaintenanceTeam, Driver, Gate, Developer, SystemAdmin). Each API endpoint is decorated with the roles that are allowed to access it:

```typescript
@Roles(UserRole.TRANSPORT_OFFICE, UserRole.SYSTEM_ADMIN)
@Patch(':id/allocate')
allocateVehicle() { ... }
```

The `RolesGuard` runs after `JwtAuthGuard`. It extracts the user's role from the JWT payload and checks if it's in the allowed roles list. If not, it returns `403 Forbidden`. This ensures that, for example, a regular User cannot allocate vehicles  only Transport Office or System Admin can.

---

### Q19: How does the geofence work?

**Answer**: A geofence is a virtual geographic boundary. In this system, geofences apply to VIP vehicles (`isVip = true`). Restricted zones are defined as circles with a center coordinate and radius.

When a GPS location update arrives for a VIP vehicle's trip, the backend runs a geofence check:

1. Retrieve all restricted zones for the vehicle
2. For each zone, calculate the distance from the current GPS point to the zone center using the **Haversine formula**:
   ```
   a = sin(Δlat/2) + cos(lat1)  cos(lat2)  sin(Δlon/2)
   distance = 2R  arcsin(a)
   ```
   where R = 6371 km (Earth's radius)
3. If distance  zone radius  geofence violation
4. Emit `geofence_violation` Socket.IO event to admins
5. Send notification to Transport Office and System Admin

---

### Q20: What are the limitations of the current system?

**Answer**:

1. **Token blacklist is in-memory**: If the server restarts, the blacklist is lost. Recently-logged-out tokens could be reused briefly. Solution: Use Redis for persistent blacklist storage.

2. **Fuel prices are hardcoded**: Petrol (132.18 Birr/L) and Diesel (139.84 Birr/L) are constants in the code. When prices change, a code deployment is required. Solution: Add a `fuel_prices` configuration table.

3. **Single server**: While PM2 cluster mode uses multiple processes, the system runs on a single VPS. If the VPS goes down, the system is unavailable. Solution: Add a standby server with failover.

4. **No automated tests**: The system relies on manual Postman testing. Solution: Add Jest unit tests for services and e2e tests for controllers.

5. **GPS accuracy depends on device**: The accuracy of tracking depends on the driver's phone GPS hardware and signal quality.

6. **No offline web support**: The web frontend requires internet connectivity. Solution: Add service workers for offline capability.

7. **Email delivery**: Email notifications depend on SMTP availability. If the email server is down, notifications are lost. Solution: Add a message queue (Bull/Redis) for reliable delivery.

---

### Q21: How would you scale this system?

**Answer**: Scaling depends on the bottleneck:

**Horizontal scaling (more servers)**:
- Run multiple NestJS instances behind a load balancer (Nginx)
- Use Redis for shared session/blacklist storage across instances
- Socket.IO requires sticky sessions or a Redis adapter (`@socket.io/redis-adapter`) so WebSocket connections work across multiple servers

**Database scaling**:
- Add read replicas for heavy read workloads (reports, dashboards)
- Implement connection pooling (PgBouncer) to handle more concurrent DB connections
- Partition the `gps_locations` table by date (it grows fastest)
- Archive old GPS data to cold storage

**Caching**:
- Add Redis caching for frequently-read, rarely-changed data (vehicle list, college/department list)
- Cache JWT validation results briefly

**Async processing**:
- Move email sending to a background queue (Bull + Redis) so API responses aren't delayed by SMTP
- Process bulk GPS uploads asynchronously

**CDN**:
- Serve the Next.js frontend from a CDN for faster global access

---

### Q22: What is the CAP theorem and how does it apply to this system?

**Answer**: The CAP theorem states that a distributed system can guarantee at most two of three properties simultaneously:
- **Consistency**: All nodes see the same data at the same time
- **Availability**: Every request receives a response (not necessarily the latest data)
- **Partition Tolerance**: The system continues operating despite network partitions

PostgreSQL is a **CP system** (Consistency + Partition Tolerance). It prioritizes data consistency over availability. If a network partition occurs, PostgreSQL will refuse writes rather than risk inconsistent data.

For this fleet management system, **consistency is critical**. We cannot have two servers showing different trip statuses  if one server shows a trip as APPROVED and another shows it as REJECTED, the system is broken. Therefore, the CP choice is correct.

The trade-off is that during a database failure, the system becomes unavailable. For a university fleet system, this is acceptable  it's better to be temporarily unavailable than to approve the same vehicle for two trips simultaneously.

---

### Q23: How do you prevent SQL injection?

**Answer**: SQL injection occurs when user input is concatenated directly into SQL queries, allowing attackers to modify the query structure.

**Prevention in this system**:

1. **TypeORM parameterized queries**: TypeORM never interpolates user input into SQL strings. It uses database driver parameterization:
   ```typescript
   // TypeORM generates: SELECT * FROM users WHERE email = $1
   // The email value is passed separately, never in the SQL string
   const user = await this.userRepo.findOne({ where: { email } });
   ```

2. **QueryBuilder with parameters**:
   ```typescript
   // Safe - parameter is bound separately
   .where('trip.status = :status', { status: userInput })
   // Never do this:
   .where(`trip.status = '${userInput}'`) // VULNERABLE
   ```

3. **Input validation**: class-validator rejects unexpected input types before they reach the database layer.

4. **TypeScript typing**: Strong typing prevents passing arbitrary strings where specific types are expected.

---

### Q24: What is the difference between authentication and authorization?

**Answer**:

**Authentication** answers: "Who are you?" It verifies identity. In this system, authentication is done via JWT  the user proves their identity by presenting a valid token signed with the server's secret. The login endpoint (`POST /auth/login`) performs authentication by verifying the email and bcrypt-hashed password.

**Authorization** answers: "What are you allowed to do?" It verifies permissions. In this system, authorization is done via RBAC  after authentication confirms who the user is, the `RolesGuard` checks if their role permits the requested action.

Example:
- A Driver is **authenticated** (valid JWT) but **not authorized** to approve trips (wrong role  403 Forbidden)
- A Department Head is **authenticated** and **authorized** to approve department-level trips

Both are required: authentication without authorization means any logged-in user can do anything; authorization without authentication means anyone can claim any role.

---

### Q25: How does the two-step trip completion work?

**Answer**: The two-step completion prevents fraudulent trip completions and ensures physical accountability.

**Step 1 - Employee marks done**: When the trip is finished (destination reached, returning to campus), the trip requester or driver marks the trip as complete via the app/web. The status changes from `IN_PROGRESS` to `PENDING_RETURN`. GPS tracking continues.

**Step 2 - Gate scans return**: When the vehicle physically arrives at the university gate, the gate security officer scans the QR code on the driver's phone. The backend verifies the QR code, confirms the trip is in `PENDING_RETURN` status, and transitions it to `COMPLETED`.

**Why two steps?** Without the gate scan, a driver could mark a trip complete while still away from campus. The gate scan provides physical proof that the vehicle has returned. This is important for accountability  the university needs to know when vehicles are back on campus, especially for security and scheduling purposes.

---

### Q26: What is PM2 and why use it?

**Answer**: PM2 (Process Manager 2) is a production process manager for Node.js applications. Node.js is a single process  if it crashes, the application goes down. PM2 solves this by:

1. **Auto-restart**: Monitors the process and restarts it automatically if it crashes
2. **Startup scripts**: Registers as a system service (`pm2 startup`) so it starts automatically after server reboots
3. **Cluster mode**: Spawns multiple Node.js processes (one per CPU core) to utilize all available CPU resources and handle more concurrent requests
4. **Log management**: Captures stdout/stderr to log files with rotation
5. **Zero-downtime reload**: `pm2 reload` restarts processes one at a time, so the application stays available during updates
6. **Monitoring**: `pm2 monit` shows real-time CPU and memory usage per process

Without PM2, a single Node.js crash would take down the entire fleet management system until someone manually restarts it.

---

### Q27: How does the fuel cost calculation work?

**Answer**: Fuel cost is estimated in real-time during active trips:

1. **Distance calculation**: All GPS points for the trip are retrieved from `gps_locations`. The Haversine formula calculates the distance between each consecutive pair of points. These distances are summed to get the total trip distance in kilometers.

2. **Fuel consumption**: A consumption rate is applied (e.g., 10 liters per 100 km for a typical vehicle). This can be vehicle-specific or use a default.

3. **Price lookup**: The vehicle's fuel type (PETROL or DIESEL) determines the price:
   - Petrol: 132.18 Birr/L
   - Diesel: 139.84 Birr/L

4. **Cost formula**:
   ```
   fuelUsed = (totalDistanceKm / 100)  consumptionRateLper100km
   estimatedCost = fuelUsed  pricePerLiter
   ```

5. **Storage**: The estimated cost is saved to `trip_requests.estimatedFuelCost`. Actual fuel records are stored separately in `fuel_records` with the real price at the time of fueling.

**Limitation**: The current fuel prices are hardcoded constants. A future improvement would be a `fuel_prices` table that administrators can update without code changes.

---

### Q28: What is TypeScript and why use it over JavaScript?

**Answer**: TypeScript is a statically-typed superset of JavaScript developed by Microsoft. It adds optional type annotations that are checked at compile time, then compiles to plain JavaScript.

**Why TypeScript for this project**:

1. **Catch errors at compile time**: Type errors (passing a string where a number is expected, calling a method that doesn't exist) are caught before the code runs, not in production.

2. **Better IDE support**: TypeScript enables autocomplete, refactoring, and "go to definition" across the entire codebase. This is critical in a large project with 50+ API endpoints.

3. **Self-documenting code**: Function signatures with types serve as documentation:
   ```typescript
   async allocateVehicle(tripId: string, vehicleId: string, driverId: string): Promise<TripRequest>
   ```
   vs JavaScript:
   ```javascript
   async allocateVehicle(tripId, vehicleId, driverId) { ... }
   ```

4. **Refactoring safety**: Renaming a property updates all references. In JavaScript, you'd have to search manually.

5. **NestJS is TypeScript-first**: NestJS's decorators and dependency injection rely on TypeScript's metadata reflection.

---

### Q29: How does the audit log work?

**Answer**: The audit log provides an immutable record of all significant actions in the system. It is implemented as an `AuditService` that is injected into every service that performs state-changing operations.

When an action occurs (trip approved, vehicle allocated, user role changed), the service calls:
```typescript
await this.auditService.log({
  userId: currentUser.id,        // Who performed the action
  action: 'TRIP_APPROVED',       // What action was performed
  entityType: 'TripRequest',     // What type of entity was affected
  entityId: trip.id,             // Which specific entity
  oldValues: { status: 'PENDING_DEPARTMENT' },  // State before
  newValues: { status: 'PENDING_COLLEGE' },     // State after
  ipAddress: request.ip,         // Where from
  userAgent: request.headers['user-agent'],     // What client
});
```

The audit log is **append-only**  records are never updated or deleted. This ensures the integrity of the audit trail. Only SystemAdmin and Developer roles can read audit logs. This is critical for accountability: if a dispute arises about who approved a trip or when a vehicle was allocated, the audit log provides the definitive answer.

---

### Q30: What is the Observer pattern and where is it used?

**Answer**: The Observer pattern defines a one-to-many dependency between objects. When one object (the subject) changes state, all its dependents (observers) are notified automatically.

**In this system**:

1. **Socket.IO GPS tracking**: The tracking gateway is the subject. When a new GPS location arrives, it emits an event. All web clients subscribed to that trip's room are observers  they receive the update and refresh the map. The subject (gateway) doesn't know or care how many observers there are.

2. **NestJS Event Emitter**: NestJS's `EventEmitter2` module implements the Observer pattern for internal events. When a trip status changes, an event is emitted. The notification service and audit service are observers that react to this event independently.

3. **Notification system**: When a trip is approved, the notification service observes the approval event and sends emails/in-app notifications to relevant users.

The Observer pattern decouples the event producer from the event consumers. Adding a new reaction to an event (e.g., sending an SMS) only requires adding a new observer, not modifying the existing code.

---

### Q31: How does the notification system work?

**Answer**: The notification system has two channels:

**In-app notifications**:
- Stored in the `notifications` table with `isRead = false`
- When a user opens the app/web, they fetch their unread notifications via `GET /api/v1/notifications`
- Marking as read: `PATCH /api/v1/notifications/:id/read`
- The frontend shows a badge count of unread notifications

**Email notifications**:
- Sent via SMTP using `@nestjs-modules/mailer` with Nodemailer
- Triggered at key workflow events (trip submitted, approved, rejected, completed)
- Email templates are HTML with trip details
- Configured via environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)

**Notification triggers**:
- Trip submitted  Department Head receives notification
- Department approved  College Head notified
- All approvals done  Deployment Team notified
- Vehicle allocated  Driver notified
- Trip ready  Requester notified
- Trip completed  Requester asked for feedback
- Geofence violation  Transport Office and Admin notified

---

### Q32: What is a database migration and why use it?

**Answer**: A migration is a versioned, incremental change to the database schema. Instead of manually running SQL commands on each environment, migrations are code files that describe schema changes and can be applied or reverted programmatically.

**Why migrations**:

1. **Version control**: Schema changes are tracked in git alongside code changes. You can see exactly what changed and when.

2. **Consistency**: The same migration runs on development, staging, and production, ensuring all environments have identical schemas.

3. **Rollback**: If a migration causes problems, `migration:revert` undoes the last migration.

4. **Team collaboration**: Multiple developers can make schema changes without conflicts  migrations are applied in order.

**Example migration**:
```typescript
export class AddGeofenceTable1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'restricted_zones',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'vehicleId', type: 'uuid' },
        { name: 'centerLat', type: 'decimal' },
        { name: 'centerLng', type: 'decimal' },
        { name: 'radiusMeters', type: 'decimal' },
      ]
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('restricted_zones');
  }
}
```

---

### Q33: How does the token blacklist work?

**Answer**: The token blacklist prevents the use of JWT tokens after logout. Since JWTs are stateless (the server doesn't store them), a logged-out token would normally remain valid until it expires.

**Implementation**:
1. Each JWT contains a unique `jti` (JWT ID) claim  a UUID generated at token creation time.
2. The `TokenBlacklistService` maintains an in-memory `Set<string>` of blacklisted JTIs.
3. On logout, the current token's `jti` is added to the blacklist.
4. The `JwtAuthGuard` checks the blacklist after validating the token signature. If the `jti` is blacklisted, the request is rejected with `401 Unauthorized`.

**Limitation**: The blacklist is in-memory. If the server restarts, the blacklist is cleared. This means recently-logged-out tokens could be used briefly after a restart. For production at scale, the blacklist should be stored in Redis with TTL matching the token expiry.

**Why not just use short-lived tokens?** Short-lived tokens (15 minutes) reduce the window of vulnerability, but users would need to re-login every 15 minutes. The refresh token mechanism extends sessions while the blacklist handles immediate invalidation on logout.

---

### Q34: What is the Repository pattern?

**Answer**: The Repository pattern abstracts the data access layer behind an interface. Instead of writing database queries directly in business logic, services use a repository object that provides methods like `findOne`, `findAll`, `save`, `delete`.

**Benefits**:

1. **Separation of concerns**: Business logic (services) doesn't know or care how data is stored. The repository handles all database interaction.

2. **Testability**: In unit tests, you inject a mock repository instead of a real database connection. The service is tested in isolation.

3. **Flexibility**: If you switch from PostgreSQL to another database, you only change the repository implementation, not the service.

**In NestJS with TypeORM**:
```typescript
@Injectable()
export class TripRequestsService {
  constructor(
    @InjectRepository(TripRequest)
    private readonly tripRepo: Repository<TripRequest>,
  ) {}

  async findById(id: string): Promise<TripRequest> {
    return this.tripRepo.findOne({ where: { id }, relations: ['vehicle', 'driver'] });
  }
}
```

TypeORM's `Repository<T>` class provides the standard repository interface. Custom queries can be added via the `QueryBuilder`.

---

### Q35: How does the approval timeout work?

**Answer**: The approval timeout prevents trips from being stuck indefinitely in the approval queue. Each approval level has a configurable timeout (e.g., 48 hours) defined in `workflow_configurations.approvalTimeoutHours`.

**Implementation**:
1. When an approval record is created (status: PENDING), the `createdAt` timestamp is recorded.
2. A scheduled task (NestJS `@Cron` decorator) runs periodically (e.g., every hour).
3. The task queries for all PENDING approvals where `createdAt < NOW() - timeout`.
4. For each expired approval, the trip is transitioned to `AUTO_REJECTED_TIMEOUT`.
5. The requester receives a notification explaining the auto-rejection.
6. An audit log entry is created.

```typescript
@Cron(CronExpression.EVERY_HOUR)
async checkApprovalTimeouts() {
  const expiredApprovals = await this.approvalRepo
    .createQueryBuilder('approval')
    .where('approval.status = :status', { status: 'PENDING' })
    .andWhere('approval.createdAt < :cutoff', {
      cutoff: new Date(Date.now() - timeoutMs)
    })
    .getMany();

  for (const approval of expiredApprovals) {
    await this.rejectWithTimeout(approval);
  }
}
```

---

### Q36: What is Swagger and why use it?

**Answer**: Swagger (OpenAPI) is a specification for describing REST APIs in a machine-readable format (JSON/YAML). The `@nestjs/swagger` package automatically generates this documentation from NestJS decorators.

**Why Swagger**:

1. **Interactive documentation**: The Swagger UI at `/api/docs` lets developers explore and test all endpoints directly in the browser without needing Postman.

2. **Auto-generated**: Documentation is derived from the code itself (decorators, DTOs, entity types). It stays in sync with the implementation.

3. **Client generation**: The OpenAPI spec can be used to auto-generate client SDKs in any language.

4. **Onboarding**: New team members can understand the entire API surface without reading source code.

**Example**:
```typescript
@ApiOperation({ summary: 'Submit a trip request for approval' })
@ApiResponse({ status: 201, description: 'Trip request submitted', type: TripRequest })
@ApiResponse({ status: 400, description: 'Validation error' })
@Post(':id/submit')
submitTripRequest(@Param('id') id: string) { ... }
```

---

### Q37: How does offline GPS buffering work?

**Answer**: Mobile devices can lose internet connectivity (poor signal, tunnels, remote areas). Without buffering, GPS points would be lost during offline periods, creating gaps in the trip track.

**Flutter implementation**:
```dart
List<LocationDto> offlineBuffer = [];

void onLocationUpdate(Position position) async {
  final location = LocationDto.fromPosition(position);
  
  if (await isConnected()) {
    // Upload any buffered locations first
    if (offlineBuffer.isNotEmpty) {
      await apiService.uploadBulkLocations(tripId, offlineBuffer);
      offlineBuffer.clear();
    }
    // Upload current location
    await apiService.sendLocation(tripId, location);
  } else {
    // Store locally for later upload
    offlineBuffer.add(location);
  }
}
```

**Backend bulk upload endpoint**:
```
POST /api/v1/tracking/:tripId/locations/bulk
Body: { locations: [...] }
```

The backend processes buffered locations in chronological order (sorted by `recordedAt`), saves them all to `gps_locations`, and broadcasts the latest position via WebSocket. This ensures the complete trip track is preserved even with intermittent connectivity.

---

### Q38: What are the SOLID principles and how are they applied?

**Answer**: SOLID is a set of five object-oriented design principles:

**S - Single Responsibility Principle**: Each class has one reason to change.
- `TripRequestsService` handles trip business logic only
- `AuditService` handles audit logging only
- `EmailService` handles email sending only
- They don't overlap

**O - Open/Closed Principle**: Open for extension, closed for modification.
- New approval levels can be added by extending the workflow configuration without modifying existing approval logic
- New notification channels (SMS, push) can be added without changing existing email code

**L - Liskov Substitution Principle**: Subtypes must be substitutable for their base types.
- Any `Repository<T>` implementation (real or mock) can be injected into services
- Tests use mock repositories that satisfy the same interface

**I - Interface Segregation Principle**: Clients should not depend on interfaces they don't use.
- DTOs are specific to each operation (CreateTripDto, UpdateTripDto, AllocateTripDto) rather than one large DTO
- Guards are separate (JwtAuthGuard, RolesGuard) rather than one monolithic guard

**D - Dependency Inversion Principle**: Depend on abstractions, not concretions.
- Services depend on TypeORM's `Repository<T>` interface, not specific database implementations
- NestJS's dependency injection injects concrete implementations at runtime

---

### Q39: How would you add a new feature to this system?

**Answer**: Adding a new feature follows NestJS's modular structure. Example: adding a **Vehicle Reservation** feature.

**Step 1: Create the module**
```bash
nest generate module reservations
nest generate controller reservations
nest generate service reservations
```

**Step 2: Define the entity**
```typescript
@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Vehicle) vehicle: Vehicle;
  @ManyToOne(() => User) reservedBy: User;
  @Column() startTime: Date;
  @Column() endTime: Date;
}
```

**Step 3: Create DTOs with validation**
```typescript
export class CreateReservationDto {
  @IsUUID() vehicleId: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}
```

**Step 4: Implement service with business logic**
- Check for conflicting reservations
- Validate vehicle availability
- Send notifications

**Step 5: Add controller with guards and Swagger decorators**

**Step 6: Generate and run migration** for the new table

**Step 7: Register module** in `AppModule`

**Step 8: Test** with Postman collection

The modular architecture means adding a feature doesn't require touching existing modules.

---

### Q40: What is the difference between soft delete and hard delete, and why use soft delete?

**Answer**:

**Hard delete**: `DELETE FROM table WHERE id = $1`  the record is permanently removed from the database.

**Soft delete**: A `deletedAt` timestamp column is added. Instead of deleting, the record is marked: `UPDATE table SET deletedAt = NOW() WHERE id = $1`. The record remains in the database but is excluded from normal queries.

**Why soft delete in this system**:

1. **Historical integrity**: If a driver is deleted, their past trips still reference them. Hard delete would break foreign key constraints or leave orphaned records.

2. **Audit trail**: Audit logs reference users, vehicles, and trips. If those records are hard-deleted, the audit log becomes meaningless.

3. **Recovery**: Accidentally deleted records can be restored by setting `deletedAt = NULL`.

4. **Reporting**: Historical reports (fuel consumption last year, trips per vehicle) need access to all records, including "deleted" ones.

5. **Compliance**: Universities may have data retention requirements. Soft delete preserves data while hiding it from active use.

TypeORM supports soft delete natively with `@DeleteDateColumn()` and `softDelete()` / `restore()` methods. Queries automatically add `WHERE deletedAt IS NULL` when soft delete is enabled on an entity.

---

### Q41: How does the system handle the case where a driver rejects an assigned trip?

**Answer**: When a driver rejects an assigned trip, the system needs to handle the reallocation:

1. Driver calls `PATCH /api/v1/trip-requests/:id/driver-reject` with a reason
2. The trip status reverts to `APPROVED_FOR_ALLOCATION`
3. The current driver assignment is cleared (`driverId = null`)
4. The Deployment Team receives a notification that the driver rejected the trip and reallocation is needed
5. An audit log entry records the rejection with the driver's reason
6. The trip appears back in the Deployment Team's allocation queue

This ensures the trip is not lost  it returns to the allocation stage rather than being cancelled. The Deployment Team can then assign a different available driver.

---

### Q42: How does the system prevent double-booking of vehicles?

**Answer**: Double-booking prevention is enforced at the database and service level:

**Service-level check**: Before allocating a vehicle to a trip, the service queries for any overlapping active trips for that vehicle:

```typescript
const conflictingTrip = await this.tripRepo
  .createQueryBuilder('trip')
  .where('trip.vehicleId = :vehicleId', { vehicleId })
  .andWhere('trip.status IN (:...activeStatuses)', {
    activeStatuses: ['CAR_ALLOCATED', 'READY', 'IN_PROGRESS']
  })
  .andWhere(
    '(trip.departureTime, trip.returnTime) OVERLAPS (:start, :end)',
    { start: newTrip.departureTime, end: newTrip.returnTime }
  )
  .getOne();

if (conflictingTrip) {
  throw new ConflictException('Vehicle is already booked for this time period');
}
```

**Database-level**: The `vehicles.status` column is updated to `IN_USE` when a vehicle is allocated, providing a quick availability check.

**Vehicle availability filter**: The allocation UI only shows vehicles with `status = AVAILABLE`, preventing the Deployment Team from even attempting to allocate an unavailable vehicle.

---

### Q43: What happens to GPS data after a trip is completed?

**Answer**: GPS data is retained in the `gps_locations` table permanently (subject to soft delete policies). After trip completion:

1. **Trip summary**: The total distance is calculated from all GPS points and stored in `trip_requests.totalDistance`.
2. **Fuel cost**: The estimated fuel cost is finalized and stored in `trip_requests.estimatedFuelCost`.
3. **Historical tracking**: The complete GPS track can be replayed for any completed trip  useful for dispute resolution or route analysis.
4. **Reporting**: GPS data feeds into fuel consumption reports and vehicle utilization analytics.
5. **Archival**: For very old trips, GPS data could be archived to cold storage (e.g., AWS S3) to keep the active database lean. This is a future improvement.

The `gps_locations` table will grow fastest of all tables (one row per 5 seconds per active trip). For a fleet of 20 vehicles with 8-hour trips, that's ~115,000 rows per day. Partitioning by month and archiving data older than 1 year would be the recommended scaling strategy.

---

### Q44: How is the system's API versioned and why?

**Answer**: All API endpoints are prefixed with `/api/v1/`. This is URL-based versioning, the most common approach for REST APIs.

**Why versioning matters**:
- The mobile apps (Flutter) are installed on users' phones and may not be updated immediately when the backend changes.
- If the API changes (e.g., a field is renamed or removed), old app versions would break.
- With versioning, `/api/v1/` remains stable while `/api/v2/` introduces breaking changes.
- Old clients continue using v1 while new clients use v2.
- Eventually, v1 can be deprecated and removed after all clients have migrated.

**NestJS versioning**:
```typescript
// In main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

This allows controllers to be decorated with `@Version('2')` for v2 endpoints while v1 endpoints remain unchanged.

---

### Q45: What monitoring and observability does the system have?

**Answer**: The current system has basic observability:

1. **PM2 monitoring**: `pm2 monit` shows real-time CPU, memory, and request rates per process. `pm2 logs` shows application logs.

2. **Application logs**: NestJS's built-in logger writes structured logs to stdout/stderr, captured by PM2 to log files.

3. **Audit logs**: The `audit_logs` table provides a complete history of all user actions.

4. **Error handling**: The global `HttpExceptionFilter` catches all unhandled exceptions and logs them with stack traces.

**Future improvements**:
- **Structured logging**: Use Winston or Pino for JSON-formatted logs that can be ingested by log aggregation tools (ELK Stack, Grafana Loki).
- **Metrics**: Add Prometheus metrics (request count, response time, error rate) with a Grafana dashboard.
- **Health checks**: Add `/health` endpoint for uptime monitoring (NestJS Terminus module).
- **Alerting**: Configure alerts for high error rates, slow responses, or server resource exhaustion.

---

*End of Q&A Section*

---

## Summary

The Fleet Management System for Haramaya University is a comprehensive, production-ready platform that successfully digitizes the university's vehicle fleet operations. It demonstrates:

- **Modern architecture**: 3-tier with clear separation of concerns
- **Security best practices**: JWT, bcrypt, RBAC, rate limiting, input validation
- **Real-time capabilities**: WebSocket GPS tracking with geofence detection
- **Mobile-first field operations**: Flutter apps for drivers and gate security
- **Data integrity**: Normalized PostgreSQL schema with ACID transactions
- **Operational readiness**: PM2 process management, audit logging, Cloudflare Tunnel
- **Extensibility**: Modular NestJS architecture makes adding features straightforward

The system replaces a manual, paper-based process with a transparent, accountable, and efficient digital workflow that serves all stakeholders in the university's fleet management chain.

---

*Document prepared for project defense  Haramaya University, Department of Computer Science*
*Fleet Management System  Full-Stack Web & Mobile Application*
