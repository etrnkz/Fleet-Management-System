# College Dean App - Activity Diagrams

## Actor: College Dean (College Administrator)

---

## 1. College Dean Login Flow

```mermaid
flowchart TD
    Start([College Dean Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = CollegeDean?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. Review Trip with Department Approval Flow

```mermaid
flowchart TD
    Start([Notification: Department Approved]) --> ClickNotif[Click Notification]
    ClickNotif --> OpenDashboard[Open Dashboard]
    OpenDashboard --> ViewPending[View Pending Trips List]
    
    ViewPending --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> ViewPending
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> FetchDetails[Fetch Trip Details]
    FetchDetails --> DisplayDetails[Display Trip Information]
    
    DisplayDetails --> ReviewInfo[Review Trip Details]
    ReviewInfo --> ViewDeptApproval[View Department Approval]
    ViewDeptApproval --> CheckDeptComment{Department Comment?}
    CheckDeptComment -->|Yes| ReadComment[Read Department Comment]
    CheckDeptComment -->|No| ContinueReview[Continue Review]
    ReadComment --> ContinueReview
    
    ContinueReview --> VerifyInfo[Verify: Purpose, Dates, Alignment with College Goals]
    VerifyInfo --> MakeDecision{Decision?}
    
    MakeDecision -->|Need Clarification| ContactDeptHead[Contact Department Head]
    ContactDeptHead --> ReviewInfo
    
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
    NotifyEmployee1 --> NotifyDeptHead1[Notify Department Head]
    NotifyDeptHead1 --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Return to Dashboard])
    
    MakeDecision -->|Approve| ClickApprove[Click Approve Button]
    ClickApprove --> AddComment[Add Optional Comment]
    AddComment --> ConfirmApprove{Confirm Approval?}
    ConfirmApprove -->|No| DisplayDetails
    ConfirmApprove -->|Yes| ApproveTrip[Approve Trip]
    ApproveTrip --> UpdateStatus2[Status: PENDING_PRESIDENT]
    UpdateStatus2 --> NotifyPresident[Notify President]
    NotifyPresident --> NotifyEmployee2[Notify Employee]
    NotifyEmployee2 --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End2([Return to Dashboard])
```

---

## 3. View College Trip History Flow

```mermaid
flowchart TD
    Start([College Dean on Dashboard]) --> ClickHistory[Click Trip History]
    ClickHistory --> LoadTrips[Load College Trips]
    LoadTrips --> DisplayTrips[Display Trips Table]
    
    DisplayTrips --> ChooseAction{What to Do?}
    
    ChooseAction -->|Filter| SelectFilter[Select Filter]
    SelectFilter --> FilterType{Filter Type?}
    FilterType -->|By Status| SelectStatus[Select Status]
    FilterType -->|By Department| SelectDept[Select Department]
    FilterType -->|By Date| SelectDate[Select Date Range]
    FilterType -->|By Requester| SelectRequester[Select Requester]
    SelectStatus --> ApplyFilter[Apply Filter]
    SelectDept --> ApplyFilter
    SelectDate --> ApplyFilter
    SelectRequester --> ApplyFilter
    ApplyFilter --> LoadTrips
    
    ChooseAction -->|View Details| ClickTrip[Click Trip]
    ClickTrip --> ShowDetails[Show Trip Details]
    ShowDetails --> ViewApprovals[View Full Approval Chain]
    ViewApprovals --> CheckChain[Check Department → College Approvals]
    CheckChain --> End1([Close Details])
    
    ChooseAction -->|Export| ClickExport[Click Export]
    ClickExport --> GenerateFile[Generate CSV/Excel]
    GenerateFile --> Download[Download File]
    Download --> End2([File Downloaded])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 4. View College Statistics Flow

```mermaid
flowchart TD
    Start([College Dean on Dashboard]) --> LoadStats[Load Statistics]
    LoadStats --> FetchData[Fetch College Data]
    FetchData --> CalculateMetrics[Calculate Metrics]
    
    CalculateMetrics --> DisplayCards[Display Stat Cards]
    DisplayCards --> ShowPending[Show Pending Count]
    ShowPending --> ShowApproved[Show Approved Count]
    ShowApproved --> ShowRejected[Show Rejected Count]
    ShowRejected --> ShowTotal[Show Total Trips]
    
    ShowTotal --> RenderCharts[Render Charts]
    RenderCharts --> ShowTrends[Show Monthly Trends]
    ShowTrends --> ShowDeptBreakdown[Show Department Breakdown]
    ShowDeptBreakdown --> ShowComparison[Show Period Comparison]
    ShowComparison --> ShowApprovalRate[Show Approval Rate]
    
    ShowApprovalRate --> UserAction{User Action?}
    UserAction -->|Change Period| SelectPeriod[Select Time Period]
    SelectPeriod --> LoadStats
    
    UserAction -->|Filter by Department| SelectDept[Select Department]
    SelectDept --> LoadStats
    
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
    
    CheckType -->|Department Approved Trip| ShowNewTrip[Show New Trip Toast]
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
    Start([College Dean on Dashboard]) --> ClickLogout[Click Logout Button]
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

### College Dean App Activity Flows:
1. ✅ Login with role verification
2. ✅ Review trips with department approval history
3. ✅ Approve/reject trips with comments
4. ✅ View college trip history with department filters
5. ✅ View college statistics by department
6. ✅ Manage real-time notifications
7. ✅ Logout with token cleanup

### Key Decision Points:
- **Review department approval** before making decision
- **Trip approval decision** (approve/reject/need clarification)
- **Rejection reason** validation (required)
- **Department filter** for college-wide view
- **Confirmation dialogs** for critical actions

### Approval Responsibility:
- **Second-level approval** for college trips
- **Review department approval** and comments
- **Verify alignment** with college goals
- **Monitor college-wide activity** across departments
- **Coordinate with department heads** when needed

### Trip Flow Impact:
Department Head approves → **PENDING_COLLEGE** → College Dean approves → **PENDING_PRESIDENT** → President reviews
