# Geofence Boundary Feature - Live Tracking System

## Overview

The Transport Admin Live Tracking system now includes an interactive geofence drawing feature that allows administrators to set restricted zones for vehicles (especially VIP/security vehicles) by simply clicking on the map.

## Feature Description

### What is a Geofence?

A geofence is a virtual boundary around a real-world geographic area. When a vehicle enters or exits this boundary, the system can trigger alerts and notifications.

### Use Cases

- **VIP Vehicle Security**: Restrict presidential or VIP vehicles from entering certain areas
- **Security Zones**: Mark military bases, government buildings, or sensitive locations
- **Operational Boundaries**: Define areas where vehicles should not operate
- **Safety Zones**: Mark dangerous or restricted areas

## How to Use

### Step 1: Select a Vehicle

1. Navigate to the Live Tracking page (`/tracking`)
2. Click on a vehicle from the list or map to select it
3. The selected vehicle will be highlighted

### Step 2: Enable Drawing Mode

1. Click the **"Set Boundary"** button in the map controls
2. The map cursor will change to a crosshair
3. A message will appear: "Click on the map to place a restricted zone"

### Step 3: Place the Geofence

1. Click anywhere on the map where you want to center the restricted zone
2. A preview circle will appear showing the boundary
3. The geofence configuration modal will open

### Step 4: Configure the Geofence

In the configuration modal, you can:

- **Zone Name**: Enter a descriptive name (e.g., "Presidential Palace", "Military Base")
- **Radius**: Set the radius in meters (50m - 5000m)
  - Use the number input or type directly
  - The preview circle updates in real-time
- **Location**: View the exact coordinates of the zone center

### Step 5: Save the Boundary

1. Review the configuration
2. Click **"Save Boundary"** to apply the geofence
3. The zone will be saved to the vehicle's restricted zones
4. VIP Geo-restriction will be automatically enabled for the vehicle

### Step 6: Cancel (Optional)

- Click **"Cancel"** in the modal to discard the zone
- Click the **"Cancel"** button in map controls to exit drawing mode

## Visual Indicators

### Map Display

- **Existing Zones**: Red dashed circles with 20% opacity fill
  - Color: `#ef4444` (red)
  - Dash pattern: 5px dash, 5px gap
  
- **Preview Zone**: Amber/orange dashed circle with 30% opacity fill
  - Color: `#f59e0b` (amber)
  - Dash pattern: 10px dash, 5px gap
  - Shown while configuring before saving

### Button States

- **Set Boundary** (Normal): Amber background with map icon
- **Cancel** (Drawing Mode): Red background with X icon

## Technical Details

### Data Structure

```typescript
interface RestrictedZone {
  name?: string              // Zone name
  latitude: number          // Center latitude
  longitude: number         // Center longitude
  radiusMeters: number      // Radius in meters
}
```

### Vehicle Update

When a geofence is saved, the vehicle is updated with:

```typescript
{
  vipGeoRestrictionEnabled: true,
  restrictedZones: [
    ...existingZones,
    newZone
  ]
}
```

### API Endpoints Used

- `GET /vehicles/:id` - Fetch vehicle details
- `PATCH /vehicles/:id` - Update vehicle with restricted zones

## Features

### Multiple Zones

- A vehicle can have multiple restricted zones
- Each zone is independent with its own name and radius
- All zones are displayed on the map simultaneously

### Real-Time Preview

- The zone preview updates instantly when adjusting the radius
- Visual feedback before committing the change

### Validation

- Zone name is required
- Radius must be between 50m and 5000m
- Coordinates are automatically captured from map click

### Integration with Vehicle Details

- Restricted zones are shown in the vehicle details modal
- VIP Geofence section displays all configured zones
- Each zone shows: name, radius, and coordinates

## Security Considerations

### Warning Message

When configuring a geofence, users see:

> **Security Warning**
> When this vehicle enters the restricted zone, the system will trigger alerts and notifications.

### Backend Enforcement

The backend tracking system monitors vehicle locations and:
- Detects when a vehicle enters a restricted zone
- Triggers geofence violation notifications
- Logs the violation in audit trail
- Can simulate engine-off for VIP vehicles (if configured)

## User Interface

### Map Controls Bar

Located at the top of the map:
- Search button
- Search input (when active)
- Follow Mode toggle
- **Set Boundary button** (new)
- Fullscreen toggle

### Geofence Modal

Clean, focused interface with:
- Clear title and description
- Zone name input
- Radius slider/input
- Security warning
- Location display
- Cancel and Save buttons

### Status Legend

Bottom-left of map shows:
- Moving vehicles (green)
- Idle vehicles (yellow)
- Stopped vehicles (red)

## Workflow Example

### Scenario: Restricting Presidential Vehicle

1. **Select Vehicle**: Click on the presidential vehicle (plate: GOV-001)
2. **Start Drawing**: Click "Set Boundary"
3. **Place Zone**: Click on the Presidential Palace location
4. **Configure**:
   - Name: "Presidential Palace"
   - Radius: 1000 meters
5. **Save**: Click "Save Boundary"
6. **Result**: Vehicle GOV-001 now has a 1km restricted zone around the palace

### Scenario: Multiple Security Zones

1. Select the same vehicle
2. Repeat the process for:
   - "Military Headquarters" (500m)
   - "Parliament Building" (750m)
   - "Intelligence Agency" (1000m)
3. All zones appear on the map as red circles
4. Vehicle details show all 4 restricted zones

## Benefits

### For Administrators

- **Easy to Use**: No complex coordinates or forms
- **Visual**: See exactly where the boundary is
- **Flexible**: Adjust radius before saving
- **Quick**: Set up a zone in seconds

### For Security

- **Proactive**: Set boundaries before incidents
- **Comprehensive**: Multiple zones per vehicle
- **Visible**: All zones displayed on map
- **Auditable**: All changes logged

### For Operations

- **Real-Time**: Immediate effect after saving
- **Integrated**: Works with existing tracking system
- **Scalable**: Can set zones for any vehicle
- **Maintainable**: Easy to update or remove zones

## Future Enhancements

Potential improvements:
- Polygon drawing (not just circles)
- Zone editing (modify existing zones)
- Zone deletion (remove specific zones)
- Zone templates (predefined common zones)
- Time-based restrictions (active only during certain hours)
- Zone categories (high/medium/low security)
- Bulk zone assignment (apply to multiple vehicles)

## Troubleshooting

### "Please select a vehicle first"

- You must select a vehicle before drawing a geofence
- Click on any vehicle in the list or map

### Zone not appearing on map

- Refresh the page
- Check if vehicle details modal is open (zones only show for selected vehicle)
- Verify the zone was saved successfully

### Cannot save boundary

- Ensure zone name is not empty
- Check radius is within valid range (50-5000m)
- Verify network connection

## Related Documentation

- [Database Schema](./database-schema.md) - Vehicle entity with restrictedZones field
- [Use Case Diagram](./use-case-diagram.md) - UC71: Manage Vehicle Geofences
- [Sequence Diagrams](./sequence-diagrams/) - Transport Admin workflows

---

## Summary

The geofence boundary feature provides a simple, visual way to set restricted zones for vehicles directly from the live tracking map. By clicking on the map, administrators can quickly define security boundaries that trigger alerts when vehicles enter restricted areas. This is especially useful for VIP and security vehicles that need to avoid certain locations.
