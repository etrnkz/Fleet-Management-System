'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, vehicleApi, driverApi } from '@/lib/api'

export default function TripsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFuelRequestModal, setShowFuelRequestModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [assignmentData, setAssignmentData] = useState({
    vehicleId: '',
    driverId: ''
  })
  const [fuelRequest, setFuelRequest] = useState({
    amount: '',
    urgency: 'normal',
    notes: ''
  })
  const [tripsList, setTripsList] = useState<any[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTripsData()
  }, [])

  const loadTripsData = async () => {
    try {
      const [trips, vehicles, drivers] = await Promise.all([
        tripApi.getAllTrips(),
        vehicleApi.getAvailableVehicles(),
        driverApi.getAvailableDrivers()
      ])
      
      setTripsList(Array.isArray(trips) ? trips : [])
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : [])
      setAvailableDrivers(Array.isArray(drivers) ? drivers : [])
    } catch (error: any) {
      console.error('Failed to load trips data:', error)
      if (error?.message?.includes('token') || error?.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle Assign Vehicle & Driver
  const handleAssignTrip = (trip: any) => {
    setSelectedTrip(trip)
    setAssignmentData({ vehicleId: '', driverId: '' })
    setShowAssignModal(true)
  }

  // Handle Save Assignment
  const handleSaveAssignment = async () => {
    if (!assignmentData.vehicleId || !assignmentData.driverId) {
      showNotification('Please select both vehicle and driver', 'error')
      return
    }

    try {
      await tripApi.assignVehicleAndDriver(
        selectedTrip.id,
        assignmentData.vehicleId,
        assignmentData.driverId
      )

      const selectedVehicle = availableVehicles.find((v: any) => v.id === assignmentData.vehicleId)
      const selectedDriver = availableDrivers.find((d: any) => d.id === assignmentData.driverId)

      setTripsList((tripsList as any[]).map((trip: any) =>
        trip.id === selectedTrip.id
          ? {
              ...trip,
              status: 'Assigned',
              statusColor: 'bg-emerald-100 text-emerald-700',
              vehicle: selectedVehicle ? { id: selectedVehicle.id, name: selectedVehicle.model || selectedVehicle.name, plate: selectedVehicle.plateNumber || selectedVehicle.plate, fuelLevel: selectedVehicle.fuelLevel || 100 } : null,
              driver: selectedDriver ? { id: selectedDriver.id, name: selectedDriver.name, phone: selectedDriver.phone } : null
            }
          : trip
      ))

      setShowAssignModal(false)
      setSelectedTrip(null)
      setAssignmentData({ vehicleId: '', driverId: '' })
      showNotification(`Vehicle and driver assigned successfully to ${selectedTrip.id}!`)
    } catch (error: any) {
      showNotification(error?.message || 'Failed to assign vehicle and driver', 'error')
    }
  }

  // Handle View Details
  const handleViewDetails = (trip: any) => {
    setSelectedTrip(trip)
    setShowDetailsModal(true)
  }

  // Handle Request Fuel
  const handleRequestFuel = (trip: any) => {
    setSelectedTrip(trip)
    setFuelRequest({ amount: '', urgency: 'normal', notes: '' })
    setShowFuelRequestModal(true)
  }

  // Handle Submit Fuel Request
  const handleSubmitFuelRequest = () => {
    if (!fuelRequest.amount) {
      showNotification('Please enter fuel amount', 'error')
      return
    }

    // Close modal first
    setShowFuelRequestModal(false)
    setSelectedTrip(null)
    setFuelRequest({ amount: '', urgency: 'normal', notes: '' })
    
    // In a real app, this would send the request to the admin
    showNotification(`Fuel request submitted successfully (${fuelRequest.amount}L)!`)
  }

  const getFilteredTrips = () => {
    return tripsList.filter(trip => {
      const matchesSearch = searchQuery === '' || 
        trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || 
        trip.status.toLowerCase().replace(' ', '-') === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }

  const filteredTrips = getFilteredTrips()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Trip Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage approved trips and assign vehicles & drivers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, requester, department, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending-assignment">Pending Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Trip Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{trip.id}</h3>
                    <p className="text-sm text-gray-600">{trip.requestedBy} • {trip.department}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${trip.statusColor}`}>
                    {trip.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Destination:</span> {trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Date:</span> {trip.startDate} to {trip.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Duration:</span> {trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Passengers:</span> {trip.passengers}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <span className="font-medium">Purpose:</span> {trip.purpose}
                </div>

                {/* Assignment Info */}
                {trip.vehicle && trip.driver && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                          </svg>
                          <span className="text-xs font-semibold text-emerald-700">Assigned Vehicle</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{trip.vehicle.name}</p>
                        <p className="text-xs text-gray-600">{trip.vehicle.plate}</p>
                        
                        {/* Fuel Level */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Fuel Level</span>
                            <span className={`text-xs font-medium ${
                              trip.vehicle.fuelLevel >= 70 ? 'text-emerald-600' : 
                              trip.vehicle.fuelLevel >= 40 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {trip.vehicle.fuelLevel}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                trip.vehicle.fuelLevel >= 70 ? 'bg-emerald-500' : 
                                trip.vehicle.fuelLevel >= 40 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${trip.vehicle.fuelLevel}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-semibold text-blue-700">Assigned Driver</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{trip.driver.name}</p>
                        <p className="text-xs text-gray-600">{trip.driver.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => handleViewDetails(trip)}
                  className="flex-1 lg:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
                {trip.status === 'Pending Assignment' && (
                  <button
                    onClick={() => handleAssignTrip(trip)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Assign Vehicle
                  </button>
                )}
                {trip.vehicle && trip.vehicle.fuelLevel < 70 && (
                  <button
                    onClick={() => handleRequestFuel(trip)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Request Fuel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTrips.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Assign Vehicle & Driver Modal */}
      {showAssignModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Assign Vehicle & Driver</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Trip Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Trip Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Trip ID:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Requester:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.requestedBy}</p>
                </div>
                <div>
                  <span className="text-gray-600">Destination:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.destination}</p>
                </div>
                <div>
                  <span className="text-gray-600">Passengers:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.passengers} people</p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.duration}</p>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <p className="font-medium text-gray-900">{selectedTrip.startDate}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Vehicle</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setAssignmentData({...assignmentData, vehicleId: vehicle.id})}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      assignmentData.vehicleId === vehicle.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        assignmentData.vehicleId === vehicle.id ? 'bg-emerald-500' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${assignmentData.vehicleId === vehicle.id ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                        <p className="text-xs text-gray-600">{vehicle.plate}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{vehicle.type}</span>
                          <span className="text-xs text-gray-600">{vehicle.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Driver</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => setAssignmentData({...assignmentData, driverId: driver.id})}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      assignmentData.driverId === driver.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        assignmentData.driverId === driver.id ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${assignmentData.driverId === driver.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-600">{driver.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{driver.license}</span>
                          <span className="text-xs text-gray-600">{driver.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details Modal */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Trip Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Trip Information */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800">Trip Information</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTrip.statusColor}`}>
                  {selectedTrip.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Trip ID</span>
                  <p className="font-medium text-gray-900">{selectedTrip.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Requested By</span>
                  <p className="font-medium text-gray-900">{selectedTrip.requestedBy}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Department</span>
                  <p className="font-medium text-gray-900">{selectedTrip.department}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Destination</span>
                  <p className="font-medium text-gray-900">{selectedTrip.destination}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Start Date</span>
                  <p className="font-medium text-gray-900">{selectedTrip.startDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">End Date</span>
                  <p className="font-medium text-gray-900">{selectedTrip.endDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration</span>
                  <p className="font-medium text-gray-900">{selectedTrip.duration}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Passengers</span>
                  <p className="font-medium text-gray-900">{selectedTrip.passengers} people</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-600">Purpose</span>
                  <p className="font-medium text-gray-900">{selectedTrip.purpose}</p>
                </div>
              </div>
            </div>

            {/* Approval Chain */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Approval Chain</h4>
              <div className="space-y-3">
                {selectedTrip.approvals.map((approval: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{approval.role}</p>
                      <p className="text-sm text-gray-600">{approval.approver}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-medium">
                        {approval.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{approval.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Details */}
            {selectedTrip.vehicle && selectedTrip.driver && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Assignment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                      </svg>
                      <span className="font-semibold text-emerald-700">Assigned Vehicle</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedTrip.vehicle.name}</p>
                    <p className="text-sm text-gray-600">{selectedTrip.vehicle.plate}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-blue-700">Assigned Driver</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedTrip.driver.name}</p>
                    <p className="text-sm text-gray-600">{selectedTrip.driver.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Request Modal */}
      {showFuelRequestModal && selectedTrip && selectedTrip.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Request Fuel</h3>
              <button
                onClick={() => setShowFuelRequestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Vehicle Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium text-gray-900">{selectedTrip.vehicle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plate:</span>
                  <span className="font-medium text-gray-900">{selectedTrip.vehicle.plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip ID:</span>
                  <span className="font-medium text-gray-900">{selectedTrip.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Fuel:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedTrip.vehicle.fuelLevel >= 70 ? 'bg-emerald-500' : 
                          selectedTrip.vehicle.fuelLevel >= 40 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${selectedTrip.vehicle.fuelLevel}%` }}
                      ></div>
                    </div>
                    <span className={`font-medium ${
                      selectedTrip.vehicle.fuelLevel >= 70 ? 'text-emerald-600' : 
                      selectedTrip.vehicle.fuelLevel >= 40 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {selectedTrip.vehicle.fuelLevel}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Request Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Amount (Liters) *</label>
                <input
                  type="number"
                  value={fuelRequest.amount}
                  onChange={(e) => setFuelRequest({...fuelRequest, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., 50"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label>
                <select
                  value={fuelRequest.urgency}
                  onChange={(e) => setFuelRequest({...fuelRequest, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="low">Low - Can wait</option>
                  <option value="normal">Normal - Within 24 hours</option>
                  <option value="high">High - Urgent (within 6 hours)</option>
                  <option value="critical">Critical - Immediate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={fuelRequest.notes}
                  onChange={(e) => setFuelRequest({...fuelRequest, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFuelRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFuelRequest}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
