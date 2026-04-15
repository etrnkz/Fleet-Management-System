# Transport Admin App - Activity Diagrams

## Actor: Transport Admin (Fleet Manager)

---

## 1. Transport Admin Login Flow

```mermaid
flowchart TD
    Start([Transport Admin Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = TransportAdmin?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. Allocate Vehicle and Driver to Approved Trip Flow

```mermaid
flowchart TD
    Start([Notification: Trip Approved]) --> ClickNotif[Click Notification]
    ClickNotif --> OpenDashboard[Open Dashboard]
    OpenDashboard --> ViewAwaitingAllocation[View Trips Awaiting Allocation]
    
    ViewAwaitingAllocation --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> ViewAwaitingAllocation
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> ViewTripDetails[View Trip Details]
    ViewTripDetails --> CheckDates[Check Start & End Dates]
    CheckDates --> ClickAllocate[Click Allocate Button]
    
    ClickAllocate --> FetchAvailable[Fetch Available Resources]
    FetchAvailable --> QueryVehicles[Query Available Vehicles]
    QueryVehicles --> QueryDrivers[Query Available Drivers]
    QueryDrivers --> DisplayForm[Display Allocation Form]
    
    DisplayForm --> CheckAvailability{Resources Available?}
    CheckAvailability -->|No Vehicles| ShowNoVehicles[Show No Vehicles Available]
    ShowNoVehicles --> ContactMaintenance[Contact Maintenance Team]
    ContactMaintenance --> End1([Wait for Vehicle])
    
    CheckAvailability -->|No Drivers| ShowNoDrivers[Show No Drivers Available]
    ShowNoDrivers --> RescheduleOrWait[Reschedule or Wait]
    RescheduleOrWait --> End1
    
    CheckAvailability -->|Resources Available| SelectVehicle[Select Vehicle]
    SelectVehicle --> CheckVehicleCapacity{Capacity Sufficient?}
    CheckVehicleCapacity -->|No| ShowCapacityError[Show Capacity Error]
    ShowCapacityError --> SelectVehicle
    
    CheckVehicleCapacity -->|Yes| SelectDriver[Select Driver]
    SelectDriver --> ReviewSelection[Review Selection]
    ReviewSelection --> ConfirmAllocation{Confirm Allocation?}
    ConfirmAllocation -->|No| SelectVehicle
    
    ConfirmAllocation -->|Yes| AllocateResources[Allocate Vehicle & Driver]
    AllocateResources --> UpdateTripStatus[Status: CAR_ALLOCATED]
    UpdateTripStatus --> NotifyDriver[Notify Driver]
    NotifyDriver --> NotifyEmployee[Notify Employee]
    NotifyEmployee --> ShowSuccess[Show Success Message]
    ShowSuccess --> End2([Return to Dashboard])
```

---

## 3. Manage Vehicles Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickVehicles[Click Vehicles Menu]
    ClickVehicles --> LoadVehicles[Load All Vehicles]
    LoadVehicles --> DisplayVehicles[Display Vehicles List]
    
    DisplayVehicles --> ChooseAction{What to Do?}
    
    ChooseAction -->|Add New Vehicle| ClickAdd[Click Add Vehicle]
    ClickAdd --> ShowForm[Show Vehicle Form]
    ShowForm --> FillDetails[Fill Vehicle Details]
    FillDetails --> EnterInfo[Enter: Make, Model, Year, Plate, Capacity, Fuel Type]
    EnterInfo --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> FillDetails
    ValidateForm -->|Yes| SubmitVehicle[Submit Vehicle]
    SubmitVehicle --> SaveVehicle[Save to Database]
    SaveVehicle --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> LoadVehicles
    
    ChooseAction -->|Edit Vehicle| SelectVehicle[Select Vehicle]
    SelectVehicle --> ShowEditForm[Show Edit Form]
    ShowEditForm --> UpdateDetails[Update Details]
    UpdateDetails --> ValidateUpdate{Valid Updates?}
    ValidateUpdate -->|No| ShowError1[Show Validation Error]
    ShowError1 --> UpdateDetails
    ValidateUpdate -->|Yes| SaveUpdates[Save Updates]
    SaveUpdates --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> LoadVehicles
    
    ChooseAction -->|Change Status| SelectVehicle2[Select Vehicle]
    SelectVehicle2 --> ShowStatusOptions[Show Status Options]
    ShowStatusOptions --> SelectStatus{New Status?}
    SelectStatus -->|Active| SetActive[Set Status: Active]
    SelectStatus -->|Maintenance| SetMaintenance[Set Status: Maintenance]
    SelectStatus -->|Inactive| SetInactive[Set Status: Inactive]
    SetActive --> UpdateStatus[Update Vehicle Status]
    SetMaintenance --> UpdateStatus
    SetInactive --> UpdateStatus
    UpdateStatus --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> LoadVehicles
    
    ChooseAction -->|View Details| SelectVehicle3[Select Vehicle]
    SelectVehicle3 --> ShowDetails[Show Vehicle Details]
    ShowDetails --> ViewHistory[View Trip History]
    ViewHistory --> ViewMaintenance[View Maintenance Records]
    ViewMaintenance --> End1([Close Details])
    
    ChooseAction -->|Close| End2([Return to Dashboard])
```

---

## 4. Manage Drivers Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickDrivers[Click Drivers Menu]
    ClickDrivers --> LoadDrivers[Load All Drivers]
    LoadDrivers --> DisplayDrivers[Display Drivers List]
    
    DisplayDrivers --> ChooseAction{What to Do?}
    
    ChooseAction -->|Add New Driver| ClickAdd[Click Add Driver]
    ClickAdd --> ShowForm[Show Driver Form]
    ShowForm --> FillDetails[Fill Driver Details]
    FillDetails --> EnterInfo[Enter: Name, License, Phone, Email]
    EnterInfo --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> FillDetails
    ValidateForm -->|Yes| SubmitDriver[Submit Driver]
    SubmitDriver --> SaveDriver[Save to Database]
    SaveDriver --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> LoadDrivers
    
    ChooseAction -->|Edit Driver| SelectDriver[Select Driver]
    SelectDriver --> ShowEditForm[Show Edit Form]
    ShowEditForm --> UpdateDetails[Update Details]
    UpdateDetails --> ValidateUpdate{Valid Updates?}
    ValidateUpdate -->|No| ShowError1[Show Validation Error]
    ShowError1 --> UpdateDetails
    ValidateUpdate -->|Yes| SaveUpdates[Save Updates]
    SaveUpdates --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> LoadDrivers
    
    ChooseAction -->|Change Status| SelectDriver2[Select Driver]
    SelectDriver2 --> ShowStatusOptions[Show Status Options]
    ShowStatusOptions --> SelectStatus{New Status?}
    SelectStatus -->|Active| SetActive[Set Status: Active]
    SelectStatus -->|On Leave| SetLeave[Set Status: On Leave]
    SelectStatus -->|Inactive| SetInactive[Set Status: Inactive]
    SetActive --> UpdateStatus[Update Driver Status]
    SetLeave --> UpdateStatus
    SetInactive --> UpdateStatus
    UpdateStatus --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> LoadDrivers
    
    ChooseAction -->|View Details| SelectDriver3[Select Driver]
    SelectDriver3 --> ShowDetails[Show Driver Details]
    ShowDetails --> ViewTrips[View Assigned Trips]
    ViewTrips --> ViewRatings[View Ratings & Feedback]
    ViewRatings --> End1([Close Details])
    
    ChooseAction -->|Close| End2([Return to Dashboard])
```

---

## 5. Manage Fuel Records Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickFuel[Click Fuel Management]
    ClickFuel --> LoadRecords[Load Fuel Records]
    LoadRecords --> DisplayRecords[Display Records List]
    
    DisplayRecords --> ChooseAction{What to Do?}
    
    ChooseAction -->|Add Record| ClickAdd[Click Add Fuel Record]
    ClickAdd --> ShowForm[Show Fuel Form]
    ShowForm --> SelectVehicle[Select Vehicle]
    SelectVehicle --> SelectTrip[Select Trip Optional]
    SelectTrip --> EnterDetails[Enter: Liters, Cost, Date, Odometer]
    EnterDetails --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> EnterDetails
    ValidateForm -->|Yes| SubmitRecord[Submit Fuel Record]
    SubmitRecord --> SaveRecord[Save to Database]
    SaveRecord --> UpdateVehicle[Update Vehicle Fuel Stats]
    UpdateVehicle --> ShowSuccess[Show Success Message]
    ShowSuccess --> LoadRecords
    
    ChooseAction -->|View Details| SelectRecord[Select Record]
    SelectRecord --> ShowDetails[Show Record Details]
    ShowDetails --> ViewVehicle[View Vehicle Info]
    ViewVehicle --> ViewTrip[View Associated Trip]
    ViewTrip --> End1([Close Details])
    
    ChooseAction -->|Filter| SelectFilter[Select Filter]
    SelectFilter --> FilterType{Filter Type?}
    FilterType -->|By Vehicle| SelectVehicleFilter[Select Vehicle]
    FilterType -->|By Date| SelectDateFilter[Select Date Range]
    FilterType -->|By Trip| SelectTripFilter[Select Trip]
    SelectVehicleFilter --> ApplyFilter[Apply Filter]
    SelectDateFilter --> ApplyFilter
    SelectTripFilter --> ApplyFilter
    ApplyFilter --> LoadRecords
    
    ChooseAction -->|Export| GenerateReport[Generate Fuel Report]
    GenerateReport --> Download[Download Report]
    Download --> End2([Report Downloaded])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 6. Manage Maintenance Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickMaintenance[Click Maintenance Menu]
    ClickMaintenance --> LoadRecords[Load Maintenance Records]
    LoadRecords --> DisplayRecords[Display Records List]
    
    DisplayRecords --> ChooseAction{What to Do?}
    
    ChooseAction -->|Schedule Maintenance| ClickSchedule[Click Schedule]
    ClickSchedule --> ShowForm[Show Maintenance Form]
    ShowForm --> SelectVehicle[Select Vehicle]
    SelectVehicle --> SelectType[Select Maintenance Type]
    SelectType --> EnterDetails[Enter: Date, Description, Estimated Cost]
    EnterDetails --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> EnterDetails
    ValidateForm -->|Yes| SubmitMaintenance[Submit Maintenance]
    SubmitMaintenance --> SaveRecord[Save Record]
    SaveRecord --> UpdateVehicleStatus[Set Vehicle: MAINTENANCE]
    UpdateVehicleStatus --> NotifyStakeholders[Notify Relevant Parties]
    NotifyStakeholders --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> LoadRecords
    
    ChooseAction -->|Update Status| SelectRecord[Select Record]
    SelectRecord --> ShowStatusForm[Show Status Update Form]
    ShowStatusForm --> SelectNewStatus{New Status?}
    SelectNewStatus -->|In Progress| SetInProgress[Set: IN_PROGRESS]
    SelectNewStatus -->|Completed| SetCompleted[Set: COMPLETED]
    SelectNewStatus -->|Cancelled| SetCancelled[Set: CANCELLED]
    SetInProgress --> UpdateRecord[Update Record]
    SetCompleted --> UpdateRecord
    SetCancelled --> UpdateRecord
    UpdateRecord --> CheckCompleted{Status = COMPLETED?}
    CheckCompleted -->|Yes| EnterActualCost[Enter Actual Cost]
    EnterActualCost --> SetVehicleActive[Set Vehicle: ACTIVE]
    SetVehicleActive --> ShowSuccess2[Show Success Message]
    CheckCompleted -->|No| ShowSuccess2
    ShowSuccess2 --> LoadRecords
    
    ChooseAction -->|View Details| SelectRecord2[Select Record]
    SelectRecord2 --> ShowDetails[Show Maintenance Details]
    ShowDetails --> ViewVehicle[View Vehicle Info]
    ViewVehicle --> ViewHistory[View Maintenance History]
    ViewHistory --> End1([Close Details])
    
    ChooseAction -->|Close| End2([Return to Dashboard])
```

---

## 7. View Reports and Analytics Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickReports[Click Reports Menu]
    ClickReports --> SelectReportType{Report Type?}
    
    SelectReportType -->|Fleet Analytics| LoadFleetData[Load Fleet Data]
    LoadFleetData --> CalculateMetrics[Calculate Metrics]
    CalculateMetrics --> ShowFleetReport[Show Fleet Report]
    ShowFleetReport --> DisplayCharts1[Display: Utilization, Trips, Costs]
    DisplayCharts1 --> End1([View Report])
    
    SelectReportType -->|Fuel Report| LoadFuelData[Load Fuel Data]
    LoadFuelData --> CalculateFuel[Calculate Fuel Metrics]
    CalculateFuel --> ShowFuelReport[Show Fuel Report]
    ShowFuelReport --> DisplayCharts2[Display: Consumption, Costs, Efficiency]
    DisplayCharts2 --> End1
    
    SelectReportType -->|Maintenance Report| LoadMaintenanceData[Load Maintenance Data]
    LoadMaintenanceData --> CalculateMaintenance[Calculate Maintenance Metrics]
    CalculateMaintenance --> ShowMaintenanceReport[Show Maintenance Report]
    ShowMaintenanceReport --> DisplayCharts3[Display: Costs, Downtime, Frequency]
    DisplayCharts3 --> End1
    
    SelectReportType -->|Driver Performance| LoadDriverData[Load Driver Data]
    LoadDriverData --> CalculatePerformance[Calculate Performance Metrics]
    CalculatePerformance --> ShowDriverReport[Show Driver Report]
    ShowDriverReport --> DisplayCharts4[Display: Trips, Ratings, Efficiency]
    DisplayCharts4 --> End1
    
    End1 --> ExportOption{Export Report?}
    ExportOption -->|Yes| SelectFormat[Select Format: PDF/Excel/CSV]
    SelectFormat --> GenerateFile[Generate File]
    GenerateFile --> Download[Download File]
    Download --> End2([File Downloaded])
    ExportOption -->|No| End2
```

---

## 8. QR Code Scanning Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickScan[Click Scan QR]
    ClickScan --> RequestCamera[Request Camera Access]
    RequestCamera --> CameraGranted{Permission Granted?}
    CameraGranted -->|No| ShowError[Show Permission Error]
    ShowError --> End1([Cannot Scan])
    
    CameraGranted -->|Yes| StartCamera[Start Camera Stream]
    StartCamera --> ShowScanner[Show QR Scanner]
    ShowScanner --> WaitForScan[Wait for QR Code]
    
    WaitForScan --> ScanCode{QR Code Detected?}
    ScanCode -->|No| WaitForScan
    ScanCode -->|Yes| DecodeQR[Decode QR Data]
    DecodeQR --> ExtractTripID[Extract Trip ID]
    ExtractTripID --> FetchTrip[Fetch Trip Details]
    FetchTrip --> ValidTrip{Valid Trip?}
    
    ValidTrip -->|No| ShowInvalid[Show Invalid QR Error]
    ShowInvalid --> WaitForScan
    
    ValidTrip -->|Yes| DisplayTrip[Display Trip Details]
    DisplayTrip --> ShowActions[Show Quick Actions]
    ShowActions --> UserAction{User Action?}
    
    UserAction -->|View Details| ShowFullDetails[Show Full Trip Info]
    ShowFullDetails --> End2([View Trip])
    
    UserAction -->|Start Trip| StartTrip[Start Trip]
    StartTrip --> End2
    
    UserAction -->|Complete Trip| CompleteTrip[Complete Trip]
    CompleteTrip --> End2
    
    UserAction -->|Scan Another| WaitForScan
    UserAction -->|Close| End2
```

---

## 9. Logout Flow

```mermaid
flowchart TD
    Start([Transport Admin on Dashboard]) --> ClickLogout[Click Logout Button]
    ClickLogout --> ConfirmLogout{Confirm Logout?}
    ConfirmLogout -->|No| End1([Stay Logged In])
    ConfirmLogout -->|Yes| SendLogout[Send Logout Request]
    SendLogout --> BlacklistToken[Blacklist JWT Token]
    BlacklistToken --> ClearStorage[Clear localStorage]
    ClearStorage --> DisconnectWS[Disconnect WebSocket]
    DisconnectWS --> Redirect[Redirect to Landing Page]
    Redirect --> End2([Logged Out])
```

---

## Summary

### Transport Admin App Activity Flows:
1. ✅ Login with role verification
2. ✅ Allocate vehicles and drivers to approved trips
3. ✅ Manage vehicles (CRUD operations)
4. ✅ Manage drivers (CRUD operations)
5. ✅ Manage fuel records
6. ✅ Manage maintenance schedules
7. ✅ View comprehensive reports and analytics
8. ✅ QR code scanning for quick access
9. ✅ Logout with token cleanup

### Key Decision Points:
- **Resource availability** check before allocation
- **Vehicle capacity** verification
- **Driver availability** confirmation
- **Maintenance status** updates
- **Form validation** for all data entry

### Resource Management Responsibilities:
- **Allocate resources** to approved trips
- **Maintain fleet** vehicles and drivers
- **Track fuel consumption** and costs
- **Schedule maintenance** proactively
- **Generate reports** for operational insights
- **Monitor utilization** and efficiency

### Trip Flow Impact:
President approves → **APPROVED_FOR_ALLOCATION** → Transport Admin allocates → **CAR_ALLOCATED** → Driver starts → **IN_PROGRESS**
