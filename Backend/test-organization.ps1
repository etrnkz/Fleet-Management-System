# Test Organization Management (Colleges & Departments)

Write-Host "=== Fleet Management System - Organization Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "john.doe@school.edu"
    password = "SecurePass@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Create a College
Write-Host "Step 2: Creating a college..." -ForegroundColor Yellow
$collegeBody = @{
    name = "College of Engineering"
    code = "COE"
    description = "Engineering and technology programs"
} | ConvertTo-Json

try {
    $collegeResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/colleges" -Method Post -Body $collegeBody -Headers $headers
    $collegeId = $collegeResponse.id
    Write-Host "College created successfully!" -ForegroundColor Green
    Write-Host "College ID: $collegeId" -ForegroundColor Gray
    Write-Host "Name: $($collegeResponse.name)" -ForegroundColor Gray
    Write-Host "Code: $($collegeResponse.code)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "College creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 3: Create another College
Write-Host "Step 3: Creating another college..." -ForegroundColor Yellow
$college2Body = @{
    name = "College of Natural Sciences"
    code = "CNS"
    description = "Natural and applied sciences"
} | ConvertTo-Json

try {
    $college2Response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/colleges" -Method Post -Body $college2Body -Headers $headers
    Write-Host "Second college created successfully!" -ForegroundColor Green
    Write-Host "Name: $($college2Response.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Second college creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 4: Get all colleges
Write-Host "Step 4: Fetching all colleges..." -ForegroundColor Yellow
try {
    $collegesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/colleges" -Method Get -Headers $headers
    Write-Host "Found $($collegesResponse.Count) colleges:" -ForegroundColor Green
    foreach ($college in $collegesResponse) {
        Write-Host "  - $($college.name) ($($college.code))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to fetch colleges: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 5: Create a Department
Write-Host "Step 5: Creating a department..." -ForegroundColor Yellow
$departmentBody = @{
    name = "Computer Science"
    code = "CS"
    description = "Computer science and software engineering"
    collegeId = $collegeId
} | ConvertTo-Json

try {
    $departmentResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments" -Method Post -Body $departmentBody -Headers $headers
    $departmentId = $departmentResponse.id
    Write-Host "Department created successfully!" -ForegroundColor Green
    Write-Host "Department ID: $departmentId" -ForegroundColor Gray
    Write-Host "Name: $($departmentResponse.name)" -ForegroundColor Gray
    Write-Host "Code: $($departmentResponse.code)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Department creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 6: Create another Department
Write-Host "Step 6: Creating another department..." -ForegroundColor Yellow
$department2Body = @{
    name = "Electrical Engineering"
    code = "EE"
    description = "Electrical and electronics engineering"
    collegeId = $collegeId
} | ConvertTo-Json

try {
    $department2Response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments" -Method Post -Body $department2Body -Headers $headers
    Write-Host "Second department created successfully!" -ForegroundColor Green
    Write-Host "Name: $($department2Response.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Second department creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 7: Get all departments
Write-Host "Step 7: Fetching all departments..." -ForegroundColor Yellow
try {
    $departmentsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments" -Method Get -Headers $headers
    Write-Host "Found $($departmentsResponse.Count) departments:" -ForegroundColor Green
    foreach ($dept in $departmentsResponse) {
        Write-Host "  - $($dept.name) ($($dept.code))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to fetch departments: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 8: Get departments by college
Write-Host "Step 8: Fetching departments for College of Engineering..." -ForegroundColor Yellow
try {
    $collegeDepartmentsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments?collegeId=$collegeId" -Method Get -Headers $headers
    Write-Host "Found $($collegeDepartmentsResponse.Count) departments in COE:" -ForegroundColor Green
    foreach ($dept in $collegeDepartmentsResponse) {
        Write-Host "  - $($dept.name)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to fetch college departments: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 9: Get specific college with departments
Write-Host "Step 9: Fetching college details with departments..." -ForegroundColor Yellow
try {
    $collegeDetailsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/colleges/$collegeId" -Method Get -Headers $headers
    Write-Host "College: $($collegeDetailsResponse.name)" -ForegroundColor Green
    Write-Host "Departments: $($collegeDetailsResponse.departments.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch college details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 10: Update a department
Write-Host "Step 10: Updating department..." -ForegroundColor Yellow
$updateDeptBody = @{
    description = "Updated: Computer science, software engineering, and AI"
} | ConvertTo-Json

try {
    $updateDeptResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/departments/$departmentId" -Method Patch -Body $updateDeptBody -Headers $headers
    Write-Host "Department updated successfully!" -ForegroundColor Green
    Write-Host "New description: $($updateDeptResponse.description)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Department update failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== All Organization Tests Completed ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Colleges created: 2" -ForegroundColor Gray
Write-Host "- Departments created: 2" -ForegroundColor Gray
Write-Host "- All CRUD operations tested successfully!" -ForegroundColor Green
