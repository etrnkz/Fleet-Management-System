'use client'

import { useState } from 'react'

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [newMaintenance, setNewMaintenance] = useState({
    vehicleId: '',
    type: 'Routine Service',
    description: '',
    priority: 'normal',
    scheduledDate: ''
  })

  const vehicles = [
    { id: 'V-001', name: 'Toyota Land Cruiser', plate: 'AA-12345' },
    { id: 'V-002', name: 'Mercedes-Benz Sprinter', plate: 'AA-23456' },
    { id: 'V-003', name: 'Isuzu NPR', plate: 'AA-34567' },
    { id: 'V-004', name: 'Toyota Hiace', plate: 'AA-45678' },
    { id: 'V-005', name: 'Nissan Patrol', plate: 'AA-56789' }
  ]

  const [maintenanceList, setMaintenanceList] = useState([
    {
      id: 'MNT-001',
      vehicleId: 'V-001',
      vehicleName: 'Toyota Land Cruiser',
      vehiclePlate: 'AA-12345',
      type: 'Routine Service',
      description: 'Oil change, filter replacement, and general inspection',
      priority: 'normal',
      priorityColor: 'bg-blue-100 text-blue-700',
      status: 'Scheduled',
      statusColor: 'bg-yellow-100 text-yellow-700',
      scheduledDate: '2024-03-20',
      completedDate: null,
      cost: null,
      requestedBy: 'System',
      requestDate: '2024-03-10',
      notes: 'Regular 5,000 km service'
    },
    {
      id: 'MNT-002',
      vehicleId: 'V-003',
      vehicleName: 'Isuzu NPR',
      vehiclePlate: 'AA-34567',
      type: 'Repair',
      description: 'Brake system inspection and repair',
      priority: 'high',
      priorityColor: 'bg-orange-100 text-orange-700',
      status: 'In Progress',
      statusColor: 'bg-blue-100 text-blue-700',
      scheduledDate: '2024-03-15',
      completedDate: null,
      cost: 'ETB 8,500',
      requestedBy: 'Ahmed Hassan',
      requestDate: '2024-03-12',
      notes: 'Brake pads worn out, needs immediate attention'
    },
    {
      id: 'MNT-003',
      vehicleId: 'V-002',
      vehicleName: 'Mercedes-Benz Sprinter',
      vehiclePlate: 'AA-23456',
      type: 'Inspection',
      description: 'Annual safety inspection',
      priority: 'normal',
      priorityColor: 'bg-blue-100 text-blue-700',
      status: 'Completed',
      statusColor: 'bg-emerald-100 text-emerald-700',
      scheduledDate: '2024-03-08',
      completedDate: '2024-03-08',
      cost: 'ETB 2,000',
      requestedBy: 'Deployment Office',
      requestDate: '2024-03-01',
      notes: 'Passed all safety checks'
    },
    {
      id: 'MNT-004',
      vehicleId: 'V-005',
      vehicleName: 'Nissan Patrol',
      vehiclePlate: 'AA-56789',
      type: 'Tire Replacement',
      description: 'Replace all four tires',
      priority: 'high',
      priorityColor: 'bg-orange-100 text-orange-700',
      status: 'Pending',
      statusColor: 'bg-gray-100 text-gray-700',
      scheduledDate: '2024-03-18',
      completedDate: null,
      cost: null,
      requestedBy: 'Yohannes Tesfaye',
      requestDate: '2024-03-14',
      notes: 'Tires showing significant wear'
    }
  ])

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle Add Maintenance
  const handleAddMaintenance = () => {
    setShowAddModal(true)
  }

  // Handle Save New Maintenance
  const handleSaveNewMaintenance = () => {
    if (!newMaintenance.vehicleId || !newMaintenance.description || !newMaintenance.scheduledDate) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    const vehicle = vehicles.find(v => v.id === newMaintenance.vehicleId)
    const newId = `MNT-${String(maintenanceList.length + 1).padStart(3, '0')}`
    
    const priorityColors: any = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    }

    const maintenanceToAdd = {
      id: newId,
      vehicleId: newMaintenance.vehicleId,
      vehicleName: vehicle?.name || '',
      vehiclePlate: vehicle?.plate || '',
      type: newMaintenance.type,
      description: newMaintenance.description,
      priority: newMaintenance.priority,
      priorityColor: priorityColors[newMaintenance.priority],
      status: 'Pending',
      statusColor: 'bg-gray-100 text-gray-700',
      scheduledDate: newMaintenance.scheduledDate,
      completedDate: null,
      cost: null,
      requestedBy: 'Deployment Office',
      requestDate: new Date().toISOString().split('T')[0],
      notes: ''
    }

    setMaintenanceList([maintenanceToAdd, ...maintenanceList])
    setShowAddModal(false)
    setNewMaintenance({
      vehicleId: '',
      type: 'Routine Service',
      description: '',
      priority: 'normal',
      scheduledDate: ''
    })
    showNotification('Maintenance request created successfully!')
  }

  // Handle View Details
  const handleViewDetails = (maintenance: any) => {
    setSelectedMaintenance(maintenance)
    setShowDetailsModal(true)
  }

  // Handle View History
  const handleViewHistory = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    setShowHistoryModal(true)
  }

  // Get vehicle maintenance history
  const getVehicleHistory = (vehicleId: string) => {
    return maintenanceList
      .filter(m => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
  }

  // Handle Update Status
  const handleUpdateStatus = (maintenanceId: string, newStatus: string) => {
    const statusColors: any = {
      'Pending': 'bg-gray-100 text-gray-700',
      'Scheduled': 'bg-yellow-100 text-yellow-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-emerald-100 text-emerald-700',
      'Cancelled': 'bg-red-100 text-red-700'
    }

    setMaintenanceList(maintenanceList.map(m =>
      m.id === maintenanceId
        ? {
            ...m,
            status: newStatus,
            statusColor: statusColors[newStatus],
            completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : m.completedDate
          } as any
        : m
    ))

    showNotification(`Maintenance status updated to ${newStatus}`)
  }

  const getFilteredMaintenance = () => {
    return maintenanceList.filter(maintenance => {
      const matchesSearch = searchQuery === '' || 
        maintenance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        maintenance.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        maintenance.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        maintenance.type.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || 
        maintenance.status.toLowerCase().replace(' ', '-') === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }

  const filteredMaintenance = getFilteredMaintenance()

  const stats = {
    total: maintenanceList.length,
    pending: maintenanceList.filter(m => m.status === 'Pending').length,
    scheduled: maintenanceList.filter(m => m.status === 'Scheduled').length,
    inProgress: maintenanceList.filter(m => m.status === 'In Progress').length,
    completed: maintenanceList.filter(m => m.status === 'Completed').length
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Maintenance Management</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage vehicle maintenance schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Total</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Pending</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-600">{stats.pending}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Scheduled</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.scheduled}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">In Progress</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-blue-600">{stats.inProgress}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-600">Completed</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.completed}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, vehicle, or type..."
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
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button 
            onClick={handleAddMaintenance}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Maintenance List */}
      <div className="space-y-4">
        {filteredMaintenance.map((maintenance) => (
          <div key={maintenance.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Maintenance Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{maintenance.id}</h3>
                    <p className="text-sm text-gray-600">{maintenance.vehicleName} • {maintenance.vehiclePlate}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${maintenance.statusColor}`}>
                      {maintenance.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${maintenance.priorityColor}`}>
                      {maintenance.priority.charAt(0).toUpperCase() + maintenance.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Type:</span> {maintenance.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Scheduled:</span> {maintenance.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-700"><span className="font-medium">Requested by:</span> {maintenance.requestedBy}</span>
                  </div>
                  {maintenance.cost && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700"><span className="font-medium">Cost:</span> {maintenance.cost}</span>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-700">
                  <span className="font-medium">Reason:</span> {maintenance.description}
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => handleViewDetails(maintenance)}
                  className="flex-1 lg:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleViewHistory(maintenance.vehicleId)}
                  className="flex-1 lg:flex-none px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  View History
                </button>
                {maintenance.status !== 'Completed' && maintenance.status !== 'Cancelled' && (
                  <div className="flex-1 lg:flex-none">
                    <select
                      value={maintenance.status}
                      onChange={(e) => handleUpdateStatus(maintenance.id, e.target.value)}
                      className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors outline-none cursor-pointer"
                    >
                      <option value={maintenance.status} disabled>{maintenance.status}</option>
                      {maintenance.status === 'Pending' && <option value="Scheduled">Schedule</option>}
                      {maintenance.status === 'Scheduled' && <option value="In Progress">Start</option>}
                      {maintenance.status === 'In Progress' && <option value="Completed">Complete</option>}
                      <option value="Cancelled">Cancel</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredMaintenance.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">New Maintenance Request</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle *</label>
                <select
                  value={newMaintenance.vehicleId}
                  onChange={(e) => setNewMaintenance({...newMaintenance, vehicleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                <select
                  value={newMaintenance.type}
                  onChange={(e) => setNewMaintenance({...newMaintenance, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="Routine Service">Routine Service</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Maintenance *</label>
                <textarea
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Describe the reason for maintenance (e.g., brake pads worn out, oil change due, engine making noise)..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  value={newMaintenance.priority}
                  onChange={(e) => setNewMaintenance({...newMaintenance, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                onClick={handleSaveNewMaintenance}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Details Modal */}
      {showDetailsModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Maintenance Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status & Priority */}
            <div className="flex gap-3 mb-6">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedMaintenance.statusColor}`}>
                {selectedMaintenance.status}
              </span>
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedMaintenance.priorityColor}`}>
                {selectedMaintenance.priority.charAt(0).toUpperCase() + selectedMaintenance.priority.slice(1)} Priority
              </span>
            </div>

            {/* Maintenance Information */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Maintenance Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Request ID</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Vehicle</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.vehicleName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Plate Number</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.vehiclePlate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Requested By</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.requestedBy}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Request Date</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.requestDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Scheduled Date</span>
                  <p className="font-medium text-gray-900">{selectedMaintenance.scheduledDate}</p>
                </div>
                {selectedMaintenance.completedDate && (
                  <div>
                    <span className="text-sm text-gray-600">Completed Date</span>
                    <p className="font-medium text-gray-900">{selectedMaintenance.completedDate}</p>
                  </div>
                )}
                {selectedMaintenance.cost && (
                  <div>
                    <span className="text-sm text-gray-600">Cost</span>
                    <p className="font-medium text-emerald-600 text-lg">{selectedMaintenance.cost}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reason for Maintenance */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Reason for Maintenance</h4>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedMaintenance.description}</p>
            </div>

            {/* Notes */}
            {selectedMaintenance.notes && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedMaintenance.notes}</p>
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

      {/* Vehicle Maintenance History Modal */}
      {showHistoryModal && selectedVehicleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Maintenance History</h3>
                <p className="text-sm text-gray-600">
                  {vehicles.find(v => v.id === selectedVehicleId)?.name} ({vehicles.find(v => v.id === selectedVehicleId)?.plate})
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* History Timeline */}
            <div className="space-y-4">
              {getVehicleHistory(selectedVehicleId).length > 0 ? (
                getVehicleHistory(selectedVehicleId).map((record, index) => (
                  <div key={record.id} className="relative">
                    {/* Timeline Line */}
                    {index !== getVehicleHistory(selectedVehicleId).length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Timeline Dot */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.status === 'Completed' ? 'bg-emerald-100' :
                        record.status === 'In Progress' ? 'bg-blue-100' :
                        record.status === 'Scheduled' ? 'bg-yellow-100' :
                        record.status === 'Cancelled' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          record.status === 'Completed' ? 'text-emerald-600' :
                          record.status === 'In Progress' ? 'text-blue-600' :
                          record.status === 'Scheduled' ? 'text-yellow-600' :
                          record.status === 'Cancelled' ? 'text-red-600' :
                          'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {record.status === 'Completed' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          )}
                        </svg>
                      </div>

                      {/* Record Card */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{record.type}</h4>
                            <p className="text-sm text-gray-600">{record.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.statusColor}`}>
                              {record.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.priorityColor}`}>
                              {record.priority}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs font-semibold text-gray-600 uppercase">Reason for Maintenance:</span>
                          <p className="text-sm text-gray-900 mt-1">{record.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Requested:</span>
                            <p className="font-medium text-gray-900">{record.requestDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Scheduled:</span>
                            <p className="font-medium text-gray-900">{record.scheduledDate}</p>
                          </div>
                          {record.completedDate && (
                            <div>
                              <span className="text-gray-600">Completed:</span>
                              <p className="font-medium text-emerald-600">{record.completedDate}</p>
                            </div>
                          )}
                          {record.cost && (
                            <div>
                              <span className="text-gray-600">Cost:</span>
                              <p className="font-medium text-gray-900">{record.cost}</p>
                            </div>
                          )}
                        </div>

                        {record.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">Notes: {record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance History</h3>
                  <p className="text-gray-500">This vehicle has no maintenance records yet</p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {getVehicleHistory(selectedVehicleId).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{getVehicleHistory(selectedVehicleId).length}</p>
                    <p className="text-xs text-gray-600">Total Records</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {getVehicleHistory(selectedVehicleId).filter(r => r.status === 'Completed').length}
                    </p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {getVehicleHistory(selectedVehicleId).filter(r => r.status === 'In Progress').length}
                    </p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {getVehicleHistory(selectedVehicleId).filter(r => r.status === 'Scheduled' || r.status === 'Pending').length}
                    </p>
                    <p className="text-xs text-gray-600">Upcoming</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
