# Fleet Management System — Sequence Diagrams

> Every message, endpoint, state transition, and notification in these diagrams is taken directly from the source code. Nothing is assumed.

---

## 1. Authentication (Login)

**Source:** `auth.service.ts → login()`, `auth.controller.ts`, `api.ts → refreshAccessToken()`

```plantuml
@startuml SD_Login
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "User" as U
participant "Frontend" as FE
participant "Next.js\n/api/auth/set-cookie" as COOKIE
participant "Backend\nPOST /auth/login" as BE
database "PostgreSQL" as DB

U -> FE : Enter email + password\n(+ optional keepMeSignedIn, appType)
FE -> BE : POST /auth/login\n{email, password, keepMeSignedIn?, appType?}
BE -> DB : findByEmail(email.toLowerCase().trim())
DB --> BE : User record
BE -> BE : user.validatePassword(password) [bcrypt]\ncheck user.isActive\ncheck appType role restriction
alt Valid
  BE --> FE : 200 {access_token, refresh_token, user}\n[expiry: 7h default; 45d if keepMeSignedIn=true]
  FE -> COOKIE : POST /api/auth/set-cookie\n{token, user, rememberMe}
  COOKIE --> FE : Set-Cookie: accessToken, user
  FE -> FE : store tokens in localStorage (rememberMe)\nor sessionStorage
  FE -> U : redirect to ROLE_PATHS[user.role]
else Invalid / inactive / wrong portal
  BE --> FE : 401 {message: "Invalid credentials"}
  FE -> U : show error
end

note over FE : On any 401 during a later API call:\n1. POST /auth/refresh {refresh_token}\n2. If ok → retry original request\n3. If fail → logout() → redirect to /?logout=true

@enduml
```

---

## 2. Normal Trip — Full Approval Chain

**Condition:** `tripCategory = STANDARD`, requester role = `User`
**Source:** `trips.service.ts → submit(), approve(), reject()`

```plantuml
@startuml SD_Normal
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Employee\n(User role)" as EMP
actor "Dept Head" as DEPT
actor "Dean" as DEAN
actor "President" as PRES
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

EMP -> FE : fill trip form
FE -> BE : POST /trips\n{destination, purpose, startDateTime,\nendDateTime, passengerCount,\ntripType, tripCategory: "STANDARD"}
note right : startDateTime must be ≥48h from now\nendDateTime must be after startDateTime
BE -> DB : INSERT trip (state=DRAFT)
DB --> BE : saved trip

EMP -> FE : click Submit
FE -> BE : POST /trips/:id/submit
BE -> BE : check at least 1 active vehicle exists
BE -> DB : state → PENDING_DEPARTMENT\nINSERT Approval(level=Department, dueDate=now+48h)\nschedule Bull timeout job
BE --> FE : trip (state=PENDING_DEPARTMENT)
BE -> DEPT : notify "New Trip Approval Required"\n[only the dept head of requester's department]

DEPT -> FE : GET /trips/pending/approvals
FE -> BE : GET /trips/pending/approvals
BE --> FE : trips in PENDING_DEPARTMENT\n[filtered to approver's department]
DEPT -> FE : approve
FE -> BE : POST /trips/:id/approve {comments?}
BE -> DB : Approval → Approved\nstate → PENDING_COLLEGE\nINSERT Approval(level=College, dueDate=now+48h)
BE -> EMP : notify "Trip Request Approved by [name]"
BE -> DEAN : notify "Trip Approval Required - College Level"\n[only dean of requester's college]

DEAN -> FE : GET /trips/pending/approvals
FE -> BE : GET /trips/pending/approvals
BE --> FE : trips in PENDING_COLLEGE\n[filtered to approver's college]
DEAN -> FE : approve
FE -> BE : POST /trips/:id/approve {comments?}
BE -> DB : Approval → Approved\nstate → PENDING_PRESIDENT\nINSERT Approval(level=President, dueDate=now+48h)
BE -> EMP : notify "Trip Request Approved by [name]"
BE -> PRES : notify "Trip Approval Required - Presidential Level"

PRES -> FE : GET /trips/pending/approvals
FE -> BE : GET /trips/pending/approvals
BE --> FE : trips in PENDING_PRESIDENT
PRES -> FE : approve
FE -> BE : POST /trips/:id/approve {comments?}
BE -> DB : Approval → Approved\nstate → APPROVED_FOR_ALLOCATION\ncurrentApprovalLevel = null
BE -> EMP : notify "Trip Request Approved by [name]"
BE -> DeploymentTeam : notify "Trip Ready for Resource Allocation"

note over BE : Any approver can reject:\nPOST /trips/:id/reject {reason}\nstate → REJECTED\nrequester notified with reason + SMS\n\n48h Bull job fires if no action:\nstate → AUTO_REJECTED_TIMEOUT

@enduml
```

---

## 3. VIP / SERVICE Trip — Direct to President

**Condition:** `tripCategory = VIP` OR `tripCategory = SERVICE` (any requester role)
**Source:** `trips.service.ts → submit()` — first `if` branch

```plantuml
@startuml SD_VIP
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Requester" as EMP
actor "President" as PRES
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

EMP -> FE : fill trip form
FE -> BE : POST /trips\n{..., tripCategory: "VIP"}\nor {tripCategory: "SERVICE"}
BE -> DB : INSERT trip (state=DRAFT)

EMP -> FE : click Submit
FE -> BE : POST /trips/:id/submit
BE -> DB : state → PENDING_PRESIDENT\nINSERT Approval(level=President, dueDate=now+48h)\nschedule Bull timeout job
BE -> EMP : notify "Trip Request Submitted"
BE -> PRES : notify "New Trip Approval Required"

PRES -> FE : GET /trips/pending/approvals
FE -> BE : GET /trips/pending/approvals
BE --> FE : trips in PENDING_PRESIDENT
PRES -> FE : approve
FE -> BE : POST /trips/:id/approve
BE -> DB : state → APPROVED_FOR_ALLOCATION
BE -> EMP : notify "Trip Request Approved"
BE -> DeploymentTeam : notify "Trip Ready for Resource Allocation"

@enduml
```

---

## 4. Legacy VIP Trip — Starts at Dean Level

**Condition:** `tripType = VIP` AND `tripCategory = STANDARD` (any requester role)
**Source:** `trips.service.ts → submit()` — second `else if` branch

```plantuml
@startuml SD_LegacyVIP
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Requester" as EMP
actor "Dean" as DEAN
actor "President" as PRES
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

EMP -> FE : fill trip form
FE -> BE : POST /trips\n{..., tripType: "VIP", tripCategory: "STANDARD"}
BE -> DB : INSERT trip (state=DRAFT)

EMP -> FE : click Submit
FE -> BE : POST /trips/:id/submit
BE -> DB : state → PENDING_COLLEGE\nINSERT Approval(level=College, dueDate=now+48h)
BE -> EMP : notify "Trip Request Submitted"
BE -> DEAN : notify "New Trip Approval Required"

DEAN -> FE : approve
FE -> BE : POST /trips/:id/approve
BE -> DB : state → PENDING_PRESIDENT\nINSERT Approval(level=President, dueDate=now+48h)
BE -> EMP : notify "Trip Request Approved by [Dean]"
BE -> PRES : notify "Trip Approval Required - Presidential Level"

PRES -> FE : approve
FE -> BE : POST /trips/:id/approve
BE -> DB : state → APPROVED_FOR_ALLOCATION
BE -> EMP : notify "Trip Request Approved"
BE -> DeploymentTeam : notify "Trip Ready for Resource Allocation"

@enduml
```

---

## 5. High-Rank Requester — Skips All Approvals

**Condition:** requester role = `President` OR `Dean` (any tripCategory STANDARD)
**Source:** `trips.service.ts → submit()` — third `else if` branch

```plantuml
@startuml SD_HighRank
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "President / Dean\n(as requester)" as EXEC
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

EXEC -> FE : fill & submit trip
FE -> BE : POST /trips/:id/submit
BE -> DB : state → APPROVED_FOR_ALLOCATION\n(no Approval record created — approvalLevel=undefined)
BE -> EXEC : notify "Trip Request Submitted"
BE -> DeploymentTeam : notify "Trip Ready for Resource Allocation"\n[only if state=APPROVED_FOR_ALLOCATION on submit]

@enduml
```

---

## 6. DeptHead / CollegeHead Requester — Skips to President

**Condition:** requester role = `DepartmentHead` OR `CollegeHead` (tripCategory STANDARD)
**Source:** `trips.service.ts → submit()` — fourth `else if` branch

```plantuml
@startuml SD_HeadRequester
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "DeptHead / CollegeHead\n(as requester)" as HEAD
actor "President" as PRES
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

HEAD -> FE : fill & submit trip
FE -> BE : POST /trips/:id/submit
BE -> DB : state → PENDING_PRESIDENT\nINSERT Approval(level=President, dueDate=now+48h)
BE -> HEAD : notify "Trip Request Submitted"
BE -> PRES : notify "New Trip Approval Required"

PRES -> FE : approve
FE -> BE : POST /trips/:id/approve
BE -> DB : state → APPROVED_FOR_ALLOCATION
BE -> HEAD : notify "Trip Request Approved"
BE -> DeploymentTeam : notify "Trip Ready for Resource Allocation"

@enduml
```

---

## 7. Allocation & Transport Confirmation

**Source:** `trips.service.ts → allocate(), confirmTransport(), rejectTransport(), driverRejectAssignment()`

```plantuml
@startuml SD_Allocation
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Deployment\nTeam" as DEPLOY
actor "Transport\nOffice" as TRANS
actor "Driver" as DRV
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

DEPLOY -> FE : view approved trips
FE -> BE : GET /trips
BE --> FE : trips (filtered by role — DeploymentTeam sees all)

DEPLOY -> FE : select vehicle + driver
FE -> BE : POST /trips/:id/allocate\n{vehicleId, driverId,\nestimatedDistance?, estimatedFuelCost?}
BE -> BE : guard: vehicle.status must be Active\ndriver.status must be Available\nneither in TRIP_STATES_HOLDING_ALLOCATION
BE -> DB : state → CAR_ALLOCATED\nset allocatedVehicle, allocatedDriver\nset deploymentTeamMember\ndriver.status → OnTrip
BE -> EMP : notify "Vehicle and Driver Allocated" + email + SMS
BE -> DRV : notify "New Trip Assignment" + email + SMS
BE -> TRANS : notify "Transport Confirmation Required"

TRANS -> FE : view CAR_ALLOCATED trips
FE -> BE : GET /trips
BE --> FE : trips

alt TRANS confirms
  TRANS -> FE : confirm
  FE -> BE : POST /trips/:id/confirm-transport\n{fuelApproved: true,\nestimatedFuelCost?, estimatedDistance?}
  BE -> BE : guard: fuelApproved must be true
  BE -> DB : state → READY\nset transportOfficer
  BE -> EMP : notify "Trip Ready — vehicle & driver details" + email
  BE -> DRV : notify "Trip Ready to Start" + email
  BE -> AllAdmins : notify "Trip Ready to Start"

else TRANS rejects
  TRANS -> FE : reject
  FE -> BE : POST /trips/:id/reject-transport {reason}
  BE -> DB : state → APPROVED_FOR_ALLOCATION\nclear allocatedVehicle, allocatedDriver\ndriver.status → Available
  BE -> DEPLOY : notify (via notifyTripRejected)

end

DRV -> FE : view READY trip — Departure QR displayed

alt DRV rejects assignment
  DRV -> FE : reject
  FE -> BE : POST /trips/:id/driver-reject {reason}
  BE -> DB : state → APPROVED_FOR_ALLOCATION\nclear allocatedVehicle, allocatedDriver\ndriver.status → Available
end

@enduml
```

---

## 8. GPS Tracking & Live Monitoring

**Source:** `tracking.controller.ts`, `tracking.service.ts`, `gate-scan.controller.ts`, `useDriverGpsTracking.ts`

```plantuml
@startuml SD_GPS
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Gate Keeper" as GATE
actor "Driver" as DRV
actor "Transport\nOffice" as TRANS
participant "Driver App" as DFE
participant "Transport App" as TFE
participant "Backend API" as BE
participant "WebSocket\n/tracking ns" as WS
database "PostgreSQL" as DB

DRV -> GATE : show Departure QR
GATE -> BE : POST /trips/gate/start-from-scan\n{qrPayload}\n[roles: Gate, TransportOffice, Developer]
BE -> BE : parseTripQrPayload(qrPayload)\nvalidate requestNumber + vehiclePlate
BE -> DB : state → IN_PROGRESS\n[trip.state was READY]
BE --> GATE : trip (state=IN_PROGRESS)

loop every ≥4 seconds while driver tab open
  DFE -> DFE : navigator.geolocation.watchPosition()\n{enableHighAccuracy:true, maximumAge:10000, timeout:20000}
  alt navigator.onLine = true
    DFE -> BE : POST /tracking/:tripId/location\n{latitude, longitude, timestamp,\nspeed (m/s×3.6 = km/h)?,\nheading?, altitude?, accuracy?,\nmetadata: {deviceId, networkType}}
    BE -> BE : guard: trip.state must be IN_PROGRESS
    BE -> DB : INSERT GpsLocation row
    BE -> BE : evaluateVipGeofenceForPoint()\nHaversine distance calc\nfuel stats recalculation
    BE -> WS : broadcastLocationUpdate(enriched payload)
    WS -> TFE : emit('vehicle-location')\n{lat, lng, speed, traveledKm,\nfuelUsedLiters, fuelRemainingLiters,\nfuelRemainingPercent, actualFuelCost,\nengineSimulatedOff, geofenceStatus}
    TFE -> TRANS : vehicle moves on live map
    alt geofenceStatus changed to 'warning' or 'shutdown'
      BE -> EMP : push notification + SMS (geofence warning/violation)
      BE -> AllTransportOffice : push notification + SMS
      BE --> DFE : {engineSimulatedOff: true/false,\ngeofenceStatus: "warning"|"shutdown",\nviolationZoneName: "..."}
      DFE -> DRV : show engine shutdown warning
    end
  else navigator.onLine = false
    DFE -> DFE : push to localStorage\nhufms_gps_offline_queue_<tripId>
  end
end

note over DFE : On reconnect (window 'online' event or mount):\nPOST /tracking/:tripId/locations/bulk\n[body: array of location objects directly]\nthen send current live point

@enduml
```

---

## 9. Trip Completion & Feedback

**Source:** `trips.service.ts → completeTrip(), startTripFromGateScan(), submitFeedback()`

```plantuml
@startuml SD_Completion
skinparam sequenceArrowColor #1B3D2F
skinparam sequenceLifeLineBorderColor #1B3D2F
skinparam sequenceParticipantBorderColor #1B3D2F
skinparam sequenceParticipantBackgroundColor #f9f9f9

actor "Employee /\nDriver / TransportOffice" as ACTOR
actor "Gate Keeper" as GATE
actor "Transport\nOffice" as TRANS
participant "Frontend" as FE
participant "Backend API" as BE
database "PostgreSQL" as DB

ACTOR -> FE : mark trip complete
FE -> BE : POST /trips/:id/complete\n{actualDistance?, actualFuelCost?, finalMileage?}
note right : allowed roles: Driver, TransportOffice,\nor the trip requester (any role)
BE -> DB : state → PENDING_RETURN\nset completedAt\nupdate vehicle mileage (if finalMileage)\nINSERT FuelRecord TripConsumption (if actualFuelCost+actualDistance)\nincrement driver.totalTrips + totalDistance\n[driver stays OnTrip — NOT released yet]
BE -> EMP : notify "Trip Marked Complete — Awaiting Gate Return Scan"

DRV -> FE : view PENDING_RETURN trip — Return QR displayed
DRV -> GATE : show Return QR

GATE -> BE : POST /trips/gate/start-from-scan\n{qrPayload}\n[same endpoint — detects PENDING_RETURN]
BE -> BE : parseTripQrPayload()\nvalidate requestNumber + vehiclePlate
BE -> DB : state → COMPLETED\n[trip.state was PENDING_RETURN]
BE -> DB : driver.status → Available\n[vehicle status NOT changed here]
BE -> EMP : notify "Trip Completed Successfully" + email
BE -> TRANS : notify "Trip Completed"
BE -> AllAdmins : notify "Trip Completed"

EMP -> FE : open feedback form
FE -> BE : POST /trips/:id/feedback\n{overallRating, driverRating?,\nvehicleRating?, punctualityRating?,\ncomments?, suggestions?,\nwouldRecommend, issues[]?}
note right : allowed states: COMPLETED or PENDING_RETURN\none feedback per trip (unique constraint)
BE -> DB : INSERT TripFeedback
BE -> TRANS : notify "New feedback received"

TRANS -> FE : view feedback analytics
FE -> BE : GET /trips/feedback/statistics
BE --> FE : feedback statistics

@enduml
```

---

## Summary

| # | Diagram | Trigger condition | Initial state after submit |
|---|---------|-------------------|---------------------------|
| 2 | Normal trip | `tripCategory=STANDARD`, requester=`User` | `PENDING_DEPARTMENT` |
| 3 | VIP/Service | `tripCategory=VIP` or `SERVICE` | `PENDING_PRESIDENT` |
| 4 | Legacy VIP | `tripType=VIP`, `tripCategory=STANDARD` | `PENDING_COLLEGE` |
| 5 | High-rank requester | requester=`President` or `Dean` | `APPROVED_FOR_ALLOCATION` |
| 6 | Head requester | requester=`DepartmentHead` or `CollegeHead` | `PENDING_PRESIDENT` |
| 7 | Allocation | after `APPROVED_FOR_ALLOCATION` | `CAR_ALLOCATED` → `READY` |
| 8 | GPS Tracking | after gate departure scan | `IN_PROGRESS` |
| 9 | Completion | after `IN_PROGRESS` | `PENDING_RETURN` → `COMPLETED` |
