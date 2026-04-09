'use client'

import { useState, useEffect } from 'react'   // ✅ this makes it a module
import { vehicleApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'
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
      // Use dedicated geofence endpoint
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  return (
    <>
    <div className="p-3 sm:p-6 h-full flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Vehicle Management</h1>
        <p className="text-sm text-gray-500">Monitor and manage your fleet status and assignments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plate, make, or model..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none bg-white"
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
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none bg-white"
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fuel Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">VIP zone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
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
                    {vehicle.assignedDriver?.user?.name ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">{vehicle.assignedDriver.user.name}</span>
                        <span className="text-xs text-gray-500">{vehicle.assignedDriver.licenseNumber || 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No driver</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.fuelType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicle.vipGeoRestrictionEnabled ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        On ({Array.isArray(vehicle.restrictedZones) ? vehicle.restrictedZones.length : 0})
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Off</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openGeofenceEditor(vehicle)}
                      className="text-sm font-medium text-[#1B3D2F] hover:text-[#152e22]"
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

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing {filteredVehicles.length} of {vehicles.length} vehicles</p>
          <button onClick={loadVehicles} className="flex items-center gap-2 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  <div className="bg-[#1B3D2F] h-2 rounded-full transition-all" style={{ width: `${stat.progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {geofenceVehicle && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Geofence Perimeters</h2>
            <p className="text-sm text-gray-500 mt-1">
              {geofenceVehicle.plateNumber} — {geofenceVehicle.make} {geofenceVehicle.model}
            </p>
          </div>

          {/* How it works */}
          <div className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-amber-800">How it works</p>
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <span className="mt-0.5">⚠️</span>
              <span>When the vehicle approaches within 80% of the zone radius, a warning notification is sent to the driver and transport office.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <span className="mt-0.5">🚨</span>
              <span>When the vehicle enters the zone, engine shutdown is triggered and an alert is sent immediately.</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vipGeoEnabled}
                onChange={(e) => setVipGeoEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#1B3D2F] focus:ring-[#1B3D2F]"
              />
              <span className="text-sm font-medium text-gray-800">Enable geofence restriction for this vehicle</span>
            </label>
            {vipGeoEnabled && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Each zone is a circle defined by a center point (lat/lng) and a radius in meters. The vehicle will be warned when approaching and shut down when entering.
                </p>
                {geofenceZones.map((z, i) => (
                  <div key={i} className="p-3 rounded-lg border border-gray-200 space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Zone {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setGeofenceZones(geofenceZones.filter((_, j) => j !== i))}
                        className="text-xs text-red-600 hover:underline"
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
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
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
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
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Radius (m)</label>
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
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    {z.radiusMeters > 0 && (
                      <p className="text-xs text-gray-400">
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
                  className="text-sm text-[#1B3D2F] font-medium hover:underline"
                >
                  + Add zone
                </button>
              </div>
            )}
          </div>
          <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeGeofenceEditor}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingGeofence}
              onClick={saveGeofence}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1B3D2F] rounded-lg hover:bg-[#152e22] disabled:opacity-50"
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
