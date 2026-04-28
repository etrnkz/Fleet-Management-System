# Fleet Management System — Activity Diagrams

---

## Diagram 1 — Employee Trip Request (Full Flow)

```plantuml
@startuml Diagram1_Employee

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Employee|
start
:Login to System;
:Fill Trip Request Form;
:Submit Trip Request;
note right: State → PENDING_DEPARTMENT

|Department Head|
:Receive Notification;
:Review Trip Details;
if (Decision?) then (Approve)
  :Approve Trip;
  note right: State → PENDING_COLLEGE
else (Reject)
  :Reject with Reason;
  |Employee|
  :Receive Rejection;
  stop
endif

|Dean / College Head|
:Receive Notification;
:Review Trip Details;
if (Decision?) then (Approve)
  :Approve Trip;
  note right: State → PENDING_PRESIDENT
else (Reject)
  :Reject with Reason;
  |Employee|
  :Receive Rejection;
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
  |Employee|
  :Receive Rejection;
  stop
endif

|Deployment Office|
:Allocate Vehicle & Driver;
note right: State → CAR_ALLOCATED

|Transport Admin|
:Confirm Transport Allocation;
note right: State → READY

|Driver|
:Accept Assignment;
:Show Departure QR Code;

|Gate Keeper|
:Scan Departure QR;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Execute Trip;
:Send GPS Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking;

|Employee|
:Mark Trip Complete;
note right: State → PENDING_RETURN

|Driver|
:Show Return QR Code;

|Gate Keeper|
:Scan Return QR;
:Complete Trip;
note right: State → COMPLETED

|Employee|
:Submit Feedback;

|Transport Admin|
:View Feedback & Reports;

stop
@enduml
```

---

## Diagram 2 — Department Head Trip Request (Full Flow)

```plantuml
@startuml Diagram2_DeptHead

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
  :Receive Rejection;
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
  :Receive Rejection;
  stop
endif

|Deployment Office|
:Allocate Vehicle & Driver;
note right: State → CAR_ALLOCATED

|Transport Admin|
:Confirm Transport Allocation;
note right: State → READY

|Driver|
:Accept Assignment;
:Show Departure QR Code;

|Gate Keeper|
:Scan Departure QR;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Execute Trip;
:Send GPS Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking;

|Department Head|
:Mark Trip Complete;
note right: State → PENDING_RETURN

|Driver|
:Show Return QR Code;

|Gate Keeper|
:Scan Return QR;
:Complete Trip;
note right: State → COMPLETED

|Department Head|
:Submit Feedback;

|Transport Admin|
:View Feedback & Reports;

stop
@enduml
```

---

## Diagram 3 — Dean / College Head Trip Request (Full Flow)

```plantuml
@startuml Diagram3_Dean

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Dean / College Head|
start
:Login to System;
:Fill Trip Request Form;
:Submit Own Trip Request;
note right: State → PENDING_PRESIDENT

|President|
:Receive Notification;
:Review Trip Details;
if (Final Decision?) then (Approve)
  :Final Approval;
  note right: State → APPROVED_FOR_ALLOCATION
else (Reject)
  :Reject with Reason;
  |Dean / College Head|
  :Receive Rejection;
  stop
endif

|Deployment Office|
:Allocate Vehicle & Driver;
note right: State → CAR_ALLOCATED

|Transport Admin|
:Confirm Transport Allocation;
note right: State → READY

|Driver|
:Accept Assignment;
:Show Departure QR Code;

|Gate Keeper|
:Scan Departure QR;
:Start Trip;
note right: State → IN_PROGRESS

|Driver|
:Execute Trip;
:Send GPS Every 4 Seconds;

|Transport Admin|
:Monitor Live Tracking;

|Dean / College Head|
:Mark Trip Complete;
note right: State → PENDING_RETURN

|Driver|
:Show Return QR Code;

|Gate Keeper|
:Scan Return QR;
:Complete Trip;
note right: State → COMPLETED

|Dean / College Head|
:Submit Feedback;

|Transport Admin|
:View Feedback & Reports;

stop
@enduml
```

---

## Diagram 4 — Driver Maintenance Request (Full Flow)

```plantuml
@startuml Diagram4_Maintenance

skinparam swimlaneWidth 140
skinparam activityBackgroundColor #f0f9f4
skinparam activityBorderColor #1B3D2F
skinparam arrowColor #1B3D2F

|Driver|
start
:Login to System;
:Detect Vehicle Issue;
:Fill Maintenance Request Form;
:Submit Maintenance Request;

|Deployment Office|
:Receive Maintenance Request;
:Inspect Vehicle;
if (Issue Confirmed?) then (Yes)
  :Provide Cost Estimate;
  |President|
  :Review Maintenance Budget;
  if (Approve Budget?) then (Approve)
    :Approve Budget;
    |Deployment Office|
    :Start Maintenance Work;
    :Complete Maintenance;
    |Driver|
    :Receive Notification - Vehicle Ready;
    stop
  else (Reject)
    :Reject Budget;
    |Driver|
    :Receive Rejection;
    stop
  endif
else (No Issue)
  :Reject Request;
  |Driver|
  :Receive Rejection;
  stop
endif

@enduml
```

---

## Approval Path Summary

| Requester | Approval Path |
|---|---|
| Employee | Dept Head → Dean → President → Allocation |
| Department Head | Dean → President → Allocation |
| Dean / College Head | President → Allocation |
| Driver (Maintenance) | Deployment Office → President |
