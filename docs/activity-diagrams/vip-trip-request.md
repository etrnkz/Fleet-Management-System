# Activity Diagram — VIP Trip Request (Full Flow)

**Approval path:** Any requester → President (direct) → Deployment Office → Transport Admin → Driver → Gate Keeper → Trip Execution (with Geofence monitoring) → Completion

VIP trips skip all intermediate approvals and go directly to the President regardless of who submits.

```plantuml
@startuml VIP_Trip_Request

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Requester|
start
:Login to System;
:Fill Trip Request Form;
:Select Trip Type: VIP;
:Submit VIP Trip Request;
note right
  VIP trips skip all
  intermediate approvals
  State → PENDING_PRESIDENT
end note

|President|
:Receive Notification;
:Review VIP Trip Details;
if (Final Decision?) then (Approve)
  :Final Approval;
  note right: State → APPROVED_FOR_ALLOCATION
else (Reject)
  :Reject with Reason;
  |Requester|
  :Receive Rejection Notification;
  stop
endif

|Deployment Office|
:Receive Allocation Task;
:Check VIP Vehicle Availability;
:Check Driver Availability;
:Allocate VIP Vehicle & Driver;
:Set Estimated Fuel & Distance;
note right: State → CAR_ALLOCATED

|Transport Admin|
:Receive Allocation for Confirmation;
:Review VIP Allocation Details;
:Configure Geofence Restrictions;
note right
  VIP vehicles can have
  restricted zones configured
end note
:Auto-calculate Route Distance & Fuel Cost;
if (Confirm?) then (Confirm)
  :Confirm Transport Allocation;
  note right: State → READY
else (Reject)
  :Reject Allocation;
  |Deployment Office|
  :Reassign Vehicle & Driver;
endif

|Driver|
:Receive VIP Trip Assignment;
:View Assigned Trip;
if (Accept?) then (Accept)
  :Accept Assignment;
  :Show Departure QR Code;
else (Reject)
  :Reject with Reason;
  |Deployment Office|
  :Reassign Driver;
  stop
endif

|Gate Keeper|
:Scan Departure QR Code;
:Verify VIP Trip Details;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Begin VIP Trip;
:Send GPS Location Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking on Map;
:Monitor Geofence Zones;
if (Geofence Violation?) then (Yes)
  :Send Alert Notification;
  :Trigger Engine Shutdown (if configured);
  note right
    VIP vehicles with geo-restriction
    enabled will have engine shutdown
    simulated if restricted zone entered
  end note
else (No Violation)
  :Continue Monitoring;
endif

|Requester|
:Arrive at Destination;
:Mark Trip as Complete;
note right: State → PENDING_RETURN

|Driver|
:Receive PENDING_RETURN Notification;
:Return to Campus;
:Show Return QR Code;

|Gate Keeper|
:Scan Return QR Code;
:Complete Trip;
note right: State → COMPLETED

|Requester|
:Receive Trip Completion Notification;
:Submit Feedback & Rating;

|Transport Admin|
:View Feedback in Dashboard;
:Generate VIP Trip Reports;

stop
@enduml
```
