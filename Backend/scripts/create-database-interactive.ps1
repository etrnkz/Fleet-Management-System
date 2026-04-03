# Creates database fleet_management. Prompts for PostgreSQL password.
# Run: cd Backend ; npm run db:create:interactive

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $here

$User = "postgres"
$PgHost = "localhost"
$Port = 5432
$DbName = "fleet_management"

Write-Host ""
Write-Host ("PostgreSQL login for user {0} on {1}:{2}" -f $User, $PgHost, $Port) -ForegroundColor Cyan
Write-Host "Type your Postgres password when asked below (input is hidden)." -ForegroundColor Yellow
Write-Host ""

$plain = Read-Host "Password" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($plain)
try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) | Out-Null
}

$checkSql = "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
$check = & psql -U $User -h $PgHost -p $Port -d postgres -tAc $checkSql 2>&1
if ($LASTEXITCODE -ne 0) {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    Write-Host "Connection failed. Check user, host, port, and that PostgreSQL is running." -ForegroundColor Red
    exit 1
}

if ($check -match "1") {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    Write-Host ("Database {0} already exists. Nothing to do." -f $DbName) -ForegroundColor Green
    exit 0
}

$createSql = 'CREATE DATABASE {0} OWNER {1} ENCODING ''UTF8'';' -f $DbName, $User
& psql -U $User -h $PgHost -p $Port -d postgres -c $createSql
$code = $LASTEXITCODE
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

if ($code -ne 0) {
    Write-Host "CREATE DATABASE failed. See message above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ("Created database {0}. Set DB_NAME in Backend/.env and start the API." -f $DbName) -ForegroundColor Green
