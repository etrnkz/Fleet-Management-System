'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Circle, useMapEvents, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

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
  tripId?: string | null
  tripDestination?: string | null
  tripPurpose?: string | null
  requesterName?: string | null
  tripType?: string | null
  // Travel & fuel stats
  traveledKm?: number | null
  estimatedDistance?: number | null
  fuelRemainingPercent?: number | null
  fuelRemainingKm?: number | null
  fuelRemainingLiters?: number | null
  actualFuelCost?: number | null
  expectedTotalFuelCost?: number | null
  fuelType?: string | null
  // Route path
  routePath?: [number, number][]
  // Planned road-following route to destination (from OSRM)
  plannedRoute?: [number, number][]
  // Destination coordinates (geocoded)
  destLat?: number | null
  destLng?: number | null
  // Stop tracking
  stoppedSince?: string | null
  // Heading in degrees (0 = north, 90 = east)
  heading?: number | null
}

export interface RestrictedZone {
  name?: string
  latitude: number
  longitude: number
  radiusMeters: number
}

export interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: string
  speed?: number
}

interface MapProps {
  vehicles: Vehicle[]
  selectedVehicle: string | null
  onVehicleSelect: (id: string) => void
  followMode: boolean
  drawingMode?: boolean
  onZoneDrawn?: (zone: RestrictedZone) => void
  restrictedZones?: RestrictedZone[]
  tempZone?: RestrictedZone | null
  routePoints?: RoutePoint[]
}

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

// Fits map to show both vehicle and destination on first load, then pans without resetting zoom
function TripBoundsController({ vehicleLat, vehicleLng, destLat, destLng, followMode }: {
  vehicleLat: number
  vehicleLng: number
  destLat: number | null | undefined
  destLng: number | null | undefined
  followMode: boolean
}) {
  const map = useMap()
  const initialFitDone = useRef(false)

  useEffect(() => {
    if (!initialFitDone.current && destLat && destLng) {
      // First load: fit bounds to show both vehicle and destination
      const bounds = L.latLngBounds(
        [vehicleLat, vehicleLng],
        [destLat, destLng]
      )
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 })
      initialFitDone.current = true
    } else if (followMode && initialFitDone.current) {
      // After initial fit: only pan to vehicle without changing zoom
      map.panTo([vehicleLat, vehicleLng], { animate: true, duration: 1 })
    }
  }, [vehicleLat, vehicleLng])

  return null
}

// Component to handle geofence drawing
function GeofenceDrawer({ 
  drawingMode, 
  onZoneDrawn 
}: { 
  drawingMode: boolean
  onZoneDrawn?: (zone: RestrictedZone) => void 
}) {
  const map = useMapEvents({
    click: (e) => {
      if (drawingMode && onZoneDrawn) {
        // Default radius of 500 meters
        const zone: RestrictedZone = {
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          radiusMeters: 500
        }
        onZoneDrawn(zone)
      }
    }
  })

  useEffect(() => {
    if (drawingMode) {
      map.getContainer().style.cursor = 'crosshair'
    } else {
      map.getContainer().style.cursor = ''
    }
  }, [drawingMode, map])

  return null
}

// Enhanced Vehicle Popup with Reverse Geocoding
function VehiclePopupContent({ vehicle }: { vehicle: Vehicle }) {
  const [locationName, setLocationName] = useState<string>('Loading location...')
  const [loadingLocation, setLoadingLocation] = useState(true)

  useEffect(() => {
    // Validate coordinates
    const lat = Number(vehicle.lat)
    const lng = Number(vehicle.lng)
    
    if (isNaN(lat) || isNaN(lng)) {
      setLocationName('Invalid coordinates')
      setLoadingLocation(false)
      return
    }

    // Reverse geocode to get location name
    const fetchLocationName = async () => {
      try {
        setLoadingLocation(true)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'FleetManagementSystem/1.0'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          // Build a readable address
          const address = data.address
          const parts = []
          
          if (address.road) parts.push(address.road)
          if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood)
          if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village)
          if (address.state) parts.push(address.state)
          
          const locationStr = parts.length > 0 ? parts.join(', ') : data.display_name
          setLocationName(locationStr)
        } else {
          setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error)
        setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } finally {
        setLoadingLocation(false)
      }
    }

    fetchLocationName()
  }, [vehicle.lat, vehicle.lng])

  return (
    <div className="p-3 min-w-[280px]">
      {/* Vehicle Info */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-base text-gray-900">{vehicle.vehicleId || vehicle.plateNumber}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            vehicle.status === 'moving' ? 'bg-green-100 text-green-700' :
            vehicle.status === 'idle' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {vehicle.status.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-gray-600">{vehicle.plateNumber}</p>
        {vehicle.make && vehicle.model && (
          <p className="text-xs text-gray-600">{vehicle.make} {vehicle.model}</p>
        )}
      </div>

      {/* Current Location with GPS */}
      <div className="mb-2">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700">Current Location:</p>
            {loadingLocation ? (
              <div className="flex items-center gap-1 mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <p className="text-xs text-gray-500">Getting location...</p>
              </div>
            ) : (
              <p className="text-xs text-gray-900 mt-1 leading-relaxed">{locationName}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {Number(vehicle.lat).toFixed(6)}, {Number(vehicle.lng).toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Information (if on trip) */}
      {vehicle.tripId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-1 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs font-semibold text-blue-900">Active Trip</p>
          </div>
          {vehicle.tripDestination && (
            <p className="text-xs text-blue-800 mb-1">
              <span className="font-medium">To:</span> {vehicle.tripDestination}
            </p>
          )}
          {vehicle.tripPurpose && (
            <p className="text-xs text-blue-700 mb-1">
              <span className="font-medium">Purpose:</span> {vehicle.tripPurpose}
            </p>
          )}
          {vehicle.requesterName && (
            <p className="text-xs text-blue-700">
              <span className="font-medium">Requester:</span> {vehicle.requesterName}
            </p>
          )}
        </div>
      )}

      {/* Driver & Speed Info */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p className="text-xs text-gray-600">Driver:</p>
          <p className="text-xs font-semibold text-gray-900">{vehicle.driver || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Speed:</p>
          <p className="text-xs font-semibold text-gray-900">{vehicle.speed}</p>
        </div>
      </div>

      {/* Stopped Duration */}
      {vehicle.status === 'stopped' && vehicle.stoppedSince && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-red-800">Vehicle Stopped</p>
          </div>
          <p className="text-xs text-red-700">
            <span className="font-medium">Duration: </span>
            {(() => {
              const diff = Math.floor((Date.now() - new Date(vehicle.stoppedSince).getTime()) / 1000)
              if (diff < 60) return `${diff} seconds`
              if (diff < 3600) return `${Math.floor(diff / 60)} min ${diff % 60} sec`
              const h = Math.floor(diff / 3600)
              const m = Math.floor((diff % 3600) / 60)
              return `${h} hr ${m} min`
            })()}
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            <span className="font-medium">Stopped at: </span>
            {loadingLocation ? 'Getting location...' : locationName}
          </p>
        </div>
      )}

      {/* Travel & Fuel Stats */}
      {(vehicle.traveledKm != null || vehicle.fuelRemainingPercent != null) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2 space-y-1.5">
          {vehicle.traveledKm != null && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Traveled</span>
              <span className="font-semibold text-gray-800">
                {vehicle.traveledKm} km
                {vehicle.estimatedDistance ? ` / ${vehicle.estimatedDistance} km est.` : ''}
              </span>
            </div>
          )}
          {vehicle.fuelRemainingPercent != null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Fuel remaining</span>
                <span className={`font-semibold ${vehicle.fuelRemainingPercent < 20 ? 'text-red-600' : vehicle.fuelRemainingPercent < 40 ? 'text-yellow-600' : 'text-green-700'}`}>
                  {vehicle.fuelRemainingPercent}% · {vehicle.fuelRemainingLiters?.toFixed(1)}L · ~{vehicle.fuelRemainingKm} km
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${vehicle.fuelRemainingPercent < 20 ? 'bg-red-500' : vehicle.fuelRemainingPercent < 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${vehicle.fuelRemainingPercent}%` }}
                />
              </div>
            </div>
          )}
          {vehicle.actualFuelCost != null && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fuel cost so far</span>
              <span className="font-semibold text-gray-800">
                {vehicle.actualFuelCost.toLocaleString()} ETB
                {vehicle.expectedTotalFuelCost ? ` / ${vehicle.expectedTotalFuelCost.toLocaleString()} ETB est.` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Last Update */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-500">Updated {vehicle.lastUpdate}</p>
        </div>
      </div>
    </div>
  )
}

// Custom vehicle marker icons
const createVehicleIcon = (status: string, heading?: number | null, speed?: string) => {
  const color = status === 'moving' ? '#10b981' : status === 'idle' ? '#eab308' : '#ef4444'
  const rotation = heading != null ? heading : 0
  const speedNum = speed ? parseInt(speed) : 0
  const showSpeed = status === 'moving' && speedNum > 0

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position:relative; width:48px; height:48px;">
        <div style="
          width: 44px;
          height: 44px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          ${status === 'moving' ? 'animation: pulse 1.5s infinite;' : ''}
          transform: rotate(0deg);
        ">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style="transform: rotate(${rotation}deg); transition: transform 0.5s ease;">
            <path d="M12 2L8 8H4l2 10h12L20 8h-4L12 2z" opacity="0.3"/>
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        ${showSpeed ? `
        <div style="
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          background: ${color};
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          font-family: monospace;
        ">${speedNum} km/h</div>` : ''}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28]
  })
}

const destinationIcon = L.divIcon({
  className: 'destination-marker',
  html: `
    <div style="
      width: 36px; height: 36px;
      background: #1B3D2F;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg)">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

export default function Map({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect, 
  followMode,
  drawingMode = false,
  onZoneDrawn,
  restrictedZones = [],
  tempZone = null,
  routePoints = []
}: MapProps) {
  // Filter out vehicles with invalid coordinates
  const validVehicles = vehicles.filter(v => {
    const lat = Number(v.lat)
    const lng = Number(v.lng)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  const selectedVehicleData = validVehicles.find(v => v.id === selectedVehicle)
  const center: [number, number] = selectedVehicleData 
    ? [Number(selectedVehicleData.lat), Number(selectedVehicleData.lng)]
    : [9.0192, 38.7525] // Addis Ababa center

  // Convert route points to Leaflet format
  const routeCoordinates: [number, number][] = routePoints
    .filter(p => !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)))
    .map(p => [Number(p.latitude), Number(p.longitude)])

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Satellite">
            <>
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='Labels &copy; Esri'
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {selectedVehicleData && (
          <TripBoundsController
            vehicleLat={Number(selectedVehicleData.lat)}
            vehicleLng={Number(selectedVehicleData.lng)}
            destLat={selectedVehicleData.destLat}
            destLng={selectedVehicleData.destLng}
            followMode={followMode}
          />
        )}

        {/* Geofence drawing handler */}
        <GeofenceDrawer drawingMode={drawingMode} onZoneDrawn={onZoneDrawn} />

        {/* Display trip route polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: selectedVehicleData?.tripType?.toUpperCase() === 'VIP' ? '#10b981'
                : selectedVehicleData?.tripType?.toUpperCase() === 'SERVICE' ? '#eab308'
                : '#ef4444',
              weight: 4,
              opacity: 0.8,
              lineJoin: 'round',
              lineCap: 'round'
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm text-blue-600">Trip Route</p>
                <p className="text-xs text-gray-600">{routeCoordinates.length} GPS points</p>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* Per-vehicle traveled route paths — darker blue trail showing where vehicle has been */}
        {validVehicles.map(v => {
          return v.routePath && v.routePath.length > 1 ? (
            <Polyline
              key={`route-${v.id}`}
              positions={v.routePath}
              pathOptions={{ color: '#1a56db', weight: 5, opacity: 0.7, lineJoin: 'round', lineCap: 'round', dashArray: '6 4' }}
            />
          ) : null
        })}

        {/* Destination markers */}
        {validVehicles.map(v =>
          v.destLat && v.destLng ? (
            <Marker
              key={`dest-${v.id}`}
              position={[v.destLat, v.destLng]}
              icon={destinationIcon}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <p className="font-bold text-sm text-[#1B3D2F]">Destination</p>
                  <p className="text-xs text-gray-700 mt-1">{v.tripDestination}</p>
                  {v.plateNumber && <p className="text-xs text-gray-500 mt-1">Vehicle: {v.plateNumber}</p>}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Planned route ahead — thick blue road-following line like Google Maps */}
        {validVehicles.map(v => {
          if (!v.destLat || !v.destLng) return null
          if (v.plannedRoute && v.plannedRoute.length > 1) {
            // Find closest point to vehicle and only draw remaining route
            let closestIdx = 0
            let minDist = Infinity
            for (let i = 0; i < v.plannedRoute.length; i++) {
              const [rLat, rLng] = v.plannedRoute[i]
              const d = Math.sqrt(Math.pow(rLat - v.lat, 2) + Math.pow(rLng - v.lng, 2))
              if (d < minDist) { minDist = d; closestIdx = i }
            }
            const remainingRoute = v.plannedRoute.slice(closestIdx)
            if (remainingRoute.length < 2) return null
            return (
              <React.Fragment key={`route-${v.id}`}>
                {/* Outer white border for road effect */}
                <Polyline
                  positions={remainingRoute}
                  pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.8, lineJoin: 'round', lineCap: 'round' }}
                />
                {/* Inner blue route line */}
                <Polyline
                  positions={remainingRoute}
                  pathOptions={{ color: '#4285F4', weight: 7, opacity: 1, lineJoin: 'round', lineCap: 'round' }}
                />
              </React.Fragment>
            )
          }
          // Fallback: dashed line if no road route
          return (
            <Polyline
              key={`dest-line-${v.id}`}
              positions={[[v.lat, v.lng], [v.destLat, v.destLng]]}
              pathOptions={{ color: '#4285F4', weight: 4, opacity: 0.7, dashArray: '10 8', lineJoin: 'round', lineCap: 'round' }}
            />
          )
        })}

        {/* Display existing restricted zones */}
        {restrictedZones.map((zone, index) => (
          <Circle
            key={`zone-${index}`}
            center={[Number(zone.latitude), Number(zone.longitude)]}
            radius={zone.radiusMeters}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm text-red-600">Restricted Zone</p>
                <p className="text-xs text-gray-600">{zone.name || 'Unnamed Zone'}</p>
                <p className="text-xs text-gray-600">Radius: {zone.radiusMeters}m</p>
                <p className="text-xs text-gray-500">
                  {Number(zone.latitude).toFixed(6)}, {Number(zone.longitude).toFixed(6)}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Display temporary zone being created */}
        {tempZone && (
          <Circle
            center={[Number(tempZone.latitude), Number(tempZone.longitude)]}
            radius={tempZone.radiusMeters}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.3,
              weight: 3,
              dashArray: '10, 5'
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm text-amber-600">New Zone (Preview)</p>
                <p className="text-xs text-gray-600">Radius: {tempZone.radiusMeters}m</p>
                <p className="text-xs text-gray-500">
                  {Number(tempZone.latitude).toFixed(6)}, {Number(tempZone.longitude).toFixed(6)}
                </p>
              </div>
            </Popup>
          </Circle>
        )}
        
        {/* Show only selected vehicle when one is selected, otherwise show all */}
        {(selectedVehicle ? validVehicles.filter(v => v.id === selectedVehicle) : validVehicles).map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[Number(vehicle.lat), Number(vehicle.lng)]}
            icon={createVehicleIcon(vehicle.status, vehicle.heading, vehicle.speed)}
            eventHandlers={{
              click: () => onVehicleSelect(vehicle.id)
            }}
          >
            <Popup maxWidth={320} minWidth={280}>
              <VehiclePopupContent vehicle={vehicle} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}
