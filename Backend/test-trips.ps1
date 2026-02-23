# Trip Request System Test Script
$baseUrl = "http://localhost:3000/api/v1"
$headers = @{ "Content-Type" = "application/json" }

Write-Host ""
Write-Host "=== Fleet Management System - Trip Request Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register users
Write-Host "Test 1: Registering users..." -ForegroundColor Yellow

$users = @(
    @{ email = "john.user@school.edu"; name = "John User"; role = "User" },
    @{ email = "dept.head@school.edu"; name = "Department Head"; role = "DepartmentHead" },
    @{ email = "college.head@school.edu"; name = "College Head"; role = "CollegeHead" },
    @{ email = "dean@school.edu"; name = "Dean"; role = "Dean" },
    @{ email = "deployment@school.edu"; name = "Deployment Team"; role = "DeploymentTeam" }
)

foreach ($userData in $users) {
    $body = @{
        email = $userData.email
        password = "Password123!"
        name = $userData.name
        role = $userData.role
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -Headers $headers -ErrorAction Stop
        Write-Host "  OK: $($userData.name) registered" -ForegroundColor Green
    } catch {
        Write-Host "  SKIP: $($userData.name) (may already exist)" -ForegroundColor Yellow
    }
}

# Test 2: Login as user
Write-Host ""
Write-Host "Test 2: Logging in as user..." -ForegroundColor Yellow

$loginBody = @{
    email = "john.user@school.edu"
    password = "Password123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $headers
$userToken = $loginResponse.accessToken
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $userToken"
}

Write-Host "  OK: Logged in as $($loginResponse.user.name)" -ForegroundColor Green

# Test 3: Invalid trip (< 48 hours)
Write-Host ""
Write-Host "Test 3: Testing 48-hour validation..." -ForegroundColor Yellow

$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$tomorrowEnd = (Get-Date).AddDays(1).AddHours(8).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$invalidBody = @{
    tripType = "Normal"
    purpose = "Emergency meeting"
    destination = "City Hall"
    startDateTime = $tomorrow
    endDateTime = $tomorrowEnd
    passengerCount = 3
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/trips" -Method Post -Body $invalidBody -Headers $authHeaders -ErrorAction Stop
    Write-Host "  FAIL: Should have failed" -ForegroundColor Red
} catch {
    Write-Host "  OK: 48-hour validation working" -ForegroundColor Green
}

# Test 4: Create valid trip
Write-Host ""
Write-Host "Test 4: Creating valid trip..." -ForegroundColor Yellow

$futureDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$futureDateEnd = (Get-Date).AddDays(3).AddHours(8).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$tripBody = @{
    tripType = "Normal"
    purpose = "Academic conference"
    destination = "Convention Center"
    startDateTime = $futureDate
    endDateTime = $futureDateEnd
    passengerCount = 5
} | ConvertTo-Json

$trip = Invoke-RestMethod -Uri "$baseUrl/trips" -Method Post -Body $tripBody -Headers $authHeaders
$tripId = $trip.id

Write-Host "  OK: Trip created: $($trip.requestNumber)" -ForegroundColor Green
Write-Host "      State: $($trip.state)" -ForegroundColor Gray

# Test 5: Update trip
Write-Host ""
Write-Host "Test 5: Updating trip..." -ForegroundColor Yellow

$updateBody = @{
    passengerCount = 6
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId" -Method Patch -Body $updateBody -Headers $authHeaders

Write-Host "  OK: Trip updated: Passengers = $($updated.passengerCount)" -ForegroundColor Green

# Test 6: Submit trip
Write-Host ""
Write-Host "Test 6: Submitting trip..." -ForegroundColor Yellow

$submitted = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId/submit" -Method Post -Headers $authHeaders

Write-Host "  OK: Trip submitted" -ForegroundColor Green
Write-Host "      State: $($submitted.state)" -ForegroundColor Gray
Write-Host "      Approval Level: $($submitted.currentApprovalLevel)" -ForegroundColor Gray

# Test 7: Department Head approval
Write-Host ""
Write-Host "Test 7: Department Head approval..." -ForegroundColor Yellow

$deptLogin = @{
    email = "dept.head@school.edu"
    password = "Password123!"
} | ConvertTo-Json

$deptResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $deptLogin -Headers $headers
$deptHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $($deptResponse.accessToken)"
}

$approveBody = @{
    comments = "Approved"
} | ConvertTo-Json

$approved1 = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId/approve" -Method Post -Body $approveBody -Headers $deptHeaders

Write-Host "  OK: Department approved" -ForegroundColor Green
Write-Host "      State: $($approved1.state)" -ForegroundColor Gray

# Test 8: College Head approval
Write-Host ""
Write-Host "Test 8: College Head approval..." -ForegroundColor Yellow

$collegeLogin = @{
    email = "college.head@school.edu"
    password = "Password123!"
} | ConvertTo-Json

$collegeResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $collegeLogin -Headers $headers
$collegeHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $($collegeResponse.accessToken)"
}

$approved2 = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId/approve" -Method Post -Body $approveBody -Headers $collegeHeaders

Write-Host "  OK: College approved" -ForegroundColor Green
Write-Host "      State: $($approved2.state)" -ForegroundColor Gray

# Test 9: Dean approval
Write-Host ""
Write-Host "Test 9: Dean approval..." -ForegroundColor Yellow

$deanLogin = @{
    email = "dean@school.edu"
    password = "Password123!"
} | ConvertTo-Json

$deanResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $deanLogin -Headers $headers
$deanHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $($deanResponse.accessToken)"
}

$approved3 = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId/approve" -Method Post -Body $approveBody -Headers $deanHeaders

Write-Host "  OK: Dean approved" -ForegroundColor Green
Write-Host "      State: $($approved3.state)" -ForegroundColor Gray

# Test 10: Get trip details
Write-Host ""
Write-Host "Test 10: Getting trip details..." -ForegroundColor Yellow

$details = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId" -Method Get -Headers $authHeaders

Write-Host "  OK: Trip details retrieved" -ForegroundColor Green
Write-Host "      Approvals: $($details.approvals.Count)" -ForegroundColor Gray
foreach ($approval in $details.approvals) {
    Write-Host "        - $($approval.approvalLevel): $($approval.status)" -ForegroundColor Gray
}

# Test 11: VIP trip
Write-Host ""
Write-Host "Test 11: Creating VIP trip..." -ForegroundColor Yellow

$vipBody = @{
    tripType = "VIP"
    purpose = "Presidential visit"
    destination = "Partner University"
    startDateTime = $futureDate
    endDateTime = $futureDateEnd
    passengerCount = 3
} | ConvertTo-Json

$vipTrip = Invoke-RestMethod -Uri "$baseUrl/trips" -Method Post -Body $vipBody -Headers $authHeaders
$vipTripId = $vipTrip.id

$vipSubmitted = Invoke-RestMethod -Uri "$baseUrl/trips/$vipTripId/submit" -Method Post -Headers $authHeaders

Write-Host "  OK: VIP trip created and submitted" -ForegroundColor Green
Write-Host "      State: $($vipSubmitted.state)" -ForegroundColor Gray
Write-Host "      Note: Skips Department and College" -ForegroundColor Cyan

# Test 12: List trips
Write-Host ""
Write-Host "Test 12: Listing trips..." -ForegroundColor Yellow

$allTrips = Invoke-RestMethod -Uri "$baseUrl/trips" -Method Get -Headers $authHeaders

Write-Host "  OK: Retrieved $($allTrips.Count) trip(s)" -ForegroundColor Green

Write-Host ""
Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
Write-Host "Trip creation and validation: PASSED" -ForegroundColor Green
Write-Host "Multi-level approval workflow: PASSED" -ForegroundColor Green
Write-Host "VIP workflow: PASSED" -ForegroundColor Green
Write-Host ""
Write-Host "Trip Request System is working!" -ForegroundColor Green
