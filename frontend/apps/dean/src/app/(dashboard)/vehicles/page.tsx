'use client'

import { useState } from 'react'

export default function VehiclesPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const vehicles = [
    { id: 1, name: 'Toyota Hilux', plateNumber: 'HU-4-06541', type: 'Pickup Truck', status: 'available', location: 'Main Campus Parking', fuel: 85, lastService: '2024-09-15', driver: null },
    { id: 2, name: 'Coaster Bus', plateNumber: 'HU-3-01122', type: 'Bus', status: 'maintenance', location: 'Central Garage', fuel: 12, lastService: '2024-08-20', driver: null, issue: 'Engine repair' },
    { id: 3, name: 'Hyundai Sedan', plateNumber: 'HU-1-06818', type: 'Sedan', status: 'available', location: 'Admin Parking', fuel: 60, lastService: '2024-10-01', driver: null },
    { id: 4, name: 'Toyota Land Cruiser', plateNumber: 'HU-2-03456', type: 'SUV', status: 'on-trip', location: 'En route to Harar', fuel: 45, lastService: '2024-09-28', driver: 'Ahmed Mohammed', destination: 'Harar', eta: '2 hours' },
    { id: 5, name: 'Isuzu Truck', plateNumber: 'HU-5-07891', type: 'Truck', status: 'available', location: 'Transport Office', fuel: 70, lastService: '2024-09-10', driver: null },
    { id: 6, name: 'Toyota Corolla', plateNumber: 'HU-1-04523', type: 'Sedan', status: 'on-trip', location: 'En route to Dire Dawa', fuel: 55, lastService: '2024-10-05', driver: 'Fatima Ali', destination: 'Dire Dawa', eta: '1 hour' },
    { id: 7, name: 'Mitsubishi Pajero', plateNumber: 'HU-2-08765', type: 'SUV', status: 'maintenance', location: 'Central Garage', fuel: 20, lastService: '2024-07-15', driver: null, issue: 'Brake system check' },
    { id: 8, name: 'Nissan Patrol', plateNumber: 'HU-2-05432', type: 'SUV', status: 'available', location: 'Main Campus Parking', fuel: 90, lastService: '2024-10-08', driver: null },
  ]

  const filteredVehicles = activeFilter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === activeFilter)

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    onTrip: vehicles.filter(v => v.status === 'on-trip').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700'
      case 'on-trip':
        return 'bg-blue-100 text-blue-700'
      case 'maintenance':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'on-trip':
        return 'On Trip'
      case 'maintenance':
        return 'Maintenance'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fleet Vehicles</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage all university vehicles</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'available'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveFilter('on-trip')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'on-trip'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              On Trip
            </button>
            <button
              onClick={() => setActiveFilter('maintenance')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'maintenance'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Maintenance
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none w-full"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Vehicle Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{vehicle.type}</span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6 space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{vehicle.location}</p>
                </div>
              </div>

              {/* Fuel Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Fuel Level</span>
                  <span className="text-sm text-gray-600">{vehicle.fuel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      vehicle.fuel > 50 ? 'bg-emerald-500' : vehicle.fuel > 20 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${vehicle.fuel}%` }}
                  ></div>
                </div>
              </div>

              {/* Driver (if on trip) */}
              {vehicle.status === 'on-trip' && vehicle.driver && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Driver</p>
                    <p className="text-sm text-gray-600">{vehicle.driver}</p>
                    <p className="text-xs text-gray-500 mt-1">To {vehicle.destination} • ETA: {vehicle.eta}</p>
                  </div>
                </div>
              )}

              {/* Maintenance Issue */}
              {vehicle.status === 'maintenance' && vehicle.issue && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Issue</p>
                    <p className="text-sm text-gray-600">{vehicle.issue}</p>
                  </div>
                </div>
              )}

              {/* Last Service */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                <span>Last Service</span>
                <span>{vehicle.lastService}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              <button className="w-full px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
