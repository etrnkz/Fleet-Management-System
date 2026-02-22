# Fleet Management System - Architecture Specification

## System Overview

A production-grade Fleet Management System for school transportation with strict RBAC, workflow automation, real-time GPS tracking, and comprehensive audit trails.

## Core Requirements

### Roles & Permissions
- **User**: Submit trip requests, view own requests
- **Department Head**: Approve/reject department requests
- **College Head**: Approve/reject college requests
- **Dean**: Approve/reject dean-level requests, initiate VIP requests
- **Deployment Team**: Allocate vehicles and drivers
- **Transport Office**: Manage fuel, approve budgets, final confirmation
- **Maintenance Team**: Handle maintenance requests and inspections
- **Driver**: Submit maintenance requests, execute trips
- **Developer**: Super-admin with full system access

### Business Rules

1. **Trip Request Flow**
   - Standard: User → Department → College → Dean → Deployment → Transport → Ready
   - VIP: President → Dean → Deployment → Transport → Ready
   - Minimum 48-hour advance booking
   - 48-hour timeout per approval level with auto-reject
   - Rejection stops flow and notifies user via Web Push

2. **Vehicle Allocation**
   - Only available vehicles (no conflicts, not under maintenance, active, not allocated)
   - Plate validation via scanner before gate opens
   - Real-time GPS tracking with offline buffering

3. **Maintenance Workflow**
   - Driver submits request → Maintenance inspects/estimates → Transport approves budget → Repair

4. **Tracking & Reporting**
   - Full fuel consumption tracking
   - Cost tracking per trip
   - Trip statistics and analytics
   - VIP usage reports
   - Driver performance metrics

## System Architecture

### Technology Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket (Socket.io)
- **Job Scheduling**: Bull Queue with Redis
- **Caching**: Redis
- **Notifications**: Web Push API
- **API Documentation**: Swagger/OpenAPI

### Module Structure

```
src/
├── auth/                    # Authentication & authorization
│   ├── guards/
│   ├── decorators/
│   └── strategies/
├── users/                   # User management
├── roles/                   # Role & permission management
├── trips/                   # Trip request management
│   ├── dto/
│   ├── entities/
│   ├── services/
│   └── controllers/
├── workflow/                # Workflow engine
│   ├── engine/
│   ├── states/
│   └── transitions/
├── vehicles/                # Vehicle management
├── drivers/                 # Driver management
├── maintenance/             # Maintenance management
├── deployment/              # Vehicle allocation
├── transport/               # Transport office operations
├── tracking/                # GPS tracking
│   ├── gateways/
│   └── services/
├── notifications/           # Web Push notifications
├── audit/                   # Audit logging
├── reports/                 # Reporting & analytics
├── scheduler/               # Scheduled jobs
├── integrations/            # External integrations
│   ├── gps/
│   └── scanner/
└── common/                  # Shared utilities
    ├── filters/
    ├── interceptors/
    ├── pipes/
    └── decorators/
```

## Database Schema Design

### Core Entities

#### Users
```typescript
- id: UUID (PK)
- email: string (unique)
- password: string (hashed)
- firstName: string
- lastName: string
- phoneNumber: string
- role: enum (User, DepartmentHead, CollegeHead, Dean, etc.)
- departmentId: UUID (FK, nullable)
- collegeId: UUID (FK, nullable)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

#### Departments
```typescript
- id: UUID (PK)
- name: string
- code: string (unique)
- collegeId: UUID (FK)
- headId: UUID (FK to Users)
- createdAt: timestamp
- updatedAt: timestamp
```

#### Colleges
```typescript
- id: UUID (PK)
- name: string
- code: string (unique)
- headId: UUID (FK to Users)
- createdAt: timestamp
- updatedAt: timestamp
```

#### Vehicles
```typescript
- id: UUID (PK)
- plateNumber: string (unique)
- make: string
- model: string
- year: number
- capacity: number
- fuelType: enum (Petrol, Diesel, Electric)
- status: enum (Active, UnderMaintenance, Inactive)
- currentMileage: number
- lastMaintenanceDate: timestamp
- nextMaintenanceDate: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

#### Drivers
```typescript
- id: UUID (PK)
- userId: UUID (FK to Users)
- licenseNumber: string (unique)
- licenseExpiry: date
- experienceYears: number
- status: enum (Available, OnTrip, OnLeave, Inactive)
- rating: decimal
- createdAt: timestamp
- updatedAt: timestamp
```

#### TripRequests
```typescript
- id: UUID (PK)
- requestNumber: string (unique, auto-generated)
- requesterId: UUID (FK to Users)
- tripType: enum (Normal, VIP)
- purpose: text
- destination: string
- startDateTime: timestamp
- endDateTime: timestamp
- passengerCount: number
- state: enum (DRAFT, SUBMITTED, PENDING_DEPARTMENT, ...)
- currentApprovalLevel: string
- departmentApprovalId: UUID (FK, nullable)
- collegeApprovalId: UUID (FK, nullable)
- deanApprovalId: UUID (FK, nullable)
- allocatedVehicleId: UUID (FK, nullable)
- allocatedDriverId: UUID (FK, nullable)
- deploymentTeamId: UUID (FK, nullable)
- transportOfficerId: UUID (FK, nullable)
- estimatedFuelCost: decimal
- actualFuelCost: decimal (nullable)
- estimatedDistance: decimal
- actualDistance: decimal (nullable)
- rejectionReason: text (nullable)
- rejectedBy: UUID (FK, nullable)
- rejectedAt: timestamp (nullable)
- completedAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp
```

#### Approvals
```typescript
- id: UUID (PK)
- tripRequestId: UUID (FK)
- approverId: UUID (FK to Users)
- approvalLevel: enum (Department, College, Dean, Deployment, Transport)
- status: enum (Pending, Approved, Rejected, AutoRejectedTimeout)
- comments: text (nullable)
- dueDate: timestamp
- approvedAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp
```

#### TripTracking
```typescript
- id: UUID (PK)
- tripRequestId: UUID (FK)
- latitude: decimal
- longitude: decimal
- speed: decimal
- heading: decimal
- accuracy: decimal
- timestamp: timestamp
- isOfflineSync: boolean
- createdAt: timestamp
```

#### MaintenanceRequests
```typescript
- id: UUID (PK)
- requestNumber: string (unique)
- vehicleId: UUID (FK)
- requestedById: UUID (FK to Users, Driver)
- issueDescription: text
- priority: enum (Low, Medium, High, Critical)
- status: enum (Submitted, UnderInspection, EstimateProvided, BudgetApproved, InProgress, Completed, Rejected)
- inspectedById: UUID (FK, nullable)
- inspectionNotes: text (nullable)
- estimatedCost: decimal (nullable)
- actualCost: decimal (nullable)
- approvedById: UUID (FK, nullable)
- completedAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp
```

#### FuelRecords
```typescript
- id: UUID (PK)
- tripRequestId: UUID (FK, nullable)
- vehicleId: UUID (FK)
- fuelType: enum
- quantity: decimal
- costPerUnit: decimal
- totalCost: decimal
- recordedById: UUID (FK to Users)
- recordedAt: timestamp
- createdAt: timestamp
```

#### AuditLogs
```typescript
- id: UUID (PK)
- userId: UUID (FK, nullable)
- entityType: string
- entityId: UUID
- action: enum (Create, Update, Delete, Approve, Reject, etc.)
- oldValue: jsonb (nullable)
- newValue: jsonb (nullable)
- ipAddress: string
- userAgent: string
- timestamp: timestamp
```

#### WorkflowConfigurations
```typescript
- id: UUID (PK)
- name: string
- tripType: enum (Normal, VIP)
- steps: jsonb (workflow definition)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

#### Notifications
```typescript
- id: UUID (PK)
- userId: UUID (FK)
- type: enum (TripApproved, TripRejected, TimeoutWarning, etc.)
- title: string
- message: text
- data: jsonb
- isRead: boolean
- sentAt: timestamp
- createdAt: timestamp
```

## Workflow Engine Design

### State Machine

```typescript
enum TripState {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_DEPARTMENT = 'PENDING_DEPARTMENT',
  PENDING_COLLEGE = 'PENDING_COLLEGE',
  PENDING_DEAN = 'PENDING_DEAN',
  REJECTED = 'REJECTED',
  AUTO_REJECTED_TIMEOUT = 'AUTO_REJECTED_TIMEOUT',
  APPROVED_FOR_ALLOCATION = 'APPROVED_FOR_ALLOCATION',
  CAR_ALLOCATED = 'CAR_ALLOCATED',
  PENDING_TRANSPORT_CONFIRM = 'PENDING_TRANSPORT_CONFIRM',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### Workflow Configuration

```typescript
interface WorkflowStep {
  name: string;
  role: UserRole;
  timeoutHours: number;
  nextStateOnApprove: TripState;
  nextStateOnReject: TripState;
  nextStateOnTimeout: TripState;
  actions: WorkflowAction[];
}

interface WorkflowAction {
  type: 'notification' | 'email' | 'webhook';
  trigger: 'onEnter' | 'onApprove' | 'onReject' | 'onTimeout';
  config: any;
}
```

### Normal Flow
```
DRAFT → SUBMITTED → PENDING_DEPARTMENT (48h) → PENDING_COLLEGE (48h) → 
PENDING_DEAN (48h) → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → 
PENDING_TRANSPORT_CONFIRM → READY → IN_PROGRESS → COMPLETED
```

### VIP Flow
```
DRAFT → SUBMITTED → PENDING_DEAN (48h) → APPROVED_FOR_ALLOCATION → 
CAR_ALLOCATED → PENDING_TRANSPORT_CONFIRM → READY → IN_PROGRESS → COMPLETED
```

## API Design

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Trip Management
- `POST /trips` - Create trip request
- `GET /trips` - List trips (filtered by role)
- `GET /trips/:id` - Get trip details
- `PATCH /trips/:id` - Update trip (draft only)
- `POST /trips/:id/submit` - Submit trip request
- `POST /trips/:id/approve` - Approve trip
- `POST /trips/:id/reject` - Reject trip
- `POST /trips/:id/cancel` - Cancel trip
- `POST /trips/:id/allocate` - Allocate vehicle/driver
- `POST /trips/:id/confirm-transport` - Transport confirmation
- `POST /trips/:id/start` - Start trip (with plate validation)
- `POST /trips/:id/complete` - Complete trip

### Vehicle Management
- `POST /vehicles` - Add vehicle
- `GET /vehicles` - List vehicles
- `GET /vehicles/available` - Get available vehicles (with time range)
- `PATCH /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Deactivate vehicle

### Maintenance
- `POST /maintenance` - Submit maintenance request
- `GET /maintenance` - List maintenance requests
- `POST /maintenance/:id/inspect` - Add inspection
- `POST /maintenance/:id/approve-budget` - Approve budget
- `POST /maintenance/:id/complete` - Complete maintenance

### Tracking (WebSocket)
- `ws://server/tracking` - Real-time GPS tracking
  - Events: `location-update`, `trip-started`, `trip-ended`

### Reports
- `GET /reports/fuel` - Fuel consumption report
- `GET /reports/trips` - Trip statistics
- `GET /reports/maintenance` - Maintenance report
- `GET /reports/vip-usage` - VIP usage report
- `GET /reports/driver-performance` - Driver performance

## Security & Compliance

### Authentication & Authorization
- JWT with access (15min) and refresh tokens (7 days)
- Role-based access control (RBAC) with guards
- Permission-based actions
- Rate limiting per endpoint

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Sensitive data encryption at rest
- HTTPS only in production
- CORS configuration
- Input validation and sanitization

### Audit Trail
- All state changes logged
- User actions tracked
- IP and user agent recorded
- Immutable audit logs

## Integration Interfaces

### GPS Tracking System
```typescript
interface GPSProvider {
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  getLocation(deviceId: string): Promise<Location>;
  subscribeToUpdates(deviceId: string, callback: (location: Location) => void): void;
}
```

### Plate Scanner
```typescript
interface PlateScanner {
  validatePlate(plateNumber: string, tripId: string): Promise<ValidationResult>;
  openGate(gateId: string): Promise<void>;
}
```

## Performance Considerations

- Database indexing on frequently queried fields
- Redis caching for vehicle availability checks
- Connection pooling for database
- WebSocket connection management
- Batch processing for offline GPS sync
- Query optimization with proper joins
- Pagination for list endpoints

## Monitoring & Observability

- Application logging (Winston)
- Error tracking (Sentry)
- Performance monitoring (APM)
- Health check endpoints
- Metrics collection (Prometheus)
- Dashboard (Grafana)

## Deployment Architecture

- Containerized with Docker
- Orchestration with Kubernetes
- Load balancing
- Auto-scaling based on load
- Database replication
- Redis cluster for high availability
- CI/CD pipeline
- Blue-green deployment strategy
