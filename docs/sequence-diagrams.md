# Fleet Management System — Sequence Diagrams

## Overview

Five sequence diagrams covering the key interactions in the system.

---

## 1. User Authentication (Login)

```plantuml
@startuml SD_Login

skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "User" as U
participant "Login Page\n(Frontend)" as FE
participant "Next.js API\n/api/auth/set-cookie" as API
participant "Backend\n/auth/login" as BE
database "Database" as DB
participant "Middleware" as MW

U -> FE : Enter email & password
FE -> BE : POST /auth/login\n{email, password}
BE -> DB : Find user by email
DB --> BE : User record
BE -> BE : Validate password (bcrypt)
alt Valid credentials
  BE --> FE : 200 OK\n{access_token, refresh_token, user}
  FE -> API : POST /api/auth/set-cookie\n{token, user, rememberMe}
  API --> FE : Set-Cookie: accessToken\nSet-Cookie: user
  FE -> FE : Store token in localStorage
  FE -> U : Redirect to role dashboard
else Invalid credentials
  BE --> FE : 401 Unauthorized\n{message: "No account found..."}
  FE -> U : Show error message
end

note over MW : On every protected route request:\nMiddleware reads accessToken cookie\nand validates role prefix

@enduml
```

---

## 2. Trip Request & Multi-Level Approval Flow

```plantuml
@startuml SD_TripApproval

skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Employee" as EMP
actor "Dept Head" as DEPT
actor "Dean" as DEAN
actor "President" as PRES
participant "Frontend" as FE
participant "Backend API" as BE
database "Database" as DB
participant "Notification\nService" as NS

EMP -> FE : Fill trip request form
FE -> BE : POST /trips\n{destination, purpose, dates...}
BE -> DB : Create trip (state: DRAFT)
DB --> BE : Trip created
FE -> BE : POST /trips/:id/submit
BE -> DB : Update state → PENDING_DEPARTMENT
BE -> NS : notifyTripSubmitted()
NS -> DEPT : Push notification\n"New trip request"

DEPT -> FE : View pending approvals
FE -> BE : GET /trips
BE -> DB : Fetch PENDING_DEPARTMENT trips
DB --> BE : Trip list
BE --> FE : Trip list
DEPT -> FE : Click Approve
FE -> BE : POST /trips/:id/approve
BE -> DB : Update state → PENDING_COLLEGE
BE -> NS : notifyTripApproved()
NS -> DEAN : Push notification\n"Trip needs your approval"

DEAN -> FE : View & Approve
FE -> BE : POST /trips/:id/approve
BE -> DB : Update state → PENDING_PRESIDENT
BE -> NS : notifyTripApproved()
NS -> PRES : Push notification\n"Final approval needed"

PRES -> FE : View & Approve (Final)
FE -> BE : POST /trips/:id/approve
BE -> DB : Update state → APPROVED_FOR_ALLOCATION
BE -> NS : notifyTripApproved()
NS -> EMP : Push notification\n"Trip approved!"

@enduml
```

---

## 3. Vehicle & Driver Allocation

```plantuml
@startuml SD_Allocation

skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Deployment\nOffice" as DEPLOY
actor "Transport\nAdmin" as TRANS
actor "Driver" as DRV
participant "Frontend" as FE
participant "Backend API" as BE
database "Database" as DB
participant "Notification\nService" as NS

DEPLOY -> FE : View approved trips
FE -> BE : GET /trips (APPROVED_FOR_ALLOCATION)
BE -> DB : Fetch approved trips
DB --> BE : Trip list
BE --> FE : Trip list

DEPLOY -> FE : Select vehicle & driver
FE -> BE : POST /trips/:id/allocate\n{vehicleId, driverId,\nestimatedFuelCost, estimatedDistance}
BE -> DB : Update trip state → CAR_ALLOCATED\nLink vehicle & driver
BE -> NS : notifyTripAllocated()
NS -> TRANS : Notification\n"Allocation needs confirmation"

TRANS -> FE : View pending approvals
FE -> BE : GET /trips (CAR_ALLOCATED)
BE --> FE : Trip list with allocation details
TRANS -> FE : Confirm allocation
FE -> BE : POST /trips/:id/confirm-transport\n{fuelApproved: true, estimatedFuelCost, estimatedDistance}
BE -> DB : Update state → READY
BE -> NS : notifyTripReady()
NS -> DRV : Notification\n"Trip assigned to you"

DRV -> FE : View assigned trip (READY state)
DRV -> FE : Accept & Show QR
FE -> FE : Generate QR code\n{tripId, action: GATE_START}

@enduml
```

---

## 4. GPS Tracking & Live Monitoring

```plantuml
@startuml SD_GPSTracking

skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Gate Keeper" as GATE
actor "Driver" as DRV
actor "Transport\nAdmin" as TRANS
participant "Driver App\n(Frontend)" as DFE
participant "Transport App\n(Frontend)" as TFE
participant "Backend API" as BE
participant "WebSocket\nGateway" as WS
database "Database" as DB

GATE -> BE : POST /trips/:id/scan-qr\n{action: GATE_START}
BE -> DB : Update state → IN_PROGRESS
BE -> WS : broadcastLocationUpdate()
WS -> TFE : emit('vehicle-location')
TFE -> TRANS : Map updates with vehicle position

loop Every 4 seconds (GPS active)
  DFE -> DFE : navigator.geolocation.watchPosition()
  alt Online
    DFE -> BE : POST /tracking/:tripId/location\n{latitude, longitude, speed, heading}
    BE -> DB : Save GPS point
    BE -> BE : enrichLocationForBroadcast()\nCalculate fuel & distance stats
    BE -> WS : broadcastLocationUpdate(enriched)
    WS -> TFE : emit('vehicle-location')\n{lat, lng, speed, traveledKm,\nfuelRemaining, actualFuelCost}
    TFE -> TRANS : Vehicle icon moves on map\nStats update in real-time
  else Offline
    DFE -> DFE : Queue GPS point\nin localStorage
    note right : Points queued offline\nflushed when reconnected
  end
end

note over DFE, BE : Geofence check on every location update\nIf VIP vehicle enters restricted zone:\nEngine shutdown simulated + notification sent

@enduml
```

---

## 5. Trip Completion & Feedback

```plantuml
@startuml SD_Completion

skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Employee" as EMP
actor "Driver" as DRV
actor "Gate Keeper" as GATE
actor "Transport\nAdmin" as TRANS
participant "Frontend" as FE
participant "Backend API" as BE
database "Database" as DB
participant "Notification\nService" as NS

EMP -> FE : Click "Mark Trip Complete"
FE -> BE : POST /trips/:id/complete\n{actualDistance, actualFuelCost}
BE -> DB : Update state → PENDING_RETURN
BE -> NS : Notify driver\n"Passenger arrived — return to campus"
NS -> DRV : Push notification

DRV -> FE : View PENDING_RETURN status
FE -> FE : Show Return QR Code\n{tripId, action: GATE_RETURN}

DRV -> GATE : Show Return QR
GATE -> BE : POST /trips/:id/scan-qr\n{action: GATE_RETURN}
BE -> DB : Update state → COMPLETED\nRelease vehicle & driver
BE -> NS : notifyTripCompleted()
NS -> EMP : Notification\n"Trip completed!"
NS -> TRANS : Notification\n"Trip completed — view report"

EMP -> FE : Submit feedback form
FE -> BE : POST /trips/:id/feedback\n{overallRating, driverRating,\nvehicleRating, comments}
BE -> DB : Save feedback
BE -> NS : notifyFeedbackSubmitted()
NS -> TRANS : Notification\n"New feedback received"

TRANS -> FE : View feedback dashboard
FE -> BE : GET /trips/feedback/statistics
BE -> DB : Aggregate ratings
DB --> BE : Statistics
BE --> FE : {averageRatings, totalFeedbacks,\nrecommendationRate}
FE -> TRANS : Display feedback analytics

@enduml
```

---

## Summary Table

| # | Diagram | Actors Involved | Key Message |
|---|---|---|---|
| 1 | Authentication | User, Frontend, Backend, DB | JWT-based login with cookie persistence |
| 2 | Trip Approval | Employee, Dept Head, Dean, President | 4-level approval chain with notifications |
| 3 | Allocation | Deployment Office, Transport Admin, Driver | Vehicle+driver assignment and confirmation |
| 4 | GPS Tracking | Driver, Transport Admin, Gate Keeper | Real-time WebSocket tracking with offline queue |
| 5 | Completion | Employee, Driver, Gate Keeper, Transport Admin | QR-based gate scan + feedback loop |
