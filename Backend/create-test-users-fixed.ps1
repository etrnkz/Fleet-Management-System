# =====================================
# Fleet Management System - Test Users
# Script to create test users using existing organizational structure
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
# Step 1: Get existing organization structure
# -------------------------
Write-Host "Step 1: Getting existing organization structure..." -ForegroundColor Yellow

$colleges = Invoke-ApiCall -Method GET -Endpoint "/colleges"
$departments = Invoke-ApiCall -Method GET -Endpoint "/departments"

if (-not $colleges -or -not $departments) {
    Write-Host "✗ Failed to get organization structure. Please run 'python seed_organization.py' first." -ForegroundColor Red
    exit 1
}

# Find College of Business and Economics
$cbe = $colleges | Where-Object { $_.code -eq "CBE" }
if (-not $cbe) {
    Write-Host "✗ College of Business and Economics not found. Please run 'python seed_organization.py' first." -ForegroundColor Red
    exit 1
}

# Find Management department
$mgmtDept = $departments | Where-Object { $_.code -eq "CBE_MGT" }
if (-not $mgmtDept) {
    Write-Host "✗ Management department not found. Please run 'python seed_organization.py' first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found College: $($cbe.name) (ID: $($cbe.id))" -ForegroundColor Green
Write-Host "✓ Found Department: $($mgmtDept.name) (ID: $($mgmtDept.id))" -ForegroundColor Green
Write-Host ""

# -------------------------
# Step 2: Create Test Users
# -------------------------
Write-Host "Step 2: Creating Test Users..." -ForegroundColor Yellow
Write-Host ""

# Employee User
Write-Host "Creating Employee User..." -ForegroundColor Cyan
$employee = Invoke-ApiCall -Method POST -Endpoint "/auth/register" -Body @{
    email = "employee@test.com"
    password = "password123"
    name = "John Employee"
    role = "User"
    phoneNumber = "+251987654321"
    departmentId = $mgmtDept.id
}

if ($employee) {
    Write-Host "✓ Employee created successfully" -ForegroundColor Green
    Write-Host "  Email: employee@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: User (Employee)" -ForegroundColor Gray
    Write-Host "  Department: $($mgmtDept.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create employee (may already exist)" -ForegroundColor Yellow
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
    departmentId = $mgmtDept.id
}

if ($deptHead) {
    Write-Host "✓ Department Head created successfully" -ForegroundColor Green
    Write-Host "  Email: depthead@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: DepartmentHead" -ForegroundColor Gray
    Write-Host "  Department: $($mgmtDept.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create department head (may already exist)" -ForegroundColor Yellow
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
    collegeId = $cbe.id
}

if ($dean) {
    Write-Host "✓ Dean created successfully" -ForegroundColor Green
    Write-Host "  Email: dean@test.com" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
    Write-Host "  Role: Dean" -ForegroundColor Gray
    Write-Host "  College: $($cbe.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create dean (may already exist)" -ForegroundColor Yellow
}

Write-Host ""

# -------------------------
# Summary
# -------------------------
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Users Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Organization Structure:" -ForegroundColor Yellow
Write-Host "  College: $($cbe.name) (CBE)" -ForegroundColor White
Write-Host "    └─ Department: $($mgmtDept.name) (CBE_MGT)" -ForegroundColor White
Write-Host ""
Write-Host "Test Users (All passwords: password123):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Employee (Regular User)" -ForegroundColor White
Write-Host "   Email: employee@test.com" -ForegroundColor Gray
Write-Host "   Phone: +251987654321" -ForegroundColor Gray
Write-Host "   Department: $($mgmtDept.name)" -ForegroundColor Gray
Write-Host "   App: http://localhost:3001 (Employee App)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Department Head" -ForegroundColor White
Write-Host "   Email: depthead@test.com" -ForegroundColor Gray
Write-Host "   Department: $($mgmtDept.name)" -ForegroundColor Gray
Write-Host "   App: http://localhost:3002 (Department App)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dean (College Head)" -ForegroundColor White
Write-Host "   Email: dean@test.com" -ForegroundColor Gray
Write-Host "   College: $($cbe.name)" -ForegroundColor Gray
Write-Host "   App: http://localhost:3003 (Dean App)" -ForegroundColor Gray
Write-Host ""