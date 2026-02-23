# Complete Trip Request Workflow - Step by Step Guide

## 🎯 Goal
Create and complete a full trip request from registration to trip completion.

## 📋 Prerequisites
- Server running at `http://localhost:3000`
- Swagger UI at `http://localhost:3000/api/docs`

---

## 🚀 Step-by-Step Workflow

### Step 1: Register Users (Create All Required Roles)

#### 1.1 Register Developer (First User - Can Create Others)
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Admin Developer",
  "email": "admin@school.edu",
  "password": "Admin@123",
  "role": "Developer"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": "dev-uuid",
    "name": "Admin Developer",
    "email": "admin@school.edu",
    "role": "Developer"
  }
}
```

#### 1.2 Login as Developer
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@school.edu",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "dev-uuid",
    "name": "Admin Developer",
    "email": "admin@school.edu",
    "role": "Developer"
  }
}
```

**💡 Save the `access_token` - you'll need it for all subsequent requests!**

---

### Step 2: Create Organization Structure

#### 2.1 Create College
```bash
POST http://localhost:3000/api/v1/colleges
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "College of Engineering",
  "code": "COE",
  "description": "Engineering college"
}
```

**Response:**
```json
{
  "id": "college-uuid",
  "name": "College of Engineering",
  "code": "COE",
  "description": "Engineering college"
}
```

#### 2.2 Create Department
```bash
POST http://localhost:3000/api/v1/departments
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Computer Science",
  "code": "CS",
  "collegeId": "college-uuid",
  "description": "CS Department"
}
```

**Response:**
```json
{
  "id": "dept-uuid",
  "name": "Computer Science",
  "code": "CS",
  "collegeId": "college-uuid"
}
```

---

### Step 3: Create Users for Each Role

#### 3.1 Create Department Head
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "John Department Head",
  "email": "dept.head@school.edu",
  "password": "DeptHead@123",
  "role": "DepartmentHead",
  "departmentId": "dept-uuid",
  "collegeId": "college-uuid"
}
```

#### 3.2 Create College Head
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Jane College Head",
  "email": "college.head@school.edu",
  "password": "CollegeHead@123",
  "role": "CollegeHead",
  "collegeId": "college-uuid"
}
```

#### 3.3 Create Dean
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Dr. Dean",
  "email": "dean@school.edu",
  "password": "Dean@123",
  "role": "Dean"
}
```

#### 3.4 Create Deployment Team Member
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Bob Deployment",
  "email": "deployment@school.edu",
  "password": "Deploy@123",
  "role": "DeploymentTeam"
}
```

#### 3.5 Create Transport Office Member
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Alice Transport",
  "email": "transport@school.edu",
  "password": "Transport@123",
  "role": "TransportOffice"
}
```

#### 3.6 Create Driver
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Mike Driver",
  "email": "driver@school.edu",
  "password": "Driver@123",
  "role": "Driver"
}
```

#### 3.7 Create Regular User (Trip Requester)
```bash
POST http://localhost:3000/api/v1/users
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "name": "Sarah User",
  "email": "user@school.edu",
  "password": "User@123",
  "role": "User",
  "departmentId": "dept-uuid",
  "collegeId": "college-uuid"
}
```

---

### Step 4: Create Vehicle

```bash
POST http://localhost:3000/api/v1/vehicles
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "plateNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Hiace",
  "year": 2022,
  "capacity": 15,
  "fuelType": "Diesel",
  "currentMileage": 50000,
  "color": "White"
}
```

**Response:**
```json
{
  "id": "vehicle-uuid",
  "plateNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Hiace",
  "status": "Active"
}
```

---

### Step 5: Create Driver Profile

```bash
POST http://localhost:3000/api/v1/drivers
Authorization: Bearer <dev-access-token>
Content-Type: application/json

{
  "userId": "driver-user-uuid",
  "licenseNumber": "DL123456",
  "licenseExpiry": "2026-12-31",
  "phoneNumber": "+251911234567",
  "address": "Addis Ababa, Ethiopia",
  "emergencyContact": "+251922345678",
  "emergencyContactName": "Emergency Contact"
}
```

**Response:**
```json
{
  "id": "driver-uuid",
  "licenseNumber": "DL123456",
  "status": "Available",
  "rating": 0
}
```

---

### Step 6: Login as Regular User (Trip Requester)

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@school.edu",
  "password": "User@123"
}
```

**Response:**
```json
{
  "access_token": "user-token...",
  "user": {
    "id": "user-uuid",
    "name": "Sarah User",
    "role": "User"
  }
}
```

**💡 Save this token as `user-token`**

---

### Step 7: Create Trip Request (as User)

```bash
POST http://localhost:3000/api/v1/trips
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "tripType": "Normal",
  "purpose": "Academic conference attendance",
  "destination": "City Convention Center",
  "startDateTime": "2026-03-01T09:00:00Z",
  "endDateTime": "2026-03-01T17:00:00Z",
  "passengerCount": 5
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "tripType": "Normal",
  "purpose": "Academic conference attendance",
  "state": "DRAFT",
  "createdAt": "2026-02-24T..."
}
```

**💡 Save the `trip-uuid`**

---

### Step 8: Submit Trip Request (as User)

```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/submit
Authorization: Bearer <user-token>
Content-Type: application/json
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "PENDING_DEPARTMENT",
  "message": "Trip submitted for department approval",
  "timeoutAt": "2026-02-26T..."
}
```

**✅ Trip is now waiting for Department Head approval**

---

### Step 9: Approve at Department Level

#### 9.1 Login as Department Head
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "dept.head@school.edu",
  "password": "DeptHead@123"
}
```

**💡 Save token as `dept-token`**

#### 9.2 View Pending Approvals
```bash
GET http://localhost:3000/api/v1/trips/pending/approvals
Authorization: Bearer <dept-token>
```

#### 9.3 Approve Trip
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/approve
Authorization: Bearer <dept-token>
Content-Type: application/json

{
  "comments": "Approved for academic purposes"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "PENDING_COLLEGE",
  "message": "Trip approved by Department Head"
}
```

**✅ Trip moves to College Head approval**

---

### Step 10: Approve at College Level

#### 10.1 Login as College Head
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "college.head@school.edu",
  "password": "CollegeHead@123"
}
```

**💡 Save token as `college-token`**

#### 10.2 Approve Trip
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/approve
Authorization: Bearer <college-token>
Content-Type: application/json

{
  "comments": "College approved"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "PENDING_DEAN",
  "message": "Trip approved by College Head"
}
```

**✅ Trip moves to Dean approval**

---

### Step 11: Approve at Dean Level

#### 11.1 Login as Dean
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "dean@school.edu",
  "password": "Dean@123"
}
```

**💡 Save token as `dean-token`**

#### 11.2 Approve Trip
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/approve
Authorization: Bearer <dean-token>
Content-Type: application/json

{
  "comments": "Final approval granted"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "APPROVED_FOR_ALLOCATION",
  "message": "Trip approved by Dean"
}
```

**✅ Trip is now ready for vehicle/driver allocation**

---

### Step 12: Allocate Vehicle and Driver

#### 12.1 Login as Deployment Team
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "deployment@school.edu",
  "password": "Deploy@123"
}
```

**💡 Save token as `deploy-token`**

#### 12.2 Check Available Vehicles
```bash
GET http://localhost:3000/api/v1/vehicles/available?startDate=2026-03-01T09:00:00Z&endDate=2026-03-01T17:00:00Z
Authorization: Bearer <deploy-token>
```

#### 12.3 Check Available Drivers
```bash
GET http://localhost:3000/api/v1/drivers/available?startDate=2026-03-01T09:00:00Z&endDate=2026-03-01T17:00:00Z
Authorization: Bearer <deploy-token>
```

#### 12.4 Allocate Resources
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/allocate
Authorization: Bearer <deploy-token>
Content-Type: application/json

{
  "vehicleId": "vehicle-uuid",
  "driverId": "driver-uuid"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "CAR_ALLOCATED",
  "vehicleId": "vehicle-uuid",
  "driverId": "driver-uuid",
  "message": "Vehicle and driver allocated"
}
```

**✅ Vehicle and driver assigned**

---

### Step 13: Transport Office Confirmation

#### 13.1 Login as Transport Office
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "transport@school.edu",
  "password": "Transport@123"
}
```

**💡 Save token as `transport-token`**

#### 13.2 Confirm Transport
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/confirm-transport
Authorization: Bearer <transport-token>
Content-Type: application/json

{
  "fuelProvided": true,
  "fuelAmount": 50,
  "notes": "Vehicle fueled and ready"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "READY",
  "message": "Transport confirmed, ready for trip"
}
```

**✅ Trip is ready to start**

---

### Step 14: Start Trip (Driver)

#### 14.1 Login as Driver
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "driver@school.edu",
  "password": "Driver@123"
}
```

**💡 Save token as `driver-token`**

#### 14.2 Start Trip (with Plate Validation)
```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/start
Authorization: Bearer <driver-token>
Content-Type: application/json

{
  "scannedPlateNumber": "ABC-1234",
  "startMileage": 50000
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "IN_PROGRESS",
  "startedAt": "2026-03-01T09:00:00Z",
  "message": "Trip started successfully"
}
```

**✅ Trip is now in progress**

---

### Step 15: Complete Trip (Driver)

```bash
POST http://localhost:3000/api/v1/trips/trip-uuid/complete
Authorization: Bearer <driver-token>
Content-Type: application/json

{
  "endMileage": 50150,
  "fuelUsed": 15,
  "notes": "Trip completed successfully, no issues"
}
```

**Response:**
```json
{
  "id": "trip-uuid",
  "state": "COMPLETED",
  "completedAt": "2026-03-01T17:00:00Z",
  "totalDistance": 150,
  "fuelUsed": 15,
  "message": "Trip completed successfully"
}
```

**✅ Trip completed! Vehicle mileage and driver stats automatically updated**

---

## 📊 Verify Results

### Check Trip Statistics
```bash
GET http://localhost:3000/api/v1/trips/statistics/overview
Authorization: Bearer <any-token>
```

### Check Vehicle Status
```bash
GET http://localhost:3000/api/v1/vehicles/vehicle-uuid
Authorization: Bearer <any-token>
```

### Check Driver Stats
```bash
GET http://localhost:3000/api/v1/drivers/driver-uuid
Authorization: Bearer <any-token>
```

### Check Audit Logs
```bash
GET http://localhost:3000/api/v1/audit?entityType=Trip&entityId=trip-uuid
Authorization: Bearer <any-token>
```

### Check Notifications
```bash
GET http://localhost:3000/api/v1/notifications
Authorization: Bearer <user-token>
```

---

## 🎯 Summary of States

1. **DRAFT** → User creates trip
2. **PENDING_DEPARTMENT** → User submits trip
3. **PENDING_COLLEGE** → Department Head approves
4. **PENDING_DEAN** → College Head approves
5. **APPROVED_FOR_ALLOCATION** → Dean approves
6. **CAR_ALLOCATED** → Deployment Team allocates
7. **READY** → Transport Office confirms
8. **IN_PROGRESS** → Driver starts trip
9. **COMPLETED** → Driver completes trip

---

## 🔑 Quick Reference - All Tokens Needed

```
Developer Token: <dev-access-token>
User Token: <user-token>
Department Head Token: <dept-token>
College Head Token: <college-token>
Dean Token: <dean-token>
Deployment Token: <deploy-token>
Transport Token: <transport-token>
Driver Token: <driver-token>
```

---

## ⚠️ Important Notes

1. **48-Hour Rule**: Trip must be submitted at least 48 hours before start time
2. **Timeout**: Each approval level has 48 hours to approve (auto-rejects after)
3. **Plate Validation**: Scanned plate must match allocated vehicle
4. **Mileage**: End mileage must be greater than start mileage
5. **Notifications**: All stakeholders receive notifications at each step

---

## 🚨 Common Errors

### "Trip must be submitted at least 48 hours in advance"
- Solution: Use a `startDateTime` that's more than 48 hours from now

### "Unauthorized"
- Solution: Make sure you're using the correct token for the role

### "Insufficient permissions"
- Solution: Check that the user has the right role for the action

### "Vehicle not available"
- Solution: Check vehicle status and existing allocations

### "Plate number mismatch"
- Solution: Ensure scanned plate matches allocated vehicle exactly

---

**🎉 Congratulations! You've completed a full trip workflow!**
