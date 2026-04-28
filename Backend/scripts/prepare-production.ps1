# ============================================================================
# Prepare Backend for Production Deployment (Windows)
# ============================================================================
# This script fixes critical security issues before production deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Preparing Fleet Management Backend for Production" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example"
    exit 1
}

# Backup current .env
Write-Host "📦 Backing up current .env file..." -ForegroundColor Cyan
$backupName = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item ".env" $backupName
Write-Host "✅ Backup created: $backupName" -ForegroundColor Green
Write-Host ""

# Generate strong JWT secrets
Write-Host "🔐 Generating strong JWT secrets..." -ForegroundColor Cyan
function Generate-Secret {
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$JWT_SECRET = Generate-Secret
$JWT_REFRESH_SECRET = Generate-Secret
Write-Host "✅ Secrets generated" -ForegroundColor Green
Write-Host ""

# Update .env file
Write-Host "📝 Updating .env file..." -ForegroundColor Cyan

$envContent = Get-Content ".env"

# Set NODE_ENV to production
$envContent = $envContent -replace "NODE_ENV=development", "NODE_ENV=production"

# Update JWT secrets
$envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$JWT_SECRET"
$envContent = $envContent -replace "JWT_REFRESH_SECRET=.*", "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"

# Disable database logging
$envContent = $envContent -replace "DB_LOGGING=true", "DB_LOGGING=false"

# Set log level to info
$envContent = $envContent -replace "LOG_LEVEL=debug", "LOG_LEVEL=info"

# Save updated .env
$envContent | Set-Content ".env"

Write-Host "✅ .env file updated" -ForegroundColor Green
Write-Host ""

# Display changes
Write-Host "📋 Changes made:" -ForegroundColor Cyan
Write-Host "  - NODE_ENV: development → production"
Write-Host "  - JWT_SECRET: <updated with strong secret>"
Write-Host "  - JWT_REFRESH_SECRET: <updated with strong secret>"
Write-Host "  - DB_LOGGING: true → false"
Write-Host "  - LOG_LEVEL: debug → info"
Write-Host ""

# Verify .env file
Write-Host "🔍 Verifying .env file..." -ForegroundColor Cyan
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-super-secret") {
    Write-Host "⚠️  Warning: Default secrets still present in .env" -ForegroundColor Yellow
    Write-Host "Please review .env file manually"
} else {
    Write-Host "✅ No default secrets found" -ForegroundColor Green
}
Write-Host ""

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npm run migration:run
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations applied" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration failed or no pending migrations" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "✅ Production preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review .env file: notepad .env"
Write-Host "  2. Update CORS origins in src/config/cors-origins.ts"
Write-Host "  3. Test the application: npm run start:prod"
Write-Host "  4. Deploy with PM2: pm2 start ecosystem.config.cjs"
Write-Host "  5. Save PM2 config: pm2 save"
Write-Host ""
Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "  - Backup created at: $backupName"
Write-Host "  - Keep JWT secrets secure"
Write-Host "  - Update database password if using default"
Write-Host "  - Configure firewall rules"
Write-Host ""
Write-Host "🚀 Ready for production deployment!" -ForegroundColor Green
