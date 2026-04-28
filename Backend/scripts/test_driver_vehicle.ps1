$b='https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'
$at=(Invoke-RestMethod "$b/auth/login" -Method POST -ContentType 'application/json' -Body '{"email":"admin@haramaya.edu.et","password":"Password@123","appType":"system-admin"}').access_token
$h=@{Authorization="Bearer $at";'Content-Type'='application/json'}
$ts=Get-Date -Format 'HHmmss'

Write-Host "=== CREATE 2 DRIVER USERS ==="
$u1=Invoke-RestMethod "$b/users" -Headers $h -Method POST -Body "{`"name`":`"Driver Alpha $ts`",`"email`":`"alpha$ts@test.com`",`"password`":`"Password@123`",`"role`":`"Driver`",`"phoneNumber`":`"+251911111111`"}"
Write-Host "User1: $($u1.name)"
$u2=Invoke-RestMethod "$b/users" -Headers $h -Method POST -Body "{`"name`":`"Driver Beta $ts`",`"email`":`"beta$ts@test.com`",`"password`":`"Password@123`",`"role`":`"Driver`",`"phoneNumber`":`"+251922222222`"}"
Write-Host "User2: $($u2.name)"

Write-Host "`n=== CREATE 2 DRIVER PROFILES ==="
$d1=Invoke-RestMethod "$b/drivers" -Headers $h -Method POST -Body "{`"userId`":`"$($u1.id)`",`"licenseNumber`":`"DL-A-$ts`",`"licenseExpiry`":`"2028-12-31`",`"experienceYears`":5}"
Write-Host "Driver1: $($d1.id.Substring(0,8)) status=$($d1.status)"
$d2=Invoke-RestMethod "$b/drivers" -Headers $h -Method POST -Body "{`"userId`":`"$($u2.id)`",`"licenseNumber`":`"DL-B-$ts`",`"licenseExpiry`":`"2028-12-31`",`"experienceYears`":3}"
Write-Host "Driver2: $($d2.id.Substring(0,8)) status=$($d2.status)"

Write-Host "`n=== CREATE 2 VEHICLES ==="
$v1=Invoke-RestMethod "$b/vehicles" -Headers $h -Method POST -Body "{`"plateNumber`":`"AA-$ts-1`",`"make`":`"Toyota`",`"model`":`"Hilux`",`"year`":2022,`"capacity`":5,`"fuelType`":`"Diesel`",`"status`":`"Active`",`"currentMileage`":0}"
Write-Host "Vehicle1: $($v1.plateNumber) status=$($v1.status)"
$v2=Invoke-RestMethod "$b/vehicles" -Headers $h -Method POST -Body "{`"plateNumber`":`"BB-$ts-2`",`"make`":`"Nissan`",`"model`":`"Patrol`",`"year`":2021,`"capacity`":7,`"fuelType`":`"Diesel`",`"status`":`"Active`",`"currentMileage`":0}"
Write-Host "Vehicle2: $($v2.plateNumber) status=$($v2.status)"

Write-Host "`n=== ASSIGN DRIVER1 TO VEHICLE1 ==="
$r1=Invoke-RestMethod "$b/drivers/$($d1.id)/assign-vehicle" -Headers $h -Method POST -Body "{`"vehicleId`":`"$($v1.id)`"}"
Write-Host "Driver1 status=$($r1.status) vehicle=$($r1.assignedVehicle.plateNumber)"
$vcheck1=Invoke-RestMethod "$b/vehicles/$($v1.id)" -Headers $h
Write-Host "Vehicle1 status=$($vcheck1.status) driver=$($vcheck1.assignedDriver.user.name)"

Write-Host "`n=== TRY ASSIGN DRIVER1 TO VEHICLE2 (should fail) ==="
try {
    $r2=Invoke-RestMethod "$b/drivers/$($d1.id)/assign-vehicle" -Headers $h -Method POST -Body "{`"vehicleId`":`"$($v2.id)`"}"
    Write-Host "UNEXPECTED SUCCESS: Driver1 now has $($r2.assignedVehicle.plateNumber)"
} catch {
    $msg=$_.Exception.Message
    Write-Host "CORRECTLY BLOCKED: $msg"
}

Write-Host "`n=== TRY ASSIGN VEHICLE1 TO DRIVER2 (should fail - vehicle taken) ==="
try {
    $r3=Invoke-RestMethod "$b/drivers/$($d2.id)/assign-vehicle" -Headers $h -Method POST -Body "{`"vehicleId`":`"$($v1.id)`"}"
    Write-Host "UNEXPECTED SUCCESS: Driver2 got $($r3.assignedVehicle.plateNumber)"
} catch {
    $msg=$_.Exception.Message
    Write-Host "CORRECTLY BLOCKED: $msg"
}

Write-Host "`n=== ASSIGN DRIVER2 TO VEHICLE2 (should work) ==="
$r4=Invoke-RestMethod "$b/drivers/$($d2.id)/assign-vehicle" -Headers $h -Method POST -Body "{`"vehicleId`":`"$($v2.id)`"}"
Write-Host "Driver2 status=$($r4.status) vehicle=$($r4.assignedVehicle.plateNumber)"

Write-Host "`n=== FINAL STATE ==="
$fd1=Invoke-RestMethod "$b/drivers/$($d1.id)" -Headers $h
$fd2=Invoke-RestMethod "$b/drivers/$($d2.id)" -Headers $h
$fv1=Invoke-RestMethod "$b/vehicles/$($v1.id)" -Headers $h
$fv2=Invoke-RestMethod "$b/vehicles/$($v2.id)" -Headers $h
Write-Host "Driver1 ($($fd1.user.name)): status=$($fd1.status) vehicle=$($fd1.assignedVehicle.plateNumber)"
Write-Host "Driver2 ($($fd2.user.name)): status=$($fd2.status) vehicle=$($fd2.assignedVehicle.plateNumber)"
Write-Host "Vehicle1 ($($fv1.plateNumber)): status=$($fv1.status) driver=$($fv1.assignedDriver.user.name)"
Write-Host "Vehicle2 ($($fv2.plateNumber)): status=$($fv2.status) driver=$($fv2.assignedDriver.user.name)"
