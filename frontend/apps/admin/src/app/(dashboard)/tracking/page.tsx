'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Toast, { ToastType } from '@/components/Toast'

// Dynamically import Map component (client-side only)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface ToastMessage {
  message: string
  type: ToastType
}

export default function LiveTrackingPage() {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }
  
  const [selectedVehicle, setSelectedVehicle] = useState('VEH-042')
  const [followMode, setFollowMode] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Real coordinates in Addis Ababa area
  const vehicles = [
    {
      id: 'VEH-042',
      plateNumber: 'ET-3-12345',
      driver: 'Lemesa Girma',
      status: 'moving' as const,
      speed: '65 km/h',
      location: 'Bole Road → Meskel Square',
      lastUpdate: '2 sec ago',
      lat: 9.0192,
      lng: 38.7525
    },
    {
      id: 'VEH-018',
      plateNumber: 'ET-3-67890',
      driver: 'Abdi Girma',
      status: 'moving' as const,
      speed: '45 km/h',
      location: 'Piazza → Merkato',
      lastUpdate: '5 sec ago',
      lat: 9.0320,
      lng: 38.7469
    },
    {
      id: 'VEH-115',
      plateNumber: 'ET-3-24680',
      driver: 'Bekele Girma',
      status: 'idle' as const,
      speed: '0 km/h',
      location: 'Arat Kilo',
      lastUpdate: '1 min ago',
      lat: 9.0340,
      lng: 38.7636
    },
    {
      id: 'VEH-789',
      plateNumber: 'ET-3-13579',
      driver: 'Tadesse Girma',
      status: 'stopped' as const,
      speed: '0 km/h',
      location: 'CMC Area',
      lastUpdate: '15 min ago',
      lat: 9.0050,
      lng: 38.7636
    },
  ]

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)

  const handleRefresh = () => {
    setLastRefresh(new Date())
    showToast('Map refreshed', 'success')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleSearch = () => {
    setShowSearch(!showSearch)
  }

  const filteredVehicles = vehicles.filter(v => 
    v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewDetails = () => {
    showToast(`Viewing details for ${selectedVehicleData?.id} - Driver: ${selectedVehicleData?.driver}`, 'info')
  }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      {/* Page Header */}
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
            className="refresh-btn flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Map Controls */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSearch}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
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
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Follow Mode</span>
                  <button
                    onClick={() => setFollowMode(!followMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      followMode ? 'bg-emerald-600' : 'bg-gray-300'
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

              <div className="flex items-center gap-2">
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
            </div>

            {/* Real Map */}
            <div 
              className={`relative transition-all duration-300 ${
                isFullscreen ? 'h-screen' : 'h-[600px]'
              }`}
            >
              <Map 
                vehicles={searchQuery ? filteredVehicles : vehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
                followMode={followMode}
              />
              
              {/* Legend Overlay */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-3 z-[1000]">
                <p className="text-xs font-semibold text-gray-900 mb-2">Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Moving ({vehicles.filter(v => v.status === 'moving').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Idle ({vehicles.filter(v => v.status === 'idle').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-xs text-gray-700">Stopped ({vehicles.filter(v => v.status === 'stopped').length})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle List Sidebar */}
        <div className="space-y-4">
          {/* Selected Vehicle Details */}
          {selectedVehicleData && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
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
                  <p className="font-semibold text-gray-900">{selectedVehicleData.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Plate Number</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.plateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Driver</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.driver}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Speed</p>
                  <p className="font-semibold text-gray-900">{selectedVehicleData.speed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{selectedVehicleData.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Update</p>
                  <p className="text-sm text-gray-900">{selectedVehicleData.lastUpdate}</p>
                </div>
              </div>
              <button 
                onClick={handleViewDetails}
                className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          )}

          {/* All Vehicles List */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">All Vehicles ({(searchQuery ? filteredVehicles : vehicles).length})</h3>
            <div className="space-y-2">
              {(searchQuery ? filteredVehicles : vehicles).map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedVehicle === vehicle.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-900">{vehicle.id}</p>
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

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Vehicles</span>
                <span className="font-bold text-gray-900">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moving</span>
                <span className="font-bold text-green-600">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Idle</span>
                <span className="font-bold text-yellow-600">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stopped</span>
                <span className="font-bold text-red-600">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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
