# GPS Tracking Test Guide

## 🎯 Quick Start

The GPS tracking test page (`test-gps-tracking.html`) is now open in your browser!

## 📋 How to Test

### Step 1: Connect to a Trip
1. The page has default values pre-filled:
   - **Trip ID**: `test-trip-123`
   - **User ID**: `test-user-456`
2. Click the **"Connect to Trip"** button
3. Watch the Activity Log - you should see:
   ```
   🔌 Connecting to WebSocket server...
   ✅ Connected to server!
   📡 Joining trip: test-trip-123
   ```

### Step 2: Send Manual Location Updates
1. After connecting, the "Send Location" button becomes active
2. Modify the coordinates if you want:
   - **Latitude**: 9.0320 (Addis Ababa area)
   - **Longitude**: 38.7469
   - **Speed**: 45 km/h
3. Click **"Send Location"**
4. Watch the Activity Log for confirmation
5. See the location appear in "Current Location" and "Recent Locations"

### Step 3: Use Auto Simulator (Recommended!)
1. Click **"Start Simulation"** in the Auto Simulator section
2. The system will automatically:
   - Send location updates every 3 seconds
   - Simulate vehicle movement (random walk)
   - Vary the speed randomly (30-70 km/h)
   - Update coordinates automatically
3. Watch the real-time updates in:
   - Current Location card
   - Recent Locations list
   - Activity Log
   - Statistics (Total Points, Avg Speed)

### Step 4: Test Multiple Viewers
1. Open the same HTML file in another browser tab/window
2. Use the same Trip ID in both windows
3. Start simulation in one window
4. Watch both windows receive the same location updates in real-time!
5. The "Viewers" count at the top will show how many are connected

## 🎮 Features to Test

### Real-time Updates
- ✅ Location updates broadcast to all connected clients
- ✅ Sub-second latency
- ✅ Automatic reconnection on disconnect

### Location History
- ✅ Receive last 50 locations when joining
- ✅ See recent 5 locations in the sidebar
- ✅ Track total points received

### Statistics
- ✅ Total location points
- ✅ Average speed calculation
- ✅ Real-time updates

### Activity Log
- ✅ All events logged with timestamps
- ✅ Connection status
- ✅ Location updates
- ✅ Errors (if any)

## 🔍 What You Should See

### When Connected Successfully:
```
Status: Connected (green badge)
Viewers: 1 (or more if multiple tabs open)
Activity Log showing:
  ✅ Connected to server!
  📡 Joining trip: test-trip-123
```

### When Sending Locations:
```
Activity Log:
  📤 Sending location: 9.0320, 38.7469
  📍 New location received: 9.0320, 38.7469

Current Location card updates with:
  - Latest coordinates
  - Current speed
  - Timestamp

Recent Locations shows last 5 updates
Statistics update in real-time
```

### During Simulation:
```
Every 3 seconds:
  - Coordinates change slightly (simulating movement)
  - Speed varies (30-70 km/h)
  - New location appears in the list
  - Stats update automatically
```

## 🧪 Advanced Testing

### Test Offline Sync (Manual)
1. Stop the simulation
2. Disconnect from the trip
3. Modify coordinates manually
4. Reconnect
5. Send location - it should work immediately

### Test Multiple Trips
1. Open two browser windows
2. Use different Trip IDs in each
3. Start simulation in both
4. Verify locations don't mix between trips

### Test WebSocket Reconnection
1. Start simulation
2. Stop the backend server
3. Watch the status change to "Disconnected"
4. Restart the server
5. Click "Connect" again
6. Simulation should resume

## 📊 REST API Testing (Alternative)

If WebSocket doesn't work, you can test via REST API:

### Send Location via REST
```bash
POST http://localhost:3000/api/v1/tracking/test-trip-123/location
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "latitude": 9.0320,
  "longitude": 38.7469,
  "speed": 45.5,
  "heading": 180,
  "accuracy": 10
}
```

### Get Trip Route
```bash
GET http://localhost:3000/api/v1/tracking/test-trip-123/route
Authorization: Bearer <your-token>
```

### Get Statistics
```bash
GET http://localhost:3000/api/v1/tracking/test-trip-123/statistics
Authorization: Bearer <your-token>
```

## 🐛 Troubleshooting

### "Disconnected" Status Won't Change
- Check if backend server is running
- Check browser console for errors (F12)
- Verify WebSocket port is not blocked

### No Locations Appearing
- Make sure you clicked "Connect to Trip" first
- Check Activity Log for error messages
- Try refreshing the page

### Simulation Not Working
- Ensure you're connected first
- Check if "Start Simulation" button is enabled
- Look for errors in Activity Log

## 🎨 UI Elements Explained

### Header
- **Status Badge**: Shows connection state (green = connected, red = disconnected)
- **Viewers Count**: Number of active viewers for this trip

### Connection Setup Card
- Enter Trip ID and User ID
- Connect/Disconnect buttons

### Send Location Card
- Manual location entry
- Auto Simulator for continuous updates

### Current Location Card
- Latest GPS coordinates
- Current speed
- Timestamp
- Statistics (Total Points, Avg Speed)

### Recent Locations Card
- Last 5 location updates
- Scrollable list
- Shows time, coordinates, and speed

### Activity Log
- Real-time event log
- Timestamps for all events
- Scrollable terminal-style display

## 🚀 Next Steps

After testing the GPS tracking:

1. **Integrate with Real Trip**: Use actual trip IDs from the database
2. **Add Authentication**: Include JWT token for secure connections
3. **Add Map Visualization**: Integrate Leaflet or Google Maps
4. **Mobile App**: Use the same WebSocket endpoints
5. **Production Deploy**: Configure for production WebSocket server

## 📝 Notes

- The test uses mock Trip IDs - in production, use real trip UUIDs
- WebSocket namespace is `/tracking`
- Default coordinates are for Addis Ababa, Ethiopia
- Simulation moves randomly to demonstrate real-time updates
- All location data is stored in the database

---

**Enjoy testing the real-time GPS tracking! 🎉**
