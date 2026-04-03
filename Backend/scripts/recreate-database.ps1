# Drop and recreate PostgreSQL DB using Backend/.env (DB_* only).
# Run from Backend:  .\scripts\recreate-database.ps1
# Requires: psql on PATH, superuser (usually postgres).

$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $BackendDir

if (-not (Test-Path ".env")) { Write-Error "No .env in $BackendDir" }

$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USERNAME = "postgres"
$DB_PASSWORD = ""
$DB_NAME = "fleet_management"

Get-Content ".env" | ForEach-Object {
    $line = $_ -replace "`r$", ""
    if ($line -match "^\s*#" -or $line -match "^\s*$") { return }
    if ($line -match "^DB_HOST=(.*)$") { $script:DB_HOST = $matches[1].Trim('"') }
    elseif ($line -match "^DB_PORT=(.*)$") { $script:DB_PORT = $matches[1].Trim('"') }
    elseif ($line -match "^DB_USERNAME=(.*)$") { $script:DB_USERNAME = $matches[1].Trim('"') }
    elseif ($line -match "^DB_PASSWORD=(.*)$") { $script:DB_PASSWORD = $matches[1].Trim('"') }
    elseif ($line -match "^DB_NAME=(.*)$") { $script:DB_NAME = $matches[1].Trim('"') }
}

if ([string]::IsNullOrEmpty($DB_PASSWORD)) { Write-Error "DB_PASSWORD is empty in .env" }

$sqlPath = Join-Path $BackendDir "scripts\recreate-database.postgres.sql"
$sql = Get-Content $sqlPath -Raw
$sql = $sql -replace "fleet_management", $DB_NAME
$tmp = [System.IO.Path]::GetTempFileName()
try {
    Set-Content -Path $tmp -Value $sql -NoNewline -Encoding UTF8
    $env:PGPASSWORD = $DB_PASSWORD
    Write-Host "Recreating database `"$DB_NAME`" on ${DB_USERNAME}@${DB_HOST}:${DB_PORT} …"
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -v ON_ERROR_STOP=1 -f $tmp
    Write-Host "Done. Next: npm run migrate"
}
finally {
    Remove-Item -Force $tmp -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
