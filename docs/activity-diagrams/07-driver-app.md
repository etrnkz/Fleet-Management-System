# Driver App - Activity Diagrams

## Actor: Driver (Vehicle Operator)

---

## 1. Driver Login Flow

```mermaid
flowchart TD
    Start([Driver Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = Driver?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. View Assigned Trips Flow

```mermaid
flowchart TD
    Start([Driver on Dashboard]) --> LoadTrips[Load Assigned Trips]
    LoadTrips --> DisplayTrips[Display Trips List]
    
    DisplayTrips --> GroupTrips[Group by Status]
    GroupTrips --> ShowUpcoming[Show Upcoming Trips]
    ShowUpcoming --> ShowInProgress[Show In-Progress Trips]
    ShowInProgress --> ShowCompleted[Show Completed Trips]
    
    ShowCompleted --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> SelectTrip
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> FetchDetails[Fetch Trip Details]
    FetchDetails --> DisplayDetails[Display Trip Details]
    DisplayDetails --> ShowInfo[Show: Destination, Dates, Passengers, Vehicle]
    ShowInfo --> ShowRequester[Show Requester Info]
    ShowRequester --> ShowRoute[Show Route/Map]
    ShowRoute --> End([View Details])
```

---

## 3. Start Trip Flow

```mermaid
flowchart TD
    Start([Driver Views Assigned Trip]) --> CheckStatus{Trip Status?}
    CheckStatus -->|Not CAR_ALLOCATED| ShowError1[Cannot Start Trip]
    ShowError1 --> End1([Return to Dashboard])
    
    CheckStatus -->|CAR_ALLOCATED| CheckDate{Start Date Today?}
    CheckDate -->|No| ShowError2[Cannot Start Yet]
    ShowError2 --> End1
    
    CheckDate -->|Yes| ClickStart[Click Start Trip]
    ClickStart --> ShowConfirm[Show Confirmation Dialog]
    ShowConfirm --> ConfirmStart{Confirm Start?}
    ConfirmStart -->|No| End1
    
    ConfirmStart -->|Yes| CheckVehicle[Pre-Trip Vehicle Check]
    CheckVehicle --> VehicleOK{Vehicle OK?}
    VehicleOK -->|No| ReportIssue[Report Vehicle Issue]
    ReportIssue --> NotifyMaintenance[Notify Maintenance]
    NotifyMaintenance --> End2([Cannot Start])
    
    VehicleOK -->|Yes| RecordOdometer[Record Starting Odometer]
    RecordOdometer --> ValidateOdometer{Valid Reading?}
    ValidateOdometer -->|No| ShowError3[Invalid Odometer]
    ShowError3 --> RecordOdometer
    
    ValidateOdometer -->|Yes| StartTrip[Start Trip]
    StartTrip --> UpdateStatus[Status: IN_PROGRESS]
    UpdateStatus --> RecordStartTime[Record Start Time]
    RecordStartTime --> NotifyEmployee[Notify Employee]
    NotifyEmployee --> ShowSuccess[Show Success Message]
    ShowSuccess --> EnableTracking[Enable GPS Tracking]
    EnableTracking --> End3([Trip Started])
```

---

## 4. Complete Trip Flow

```mermaid
flowchart TD
    Start([Driver on Active Trip]) --> CheckStatus{Trip Status?}
    CheckStatus -->|Not IN_PROGRESS| ShowError1[Cannot Complete]
    ShowError1 --> End1([Return to Dashboard])
    
    CheckStatus -->|IN_PROGRESS| ClickComplete[Click Complete Trip]
    ClickComplete --> ShowForm[Show Completion Form]
    ShowForm --> RecordEndOdometer[Record Ending Odometer]
    RecordEndOdometer --> ValidateOdometer{Valid Reading?}
    ValidateOdometer -->|No| ShowError2[Invalid Odometer]
    ShowError2 --> RecordEndOdometer
    
    ValidateOdometer -->|Yes| CheckGreater{End > Start?}
    CheckGreater -->|No| ShowError3[End Must Be Greater]
    ShowError3 --> RecordEndOdometer
    
    CheckGreater -->|Yes| AddNotes[Add Optional Notes]
    AddNotes --> ReportIssues{Any Issues?}
    ReportIssues -->|Yes| EnterIssues[Enter Issue Details]
    EnterIssues --> ContinueComplete[Continue Completion]
    ReportIssues -->|No| ContinueComplete
    
    ContinueComplete --> ConfirmComplete{Confirm Completion?}
    ConfirmComplete -->|No| ShowForm
    
    ConfirmComplete -->|Yes| CompleteTrip[Complete Trip]
    CompleteTrip --> UpdateStatus[Status: COMPLETED]
    UpdateStatus --> RecordEndTime[Record End Time]
    RecordEndTime --> CalculateDistance[Calculate Distance]
    CalculateDistance --> NotifyEmployee[Notify Employee]
    NotifyEmployee --> NotifyTransportAdmin[Notify Transport Admin]
    NotifyTransportAdmin --> ShowSuccess[Show Success Message]
    ShowSuccess --> DisableTracking[Disable GPS Tracking]
    DisableTracking --> End2([Trip Completed])
```

---

## 5. Report Issue During Trip Flow

```mermaid
flowchart TD
    Start([Driver on Active Trip]) --> ClickReport[Click Report Issue]
    ClickReport --> ShowForm[Show Issue Report Form]
    ShowForm --> SelectType{Issue Type?}
    
    SelectType -->|Vehicle Problem| SelectVehicleIssue[Select Vehicle Issue]
    SelectVehicleIssue --> EnterDetails1[Enter Issue Details]
    EnterDetails1 --> AddPhotos1[Add Photos Optional]
    AddPhotos1 --> SubmitIssue1[Submit Issue]
    SubmitIssue1 --> NotifyMaintenance[Notify Maintenance Team]
    NotifyMaintenance --> CheckSeverity1{Severe Issue?}
    CheckSeverity1 -->|Yes| SuggestAbort[Suggest Abort Trip]
    SuggestAbort --> End1([Issue Reported])
    CheckSeverity1 -->|No| ContinueTrip1[Continue Trip]
    ContinueTrip1 --> End1
    
    SelectType -->|Route Problem| EnterRouteIssue[Enter Route Issue]
    EnterRouteIssue --> AddLocation[Add Location]
    AddLocation --> SubmitIssue2[Submit Issue]
    SubmitIssue2 --> NotifyTransportAdmin[Notify Transport Admin]
    NotifyTransportAdmin --> End1
    
    SelectType -->|Passenger Issue| EnterPassengerIssue[Enter Passenger Issue]
    EnterPassengerIssue --> SubmitIssue3[Submit Issue]
    SubmitIssue3 --> NotifyRequester[Notify Trip Requester]
    NotifyRequester --> End1
    
    SelectType -->|Emergency| EnterEmergency[Enter Emergency Details]
    EnterEmergency --> SubmitEmergency[Submit Emergency]
    SubmitEmergency --> NotifyAll[Notify All Stakeholders]
    NotifyAll --> ShowEmergencyContact[Show Emergency Contacts]
    ShowEmergencyContact --> End2([Emergency Reported])
```

---

## 6. View Trip History Flow

```mermaid
flowchart TD
    Start([Driver on Dashboard]) --> ClickHistory[Click Trip History]
    ClickHistory --> LoadHistory[Load Driver's Trip History]
    LoadHistory --> DisplayHistory[Display Trips List]
    
    DisplayHistory --> ChooseAction{What to Do?}
    
    ChooseAction -->|Filter| SelectFilter{Filter Type?}
    SelectFilter -->|By Date| SelectDate[Select Date Range]
    SelectFilter -->|By Status| SelectStatus[Select Status]
    SelectDate --> ApplyFilter[Apply Filter]
    SelectStatus --> ApplyFilter
    ApplyFilter --> LoadHistory
    
    ChooseAction -->|View Details| SelectTrip[Select Trip]
    SelectTrip --> ShowDetails[Show Trip Details]
    ShowDetails --> ViewRoute[View Route Taken]
    ViewRoute --> ViewFeedback[View Employee Feedback]
    ViewFeedback --> ViewRating[View Rating]
    ViewRating --> End1([Close Details])
    
    ChooseAction -->|View Stats| ShowStats[Show Driver Statistics]
    ShowStats --> ShowTotalTrips[Total Trips]
    ShowTotalTrips --> ShowAvgRating[Average Rating]
    ShowAvgRating --> ShowTotalDistance[Total Distance]
    ShowTotalDistance --> ShowMonthlyTrends[Monthly Trends]
    ShowMonthlyTrends --> End2([View Stats])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 7. Update Profile Flow

```mermaid
flowchart TD
    Start([Driver on Dashboard]) --> ClickProfile[Click Profile/Settings]
    ClickProfile --> LoadProfile[Load Driver Profile]
    LoadProfile --> DisplayProfile[Display Profile]
    
    DisplayProfile --> ChooseAction{What to Update?}
    
    ChooseAction -->|Personal Info| EditInfo[Edit Phone/Email]
    EditInfo --> ValidateInfo{Valid Input?}
    ValidateInfo -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EditInfo
    ValidateInfo -->|Yes| SaveInfo[Save Information]
    SaveInfo --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Profile Updated])
    
    ChooseAction -->|Profile Picture| ClickUpload[Click Upload Photo]
    ClickUpload --> SelectFile[Select Image File]
    SelectFile --> ValidateFile{Valid Image?}
    ValidateFile -->|No| ShowError2[Show File Error]
    ShowError2 --> SelectFile
    ValidateFile -->|Yes| UploadImage[Upload Image]
    UploadImage --> SaveURL[Save Image URL]
    SaveURL --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End1
    
    ChooseAction -->|Password| ClickChangePass[Click Change Password]
    ClickChangePass --> EnterPasswords[Enter Current & New Password]
    EnterPasswords --> ValidatePass{Passwords Valid?}
    ValidatePass -->|No| ShowError3[Show Validation Error]
    ShowError3 --> EnterPasswords
    ValidatePass -->|Yes| VerifyCurrent{Current Password Correct?}
    VerifyCurrent -->|No| ShowError4[Show Incorrect Password]
    ShowError4 --> EnterPasswords
    VerifyCurrent -->|Yes| UpdatePassword[Update Password]
    UpdatePassword --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> End1
    
    ChooseAction -->|License Info| UpdateLicense[Update License Info]
    UpdateLicense --> EnterLicenseDetails[Enter License Details]
    EnterLicenseDetails --> ValidateLicense{Valid License?}
    ValidateLicense -->|No| ShowError5[Show Validation Error]
    ShowError5 --> EnterLicenseDetails
    ValidateLicense -->|Yes| SaveLicense[Save License Info]
    SaveLicense --> ShowSuccess4[Show Success Message]
    ShowSuccess4 --> End1
```

---

## 8. Manage Notifications Flow

```mermaid
flowchart TD
    Start([App Running]) --> Connect[Connect WebSocket]
    Connect --> Poll[Poll Notifications Every 30s]
    
    Poll --> CheckNew{New Notifications?}
    CheckNew -->|No| Wait[Wait 30 Seconds]
    Wait --> Poll
    
    CheckNew -->|Yes| UpdateBadge[Update Badge Count]
    UpdateBadge --> CheckType{Notification Type?}
    
    CheckType -->|New Trip Assigned| ShowNewTrip[Show New Trip Alert]
    CheckType -->|Trip Starting Soon| ShowReminder[Show Trip Reminder]
    CheckType -->|Trip Modified| ShowModified[Show Modification Alert]
    CheckType -->|Trip Cancelled| ShowCancelled[Show Cancellation]
    CheckType -->|Feedback Received| ShowFeedback[Show Feedback Notification]
    
    ShowNewTrip --> PlaySound[Play Notification Sound]
    ShowReminder --> PlaySound
    ShowModified --> PlaySound
    ShowCancelled --> PlaySound
    ShowFeedback --> PlaySound
    
    PlaySound --> DisplayList[Display in Notification List]
    DisplayList --> UserClick{User Clicks?}
    
    UserClick -->|No| Poll
    UserClick -->|Yes| MarkRead[Mark as Read]
    MarkRead --> Navigate[Navigate to Trip]
    Navigate --> End([View Trip Details])
```

---

## 9. Logout Flow

```mermaid
flowchart TD
    Start([Driver on Dashboard]) --> ClickLogout[Click Logout Button]
    ClickLogout --> CheckActiveTrip{Active Trip?}
    CheckActiveTrip -->|Yes| ShowWarning[Show Warning: Active Trip]
    ShowWarning --> ConfirmLogout1{Still Logout?}
    ConfirmLogout1 -->|No| End1([Stay Logged In])
    
    CheckActiveTrip -->|No| ConfirmLogout2{Confirm Logout?}
    ConfirmLogout2 -->|No| End1
    
    ConfirmLogout1 -->|Yes| SendLogout[Send Logout Request]
    ConfirmLogout2 -->|Yes| SendLogout
    SendLogout --> BlacklistToken[Blacklist JWT Token]
    BlacklistToken --> ClearStorage[Clear localStorage]
    ClearStorage --> DisconnectWS[Disconnect WebSocket]
    DisconnectWS --> DisableTracking[Disable GPS Tracking]
    DisableTracking --> Redirect[Redirect to Landing Page]
    Redirect --> End2([Logged Out])
```

---

## Summary

### Driver App Activity Flows:
1. ✅ Login with role verification
2. ✅ View assigned trips (upcoming, in-progress, completed)
3. ✅ Start trip with vehicle check and odometer reading
4. ✅ Complete trip with odometer and notes
5. ✅ Report issues during trip (vehicle, route, passenger, emergency)
6. ✅ View trip history and statistics
7. ✅ Update profile (info, picture, password, license)
8. ✅ Manage real-time notifications
9. ✅ Logout with active trip warning

### Key Decision Points:
- **Trip status validation** before start/complete
- **Vehicle condition check** before starting
- **Odometer validation** (end > start)
- **Issue severity assessment** for reporting
- **Active trip warning** before logout

### Driver Responsibilities:
- **Accept assigned trips** from transport admin
- **Perform pre-trip checks** on vehicle
- **Start and complete trips** with accurate records
- **Report issues** promptly during trips
- **Maintain vehicle** in good condition
- **Provide safe transportation** for passengers
- **Record accurate odometer** readings

### Trip Flow Impact:
Transport Admin allocates → **CAR_ALLOCATED** → Driver starts → **IN_PROGRESS** → Driver completes → **COMPLETED** → Employee provides feedback
