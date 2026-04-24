'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Toast, { ToastType } from '@/components/Toast'
import { tripApi, vehicleApi, trackingApi, WS_URL } from '@/lib/api'
import { io, Socket } from 'socket.io-client'
import type { RestrictedZone } from '@/components/Map'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: string
  speed?: number
}

interface ToastMessage {
  message: string
  type: ToastType
}

interface Trip {
  id: string
  requestNumber: string
  requester: { name: string; email: string }
  destination: string
  purpose: string
  startDateTime: string
  endDateTime: string
  state: string
  tripCategory: string
  allocatedVehicle?: { 
    id: string
    plateNumber: string
    make: string
    model: string
    vipGeoRestrictionEnabled: boolean
    restrictedZones: RestrictedZone[]
    fuelType?: string
    fuelEfficiency?: number
  }
  allocatedDriver?: { user: { name: string }; licenseNumber: string }
  passengerCount: number
  currentLocation?: { lat: number; lng: number; speed: number; timestamp: string; address?: string }
  isInRestrictedZone?: boolean
}

interface Vehicle {
  id: string
  vehicleId?: string
  plateNumber: string
  make?: string
  model?: string
  status: 'moving' | 'idle' | 'stopped'
  speed: string
  location: string
  lastUpdate: string
  lat: number
  lng: number
  driver?: string
  tripId?: string | null
  tripDestination?: string | null
  tripPurpose?: string | null
  requesterName?: string | null
  routePath?: [number, number][]
  plannedRoute?: [number, number][] // Road-following route from current pos to destination
  destLat?: number | null
  destLng?: number | null
  traveledKm?: number | null
  estimatedDistance?: number | null
  fuelRemainingPercent?: number | null
  fuelRemainingLiters?: number | null
  fuelRemainingKm?: number | null
  actualFuelCost?: number | null
  expectedTotalFuelCost?: number | null
  fuelType?: string
  stoppedSince?: string | null
  tripType?: string | null
}

export default function LiveTrackingPage() {
  const router = useRouter()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list') // Default to list view
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [showEngineOffModal, setShowEngineOffModal] = useState(false)
  const [turningOffEngine, setTurningOffEngine] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Map view states
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [followMode, setFollowMode] = useState(true)
  const [drawingMode, setDrawingMode] = useState(false)
  const [tempZone, setTempZone] = useState<RestrictedZone | null>(null)
  const [zoneName, setZoneName] = useState('')
  const [zoneRadius, setZoneRadius] = useState(500)
  const [showGeofenceModal, setShowGeofenceModal] = useState(false)
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])
  const [tripStats, setTripStats] = useState<{
    distance: number
    fuelUsed: number
    fuelCost: number
    averageSpeed: number
    duration: number
  } | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  // Load active trips
  const loadActiveTrips = async () => {
    try {
      setLoading(true)
      // Only fetch trips that are actually in progress or ready to start
      const response = await tripApi.getAll({ 
        state: 'IN_PROGRESS' 
      })
      
      const tripsArray = Array.isArray(response) ? response : []
      
      // Fetch location data for each trip
      const tripsWithLocation = await Promise.all(
        tripsArray.map(async (trip: any) => {
          try {
            const location: any = await trackingApi.getLatest(trip.id)
            return {
              ...trip,
              currentLocation: location ? {
                lat: location.latitude,
                lng: location.longitude,
                speed: location.speed || 0,
                timestamp: location.timestamp
              } : null,
              isInRestrictedZone: checkIfInRestrictedZone(
                location?.latitude,
                location?.longitude,
                trip.allocatedVehicle?.restrictedZones
              )
            }
          } catch {
            return { ...trip, currentLocation: null, isInRestrictedZone: false }
          }
        })
      )
      
      setTrips(tripsWithLocation)
    } catch (error: any) {
      console.error('Failed to load trips:', error)
      showToast(error.message || 'Failed to load trips', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Check if vehicle is in restricted zone
  const checkIfInRestrictedZone = (lat?: number, lng?: number, zones?: RestrictedZone[]) => {
    if (!lat || !lng || !zones || zones.length === 0) return false
    
    return zones.some(zone => {
      const distance = calculateDistance(lat, lng, zone.latitude, zone.longitude)
      return distance <= zone.radiusMeters
    })
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Handle engine off for VIP trips
  const handleEngineOff = async () => {
    if (!selectedTrip) return
    
    try {
      setTurningOffEngine(true)
      // Call API to simulate engine off
      // This would send a command to the vehicle's system
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      showToast('Engine off command sent successfully', 'success')
      setShowEngineOffModal(false)
      setSelectedTrip(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to turn off engine', 'error')
    } finally {
      setTurningOffEngine(false)
    }
  }

  // Handle track button click
  const handleTrackTrip = async (trip: Trip) => {
    if (!trip.currentLocation) {
      showToast('No live location available for this trip', 'error')
      return
    }
    
    setSelectedTrip(trip)
    setView('map')
    
    // Fetch trip route
    let routePath: [number, number][] = []
    let stats: any = null
    try {
      const routeData: any = await trackingApi.getTripRoute(trip.id)
      const rawRoute = Array.isArray(routeData) ? routeData : (routeData?.route ?? [])
      stats = routeData?.stats ?? null
      routePath = rawRoute
        .filter((p: any) => !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)))
        .map((p: any) => [Number(p.latitude), Number(p.longitude)] as [number, number])
      setRoutePoints(rawRoute)
    } catch {}

    // Geocode destination to get coordinates
    let destLat: number | null = null
    let destLng: number | null = null
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}&limit=1`,
        { headers: { 'User-Agent': 'FleetManagementSystem/1.0' } }
      )
      const geoData = await geo.json()
      if (geoData?.[0]) {
        destLat = parseFloat(geoData[0].lat)
        destLng = parseFloat(geoData[0].lon)
      }
    } catch {}

    // Fetch road-following route from OSRM (free, no API key needed)
    let plannedRoute: [number, number][] = []
    if (destLat && destLng && trip.currentLocation) {
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${trip.currentLocation.lng},${trip.currentLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`
        const osrmRes = await fetch(osrmUrl)
        const osrmData = await osrmRes.json()
        if (osrmData?.routes?.[0]?.geometry?.coordinates) {
          plannedRoute = osrmData.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          )
        }
      } catch {}
    }

    // Fuel stats from backend stats or calculate locally
    const fuelEfficiency = trip.allocatedVehicle?.fuelEfficiency || (trip.allocatedVehicle?.fuelType === 'Diesel' ? 8 : 10)
    const PETROL_PRICE = 132.18
    const DIESEL_PRICE = 139.84
    const fuelPricePerLiter = trip.allocatedVehicle?.fuelType === 'Diesel' ? DIESEL_PRICE : PETROL_PRICE
    const traveledKm = stats?.distance ?? 0
    const fuelUsed = traveledKm / fuelEfficiency
    const fuelCapacity = 60
    const fuelRemainingLiters = Math.max(0, fuelCapacity - fuelUsed)
    const fuelRemainingPercent = Math.round((fuelRemainingLiters / fuelCapacity) * 100)
    const actualFuelCost = Math.round(fuelUsed * fuelPricePerLiter * 100) / 100
    const estimatedDistance = trip.allocatedVehicle ? (trip as any).estimatedDistance || 0 : 0
    const expectedTotalFuelCost = estimatedDistance > 0
      ? Math.round((estimatedDistance / fuelEfficiency) * fuelPricePerLiter * 100) / 100
      : null

    const vehicle: Vehicle = {
      id: trip.allocatedVehicle?.id || '',
      vehicleId: trip.allocatedVehicle?.plateNumber || '',
      plateNumber: trip.allocatedVehicle?.plateNumber || '',
      make: trip.allocatedVehicle?.make,
      model: trip.allocatedVehicle?.model,
      status: trip.currentLocation.speed > 5 ? 'moving' : trip.currentLocation.speed > 0 ? 'idle' : 'stopped',
      speed: `${Math.round(trip.currentLocation.speed)} km/h`,
      location: 'Live',
      lastUpdate: getTimeAgo(new Date(trip.currentLocation.timestamp)),
      lat: trip.currentLocation.lat,
      lng: trip.currentLocation.lng,
      driver: trip.allocatedDriver?.user.name,
      tripId: trip.id,
      tripDestination: trip.destination,
      tripPurpose: trip.purpose,
      requesterName: trip.requester.name,
      tripType: trip.tripCategory || 'Normal',
      routePath,
      plannedRoute: plannedRoute.length > 1 ? plannedRoute : undefined,
      destLat,
      destLng,
      traveledKm,
      estimatedDistance: estimatedDistance || null,
      fuelRemainingPercent,
      fuelRemainingLiters: Math.round(fuelRemainingLiters * 100) / 100,
      fuelRemainingKm: Math.round(fuelRemainingLiters * fuelEfficiency),
      actualFuelCost,
      expectedTotalFuelCost,
      fuelType: trip.allocatedVehicle?.fuelType,
      stoppedSince: trip.currentLocation.speed === 0 ? trip.currentLocation.timestamp : null,
    }
    
    setVehicles([vehicle])
    setSelectedVehicle(vehicle.id)

    if (stats) {
      setTripStats({
        distance: stats.distance ?? traveledKm,
        fuelUsed: Math.round(fuelUsed * 100) / 100,
        fuelCost: actualFuelCost,
        averageSpeed: stats.averageSpeed ?? 0,
        duration: stats.duration ?? 0,
      })
    }
  }

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} sec ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hr ago`
  }

  // Initialize
  useEffect(() => {
    loadActiveTrips()

    // WebSocket for real-time updates
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))
      : null
    
    if (token) {
      socketRef.current = io(`${WS_URL}/tracking`, {
        auth: { token },
        transports: ['websocket']
      })

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected')
        socketRef.current?.emit('join-live')
      })

      socketRef.current.on('vehicle-location', (update: any) => {
        // Update trip location in real-time
        setTrips(prev => prev.map(trip => {
          if (trip.allocatedVehicle?.id === update.vehicleId) {
            const newLocation = {
              lat: update.latitude,
              lng: update.longitude,
              speed: update.speed || 0,
              timestamp: update.timestamp
            }
            return {
              ...trip,
              currentLocation: newLocation,
              isInRestrictedZone: checkIfInRestrictedZone(
                newLocation.lat,
                newLocation.lng,
                trip.allocatedVehicle?.restrictedZones
              )
            }
          }
          return trip
        }))

        // Update vehicle on map with new stats
        setVehicles(prev => prev.map(v => {
          if (v.id === update.vehicleId || v.tripId === update.tripId) {
            const newStatus: 'moving' | 'idle' | 'stopped' = (update.speed || 0) > 5 ? 'moving' : (update.speed || 0) > 0 ? 'idle' : 'stopped'
            const wasMoving = v.status !== 'stopped'
            const justStopped = newStatus === 'stopped' && wasMoving
            return {
              ...v,
              lat: update.latitude,
              lng: update.longitude,
              speed: `${Math.round(update.speed || 0)} km/h`,
              status: newStatus,
              stoppedSince: newStatus === 'stopped' ? (justStopped ? new Date().toISOString() : v.stoppedSince) : null,
              traveledKm: update.traveledKm ?? v.traveledKm,
              fuelRemainingPercent: update.fuelRemainingPercent ?? v.fuelRemainingPercent,
              fuelRemainingLiters: update.fuelRemainingLiters ?? v.fuelRemainingLiters,
              fuelRemainingKm: update.fuelRemainingKm ?? v.fuelRemainingKm,
              actualFuelCost: update.actualFuelCost ?? v.actualFuelCost,
              expectedTotalFuelCost: update.expectedTotalFuelCost ?? v.expectedTotalFuelCost,
              routePath: v.routePath
                ? [...v.routePath, [update.latitude, update.longitude] as [number, number]]
                : [[update.latitude, update.longitude] as [number, number]],
            }
          }
          return v
        }))
      })

      socketRef.current.on('geofence-violation', (data: any) => {
        showToast(`⚠️ ALERT: ${data.vehiclePlate} entered restricted zone!`, 'error')
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Auto-refresh every 10 seconds to pick up trip completions
  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveTrips()
      // If in map view and the tracked trip is no longer in progress, go back to list
      if (view === 'map' && selectedTrip) {
        tripApi.getAll({ state: 'IN_PROGRESS' }).then((res: any) => {
          const active = Array.isArray(res) ? res : []
          const stillActive = active.find((t: any) => t.id === selectedTrip.id)
          if (!stillActive) {
            setView('list')
            setSelectedTrip(null)
            setVehicles([])
          }
        }).catch(() => {})
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [view, selectedTrip])

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.requester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.allocatedVehicle?.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || trip.state === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (state: string) => {
    if (state === 'IN_PROGRESS') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusText = (state: string) => {
    if (state === 'IN_PROGRESS') return 'In Progress'
    return state
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  // List View
  if (view === 'list') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Live Trip Tracking</h1>
            <p className="text-sm text-gray-600">Monitor active trips in real-time</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">{trips.length} Active</span>
            </div>
            
            <button 
              onClick={loadActiveTrips}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by trip number, destination, requester, or vehicle..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-600 font-medium">No active trips found</p>
              <p className="text-sm text-gray-500 mt-1">Trips will appear here when they are in progress</p>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{trip.requestNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.state)}`}>
                        {getStatusText(trip.state)}
                      </span>
                      {trip.tripCategory === 'VIP' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          VIP
                        </span>
                      )}
                      {trip.isInRestrictedZone && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                          ⚠️ In Restricted Zone
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Requester:</span> {trip.requester.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Destination:</span> {trip.destination}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {trip.currentLocation && (
                      <button
                        onClick={() => handleTrackTrip(trip)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Track
                      </button>
                    )}
                    {trip.tripCategory === 'VIP' && trip.allocatedVehicle?.vipGeoRestrictionEnabled && (
                      <button
                        onClick={() => {
                          setSelectedTrip(trip)
                          setShowEngineOffModal(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Engine Off
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Vehicle</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.allocatedVehicle?.plateNumber || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.allocatedVehicle?.make} {trip.allocatedVehicle?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Driver</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.allocatedDriver?.user.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Passengers</p>
                    <p className="text-sm font-semibold text-gray-900">{trip.passengerCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Current Speed</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.currentLocation ? `${Math.round(trip.currentLocation.speed)} km/h` : 'N/A'}
                    </p>
                  </div>
                </div>

                {trip.isInRestrictedZone && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-900">Geofence Violation Alert</p>
                        <p className="text-xs text-red-700 mt-1">
                          This vehicle has entered a restricted zone. Immediate action may be required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Engine Off Confirmation Modal */}
        {showEngineOffModal && selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Turn Off Engine</h2>
                <p className="text-sm text-gray-600 mt-1">VIP Security Control</p>
              </div>

              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-900">Critical Action</p>
                      <p className="text-xs text-red-700 mt-1">
                        This will send a command to remotely turn off the vehicle engine. This action should only be used in emergency situations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Trip:</p>
                    <p className="font-semibold text-gray-900">{selectedTrip.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle:</p>
                    <p className="font-semibold text-gray-900">{selectedTrip.allocatedVehicle?.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Destination:</p>
                    <p className="font-semibold text-gray-900">{selectedTrip.destination}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowEngineOffModal(false)
                    setSelectedTrip(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={turningOffEngine}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEngineOff}
                  disabled={turningOffEngine}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {turningOffEngine ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    'Turn Off Engine'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Map View (when tracking a specific trip)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Tracking: {selectedTrip?.requestNumber}
            </h1>
            <p className="text-sm text-gray-600">
              {selectedTrip?.destination} • {selectedTrip?.requester.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedTrip?.isInRestrictedZone && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg animate-pulse">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-bold text-red-700">IN RESTRICTED ZONE</span>
            </div>
          )}
          
          {selectedTrip?.tripCategory === 'VIP' && selectedTrip?.allocatedVehicle?.vipGeoRestrictionEnabled && (
            <button
              onClick={() => setShowEngineOffModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Engine Off
            </button>
          )}
        </div>
      </div>

      {/* Trip Statistics */}
      {tripStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="text-2xl font-bold text-gray-900">{tripStats.distance} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fuel Used</p>
                <p className="text-2xl font-bold text-gray-900">{tripStats.fuelUsed} L</p>
                <p className="text-xs text-gray-500">{tripStats.fuelCost} Birr</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">{tripStats.averageSpeed} km/h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{tripStats.duration} min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-[calc(100vh-200px)]">
          <Map 
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={setSelectedVehicle}
            followMode={followMode}
            drawingMode={drawingMode}
            onZoneDrawn={(zone) => {
              setTempZone({ ...zone, radiusMeters: zoneRadius })
              setDrawingMode(false)
              setShowGeofenceModal(true)
            }}
            restrictedZones={selectedTrip?.allocatedVehicle?.restrictedZones || []}
            tempZone={tempZone}
            routePoints={routePoints}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Engine Off Modal (same as in list view) */}
      {showEngineOffModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Turn Off Engine</h2>
              <p className="text-sm text-gray-600 mt-1">VIP Security Control</p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-900">Critical Action</p>
                    <p className="text-xs text-red-700 mt-1">
                      This will send a command to remotely turn off the vehicle engine.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Trip:</p>
                  <p className="font-semibold text-gray-900">{selectedTrip.requestNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle:</p>
                  <p className="font-semibold text-gray-900">{selectedTrip.allocatedVehicle?.plateNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowEngineOffModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={turningOffEngine}
              >
                Cancel
              </button>
              <button
                onClick={handleEngineOff}
                disabled={turningOffEngine}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {turningOffEngine ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  'Turn Off Engine'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
