# Run from Backend folder: .\scripts\migrate.ps1
# Uses .env in Backend via dotenv (same as npm run migration:run)
$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $BackendDir

if (-not (Test-Path ".env")) {
    Write-Error "No .env in $BackendDir — copy .env.production.example to .env and edit."
}

Write-Host "==> Building..."
npm run build

Write-Host "==> Running pending migrations..."
npm run migration:run

Write-Host "==> Done."
