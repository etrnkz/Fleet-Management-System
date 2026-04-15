# Department Head App - Activity Diagrams

## Actor: Department Head (Faculty Department Leader)

---

## 1. Department Head Login Flow

```mermaid
flowchart TD
    Start([Department Head Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = DepartmentHead?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. Review and Approve Trip Request Flow

```mermaid
flowchart TD
    Start([Notification: New Trip]) --> ClickNotif[Click Notification]
    ClickNotif --> OpenDashboard[Open Dashboard]
    OpenDashboard --> ViewPending[View Pending Trips List]
    
    ViewPending --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> ViewPending
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> FetchDetails[Fetch Trip Details]
    FetchDetails --> DisplayDetails[Display Trip Information]
    
    DisplayDetails --> ReviewInfo[Review Trip Details]
    ReviewInfo --> CheckInfo[Check: Destination, Purpose, Dates, Passengers]
    CheckInfo --> MakeDecision{Decision?}
    
    MakeDecision -->|Need More Info| ContactEmployee[Contact Employee]
    ContactEmployee --> ReviewInfo
    
    MakeDecision -->|Reject| ClickReject[Click Reject Button]
    ClickReject --> EnterReason[Enter Rejection Reason]
    EnterReason --> ValidateReason{Reason Provided?}
    ValidateReason -->|No| ShowError1[Reason Required]
    ShowError1 --> EnterReason
    ValidateReason -->|Yes| ConfirmReject{Confirm Rejection?}
    ConfirmReject -->|No| DisplayDetails
    ConfirmReject -->|Yes| RejectTrip[Reject Trip]
    RejectTrip --> UpdateStatus1[Status: REJECTED]
    UpdateStatus1 --> NotifyEmployee1[Notify Employee]
    NotifyEmployee1 --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Return to Dashboard])
    
    MakeDecision -->|Approve| ClickApprove[Click Approve Button]
    ClickApprove --> AddComment[Add Optional Comment]
    AddComment --> ConfirmApprove{Confirm Approval?}
    ConfirmApprove -->|No| DisplayDetails
    ConfirmApprove -->|Yes| ApproveTrip[Approve Trip]
    ApproveTrip --> UpdateStatus2[Status: PENDING_COLLEGE]
    UpdateStatus2 --> NotifyCollegeDean[Notify College Dean]
    NotifyCollegeDean --> NotifyEmployee2[Notify Employee]
    NotifyEmployee2 --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End2([Return to Dashboard])
```

---

## 3. View Department Trip History Flow

```mermaid
flowchart TD
    Start([Department Head on Dashboard]) --> ClickHistory[Click Trip History]
    ClickHistory --> LoadTrips[Load Department Trips]
    LoadTrips --> DisplayTrips[Display Trips Table]
    
    DisplayTrips --> ChooseAction{What to Do?}
    
    ChooseAction -->|Filter| SelectFilter[Select Filter]
    SelectFilter --> FilterType{Filter Type?}
    FilterType -->|By Status| SelectStatus[Select Status]
    FilterType -->|By Date| SelectDate[Select Date Range]
    FilterType -->|By Requester| SelectRequester[Select Requester]
    SelectStatus --> ApplyFilter[Apply Filter]
    SelectDate --> ApplyFilter
    SelectRequester --> ApplyFilter
    ApplyFilter --> LoadTrips
    
    ChooseAction -->|View Details| ClickTrip[Click Trip]
    ClickTrip --> ShowDetails[Show Trip Details]
    ShowDetails --> ViewApproval[View Approval History]
    ViewApproval --> End1([Close Details])
    
    ChooseAction -->|Export| ClickExport[Click Export]
    ClickExport --> GenerateFile[Generate CSV/Excel]
    GenerateFile --> Download[Download File]
    Download --> End2([File Downloaded])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 4. View Department Statistics Flow

```mermaid
flowchart TD
    Start([Department Head on Dashboard]) --> LoadStats[Load Statistics]
    LoadStats --> FetchData[Fetch Department Data]
    FetchData --> CalculateMetrics[Calculate Metrics]
    
    CalculateMetrics --> DisplayCards[Display Stat Cards]
    DisplayCards --> ShowPending[Show Pending Count]
    ShowPending --> ShowApproved[Show Approved Count]
    ShowApproved --> ShowRejected[Show Rejected Count]
    ShowRejected --> ShowTotal[Show Total Trips]
    
    ShowTotal --> RenderCharts[Render Charts]
    RenderCharts --> ShowTrends[Show Monthly Trends]
    ShowTrends --> ShowBreakdown[Show Status Breakdown]
    ShowBreakdown --> ShowComparison[Show Period Comparison]
    
    ShowComparison --> UserAction{User Action?}
    UserAction -->|Change Period| SelectPeriod[Select Time Period]
    SelectPeriod --> LoadStats
    
    UserAction -->|View Details| DrillDown[Drill Down to Details]
    DrillDown --> End1([View Detailed Report])
    
    UserAction -->|Refresh| LoadStats
    UserAction -->|Close| End2([Stay on Dashboard])
```

---

## 5. Manage Notifications Flow

```mermaid
flowchart TD
    Start([App Running]) --> Connect[Connect WebSocket]
    Connect --> Poll[Poll Notifications Every 30s]
    
    Poll --> CheckNew{New Notifications?}
    CheckNew -->|No| Wait[Wait 30 Seconds]
    Wait --> Poll
    
    CheckNew -->|Yes| UpdateBadge[Update Badge Count]
    UpdateBadge --> CheckType{Notification Type?}
    
    CheckType -->|New Trip Submitted| ShowNewTrip[Show New Trip Toast]
    CheckType -->|Trip Cancelled| ShowCancelled[Show Cancellation Toast]
    CheckType -->|Trip Updated| ShowUpdated[Show Update Toast]
    
    ShowNewTrip --> PlaySound[Play Notification Sound]
    ShowCancelled --> PlaySound
    ShowUpdated --> PlaySound
    
    PlaySound --> DisplayList[Display in Notification List]
    DisplayList --> UserClick{User Clicks?}
    
    UserClick -->|No| Poll
    UserClick -->|Yes| MarkRead[Mark as Read]
    MarkRead --> Navigate[Navigate to Trip]
    Navigate --> End([View Trip Details])
```

---

## 6. Logout Flow

```mermaid
flowchart TD
    Start([Department Head on Dashboard]) --> ClickLogout[Click Logout Button]
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

### Department Head App Activity Flows:
1. ✅ Login with role verification
2. ✅ Review and approve/reject trip requests
3. ✅ View department trip history with filters
4. ✅ View department statistics and trends
5. ✅ Manage real-time notifications
6. ✅ Logout with token cleanup

### Key Decision Points:
- **Trip approval decision** (approve/reject/need more info)
- **Rejection reason** validation (required)
- **Confirmation dialogs** for critical actions
- **Filter selection** for trip history
- **Real-time notifications** for new submissions

### Approval Responsibility:
- **First-level approval** for department trips
- **Review trip details** before decision
- **Provide rejection reasons** when declining
- **Monitor department activity** through statistics
- **Respond to notifications** promptly

### Trip Flow Impact:
Employee submits → **PENDING_DEPARTMENT** → Department Head approves → **PENDING_COLLEGE** → College Dean reviews
