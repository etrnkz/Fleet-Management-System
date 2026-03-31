# Clear SQLite DB and recreate test users. API must be reachable at http://localhost:3000
#
# Usage (full reset):
#   1. Stop the backend if running (otherwise DB file is locked). Example:
#        Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
#   2. powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1
#   3. npm run start:dev
#   4. powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1 -SeedOnly

param(
    [switch]$SeedOnly
)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location $here

$dbFiles = @(
    "fleet_management.db",
    "fleet_management.db-wal",
    "fleet_management.db-shm"
)

if (-not $SeedOnly) {
    Write-Host "Removing SQLite database files in $here ..."
    foreach ($f in $dbFiles) {
        $path = Join-Path $here $f
        if (Test-Path $path) {
            try {
                Remove-Item -LiteralPath $path -Force
                Write-Host "  Removed $f"
            } catch {
                Write-Host "  FAILED to remove ${f}: $_" -ForegroundColor Red
                Write-Host "  Stop the backend (Ctrl+C), then run this script again." -ForegroundColor Yellow
                exit 1
            }
        }
    }
    Write-Host ""
    Write-Host "Database cleared. Start the API, then seed:" -ForegroundColor Cyan
    Write-Host "  cd Backend" 
    Write-Host "  npm run start:dev"
    Write-Host ""
    Write-Host "In another terminal (after http://localhost:3000/api/v1/health works):" -ForegroundColor Cyan
    Write-Host "  cd Backend"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1 -SeedOnly"
    Write-Host ""
}

if ($SeedOnly -or $args -contains "-SeedOnly") {
    $health = "http://localhost:3000/api/v1/health"
    Write-Host "Waiting for API at $health ..."
    $ok = $false
    for ($i = 0; $i -lt 90; $i++) {
        try {
            $r = Invoke-WebRequest -Uri $health -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -eq 200) { $ok = $true; break }
        } catch {}
        Start-Sleep -Seconds 1
    }
    if (-not $ok) {
        Write-Host "API did not become ready. Start the backend and run with -SeedOnly." -ForegroundColor Red
        exit 1
    }
    Write-Host "Seeding users and sample data..." -ForegroundColor Green
    python create_test_users.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    python create_maintenance_users.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    python create_system_admin_users.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    # Optional: python create_test_vehicles_drivers.py  (update script for current vehicle/driver DTOs)
    Write-Host ""
    Write-Host "Done. All test passwords are: password123" -ForegroundColor Green
    Write-Host "  developer@test.com, employee@test.com, depthead@test.com, dean@test.com," 
    Write-Host "  president@test.com, deployment@test.com, transport@test.com,"
    Write-Host "  maintenance@test.com, driver@test.com,"
    Write-Host "  sysadmin@hu.edu.et, superadmin@hu.edu.et, developer@hu.edu.et"
}
