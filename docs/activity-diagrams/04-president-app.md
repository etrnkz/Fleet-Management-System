# President App - Activity Diagrams

## Actor: President (University President)

---

## 1. President Login Flow

```mermaid
flowchart TD
    Start([President Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = President?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. Final Approval of Trip Request Flow

```mermaid
flowchart TD
    Start([Notification: College Approved]) --> ClickNotif[Click Notification]
    ClickNotif --> OpenDashboard[Open Dashboard]
    OpenDashboard --> ViewPending[View Pending Trips List]
    
    ViewPending --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> ViewPending
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> FetchDetails[Fetch Trip Details]
    FetchDetails --> DisplayDetails[Display Trip Information]
    
    DisplayDetails --> ReviewInfo[Review Trip Details]
    ReviewInfo --> ViewApprovalChain[View Full Approval Chain]
    ViewApprovalChain --> CheckDeptApproval[Check Department Approval]
    CheckDeptApproval --> CheckCollegeApproval[Check College Approval]
    CheckCollegeApproval --> ReadComments[Read All Comments]
    
    ReadComments --> VerifyInfo[Verify: Strategic Alignment, Budget, Priority]
    VerifyInfo --> MakeDecision{Decision?}
    
    MakeDecision -->|Need Discussion| ContactDean[Contact College Dean]
    ContactDean --> ReviewInfo
    
    MakeDecision -->|Reject| ClickReject[Click Reject Button]
    ClickReject --> EnterReason[Enter Rejection Reason]
    EnterReason --> ValidateReason{Reason Provided?}
    ValidateReason -->|No| ShowError1[Reason Required]
    ShowError1 --> EnterReason
    ValidateReason -->|Yes| ConfirmReject{Confirm Rejection?}
    ConfirmReject -->|No| DisplayDetails
    ConfirmReject -->|Yes| RejectTrip[Reject Trip]
    RejectTrip --> UpdateStatus1[Status: REJECTED]
    UpdateStatus1 --> NotifyAll1[Notify All Stakeholders]
    NotifyAll1 --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Return to Dashboard])
    
    MakeDecision -->|Approve| ClickApprove[Click Approve Button]
    ClickApprove --> AddComment[Add Optional Comment]
    AddComment --> ConfirmApprove{Confirm Final Approval?}
    ConfirmApprove -->|No| DisplayDetails
    ConfirmApprove -->|Yes| ApproveTrip[Give Final Approval]
    ApproveTrip --> UpdateStatus2[Status: APPROVED_FOR_ALLOCATION]
    UpdateStatus2 --> NotifyTransportAdmin[Notify Transport Admin]
    NotifyTransportAdmin --> NotifyEmployee[Notify Employee]
    NotifyEmployee --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End2([Return to Dashboard])
```

---

## 3. View University-Wide Statistics Flow

```mermaid
flowchart TD
    Start([President on Dashboard]) --> LoadStats[Load University Statistics]
    LoadStats --> FetchAllData[Fetch All University Data]
    FetchAllData --> CalculateMetrics[Calculate Comprehensive Metrics]
    
    CalculateMetrics --> DisplayCards[Display Stat Cards]
    DisplayCards --> ShowTotal[Show Total Trips]
    ShowTotal --> ShowPending[Show Pending Count]
    ShowPending --> ShowApproved[Show Approved Count]
    ShowApproved --> ShowRejected[Show Rejected Count]
    ShowRejected --> ShowActive[Show Active Trips]
    
    ShowActive --> RenderCharts[Render Charts]
    RenderCharts --> ShowTrends[Show Monthly Trends]
    ShowTrends --> ShowCollegeBreakdown[Show College Breakdown]
    ShowCollegeBreakdown --> ShowDeptBreakdown[Show Department Breakdown]
    ShowDeptBreakdown --> ShowApprovalRate[Show Approval Rates]
    ShowApprovalRate --> ShowFleetUtil[Show Fleet Utilization]
    
    ShowFleetUtil --> UserAction{User Action?}
    UserAction -->|Change Period| SelectPeriod[Select Time Period]
    SelectPeriod --> LoadStats
    
    UserAction -->|Filter by College| SelectCollege[Select College]
    SelectCollege --> LoadStats
    
    UserAction -->|Filter by Department| SelectDept[Select Department]
    SelectDept --> LoadStats
    
    UserAction -->|View Details| DrillDown[Drill Down to Details]
    DrillDown --> End1([View Detailed Report])
    
    UserAction -->|Export| GenerateReport[Generate PDF/Excel]
    GenerateReport --> Download[Download Report]
    Download --> End2([Report Downloaded])
    
    UserAction -->|Refresh| LoadStats
    UserAction -->|Close| End3([Stay on Dashboard])
```

---

## 4. View Fleet Overview Flow

```mermaid
flowchart TD
    Start([President on Dashboard]) --> ClickFleet[Click Fleet Overview]
    ClickFleet --> FetchFleetData[Fetch Fleet Data]
    FetchFleetData --> DisplayOverview[Display Fleet Overview]
    
    DisplayOverview --> ShowMetrics[Show Fleet Metrics]
    ShowMetrics --> ShowTotalVehicles[Total Vehicles]
    ShowTotalVehicles --> ShowActive[Active Vehicles]
    ShowActive --> ShowMaintenance[In Maintenance]
    ShowMaintenance --> ShowUtilization[Utilization Rate]
    
    ShowUtilization --> ShowCharts[Show Charts]
    ShowCharts --> VehicleStatus[Vehicle Status Distribution]
    VehicleStatus --> UsageTrends[Usage Trends]
    UsageTrends --> MaintenanceCosts[Maintenance Costs]
    
    MaintenanceCosts --> UserAction{User Action?}
    UserAction -->|View Vehicle Details| SelectVehicle[Select Vehicle]
    SelectVehicle --> ShowVehicleInfo[Show Vehicle Info]
    ShowVehicleInfo --> End1([View Details])
    
    UserAction -->|View Reports| NavigateReports[Navigate to Reports]
    NavigateReports --> End2([View Reports])
    
    UserAction -->|Close| End3([Return to Dashboard])
```

---

## 5. View University-Wide Trip History Flow

```mermaid
flowchart TD
    Start([President on Dashboard]) --> ClickHistory[Click Trip History]
    ClickHistory --> LoadTrips[Load All University Trips]
    LoadTrips --> DisplayTrips[Display Trips Table]
    
    DisplayTrips --> ChooseAction{What to Do?}
    
    ChooseAction -->|Advanced Filter| SelectFilters[Select Multiple Filters]
    SelectFilters --> FilterOptions{Filter Options?}
    FilterOptions -->|By Status| SelectStatus[Select Status]
    FilterOptions -->|By College| SelectCollege[Select College]
    FilterOptions -->|By Department| SelectDept[Select Department]
    FilterOptions -->|By Date Range| SelectDate[Select Date Range]
    FilterOptions -->|By Requester| SelectRequester[Select Requester]
    SelectStatus --> ApplyFilters[Apply All Filters]
    SelectCollege --> ApplyFilters
    SelectDept --> ApplyFilters
    SelectDate --> ApplyFilters
    SelectRequester --> ApplyFilters
    ApplyFilters --> LoadTrips
    
    ChooseAction -->|View Details| ClickTrip[Click Trip]
    ClickTrip --> ShowDetails[Show Trip Details]
    ShowDetails --> ViewFullChain[View Complete Approval Chain]
    ViewFullChain --> CheckAllApprovals[Check Dept → College → President]
    CheckAllApprovals --> End1([Close Details])
    
    ChooseAction -->|Export| ClickExport[Click Export]
    ClickExport --> SelectFormat{Export Format?}
    SelectFormat -->|CSV| GenerateCSV[Generate CSV]
    SelectFormat -->|Excel| GenerateExcel[Generate Excel]
    SelectFormat -->|PDF| GeneratePDF[Generate PDF]
    GenerateCSV --> Download[Download File]
    GenerateExcel --> Download
    GeneratePDF --> Download
    Download --> End2([File Downloaded])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 6. Manage Notifications Flow

```mermaid
flowchart TD
    Start([App Running]) --> Connect[Connect WebSocket]
    Connect --> Poll[Poll Notifications Every 30s]
    
    Poll --> CheckNew{New Notifications?}
    CheckNew -->|No| Wait[Wait 30 Seconds]
    Wait --> Poll
    
    CheckNew -->|Yes| UpdateBadge[Update Badge Count]
    UpdateBadge --> CheckType{Notification Type?}
    
    CheckType -->|College Approved Trip| ShowNewTrip[Show New Trip Toast]
    CheckType -->|High Priority Trip| ShowPriority[Show Priority Alert]
    CheckType -->|Trip Cancelled| ShowCancelled[Show Cancellation Toast]
    CheckType -->|System Alert| ShowAlert[Show System Alert]
    
    ShowNewTrip --> PlaySound[Play Notification Sound]
    ShowPriority --> PlaySound
    ShowCancelled --> PlaySound
    ShowAlert --> PlaySound
    
    PlaySound --> DisplayList[Display in Notification List]
    DisplayList --> UserClick{User Clicks?}
    
    UserClick -->|No| Poll
    UserClick -->|Yes| MarkRead[Mark as Read]
    MarkRead --> Navigate[Navigate to Related Item]
    Navigate --> End([View Details])
```

---

## 7. Logout Flow

```mermaid
flowchart TD
    Start([President on Dashboard]) --> ClickLogout[Click Logout Button]
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

### President App Activity Flows:
1. ✅ Login with highest-level role verification
2. ✅ Final approval with full approval chain review
3. ✅ View university-wide statistics
4. ✅ View fleet overview and utilization
5. ✅ View all university trips with advanced filters
6. ✅ Manage high-priority notifications
7. ✅ Logout with token cleanup

### Key Decision Points:
- **Review complete approval chain** (Dept → College → President)
- **Strategic alignment** verification
- **Budget and priority** considerations
- **Final approval decision** (approve/reject/discuss)
- **University-wide oversight** across all colleges

### Approval Responsibility:
- **Final approval authority** for all trips
- **Strategic decision-making** for university resources
- **Review all previous approvals** and comments
- **Monitor university-wide** trip activity
- **Ensure alignment** with institutional goals

### Trip Flow Impact:
College Dean approves → **PENDING_PRESIDENT** → President approves → **APPROVED_FOR_ALLOCATION** → Transport Admin allocates resources
