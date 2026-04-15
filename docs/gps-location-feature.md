# GPS Location & Trip Information Feature

## Overview

The live tracking system now displays detailed location information and active trip details when clicking on vehicle markers. The system uses reverse geocoding to convert GPS coordinates into human-readable addresses and shows comprehensive trip information for vehicles on active trips.

## Features

### 1. Reverse Geocoding (GPS to Address)

When you click on a vehicle marker, the system automatically:
- Fetches the exact location name from GPS coordinates
- Displays a readable address (street, neighborhood, city, state)
- Shows coordinates as fallback if address lookup fails
- Updates in real-time as the vehicle moves

### 2. Enhanced Vehicle Popup

The popup now displays:

#### Vehicle Information
- Vehicle ID / Plate Number
- Make and Model
- Status badge (Moving/Idle/Stopped)

#### Current Location (with GPS)
- **Location Icon**: Blue pin icon
- **Address**: Human-readable location name
  - Example: "Bole Road, Bole, Addis Ababa, Addis Ababa"
- **Coordinates**: Precise GPS coordinates (6 decimal places)
  - Example: "9.012345, 38.765432"
- **Loading State**: Shows spinner while fetching location name

#### Active Trip Information (if on trip)
Displayed in a blue highlighted box:
- **Trip Icon**: Clipboard icon
- **Destination**: Where the vehicle is heading
- **Purpose**: Reason for the trip
- **Requester**: Name of the person who requested the trip

#### Driver & Speed
- Driver name (or "Unassigned")
- Current speed in km/h

#### Last Update
- Time since last GPS update
- Clock icon indicator

## How It Works

### Reverse Geocoding Process

```typescript
1. Vehicle marker clicked
2. Extract GPS coordinates (lat, lng)
3. Call OpenStreetMap Nominatim API
4. Parse address components:
   - Road/Street name
   - Suburb/Neighbourhood
   - City/Town/Village
   - State/Region
5. Build readable address string
6. Display in popup
```

### API Used

**OpenStreetMap Nominatim Reverse Geocoding**
- Endpoint: `https://nominatim.openstreetmap.org/reverse`
- Parameters:
  - `format=json`
  - `lat={latitude}`
  - `lon={longitude}`
  - `zoom=18` (street level detail)
  - `addressdetails=1` (include address components)

### Data Flow

```
GPS Coordinates → Nominatim API → Address Components → Formatted String → Display
```

## Visual Design

### Popup Layout

```
┌─────────────────────────────────────┐
│ [Vehicle ID]          [STATUS BADGE]│
│ Plate Number                        │
│ Make Model                          │
├─────────────────────────────────────┤
│ 📍 Current Location:                │
│    Street Name, Neighborhood,       │
│    City, State                      │
│    9.012345, 38.765432             │
├─────────────────────────────────────┤
│ ┌─ Active Trip ──────────────────┐ │
│ │ 📋 Active Trip                  │ │
│ │ To: Destination                 │ │
│ │ Purpose: Trip purpose           │ │
│ │ Requester: Name                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Driver: Name        Speed: 45 km/h │
├─────────────────────────────────────┤
│ 🕐 Updated 2 min ago               │
└─────────────────────────────────────┘
```

### Color Scheme

- **Status Badges**:
  - Moving: Green (`bg-green-100 text-green-700`)
  - Idle: Yellow (`bg-yellow-100 text-yellow-700`)
  - Stopped: Red (`bg-red-100 text-red-700`)

- **Location Icon**: Blue (`text-blue-600`)
- **Trip Box**: Blue background (`bg-blue-50 border-blue-200`)
- **Loading Spinner**: Blue (`border-blue-600`)

## Use Cases

### 1. Emergency Response
**Scenario**: Security incident reported
- Click on nearest security vehicle
- See exact location: "Meskel Square, Addis Ketema, Addis Ababa"
- Dispatch immediately with precise location

### 2. Trip Monitoring
**Scenario**: VIP transport in progress
- Click on VIP vehicle marker
- See active trip details:
  - Destination: "Parliament Building"
  - Purpose: "Official Meeting"
  - Requester: "President's Office"
- Monitor progress in real-time

### 3. Fleet Coordination
**Scenario**: Multiple vehicles in same area
- Click on each vehicle
- Compare exact locations
- Coordinate movements based on street-level detail

### 4. Incident Investigation
**Scenario**: Vehicle stopped unexpectedly
- Click on stopped vehicle
- See last known location with address
- Coordinates for emergency services

## Technical Implementation

### Frontend Components

#### Map.tsx
```typescript
// Enhanced Vehicle Popup Component
function VehiclePopupContent({ vehicle }: { vehicle: Vehicle }) {
  const [locationName, setLocationName] = useState<string>('Loading...')
  const [loadingLocation, setLoadingLocation] = useState(true)

  useEffect(() => {
    // Fetch location name from coordinates
    fetchLocationName()
  }, [vehicle.lat, vehicle.lng])

  return (
    // Popup content with location and trip info
  )
}
```

#### Vehicle Interface
```typescript
interface Vehicle {
  id: string
  vehicleId?: string
  plateNumber: string
  make?: string
  model?: string
  driver?: string
  status: 'moving' | 'idle' | 'stopped'
  speed: string
  location: string
  lastUpdate: string
  lat: number
  lng: number
  // New fields for trip information
  tripId?: string | null
  tripDestination?: string | null
  tripPurpose?: string | null
  requesterName?: string | null
}
```

### Backend Integration

The tracking API should return trip information:

```typescript
{
  vehicleId: "uuid",
  latitude: 9.012345,
  longitude: 38.765432,
  speed: 45,
  timestamp: "2024-01-15T10:30:00Z",
  driverName: "John Doe",
  // Trip information
  tripId: "trip-uuid",
  tripDestination: "Parliament Building",
  tripPurpose: "Official Meeting",
  requesterName: "President's Office"
}
```

## Performance Considerations

### Caching
- Location names are cached per coordinate pair
- Reduces API calls for stationary vehicles
- Updates only when coordinates change significantly

### Rate Limiting
- Nominatim API has usage limits
- Implement request throttling if needed
- Consider self-hosted Nominatim for high volume

### Loading States
- Shows spinner while fetching location
- Displays coordinates immediately
- Graceful fallback to coordinates if API fails

## Error Handling

### API Failures
```typescript
try {
  const response = await fetch(nominatimUrl)
  if (response.ok) {
    // Parse and display address
  } else {
    // Fallback to coordinates
    setLocationName(`${lat}, ${lng}`)
  }
} catch (error) {
  // Network error - show coordinates
  setLocationName(`${lat}, ${lng}`)
}
```

### Missing Data
- Trip information only shown if available
- Driver shows "Unassigned" if not set
- Graceful handling of null/undefined values

## User Experience

### Loading Sequence
1. Click vehicle marker
2. Popup opens immediately with vehicle info
3. "Loading location..." shown with spinner
4. Address appears within 1-2 seconds
5. Coordinates always visible as reference

### Real-Time Updates
- Location updates as vehicle moves
- Trip information updates via WebSocket
- Popup refreshes automatically
- No need to close and reopen

## Privacy & Security

### Data Exposure
- Only authorized users can see vehicle locations
- Trip details visible only to transport admin
- GPS coordinates shown with appropriate precision

### API Usage
- User-Agent header identifies the application
- Respects Nominatim usage policy
- No personal data sent to external API

## Future Enhancements

### Planned Features
1. **Location History**: Show recent locations in popup
2. **Route Preview**: Display planned route on map
3. **ETA Calculation**: Show estimated arrival time
4. **Traffic Integration**: Display current traffic conditions
5. **Weather Info**: Show weather at vehicle location
6. **Nearby POIs**: List nearby points of interest
7. **Street View**: Link to Google Street View
8. **Offline Maps**: Cache location names for offline use

### Advanced Features
1. **Geofence Alerts**: Show if vehicle is in restricted zone
2. **Speed Alerts**: Highlight if exceeding speed limit
3. **Idle Detection**: Alert if vehicle idle too long
4. **Route Deviation**: Warn if vehicle off planned route

## Troubleshooting

### Location Not Loading
**Problem**: "Loading location..." never completes

**Solutions**:
1. Check internet connection
2. Verify Nominatim API is accessible
3. Check browser console for errors
4. Coordinates will display as fallback

### Incorrect Address
**Problem**: Address doesn't match actual location

**Solutions**:
1. Verify GPS coordinates are accurate
2. Check zoom level (18 = street level)
3. OpenStreetMap data may be outdated
4. Use coordinates as authoritative source

### Trip Info Not Showing
**Problem**: Active trip box not displayed

**Solutions**:
1. Verify vehicle is on an active trip
2. Check WebSocket connection
3. Ensure backend sends trip data
4. Refresh page to reload data

## Related Documentation

- [Geofence Feature](./geofence-feature.md) - Boundary drawing
- [Database Schema](./database-schema.md) - GPS location storage
- [Sequence Diagrams](./sequence-diagrams/) - Tracking workflows

## API Reference

### OpenStreetMap Nominatim

**Reverse Geocoding**
```
GET https://nominatim.openstreetmap.org/reverse
  ?format=json
  &lat={latitude}
  &lon={longitude}
  &zoom=18
  &addressdetails=1
```

**Response Format**
```json
{
  "address": {
    "road": "Bole Road",
    "suburb": "Bole",
    "city": "Addis Ababa",
    "state": "Addis Ababa",
    "country": "Ethiopia"
  },
  "display_name": "Full address string"
}
```

**Usage Policy**
- Maximum 1 request per second
- Include User-Agent header
- Cache results when possible
- Consider self-hosting for production

---

## Summary

The GPS location feature transforms raw coordinates into meaningful location information, making it easy for transport administrators to understand exactly where vehicles are located. Combined with active trip information, this provides complete situational awareness for fleet management and emergency response.

The system uses industry-standard reverse geocoding to provide street-level accuracy while maintaining performance through smart caching and error handling. The enhanced popup design presents all relevant information in a clear, organized layout that updates in real-time as vehicles move.
