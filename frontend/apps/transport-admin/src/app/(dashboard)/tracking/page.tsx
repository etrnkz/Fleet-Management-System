'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Toast, { ToastType } from '@/components/Toast'
import { trackingApi, vehicleApi, WS_URL } from '@/lib/api'
import { io, Socket } from 'socket.io-client'

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

interface ToastMessage {
  message: string
  type: ToastType
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
}

export default function LiveTrackingPage() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [followMode, setFollowMode] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  // Load vehicles and their locations
  const loadVehiclesAndLocations = async () => {
    try {
      setLoading(true)
      const [vehiclesData, locationsData] = await Promise.all([
        vehicleApi.getAll(),
        trackingApi.getAll().catch(() => []),
      ])

      const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : []
      const locationsArray = Array.isArray(locationsData) ? locationsData : []

      // Map vehicles with their latest locations
      const vehiclesWithLocations = vehiclesArray.map((vehicle: any) => {
        const location = locationsArray.find((loc: any) => loc.vehicleId === vehicle.id)
        
        return {
          id: vehicle.id,
          vehicleId: vehicle.vehicleId || vehicle.plateNumber,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          status: determineStatus(location),
          speed: location?.speed ? `${Math.round(location.speed)} km/h` : '0 km/h',
          location: location ? 'Live' : 'No live trip',
          lastUpdate: location?.timestamp ? getTimeAgo(new Date(location.timestamp)) : 'No data',
          lat: location?.latitude ?? 0,
          lng: location?.longitude ?? 0,
          driver: location?.driverName || 'Unassigned',
        }
      }).filter((vehicle: Vehicle) => vehicle.lat !== 0 && vehicle.lng !== 0)

      setVehicles(vehiclesWithLocations)
      if (vehiclesWithLocations.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vehiclesWithLocations[0].id)
      }
    } catch (error: any) {
      console.error('Failed to load vehicles:', error)
      showToast(error.message || 'Failed to load tracking data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Determine vehicle status based on speed and last update
  const determineStatus = (location: any): 'moving' | 'idle' | 'stopped' => {
    if (!location) return 'stopped'
    
    const speed = location.speed || 0
    const lastUpdate = new Date(location.timestamp)
    const minutesAgo = (Date.now() - lastUpdate.getTime()) / 1000 / 60

    if (minutesAgo > 10) return 'stopped'
    if (speed > 5) return 'moving'
    return 'idle'
  }

  // Get time ago string
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds} sec ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hr ago`
  }

  // Initialize WebSocket connection
  useEffect(() => {
    loadVehiclesAndLocations()

    // Connect to WebSocket for real-time updates
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))
      : null
    
    if (token) {
      socketRef.current = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected')
      })

      socketRef.current.on('locationUpdate', (data: any) => {
        console.log('Location update received:', data)
        
        setVehicles(prev => prev.map(vehicle => {
          if (vehicle.id === data.vehicleId) {
            return {
              ...vehicle,
              lat: data.latitude,
              lng: data.longitude,
              speed: data.speed ? `${Math.round(data.speed)} km/h` : vehicle.speed,
              status: determineStatus(data),
              lastUpdate: 'Just now'
            }
          }
          return vehicle
        }))
        
        setLastRefresh(new Date())
      })

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected')
      })

      socketRef.current.on('error', (error: any) => {
        console.error('WebSocket error:', error)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)

  const handleRefresh = () => {
    loadVehiclesAndLocations()
    showToast('Map refreshed', 'success')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleSearch = () => {
    setShowSearch(!showSearch)
  }

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewDetails = () => {
    if (selectedVehicleData) {
      showToast(`Viewing details for ${selectedVehicleData.vehicleId} - ${selectedVehicleData.plateNumber}`, 'info')
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadVehiclesAndLocations()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  const displayVehicles = searchQuery ? filteredVehicles : vehicles
  const movingCount = vehicles.filter(v => v.status === 'moving').length
  const idleCount = vehicles.filter(v => v.status === 'idle').length
  const stoppedCount = vehicles.filter(v => v.status === 'stopped').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Live Vehicle Tracking</h1>
          <p className="text-sm text-gray-600">Real-time GPS monitoring of fleet vehicles</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">Live</span>
            <span className="text-xs text-gray-500">• {lastRefresh.toLocaleTimeString()}</span>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSearch}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {showSearch && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vehicles..."
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                    autoFocus
                  />
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Follow Mode</span>
                  <button
                    onClick={() => setFollowMode(!followMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      followMode ? 'bg-[#1B3D2F]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        followMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
              </button>
            </div>

            <div 
              className={`relative transition-all duration-300 ${
                isFullscreen ? 'h-screen' : 'h-[600px]'
              }`}
            >
              <Map 
                vehicles={displayVehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
                followMode={followMode}
              />
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-3 z-[1000]">
                <p className="text-xs font-semibold text-gray-900 mb-2">Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Moving ({movingCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Idle ({idleCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Stopped ({stoppedCount})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedVehicleData && (
            <div className="bg-[#1B3D2F]/10 border-2 border-[#1B3D2F] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Selected Vehicle</h3>
                <span className={`w-3 h-3 rounded-full ${
                  selectedVehicleData.status === 'moving' ? 'bg-green-500' : 
                  selectedVehicleData.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Vehicle ID</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.vehicleId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Plate Number</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.plateNumber}</p>
                </div>
                {selectedVehicleData.make && (
                  <div>
                    <p className="text-xs text-gray-600">Vehicle</p>
                    <p className="font-semibold text-gray-900">{selectedVehicleData.make} {selectedVehicleData.model}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600">Speed</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.speed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Coordinates</p>
                  <p className="text-sm text-gray-900">{selectedVehicleData.lat.toFixed(4)}, {selectedVehicleData.lng.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Update</p>
                  <p className="text-sm text-gray-900">{selectedVehicleData.lastUpdate}</p>
                </div>
              </div>
              <button 
                onClick={handleViewDetails}
                className="w-full mt-4 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">All Vehicles ({displayVehicles.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {displayVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedVehicle === vehicle.id
                      ? 'border-[#1B3D2F] bg-[#1B3D2F]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-900">{vehicle.vehicleId}</p>
                    <span className={`w-2 h-2 rounded-full ${
                      vehicle.status === 'moving' ? 'bg-green-500' : 
                      vehicle.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <p className="text-xs text-gray-600">{vehicle.plateNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{vehicle.speed}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Vehicles</span>
                <span className="font-bold text-gray-900">{vehicles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moving</span>
                <span className="font-bold text-green-600">{movingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Idle</span>
                <span className="font-bold text-yellow-600">{idleCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stopped</span>
                <span className="font-bold text-red-600">{stoppedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
