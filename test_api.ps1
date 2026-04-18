$b = 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'
$pass = 'Password@123'

function Post($url, $body, $token) {
    $headers = @{'Content-Type'='application/json'}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    try { return Invoke-RestMethod $url -Method POST -Headers $headers -Body ($body | ConvertTo-Json -Compress) }
    catch { Write-Host "  ERROR $($_.Exception.Message)"; return $null }
}
function Get($url, $token) {
    $headers = @{}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    try { return Invoke-RestMethod $url -Method GET -Headers $headers }
    catch { Write-Host "  ERROR $($_.Exception.Message)"; return $null }
}
function Patch($url, $body, $token) {
    $headers = @{'Content-Type'='application/json'; Authorization="Bearer $token"}
    try { return Invoke-RestMethod $url -Method PATCH -Headers $headers -Body ($body | ConvertTo-Json -Compress) }
    catch { Write-Host "  ERROR $($_.Exception.Message)"; return $null }
}

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
$h = Get "$b/health"
Write-Host "Status=$($h.status) DB=$($h.database)"

Write-Host "`n=== LOGIN ALL ROLES ===" -ForegroundColor Cyan
$adminToken = (Post "$b/auth/login" @{email='admin@haramaya.edu.et';password=$pass;appType='system-admin'}).access_token
Write-Host "Admin: $(if($adminToken){'OK'}else{'FAIL'})"
$presToken = (Post "$b/auth/login" @{email='president@haramaya.edu.et';password=$pass;appType='president'}).access_token
Write-Host "President: $(if($presToken){'OK'}else{'FAIL'})"
$transToken = (Post "$b/auth/login" @{email='transport@haramaya.edu.et';password=$pass;appType='transport-admin'}).access_token
Write-Host "Transport: $(if($transToken){'OK'}else{'FAIL'})"
$deplToken = (Post "$b/auth/login" @{email='deployment@haramaya.edu.et';password=$pass;appType='deployment-office'}).access_token
Write-Host "Deployment: $(if($deplToken){'OK'}else{'FAIL'})"
$driverToken = (Post "$b/auth/login" @{email='driver@haramaya.edu.et';password=$pass;appType='driver'}).access_token
Write-Host "Driver: $(if($driverToken){'OK'}else{'FAIL'})"
$deanToken = (Post "$b/auth/login" @{email='dean.computing-and-inform@haramaya.edu.et';password=$pass;appType='college-dean'}).access_token
Write-Host "Dean: $(if($deanToken){'OK'}else{'FAIL'})"
$deptToken = (Post "$b/auth/login" @{email='head.computer-science@haramaya.edu.et';password=$pass;appType='department'}).access_token
Write-Host "DeptHead: $(if($deptToken){'OK'}else{'FAIL'})"
$empToken = (Post "$b/auth/login" @{email='postman@haramaya.edu.et';password=$pass}).access_token
Write-Host "Postman employee: $(if($empToken){'OK'}else{'FAIL'})"

Write-Host "`n=== CORE DATA ===" -ForegroundColor Cyan
$vehicles = Get "$b/vehicles" $adminToken
Write-Host "Vehicles: $($vehicles.Count)"
$drivers = Get "$b/drivers" $adminToken
Write-Host "Drivers: $($drivers.Count)"
# Pick active vehicle and available driver
$v = $vehicles | Where-Object {$_.status -eq 'Active' -and $_.plateNumber -ne 'AA-20260418152255'} | Select-Object -First 1
$d = $drivers | Where-Object {$_.status -eq 'Available'} | Select-Object -First 1
$vid = $v.id; $vplate = $v.plateNumber
$did = $d.id
Write-Host "Vehicle: $vid plate=$vplate"
Write-Host "Driver: $did name=$($d.user.name)"

Write-Host "`n=== STANDARD TRIP FULL FLOW ===" -ForegroundColor Cyan
$t1 = Post "$b/trips" @{tripType='Normal';tripCategory='STANDARD';purpose='OFFICIAL | Standard test trip';destination='Dire Dawa';startDateTime='2026-06-10T09:00:00Z';endDateTime='2026-06-10T17:00:00Z';passengerCount=2} $empToken
Write-Host "Created: $($t1.id) state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='Dept approved'} $deptToken
Write-Host "Dept approved: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='Dean approved'} $deanToken
Write-Host "Dean approved: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='President approved'} $presToken
Write-Host "President approved: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/allocate" @{vehicleId=$vid;driverId=$did;estimatedFuelCost=500;estimatedDistance=150} $deplToken
Write-Host "Allocated: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/confirm-transport" @{fuelApproved=$true;estimatedFuelCost=500;estimatedDistance=150;notes='Ready'} $transToken
Write-Host "Transport confirmed: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/start" @{plateNumber=$vplate;scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t1.state)"
$t1 = Post "$b/trips/$($t1.id)/complete" @{actualDistance=148;actualFuelCost=490;finalMileage=15148} $empToken
Write-Host "Completed: state=$($t1.state)"
$fb = Post "$b/trips/$($t1.id)/feedback" @{overallRating=5;driverRating=5;vehicleRating=4;punctualityRating=5;comments='Excellent service';wouldRecommend=$true} $empToken
Write-Host "Feedback: $($fb.id)"

Write-Host "`n=== VIP TRIP FULL FLOW ===" -ForegroundColor Cyan
# Re-fetch available vehicle/driver after standard trip completed
$vehicles2 = Get "$b/vehicles" $adminToken
$drivers2 = Get "$b/drivers" $adminToken
$v2 = $vehicles2 | Where-Object {$_.status -eq 'Active'} | Select-Object -First 1
$d2 = $drivers2 | Where-Object {$_.status -eq 'Available'} | Select-Object -First 1
$vid2=$v2.id; $vplate2=$v2.plateNumber; $did2=$d2.id
Write-Host "Using vehicle=$vplate2 driver=$($d2.user.name)"
$t2 = Post "$b/trips" @{tripType='VIP';tripCategory='VIP';purpose='VIP | Official VIP trip';destination='Addis Ababa';startDateTime='2026-06-15T08:00:00Z';endDateTime='2026-06-15T20:00:00Z';passengerCount=1} $empToken
Write-Host "Created: $($t2.id) state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/approve" @{comments='VIP approved'} $presToken
Write-Host "President approved: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/allocate" @{vehicleId=$vid2;driverId=$did2;estimatedFuelCost=1200;estimatedDistance=500} $deplToken
Write-Host "Allocated: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/confirm-transport" @{fuelApproved=$true;estimatedFuelCost=1200;estimatedDistance=500} $transToken
Write-Host "Transport confirmed: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/start" @{plateNumber=$vplate2;scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/complete" @{actualDistance=495;actualFuelCost=1180;finalMileage=15643} $empToken
Write-Host "Completed: state=$($t2.state)"

Write-Host "`n=== SERVICE TRIP FULL FLOW ===" -ForegroundColor Cyan
$vehicles3 = Get "$b/vehicles" $adminToken
$drivers3 = Get "$b/drivers" $adminToken
$v3 = $vehicles3 | Where-Object {$_.status -eq 'Active'} | Select-Object -First 1
$d3 = $drivers3 | Where-Object {$_.status -eq 'Available'} | Select-Object -First 1
$vid3=$v3.id; $vplate3=$v3.plateNumber; $did3=$d3.id
Write-Host "Using vehicle=$vplate3 driver=$($d3.user.name)"
$t3 = Post "$b/trips" @{tripType='Normal';tripCategory='SERVICE';purpose='SERVICE | University service trip';destination='Harar';startDateTime='2026-06-20T07:00:00Z';endDateTime='2026-06-20T15:00:00Z';passengerCount=3} $empToken
Write-Host "Created: $($t3.id) state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/approve" @{comments='Service approved'} $presToken
Write-Host "President approved: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/allocate" @{vehicleId=$vid3;driverId=$did3;estimatedFuelCost=300;estimatedDistance=100} $deplToken
Write-Host "Allocated: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/confirm-transport" @{fuelApproved=$true} $transToken
Write-Host "Transport confirmed: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/start" @{plateNumber=$vplate3;scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/complete" @{actualDistance=98;actualFuelCost=295;finalMileage=15741} $empToken
Write-Host "Completed: state=$($t3.state)"

Write-Host "`n=== MAINTENANCE ===" -ForegroundColor Cyan
$m1 = Post "$b/maintenance" @{vehicleId=$vid;issueDescription='Engine oil change required';priority='Medium'} $driverToken
Write-Host "Created: $($m1.id) state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/inspect" @{inspectionNotes='Confirmed oil change needed';estimatedCost=500} $transToken
Write-Host "Inspected: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/approve-budget" @{} $transToken
Write-Host "Budget approved: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/start" @{} $transToken
Write-Host "Started: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/complete" @{completionNotes='Oil changed successfully';actualCost=480} $transToken
Write-Host "Completed: state=$($m1.status)"

Write-Host "`n=== FUEL ===" -ForegroundColor Cyan
$f1 = Post "$b/fuel" @{vehicleId=$vid;type='Refuel';quantity=50;pricePerLiter=139.84;totalCost=6992;mileageAtRefuel=15741;station='Haramaya Fuel Station';notes='Full tank'} $transToken
Write-Host "Fuel record: $($f1.id)"
$fstats = Get "$b/fuel/statistics" $adminToken
Write-Host "Fuel stats: totalCost=$($fstats.totalCost)"

Write-Host "`n=== STATISTICS ===" -ForegroundColor Cyan
$vs = Get "$b/vehicles/statistics" $adminToken
Write-Host "Vehicle stats: total=$($vs.total)"
$ds = Get "$b/drivers/statistics" $adminToken
Write-Host "Driver stats: total=$($ds.total)"
$fbstats = Get "$b/trips/feedback/statistics" $adminToken
Write-Host "Feedback stats: totalFeedbacks=$($fbstats.totalFeedbacks) avgOverall=$($fbstats.averageRatings.overall)"
$ms = Get "$b/maintenance/statistics" $adminToken
Write-Host "Maintenance stats: total=$($ms.total)"

Write-Host "`n=== NOTIFICATIONS ===" -ForegroundColor Cyan
$notifs = Get "$b/notifications" $empToken
Write-Host "Employee notifications: $($notifs.Count)"

Write-Host "`n=== AUDIT ===" -ForegroundColor Cyan
$audit = Get "$b/audit" $adminToken
Write-Host "Audit logs: $(if($audit.data){$audit.data.Count}elseif($audit -is [array]){$audit.Count}else{'obj'})"

Write-Host "`n=== TRACKING ===" -ForegroundColor Cyan
$live = Get "$b/tracking/live" $adminToken
Write-Host "Live tracking: $($live.Count) active"

Write-Host "`n=== ALL DONE ===" -ForegroundColor Green


function Post($url, $body, $token) {
    $headers = @{'Content-Type'='application/json'}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    try { return Invoke-RestMethod $url -Method POST -Headers $headers -Body ($body | ConvertTo-Json -Compress) }
    catch { Write-Host "  ERROR: $($_.Exception.Message)"; return $null }
}
function Get($url, $token) {
    $headers = @{}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    try { return Invoke-RestMethod $url -Method GET -Headers $headers }
    catch { Write-Host "  ERROR: $($_.Exception.Message)"; return $null }
}
function Patch($url, $body, $token) {
    $headers = @{'Content-Type'='application/json'; Authorization="Bearer $token"}
    try { return Invoke-RestMethod $url -Method PATCH -Headers $headers -Body ($body | ConvertTo-Json -Compress) }
    catch { Write-Host "  ERROR: $($_.Exception.Message)"; return $null }
}

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
$h = Get "$b/health"
Write-Host "Status=$($h.status) DB=$($h.database)"

Write-Host "`n=== LOGIN ALL ROLES ===" -ForegroundColor Cyan
$adminToken = (Post "$b/auth/login" @{email='admin@haramaya.edu.et';password=$pass;appType='system-admin'}).access_token
Write-Host "Admin: $(if($adminToken){'OK'}else{'FAIL'})"
$presToken = (Post "$b/auth/login" @{email='president@haramaya.edu.et';password=$pass;appType='president'}).access_token
Write-Host "President: $(if($presToken){'OK'}else{'FAIL'})"
$transToken = (Post "$b/auth/login" @{email='transport@haramaya.edu.et';password=$pass;appType='transport-admin'}).access_token
Write-Host "Transport: $(if($transToken){'OK'}else{'FAIL'})"
$deplToken = (Post "$b/auth/login" @{email='deployment@haramaya.edu.et';password=$pass;appType='deployment-office'}).access_token
Write-Host "Deployment: $(if($deplToken){'OK'}else{'FAIL'})"
$driverToken = (Post "$b/auth/login" @{email='driver@haramaya.edu.et';password=$pass;appType='driver'}).access_token
Write-Host "Driver: $(if($driverToken){'OK'}else{'FAIL'})"
$deanToken = (Post "$b/auth/login" @{email='dean.computing-and-inform@haramaya.edu.et';password=$pass;appType='college-dean'}).access_token
Write-Host "Dean: $(if($deanToken){'OK'}else{'FAIL'})"
$deptToken = (Post "$b/auth/login" @{email='head.computer-science@haramaya.edu.et';password=$pass;appType='department'}).access_token
Write-Host "DeptHead: $(if($deptToken){'OK'}else{'FAIL'})"

Write-Host "`n=== CREATE POSTMAN USER ===" -ForegroundColor Cyan
$pu = Post "$b/users" @{name='Postman Tester';email='postman@haramaya.edu.et';password=$pass;role='User';phoneNumber='+251912345678'} $adminToken
if ($pu) { Write-Host "Created: $($pu.id)" } else { Write-Host "Already exists" }
$empToken = (Post "$b/auth/login" @{email='postman@haramaya.edu.et';password=$pass}).access_token
Write-Host "Postman login: $(if($empToken){'OK'}else{'FAIL'})"

Write-Host "`n=== CORE DATA ===" -ForegroundColor Cyan
$vehicles = Get "$b/vehicles" $adminToken
Write-Host "Vehicles: $($vehicles.Count)"
$drivers = Get "$b/drivers" $adminToken
Write-Host "Drivers: $($drivers.Count)"
$colleges = Get "$b/colleges" $adminToken
Write-Host "Colleges: $($colleges.Count)"
$depts = Get "$b/departments" $adminToken
Write-Host "Departments: $($depts.Count)"
$vid = ($vehicles | Where-Object {$_.status -eq 'Active'} | Select-Object -First 1).id
$did = ($drivers | Where-Object {$_.status -eq 'Available'} | Select-Object -First 1).id
Write-Host "Using vehicle=$vid driver=$did"

Write-Host "`n=== STANDARD TRIP FULL FLOW ===" -ForegroundColor Cyan
# Create
$t1 = Post "$b/trips" @{tripType='Normal';tripCategory='STANDARD';purpose='OFFICIAL | Standard test trip';destination='Dire Dawa';startDateTime='2026-05-10T09:00:00Z';endDateTime='2026-05-10T17:00:00Z';passengerCount=2} $empToken
Write-Host "Created: $($t1.id) state=$($t1.state)"
# Submit
$t1 = Post "$b/trips/$($t1.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t1.state)"
# Dept approve
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='Dept approved'} $deptToken
Write-Host "Dept approved: state=$($t1.state)"
# Dean approve
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='Dean approved'} $deanToken
Write-Host "Dean approved: state=$($t1.state)"
# President approve
$t1 = Post "$b/trips/$($t1.id)/approve" @{comments='President approved'} $presToken
Write-Host "President approved: state=$($t1.state)"
# Allocate (deployment)
$t1 = Post "$b/trips/$($t1.id)/allocate" @{vehicleId=$vid;driverId=$did;estimatedFuelCost=500;estimatedDistance=150} $deplToken
Write-Host "Allocated: state=$($t1.state)"
# Confirm transport
$t1 = Post "$b/trips/$($t1.id)/confirm-transport" @{fuelApproved=$true;estimatedFuelCost=500;estimatedDistance=150;notes='Ready'} $transToken
Write-Host "Transport confirmed: state=$($t1.state)"
# Start (driver)
$t1 = Post "$b/trips/$($t1.id)/start" @{plateNumber='AA-TEST-001';scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t1.state)"
# Complete (employee)
$t1 = Post "$b/trips/$($t1.id)/complete" @{actualDistance=148;actualFuelCost=490;finalMileage=15148} $empToken
Write-Host "Completed: state=$($t1.state)"
# Feedback
$fb = Post "$b/trips/$($t1.id)/feedback" @{overallRating=5;driverRating=5;vehicleRating=4;punctualityRating=5;comments='Excellent service';wouldRecommend=$true} $empToken
Write-Host "Feedback: $($fb.id)"
$standardTripId = $t1.id

Write-Host "`n=== VIP TRIP FULL FLOW ===" -ForegroundColor Cyan
$t2 = Post "$b/trips" @{tripType='VIP';tripCategory='VIP';purpose='VIP | Official VIP trip';destination='Addis Ababa';startDateTime='2026-05-15T08:00:00Z';endDateTime='2026-05-15T20:00:00Z';passengerCount=1} $empToken
Write-Host "Created: $($t2.id) state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t2.state)"
# VIP goes directly to President
$t2 = Post "$b/trips/$($t2.id)/approve" @{comments='VIP approved by President'} $presToken
Write-Host "President approved: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/allocate" @{vehicleId=$vid;driverId=$did;estimatedFuelCost=1200;estimatedDistance=500} $deplToken
Write-Host "Allocated: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/confirm-transport" @{fuelApproved=$true;estimatedFuelCost=1200;estimatedDistance=500} $transToken
Write-Host "Transport confirmed: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/start" @{plateNumber='AA-TEST-001';scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t2.state)"
$t2 = Post "$b/trips/$($t2.id)/complete" @{actualDistance=495;actualFuelCost=1180;finalMileage=15643} $empToken
Write-Host "Completed: state=$($t2.state)"

Write-Host "`n=== SERVICE TRIP FULL FLOW ===" -ForegroundColor Cyan
$t3 = Post "$b/trips" @{tripType='Normal';tripCategory='SERVICE';purpose='SERVICE | University service trip';destination='Harar';startDateTime='2026-05-20T07:00:00Z';endDateTime='2026-05-20T15:00:00Z';passengerCount=3} $empToken
Write-Host "Created: $($t3.id) state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/submit" @{} $empToken
Write-Host "Submitted: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/approve" @{comments='Service approved'} $presToken
Write-Host "President approved: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/allocate" @{vehicleId=$vid;driverId=$did;estimatedFuelCost=300;estimatedDistance=100} $deplToken
Write-Host "Allocated: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/confirm-transport" @{fuelApproved=$true} $transToken
Write-Host "Transport confirmed: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/start" @{plateNumber='AA-TEST-001';scannerValidation=$true} $driverToken
Write-Host "Started: state=$($t3.state)"
$t3 = Post "$b/trips/$($t3.id)/complete" @{actualDistance=98;actualFuelCost=295;finalMileage=15741} $empToken
Write-Host "Completed: state=$($t3.state)"

Write-Host "`n=== MAINTENANCE ===" -ForegroundColor Cyan
$m1 = Post "$b/maintenance" @{vehicleId=$vid;issueDescription='Engine oil change required';priority='Medium'} $driverToken
Write-Host "Created: $($m1.id) state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/inspect" @{inspectionNotes='Confirmed oil change needed';estimatedCost=500} $transToken
Write-Host "Inspected: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/approve-budget" @{} $adminToken
Write-Host "Budget approved: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/start" @{} $transToken
Write-Host "Started: state=$($m1.status)"
$m1 = Post "$b/maintenance/$($m1.id)/complete" @{completionNotes='Oil changed successfully';actualCost=480} $transToken
Write-Host "Completed: state=$($m1.status)"

Write-Host "`n=== FUEL ===" -ForegroundColor Cyan
$f1 = Post "$b/fuel" @{vehicleId=$vid;type='Refuel';quantity=50;pricePerLiter=139.84;totalCost=6992;mileageAtRefuel=15741;station='Haramaya Fuel Station';notes='Full tank'} $transToken
Write-Host "Fuel record: $($f1.id)"
$fstats = Get "$b/fuel/statistics" $adminToken
Write-Host "Fuel stats: totalRecords=$($fstats.totalRecords)"

Write-Host "`n=== STATISTICS ===" -ForegroundColor Cyan
$vs = Get "$b/vehicles/statistics" $adminToken
Write-Host "Vehicle stats: total=$($vs.total) available=$($vs.available)"
$ds = Get "$b/drivers/statistics" $adminToken
Write-Host "Driver stats: total=$($ds.total)"
$ts = Get "$b/trips/feedback/statistics" $adminToken
Write-Host "Feedback stats: totalFeedbacks=$($ts.totalFeedbacks)"
$ms = Get "$b/maintenance/statistics" $adminToken
Write-Host "Maintenance stats: total=$($ms.total)"

Write-Host "`n=== NOTIFICATIONS ===" -ForegroundColor Cyan
$notifs = Get "$b/notifications" $empToken
Write-Host "Notifications: $($notifs.Count)"

Write-Host "`n=== TRACKING ===" -ForegroundColor Cyan
$live = Get "$b/tracking/live" $adminToken
Write-Host "Live tracking: $($live.Count) active"

Write-Host "`n=== ALL DONE ===" -ForegroundColor Green
