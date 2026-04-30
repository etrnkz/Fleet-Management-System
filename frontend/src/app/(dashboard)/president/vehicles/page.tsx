'use client'

import { useState, useEffect } from 'react'
import { vehicleApi, driverApi } from '@/lib/api'

export default function VehiclesPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVehiclesData()
  }, [])

  const loadVehiclesData = async () => {
    try {
      setLoading(true)
      const vehiclesData = await vehicleApi.getAll()
      
      // Enhance vehicles with additional data
      const enhancedVehicles = await Promise.all(
        vehiclesData.map(async (vehicle: any) => {
          let driver = null
          if (vehicle.assignedDriverId) {
            try {
              driver = await driverApi.getById(vehicle.assignedDriverId)
            } catch (error) {
              console.error(`Failed to load driver for vehicle ${vehicle.id}:`, error)
            }
          }

          // Map vehicle status and enhance with real data
          const status = vehicle.status?.toLowerCase() || 'available'
          const fuelLevel = vehicle.fuelLevel ?? vehicle.fuelCapacity ?? null
          const department = vehicle.assignedDepartment || vehicle.department?.name || 'N/A'
          
          return {
            ...vehicle,
            id: vehicle.id,
            plateNumber: vehicle.plateNumber,
            type: `${vehicle.make} ${vehicle.model}`,
            capacity: vehicle.capacity ? `${vehicle.capacity} seats` : 'N/A',
            status: status,
            driver: driver ? {
              name: `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.trim(),
              phone: driver.user?.phone || 'N/A',
              licenseNumber: driver.licenseNumber || 'N/A',
              experience: driver.experience || 'N/A',
              assignedVehicle: vehicle.plateNumber
            } : null,
            department: department,
            destination: status === 'on-trip' ? 'In Transit' : null,
            tripStart: status === 'on-trip' ? new Date().toISOString().slice(0, 16) : null,
            tripEnd: status === 'on-trip' ? new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16) : null,
            fuelLevel: fuelLevel,
            mileage: vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A',
            lastMaintenance: vehicle.lastServiceDate || 'N/A',
            nextMaintenance: vehicle.nextServiceDate || 'N/A',
            insurance: vehicle.insuranceExpiryDate ? `Valid until ${vehicle.insuranceExpiryDate}` : 'N/A',
            registrationExpiry: vehicle.registrationExpiryDate || 'N/A',
            assignedTo: vehicle.assignedTo || null,
            maintenanceType: status === 'maintenance' ? 'Scheduled maintenance' : null,
            estimatedCompletion: status === 'maintenance' ? new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10) : null,
            note: status === 'idle' ? `Idle since last trip` : null
          }
        })
      )
      
      setVehicles(enhancedVehicles)
    } catch (error) {
      console.error('Failed to load vehicles data:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'on-trip':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'assigned':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'idle':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'on-trip':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'assigned':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      case 'maintenance':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'idle':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const filteredVehicles = selectedTab === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === selectedTab)

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    onTrip: vehicles.filter(v => v.status === 'on-trip').length,
    assigned: vehicles.filter(v => v.status === 'assigned').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all university vehicles</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fleet Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all university vehicles</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'all'
                ? 'bg-[#1B3D2F] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Vehicles ({stats.total})
          </button>
          <button
            onClick={() => setSelectedTab('available')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'available'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Available ({stats.available})
          </button>
          <button
            onClick={() => setSelectedTab('on-trip')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'on-trip'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            On Trip ({stats.onTrip})
          </button>
          <button
            onClick={() => setSelectedTab('assigned')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'assigned'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Assigned ({stats.assigned})
          </button>
          <button
            onClick={() => setSelectedTab('maintenance')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'maintenance'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maintenance ({stats.maintenance})
          </button>
          <button
            onClick={() => setSelectedTab('idle')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'idle'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Idle ({stats.idle})
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No vehicles found</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedVehicle(vehicle)
              setShowDetailModal(true)
            }}
          >
            {/* Vehicle Header */}
            <div className="bg-gradient-to-r from-[#1B3D2F] to-green-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{vehicle.plateNumber}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.status)} bg-white`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(vehicle.status)}
                    <span className="capitalize">{(vehicle.status || '').replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-90">{vehicle.type}</p>
              <p className="text-xs opacity-75">{vehicle.capacity}</p>
            </div>

            {/* Vehicle Body */}
            <div className="p-4 space-y-3">
              {/* Driver */}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Driver</p>
                  <p className="text-sm font-medium text-gray-800">
                    {vehicle.driver ? vehicle.driver.name : 'Not assigned'}
                  </p>
                </div>
              </div>

              {/* Department/Destination */}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">
                    {vehicle.status === 'on-trip' ? 'Destination' : 'Department'}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {vehicle.status === 'on-trip' ? vehicle.destination : vehicle.department}
                  </p>
                </div>
              </div>

                <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Fuel Level</p>
                  <p className="text-xs font-medium text-gray-800">{vehicle.fuelLevel != null ? `${vehicle.fuelLevel}%` : 'N/A'}</p>
                </div>
                {vehicle.fuelLevel != null ? (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        vehicle.fuelLevel > 70 ? 'bg-green-500' :
                        vehicle.fuelLevel > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="w-full bg-gray-100 rounded-full h-2" />
                )}
              </div>

              {/* Mileage */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-600">Mileage</span>
                <span className="text-sm font-medium text-gray-800">{vehicle.currentMileage ? `${Number(vehicle.currentMileage).toLocaleString()} km` : '—'}</span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1B3D2F] to-green-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{selectedVehicle.plateNumber}</h3>
                  <p className="text-lg opacity-90">{selectedVehicle.type}</p>
                  <p className="text-sm opacity-75">{selectedVehicle.capacity}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Status */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Current Status</h4>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(selectedVehicle.status)}`}>
                  {getStatusIcon(selectedVehicle.status)}
                  <span className="font-medium capitalize">{(selectedVehicle.status || '').replace('-', ' ')}</span>
                </div>
              </div>

              {/* Trip Details (if on trip) */}
              {selectedVehicle.status === 'on-trip' && (
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-800 mb-3">Trip Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trip Start</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.tripStart}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Return</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.tripEnd}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Details (if assigned) */}
              {selectedVehicle.status === 'assigned' && (
                <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-800 mb-3">Assignment Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Assigned To</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.department}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Details (if in maintenance) */}
              {selectedVehicle.status === 'maintenance' && (
                <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-800 mb-3">Maintenance Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Maintenance Type</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.maintenanceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Completion</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.estimatedCompletion}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Vehicle Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Mileage</p>
                <span className="text-sm font-medium text-gray-800">{selectedVehicle.currentMileage ? `${Number(selectedVehicle.currentMileage).toLocaleString()} km` : '—'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Fuel Level</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.fuelLevel != null ? `${selectedVehicle.fuelLevel}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.capacity}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.type}</p>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {selectedVehicle.driver ? (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Assigned Driver</h4>
                  <div className="bg-[#1B3D2F]/10 rounded-xl p-4 border-l-4 border-[#1B3D2F]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Driver Name</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.driver.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.driver.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">License Number</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.driver.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.driver.experience}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Assigned Vehicle</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.driver.assignedVehicle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Driver Status</h4>
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-300">
                    <p className="text-gray-600">No driver currently assigned to this vehicle</p>
                  </div>
                </div>
              )}

              {/* Maintenance Schedule */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Maintenance Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Last Maintenance</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.lastMaintenance}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Next Maintenance</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.nextMaintenance}</p>
                  </div>
                </div>
              </div>

              {/* Documentation */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Documentation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Insurance</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.insurance}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Registration Expiry</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.registrationExpiry}</p>
                  </div>
                </div>
              </div>

              {/* Note (if exists) */}
              {selectedVehicle.note && (
                <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
                  <p className="text-sm font-medium text-gray-800">{selectedVehicle.note}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-[#1B3D2F] text-white rounded-xl hover:bg-[#152e22] font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
