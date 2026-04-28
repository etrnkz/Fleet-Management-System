'use client'

import { useState } from 'react'

export default function TripsPage() {
  const [selectedTrip, setSelectedTrip] = useState('TR-8821')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const trips = [
    {
      id: 'TR-8821',
      driver: 'Kalid Kalid',
      vehicle: 'C-DRG2621-ET',
      from: 'Main Campus',
      to: 'Conference Center',
      eta: '14:40',
      status: 'on route',
      statusColor: 'bg-emerald-500',
      statusText: 'On Route',
      speed: 65,
      progress: 65,
      routeDeviation: true,
      distance: '145 km'
    },
    {
      id: 'TR-8820',
      driver: 'Ahmed Hassan',
      vehicle: 'B-DNY-9821-B1',
      from: 'Engineering Block',
      to: 'Research Center',
      eta: '16:30',
      status: 'delayed',
      statusColor: 'bg-red-500',
      statusText: 'Delayed',
      speed: 0,
      progress: 45,
      routeDeviation: false,
      distance: '89 km'
    },
    {
      id: 'TR-8819',
      driver: 'Bekele Girma',
      vehicle: 'C-DRG2621-ET',
      from: 'Medical School',
      to: 'City Hospital',
      eta: '18:00',
      status: 'scheduled',
      statusColor: 'bg-blue-500',
      statusText: 'Scheduled',
      speed: 0,
      progress: 0,
      routeDeviation: false,
      distance: '67 km'
    }
  ]

  const stats = [
    { label: 'All', value: '26', color: 'text-gray-600', bg: 'bg-gray-50', borderColor: 'border-gray-300' },
    { label: 'Active', value: '15', color: 'text-emerald-600', bg: 'bg-emerald-50', borderColor: 'border-emerald-300' },
    { label: 'Scheduled', value: '8', color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-blue-300' },
    { label: 'Delayed', value: '3', color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-red-300' }
  ]

  const getFilteredTrips = () => {
    if (filterStatus === 'All') return trips
    return trips.filter(trip => {
      if (filterStatus === 'Active') return trip.status === 'on route'
      if (filterStatus === 'Scheduled') return trip.status === 'scheduled'
      if (filterStatus === 'Delayed') return trip.status === 'delayed'
      return true
    })
  }

  const filteredTrips = getFilteredTrips()

  return (
    <div className="p-3 md:p-6 h-full flex flex-col">
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
              <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
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
            {['All', 'Active', 'Scheduled', 'Delayed'].map((filter) => (
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
              filteredTrips.map((trip, index) => (
              <button
                key={index}
                onClick={() => setSelectedTrip(trip.id)}
                className={`w-full text-left p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                  selectedTrip === trip.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-bold text-gray-900">#{trip.id}</span>
                    <span className={`px-2 md:px-2.5 py-0.5 ${trip.statusColor} text-white text-[10px] md:text-xs font-medium rounded-full`}>
                      {trip.statusText}
                    </span>
                  </div>
                  {trip.routeDeviation && (
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{trip.driver}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">{trip.vehicle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-2">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{trip.from}</span>
                  <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="truncate">{trip.to}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-500">ETA: {trip.eta}</span>
                  {trip.speed > 0 && (
                    <span className="text-[10px] md:text-xs font-semibold text-emerald-600">{trip.speed} km/h</span>
                  )}
                </div>

                {trip.progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1 md:h-1.5">
                      <div 
                        className="bg-emerald-600 h-1 md:h-1.5 rounded-full transition-all"
                        style={{ width: `${trip.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </button>
            ))
            )}
          </div>
        </div>
        {/* Right Panel - Map and Details */}
        <div className="flex-1 flex flex-col gap-3 md:gap-6 min-h-0">
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

              {/* Map controls */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2">
                <button className="p-1.5 md:p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className="p-1.5 md:p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Trip Details Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Trip Info */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">Trip #{selectedTrip}</h3>
                  <p className="text-xs md:text-sm text-gray-500">Kalid Kalid • C-DRG2621-ET</p>
                </div>
                
                <div className="flex gap-3 md:gap-4">
                  <div className="flex-1 bg-emerald-50 rounded-lg p-2.5 md:p-3 border border-emerald-200">
                    <p className="text-[10px] md:text-xs text-emerald-600 font-medium mb-1">Speed</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-700">65</p>
                    <p className="text-[10px] md:text-xs text-emerald-600">km/h</p>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-2.5 md:p-3 border border-blue-200">
                    <p className="text-[10px] md:text-xs text-blue-600 font-medium mb-1">Progress</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-700">65</p>
                    <p className="text-[10px] md:text-xs text-blue-600">%</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 border border-gray-200">
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">Distance</p>
                  <p className="text-base md:text-lg font-bold text-gray-900">145 km</p>
                </div>
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
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Start Point</p>
                      <p className="text-[10px] md:text-xs text-gray-500 truncate">Main Campus • 14:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ring-2 md:ring-4 ring-blue-50">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Current Location</p>
                      <p className="text-[10px] md:text-xs text-emerald-600 font-medium">On Route • 14:25</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Destination</p>
                      <p className="text-[10px] md:text-xs text-gray-500 truncate">Conference Center • ETA 14:40</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-1.5 md:gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-orange-900">Route Deviation</p>
                    <p className="text-[10px] md:text-xs text-orange-700">Alternate route taken</p>
                  </div>
                </div>
              </div>
              {/* Driver Status */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide">Driver Status</h3>
                
                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
                    KK
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">Kalid Kalid</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] md:text-xs text-emerald-600 font-medium">Active • Driving</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] md:text-xs text-gray-600">Driving Time</span>
                    <span className="text-xs md:text-sm font-semibold text-gray-900">2h 15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] md:text-xs text-gray-600">Break Due</span>
                    <span className="text-xs md:text-sm font-semibold text-orange-600">45 mins</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-xs md:text-sm">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
