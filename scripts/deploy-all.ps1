# Deploy all frontend apps to Vercel
# Usage: .\scripts\deploy-all.ps1
# Prerequisites: npx vercel login (run once before this script)

$API_URL = "https://sight-knitting-opinion-cultures.trycloudflare.com/api/v1"
$WS_URL  = "https://sight-knitting-opinion-cultures.trycloudflare.com"

$apps = @(
    "Frontend/apps/employee",
    "Frontend/apps/department",
    "Frontend/apps/college-dean",
    "Frontend/apps/president",
    "Frontend/apps/transport-admin",
    "Frontend/apps/deployment-office",
    "Frontend/apps/driver",
    "Frontend/apps/system-admin"
)

foreach ($app in $apps) {
    $name = Split-Path $app -Leaf
    Write-Host "`n==> Deploying $name ..." -ForegroundColor Cyan

    npx vercel deploy $app --prod --yes `
        --env NEXT_PUBLIC_API_URL=$API_URL `
        --env NEXT_PUBLIC_WS_URL=$WS_URL

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $name deployed" -ForegroundColor Green
    } else {
        Write-Host "✗ $name failed" -ForegroundColor Red
    }
}

Write-Host "`nAll done." -ForegroundColor Cyan
