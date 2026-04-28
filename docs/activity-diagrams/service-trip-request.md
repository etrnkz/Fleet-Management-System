# Activity Diagram — Service Trip Request (Full Flow)

**Approval path:** Any requester → President (direct) → Deployment Office → Transport Admin → Driver → Gate Keeper → Trip Execution → Completion

Service trips skip all intermediate approvals and go directly to the President regardless of who submits.

```plantuml
@startuml Service_Trip_Request

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Requester|
start
:Login to System;
:Fill Trip Request Form;
:Select Trip Type: Service;
:Submit Service Trip Request;
note right
  Service trips skip all
  intermediate approvals
  State → PENDING_PRESIDENT
end note

|President|
:Receive Notification;
:Review Service Trip Details;
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
:Check Vehicle Availability;
:Check Driver Availability;
:Allocate Vehicle & Driver;
:Set Estimated Fuel & Distance;
note right: State → CAR_ALLOCATED

|Transport Admin|
:Receive Allocation for Confirmation;
:Review Service Trip Allocation;
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
:Receive Service Trip Assignment;
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
:Verify Service Trip Details;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Begin Service Trip;
:Send GPS Location Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking on Map;
:View Real-time Vehicle Position;
:Track Fuel & Distance Stats;

|Requester|
:Service Task Completed;
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
:Generate Service Trip Reports;

stop
@enduml
```
