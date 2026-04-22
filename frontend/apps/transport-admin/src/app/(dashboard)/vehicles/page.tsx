'use client'

import { useState, useEffect } from 'react'
import { vehicleApi, tripApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'
import Combobox from '@/components/Combobox'
interface ToastMessage {
  message: string
  type: ToastType
}

type RestrictedZone = {
  name?: string
  latitude: number
  longitude: number
  radiusMeters: number
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
  vipGeoRestrictionEnabled?: boolean
  restrictedZones?: RestrictedZone[] | null
  onTrip?: boolean
  assignedDriver?: {
    id: string
    user: {
      name: string
      email: string
    }
    licenseNumber: string
  } | null
}

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleType, setVehicleType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [geofenceVehicle, setGeofenceVehicle] = useState<Vehicle | null>(null)
  const [vipGeoEnabled, setVipGeoEnabled] = useState(false)
  const [geofenceZones, setGeofenceZones] = useState<RestrictedZone[]>([])
  const [savingGeofence, setSavingGeofence] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const [vehiclesData, tripsData] = await Promise.all([
        vehicleApi.getAll(),
        tripApi.getAll({ state: 'IN_PROGRESS' })
      ])
      
      const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : []
      const tripsArray = Array.isArray(tripsData) ? tripsData : []
      
      const vehiclesOnTrip = new Set(
        tripsArray
          .map((trip: any) => trip.allocatedVehicle?.id)
          .filter((id: string) => id)
      )
      
      const vehiclesWithTripStatus = vehiclesArray.map((vehicle: any) => ({
        ...vehicle,
        onTrip: vehiclesOnTrip.has(vehicle.id)
      }))
      
      setVehicles(vehiclesWithTripStatus)
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

  const openGeofenceEditor = async (v: Vehicle) => {
    try {
      const full = await vehicleApi.getById(v.id) as any
      setGeofenceVehicle(full as Vehicle)
      setVipGeoEnabled(!!full.vipGeoRestrictionEnabled)
      const z = Array.isArray(full.restrictedZones) ? full.restrictedZones : []
      setGeofenceZones(
        z.length > 0
          ? z.map((r: any) => ({
              name: r.name,
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
              radiusMeters: Number(r.radiusMeters),
            }))
          : [{ name: '', latitude: 0, longitude: 0, radiusMeters: 200 }],
      )
    } catch (e: any) {
      showToast(e.message || 'Failed to load vehicle', 'error')
    }
  }

  const closeGeofenceEditor = () => {
    setGeofenceVehicle(null)
    setSavingGeofence(false)
  }

  const saveGeofence = async () => {
    if (!geofenceVehicle) return
    const cleaned = geofenceZones
      .map((z) => ({
        name: z.name?.trim() || undefined,
        latitude: Number(z.latitude),
        longitude: Number(z.longitude),
        radiusMeters: Number(z.radiusMeters),
      }))
      .filter(
        (z) =>
          Number.isFinite(z.latitude) &&
          Number.isFinite(z.longitude) &&
          Number.isFinite(z.radiusMeters) &&
          z.radiusMeters > 0,
      )
    if (vipGeoEnabled && cleaned.length === 0) {
      showToast('Add at least one zone (center + radius in meters), or disable geofence.', 'error')
      return
    }
    try {
      setSavingGeofence(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/vehicles/${geofenceVehicle.id}/geofence`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || ''}`,
          },
          body: JSON.stringify({ vipGeoRestrictionEnabled: vipGeoEnabled, restrictedZones: vipGeoEnabled ? cleaned : [] }),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Save failed' }))
        throw new Error(err.message || 'Save failed')
      }
      showToast('Geofence perimeters saved', 'success')
      closeGeofenceEditor()
      await loadVehicles()
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error')
    } finally {
      setSavingGeofence(false)
    }
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
      badgeColor: 'bg-[#1B3D2F]/15 text-[#1B3D2F]'
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
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  return (
    <>
    <div className="p-2 sm:p-4 lg:p-6 h-full flex flex-col gap-3 sm:gap-4 lg:gap-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Vehicle Management</h1>
        <p className="text-xs sm:text-sm text-gray-500">Monitor and manage your fleet status and assignments</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          <Combobox
            value={searchQuery}
            onChange={setSearchQuery}
            options={[...new Set(vehicles.flatMap(v => [v.plateNumber, v.make, v.model].filter(Boolean)))]}
            placeholder="Search by plate, make, or model..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Combobox
              value={vehicleType === 'all' ? '' : vehicleType}
              onChange={val => setVehicleType(val || 'all')}
              options={['Truck', 'Van', 'Bus', 'Sedan', 'SUV', 'Pickup', 'Minibus']}
              placeholder="Vehicle Type"
            />

            <Combobox
              value={statusFilter === 'all' ? '' : statusFilter}
              onChange={val => setStatusFilter(val || 'all')}
              options={['Active', 'Maintenance', 'Inactive']}
              placeholder="Status"
            />
          </div>

          {(searchQuery || vehicleType !== 'all' || statusFilter !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('')
                setVehicleType('all')
                setStatusFilter('all')
              }}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center md:col-span-2">
            <svg className="w-12 h-12 text-gray-300 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 font-medium text-sm">No vehicles found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{vehicle.plateNumber}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{vehicle.vehicleId || 'N/A'}</p>
                </div>
                <div className="ml-2">
                  {vehicle.onTrip ? (
                    <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                      On Duty
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Make & Model</p>
                  <p className="text-xs font-medium text-gray-900">{vehicle.make}</p>
                  <p className="text-[10px] text-gray-500">{vehicle.model} ({vehicle.year})</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Type</p>
                  <p className="text-xs font-medium text-gray-900">{vehicle.vehicleType || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Driver</p>
                  {vehicle.assignedDriver?.user?.name ? (
                    <>
                      <p className="text-xs font-medium text-gray-900">{vehicle.assignedDriver.user.name}</p>
                      <p className="text-[10px] text-gray-500">{vehicle.assignedDriver.licenseNumber || 'N/A'}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No driver</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Fuel Type</p>
                  <p className="text-xs font-medium text-gray-900">{vehicle.fuelType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Mileage</p>
                  <p className="text-xs font-medium text-gray-900">{vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">VIP Zone</p>
                  {vehicle.vipGeoRestrictionEnabled ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                      On ({Array.isArray(vehicle.restrictedZones) ? vehicle.restrictedZones.length : 0})
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Off</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openGeofenceEditor(vehicle)}
                className="w-full mt-2 px-3 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors text-xs font-medium"
              >
                Manage VIP Zones
              </button>
            </div>
          ))
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 md:col-span-2">
          <p className="text-xs text-gray-600">Showing {filteredVehicles.length} of {vehicles.length} vehicles</p>
          <button onClick={loadVehicles} className="flex items-center gap-2 px-3 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:flex flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '100px' }}>Vehicle ID</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '120px' }}>Plate Number</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '150px' }}>Make & Model</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '80px' }}>Type</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '100px' }}>Status</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '120px' }}>Driver</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '90px' }}>Fuel Type</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '100px' }}>Mileage</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '90px' }}>VIP zone</th>
                <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 xl:w-16 xl:h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 font-medium text-sm xl:text-base">No vehicles found</p>
                      <p className="text-xs xl:text-sm text-gray-400 mt-1">Try adjusting your filters or add a new vehicle</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <span className="text-xs xl:text-sm font-semibold text-gray-900 block">{vehicle.vehicleId || vehicle.plateNumber}</span>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <span className="text-xs xl:text-sm text-gray-900 font-medium block">{vehicle.plateNumber}</span>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <div className="flex flex-col">
                      <span className="text-xs xl:text-sm text-gray-900 font-medium">{vehicle.make}</span>
                      <span className="text-[10px] xl:text-xs text-gray-500">{vehicle.model} ({vehicle.year})</span>
                    </div>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <span className="text-xs xl:text-sm text-gray-600 block">{vehicle.vehicleType || 'N/A'}</span>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    {vehicle.onTrip ? (
                      <span className="inline-block px-2 xl:px-3 py-1 rounded-full text-[10px] xl:text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                        On Duty
                      </span>
                    ) : (
                      <span className={`inline-block px-2 xl:px-3 py-1 rounded-full text-[10px] xl:text-xs font-medium whitespace-nowrap ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    )}
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    {vehicle.assignedDriver?.user?.name ? (
                      <div className="flex flex-col">
                        <span className="text-xs xl:text-sm text-gray-900 font-medium">{vehicle.assignedDriver.user.name}</span>
                        <span className="text-[10px] xl:text-xs text-gray-500">{vehicle.assignedDriver.licenseNumber || 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="text-xs xl:text-sm text-gray-400 italic">No driver</span>
                    )}
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <span className="text-xs xl:text-sm text-gray-600 block">{vehicle.fuelType}</span>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <span className="text-xs xl:text-sm text-gray-600 block">{vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A'}</span>
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    {vehicle.vipGeoRestrictionEnabled ? (
                      <span className="inline-block px-2 py-1 rounded text-[10px] xl:text-xs font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
                        On ({Array.isArray(vehicle.restrictedZones) ? vehicle.restrictedZones.length : 0})
                      </span>
                    ) : (
                      <span className="text-[10px] xl:text-xs text-gray-400">Off</span>
                    )}
                  </td>
                  <td className="px-2 lg:px-3 xl:px-4 py-3 xl:py-4">
                    <button
                      type="button"
                      onClick={() => openGeofenceEditor(vehicle)}
                      className="text-xs xl:text-sm font-medium text-[#1B3D2F] hover:text-[#152e22] hover:underline whitespace-nowrap"
                    >
                      VIP / zones
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-3 xl:px-6 py-3 xl:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
          <p className="text-xs xl:text-sm text-gray-600">Showing {filteredVehicles.length} of {vehicles.length} vehicles</p>
          <button onClick={loadVehicles} className="flex items-center gap-2 px-3 xl:px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors text-xs xl:text-sm font-medium whitespace-nowrap">
            <svg className="w-3 h-3 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1 sm:mb-2">{stat.label}</p>
            <p className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</p>
            {stat.badge && (
              <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${stat.badgeColor}`}>{stat.badge}</span>
            )}
            {stat.progress !== undefined && (
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-[#1B3D2F] h-1.5 sm:h-2 rounded-full transition-all" style={{ width: `${stat.progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {geofenceVehicle && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Geofence Perimeters</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {geofenceVehicle.plateNumber} — {geofenceVehicle.make} {geofenceVehicle.model}
            </p>
          </div>

          <div className="mx-4 sm:mx-5 mt-3 sm:mt-4 rounded-lg border border-amber-200 bg-amber-50 p-2.5 sm:p-3 space-y-1.5">
            <p className="text-[10px] sm:text-xs font-semibold text-amber-800">How it works</p>
            <div className="flex items-start gap-2 text-[10px] sm:text-xs text-amber-700">
              <span className="mt-0.5">⚠️</span>
              <span>When the vehicle approaches within 80% of the zone radius, a warning notification is sent to the driver and transport office.</span>
            </div>
            <div className="flex items-start gap-2 text-[10px] sm:text-xs text-amber-700">
              <span className="mt-0.5">🚨</span>
              <span>When the vehicle enters the zone, engine shutdown is triggered and an alert is sent immediately.</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vipGeoEnabled}
                onChange={(e) => setVipGeoEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#1B3D2F] focus:ring-[#1B3D2F]"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Enable geofence restriction for this vehicle</span>
            </label>
            {vipGeoEnabled && (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Each zone is a circle defined by a center point (lat/lng) and a radius in meters. The vehicle will be warned when approaching and shut down when entering.
                </p>
                {geofenceZones.map((z, i) => (
                  <div key={i} className="p-2.5 sm:p-3 rounded-lg border border-gray-200 space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-600">Zone {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setGeofenceZones(geofenceZones.filter((_, j) => j !== i))}
                        className="text-[10px] sm:text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Zone name (e.g. Campus boundary)"
                      value={z.name ?? ''}
                      onChange={(e) => {
                        const next = [...geofenceZones]
                        next[i] = { ...next[i], name: e.target.value }
                        setGeofenceZones(next)
                      }}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="9.0320"
                          value={z.latitude === 0 ? '' : z.latitude}
                          onChange={(e) => {
                            const next = [...geofenceZones]
                            next[i] = { ...next[i], latitude: parseFloat(e.target.value) || 0 }
                            setGeofenceZones(next)
                          }}
                          className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="38.7469"
                          value={z.longitude === 0 ? '' : z.longitude}
                          onChange={(e) => {
                            const next = [...geofenceZones]
                            next[i] = { ...next[i], longitude: parseFloat(e.target.value) || 0 }
                            setGeofenceZones(next)
                          }}
                          className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Radius (m)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="500"
                          value={z.radiusMeters === 0 ? '' : z.radiusMeters}
                          onChange={(e) => {
                            const next = [...geofenceZones]
                            next[i] = { ...next[i], radiusMeters: parseFloat(e.target.value) || 0 }
                            setGeofenceZones(next)
                          }}
                          className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    {z.radiusMeters > 0 && (
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Warning at ~{Math.round(z.radiusMeters * 0.8)}m from center · Shutdown at {z.radiusMeters}m
                      </p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setGeofenceZones([
                      ...geofenceZones,
                      { name: '', latitude: 0, longitude: 0, radiusMeters: 500 },
                    ])
                  }
                  className="text-xs sm:text-sm text-[#1B3D2F] font-medium hover:underline"
                >
                  + Add zone
                </button>
              </div>
            )}
          </div>
          <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeGeofenceEditor}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingGeofence}
              onClick={saveGeofence}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B3D2F] rounded-lg hover:bg-[#152e22] disabled:opacity-50"
            >
              {savingGeofence ? 'Saving…' : 'Save Perimeters'}
            </button>
          </div>
        </div>
      </div>
    )}

    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
