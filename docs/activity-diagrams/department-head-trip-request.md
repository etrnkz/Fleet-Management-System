# Activity Diagram — Department Head Trip Request (Full Flow)

**Approval path:** Department Head → Dean/College Head → President → Deployment Office → Transport Admin → Driver → Gate Keeper → Trip Execution → Completion

```plantuml
@startuml DeptHead_Trip_Request

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Department Head|
start
:Login to System;
:Fill Trip Request Form;
:Submit Own Trip Request;
note right: State → PENDING_COLLEGE

|Dean / College Head|
:Receive Notification;
:Review Trip Details;
if (Decision?) then (Approve)
  :Approve Trip;
  note right: State → PENDING_PRESIDENT
else (Reject)
  :Reject with Reason;
  |Department Head|
  :Receive Rejection Notification;
  stop
endif

|President|
:Receive Notification;
:Review Trip Details;
if (Final Decision?) then (Approve)
  :Final Approval;
  note right: State → APPROVED_FOR_ALLOCATION
else (Reject)
  :Reject with Reason;
  |Department Head|
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
:Review Allocation Details;
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
:Receive Trip Assignment Notification;
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
:Verify Trip Details;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Begin Trip;
:Send GPS Location Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking on Map;
:View Real-time Vehicle Position;
:Track Fuel & Distance Stats;

|Department Head|
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

|Department Head|
:Receive Trip Completion Notification;
:Submit Feedback & Rating;

|Transport Admin|
:View Feedback in Dashboard;
:Generate Trip Reports;

stop
@enduml
```
