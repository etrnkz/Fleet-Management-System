$b='https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'
$at=(Invoke-RestMethod "$b/auth/login" -Method POST -ContentType 'application/json' -Body '{"email":"admin@haramaya.edu.et","password":"Password@123","appType":"system-admin"}').access_token
$h=@{Authorization="Bearer $at";'Content-Type'='application/json'}
$dt=(Invoke-RestMethod "$b/auth/login" -Method POST -ContentType 'application/json' -Body '{"email":"deployment@haramaya.edu.et","password":"Password@123","appType":"deployment-office"}').access_token
$dh=@{Authorization="Bearer $dt";'Content-Type'='application/json'}

$trips=Invoke-RestMethod "$b/trips" -Headers $h
$trip=$trips|Where-Object{$_.state -eq 'APPROVED_FOR_ALLOCATION'}|Select-Object -First 1
Write-Host "Trip to allocate: $($trip.id) req=$($trip.requestNumber)"

$vehicles=Invoke-RestMethod "$b/vehicles" -Headers $h
$v=$vehicles|Where-Object{$_.status -eq 'Active'}|Select-Object -First 1
Write-Host "Vehicle: $($v.id) plate=$($v.plateNumber)"

$drivers=Invoke-RestMethod "$b/drivers" -Headers $h
$d=$drivers|Where-Object{$_.status -eq 'Available'}|Select-Object -First 1
Write-Host "Driver: $($d.id) name=$($d.user.name)"

if (-not $trip) { Write-Host "NO TRIP IN APPROVED_FOR_ALLOCATION"; exit }
if (-not $v) { Write-Host "NO ACTIVE VEHICLE"; exit }
if (-not $d) { Write-Host "NO AVAILABLE DRIVER"; exit }

$body = "{`"vehicleId`":`"$($v.id)`",`"driverId`":`"$($d.id)`",`"estimatedFuelCost`":500,`"estimatedDistance`":150}"
Write-Host "Body: $body"

try {
    $r = Invoke-RestMethod "$b/trips/$($trip.id)/allocate" -Headers $dh -Method POST -Body $body
    Write-Host "SUCCESS: state=$($r.state)"
} catch {
    $errBody = ''
    try { $errBody = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {}
    Write-Host "FAILED: $($_.Exception.Message)"
    Write-Host "Detail: $errBody"
}
