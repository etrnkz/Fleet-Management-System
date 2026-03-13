'use client'

import { useState } from 'react'

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignVehicleModal, setShowAssignVehicleModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    license: 'Class A',
    experience: '',
    address: ''
  })
  const [editDriver, setEditDriver] = useState({
    name: '',
    phone: '',
    email: '',
    license: '',
    experience: '',
    address: ''
  })
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

  const availableVehicles = [
    { id: 'V-001', name: 'Toyota Land Cruiser', plate: 'AA-12345', type: 'SUV', status: 'Available' },
    { id: 'V-004', name: 'Toyota Hiace', plate: 'AA-45678', type: 'Van', status: 'Available' },
    { id: 'V-006', name: 'Mitsubishi Canter', plate: 'AA-67890', type: 'Truck', status: 'Available' },
    { id: 'V-007', name: 'Ford Transit', plate: 'AA-78901', type: 'Van', status: 'Available' }
  ]

  const [driversList, setDriversList] = useState([
    {
      id: 'D-001',
      name: 'Ahmed Hassan',
      phone: '+251 911 123 456',
      email: 'ahmed.hassan@university.edu.et',
      license: 'Class A',
      experience: '10 years',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      address: 'Addis Ababa, Ethiopia',
      joinDate: '2014-03-15',
      assignedVehicle: null,
      totalTrips: 245,
      rating: 4.8
    },
    {
      id: 'D-002',
      name: 'Bekele Girma',
      phone: '+251 911 234 567',
      email: 'bekele.girma@university.edu.et',
      license: 'Class B',
      experience: '8 years',
      status: 'On Trip',
      statusColor: 'bg-blue-100 text-blue-700',
      address: 'Bahir Dar, Ethiopia',
      joinDate: '2016-07-20',
      assignedVehicle: 'Mercedes-Benz Sprinter (AA-23456)',
      totalTrips: 198,
      rating: 4.6
    },
    {
      id: 'D-003',
      name: 'Mohammed Ali',
      phone: '+251 911 345 678',
      email: 'mohammed.ali@university.edu.et',
      license: 'Class C',
      experience: '12 years',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      address: 'Gondar, Ethiopia',
      joinDate: '2012-01-10',
      assignedVehicle: null,
      totalTrips: 312,
      rating: 4.9
    },
    {
      id: 'D-004',
      name: 'Tadesse Girma',
      phone: '+251 911 456 789',
      email: 'tadesse.girma@university.edu.et',
      license: 'Class B',
      experience: '6 years',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      address: 'Hawassa, Ethiopia',
      joinDate: '2018-09-05',
      assignedVehicle: null,
      totalTrips: 156,
      rating: 4.7
    },
    {
      id: 'D-005',
      name: 'Yohannes Tesfaye',
      phone: '+251 911 567 890',
      email: 'yohannes.tesfaye@university.edu.et',
      license: 'Class A',
      experience: '9 years',
      status: 'On Trip',
      statusColor: 'bg-blue-100 text-blue-700',
      address: 'Mekelle, Ethiopia',
      joinDate: '2015-05-12',
      assignedVehicle: 'Nissan Patrol (AA-56789)',
      totalTrips: 223,
      rating: 4.8
    },
    {
      id: 'D-006',
      name: 'Dawit Kebede',
      phone: '+251 911 678 901',
      email: 'dawit.kebede@university.edu.et',
      license: 'Class C',
      experience: '7 years',
      status: 'On Leave',
      statusColor: 'bg-gray-100 text-gray-700',
      address: 'Dire Dawa, Ethiopia',
      joinDate: '2017-11-22',
      assignedVehicle: null,
      totalTrips: 178,
      rating: 4.5
    }
  ])

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle Add Driver
  const handleAddDriver = () => {
    setShowAddModal(true)
  }

  // Handle Save New Driver
  const handleSaveNewDriver = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.email || !newDriver.experience) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const newId = `D-${String(driversList.length + 1).padStart(3, '0')}`
    
    const driverToAdd = {
      id: newId,
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      license: newDriver.license,
      experience: newDriver.experience,
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      address: newDriver.address,
      joinDate: new Date().toISOString().split('T')[0],
      assignedVehicle: null,
      totalTrips: 0,
      rating: 5.0
    }

    setDriversList([...driversList, driverToAdd])
    setShowAddModal(false)
    setNewDriver({
      name: '',
      phone: '',
      email: '',
      license: 'Class A',
      experience: '',
      address: ''
    })
    showNotification('Driver added successfully!')
  }

  // Handle View Details
  const handleViewDetails = (driver: any) => {
    setSelectedDriver(driver)
    setShowDetailsModal(true)
  }

  // Handle Options Menu
  const handleOptions = (driver: any) => {
    setSelectedDriver(driver)
    setShowOptionsModal(true)
  }

  // Handle Delete Driver
  const handleDeleteDriver = () => {
    setDriversList(driversList.filter(d => d.id !== selectedDriver.id))
    setShowDeleteConfirmModal(false)
    setShowOptionsModal(false)
    setSelectedDriver(null)
    showNotification('Driver deleted successfully!')
  }

  // Open Delete Confirmation
  const openDeleteConfirm = () => {
    setShowOptionsModal(false)
    setShowDeleteConfirmModal(true)
  }

  // Handle Edit Driver
  const handleEditDriver = (driver: any) => {
    setEditDriver({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      license: driver.license,
      experience: driver.experience,
      address: driver.address
    })
    setShowOptionsModal(false)
    setShowEditModal(true)
  }

  // Handle Save Edit
  const handleSaveEdit = () => {
    if (!editDriver.name || !editDriver.phone || !editDriver.email || !editDriver.experience) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    setDriversList(driversList.map(driver =>
      driver.id === selectedDriver.id
        ? {
            ...driver,
            name: editDriver.name,
            phone: editDriver.phone,
            email: editDriver.email,
            license: editDriver.license,
            experience: editDriver.experience,
            address: editDriver.address
          }
        : driver
    ))

    setShowEditModal(false)
    setSelectedDriver(null)
    showNotification('Driver updated successfully!')
  }

  // Handle Assign Vehicle
  const handleAssignVehicle = (driver: any) => {
    setSelectedVehicleId('')
    setShowOptionsModal(false)
    setShowAssignVehicleModal(true)
  }

  // Handle Save Vehicle Assignment
  const handleSaveVehicleAssignment = () => {
    if (!selectedVehicleId) {
      showNotification('Please select a vehicle', 'error')
      return
    }

    const vehicle = availableVehicles.find(v => v.id === selectedVehicleId)
    
    setDriversList(driversList.map(driver =>
      driver.id === selectedDriver.id
        ? {
            ...driver,
            assignedVehicle: vehicle ? `${vehicle.name} (${vehicle.plate})` : null,
            status: 'On Trip',
            statusColor: 'bg-blue-100 text-blue-700'
          }
        : driver
    ))

    setShowAssignVehicleModal(false)
    setSelectedDriver(null)
    setSelectedVehicleId('')
    showNotification('Vehicle assigned successfully!')
  }

  const getFilteredDrivers = () => {
    return driversList.filter(driver => {
      const matchesSearch = searchQuery === '' || 
        driver.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || 
        driver.status.toLowerCase().replace(' ', '-') === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }

  const filteredDrivers = getFilteredDrivers()

  const stats = {
    total: driversList.length,
    available: driversList.filter(d => d.status === 'Available').length,
    onTrip: driversList.filter(d => d.status === 'On Trip').length,
    onLeave: driversList.filter(d => d.status === 'On Leave').length
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

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Driver Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage drivers and their assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Total Drivers</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Available</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.available}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">On Trip</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-blue-600">{stats.onTrip}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">On Leave</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-600">{stats.onLeave}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, name, phone, or email..."
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
            <option value="on-trip">On Trip</option>
            <option value="on-leave">On Leave</option>
          </select>

          <button 
            onClick={handleAddDriver}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Driver</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Driver Avatar & Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {driver.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-600">{driver.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${driver.statusColor}`}>
                {driver.status}
              </span>
            </div>

            {/* Driver Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{driver.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700 truncate">{driver.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-700">{driver.license} • {driver.experience}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{driver.totalTrips}</p>
                <p className="text-xs text-gray-600">Total Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{driver.rating}</p>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>

            {/* Assigned Vehicle */}
            {driver.assignedVehicle && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700 font-semibold mb-1">Currently Assigned</p>
                <p className="text-sm font-medium text-gray-900">{driver.assignedVehicle}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleViewDetails(driver)}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors text-sm">
                View Details
              </button>
              <button 
                onClick={() => handleOptions(driver)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDrivers.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Driver</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Ahmed Hassan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., +251 911 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., driver@university.edu.et"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Class *</label>
                <select
                  value={newDriver.license}
                  onChange={(e) => setNewDriver({...newDriver, license: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="Class A">Class A</option>
                  <option value="Class B">Class B</option>
                  <option value="Class C">Class C</option>
                  <option value="Class D">Class D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input
                  type="text"
                  value={newDriver.experience}
                  onChange={(e) => setNewDriver({...newDriver, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., 5 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newDriver.address}
                  onChange={(e) => setNewDriver({...newDriver, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  rows={2}
                />
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
                onClick={handleSaveNewDriver}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Driver Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Driver Avatar & Status */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {selectedDriver.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900">{selectedDriver.name}</h4>
                <p className="text-gray-600">{selectedDriver.id}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${selectedDriver.statusColor}`}>
                  {selectedDriver.status}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="font-medium text-gray-900">{selectedDriver.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium text-gray-900">{selectedDriver.email}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-600">Address</span>
                  <p className="font-medium text-gray-900">{selectedDriver.address}</p>
                </div>
              </div>
            </div>

            {/* License & Experience */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">License & Experience</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">License Class</span>
                  <p className="font-medium text-gray-900">{selectedDriver.license}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Experience</span>
                  <p className="font-medium text-gray-900">{selectedDriver.experience}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Join Date</span>
                  <p className="font-medium text-gray-900">{selectedDriver.joinDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rating</span>
                  <p className="font-medium text-yellow-600 text-xl">★ {selectedDriver.rating}</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-600">{selectedDriver.totalTrips}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Trips</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{selectedDriver.rating}</p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            {selectedDriver.assignedVehicle && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Current Assignment</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-semibold mb-1">Assigned Vehicle</p>
                  <p className="font-medium text-gray-900">{selectedDriver.assignedVehicle}</p>
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

      {/* Options Modal */}
      {showOptionsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Driver Options</h3>
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
                onClick={() => handleEditDriver(selectedDriver)}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Edit Driver</span>
              </button>

              <button
                onClick={() => handleAssignVehicle(selectedDriver)}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                <span className="font-medium">Assign Vehicle</span>
              </button>

              <button
                onClick={openDeleteConfirm}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">Delete Driver</span>
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

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Driver</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editDriver.name}
                  onChange={(e) => setEditDriver({...editDriver, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={editDriver.phone}
                  onChange={(e) => setEditDriver({...editDriver, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={editDriver.email}
                  onChange={(e) => setEditDriver({...editDriver, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Class *</label>
                <select
                  value={editDriver.license}
                  onChange={(e) => setEditDriver({...editDriver, license: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="Class A">Class A</option>
                  <option value="Class B">Class B</option>
                  <option value="Class C">Class C</option>
                  <option value="Class D">Class D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input
                  type="text"
                  value={editDriver.experience}
                  onChange={(e) => setEditDriver({...editDriver, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editDriver.address}
                  onChange={(e) => setEditDriver({...editDriver, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vehicle Modal */}
      {showAssignVehicleModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Assign Vehicle</h3>
              <button
                onClick={() => setShowAssignVehicleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Driver Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Driver</h4>
              <p className="font-medium text-gray-900">{selectedDriver.name}</p>
              <p className="text-sm text-gray-600">{selectedDriver.license} • {selectedDriver.experience}</p>
            </div>

            {/* Vehicle Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Vehicle</label>
              <div className="space-y-3">
                {availableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedVehicleId === vehicle.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedVehicleId === vehicle.id ? 'bg-emerald-500' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${selectedVehicleId === vehicle.id ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignVehicleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicleAssignment}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Driver</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedDriver.name}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriver}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
