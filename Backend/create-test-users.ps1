# =====================================
# Fleet Management System - Test Users
# Script to create test users and organizational structure
# =====================================

$baseUrl = "http://localhost:3000/api/v1"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Fleet Management System - Test Users" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to make API calls
function Invoke-ApiCall {
    param(
        [Parameter(Mandatory=$true)][string]$Method,
        [Parameter(Mandatory=$true)][string]$Endpoint,
        [Parameter(Mandatory=$false)][object]$Body,
        [Parameter(Mandatory=$false)][string]$Token
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 5
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $jsonBody -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -ErrorAction Stop
        }
        return $response
    } catch {
        Write-Host "Error calling ${Endpoint}:`n$_" -ForegroundColor Red
        return $null
    }
}

# -------------------------
# Step 1: Create College
# -------------------------
Write-Host "Step 1: Creating College..." -ForegroundColor Yellow

$college = Invoke-ApiCall -Method POST -Endpoint "/colleges" -Body @{
    name = "College of Business and Economics"
    code = "CBE"
    description = "College of Business and Economics"
}

if ($college) {
    Write-Host "✓ College created: $($college.name) (ID: $($college.id))" -ForegroundColor Green
    $collegeId = $college.id
} else {
    Write-Host "✗ Failed to create college" -ForegroundColor Red
    exit 1
}

Write-Host ""

# -------------------------
# Step 2: Create Department
# -------------------------
Write-Host "Step 2: Creating Department..." -ForegroundColor Yellow

$department = Invoke-ApiCall -Method POST -Endpoint "/departments" -Body @{
    name = "Department of Management"
    code = "MGT"
    collegeId = $collegeId
    description = "Department of Management"
}

if ($department) {
    Write-Host "✓ Department created: $($department.name) (ID: $($department.id))" -ForegroundColor Green
    $departmentId = $department.id
} else {
    Write-Host "✗ Failed to create department" -ForegroundColor Red
    exit 1
}

Write-Host ""

# -------------------------
# Step 3: Create Test Users
# -------------------------
Write-Host "Step 3: Creating Test Users..." -ForegroundColor Yellow
Write-Host ""

# Employee User
Write-Host "Creating Employee User..." -ForegroundColor Cyan
$employee = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "employee@test.com"
    password = "password123"
    name = "John Employee"
    role = "User"
    phoneNumber = "+251911234567"
    departmentId = $departmentId
}

if ($employee) {
    Write-Host "✓ Employee created successfully" -ForegroundColor Green
    Write-Host "  Email: employee@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: User (Employee)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create employee" -ForegroundColor Red
}

Write-Host ""

# Department Head
Write-Host "Creating Department Head..." -ForegroundColor Cyan
$deptHead = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "depthead@test.com"
    password = "password123"
    name = "Sarah Department Head"
    role = "DepartmentHead"
    phoneNumber = "+251911234568"
    departmentId = $departmentId
}

if ($deptHead) {
    Write-Host "✓ Department Head created successfully" -ForegroundColor Green
    Write-Host "  Email: depthead@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: DepartmentHead" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create department head" -ForegroundColor Red
}

Write-Host ""

# College Head (Dean)
Write-Host "Creating College Head (Dean)..." -ForegroundColor Cyan
$dean = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "dean@test.com"
    password = "password123"
    name = "Dr. Michael Dean"
    role = "Dean"
    phoneNumber = "+251911234569"
    collegeId = $collegeId
}

if ($dean) {
    Write-Host "✓ Dean created successfully" -ForegroundColor Green
    Write-Host "  Email: dean@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: Dean" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create dean" -ForegroundColor Red
}

Write-Host ""

# Deployment Team Member
Write-Host "Creating Deployment Team Member..." -ForegroundColor Cyan
$deployment = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "deployment@test.com"
    password = "password123"
    name = "Alex Deployment"
    role = "DeploymentTeam"
    phoneNumber = "+251911234570"
}

if ($deployment) {
    Write-Host "✓ Deployment Team member created successfully" -ForegroundColor Green
    Write-Host "  Email: deployment@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: DeploymentTeam" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create deployment team member" -ForegroundColor Red
}

Write-Host ""
# Transport Office User
Write-Host "Creating Transport Office User..." -ForegroundColor Cyan
$transport = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "transport@test.com"
    password = "password123"
    name = "Lisa Transport"
    role = "TransportOffice"
    phoneNumber = "+251911234571"


if ($transport) {
    Write-Host "✓ Transport Office user created successfully" -ForegroundColor Green
    Write-Host "  Email: transport@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: TransportOffice" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create transport office user" -ForegroundColor Red
}

Write-Host ""

# -------------------------
# Summary
# -------------------------
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Users Created Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Organization Structure:" -ForegroundColor Yellow
Write-Host "  College: College of Business and Economics (CBE)" -ForegroundColor White
Write-Host "    └─ Department: Department of Management (MGT)" -ForegroundColor White
Write-Host ""
Write-Host "Test Users (All passwords: password123):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Employee (Regular User)" -ForegroundColor White
Write-Host "   Email: employee@test.com" -ForegroundColor Gray
Write-Host "   App: http://localhost:3001 (Employee App)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Department Head" -ForegroundColor White
Write-Host "   Email: depthead@test.com" -ForegroundColor Gray
Write-Host "   App: http://localhost:3002 (Department App)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dean (College Head)" -ForegroundColor White
Write-Host "   Email: dean@test.com" -ForegroundColor Gray
Write-Host "   App: http://localhost:3003 (Dean App)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deployment Team" -ForegroundColor White
Write-Host "   Email: deployment@test.com" -ForegroundColor Gray
Write-Host "   App: http://localhost:3000 (Admin App)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Transport Office" -ForegroundColor White
Write-Host "   Email: transport@test.com" -ForegroundColor Gray
Write-Host "   App: http://localhost:3000 (Admin App)" -ForegroundColor Gray
Write-Host ""
Write-Host "Testing Workflow:" -ForegroundColor Yellow
Write-Host "1. Login as employee@test.com and create a trip request" -ForegroundColor White
Write-Host "2. Login as depthead@test.com to approve at department level" -ForegroundColor White
Write-Host "3. Login as dean@test.com to approve at college level" -ForegroundColor White
Write-Host "4. Login as deployment@test.com to allocate vehicle and driver" -ForegroundColor White
Write-Host ""