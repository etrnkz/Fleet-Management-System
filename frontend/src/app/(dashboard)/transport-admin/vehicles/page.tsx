'use client'

import { useState, useEffect } from 'react'
import { vehicleApi, tripApi, driverApi } from '@/lib/api'
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
  isServiceVehicle?: boolean
  serviceVehicleType?: 'Shuttle' | 'Security' | null
  serviceSchedule?: string | null
  serviceRoute?: string | null
  assignedDriver?: {
    id: string
    user: { name: string; email: string }
    licenseNumber: string
  } | null
}

const EMPTY_SERVICE_FORM = {
  plateNumber: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  fuelType: 'Diesel',
  capacity: 15,
  color: '',
  vehicleType: 'Bus',
  serviceVehicleType: 'Shuttle' as 'Shuttle' | 'Security',
  serviceSchedule: '',
  serviceRoute: '',
  notes: '',
  assignedDriverId: '' as string,
}

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'service'>('fleet')
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleType, setVehicleType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [serviceVehicles, setServiceVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [geofenceVehicle, setGeofenceVehicle] = useState<Vehicle | null>(null)
  const [vipGeoEnabled, setVipGeoEnabled] = useState(false)
  const [geofenceZones, setGeofenceZones] = useState<RestrictedZone[]>([])
  const [savingGeofence, setSavingGeofence] = useState(false)

  // Service vehicle form state
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingServiceVehicle, setEditingServiceVehicle] = useState<Vehicle | null>(null)
  const [serviceForm, setServiceForm] = useState({ ...EMPTY_SERVICE_FORM })
  const [savingService, setSavingService] = useState(false)
  const [allDrivers, setAllDrivers] = useState<{ id: string; user: { name: string }; licenseNumber: string }[]>([])

  useEffect(() => {
    loadVehicles()
    loadServiceVehicles()
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      const data = await driverApi.getAll() as any[]
      setAllDrivers(Array.isArray(data) ? data : [])
    } catch {
      setAllDrivers([])
    }
  }

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const [vehiclesData, tripsData] = await Promise.all([
        vehicleApi.getAll(),
        tripApi.getAll({ state: 'IN_PROGRESS' })
      ])
      const vehiclesArray = (Array.isArray(vehiclesData) ? vehiclesData : []).filter((v: any) => !v.isServiceVehicle)
      const tripsArray = Array.isArray(tripsData) ? tripsData : []
      const vehiclesOnTrip = new Set(tripsArray.map((t: any) => t.allocatedVehicle?.id).filter(Boolean))
      setVehicles(vehiclesArray.map((v: any) => ({ ...v, onTrip: vehiclesOnTrip.has(v.id) })))
    } catch (error: any) {
      showToast(error.message || 'Failed to load vehicles', 'error')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const loadServiceVehicles = async () => {
    try {
      const data = await vehicleApi.getServiceVehicles()
      setServiceVehicles(Array.isArray(data) ? data : [])
    } catch {
      setServiceVehicles([])
    }
  }

  const openServiceForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingServiceVehicle(vehicle)
      setServiceForm({
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuelType: vehicle.fuelType,
        capacity: vehicle.capacity ?? 15,
        color: vehicle.color ?? '',
        vehicleType: vehicle.vehicleType ?? 'Bus',
        serviceVehicleType: vehicle.serviceVehicleType ?? 'Shuttle',
        serviceSchedule: vehicle.serviceSchedule ?? '',
        serviceRoute: vehicle.serviceRoute ?? '',
        notes: '',
        assignedDriverId: vehicle.assignedDriver?.id ?? '',
      })
    } else {
      setEditingServiceVehicle(null)
      setServiceForm({ ...EMPTY_SERVICE_FORM })
    }
    setShowServiceForm(true)
  }

  const closeServiceForm = () => {
    setShowServiceForm(false)
    setEditingServiceVehicle(null)
    setServiceForm({ ...EMPTY_SERVICE_FORM })
  }

  const saveServiceVehicle = async () => {
    if (!serviceForm.plateNumber.trim() || !serviceForm.make.trim() || !serviceForm.model.trim()) {
      showToast('Plate number, make and model are required', 'error'); return
    }
    try {
      setSavingService(true)
      const { assignedDriverId, ...vehiclePayload } = serviceForm
      const payload = {
        ...vehiclePayload,
        year: Number(serviceForm.year),
        capacity: Number(serviceForm.capacity),
        isServiceVehicle: true,
        status: 'Active',
      }

      let savedVehicleId: string
      if (editingServiceVehicle) {
        await vehicleApi.updateServiceVehicle(editingServiceVehicle.id, payload)
        savedVehicleId = editingServiceVehicle.id
        showToast('Service vehicle updated', 'success')
      } else {
        const created = await vehicleApi.registerServiceVehicle(payload) as any
        savedVehicleId = created?.id
        showToast('Service vehicle registered', 'success')
      }

      // Assign or unassign driver
      if (savedVehicleId) {
        const currentDriverId = editingServiceVehicle?.assignedDriver?.id ?? ''
        if (assignedDriverId && assignedDriverId !== currentDriverId) {
          // Assign new driver
          await driverApi.assignVehicle(assignedDriverId, savedVehicleId)
        } else if (!assignedDriverId && currentDriverId) {
          // Unassign driver
          await driverApi.unassignVehicle(currentDriverId)
        }
      }

      closeServiceForm()
      loadServiceVehicles()
    } catch (error: any) {
      showToast(error.message || 'Failed to save service vehicle', 'error')
    } finally {
      setSavingService(false)
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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'}/vehicles/${geofenceVehicle.id}/geofence`,
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

  if (loading) { return (<div className='flex items-center justify-center h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F]'></div></div>) }

  return (
    <>
    <div className="p-2 sm:p-4 lg:p-6 h-full flex flex-col gap-3 sm:gap-4 lg:gap-6">
      <div className="px-2 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Vehicle Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Monitor and manage your fleet</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'fleet' ? 'bg-white text-[#1B3D2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Fleet Vehicles
        </button>
        <button onClick={() => setActiveTab('service')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'service' ? 'bg-white text-[#1B3D2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Service Vehicles
          <span className="bg-[#1B3D2F]/10 text-[#1B3D2F] text-xs px-1.5 py-0.5 rounded-full font-semibold">{serviceVehicles.length}</span>
        </button>
      </div>

      {/* FLEET TAB */}
      {activeTab === 'fleet' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <Combobox value={searchQuery} onChange={setSearchQuery}
                options={Array.from(new Set(vehicles.flatMap(v => [v.plateNumber, v.make, v.model].filter(Boolean) as string[])))}
                placeholder="Search by plate, make, or model..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Combobox value={vehicleType === 'all' ? '' : vehicleType} onChange={val => setVehicleType(val || 'all')}
                  options={['Truck','Van','Bus','Sedan','SUV','Pickup','Minibus']} placeholder="Vehicle Type" />
                <Combobox value={statusFilter === 'all' ? '' : statusFilter} onChange={val => setStatusFilter(val || 'all')}
                  options={['Active','Maintenance','Inactive']} placeholder="Status" />
              </div>
              {(searchQuery || vehicleType !== 'all' || statusFilter !== 'all') && (
                <button onClick={() => { setSearchQuery(''); setVehicleType('all'); setStatusFilter('all') }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm">
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm" style={{ minWidth: '640px' }}>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plate / ID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Make & Model</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Driver</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Fuel</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Mileage</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">VIP Zone</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredVehicles.length === 0 ? (
                    <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">No vehicles found</td></tr>
                  ) : filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3"><p className="font-semibold text-gray-900 text-xs">{vehicle.plateNumber}</p><p className="text-gray-400 text-[11px]">{vehicle.vehicleId || ''}</p></td>
                      <td className="px-3 py-3"><p className="font-medium text-gray-900 text-xs">{vehicle.make}</p><p className="text-gray-500 text-[11px]">{vehicle.model}  {vehicle.year}</p></td>
                      <td className="px-3 py-3 hidden sm:table-cell"><span className="text-xs text-gray-600">{vehicle.vehicleType || ''}</span></td>
                      <td className="px-3 py-3">
                        {vehicle.onTrip
                          ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">On Duty</span>
                          : <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span>}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        {vehicle.assignedDriver?.user?.name
                          ? <><p className="text-xs font-medium text-gray-900">{vehicle.assignedDriver.user.name}</p><p className="text-[11px] text-gray-400">{vehicle.assignedDriver.licenseNumber}</p></>
                          : <span className="text-xs text-gray-400 italic">No driver</span>}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell"><span className="text-xs text-gray-600">{vehicle.fuelType}</span></td>
                      <td className="px-3 py-3 hidden lg:table-cell"><span className="text-xs text-gray-600">{vehicle.currentMileage ? `${Number(vehicle.currentMileage).toLocaleString()} km` : ''}</span></td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        {vehicle.vipGeoRestrictionEnabled
                          ? <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">On  {Array.isArray(vehicle.restrictedZones) ? vehicle.restrictedZones.length : 0}</span>
                          : <span className="text-[11px] text-gray-400">Off</span>}
                      </td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => openGeofenceEditor(vehicle)} className="text-xs font-medium text-[#1B3D2F] hover:underline">VIP Zones</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
              <p className="text-xs text-gray-600">Showing {filteredVehicles.length} of {vehicles.length} vehicles</p>
              <button onClick={loadVehicles} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-xs font-medium">Refresh</button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-1 sm:mb-2">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</p>
                {stat.badge && <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${stat.badgeColor}`}>{stat.badge}</span>}
                {stat.progress !== undefined && (
                  <div className="mt-2"><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-[#1B3D2F] h-1.5 rounded-full" style={{ width: `${stat.progress}%` }}></div></div></div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* SERVICE VEHICLES TAB */}
      {activeTab === 'service' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">Service Vehicles  Always Active</p>
              <p className="text-xs text-blue-700 mt-1">Shuttle and security vehicles operate continuously. They are tracked via GPS but do NOT go through the trip request / approval / gate scan workflow. Register them here and they appear on the live tracking map automatically.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{serviceVehicles.length} service vehicle{serviceVehicles.length !== 1 ? 's' : ''} registered</p>
            <button onClick={() => openServiceForm()}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Register Service Vehicle
            </button>
          </div>

          {serviceVehicles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <p className="text-gray-500 font-medium">No service vehicles registered yet</p>
              <p className="text-xs text-gray-400 mt-1">Register shuttle or security vehicles to track them continuously</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {serviceVehicles.map(v => (
                <div key={v.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`px-4 py-2 flex items-center justify-between ${v.serviceVehicleType === 'Security' ? 'bg-red-50 border-b border-red-100' : 'bg-blue-50 border-b border-blue-100'}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.serviceVehicleType === 'Security' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {v.serviceVehicleType === 'Security' ? ' Security' : ' Shuttle'}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"> Active</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <p className="font-bold text-gray-900">{v.plateNumber}</p>
                      <p className="text-sm text-gray-500">{v.make} {v.model}  {v.year}</p>
                    </div>
                    {v.serviceRoute && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        <p className="text-xs text-gray-600">{v.serviceRoute}</p>
                      </div>
                    )}
                    {v.serviceSchedule && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs text-gray-600 whitespace-pre-line">{v.serviceSchedule}</p>
                      </div>
                    )}
                    {v.assignedDriver?.user?.name && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <p className="text-xs text-gray-600">{v.assignedDriver.user.name}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{v.fuelType}</span>
                      {v.capacity && <><span></span><span>{v.capacity} seats</span></>}
                      {v.color && <><span></span><span>{v.color}</span></>}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => openServiceForm(v)}
                      className="w-full px-3 py-2 border border-[#1B3D2F] text-[#1B3D2F] rounded-lg hover:bg-[#1B3D2F]/5 text-xs font-medium">
                      Edit Registration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* SERVICE VEHICLE REGISTRATION MODAL */}
    {showServiceForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {editingServiceVehicle ? 'Edit Service Vehicle' : 'Register Service Vehicle'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">This vehicle will be always active and tracked continuously</p>
            </div>
            <button onClick={closeServiceForm} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Service Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Shuttle', 'Security'] as const).map(type => (
                  <button key={type} type="button"
                    onClick={() => setServiceForm(f => ({ ...f, serviceVehicleType: type }))}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${serviceForm.serviceVehicleType === type ? 'border-[#1B3D2F] bg-[#1B3D2F]/5 text-[#1B3D2F]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {type === 'Shuttle' ? ' Shuttle' : ' Security'}
                    <p className="text-[10px] font-normal mt-1 text-gray-500">
                      {type === 'Shuttle' ? 'Worker transport, fixed schedule' : 'Patrol / security vehicle'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Plate Number *</label>
                <input type="text" value={serviceForm.plateNumber}
                  onChange={e => setServiceForm(f => ({ ...f, plateNumber: e.target.value.toUpperCase() }))}
                  placeholder="ET-1-12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Make *</label>
                <input type="text" value={serviceForm.make}
                  onChange={e => setServiceForm(f => ({ ...f, make: e.target.value }))}
                  placeholder="Toyota"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Model *</label>
                <input type="text" value={serviceForm.model}
                  onChange={e => setServiceForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="Coaster"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                <input type="number" value={serviceForm.year}
                  onChange={e => setServiceForm(f => ({ ...f, year: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity (seats)</label>
                <input type="number" value={serviceForm.capacity}
                  onChange={e => setServiceForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Type</label>
                <select value={serviceForm.fuelType}
                  onChange={e => setServiceForm(f => ({ ...f, fuelType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none">
                  <option>Diesel</option><option>Gasoline</option><option>Electric</option><option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Color</label>
                <input type="text" value={serviceForm.color}
                  onChange={e => setServiceForm(f => ({ ...f, color: e.target.value }))}
                  placeholder="White"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
              </div>
            </div>

            {/* Route */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Route</label>
              <input type="text" value={serviceForm.serviceRoute}
                onChange={e => setServiceForm(f => ({ ...f, serviceRoute: e.target.value }))}
                placeholder="Main Campus  Harar Town  Dire Dawa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {serviceForm.serviceVehicleType === 'Shuttle' ? 'Schedule' : 'Patrol Hours / Notes'}
              </label>
              <textarea value={serviceForm.serviceSchedule}
                onChange={e => setServiceForm(f => ({ ...f, serviceSchedule: e.target.value }))}
                rows={3}
                placeholder={serviceForm.serviceVehicleType === 'Shuttle'
                  ? 'Morning: 06:30 depart campus  town\nEvening: 17:00 depart town  campus'
                  : 'e.g. 24/7 campus patrol, shift A: 06:00-18:00, shift B: 18:00-06:00'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none resize-none" />
            </div>

            {/* Driver Assignment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Driver</label>
              <select
                value={serviceForm.assignedDriverId}
                onChange={e => setServiceForm(f => ({ ...f, assignedDriverId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none bg-white">
                <option value="">— No driver assigned —</option>
                {allDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.user?.name} · {d.licenseNumber}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">The assigned driver's mobile app will auto-start GPS tracking for this vehicle.</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <textarea value={serviceForm.notes}
                onChange={e => setServiceForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none resize-none" />
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={closeServiceForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" disabled={savingService} onClick={saveServiceVehicle}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1B3D2F] rounded-lg hover:bg-[#152e22] disabled:opacity-50">
              {savingService ? 'Saving' : editingServiceVehicle ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* GEOFENCE MODAL */}
    {geofenceVehicle && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Geofence Perimeters</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{geofenceVehicle.plateNumber}  {geofenceVehicle.make} {geofenceVehicle.model}</p>
          </div>
          <div className="mx-4 sm:mx-5 mt-3 sm:mt-4 rounded-lg border border-amber-200 bg-amber-50 p-2.5 sm:p-3 space-y-1.5">
            <p className="text-[10px] sm:text-xs font-semibold text-amber-800">How it works</p>
            <p className="text-[10px] sm:text-xs text-amber-700"> Warning sent when vehicle approaches within 80% of zone radius.</p>
            <p className="text-[10px] sm:text-xs text-amber-700"> Engine shutdown triggered when vehicle enters the zone.</p>
          </div>
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={vipGeoEnabled} onChange={e => setVipGeoEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#1B3D2F] focus:ring-[#1B3D2F]" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Enable geofence restriction for this vehicle</span>
            </label>
            {vipGeoEnabled && (
              <div className="space-y-2 sm:space-y-3">
                {geofenceZones.map((z, i) => (
                  <div key={i} className="p-2.5 sm:p-3 rounded-lg border border-gray-200 space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-600">Zone {i + 1}</span>
                      <button type="button" onClick={() => setGeofenceZones(geofenceZones.filter((_, j) => j !== i))}
                        className="text-[10px] sm:text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                    <input type="text" placeholder="Zone name" value={z.name ?? ''}
                      onChange={e => { const n=[...geofenceZones]; n[i]={...n[i],name:e.target.value}; setGeofenceZones(n) }}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded" />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Latitude</label>
                        <input type="number" step="any" placeholder="9.0320" value={z.latitude===0?'':z.latitude}
                          onChange={e=>{const n=[...geofenceZones];n[i]={...n[i],latitude:parseFloat(e.target.value)||0};setGeofenceZones(n)}}
                          className="w-full px-1.5 py-1 text-[10px] sm:text-sm border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Longitude</label>
                        <input type="number" step="any" placeholder="38.7469" value={z.longitude===0?'':z.longitude}
                          onChange={e=>{const n=[...geofenceZones];n[i]={...n[i],longitude:parseFloat(e.target.value)||0};setGeofenceZones(n)}}
                          className="w-full px-1.5 py-1 text-[10px] sm:text-sm border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 mb-1 block">Radius (m)</label>
                        <input type="number" step="any" placeholder="500" value={z.radiusMeters===0?'':z.radiusMeters}
                          onChange={e=>{const n=[...geofenceZones];n[i]={...n[i],radiusMeters:parseFloat(e.target.value)||0};setGeofenceZones(n)}}
                          className="w-full px-1.5 py-1 text-[10px] sm:text-sm border border-gray-300 rounded" />
                      </div>
                    </div>
                    {z.radiusMeters>0 && <p className="text-[10px] sm:text-xs text-gray-400">Warning at ~{Math.round(z.radiusMeters*0.8)}m  Shutdown at {z.radiusMeters}m</p>}
                  </div>
                ))}
                <button type="button" onClick={()=>setGeofenceZones([...geofenceZones,{name:'',latitude:0,longitude:0,radiusMeters:500}])}
                  className="text-xs sm:text-sm text-[#1B3D2F] font-medium hover:underline">+ Add zone</button>
              </div>
            )}
          </div>
          <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={closeGeofenceEditor}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="button" disabled={savingGeofence} onClick={saveGeofence}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B3D2F] rounded-lg hover:bg-[#152e22] disabled:opacity-50">
              {savingGeofence ? 'Saving...' : 'Save Perimeters'}
            </button>
          </div>
        </div>
      </div>
    )}

    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
