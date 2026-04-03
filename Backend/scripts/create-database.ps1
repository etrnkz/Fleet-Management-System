# Create PostgreSQL database fleet_management for this project.
# Requires: psql on PATH, Postgres running.
#
# Usage (PowerShell, from Backend folder):
#   $env:PGPASSWORD = 'your_postgres_password'
#   powershell -ExecutionPolicy Bypass -File .\scripts\create-database.ps1
#
# Or one line:
#   $env:PGPASSWORD='postgres'; psql -U postgres -h localhost -d postgres -f scripts/create-database.sql

param(
    [string]$PgHost = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$DbName = "fleet_management"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $here

Write-Host "Creating database '$DbName' on ${User}@${PgHost}:${Port} ..." -ForegroundColor Cyan

$createSql = "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
$check = & psql -U $User -h $PgHost -p $Port -d postgres -tAc $createSql 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "psql failed. Set PGPASSWORD, or use pgAdmin: New Database -> name: $DbName" -ForegroundColor Red
    exit 1
}
if ($check -match "1") {
    Write-Host "Database '$DbName' already exists. Nothing to do." -ForegroundColor Green
    exit 0
}

& psql -U $User -h $PgHost -p $Port -d postgres -c "CREATE DATABASE $DbName OWNER $User ENCODING 'UTF8';"
if ($LASTEXITCODE -ne 0) {
    Write-Host "CREATE DATABASE failed. On Windows, LC_COLLATE errors are common — use create-database-simple.sql instead." -ForegroundColor Yellow
    exit 1
}
Write-Host "Done. Point Backend/.env at DB_NAME=$DbName and start the API." -ForegroundColor Green
