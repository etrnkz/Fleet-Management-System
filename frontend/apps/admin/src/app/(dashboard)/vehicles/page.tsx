'use client'

import { useState, useEffect } from 'react'   // ✅ this makes it a module
import { vehicleApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'
interface ToastMessage {
  message: string
  type: ToastType
}

interface Vehicle {
  id: string
  vehicleId?: string
  plateNumber: string
  vehicleType?: string
  make: string
  model: string
  year: number
  status: string
  fuelType: string
  capacity?: number
  currentMileage?: number
  color?: string
}

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleType, setVehicleType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleApi.getAll()
      setVehicles(Array.isArray(data) ? data : [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load vehicles', 'error')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'maintenance':
        return 'bg-red-100 text-red-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = searchQuery === '' || 
        vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.vehicleId && vehicle.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = vehicleType === 'all' || 
        (vehicle.vehicleType && vehicle.vehicleType.toLowerCase().includes(vehicleType.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || 
        vehicle.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesType && matchesStatus
    })
  }

  const filteredVehicles = getFilteredVehicles()

  const stats = [
    {
      label: 'Total Fleet',
      value: vehicles.length.toString(),
      badge: `${vehicles.filter(v => v.status === 'Inactive').length} Inactive`,
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      label: 'Available',
      value: vehicles.filter(v => v.status === 'Active').length.toString(),
      badge: `${Math.round((vehicles.filter(v => v.status === 'Active').length / Math.max(vehicles.length, 1)) * 100)}% of fleet`,
      badgeColor: 'bg-gray-100 text-gray-700'
    },
    {
      label: 'In Maintenance',
      value: vehicles.filter(v => v.status === 'Maintenance').length.toString(),
      badge: 'Needs attention',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      label: 'Avg Utilization',
      value: vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'Active').length / vehicles.length) * 100).toString() : '0',
      badge: '',
      badgeColor: '',
      progress: vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'Active').length / vehicles.length) * 100) : 0
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <>
    <div className="p-6 h-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Vehicle Management</h1>
        <p className="text-sm text-gray-500">Monitor and manage your fleet status and assignments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Vehicle ID, plate number, make, or model..."
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
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="bus">Bus</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
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

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Make & Model</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fuel Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 font-medium">No vehicles found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new vehicle</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{vehicle.vehicleId || vehicle.plateNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-medium">{vehicle.plateNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{vehicle.make}</span>
                      <span className="text-xs text-gray-500">{vehicle.model} ({vehicle.year})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.vehicleType || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.fuelType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A'}</span>
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

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {filteredVehicles.length} of {vehicles.length} vehicles</p>
          <button onClick={loadVehicles} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
            {stat.badge && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stat.badgeColor}`}>{stat.badge}</span>
            )}
            {stat.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${stat.progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
