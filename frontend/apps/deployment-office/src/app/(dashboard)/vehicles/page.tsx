'use client'

import { useState } from 'react'

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plate: '',
    type: 'SUV',
    capacity: '',
    location: 'Main Campus'
  })

  const [vehiclesList, setVehiclesList] = useState([
    {
      id: 'V-001',
      model: 'Toyota Land Cruiser',
      plate: 'AA-12345',
      type: 'SUV',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      capacity: '7 seats',
      fuelLevel: '85%',
      location: 'Main Campus',
      lastService: '2024-02-15',
      mileage: '45,230 km',
      driver: {
        name: 'Ahmed Hassan',
        license: 'Class A',
        phone: '+251 911 123 456',
        experience: '10 years'
      }
    },
    {
      id: 'V-002',
      model: 'Mercedes-Benz Sprinter',
      plate: 'AA-23456',
      type: 'Van',
      status: 'In Use',
      statusColor: 'bg-blue-100 text-blue-700',
      capacity: '12 seats',
      fuelLevel: '60%',
      location: 'Engineering Campus',
      lastService: '2024-02-10',
      mileage: '62,450 km',
      driver: {
        name: 'Bekele Girma',
        license: 'Class B',
        phone: '+251 911 234 567',
        experience: '8 years'
      }
    },
    {
      id: 'V-003',
      model: 'Isuzu NPR',
      plate: 'AA-34567',
      type: 'Truck',
      status: 'Maintenance',
      statusColor: 'bg-orange-100 text-orange-700',
      capacity: '2 tons',
      fuelLevel: '40%',
      location: 'Service Center',
      lastService: '2024-03-01',
      mileage: '98,120 km',
      driver: {
        name: 'Mohammed Ali',
        license: 'Class C',
        phone: '+251 911 345 678',
        experience: '12 years'
      }
    },
    {
      id: 'V-004',
      model: 'Toyota Hiace',
      plate: 'AA-45678',
      type: 'Van',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      capacity: '14 seats',
      fuelLevel: '95%',
      location: 'Main Campus',
      lastService: '2024-02-20',
      mileage: '38,900 km',
      driver: {
        name: 'Tadesse Girma',
        license: 'Class B',
        phone: '+251 911 456 789',
        experience: '6 years'
      }
    },
    {
      id: 'V-005',
      model: 'Nissan Patrol',
      plate: 'AA-56789',
      type: 'SUV',
      status: 'In Use',
      statusColor: 'bg-blue-100 text-blue-700',
      capacity: '8 seats',
      fuelLevel: '70%',
      location: 'Medical Campus',
      lastService: '2024-01-25',
      mileage: '52,340 km',
      driver: {
        name: 'Yohannes Tesfaye',
        license: 'Class A',
        phone: '+251 911 567 890',
        experience: '9 years'
      }
    },
    {
      id: 'V-006',
      model: 'Mitsubishi Canter',
      plate: 'AA-67890',
      type: 'Truck',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      capacity: '3 tons',
      fuelLevel: '80%',
      location: 'Main Campus',
      lastService: '2024-02-28',
      mileage: '71,200 km',
      driver: {
        name: 'Dawit Kebede',
        license: 'Class C',
        phone: '+251 911 678 901',
        experience: '7 years'
      }
    },
    {
      id: 'V-007',
      model: 'Ford Transit',
      plate: 'AA-78901',
      type: 'Van',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      capacity: '15 seats',
      fuelLevel: '90%',
      location: 'Main Campus',
      lastService: '2024-02-18',
      mileage: '41,560 km',
      driver: {
        name: 'Solomon Haile',
        license: 'Class B',
        phone: '+251 911 789 012',
        experience: '11 years'
      }
    },
    {
      id: 'V-008',
      model: 'Toyota Coaster',
      plate: 'AA-89012',
      type: 'Bus',
      status: 'In Use',
      statusColor: 'bg-blue-100 text-blue-700',
      capacity: '30 seats',
      fuelLevel: '55%',
      location: 'Business Campus',
      lastService: '2024-02-05',
      mileage: '89,450 km',
      driver: {
        name: 'Getachew Alemu',
        license: 'Class D',
        phone: '+251 911 890 123',
        experience: '15 years'
      }
    }
  ])

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle Add Vehicle
  const handleAddVehicle = () => {
    setShowAddModal(true)
  }

  // Handle Save New Vehicle
  const handleSaveNewVehicle = () => {
    if (!newVehicle.model || !newVehicle.plate || !newVehicle.capacity) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const newId = `V-${String(vehiclesList.length + 1).padStart(3, '0')}`
    const statusColor = 'bg-emerald-100 text-emerald-700'
    
    const vehicleToAdd = {
      id: newId,
      model: newVehicle.model,
      plate: newVehicle.plate,
      type: newVehicle.type,
      status: 'Available',
      statusColor,
      capacity: newVehicle.capacity,
      fuelLevel: '100%',
      location: newVehicle.location,
      lastService: new Date().toISOString().split('T')[0],
      mileage: '0 km',
      driver: {
        name: 'Unassigned',
        license: 'N/A',
        phone: 'N/A',
        experience: 'N/A'
      }
    }

    setVehiclesList([...vehiclesList, vehicleToAdd])
    setShowAddModal(false)
    setNewVehicle({
      model: '',
      plate: '',
      type: 'SUV',
      capacity: '',
      location: 'Main Campus'
    })
    showNotification('Vehicle added successfully!')
  }

  // Handle View Details
  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setShowDetailsModal(true)
  }

  // Handle Options Menu
  const handleOptions = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setShowOptionsModal(true)
  }

  // Handle Delete Vehicle
  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      setVehiclesList(vehiclesList.filter(v => v.id !== vehicleId))
      setShowOptionsModal(false)
      showNotification('Vehicle deleted successfully!')
    }
  }

  const getFilteredVehicles = () => {
    return vehiclesList.filter(vehicle => {
      const matchesSearch = searchQuery === '' || 
        vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || 
        vehicle.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }

  const filteredVehicles = getFilteredVehicles()

  const stats = {
    total: vehiclesList.length,
    available: vehiclesList.filter(v => v.status === 'Available').length,
    inUse: vehiclesList.filter(v => v.status === 'In Use').length,
    maintenance: vehiclesList.filter(v => v.status === 'Maintenance').length
  }

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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Vehicle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model *</label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Toyota Land Cruiser"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                <input
                  type="text"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., AA-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                  <option value="Sedan">Sedan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="text"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., 7 seats or 2 tons"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select
                  value={newVehicle.location}
                  onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="Main Campus">Main Campus</option>
                  <option value="Engineering Campus">Engineering Campus</option>
                  <option value="Medical Campus">Medical Campus</option>
                  <option value="Business Campus">Business Campus</option>
                  <option value="Service Center">Service Center</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewVehicle}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Vehicle Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Vehicle Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Vehicle ID</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Model</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Plate Number</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.plate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Type</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedVehicle.statusColor}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Capacity</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.capacity}</p>
                  </div>
                </div>
              </div>

              {/* Operational Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Operational Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Fuel Level</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.fuelLevel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Location</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Mileage</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.mileage}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Service</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.lastService}</p>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Assigned Driver</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.driver.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">License</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.driver.license}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.driver.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Experience</span>
                    <p className="font-medium text-gray-900">{selectedVehicle.driver.experience}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
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

      {/* Options Modal */}
      {showOptionsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Vehicle Options</h3>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowOptionsModal(false)
                  setShowDetailsModal(true)
                }}
                className="w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">View Full Details</span>
              </button>

              <button
                onClick={() => {
                  setShowOptionsModal(false)
                  showNotification('Edit functionality coming soon!')
                }}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Edit Vehicle</span>
              </button>

              <button
                onClick={() => {
                  setShowOptionsModal(false)
                  showNotification('Assign driver functionality coming soon!')
                }}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Assign Driver</span>
              </button>

              <button
                onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">Delete Vehicle</span>
              </button>
            </div>

            <button
              onClick={() => setShowOptionsModal(false)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Total Vehicles</span>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Available</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-emerald-600">{stats.available}</h3>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">In Use</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-blue-600">{stats.inUse}</h3>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Maintenance</span>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-orange-600">{stats.maintenance}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, model, plate, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button 
            onClick={handleAddVehicle}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Vehicle Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <svg className="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>

            {/* Vehicle Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{vehicle.model}</h3>
                  <p className="text-sm text-gray-600">{vehicle.id} • {vehicle.plate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.statusColor}`}>
                  {vehicle.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{vehicle.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium text-gray-900">{vehicle.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fuel Level:</span>
                  <span className="font-medium text-gray-900">{vehicle.fuelLevel}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{vehicle.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mileage:</span>
                  <span className="font-medium text-gray-900">{vehicle.mileage}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Service:</span>
                  <span className="font-medium text-gray-900">{vehicle.lastService}</span>
                </div>
              </div>

              {/* Assigned Driver Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Assigned Driver</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.driver.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">License:</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.driver.license}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Experience:</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.driver.experience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.driver.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleViewDetails(vehicle)}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors text-sm">
                  View Details
                </button>
                <button 
                  onClick={() => handleOptions(vehicle)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredVehicles.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
