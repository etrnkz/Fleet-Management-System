'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { vehicleApi, getCurrentUser } from '@/lib/api'

export default function VehiclesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleApi.getAll()
      setVehicles(Array.isArray(data) ? data : [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load vehicles', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
  }

  const filteredVehicles = vehicles.filter(v => {
    const matchesFilter = activeFilter === 'all' || v.status === activeFilter
    const matchesSearch = v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Active').length,
    onTrip: vehicles.filter(v => v.status === 'In Use').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#1B3D2F]/15 text-[#1B3D2F]'
      case 'In Use':
        return 'bg-blue-100 text-blue-700'
      case 'Maintenance':
        return 'bg-orange-100 text-orange-700'
      case 'Out of Service':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Fleet Vehicles</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage all university vehicles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-2xl font-bold text-[#1B3D2F]">{stats.available}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">On Trip</p>
          <p className="text-2xl font-bold text-blue-600">{stats.onTrip}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Maintenance</p>
          <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
        </div>
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
                  ? 'bg-[#152e22] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setActiveFilter('Active')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'Active'
                  ? 'bg-[#152e22] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveFilter('In Use')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'In Use'
                  ? 'bg-[#152e22] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              On Trip
            </button>
            <button
              onClick={() => setActiveFilter('Maintenance')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'Maintenance'
                  ? 'bg-[#152e22] text-white'
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none w-full"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Vehicle Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{vehicle.vehicleType || 'Vehicle'}</span>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-6 space-y-4">
                {/* Capacity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.capacity} seats</span>
                </div>

                {/* Fuel Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fuel Type</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.fuelType}</span>
                </div>

                {/* Year */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Year</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.year}</span>
                </div>

                {/* Mileage */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mileage</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.mileage?.toLocaleString()} km</span>
                </div>

                {/* Last Service */}
                {vehicle.nextServiceDate && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <span>Next Service</span>
                    <span>{new Date(vehicle.nextServiceDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
