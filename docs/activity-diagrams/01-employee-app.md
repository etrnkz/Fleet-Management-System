# Employee App - Activity Diagrams

## Actor: Employee (University Staff/Faculty)

---

## 1. Employee Login Flow

```mermaid
flowchart TD
    Start([Employee Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = Employee?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. Create and Submit Trip Request Flow

```mermaid
flowchart TD
    Start([Employee on Dashboard]) --> ClickNew[Click New Trip Request]
    ClickNew --> LoadForm[Load Trip Request Form]
    LoadForm --> FetchDepts[Fetch Departments]
    FetchDepts --> FetchColleges[Fetch Colleges]
    FetchColleges --> DisplayForm[Display Form]
    
    DisplayForm --> FillForm[Fill Trip Details]
    FillForm --> ValidateForm{Form Complete?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> FillForm
    
    ValidateForm -->|Yes| ChooseAction{Save or Submit?}
    ChooseAction -->|Save as Draft| SaveDraft[Save Trip as Draft]
    SaveDraft --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Return to My Trips])
    
    ChooseAction -->|Submit| ConfirmSubmit{Confirm Submission?}
    ConfirmSubmit -->|No| FillForm
    ConfirmSubmit -->|Yes| SubmitTrip[Submit Trip Request]
    SubmitTrip --> UpdateStatus[Status: PENDING_DEPARTMENT]
    UpdateStatus --> NotifyDeptHead[Notify Department Head]
    NotifyDeptHead --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End2([Return to My Trips])
```

---

## 3. View Trip Status Flow

```mermaid
flowchart TD
    Start([Employee on Dashboard]) --> ClickMyTrips[Click My Trips]
    ClickMyTrips --> FetchTrips[Fetch User's Trips]
    FetchTrips --> DisplayTrips[Display Trips List]
    
    DisplayTrips --> SelectTrip{Select Trip?}
    SelectTrip -->|No| Wait[Wait for Action]
    Wait --> SelectTrip
    
    SelectTrip -->|Yes| ClickTrip[Click Trip Card]
    ClickTrip --> FetchDetails[Fetch Trip Details]
    FetchDetails --> ShowDetails[Show Trip Details Modal]
    
    ShowDetails --> CheckStatus{Trip Status?}
    CheckStatus -->|DRAFT| ShowDraftActions[Show Edit/Submit/Cancel]
    CheckStatus -->|PENDING_*| ShowPendingActions[Show Cancel Option]
    CheckStatus -->|APPROVED_FOR_ALLOCATION| ShowWaiting[Show Waiting for Vehicle]
    CheckStatus -->|CAR_ALLOCATED| ShowAllocated[Show Vehicle & Driver Info]
    CheckStatus -->|IN_PROGRESS| ShowInProgress[Show Trip in Progress]
    CheckStatus -->|COMPLETED| ShowCompleted[Show Feedback Option]
    CheckStatus -->|REJECTED| ShowRejected[Show Rejection Reason]
    CheckStatus -->|CANCELLED| ShowCancelled[Show Cancellation Info]
    
    ShowDraftActions --> End([Close Modal])
    ShowPendingActions --> End
    ShowWaiting --> End
    ShowAllocated --> End
    ShowInProgress --> End
    ShowCompleted --> End
    ShowRejected --> End
    ShowCancelled --> End
```

---

## 4. Cancel Trip Request Flow

```mermaid
flowchart TD
    Start([Employee Viewing Trip]) --> ClickCancel[Click Cancel Button]
    ClickCancel --> CheckStatus{Trip Status?}
    
    CheckStatus -->|IN_PROGRESS| ShowError1[Cannot Cancel Active Trip]
    ShowError1 --> End1([Return to Trip View])
    
    CheckStatus -->|COMPLETED| ShowError2[Cannot Cancel Completed Trip]
    ShowError2 --> End1
    
    CheckStatus -->|REJECTED| ShowError3[Already Rejected]
    ShowError3 --> End1
    
    CheckStatus -->|CANCELLED| ShowError4[Already Cancelled]
    ShowError4 --> End1
    
    CheckStatus -->|Cancellable| ShowConfirm[Show Confirmation Dialog]
    ShowConfirm --> ConfirmCancel{Confirm?}
    ConfirmCancel -->|No| End1
    ConfirmCancel -->|Yes| CancelTrip[Cancel Trip Request]
    CancelTrip --> UpdateStatus[Status: CANCELLED]
    UpdateStatus --> NotifyApprovers[Notify Approvers]
    NotifyApprovers --> ShowSuccess[Show Success Message]
    ShowSuccess --> End2([Return to My Trips])
```

---

## 5. Provide Trip Feedback Flow

```mermaid
flowchart TD
    Start([Trip Completed Notification]) --> ClickNotif[Click Notification]
    ClickNotif --> OpenTrip[Open Trip Details]
    OpenTrip --> CheckStatus{Status = COMPLETED?}
    
    CheckStatus -->|No| ShowError[Cannot Provide Feedback]
    ShowError --> End1([Close])
    
    CheckStatus -->|Yes| CheckFeedback{Feedback Given?}
    CheckFeedback -->|Yes| ShowExisting[Show Existing Feedback]
    ShowExisting --> End1
    
    CheckFeedback -->|No| ShowForm[Show Feedback Form]
    ShowForm --> SelectRating[Select Rating 1-5 Stars]
    SelectRating --> WriteComment[Write Optional Comment]
    WriteComment --> ValidateRating{Rating Selected?}
    
    ValidateRating -->|No| ShowValidation[Show Validation Error]
    ShowValidation --> SelectRating
    
    ValidateRating -->|Yes| SubmitFeedback[Submit Feedback]
    SubmitFeedback --> SaveFeedback[Save to Database]
    SaveFeedback --> ShowThankYou[Show Thank You Message]
    ShowThankYou --> End2([Close Modal])
```

---

## 6. Update Profile Flow

```mermaid
flowchart TD
    Start([Employee on Dashboard]) --> ClickSettings[Click Settings/Profile]
    ClickSettings --> FetchProfile[Fetch User Profile]
    FetchProfile --> DisplayProfile[Display Profile Form]
    
    DisplayProfile --> ChooseAction{What to Update?}
    
    ChooseAction -->|Profile Info| EditInfo[Edit Name/Phone]
    EditInfo --> ValidateInfo{Valid Input?}
    ValidateInfo -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EditInfo
    ValidateInfo -->|Yes| SaveInfo[Save Profile Info]
    SaveInfo --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End([Profile Updated])
    
    ChooseAction -->|Profile Picture| ClickUpload[Click Upload Photo]
    ClickUpload --> SelectFile[Select Image File]
    SelectFile --> ValidateFile{Valid Image?}
    ValidateFile -->|No| ShowError2[Show File Error]
    ShowError2 --> SelectFile
    ValidateFile -->|Yes| UploadImage[Upload Image]
    UploadImage --> SaveURL[Save Image URL]
    SaveURL --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> End
    
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
    ShowSuccess3 --> End
```

---

## 7. View Notifications Flow

```mermaid
flowchart TD
    Start([Employee Using App]) --> Connect[Connect WebSocket]
    Connect --> PollNotifications[Poll Notifications Every 30s]
    
    PollNotifications --> CheckNew{New Notifications?}
    CheckNew -->|No| Wait[Wait 30 Seconds]
    Wait --> PollNotifications
    
    CheckNew -->|Yes| UpdateBadge[Update Badge Count]
    UpdateBadge --> CheckType{Notification Type?}
    
    CheckType -->|Trip Approved| ShowApproved[Show Approval Toast]
    CheckType -->|Trip Rejected| ShowRejected[Show Rejection Toast]
    CheckType -->|Vehicle Allocated| ShowAllocated[Show Allocation Toast]
    CheckType -->|Trip Started| ShowStarted[Show Started Toast]
    CheckType -->|Trip Completed| ShowCompleted[Show Completed Toast]
    
    ShowApproved --> DisplayNotif[Display in Notification List]
    ShowRejected --> DisplayNotif
    ShowAllocated --> DisplayNotif
    ShowStarted --> DisplayNotif
    ShowCompleted --> DisplayNotif
    
    DisplayNotif --> UserClick{User Clicks?}
    UserClick -->|No| PollNotifications
    UserClick -->|Yes| MarkRead[Mark as Read]
    MarkRead --> Navigate[Navigate to Related Item]
    Navigate --> End([View Details])
```

---

## 8. Logout Flow

```mermaid
flowchart TD
    Start([Employee on Dashboard]) --> ClickLogout[Click Logout Button]
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

### Employee App Activity Flows:
1. ✅ Login with authentication and role verification
2. ✅ Create and submit trip requests with draft option
3. ✅ View trip status with different states
4. ✅ Cancel trips with status validation
5. ✅ Provide feedback for completed trips
6. ✅ Update profile (info, picture, password)
7. ✅ Receive and view real-time notifications
8. ✅ Logout with token blacklisting

### Key Decision Points:
- **Form validation** before submission
- **Status checks** before actions (cancel, feedback)
- **Role verification** during login
- **Confirmation dialogs** for critical actions
- **Real-time updates** via WebSocket and polling

### Trip Status Flow:
DRAFT → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_PRESIDENT → APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → IN_PROGRESS → COMPLETED
