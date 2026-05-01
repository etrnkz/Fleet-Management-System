# Fleet Management System — Object Diagram

> A snapshot of object instances at the moment a trip is IN_PROGRESS.
> Values are representative examples, not real data.

---

```plantuml
@startuml Object_Diagram

skinparam object {
  BackgroundColor #f9f9f9
  BorderColor #1B3D2F
  ArrowColor #1B3D2F
  FontSize 11
}

object "college1 : College" as COLLEGE {
  name = "College of Computing"
  code = "CCI"
  isActive = true
}

object "department1 : Department" as DEPT {
  name = "Computer Science"
  code = "CS"
  isActive = true
}

object "requester1 : User" as REQUESTER {
  name = "Employee Name"
  email = "employee@haramaya.edu.et"
  role = User
  isActive = true
}

object "deptHead1 : User" as DEPTHEAD {
  name = "Dept Head Name"
  role = DepartmentHead
  isActive = true
}

object "dean1 : User" as DEAN {
  name = "Dean Name"
  role = Dean
  isActive = true
}

object "president1 : User" as PRESIDENT {
  name = "President Name"
  role = President
  isActive = true
}

object "deployMember1 : User" as DEPLOY {
  name = "Deployment Staff"
  role = DeploymentTeam
  isActive = true
}

object "transOfficer1 : User" as TRANS {
  name = "Transport Officer"
  role = TransportOffice
  isActive = true
}

object "driverUser1 : User" as DRIVERUSER {
  name = "Driver Name"
  role = Driver
  isActive = true
}

object "driver1 : Driver" as DRIVER {
  licenseNumber = "DL-XXXXXX"
  licenseExpiry = "2027-01-01"
  status = OnTrip
  rating = 4.5
  totalTrips = 45
}

object "vehicle1 : Vehicle" as VEHICLE {
  plateNumber = "ET-X-XXXXX"
  make = "Toyota"
  model = "Hilux"
  year = 2022
  fuelType = Diesel
  fuelEfficiency = 8
  fuelCapacity = 60
  status = Active
  currentMileage = 45000
}

object "tripRequest1 : TripRequest" as TRIP {
  requestNumber = "TR-2026-XXXXXX"
  tripType = Normal
  tripCategory = STANDARD
  destination = "Addis Ababa"
  passengerCount = 4
  state = IN_PROGRESS
  estimatedFuelCost = 1748.00
  estimatedDistance = 100
}

object "approval1 : Approval" as APPR1 {
  approvalLevel = Department
  status = Approved
  dueDate = "2026-02-10"
}

object "approval2 : Approval" as APPR2 {
  approvalLevel = College
  status = Approved
  dueDate = "2026-02-11"
}

object "approval3 : Approval" as APPR3 {
  approvalLevel = President
  status = Approved
  dueDate = "2026-02-12"
}

object "gpsLocation1 : GpsLocation" as GPS1 {
  latitude = 9.0320
  longitude = 38.7469
  speed = 65.0
  isOffline = false
}

object "gpsLocation2 : GpsLocation" as GPS2 {
  latitude = 9.0325
  longitude = 38.7475
  speed = 68.0
  isOffline = false
}

object "notification1 : Notification" as NOTIF {
  type = TripStarted
  title = "Trip Started"
  isRead = false
}

' ── Structural relationships ──────────────────────────
DEPT --> COLLEGE         : college
DEPT --> DEPTHEAD        : head
COLLEGE --> DEAN         : head
REQUESTER --> DEPT       : department
REQUESTER --> COLLEGE    : college
DEPTHEAD --> DEPT        : department
DEAN --> COLLEGE         : college

' ── Trip relationships ────────────────────────────────
TRIP --> REQUESTER       : requester
TRIP --> VEHICLE         : allocatedVehicle
TRIP --> DRIVER          : allocatedDriver
TRIP --> DEPLOY          : deploymentTeamMember
TRIP --> TRANS           : transportOfficer
TRIP --> APPR1           : approvals
TRIP --> APPR2           : approvals
TRIP --> APPR3           : approvals

' ── Approval relationships ────────────────────────────
APPR1 --> DEPTHEAD       : approver
APPR2 --> DEAN           : approver
APPR3 --> PRESIDENT      : approver

' ── Driver / Vehicle ──────────────────────────────────
DRIVER --> DRIVERUSER    : user
VEHICLE --> DRIVER       : assignedDriver

' ── GPS ───────────────────────────────────────────────
GPS1 --> TRIP            : trip
GPS2 --> TRIP            : trip

' ── Notification ──────────────────────────────────────
NOTIF --> REQUESTER      : recipient

@enduml
```

---

## What this diagram shows

This is a snapshot of the system at the moment a trip is `IN_PROGRESS`:

- **College and Department** — the organizational units the requester belongs to
- **Users** — all 7 users involved: requester, dept head, dean, president, deployment member, transport officer, and driver
- **Vehicle** — the allocated vehicle with its current status (`Active`) and fuel specs
- **Driver** — linked to their user account, status is `OnTrip`
- **TripRequest** — the central object in `IN_PROGRESS` state with estimated fuel cost
- **Approvals** — 3 approval records, one per level, all `Approved`
- **GpsLocations** — 2 recent GPS points posted by the driver
- **Notification** — a `TripStarted` notification sent to the requester
