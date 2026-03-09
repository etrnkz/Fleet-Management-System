# GPS Tracking Module - Complete ✅

## Overview
Real-time GPS tracking system with WebSocket support for live location updates, offline sync capability, and comprehensive route analytics.

## Features

### ✅ Real-time Tracking
- WebSocket-based live location updates
- Broadcast to multiple viewers simultaneously
- Sub-second latency for location updates
- Connection management and room-based broadcasting

### ✅ Offline Support
- Buffer locations when offline
- Bulk upload when connection restored
- Automatic sync with server
- No data loss during connectivity issues

### ✅ Route Analytics
- Complete trip route history
- Distance calculation (Haversine formula)
- Speed tracking (average, max)
- Duration calculation
- Altitude and heading tracking

### ✅ REST API Fallback
- HTTP endpoints for all operations
- Works without WebSocket support
- Bulk upload capability
- Statistics and analytics

## Architecture

### WebSocket Gateway
- **Namespace**: `/tracking`
- **Events**:
  - `join-trip` - Join a trip's tracking room
  - `leave-trip` - Leave a trip's tracking room
  - `update-location` - Send location update
  - `bulk-update-locations` - Upload offline locations
  - `location-update` - Receive location updates (broadcast)
  - `location-history` - Receive recent locations on join

### Database Entity
```typescript
GpsLocation {
  id: uuid
  tripId: uuid
  latitude: decimal(10,7)
  longitude: decimal(10,7)
  speed: decimal(5,2)      // km/h
  heading: decimal(5,2)    // degrees (0-360)
  altitude: decimal(6,2)   // meters
  accuracy: decimal(4,2)   // meters
  isOffline: boolean
  timestamp: datetime
  metadata: jsonb {
    batteryLevel?: number
    networkType?: string
    deviceId?: string
  }
}
```

## API Endpoints

### REST API

#### 1. Update Location (REST Fallback)
```http
POST /api/v1/tracking/:tripId/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 9.0320,
  "longitude": 38.7469,
  "speed": 45.5,
  "heading": 180,
  "altitude": 2355,
  "accuracy": 10,
  "metadata": {
    "batteryLevel": 85,
    "networkType": "4G"
  }
}
```

#### 2. Bulk Upload Offline Locations
```http
POST /api/v1/tracking/:tripId/locations/bulk
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "latitude": 9.0320,
    "longitude": 38.7469,
    "speed": 45.5,
    "isOffline": true,
    "timestamp": "2026-03-01T10:30:00Z"
  },
  ...
]
```

#### 3. Get Complete Trip Route
```http
GET /api/v1/tracking/:tripId/route
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "latitude": 9.0320,
    "longitude": 38.7469,
    "speed": 45.5,
    "heading": 180,
    "timestamp": "2026-03-01T10:30:00Z"
  }
]
```

#### 4. Get Current Location
```http
GET /api/v1/tracking/:tripId/current
Authorization: Bearer <token>
```

#### 5. Get Recent Locations
```http
GET /api/v1/tracking/:tripId/recent?limit=50
Authorization: Bearer <token>
```

#### 6. Get Tracking Statistics
```http
GET /api/v1/tracking/:tripId/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalPoints": 150,
  "distance": 45.5,
  "averageSpeed": 42.3,
  "maxSpeed": 65.0,
  "duration": 65.5,
  "startTime": "2026-03-01T09:00:00Z",
  "endTime": "2026-03-01T10:05:30Z"
}
```

#### 7. Get Active Viewers
```http
GET /api/v1/tracking/:tripId/viewers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tripId": "uuid",
  "activeViewers": 5
}
```

## WebSocket Usage

### Client Connection

```javascript
import { io } from 'socket.io-client';

// Connect to tracking namespace
const socket = io('http://localhost:3000/tracking', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a trip's tracking room
socket.emit('join-trip', {
  tripId: 'trip-uuid',
  userId: 'user-uuid'
});

// Listen for location updates
socket.on('location-update', (data) => {
  console.log('New location:', data.location);
  // Update map marker
});

// Listen for location history
socket.on('location-history', (locations) => {
  console.log('Recent locations:', locations);
  // Draw route on map
});

// Send location update (driver)
socket.emit('update-location', {
  tripId: 'trip-uuid',
  location: {
    latitude: 9.0320,
    longitude: 38.7469,
    speed: 45.5,
    heading: 180
  }
});

// Upload offline locations
socket.emit('bulk-update-locations', {
  tripId: 'trip-uuid',
  locations: offlineLocationsArray
});

// Leave trip
socket.emit('leave-trip', { tripId: 'trip-uuid' });
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useTracking(tripId: string, token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/tracking', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-trip', { tripId, userId: 'user-id' });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('location-update', (data) => {
      setCurrentLocation(data.location);
      setRoute(prev => [...prev, data.location]);
    });

    newSocket.on('location-history', (locations) => {
      setRoute(locations.reverse());
      if (locations.length > 0) {
        setCurrentLocation(locations[0]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-trip', { tripId });
      newSocket.close();
    };
  }, [tripId, token]);

  const updateLocation = (location) => {
    if (socket && isConnected) {
      socket.emit('update-location', { tripId, location });
    }
  };

  return {
    currentLocation,
    route,
    isConnected,
    updateLocation
  };
}
```

## Mobile App Integration

### React Native with Geolocation

```typescript
import Geolocation from '@react-native-community/geolocation';
import { io } from 'socket.io-client';

class TripTracker {
  private socket: Socket;
  private watchId: number | null = null;
  private offlineBuffer: any[] = [];

  constructor(tripId: string, token: string) {
    this.socket = io('https://api.fleet.school.edu/tracking', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      this.socket.emit('join-trip', { tripId, userId: 'driver-id' });
      this.syncOfflineLocations();
    });
  }

  startTracking() {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed * 3.6, // m/s to km/h
          heading: position.coords.heading,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
        };

        if (this.socket.connected) {
          this.socket.emit('update-location', {
            tripId: this.tripId,
            location
          });
        } else {
          // Buffer for offline sync
          this.offlineBuffer.push({
            ...location,
            isOffline: true,
            timestamp: new Date().toISOString()
          });
        }
      },
      (error) => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // meters
        interval: 5000, // 5 seconds
        fastestInterval: 2000
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
    }
    this.socket.emit('leave-trip', { tripId: this.tripId });
    this.socket.close();
  }

  syncOfflineLocations() {
    if (this.offlineBuffer.length > 0) {
      this.socket.emit('bulk-update-locations', {
        tripId: this.tripId,
        locations: this.offlineBuffer
      });
      this.offlineBuffer = [];
    }
  }
}
```

## Distance Calculation

Uses the Haversine formula for accurate distance calculation:

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
```

## Performance Considerations

### Database Indexing
- Composite index on `(tripId, timestamp)` for fast queries
- Automatic cleanup of old locations (90+ days)

### WebSocket Optimization
- Room-based broadcasting (only to interested clients)
- Connection pooling
- Automatic reconnection handling

### Data Retention
- Keep locations for 90 days by default
- Configurable retention policy
- Automatic cleanup job

## Security

### Authentication
- JWT token required for WebSocket connection
- Token validation on connection
- Per-trip authorization checks

### Authorization
- Only drivers can update locations
- All authenticated users can view
- Trip-specific access control

## Testing

### WebSocket Testing with Socket.IO Client

```bash
npm install -g socket.io-client
```

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/tracking');

socket.on('connect', () => {
  console.log('Connected!');
  
  socket.emit('join-trip', {
    tripId: 'test-trip-id',
    userId: 'test-user-id'
  });
});

socket.on('location-update', (data) => {
  console.log('Location update:', data);
});
```

## Monitoring

### Metrics to Track
- Active WebSocket connections
- Location updates per second
- Average latency
- Offline sync queue size
- Database query performance

### Health Checks
```http
GET /api/v1/tracking/:tripId/viewers
```

Returns number of active viewers - useful for monitoring.

## Future Enhancements

### Planned Features
- [ ] Geofencing alerts
- [ ] Speed limit warnings
- [ ] Route deviation detection
- [ ] Predictive ETA calculation
- [ ] Historical route playback
- [ ] Location clustering for stopped periods

## Integration with Trip Module

The tracking module automatically:
- Only allows tracking for trips in `IN_PROGRESS` state
- Links all locations to trip records
- Provides route data for trip completion
- Calculates actual distance traveled

## Example: Complete Tracking Flow

1. **Trip Starts** → Driver starts trip
2. **Mobile App** → Connects to WebSocket
3. **Join Room** → Joins trip tracking room
4. **Start GPS** → Begins sending location updates every 5 seconds
5. **Viewers** → Transport office/requester watch live
6. **Offline** → If connection lost, buffer locations
7. **Reconnect** → Bulk upload buffered locations
8. **Trip Ends** → Stop tracking, calculate statistics
9. **Analytics** → View complete route and statistics

## Status

✅ **COMPLETE** - Real-time GPS tracking with WebSocket support, offline sync, and comprehensive analytics

---

**Date**: February 24, 2026
**Module**: GPS Tracking
**Endpoints**: 7 REST + 4 WebSocket events
**Status**: Production Ready
