#!/bin/bash

# ============================================================================
# Prepare Backend for Production Deployment
# ============================================================================
# This script fixes critical security issues before production deployment

set -e  # Exit on error

echo "🚀 Preparing Fleet Management Backend for Production"
echo "===================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found"
  echo "Please create .env file from .env.example"
  exit 1
fi

# Backup current .env
echo "📦 Backing up current .env file..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"
echo ""

# Generate strong JWT secrets
echo "🔐 Generating strong JWT secrets..."
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
echo "✅ Secrets generated"
echo ""

# Update .env file
echo "📝 Updating .env file..."

# Set NODE_ENV to production
sed -i.bak 's/NODE_ENV=development/NODE_ENV=production/' .env

# Update JWT secrets
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env

# Disable database logging
sed -i.bak 's/DB_LOGGING=true/DB_LOGGING=false/' .env

# Set log level to info
sed -i.bak 's/LOG_LEVEL=debug/LOG_LEVEL=info/' .env

# Remove backup files
rm -f .env.bak

echo "✅ .env file updated"
echo ""

# Display changes
echo "📋 Changes made:"
echo "  - NODE_ENV: development → production"
echo "  - JWT_SECRET: <updated with strong secret>"
echo "  - JWT_REFRESH_SECRET: <updated with strong secret>"
echo "  - DB_LOGGING: true → false"
echo "  - LOG_LEVEL: debug → info"
echo ""

# Verify .env file
echo "🔍 Verifying .env file..."
if grep -q "your-super-secret" .env; then
  echo "⚠️  Warning: Default secrets still present in .env"
  echo "Please review .env file manually"
else
  echo "✅ No default secrets found"
fi
echo ""

# Build application
echo "🔨 Building application..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run migration:run
if [ $? -eq 0 ]; then
  echo "✅ Migrations applied"
else
  echo "⚠️  Migration failed or no pending migrations"
fi
echo ""

# Test production build
echo "🧪 Testing production build..."
timeout 5 npm run start:prod &
PID=$!
sleep 3

if ps -p $PID > /dev/null; then
  echo "✅ Production build starts successfully"
  kill $PID
else
  echo "❌ Production build failed to start"
  exit 1
fi
echo ""

# Summary
echo "✅ Production preparation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review .env file: nano .env"
echo "  2. Update CORS origins in src/config/cors-origins.ts"
echo "  3. Test the application: npm run start:prod"
echo "  4. Deploy with PM2: pm2 start ecosystem.config.cjs"
echo "  5. Save PM2 config: pm2 save"
echo ""
echo "⚠️  Important:"
echo "  - Backup created at: .env.backup.$(date +%Y%m%d)_*"
echo "  - Keep JWT secrets secure"
echo "  - Update database password if using default"
echo "  - Configure firewall rules"
echo ""
echo "🚀 Ready for production deployment!"
