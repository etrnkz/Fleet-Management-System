# System Admin App - Activity Diagrams

## Actor: System Admin (System Administrator)

---

## 1. System Admin Login Flow

```mermaid
flowchart TD
    Start([System Admin Opens App]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCredentials
    ValidateForm -->|Yes| SubmitLogin[Submit Login Request]
    SubmitLogin --> CheckCredentials{Credentials Valid?}
    CheckCredentials -->|No| ShowError2[Show Login Error]
    ShowError2 --> EnterCredentials
    CheckCredentials -->|Yes| CheckRole{Role = SystemAdmin?}
    CheckRole -->|No| ShowError3[Show Access Denied]
    ShowError3 --> EnterCredentials
    CheckRole -->|Yes| StoreTokens[Store JWT Tokens]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([Dashboard Displayed])
```

---

## 2. User Management Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickUsers[Click User Management]
    ClickUsers --> LoadUsers[Load All Users]
    LoadUsers --> DisplayUsers[Display Users List]
    
    DisplayUsers --> ChooseAction{What to Do?}
    
    ChooseAction -->|Add User| ClickAdd[Click Add User]
    ClickAdd --> ShowForm[Show User Form]
    ShowForm --> SelectRole[Select User Role]
    SelectRole --> EnterDetails[Enter User Details]
    EnterDetails --> FillInfo[Fill: Name, Email, Phone, Department, College]
    FillInfo --> ValidateForm{Form Valid?}
    ValidateForm -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> EnterDetails
    ValidateForm -->|Yes| CheckEmail{Email Unique?}
    CheckEmail -->|No| ShowError1[Email Already Exists]
    ShowError1 --> EnterDetails
    CheckEmail -->|Yes| GeneratePassword[Generate Temporary Password]
    GeneratePassword --> CreateUser[Create User Account]
    CreateUser --> SendEmail[Send Welcome Email]
    SendEmail --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> LoadUsers
    
    ChooseAction -->|Edit User| SelectUser[Select User]
    SelectUser --> ShowEditForm[Show Edit Form]
    ShowEditForm --> UpdateDetails[Update Details]
    UpdateDetails --> ValidateUpdate{Valid Updates?}
    ValidateUpdate -->|No| ShowError2[Show Validation Error]
    ShowError2 --> UpdateDetails
    ValidateUpdate -->|Yes| SaveUpdates[Save Updates]
    SaveUpdates --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> LoadUsers
    
    ChooseAction -->|Change Role| SelectUser2[Select User]
    SelectUser2 --> ShowRoleOptions[Show Role Options]
    ShowRoleOptions --> SelectNewRole{New Role?}
    SelectNewRole -->|Employee| SetEmployee[Set Role: Employee]
    SelectNewRole -->|DepartmentHead| SetDeptHead[Set Role: DepartmentHead]
    SelectNewRole -->|CollegeDean| SetDean[Set Role: CollegeDean]
    SelectNewRole -->|President| SetPresident[Set Role: President]
    SelectNewRole -->|TransportAdmin| SetTransport[Set Role: TransportAdmin]
    SelectNewRole -->|DeploymentOffice| SetDeployment[Set Role: DeploymentOffice]
    SelectNewRole -->|Driver| SetDriver[Set Role: Driver]
    SelectNewRole -->|SystemAdmin| SetSysAdmin[Set Role: SystemAdmin]
    SetEmployee --> ConfirmChange{Confirm Role Change?}
    SetDeptHead --> ConfirmChange
    SetDean --> ConfirmChange
    SetPresident --> ConfirmChange
    SetTransport --> ConfirmChange
    SetDeployment --> ConfirmChange
    SetDriver --> ConfirmChange
    SetSysAdmin --> ConfirmChange
    ConfirmChange -->|No| ShowRoleOptions
    ConfirmChange -->|Yes| UpdateRole[Update User Role]
    UpdateRole --> NotifyUser[Notify User]
    NotifyUser --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> LoadUsers
    
    ChooseAction -->|Deactivate User| SelectUser3[Select User]
    SelectUser3 --> ConfirmDeactivate{Confirm Deactivation?}
    ConfirmDeactivate -->|No| LoadUsers
    ConfirmDeactivate -->|Yes| DeactivateUser[Deactivate User Account]
    DeactivateUser --> RevokeAccess[Revoke All Access]
    RevokeAccess --> ShowSuccess4[Show Success Message]
    ShowSuccess4 --> LoadUsers
    
    ChooseAction -->|Reset Password| SelectUser4[Select User]
    SelectUser4 --> ConfirmReset{Confirm Password Reset?}
    ConfirmReset -->|No| LoadUsers
    ConfirmReset -->|Yes| GenerateNewPassword[Generate New Password]
    GenerateNewPassword --> UpdatePassword[Update User Password]
    UpdatePassword --> SendResetEmail[Send Reset Email]
    SendResetEmail --> ShowSuccess5[Show Success Message]
    ShowSuccess5 --> LoadUsers
    
    ChooseAction -->|Filter| SelectFilter{Filter Type?}
    SelectFilter -->|By Role| SelectRoleFilter[Select Role]
    SelectFilter -->|By Department| SelectDeptFilter[Select Department]
    SelectFilter -->|By College| SelectCollegeFilter[Select College]
    SelectFilter -->|By Status| SelectStatusFilter[Select Status]
    SelectRoleFilter --> ApplyFilter[Apply Filter]
    SelectDeptFilter --> ApplyFilter
    SelectCollegeFilter --> ApplyFilter
    SelectStatusFilter --> ApplyFilter
    ApplyFilter --> LoadUsers
    
    ChooseAction -->|Search| EnterSearch[Enter Search Query]
    EnterSearch --> SearchUsers[Search Users]
    SearchUsers --> DisplayResults[Display Results]
    DisplayResults --> End1([View Results])
    
    ChooseAction -->|Export| GenerateUserReport[Generate User Report]
    GenerateUserReport --> Download[Download CSV/Excel]
    Download --> End2([File Downloaded])
    
    ChooseAction -->|Close| End3([Return to Dashboard])
```

---

## 3. View Audit Logs Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickAudit[Click Audit Logs]
    ClickAudit --> LoadLogs[Load Audit Logs]
    LoadLogs --> DisplayLogs[Display Logs Table]
    
    DisplayLogs --> ChooseAction{What to Do?}
    
    ChooseAction -->|Filter| SelectFilters[Select Filters]
    SelectFilters --> FilterOptions{Filter Options?}
    FilterOptions -->|By User| SelectUser[Select User]
    FilterOptions -->|By Action| SelectAction[Select Action Type]
    FilterOptions -->|By Entity| SelectEntity[Select Entity Type]
    FilterOptions -->|By Date| SelectDate[Select Date Range]
    FilterOptions -->|By IP| EnterIP[Enter IP Address]
    SelectUser --> ApplyFilters[Apply Filters]
    SelectAction --> ApplyFilters
    SelectEntity --> ApplyFilters
    SelectDate --> ApplyFilters
    EnterIP --> ApplyFilters
    ApplyFilters --> LoadLogs
    
    ChooseAction -->|View Details| SelectLog[Select Log Entry]
    SelectLog --> ShowDetails[Show Log Details]
    ShowDetails --> ViewUser[View User Info]
    ViewUser --> ViewAction[View Action Details]
    ViewAction --> ViewChanges[View Changes Made]
    ViewChanges --> ViewMetadata[View Metadata: IP, Timestamp, Browser]
    ViewMetadata --> End1([Close Details])
    
    ChooseAction -->|Search| EnterSearch[Enter Search Query]
    EnterSearch --> SearchLogs[Search Logs]
    SearchLogs --> DisplayResults[Display Results]
    DisplayResults --> End2([View Results])
    
    ChooseAction -->|Export| SelectExportRange[Select Date Range]
    SelectExportRange --> GenerateReport[Generate Audit Report]
    GenerateReport --> Download[Download CSV/PDF]
    Download --> End3([File Downloaded])
    
    ChooseAction -->|Analyze| ShowAnalytics[Show Analytics]
    ShowAnalytics --> ShowUserActivity[User Activity Trends]
    ShowUserActivity --> ShowActionBreakdown[Action Breakdown]
    ShowActionBreakdown --> ShowSecurityEvents[Security Events]
    ShowSecurityEvents --> ShowAnomalies[Detect Anomalies]
    ShowAnomalies --> End4([View Analytics])
    
    ChooseAction -->|Close| End5([Return to Dashboard])
```

---

## 4. System Configuration Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickConfig[Click System Configuration]
    ClickConfig --> LoadConfig[Load System Settings]
    LoadConfig --> DisplayConfig[Display Configuration]
    
    DisplayConfig --> SelectSection{Select Section?}
    
    SelectSection -->|General Settings| ShowGeneral[Show General Settings]
    ShowGeneral --> EditGeneral[Edit Settings]
    EditGeneral --> UpdateSettings1[Update: App Name, Logo, Theme]
    UpdateSettings1 --> SaveGeneral[Save General Settings]
    SaveGeneral --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> End1([Settings Updated])
    
    SelectSection -->|Email Settings| ShowEmail[Show Email Settings]
    ShowEmail --> EditEmail[Edit Email Config]
    EditEmail --> UpdateSettings2[Update: SMTP Host, Port, Credentials]
    UpdateSettings2 --> TestEmail{Test Email?}
    TestEmail -->|Yes| SendTestEmail[Send Test Email]
    SendTestEmail --> EmailSent{Email Sent?}
    EmailSent -->|No| ShowError1[Show Email Error]
    ShowError1 --> EditEmail
    EmailSent -->|Yes| ShowSuccess2[Email Test Successful]
    ShowSuccess2 --> SaveEmail[Save Email Settings]
    TestEmail -->|No| SaveEmail
    SaveEmail --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> End1
    
    SelectSection -->|Security Settings| ShowSecurity[Show Security Settings]
    ShowSecurity --> EditSecurity[Edit Security Config]
    EditSecurity --> UpdateSettings3[Update: JWT Expiry, Password Policy, MFA]
    UpdateSettings3 --> ValidateSecurity{Valid Settings?}
    ValidateSecurity -->|No| ShowError2[Show Validation Error]
    ShowError2 --> EditSecurity
    ValidateSecurity -->|Yes| SaveSecurity[Save Security Settings]
    SaveSecurity --> ShowSuccess4[Show Success Message]
    ShowSuccess4 --> End1
    
    SelectSection -->|Notification Settings| ShowNotifications[Show Notification Settings]
    ShowNotifications --> EditNotifications[Edit Notification Config]
    EditNotifications --> UpdateSettings4[Update: Channels, Templates, Frequency]
    UpdateSettings4 --> SaveNotifications[Save Notification Settings]
    SaveNotifications --> ShowSuccess5[Show Success Message]
    ShowSuccess5 --> End1
    
    SelectSection -->|Backup Settings| ShowBackup[Show Backup Settings]
    ShowBackup --> EditBackup[Edit Backup Config]
    EditBackup --> UpdateSettings5[Update: Schedule, Retention, Location]
    UpdateSettings5 --> SaveBackup[Save Backup Settings]
    SaveBackup --> TriggerBackup{Trigger Backup Now?}
    TriggerBackup -->|Yes| StartBackup[Start Backup Process]
    StartBackup --> ShowProgress[Show Backup Progress]
    ShowProgress --> BackupComplete[Backup Complete]
    BackupComplete --> ShowSuccess6[Show Success Message]
    TriggerBackup -->|No| ShowSuccess6
    ShowSuccess6 --> End1
    
    SelectSection -->|Integration Settings| ShowIntegrations[Show Integration Settings]
    ShowIntegrations --> EditIntegrations[Edit Integration Config]
    EditIntegrations --> UpdateSettings6[Update: API Keys, Webhooks, External Services]
    UpdateSettings6 --> TestIntegration{Test Integration?}
    TestIntegration -->|Yes| TestConnection[Test Connection]
    TestConnection --> ConnectionOK{Connection OK?}
    ConnectionOK -->|No| ShowError3[Show Connection Error]
    ShowError3 --> EditIntegrations
    ConnectionOK -->|Yes| ShowSuccess7[Connection Successful]
    ShowSuccess7 --> SaveIntegrations[Save Integration Settings]
    TestIntegration -->|No| SaveIntegrations
    SaveIntegrations --> ShowSuccess8[Show Success Message]
    ShowSuccess8 --> End1
```

---

## 5. Broadcast Message Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickBroadcast[Click Broadcast Message]
    ClickBroadcast --> ShowForm[Show Broadcast Form]
    ShowForm --> SelectRecipients{Select Recipients?}
    
    SelectRecipients -->|All Users| SelectAll[Select All Users]
    SelectRecipients -->|By Role| SelectRole[Select Role]
    SelectRecipients -->|By Department| SelectDept[Select Department]
    SelectRecipients -->|By College| SelectCollege[Select College]
    SelectRecipients -->|Custom| SelectCustom[Select Custom Users]
    
    SelectAll --> ComposeMessage[Compose Message]
    SelectRole --> ComposeMessage
    SelectDept --> ComposeMessage
    SelectCollege --> ComposeMessage
    SelectCustom --> ComposeMessage
    
    ComposeMessage --> EnterSubject[Enter Subject]
    EnterSubject --> EnterBody[Enter Message Body]
    EnterBody --> SelectPriority{Select Priority?}
    SelectPriority -->|Low| SetLow[Set Priority: Low]
    SelectPriority -->|Normal| SetNormal[Set Priority: Normal]
    SelectPriority -->|High| SetHigh[Set Priority: High]
    SelectPriority -->|Urgent| SetUrgent[Set Priority: Urgent]
    
    SetLow --> SelectChannels[Select Channels]
    SetNormal --> SelectChannels
    SetHigh --> SelectChannels
    SetUrgent --> SelectChannels
    
    SelectChannels --> ChooseChannels{Channels?}
    ChooseChannels -->|In-App| CheckInApp[Check In-App]
    ChooseChannels -->|Email| CheckEmail[Check Email]
    ChooseChannels -->|SMS| CheckSMS[Check SMS]
    CheckInApp --> ValidateMessage{Message Valid?}
    CheckEmail --> ValidateMessage
    CheckSMS --> ValidateMessage
    
    ValidateMessage -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> ComposeMessage
    
    ValidateMessage -->|Yes| PreviewMessage[Preview Message]
    PreviewMessage --> ConfirmSend{Confirm Send?}
    ConfirmSend -->|No| ComposeMessage
    
    ConfirmSend -->|Yes| SendBroadcast[Send Broadcast]
    SendBroadcast --> CreateNotifications[Create Notifications]
    CreateNotifications --> SendEmails[Send Emails if Selected]
    SendEmails --> SendSMS[Send SMS if Selected]
    SendSMS --> LogBroadcast[Log Broadcast]
    LogBroadcast --> ShowSuccess[Show Success Message]
    ShowSuccess --> ShowStats[Show Delivery Stats]
    ShowStats --> End([Broadcast Sent])
```

---

## 6. View System Dashboard Flow

```mermaid
flowchart TD
    Start([System Admin Logs In]) --> LoadDashboard[Load System Dashboard]
    LoadDashboard --> FetchMetrics[Fetch System Metrics]
    
    FetchMetrics --> FetchUsers[Fetch User Statistics]
    FetchMetrics --> FetchActivity[Fetch Activity Statistics]
    FetchMetrics --> FetchSecurity[Fetch Security Events]
    FetchMetrics --> FetchPerformance[Fetch Performance Metrics]
    
    FetchUsers --> ProcessData[Process All Data]
    FetchActivity --> ProcessData
    FetchSecurity --> ProcessData
    FetchPerformance --> ProcessData
    
    ProcessData --> DisplayCards[Display Stat Cards]
    DisplayCards --> ShowTotalUsers[Total Users]
    ShowTotalUsers --> ShowActiveUsers[Active Users]
    ShowActiveUsers --> ShowNewUsers[New Users Today]
    ShowNewUsers --> ShowSecurityAlerts[Security Alerts]
    
    ShowSecurityAlerts --> RenderCharts[Render Charts]
    RenderCharts --> ShowUserGrowth[User Growth Trend]
    ShowUserGrowth --> ShowActivityHeatmap[Activity Heatmap]
    ShowActivityHeatmap --> ShowRoleDistribution[Role Distribution]
    ShowRoleDistribution --> ShowSystemHealth[System Health]
    
    ShowSystemHealth --> ShowRecentActivity[Show Recent Activity]
    ShowRecentActivity --> ShowRecentLogins[Recent Logins]
    ShowRecentLogins --> ShowRecentActions[Recent Actions]
    ShowRecentActions --> ShowSecurityEvents[Security Events]
    
    ShowSecurityEvents --> UserAction{User Action?}
    UserAction -->|Drill Down| SelectMetric[Select Metric]
    SelectMetric --> NavigateDetails[Navigate to Details]
    NavigateDetails --> End1([View Details])
    
    UserAction -->|Refresh| LoadDashboard
    UserAction -->|Change Period| SelectPeriod[Select Time Period]
    SelectPeriod --> LoadDashboard
    
    UserAction -->|Continue| End2([Stay on Dashboard])
```

---

## 7. Manage System Backups Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickBackups[Click Backups]
    ClickBackups --> LoadBackups[Load Backup History]
    LoadBackups --> DisplayBackups[Display Backups List]
    
    DisplayBackups --> ChooseAction{What to Do?}
    
    ChooseAction -->|Create Backup| ClickCreate[Click Create Backup]
    ClickCreate --> SelectType{Backup Type?}
    SelectType -->|Full| CreateFull[Create Full Backup]
    SelectType -->|Incremental| CreateIncremental[Create Incremental Backup]
    SelectType -->|Database Only| CreateDB[Create Database Backup]
    CreateFull --> StartBackup[Start Backup Process]
    CreateIncremental --> StartBackup
    CreateDB --> StartBackup
    StartBackup --> ShowProgress[Show Progress Bar]
    ShowProgress --> BackupComplete{Backup Complete?}
    BackupComplete -->|No| ShowError1[Show Backup Error]
    ShowError1 --> End1([Backup Failed])
    BackupComplete -->|Yes| VerifyBackup[Verify Backup Integrity]
    VerifyBackup --> ShowSuccess1[Show Success Message]
    ShowSuccess1 --> LoadBackups
    
    ChooseAction -->|Restore Backup| SelectBackup[Select Backup]
    SelectBackup --> ShowWarning[Show Restore Warning]
    ShowWarning --> ConfirmRestore{Confirm Restore?}
    ConfirmRestore -->|No| LoadBackups
    ConfirmRestore -->|Yes| StartRestore[Start Restore Process]
    StartRestore --> ShowRestoreProgress[Show Progress]
    ShowRestoreProgress --> RestoreComplete{Restore Complete?}
    RestoreComplete -->|No| ShowError2[Show Restore Error]
    ShowError2 --> End2([Restore Failed])
    RestoreComplete -->|Yes| VerifyRestore[Verify Restored Data]
    VerifyRestore --> ShowSuccess2[Show Success Message]
    ShowSuccess2 --> RestartSystem[Restart System]
    RestartSystem --> End3([System Restarted])
    
    ChooseAction -->|Download Backup| SelectBackup2[Select Backup]
    SelectBackup2 --> DownloadBackup[Download Backup File]
    DownloadBackup --> End4([File Downloaded])
    
    ChooseAction -->|Delete Backup| SelectBackup3[Select Backup]
    SelectBackup3 --> ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|No| LoadBackups
    ConfirmDelete -->|Yes| DeleteBackup[Delete Backup]
    DeleteBackup --> ShowSuccess3[Show Success Message]
    ShowSuccess3 --> LoadBackups
    
    ChooseAction -->|Schedule| ConfigureSchedule[Configure Backup Schedule]
    ConfigureSchedule --> SetFrequency[Set Frequency]
    SetFrequency --> SetRetention[Set Retention Period]
    SetRetention --> SaveSchedule[Save Schedule]
    SaveSchedule --> ShowSuccess4[Show Success Message]
    ShowSuccess4 --> End5([Schedule Saved])
    
    ChooseAction -->|Close| End6([Return to Dashboard])
```

---

## 8. Logout Flow

```mermaid
flowchart TD
    Start([System Admin on Dashboard]) --> ClickLogout[Click Logout Button]
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

### System Admin App Activity Flows:
1. ✅ Login with highest-level system access
2. ✅ Comprehensive user management (CRUD, roles, passwords)
3. ✅ View and analyze audit logs
4. ✅ Configure system settings (general, email, security, notifications, backups, integrations)
5. ✅ Broadcast messages to users
6. ✅ View system dashboard with metrics
7. ✅ Manage system backups (create, restore, download, delete, schedule)
8. ✅ Logout with token cleanup

### Key Decision Points:
- **User role assignment** (8 different roles)
- **Security settings** validation
- **Backup type selection** (full/incremental/database)
- **Restore confirmation** with warning
- **Broadcast recipient selection** (all/role/department/college/custom)
- **Message priority** (low/normal/high/urgent)

### System Administration Responsibilities:
- **Manage all users** across the system
- **Configure system settings** for optimal operation
- **Monitor security** through audit logs
- **Broadcast communications** to users
- **Maintain system backups** for disaster recovery
- **Analyze system metrics** for performance
- **Ensure system security** and compliance
- **Troubleshoot issues** and provide support

### Administrative Authority:
- **Full user management** (create, edit, delete, role changes)
- **System configuration** access
- **Audit log** visibility
- **Backup and restore** capabilities
- **Broadcast messaging** to all users
- **Security settings** control
- **Integration management** authority
