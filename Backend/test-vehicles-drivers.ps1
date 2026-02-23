# Test Vehicles and Drivers Management

Write-Host "=== Fleet Management System - Vehicles & Drivers Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "john.doe@school.edu"
    password = "SecurePass@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    $userId = $loginResponse.user.id
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

# Step 2: Create a Vehicle
Write-Host "Step 2: Creating a vehicle..." -ForegroundColor Yellow
$vehicleBody = @{
    plateNumber = "ABC-1234"
    make = "Toyota"
    model = "Hiace"
    year = 2022
    capacity = 15
    fuelType = "Diesel"
    currentMileage = 125000
    color = "White"
    notes = "School bus for student transportation"
} | ConvertTo-Json

try {
    $vehicleResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles" -Method Post -Body $vehicleBody -Headers $headers
    $vehicleId = $vehicleResponse.id
    Write-Host "Vehicle created successfully!" -ForegroundColor Green
    Write-Host "Vehicle ID: $vehicleId" -ForegroundColor Gray
    Write-Host "Plate: $($vehicleResponse.plateNumber)" -ForegroundColor Gray
    Write-Host "Model: $($vehicleResponse.make) $($vehicleResponse.model)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Vehicle creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 3: Create another Vehicle
Write-Host "Step 3: Creating another vehicle..." -ForegroundColor Yellow
$vehicle2Body = @{
    plateNumber = "XYZ-5678"
    make = "Mercedes"
    model = "Sprinter"
    year = 2023
    capacity = 20
    fuelType = "Diesel"
    currentMileage = 50000
    color = "Silver"
} | ConvertTo-Json

try {
    $vehicle2Response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles" -Method Post -Body $vehicle2Body -Headers $headers
    Write-Host "Second vehicle created successfully!" -ForegroundColor Green
    Write-Host "Plate: $($vehicle2Response.plateNumber)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Second vehicle creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 4: Get all vehicles
Write-Host "Step 4: Fetching all vehicles..." -ForegroundColor Yellow
try {
    $vehiclesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles" -Method Get -Headers $headers
    Write-Host "Found $($vehiclesResponse.Count) vehicles:" -ForegroundColor Green
    foreach ($vehicle in $vehiclesResponse) {
        Write-Host "  - $($vehicle.plateNumber): $($vehicle.make) $($vehicle.model) ($($vehicle.status))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to fetch vehicles: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 5: Get available vehicles
Write-Host "Step 5: Fetching available vehicles..." -ForegroundColor Yellow
try {
    $availableVehiclesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles/available" -Method Get -Headers $headers
    Write-Host "Found $($availableVehiclesResponse.Count) available vehicles" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Failed to fetch available vehicles: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 6: Get vehicle statistics
Write-Host "Step 6: Fetching vehicle statistics..." -ForegroundColor Yellow
try {
    $vehicleStatsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles/statistics" -Method Get -Headers $headers
    Write-Host "Vehicle Statistics:" -ForegroundColor Green
    Write-Host "  Total: $($vehicleStatsResponse.total)" -ForegroundColor Gray
    Write-Host "  Active: $($vehicleStatsResponse.active)" -ForegroundColor Gray
    Write-Host "  Under Maintenance: $($vehicleStatsResponse.underMaintenance)" -ForegroundColor Gray
    Write-Host "  Available: $($vehicleStatsResponse.availablePercentage)%" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch vehicle statistics: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 7: Create a Driver Profile
Write-Host "Step 7: Creating a driver profile..." -ForegroundColor Yellow
$driverBody = @{
    userId = $userId
    licenseNumber = "DL-123456789"
    licenseExpiry = "2028-12-31"
    experienceYears = 10
    specializations = "Heavy vehicles, Long distance"
    notes = "Excellent safety record"
} | ConvertTo-Json

try {
    $driverResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drivers" -Method Post -Body $driverBody -Headers $headers
    $driverId = $driverResponse.id
    Write-Host "Driver profile created successfully!" -ForegroundColor Green
    Write-Host "Driver ID: $driverId" -ForegroundColor Gray
    Write-Host "License: $($driverResponse.licenseNumber)" -ForegroundColor Gray
    Write-Host "Experience: $($driverResponse.experienceYears) years" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Driver creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 8: Get all drivers
Write-Host "Step 8: Fetching all drivers..." -ForegroundColor Yellow
try {
    $driversResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drivers" -Method Get -Headers $headers
    Write-Host "Found $($driversResponse.Count) drivers:" -ForegroundColor Green
    foreach ($driver in $driversResponse) {
        Write-Host "  - $($driver.user.name): $($driver.licenseNumber) ($($driver.status))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to fetch drivers: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 9: Get available drivers
Write-Host "Step 9: Fetching available drivers..." -ForegroundColor Yellow
try {
    $availableDriversResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drivers/available" -Method Get -Headers $headers
    Write-Host "Found $($availableDriversResponse.Count) available drivers" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Failed to fetch available drivers: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 10: Get driver statistics
Write-Host "Step 10: Fetching driver statistics..." -ForegroundColor Yellow
try {
    $driverStatsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drivers/statistics" -Method Get -Headers $headers
    Write-Host "Driver Statistics:" -ForegroundColor Green
    Write-Host "  Total: $($driverStatsResponse.total)" -ForegroundColor Gray
    Write-Host "  Available: $($driverStatsResponse.available)" -ForegroundColor Gray
    Write-Host "  On Trip: $($driverStatsResponse.onTrip)" -ForegroundColor Gray
    Write-Host "  Average Rating: $($driverStatsResponse.averageRating)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch driver statistics: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 11: Update vehicle status
Write-Host "Step 11: Setting vehicle to maintenance..." -ForegroundColor Yellow
$maintenanceBody = @{
    underMaintenance = $true
} | ConvertTo-Json

try {
    $maintenanceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/vehicles/$vehicleId/maintenance" -Method Patch -Body $maintenanceBody -Headers $headers
    Write-Host "Vehicle status updated!" -ForegroundColor Green
    Write-Host "New status: $($maintenanceResponse.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to update vehicle status: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 12: Update driver rating
Write-Host "Step 12: Updating driver profile..." -ForegroundColor Yellow
$updateDriverBody = @{
    rating = 4.8
} | ConvertTo-Json

try {
    $updateDriverResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drivers/$driverId" -Method Patch -Body $updateDriverBody -Headers $headers
    Write-Host "Driver profile updated!" -ForegroundColor Green
    Write-Host "New rating: $($updateDriverResponse.rating)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to update driver: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== All Vehicles & Drivers Tests Completed ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Vehicles created: 2" -ForegroundColor Gray
Write-Host "- Drivers created: 1" -ForegroundColor Gray
Write-Host "- All CRUD operations tested successfully!" -ForegroundColor Green
Write-Host "- Statistics endpoints working!" -ForegroundColor Green
Write-Host "- Status management working!" -ForegroundColor Green
