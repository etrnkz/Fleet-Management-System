# API Contracts - Fleet Management System

## Base URL
```
Production: https://api.fleet.school.edu
Development: http://localhost:3000
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT token in header:
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
```http
POST /auth/register
```

**Request Body**:
```json
{
  "email": "user@school.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "User",
  "departmentId": "uuid",
  "collegeId": "uuid"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "email": "user@school.edu",
  "firstName": "John",
  "lastName": "Doe",
  "role": "User",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 1.2 Login
```http
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@school.edu",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@school.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User"
  }
}
```

### 1.3 Refresh Token
```http
POST /auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### 1.4 Logout
```http
POST /auth/logout
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Trip Request Endpoints

### 2.1 Create Trip Request
```http
POST /trips
```

**Request Body**:
```json
{
  "tripType": "Normal",
  "purpose": "Academic conference attendance",
  "destination": "City Convention Center",
  "startDateTime": "2024-01-20T09:00:00Z",
  "endDateTime": "2024-01-20T17:00:00Z",
  "passengerCount": 5
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "requestNumber": "TR-2024-0001",
  "tripType": "Normal",
  "purpose": "Academic conference attendance",
  "destination": "City Convention Center",
  "startDateTime": "2024-01-20T09:00:00Z",
  "endDateTime": "2024-01-20T17:00:00Z",
  "passengerCount": 5,
  "state": "DRAFT",
  "requester": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 2.2 Submit Trip Request
```http
POST /trips/:id/submit
```

**Response** (200):
```json
{
  "id": "uuid",
  "requestNumber": "TR-2024-0001",
  "state": "PENDING_DEPARTMENT",
  "currentApprovalLevel": "Department",
  "approvals": [
    {
      "id": "uuid",
      "approvalLevel": "Department",
      "status": "Pending",
      "dueDate": "2024-01-17T10:00:00Z"
    }
  ]
}
```

### 2.3 Get Trip Requests (List)
```http
GET /trips?page=1&limit=20&state=PENDING_DEPARTMENT&tripType=Normal
```

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `state`: TripState enum
- `tripType`: TripType enum
- `startDate`: ISO date
- `endDate`: ISO date

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "requestNumber": "TR-2024-0001",
      "tripType": "Normal",
      "destination": "City Convention Center",
      "startDateTime": "2024-01-20T09:00:00Z",
      "state": "PENDING_DEPARTMENT",
      "requester": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2.4 Get Trip Request Details
```http
GET /trips/:id
```

**Response** (200):
```json
{
  "id": "uuid",
  "requestNumber": "TR-2024-0001",
  "tripType": "Normal",
  "purpose": "Academic conference attendance",
  "destination": "City Convention Center",
  "startDateTime": "2024-01-20T09:00:00Z",
  "endDateTime": "2024-01-20T17:00:00Z",
  "passengerCount": 5,
  "state": "PENDING_COLLEGE",
  "currentApprovalLevel": "College",
  "requester": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@school.edu",
    "department": {
      "name": "Computer Science"
    }
  },
  "approvals": [
    {
      "id": "uuid",
      "approvalLevel": "Department",
      "status": "Approved",
      "approver": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "comments": "Approved for conference",
      "approvedAt": "2024-01-16T14:30:00Z"
    },
    {
      "id": "uuid",
      "approvalLevel": "College",
      "status": "Pending",
      "dueDate": "2024-01-18T14:30:00Z"
    }
  ],
  "allocatedVehicle": null,
  "allocatedDriver": null,
  "estimatedFuelCost": 50.00,
  "estimatedDistance": 45.5,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-16T14:30:00Z"
}
```

### 2.5 Update Trip Request (Draft Only)
```http
PATCH /trips/:id
```

**Request Body**:
```json
{
  "purpose": "Updated purpose",
  "passengerCount": 6
}
```

**Response** (200): Same as Get Trip Details

### 2.6 Approve Trip Request
```http
POST /trips/:id/approve
```

**Request Body**:
```json
{
  "comments": "Approved for academic purposes"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "requestNumber": "TR-2024-0001",
  "state": "PENDING_COLLEGE",
  "currentApprovalLevel": "College",
  "approval": {
    "id": "uuid",
    "approvalLevel": "Department",
    "status": "Approved",
    "comments": "Approved for academic purposes",
    "approvedAt": "2024-01-16T14:30:00Z"
  }
}
```

### 2.7 Reject Trip Request
```http
POST /trips/:id/reject
```

**Request Body**:
```json
{
  "reason": "Insufficient justification for trip"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "requestNumber": "TR-2024-0001",
  "state": "REJECTED",
  "rejectionReason": "Insufficient justification for trip",
  "rejectedBy": {
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "rejectedAt": "2024-01-16T14:30:00Z"
}
```

### 2.8 Allocate Vehicle and Driver
```http
POST /trips/:id/allocate
```

**Roles**: DeploymentTeam

**Request Body**:
```json
{
  "vehicleId": "uuid",
  "driverId": "uuid",
  "estimatedFuelCost": 50.00,
  "estimatedDistance": 45.5
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "state": "CAR_ALLOCATED",
  "allocatedVehicle": {
    "id": "uuid",
    "plateNumber": "ABC-1234",
    "make": "Toyota",
    "model": "Hiace"
  },
  "allocatedDriver": {
    "id": "uuid",
    "user": {
      "firstName": "Mike",
      "lastName": "Driver"
    },
    "licenseNumber": "DL-123456"
  }
}
```

### 2.9 Transport Office Confirmation
```http
POST /trips/:id/confirm-transport
```

**Roles**: TransportOffice

**Request Body**:
```json
{
  "fuelApproved": true,
  "comments": "Fuel allocated, ready for dispatch"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "state": "READY",
  "transportOfficer": {
    "firstName": "Sarah",
    "lastName": "Transport"
  }
}
```

### 2.10 Start Trip
```http
POST /trips/:id/start
```

**Request Body**:
```json
{
  "plateNumber": "ABC-1234",
  "scannerValidation": true
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "state": "IN_PROGRESS",
  "startedAt": "2024-01-20T09:05:00Z",
  "gateOpened": true
}
```

### 2.11 Complete Trip
```http
POST /trips/:id/complete
```

**Request Body**:
```json
{
  "actualDistance": 48.2,
  "actualFuelCost": 52.50,
  "finalMileage": 125480,
  "notes": "Trip completed successfully"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "state": "COMPLETED",
  "completedAt": "2024-01-20T17:15:00Z",
  "actualDistance": 48.2,
  "actualFuelCost": 52.50,
  "journeyStats": {
    "duration": "8h 10m",
    "averageSpeed": 35.5,
    "fuelEfficiency": 10.2
  }
}
```

### 2.12 Cancel Trip
```http
POST /trips/:id/cancel
```

**Request Body**:
```json
{
  "reason": "Event postponed"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "state": "CANCELLED",
  "cancellationReason": "Event postponed"
}
```

---

## 3. Vehicle Endpoints

### 3.1 Create Vehicle
```http
POST /vehicles
```

**Roles**: TransportOffice, DeploymentTeam

**Request Body**:
```json
{
  "plateNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Hiace",
  "year": 2022,
  "capacity": 15,
  "fuelType": "Diesel",
  "currentMileage": 125000
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "plateNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Hiace",
  "year": 2022,
  "capacity": 15,
  "fuelType": "Diesel",
  "status": "Active",
  "currentMileage": 125000,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 3.2 Get Available Vehicles
```http
GET /vehicles/available?startDateTime=2024-01-20T09:00:00Z&endDateTime=2024-01-20T17:00:00Z&capacity=5
```

**Query Parameters**:
- `startDateTime`: ISO datetime (required)
- `endDateTime`: ISO datetime (required)
- `capacity`: number (optional)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "plateNumber": "ABC-1234",
      "make": "Toyota",
      "model": "Hiace",
      "capacity": 15,
      "fuelType": "Diesel",
      "status": "Active",
      "currentMileage": 125000
    }
  ]
}
```

### 3.3 List Vehicles
```http
GET /vehicles?page=1&limit=20&status=Active
```

**Response** (200):
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### 3.4 Update Vehicle
```http
PATCH /vehicles/:id
```

**Request Body**:
```json
{
  "status": "UnderMaintenance",
  "currentMileage": 125500
}
```

**Response** (200): Vehicle object

---

## 4. Driver Endpoints

### 4.1 Create Driver
```http
POST /drivers
```

**Request Body**:
```json
{
  "userId": "uuid",
  "licenseNumber": "DL-123456",
  "licenseExpiry": "2026-12-31",
  "experienceYears": 10
}
```

**Response** (201): Driver object

### 4.2 List Drivers
```http
GET /drivers?status=Available
```

**Response** (200): Paginated driver list

### 4.3 Update Driver
```http
PATCH /drivers/:id
```

**Request Body**:
```json
{
  "status": "OnLeave"
}
```

**Response** (200): Driver object

---

## 5. Maintenance Endpoints

### 5.1 Submit Maintenance Request
```http
POST /maintenance
```

**Roles**: Driver

**Request Body**:
```json
{
  "vehicleId": "uuid",
  "issueDescription": "Engine making unusual noise",
  "priority": "High"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "requestNumber": "MR-2024-0001",
  "vehicle": {
    "plateNumber": "ABC-1234"
  },
  "issueDescription": "Engine making unusual noise",
  "priority": "High",
  "status": "Submitted",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 5.2 Add Inspection
```http
POST /maintenance/:id/inspect
```

**Roles**: MaintenanceTeam

**Request Body**:
```json
{
  "inspectionNotes": "Requires timing belt replacement",
  "estimatedCost": 500.00
}
```

**Response** (200): Maintenance request object with status "EstimateProvided"

### 5.3 Approve Budget
```http
POST /maintenance/:id/approve-budget
```

**Roles**: TransportOffice

**Response** (200): Maintenance request object with status "BudgetApproved"

### 5.4 Complete Maintenance
```http
POST /maintenance/:id/complete
```

**Request Body**:
```json
{
  "actualCost": 520.00,
  "completionNotes": "Timing belt replaced successfully"
}
```

**Response** (200): Maintenance request object with status "Completed"

---

## 6. Tracking Endpoints (WebSocket)

### 6.1 Connect to Tracking
```javascript
const socket = io('ws://server/tracking', {
  auth: { token: 'jwt_token' }
});
```

### 6.2 Send Location Update
```javascript
socket.emit('location-update', {
  tripId: 'uuid',
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 45.5,
  heading: 180,
  accuracy: 10,
  timestamp: '2024-01-20T10:30:00Z'
});
```

### 6.3 Subscribe to Trip Tracking
```javascript
socket.emit('subscribe-trip', { tripId: 'uuid' });

socket.on('location-updated', (data) => {
  console.log(data);
  // { tripId, latitude, longitude, speed, heading, timestamp }
});
```

### 6.4 Sync Offline Data
```http
POST /tracking/sync
```

**Request Body**:
```json
{
  "tripId": "uuid",
  "locations": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "speed": 45.5,
      "heading": 180,
      "accuracy": 10,
      "timestamp": "2024-01-20T10:30:00Z"
    }
  ]
}
```

**Response** (200):
```json
{
  "synced": 15,
  "message": "Offline data synced successfully"
}
```

---

## 7. Report Endpoints

### 7.1 Fuel Consumption Report
```http
GET /reports/fuel?startDate=2024-01-01&endDate=2024-01-31&vehicleId=uuid
```

**Response** (200):
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "totalCost": 5250.00,
  "totalQuantity": 1050.5,
  "averageCostPerTrip": 175.00,
  "byVehicle": [
    {
      "vehicle": {
        "plateNumber": "ABC-1234"
      },
      "totalCost": 1250.00,
      "totalQuantity": 250.5,
      "tripCount": 8,
      "efficiency": 12.5
    }
  ]
}
```

### 7.2 Trip Statistics Report
```http
GET /reports/trips?startDate=2024-01-01&endDate=2024-01-31
```

**Response** (200):
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "totalTrips": 125,
  "completedTrips": 118,
  "cancelledTrips": 5,
  "rejectedTrips": 2,
  "totalDistance": 5680.5,
  "totalCost": 8950.00,
  "averageApprovalTime": "36h",
  "byDepartment": [...],
  "byTripType": {
    "Normal": 115,
    "VIP": 10
  }
}
```

### 7.3 Driver Performance Report
```http
GET /reports/driver-performance?driverId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

**Response** (200):
```json
{
  "driver": {
    "name": "Mike Driver",
    "licenseNumber": "DL-123456"
  },
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "totalTrips": 25,
  "totalDistance": 1250.5,
  "totalHours": 125.5,
  "averageRating": 4.8,
  "fuelEfficiency": 11.2,
  "maintenanceRequests": 2,
  "incidents": 0
}
```

---

## 8. Notification Endpoints

### 8.1 Get Notifications
```http
GET /notifications?page=1&limit=20&isRead=false
```

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "TripApproved",
      "title": "Trip Request Approved",
      "message": "Your trip request TR-2024-0001 has been approved",
      "data": {
        "tripId": "uuid",
        "requestNumber": "TR-2024-0001"
      },
      "isRead": false,
      "sentAt": "2024-01-16T14:30:00Z"
    }
  ],
  "meta": {...}
}
```

### 8.2 Mark as Read
```http
PATCH /notifications/:id/read
```

**Response** (200): Notification object

---

## Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "startDateTime",
      "message": "Trip must be requested at least 48 hours in advance"
    }
  ],
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/trips"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., vehicle already allocated)
- `422`: Unprocessable Entity (business logic error)
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error
