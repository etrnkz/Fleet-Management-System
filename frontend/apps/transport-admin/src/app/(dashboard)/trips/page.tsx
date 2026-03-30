'use client'

import { useState, useEffect } from 'react'
import { tripApi, vehicleApi, driverApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

// TypeScript interfaces
interface Trip {
  id: string
  requestNumber: string
  requester: { name: string; email: string }
  tripType: string
  purpose: string
  destination: string
  startDateTime: string
  endDateTime: string
  passengerCount: number
  state: string
  allocatedVehicle?: { id: string; plateNumber: string; make: string; model: string }
  allocatedDriver?: { id: string; name: string; licenseNumber: string }
  estimatedDistance?: number
  actualDistance?: number
  createdAt: string
  updatedAt: string
}

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
}

interface Driver {
  id: string
  name: string
  licenseNumber: string
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchTrips()
    fetchVehicles()
    fetchDrivers()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      const list = Array.isArray(data) ? data : []
      setTrips(list)
      if (list.length > 0 && !selectedTrip) {
        setSelectedTrip(list[0])
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch trips', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const data = await vehicleApi.getAll()
      setVehicles(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const data = await driverApi.getAll()
      setDrivers(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Failed to fetch drivers:', error)
    }
  }

  // Map trip state to display status
  const getTripStatus = (state: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      'IN_PROGRESS': { text: 'On Route', color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
      'READY': { text: 'Ready', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
      'CAR_ALLOCATED': { text: 'Scheduled', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
      'PENDING_DEPARTMENT': { text: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
      'PENDING_COLLEGE': { text: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
      'PENDING_DEAN': { text: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
      'APPROVED_FOR_ALLOCATION': { text: 'Approved', color: 'bg-green-500', bgColor: 'bg-green-50' },
      'COMPLETED': { text: 'Completed', color: 'bg-gray-500', bgColor: 'bg-gray-50' },
      'CANCELLED': { text: 'Cancelled', color: 'bg-red-500', bgColor: 'bg-red-50' },
      'REJECTED': { text: 'Rejected', color: 'bg-red-500', bgColor: 'bg-red-50' },
    }
    return statusMap[state] || { text: state, color: 'bg-gray-500', bgColor: 'bg-gray-50' }
  }

  // Calculate statistics
  const stats = {
    all: trips.length,
    active: trips.filter(t => t.state === 'IN_PROGRESS').length,
    scheduled: trips.filter(t => ['CAR_ALLOCATED', 'READY'].includes(t.state)).length,
    pending: trips.filter(t => t.state.includes('PENDING')).length,
  }

  // Filter trips
  const getFilteredTrips = () => {
    let filtered = trips

    if (filterStatus === 'Active') {
      filtered = filtered.filter(t => t.state === 'IN_PROGRESS')
    } else if (filterStatus === 'Scheduled') {
      filtered = filtered.filter(t => ['CAR_ALLOCATED', 'READY'].includes(t.state))
    } else if (filterStatus === 'Pending') {
      filtered = filtered.filter(t => t.state.includes('PENDING'))
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.requester.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredTrips = getFilteredTrips()

  // Format date/time
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 h-full flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-6 min-h-0">
        {/* Left Panel - Trip List */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden max-h-[400px] lg:max-h-none">
          {/* Header */}
          <div className="p-3 md:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-900">
                  {filterStatus === 'All' ? 'All Trips' : `${filterStatus} Trips`}
                </h2>
                <p className="text-xs md:text-sm text-gray-500">{filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips..."
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              />
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-2.5 md:left-3 top-2.5 md:top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {['All', 'Active', 'Scheduled', 'Pending'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  filterStatus === filter
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Trip List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm md:text-base text-gray-500 font-medium">No {filterStatus.toLowerCase()} trips found</p>
              </div>
            ) : (
              filteredTrips.map((trip) => {
                const status = getTripStatus(trip.state)
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`w-full text-left p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                      selectedTrip?.id === trip.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm font-bold text-gray-900">#{trip.requestNumber}</span>
                        <span className={`px-2 md:px-2.5 py-0.5 ${status.color} text-white text-[10px] md:text-xs font-medium rounded-full`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{trip.requester.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">
                          {trip.allocatedVehicle ? trip.allocatedVehicle.plateNumber : 'No vehicle assigned'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-2">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">{trip.destination}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-gray-500">
                        {formatDateTime(trip.startDateTime)}
                      </span>
                      {trip.estimatedDistance && (
                        <span className="text-[10px] md:text-xs font-semibold text-emerald-600">
                          {trip.estimatedDistance} km
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel - Trip Details */}
        <div className="flex-1 flex flex-col gap-3 md:gap-6 min-h-0">
          {selectedTrip ? (
            <>
              {/* Map Area */}
              <div className="flex-1 min-h-[300px] md:min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
                  {/* Map decorative elements */}
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 md:w-32 md:h-32 bg-white rounded-lg opacity-40 shadow-sm"></div>
                  <div className="absolute top-1/3 right-1/3 w-16 h-16 md:w-24 md:h-24 bg-white rounded-lg opacity-40 shadow-sm"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-18 h-18 md:w-28 md:h-28 bg-white rounded-lg opacity-40 shadow-sm"></div>
                  
                  {/* Route lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path d="M 100 300 Q 300 200 500 350" stroke="url(#routeGradient)" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M 200 150 Q 400 100 600 200" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
                  </svg>

                  {/* Active vehicle marker */}
                  {selectedTrip.state === 'IN_PROGRESS' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                        <div className="relative w-10 h-10 md:w-14 md:h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl border-2 md:border-4 border-white">
                          <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Details Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Trip Info */}
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                        Trip #{selectedTrip.requestNumber}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {selectedTrip.requester.name} • {selectedTrip.allocatedVehicle?.plateNumber || 'No vehicle'}
                      </p>
                    </div>
                    
                    <div className="flex gap-3 md:gap-4">
                      <div className="flex-1 bg-emerald-50 rounded-lg p-2.5 md:p-3 border border-emerald-200">
                        <p className="text-[10px] md:text-xs text-emerald-600 font-medium mb-1">Type</p>
                        <p className="text-base md:text-lg font-bold text-emerald-700">{selectedTrip.tripType}</p>
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-lg p-2.5 md:p-3 border border-blue-200">
                        <p className="text-[10px] md:text-xs text-blue-600 font-medium mb-1">Passengers</p>
                        <p className="text-base md:text-lg font-bold text-blue-700">{selectedTrip.passengerCount}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 border border-gray-200">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Purpose</p>
                      <p className="text-xs md:text-sm text-gray-900">{selectedTrip.purpose}</p>
                    </div>

                    {selectedTrip.estimatedDistance && (
                      <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 border border-gray-200">
                        <p className="text-[10px] md:text-xs text-gray-500 mb-1">Distance</p>
                        <p className="text-base md:text-lg font-bold text-gray-900">
                          {selectedTrip.actualDistance || selectedTrip.estimatedDistance} km
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Route Timeline */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide">Route Timeline</h3>
                    
                    <div className="space-y-2.5 md:space-y-3">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-gray-900">Start Time</p>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {formatDateTime(selectedTrip.startDateTime)}
                          </p>
                        </div>
                      </div>
                      
                      {selectedTrip.state === 'IN_PROGRESS' && (
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ring-2 md:ring-4 ring-blue-50">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-600 rounded-full animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-semibold text-gray-900">In Progress</p>
                            <p className="text-[10px] md:text-xs text-emerald-600 font-medium">On Route</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-gray-900">Destination</p>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {selectedTrip.destination} • {formatDateTime(selectedTrip.endDateTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs md:text-sm font-semibold text-blue-900">Status: {getTripStatus(selectedTrip.state).text}</p>
                      <p className="text-[10px] md:text-xs text-blue-700 mt-1">State: {selectedTrip.state}</p>
                    </div>
                  </div>

                  {/* Driver/Vehicle Status */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide">
                      {selectedTrip.allocatedDriver ? 'Driver Info' : 'Assignment'}
                    </h3>
                    
                    {selectedTrip.allocatedDriver ? (
                      <>
                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
                            {selectedTrip.allocatedDriver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                              {selectedTrip.allocatedDriver.name}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500">
                              {selectedTrip.allocatedDriver.licenseNumber}
                            </p>
                          </div>
                        </div>

                        {selectedTrip.allocatedVehicle && (
                          <div className="space-y-1.5 md:space-y-2">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-[10px] md:text-xs text-gray-600">Vehicle</span>
                              <span className="text-xs md:text-sm font-semibold text-gray-900">
                                {selectedTrip.allocatedVehicle.plateNumber}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-[10px] md:text-xs text-gray-600">Model</span>
                              <span className="text-xs md:text-sm font-semibold text-gray-900">
                                {selectedTrip.allocatedVehicle.make} {selectedTrip.allocatedVehicle.model}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs md:text-sm font-semibold text-yellow-900">Not Assigned</p>
                        <p className="text-[10px] md:text-xs text-yellow-700 mt-1">
                          Waiting for vehicle and driver allocation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-center p-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">Select a trip to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
