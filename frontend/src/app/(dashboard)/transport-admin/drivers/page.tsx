'use client'

import { useState, useEffect } from 'react'
import { driverApi, vehicleApi, userApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

interface AssignedVehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  year: number
  status: string
}

interface Driver {
  id: string
  user: {
    id: string
    name: string
    email: string
    phoneNumber?: string
    profilePhoto?: string
  }
  licenseNumber: string
  licenseExpiry: string
  status: string
  rating: number
  totalTrips: number
  totalDistance: number
  isAvailable: boolean
  assignedVehicle?: AssignedVehicle | null
}

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  year: number
  status: string
  onTrip?: boolean
  assignedDriver?: { id: string } | null
}

export default function DriversPage() {
  const [activeFilter, setActiveFilter] = useState('All Drivers')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '', email: '', password: '', phoneNumber: '',
    licenseNumber: '', licenseExpiry: '', experienceYears: 1,
    specializations: '', notes: '',
  })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadDrivers()
    loadVehicles()
  }, [])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const data = await driverApi.getAll()
      const list = Array.isArray(data) ? data : []
      setDrivers(list)
    } catch (error: any) {
      showToast(error.message || 'Failed to load drivers', 'error')
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const loadVehicles = async () => {
    try {
      const data: any = await vehicleApi.getAll()
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setVehicles(list)
    } catch {
      // non-blocking
    }
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const handleAssignVehicle = async () => {
    if (!selectedDriver || !selectedVehicleId) return
    try {
      setAssigning(true)
      await driverApi.assignVehicle(selectedDriver.id, selectedVehicleId)
      showToast('Vehicle assigned successfully', 'success')
      setShowAssignModal(false)
      setSelectedVehicleId('')
      await loadDrivers()
    } catch (error: any) {
      showToast(error.message || 'Failed to assign vehicle', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const handleRevokeVehicle = async (driverId: string) => {
    try {
      setAssigning(true)
      await driverApi.unassignVehicle(driverId)
      showToast('Vehicle unassigned successfully', 'success')
      await loadDrivers()
    } catch (error: any) {
      showToast(error.message || 'Failed to unassign vehicle', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setAdding(true)
      let userId: string

      // Try to create user — if email exists, find the existing user
      try {
        const user: any = await userApi.create({
          name: addForm.name,
          email: addForm.email,
          password: addForm.password,
          phoneNumber: addForm.phoneNumber || undefined,
          role: 'Driver',
        })
        userId = user.id
      } catch (err: any) {
        if (err.message?.includes('already exists') || err.message?.includes('409')) {
          // User exists — find them
          const users: any = await userApi.getAll()
          const existing = Array.isArray(users) ? users.find((u: any) => u.email === addForm.email) : null
          if (!existing) throw new Error('Email already in use by a non-Driver account')
          if (existing.role !== 'Driver') throw new Error(`Email belongs to a ${existing.role} account, not a Driver`)
          userId = existing.id
        } else {
          throw err
        }
      }

      // Create driver profile
      await driverApi.create({
        userId,
        licenseNumber: addForm.licenseNumber,
        licenseExpiry: addForm.licenseExpiry,
        experienceYears: Number(addForm.experienceYears),
        phoneNumber: addForm.phoneNumber || undefined,
        specializations: addForm.specializations || undefined,
        notes: addForm.notes || undefined,
      })

      showToast(`Driver "${addForm.name}" created successfully`, 'success')
      setShowAddModal(false)
      setAddForm({ name: '', email: '', password: '', phoneNumber: '', licenseNumber: '', licenseExpiry: '', experienceYears: 1, specializations: '', notes: '' })
      await loadDrivers()
    } catch (error: any) {
      showToast(error.message || 'Failed to create driver', 'error')
    } finally {
      setAdding(false)
    }
  }

  const getStatusInfo = (driver: Driver) => {
    switch (driver.status) {
      case 'OnTrip':
        return { label: 'ON TRIP', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' }
      case 'OnLeave':
        return { label: 'ON LEAVE', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' }
      case 'Inactive':
        return { label: 'INACTIVE', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' }
      default:
        return { label: 'AVAILABLE', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' }
    }
  }

  const getFilteredDrivers = () => {
    if (activeFilter === 'All Drivers') return drivers
    return drivers.filter(driver => {
      const s = getStatusInfo(driver).label
      if (activeFilter === 'Available') return s === 'AVAILABLE'
      if (activeFilter === 'On Trip') return s === 'ON TRIP'
      if (activeFilter === 'Off Duty') return s === 'ON LEAVE' || s === 'INACTIVE'
      return true
    })
  }

  const filteredDrivers = getFilteredDrivers()

  // Vehicles not already assigned to any driver, not on trip, not under maintenance
  const unassignedVehicles = vehicles.filter(v => {
    return !v.assignedDriver && !v.onTrip && v.status !== 'UnderMaintenance' && v.status !== 'Maintenance'
  })

  const availableCount = drivers.filter(d => getStatusInfo(d).label === 'AVAILABLE').length
  const onTripCount = drivers.filter(d => getStatusInfo(d).label === 'ON TRIP').length
  const offDutyCount = drivers.filter(d => ['ON LEAVE', 'INACTIVE'].includes(getStatusInfo(d).label)).length

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver)
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
      </div>
    )
  }

  return (
    <>
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Driver Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor and manage your fleet drivers' status and assignments.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium text-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {['All Drivers', 'Available', 'On Trip', 'Off Duty'].map((filter) => {
          const count = filter === 'All Drivers' ? drivers.length
            : filter === 'Available' ? availableCount
            : filter === 'On Trip' ? onTripCount
            : offDutyCount
          const dotColor = filter === 'Available' ? 'bg-green-500'
            : filter === 'On Trip' ? 'bg-blue-500'
            : filter === 'Off Duty' ? 'bg-gray-500' : null
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#1B3D2F] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {dotColor && <span className={`w-2 h-2 ${dotColor} rounded-full`}></span>}
              {filter} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No drivers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => {
                const status = getStatusInfo(driver)
                const fullName = driver.user.name
                
                return (
                  <div
                    key={driver.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {driver.user.profilePhoto ? (
                          <img 
                            src={driver.user.profilePhoto} 
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{fullName}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Assigned vehicle badge */}
                    <div className="mb-3">
                      {driver.assignedVehicle ? (
                        <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
                          </svg>
                          <span className="text-green-700 font-medium truncate">
                            {driver.assignedVehicle.plateNumber} — {driver.assignedVehicle.make} {driver.assignedVehicle.model}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
                          </svg>
                          <span className="text-gray-400">No vehicle assigned</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>{driver.totalTrips} trips</span>
                      <span>·</span>
                      <span>{Number(driver.totalDistance).toFixed(0)} km</span>
                      {driver.rating > 0 && (
                        <>
                          <span>·</span>
                          <span>★ {Number(driver.rating).toFixed(1)}</span>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={() => handleViewDetails(driver)}
                      className="w-full px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>

    {showDetailsModal && selectedDriver && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Driver Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedDriver.user.profilePhoto ? (
                  <img 
                    src={selectedDriver.user.profilePhoto} 
                    alt={selectedDriver.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDriver.user.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusInfo(selectedDriver).color}`}>
                  {getStatusInfo(selectedDriver).label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Driver ID</p>
                    <p className="text-sm font-medium text-gray-900">{selectedDriver.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedDriver.user.email}</p>
                  </div>
                  {selectedDriver.user.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedDriver.user.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">License Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Expiry</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedDriver.licenseExpiry).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Availability</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedDriver.isAvailable ? 'Available for assignments' : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Vehicle Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Assigned Vehicle</h4>
              {selectedDriver.assignedVehicle ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-green-800">
                        {selectedDriver.assignedVehicle.plateNumber}
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        {selectedDriver.assignedVehicle.year} {selectedDriver.assignedVehicle.make} {selectedDriver.assignedVehicle.model}
                      </p>
                      <span className="inline-block mt-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {selectedDriver.assignedVehicle.status}
                      </span>
                    </div>
                    <svg className="w-10 h-10 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center">
                  <p className="text-sm text-gray-400">No vehicle assigned</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedDriver.assignedVehicle ? (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setShowAssignModal(true)
                      }}
                      disabled={selectedDriver.status === 'OnTrip' || assigning}
                      className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reassign Vehicle
                    </button>
                    <button
                      onClick={() => {
                        handleRevokeVehicle(selectedDriver.id)
                        setShowDetailsModal(false)
                      }}
                      disabled={selectedDriver.status === 'OnTrip' || assigning}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigning ? 'Revoking...' : 'Revoke Vehicle'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowAssignModal(true)
                    }}
                    disabled={selectedDriver.status === 'OnTrip' || assigning}
                    className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign Vehicle
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
              {selectedDriver.status === 'OnTrip' && (
                <p className="text-xs text-gray-400 mt-3 text-center">Cannot change assignment while driver is on a trip</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Assign Vehicle Modal */}
    {showAssignModal && selectedDriver && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Assign Vehicle</h3>
          <p className="text-sm text-gray-500 mb-4">
            Assigning to <span className="font-medium text-gray-700">{selectedDriver.user.name}</span>
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
            {unassignedVehicles.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 text-center">No available vehicles</p>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]"
              >
                <option value="">-- Choose a vehicle --</option>
                {unassignedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.year} {v.make} {v.model} ({v.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowAssignModal(false); setSelectedVehicleId('') }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignVehicle}
              disabled={!selectedVehicleId || assigning}
              className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    )}

    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}

    {/* Add Driver Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Add New Driver</h3>
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input required value={addForm.name} onChange={e => setAddForm(p => ({...p, name: e.target.value}))}
                  placeholder="Driver name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={addForm.email} onChange={e => setAddForm(p => ({...p, email: e.target.value}))}
                  placeholder="driver@fleet.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                <input required type="password" value={addForm.password} onChange={e => setAddForm(p => ({...p, password: e.target.value}))}
                  placeholder="Min 8 chars" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input value={addForm.phoneNumber} onChange={e => setAddForm(p => ({...p, phoneNumber: e.target.value}))}
                  placeholder="+251912345678" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">License Number *</label>
                <input required value={addForm.licenseNumber} onChange={e => setAddForm(p => ({...p, licenseNumber: e.target.value}))}
                  placeholder="DL-123456789" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">License Expiry *</label>
                <input required type="date" value={addForm.licenseExpiry} onChange={e => setAddForm(p => ({...p, licenseExpiry: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Experience (years) *</label>
                <input required type="number" min={0} max={50} value={addForm.experienceYears} onChange={e => setAddForm(p => ({...p, experienceYears: Number(e.target.value)}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specializations</label>
                <input value={addForm.specializations} onChange={e => setAddForm(p => ({...p, specializations: e.target.value}))}
                  placeholder="Heavy vehicles, Long distance" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <input value={addForm.notes} onChange={e => setAddForm(p => ({...p, notes: e.target.value}))}
                  placeholder="Optional notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3D2F]" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Cancel
              </button>
              <button type="submit" disabled={adding}
                className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium text-sm disabled:opacity-50">
                {adding ? 'Creating...' : 'Create Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    
    </>
  )
}
