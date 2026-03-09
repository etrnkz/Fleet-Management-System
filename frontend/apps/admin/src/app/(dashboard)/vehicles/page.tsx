'use client'

import { useState } from 'react'

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleType, setVehicleType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const vehicles = [
    {
      id: 'VH-01',
      type: 'Heavy Truck',
      status: 'Active',
      statusColor: 'bg-blue-100 text-blue-700',
      location: 'North Depot - A1',
      driver: 'Siena Ferguson',
      driverImage: null
    },
    {
      id: 'VH-02',
      type: 'Heavy Truck',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700',
      location: 'North Depot - A1',
      driver: 'Siena Ferguson',
      driverImage: null
    },
    {
      id: 'VH-03',
      type: 'Heavy Truck',
      status: 'Maintenance',
      statusColor: 'bg-red-100 text-red-700',
      location: 'North Depot - A1',
      driver: 'Siena Ferguson',
      driverImage: null
    },
    {
      id: 'VH-04',
      type: 'Van',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700',
      location: 'South Depot - B2',
      driver: 'Ahmed Hassan',
      driverImage: null
    },
    {
      id: 'VH-05',
      type: 'Bus',
      status: 'Inactive',
      statusColor: 'bg-gray-100 text-gray-700',
      location: 'East Depot - C3',
      driver: 'Bekele Girma',
      driverImage: null
    },
    {
      id: 'VH-06',
      type: 'Van',
      status: 'Maintenance',
      statusColor: 'bg-red-100 text-red-700',
      location: 'West Depot - D4',
      driver: 'Tadesse Girma',
      driverImage: null
    },
    {
      id: 'VH-07',
      type: 'Bus',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700',
      location: 'Main Campus',
      driver: 'Mohammed Ali',
      driverImage: null
    }
  ]

  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase())

      // Vehicle type filter
      const matchesType = vehicleType === 'all' || 
        vehicle.type.toLowerCase().includes(vehicleType.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        vehicle.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesType && matchesStatus
    })
  }

  const filteredVehicles = getFilteredVehicles()

  const stats = [
    {
      label: 'Total Fleet',
      value: '42',
      badge: '5% Inactive',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      label: 'Available',
      value: '55',
      badge: '13% on order',
      badgeColor: 'bg-gray-100 text-gray-700'
    },
    {
      label: 'In Maintenance',
      value: '4',
      badge: 'Avg. 3rd duration',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      label: 'Avg Utilization',
      value: '93',
      badge: '',
      badgeColor: '',
      progress: 93
    }
  ]

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Vehicle Management</h1>
        <p className="text-sm text-gray-500">Monitor and manage your fleet drivers' status and assignments</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Vehicle ID, driver, or location..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">Vehicle Type</option>
            <option value="truck">Heavy Truck</option>
            <option value="van">Van</option>
            <option value="bus">Bus</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            More Filters
          </button>

          {(searchQuery || vehicleType !== 'all' || statusFilter !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('')
                setVehicleType('all')
                setStatusFilter('all')
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>
      {/* Vehicle Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicle ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assigned Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 font-medium">No vehicles found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{vehicle.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.statusColor}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-900">{vehicle.driver}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredVehicles.length > 0 ? '1' : '0'}-{Math.min(5, filteredVehicles.length)} of {filteredVehicles.length} vehicles
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
              1
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              2
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              3
            </button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              9
            </button>
            <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
            {stat.badge && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            )}
            {stat.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
