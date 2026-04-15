# Deployment Office App - Activity Diagrams

## Actor: Deployment Office (Operations Manager)

---

## 1. Deployment Office Login Flow

```mermaid
flowchart TD
    Start([Deployment Officer Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = DeploymentOffice?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. View Comprehensive Dashboard Flow

```mermaid
flowchart TD
    Start([Deployment Officer Logs In]) --> LoadDashboard[Load Dashboard]
    LoadDashboard --> FetchMultipleData[Fetch Multiple Data Sources]
    
    FetchMultipleData --> FetchTrips[Fetch Trip Statistics]
    FetchMultipleData --> FetchVehicles[Fetch Vehicle Statistics]
    FetchMultipleData --> FetchDrivers[Fetch Driver Statistics]
    FetchMultipleData --> FetchMaintenance[Fetch Maintenance Statistics]
    FetchMultipleData --> FetchFuel[Fetch Fuel Statistics]
    
    FetchTrips --> ProcessData[Process All Data]
    FetchVehicles --> ProcessData
    FetchDrivers --> ProcessData
    FetchMaintenance --> ProcessData
    FetchFuel --> ProcessData
    
    ProcessData --> CalculateKPIs[Calculate KPIs]
    CalculateKPIs --> DisplayCards[Display Stat Cards]
    DisplayCards --> ShowTripStats[Trip Statistics]
    ShowTripStats --> ShowFleetStats[Fleet Statistics]
    ShowFleetStats --> ShowMaintenanceStats[Maintenance Statistics]
    ShowMaintenanceStats --> ShowCostStats[Cost Statistics]
    
    ShowCostStats --> RenderCharts[Render Charts]
    RenderCharts --> ShowTrends[Show Trends]
    ShowTrends --> ShowDistributions[Show Distributions]
    ShowDistributions --> ShowComparisons[Show Comparisons]
    
    ShowComparisons --> UserAction{User Action?}
    UserAction -->|Drill Down| SelectCard[Select Stat Card]
    SelectCard --> NavigateDetails[Navigate to Details]
    NavigateDetails --> End1([View Details])
    
    UserAction -->|Refresh| LoadDashboard
    UserAction -->|Change Period| SelectPeriod[Select Time Period]
    SelectPeriod --> LoadDashboard
    
    UserAction -->|Continue| End2([Stay on Dashboard])
```

---

## 3. Monitor All Trips Flow

```mermaid
flowchart TD
    Start([Deployment Officer on Dashboard]) --> ClickTrips[Click Trips Menu]
    ClickTrips --> LoadTrips[Load All University Trips]
    LoadTrips --> DisplayTrips[Display Trips Table]
    
    DisplayTrips --> ChooseAction{What to Do?}
    
    ChooseAction -->|Filter| SelectFilters[Select Filters]
    SelectFilters --> FilterOptions{Filter Options?}
    FilterOptions -->|By Status| SelectStatus[Select Status]
    FilterOptions -->|By College| SelectCollege[Select College]
    FilterOptions -->|By Department| SelectDept[Select Department]
    FilterOptions -->|By Date| SelectDate[Select Date Range]
    FilterOptions -->|By Vehicle| SelectVehicle[Select Vehicle]
    FilterOptions -->|By Driver| SelectDriver[Select Driver]
    SelectStatus --> ApplyFilters[Apply Filters]
    SelectCollege --> ApplyFilters
    SelectDept --> ApplyFilters
    SelectDate --> ApplyFilters
    SelectVehicle --> ApplyFilters
    SelectDriver --> ApplyFilters
    ApplyFilters --> LoadTrips
    
    ChooseAction -->|View Details| ClickTrip[Click Trip]
    ClickTrip --> FetchDetails[Fetch Complete Trip Data]
    FetchDetails --> DisplayDetails[Display Trip Details]
    DisplayDetails --> ShowApprovals[Show Approval Chain]
    ShowApprovals --> ShowAllocation[Show Vehicle & Driver]
    ShowAllocation --> ShowFuel[Show Fuel Records]
    ShowFuel --> ShowFeedback[Show Feedback]
    ShowFeedback --> End1([Close Details])
    
    ChooseAction -->|Export| SelectExportType{Export Type?}
    SelectExportType -->|All Trips| ExportAll[Export All Trips]
    SelectExportType -->|Filtered| ExportFiltered[Export Filtered Trips]
    SelectExportType -->|Selected| ExportSelected[Export Selected Trips]
    ExportAll --> GenerateFile[Generate CSV/Excel]
    ExportFiltered --> GenerateFile
    ExportSelected --> GenerateFile
    GenerateFile --> Download[Download File]
    Download --> End2([File Downloaded])
    
    ChooseAction -->|Search| EnterSearch[Enter Search Query]
    EnterSearch --> SearchTrips[Search Trips]
    SearchTrips --> DisplayResults[Display Results]
    DisplayResults --> End3([View Results])
    
    ChooseAction -->|Close| End4([Return to Dashboard])
```

---

## 4. Monitor Fleet Operations Flow

```mermaid
flowchart TD
    Start([Deployment Officer on Dashboard]) --> SelectView{Select View?}
    
    SelectView -->|Vehicles| ClickVehicles[Click Vehicles]
    ClickVehicles --> LoadVehicles[Load All Vehicles]
    LoadVehicles --> DisplayVehicles[Display Vehicles List]
    DisplayVehicles --> ShowVehicleStats[Show: Status, Utilization, Trips]
    ShowVehicleStats --> VehicleAction{Action?}
    VehicleAction -->|View Details| SelectVehicle[Select Vehicle]
    SelectVehicle --> ShowVehicleDetails[Show Vehicle Details]
    ShowVehicleDetails --> ViewTripHistory[View Trip History]
    ViewTripHistory --> ViewMaintenanceHistory[View Maintenance History]
    ViewMaintenanceHistory --> ViewFuelHistory[View Fuel History]
    ViewFuelHistory --> End1([Close Details])
    VehicleAction -->|Filter| FilterVehicles[Filter by Status/Type]
    FilterVehicles --> LoadVehicles
    VehicleAction -->|Export| ExportVehicles[Export Vehicle Data]
    ExportVehicles --> End1
    
    SelectView -->|Drivers| ClickDrivers[Click Drivers]
    ClickDrivers --> LoadDrivers[Load All Drivers]
    LoadDrivers --> DisplayDrivers[Display Drivers List]
    DisplayDrivers --> ShowDriverStats[Show: Status, Trips, Ratings]
    ShowDriverStats --> DriverAction{Action?}
    DriverAction -->|View Details| SelectDriver[Select Driver]
    SelectDriver --> ShowDriverDetails[Show Driver Details]
    ShowDriverDetails --> ViewDriverTrips[View Assigned Trips]
    ViewDriverTrips --> ViewRatings[View Ratings & Feedback]
    ViewRatings --> ViewPerformance[View Performance Metrics]
    ViewPerformance --> End2([Close Details])
    DriverAction -->|Filter| FilterDrivers[Filter by Status]
    FilterDrivers --> LoadDrivers
    DriverAction -->|Export| ExportDrivers[Export Driver Data]
    ExportDrivers --> End2
```

---

## 5. Maintenance Management Flow

```mermaid
flowchart TD
    Start([Deployment Officer on Dashboard]) --> ClickMaintenance[Click Maintenance Menu]
    ClickMaintenance --> SelectSection{Select Section?}
    
    SelectSection -->|Overview| LoadOverview[Load Maintenance Overview]
    LoadOverview --> DisplayOverview[Display Overview]
    DisplayOverview --> ShowStats[Show Statistics]
    ShowStats --> ShowScheduled[Scheduled Maintenance]
    ShowScheduled --> ShowOngoing[Ongoing Maintenance]
    ShowOngoing --> ShowCompleted[Completed Maintenance]
    ShowCompleted --> ShowOverdue[Overdue Maintenance]
    ShowOverdue --> End1([View Overview])
    
    SelectSection -->|Requests| LoadRequests[Load Maintenance Requests]
    LoadRequests --> DisplayRequests[Display Requests]
    DisplayRequests --> RequestAction{Action?}
    RequestAction -->|Review| SelectRequest[Select Request]
    SelectRequest --> ViewRequestDetails[View Request Details]
    ViewRequestDetails --> CheckRequest{Decision?}
    CheckRequest -->|Approve| ApproveRequest[Approve Request]
    ApproveRequest --> CreateMaintenance[Create Maintenance Record]
    CreateMaintenance --> UpdateVehicle[Update Vehicle Status]
    UpdateVehicle --> NotifyRequester[Notify Requester]
    NotifyRequester --> End2([Request Approved])
    CheckRequest -->|Reject| RejectRequest[Reject Request]
    RejectRequest --> EnterReason[Enter Reason]
    EnterReason --> NotifyRequester2[Notify Requester]
    NotifyRequester2 --> End2
    RequestAction -->|Filter| FilterRequests[Filter by Status/Vehicle]
    FilterRequests --> LoadRequests
    
    SelectSection -->|Schedule| LoadSchedule[Load Maintenance Schedule]
    LoadSchedule --> DisplayCalendar[Display Calendar View]
    DisplayCalendar --> ShowMonthView[Show Month View]
    ShowMonthView --> ScheduleAction{Action?}
    ScheduleAction -->|View Day| SelectDay[Select Day]
    SelectDay --> ShowDayDetails[Show Day's Maintenance]
    ShowDayDetails --> End3([View Details])
    ScheduleAction -->|Change Month| SelectMonth[Select Month]
    SelectMonth --> LoadSchedule
    ScheduleAction -->|Export| ExportSchedule[Export Schedule]
    ExportSchedule --> End3
    
    SelectSection -->|Costs| LoadCosts[Load Maintenance Costs]
    LoadCosts --> DisplayCosts[Display Cost Analysis]
    DisplayCosts --> ShowTotalCosts[Show Total Costs]
    ShowTotalCosts --> ShowByVehicle[Show Costs by Vehicle]
    ShowByVehicle --> ShowByType[Show Costs by Type]
    ShowByType --> ShowTrends[Show Cost Trends]
    ShowTrends --> CostAction{Action?}
    CostAction -->|Filter| FilterCosts[Filter by Period/Vehicle]
    FilterCosts --> LoadCosts
    CostAction -->|Export| ExportCosts[Export Cost Report]
    ExportCosts --> End4([Report Downloaded])
    CostAction -->|Close| End4
    
    SelectSection -->|Reports| LoadReports[Load Maintenance Reports]
    LoadReports --> DisplayReports[Display Reports]
    DisplayReports --> ShowAnalytics[Show Analytics]
    ShowAnalytics --> ShowDowntime[Show Downtime Analysis]
    ShowDowntime --> ShowRecurring[Show Recurring Issues]
    ShowRecurring --> ShowEfficiency[Show Efficiency Metrics]
    ShowEfficiency --> ReportAction{Action?}
    ReportAction -->|Export PDF| GeneratePDF[Generate PDF Report]
    GeneratePDF --> DownloadPDF[Download PDF]
    DownloadPDF --> End5([Report Downloaded])
    ReportAction -->|Export Excel| GenerateExcel[Generate Excel]
    GenerateExcel --> DownloadExcel[Download Excel]
    DownloadExcel --> End5
    ReportAction -->|Close| End5
```

---

## 6. Generate Comprehensive Reports Flow

```mermaid
flowchart TD
    Start([Deployment Officer on Dashboard]) --> ClickReports[Click Reports Menu]
    ClickReports --> SelectReportType{Report Type?}
    
    SelectReportType -->|Operational Report| LoadOperational[Load Operational Data]
    LoadOperational --> FetchAllData[Fetch All Data Sources]
    FetchAllData --> CalculateKPIs[Calculate KPIs]
    CalculateKPIs --> DisplayOperational[Display Operational Report]
    DisplayOperational --> ShowFleetUtil[Fleet Utilization]
    ShowFleetUtil --> ShowTripMetrics[Trip Metrics]
    ShowTripMetrics --> ShowCostPerKm[Cost per Km]
    ShowCostPerKm --> ShowEfficiency[Efficiency Metrics]
    ShowEfficiency --> End1([View Report])
    
    SelectReportType -->|Financial Report| LoadFinancial[Load Financial Data]
    LoadFinancial --> CalculateCosts[Calculate All Costs]
    CalculateCosts --> DisplayFinancial[Display Financial Report]
    DisplayFinancial --> ShowFuelCosts[Fuel Costs]
    ShowFuelCosts --> ShowMaintenanceCosts[Maintenance Costs]
    ShowMaintenanceCosts --> ShowTotalCosts[Total Operational Costs]
    ShowTotalCosts --> ShowBudget[Budget Analysis]
    ShowBudget --> End1
    
    SelectReportType -->|Performance Report| LoadPerformance[Load Performance Data]
    LoadPerformance --> AnalyzePerformance[Analyze Performance]
    AnalyzePerformance --> DisplayPerformance[Display Performance Report]
    DisplayPerformance --> ShowDriverPerf[Driver Performance]
    ShowDriverPerf --> ShowVehiclePerf[Vehicle Performance]
    ShowVehiclePerf --> ShowTripSuccess[Trip Success Rate]
    ShowTripSuccess --> ShowSatisfaction[User Satisfaction]
    ShowSatisfaction --> End1
    
    SelectReportType -->|Custom Report| SelectMetrics[Select Metrics]
    SelectMetrics --> SelectPeriod[Select Time Period]
    SelectPeriod --> SelectFilters[Select Filters]
    SelectFilters --> GenerateCustom[Generate Custom Report]
    GenerateCustom --> DisplayCustom[Display Custom Report]
    DisplayCustom --> End1
    
    End1 --> ExportOption{Export Report?}
    ExportOption -->|Yes| SelectFormat{Select Format?}
    SelectFormat -->|PDF| GeneratePDF[Generate PDF]
    SelectFormat -->|Excel| GenerateExcel[Generate Excel]
    SelectFormat -->|CSV| GenerateCSV[Generate CSV]
    GeneratePDF --> Download[Download File]
    GenerateExcel --> Download
    GenerateCSV --> Download
    Download --> End2([File Downloaded])
    ExportOption -->|No| End2
```

---

## 7. Manage Notifications Flow

```mermaid
flowchart TD
    Start([App Running]) --> Connect[Connect WebSocket]
    Connect --> Poll[Poll Notifications Every 30s]
    
    Poll --> CheckNew{New Notifications?}
    CheckNew -->|No| Wait[Wait 30 Seconds]
    Wait --> Poll
    
    CheckNew -->|Yes| UpdateBadge[Update Badge Count]
    UpdateBadge --> CheckType{Notification Type?}
    
    CheckType -->|Maintenance Due| ShowMaintenance[Show Maintenance Alert]
    CheckType -->|Maintenance Overdue| ShowOverdue[Show Overdue Alert]
    CheckType -->|Vehicle Issue| ShowIssue[Show Vehicle Issue]
    CheckType -->|Trip Completed| ShowCompleted[Show Trip Completed]
    CheckType -->|System Alert| ShowSystem[Show System Alert]
    
    ShowMaintenance --> PlaySound[Play Notification Sound]
    ShowOverdue --> PlaySound
    ShowIssue --> PlaySound
    ShowCompleted --> PlaySound
    ShowSystem --> PlaySound
    
    PlaySound --> DisplayList[Display in Notification List]
    DisplayList --> UserClick{User Clicks?}
    
    UserClick -->|No| Poll
    UserClick -->|Yes| MarkRead[Mark as Read]
    MarkRead --> Navigate[Navigate to Related Item]
    Navigate --> End([View Details])
```

---

## 8. Logout Flow

```mermaid
flowchart TD
    Start([Deployment Officer on Dashboard]) --> ClickLogout[Click Logout Button]
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

### Deployment Office App Activity Flows:
1. ✅ Login with role verification
2. ✅ View comprehensive dashboard with all KPIs
3. ✅ Monitor all university trips
4. ✅ Monitor fleet operations (vehicles & drivers)
5. ✅ Manage maintenance (overview, requests, schedule, costs, reports)
6. ✅ Generate comprehensive operational reports
7. ✅ Manage system notifications
8. ✅ Logout with token cleanup

### Key Decision Points:
- **Maintenance request approval** (approve/reject)
- **Report type selection** (operational/financial/performance/custom)
- **Filter and export options** for all data views
- **Multi-source data aggregation** for dashboard
- **Drill-down navigation** for detailed analysis

### Operational Oversight Responsibilities:
- **Monitor all operations** across the university
- **Approve maintenance requests** and manage schedules
- **Track costs** (fuel, maintenance, operational)
- **Generate reports** for decision-making
- **Analyze performance** and efficiency metrics
- **Ensure fleet availability** and readiness
- **Oversee resource utilization** university-wide

### Read-Only Access with Maintenance Authority:
- **View all trips** (cannot modify)
- **View all vehicles and drivers** (cannot modify)
- **Approve/reject maintenance requests** (authority)
- **Generate and export reports** (full access)
- **Monitor real-time operations** (full visibility)
