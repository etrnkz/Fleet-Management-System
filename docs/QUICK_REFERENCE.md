# Fleet Management System - Quick Reference

## 🚀 Quick Start

### Backend
```bash
cd Backend
npm install
npm run build
npm run migrate
npm run seed
npm run start:prod
```

### Mobile Apps
```bash
# Driver App
cd Mobile/fleet_driver
flutter build apk --release
adb install -r build/app/outputs/flutter-apk/app-release.apk

# Gate Scanner
cd Mobile/fleet_gate
flutter build apk --release
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@haramaya.edu.et | Password@123 |
| Transport Office | transport@haramaya.edu.et | Password@123 |
| Driver | john@driver.com | Password@123 |
| Gate | gate@haramaya.edu.et | Password@123 |
| Employee | employee@haramaya.edu.et | Password@123 |

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1
```

### Authentication
```bash
# Login
POST /auth/login
{
  "email": "transport@haramaya.edu.et",
  "password": "Password@123"
}

# Response
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

### Trips
```bash
# Create trip
POST /trips
Authorization: Bearer <token>

# Get all trips
GET /trips

# Get trip by ID
GET /trips/:id

# Complete trip
POST /trips/:id/complete
```

### GPS Tracking
```bash
# Send GPS location
POST /tracking/:tripId/location
{
  "latitude": 9.0320,
  "longitude": 38.7469,
  "speed": 45.5,
  "heading": 180
}

# Get live vehicles
GET /tracking/live
```

### WebSocket
```javascript
// Connect
const socket = io('http://localhost:3000/tracking', {
  auth: { token: 'your-jwt-token' }
});

// Join live tracking
socket.emit('join-live');

// Listen for updates
socket.on('vehicle-location', (data) => {
  console.log('GPS Update:', data);
});
```

---

## 🗄️ Database

### Connection
```bash
psql -U postgres -d fleet_management
```

### Common Queries
```sql
-- Get all active trips
SELECT * FROM trip_requests WHERE state = 'IN_PROGRESS';

-- Get GPS locations for trip
SELECT * FROM gps_locations WHERE trip_id = 'uuid' ORDER BY timestamp DESC;

-- Get fuel records
SELECT * FROM fuel_records ORDER BY created_at DESC LIMIT 10;

-- Get driver statistics
SELECT 
  d.id,
  u.name,
  COUNT(tr.id) as total_trips
FROM drivers d
JOIN users u ON u.id = d.user_id
LEFT JOIN trip_requests tr ON tr.allocated_driver_id = d.id
GROUP BY d.id, u.name;
```

---

## 📱 Mobile App Commands

### Driver App
```bash
# Build
cd Mobile/fleet_driver
flutter build apk --release

# Install
adb install -r build/app/outputs/flutter-apk/app-release.apk

# View logs
adb logcat | grep -E "GPS Position|Forcing UI update"

# Uninstall
adb uninstall com.haramaya.fleet_driver
```

### Gate Scanner
```bash
# Build
cd Mobile/fleet_gate
flutter build apk --release

# Install
adb install -r build/app/outputs/flutter-apk/app-release.apk

# View logs
adb logcat | grep -E "Gate|QR"

# Uninstall
adb uninstall com.haramaya.fleet_gate
```

---

## 🔧 Backend Commands

### Development
```bash
npm run start:dev     # Start in watch mode
npm run build         # Build for production
npm run start:prod    # Start production build
npm run lint          # Run linter
npm run format        # Format code
```

### Database
```bash
npm run migrate       # Run migrations
npm run seed          # Seed database
npm run db:recreate   # Recreate database (⚠️ deletes all data)
```

### PM2
```bash
pm2 start ecosystem.config.cjs  # Start with PM2
pm2 stop fleet-backend          # Stop
pm2 restart fleet-backend       # Restart
pm2 logs fleet-backend          # View logs
pm2 monit                       # Monitor
pm2 save                        # Save config
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs fleet-backend

# Check database connection
psql -U postgres -d fleet_management -c "SELECT 1;"

# Check port
netstat -ano | findstr :3000

# Restart
pm2 restart fleet-backend
```

### GPS Not Updating
```bash
# Check driver app logs
adb logcat | grep "GPS Position"

# Check backend logs
pm2 logs fleet-backend | grep "GPS"

# Check WebSocket connection
wscat -c "ws://localhost:3000/tracking?token=$TOKEN"
```

### Mobile App Issues
```bash
# Clear app data
adb shell pm clear com.haramaya.fleet_driver

# Reinstall
adb uninstall com.haramaya.fleet_driver
adb install build/app/outputs/flutter-apk/app-release.apk

# Check permissions
adb shell dumpsys package com.haramaya.fleet_driver | grep permission
```

---

## 📊 Monitoring

### Check System Health
```bash
# API health
curl http://localhost:3000/api/v1/health

# Database connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# PM2 status
pm2 status

# Memory usage
free -h

# Disk usage
df -h
```

### View Logs
```bash
# Backend logs
pm2 logs fleet-backend --lines 100

# Database logs
tail -f /var/log/postgresql/postgresql-*.log

# System logs
journalctl -u fleet-backend -f
```

---

## 🔐 Security

### Generate JWT Secrets
```bash
# Windows
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 48
```

### Update .env
```env
NODE_ENV=production
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
DB_PASSWORD=<strong-password>
DB_LOGGING=false
LOG_LEVEL=info
```

---

## 📍 GPS Tracking

### Current Settings
- **Send Interval**: 5 seconds (backend)
- **UI Update**: 5 seconds (forced timer)
- **Stream Update**: Continuous (every position change)

### Test GPS
```bash
# Send test GPS location
curl -X POST http://localhost:3000/api/v1/tracking/TRIP_ID/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 9.0320,
    "longitude": 38.7469,
    "speed": 45.5
  }'
```

---

## 🎯 Trip States

```
DRAFT → PENDING_DEPARTMENT → PENDING_COLLEGE → PENDING_PRESIDENT
  ↓
APPROVED_FOR_ALLOCATION → CAR_ALLOCATED → PENDING_TRANSPORT_CONFIRM
  ↓
READY → (Gate Departure Scan) → IN_PROGRESS
  ↓
(Employee Complete) → PENDING_RETURN → (Gate Return Scan) → COMPLETED
```

---

## 📞 Quick Help

### Issue: Can't login
- Check credentials (default: Password@123)
- Check backend is running: `pm2 status`
- Check database: `psql -U postgres -d fleet_management`

### Issue: GPS not working
- Check location permissions
- Check internet connection
- Check backend logs: `pm2 logs fleet-backend`
- Check app logs: `adb logcat`

### Issue: WebSocket not connecting
- Check firewall rules
- Check CORS configuration
- Check token is valid
- Check backend logs

---

## 📚 Documentation

- **FINAL_SUMMARY.md** - Complete project summary
- **FINAL_BACKEND_CHECK_AND_TEST.md** - Testing guide
- **FUEL_PRICE_DOCUMENTATION.md** - Fuel system docs
- **DATABASE_NORMALIZATION_SUMMARY.md** - Database docs
- **AGGRESSIVE_GPS_UI_UPDATE.md** - GPS fix docs
- **Backend/SAD.md** - System architecture

---

## 🚀 Production Deployment

```bash
# 1. Prepare backend
cd Backend
powershell -ExecutionPolicy Bypass -File scripts/prepare-production.ps1

# 2. Update CORS
notepad src/config/cors-origins.ts

# 3. Build
npm run build

# 4. Deploy
pm2 start ecosystem.config.cjs
pm2 save

# 5. Verify
curl http://localhost:3000/api/v1/health
pm2 logs fleet-backend
```

---

## ✅ System Ready!

**Backend**: ✅ Running on port 3000
**Database**: ✅ PostgreSQL fleet_management
**WebSocket**: ✅ ws://localhost:3000/tracking
**Driver App**: ✅ GPS every 5s, UI updates every 5s
**Gate Scanner**: ✅ Smart scanning with history

**All systems operational! 🎉**
