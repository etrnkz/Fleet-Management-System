# Reset database data and/or seed test users.
#
# PostgreSQL (default): stop the API, run SQL reset, start API, then seed.
#   1. npm run db:reset-except-users   (prints SQL — run the psql command it shows, or use scripts/clear-all-but-users.postgres.sql)
#   2. npm run start:dev
#   3. powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1 -SeedOnly
#
# SQLite (DB_TYPE=sqlite or USE_SQLITE=true in .env): delete local .db files when not -SeedOnly.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1
#   powershell -ExecutionPolicy Bypass -File .\reset_database_and_seed.ps1 -SeedOnly

param(
    [switch]$SeedOnly
)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location $here

function Test-UseSqlite {
    $envPath = Join-Path $here ".env"
    if (-not (Test-Path $envPath)) { return $false }
    foreach ($line in Get-Content $envPath) {
        $t = $line.Trim()
        if ($t -match '^\s*#' -or $t -eq '') { continue }
        if ($t -match '^\s*DB_TYPE\s*=\s*sqlite\s*$') { return $true }
        if ($t -match '^\s*USE_SQLITE\s*=\s*true\s*$') { return $true }
    }
    return $false
}

if (-not $SeedOnly) {
    if (Test-UseSqlite) {
        Write-Host "SQLite mode (.env): removing database files in $here ..." -ForegroundColor Cyan
        $dbFiles = @("fleet_management.db", "fleet_management.db-wal", "fleet_management.db-shm")
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
    } else {
        Write-Host "PostgreSQL is the default. This script does not run psql for you." -ForegroundColor Yellow
        Write-Host "  1. Stop the API"
        Write-Host "  2. Run: npm run db:reset-except-users"
        Write-Host "     Then run the printed psql command (or: psql ... -f scripts/clear-all-but-users.postgres.sql)"
        Write-Host "  3. npm run start:dev"
        Write-Host "  4. Re-run this script with -SeedOnly"
        Write-Host ""
    }
    Write-Host "After DB is empty / recreated, start the API, then:" -ForegroundColor Cyan
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
    python seed_all.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host ""
    Write-Host "Done. All test passwords are: password123" -ForegroundColor Green
    Write-Host "  developer@test.com, employee@test.com, depthead@test.com, dean@test.com,"
    Write-Host "  president@test.com, deployment@test.com, transport@test.com,"
    Write-Host "  maintenance@test.com, driver@test.com,"
    Write-Host "  sysadmin@hu.edu.et, superadmin@hu.edu.et, developer@hu.edu.et"
}
