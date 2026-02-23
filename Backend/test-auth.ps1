# Test Authentication Endpoints

Write-Host "=== Fleet Management System - Authentication Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register a new user
Write-Host "Test 1: Registering a new user..." -ForegroundColor Yellow
$registerBody = @{
    name = "John Doe"
    email = "john.doe@school.edu"
    password = "SecurePass@123"
    role = "Driver"
    phoneNumber = "+251912345678"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.id)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.data.email)" -ForegroundColor Gray
    Write-Host "Role: $($registerResponse.data.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Login with the registered user
Write-Host "Test 2: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "john.doe@school.edu"
    password = "SecurePass@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.access_token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "User: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host ""
    
    $accessToken = $loginResponse.access_token
    
    # Test 3: Access protected endpoint
    Write-Host "Test 3: Testing token validity..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $accessToken"
        }
        
        $protectedResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" -Method Get -Headers $headers
        
        Write-Host "Token is valid!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Token validation failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
    
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Try to register with duplicate email
Write-Host "Test 4: Testing duplicate email validation..." -ForegroundColor Yellow
try {
    $duplicateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    
    Write-Host "Duplicate email was allowed (should have failed)" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Duplicate email correctly rejected!" -ForegroundColor Green
    Write-Host ""
}

# Test 5: Try to login with wrong password
Write-Host "Test 5: Testing wrong password..." -ForegroundColor Yellow
$wrongPasswordBody = @{
    email = "john.doe@school.edu"
    password = "WrongPassword@123"
} | ConvertTo-Json

try {
    $wrongPasswordResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $wrongPasswordBody -ContentType "application/json"
    
    Write-Host "Wrong password was accepted (should have failed)" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Wrong password correctly rejected!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
