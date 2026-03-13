'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState({
    vehicleId: '',
    driverId: ''
  })

  // Sample approved requests waiting for assignment
  const [approvedRequests, setApprovedRequests] = useState([
    {
      id: 'REQ-2024-001',
      requestedBy: 'Dr. Sarah Ahmed',
      department: 'Computer Science',
      approvedBy: 'College Dean',
      approver: 'Dr. Michael Brown',
      purpose: 'Academic Conference - Addis Ababa',
      date: '2024-03-15',
      duration: '3 days',
      passengers: 4,
      timestamp: '2 hours ago',
      status: 'pending_assignment',
      isNew: true
    },
    {
      id: 'REQ-2024-002',
      requestedBy: 'Prof. John Smith',
      department: 'Engineering',
      approvedBy: 'President',
      approver: 'Dr. Elizabeth Wilson',
      purpose: 'Research Field Trip - Bahir Dar',
      date: '2024-03-18',
      duration: '5 days',
      passengers: 8,
      timestamp: '5 hours ago',
      status: 'pending_assignment',
      isNew: true
    },
    {
      id: 'REQ-2024-003',
      requestedBy: 'Dr. Ahmed Hassan',
      department: 'Medical School',
      approvedBy: 'College Dean',
      approver: 'Dr. Sarah Johnson',
      purpose: 'Medical Outreach Program',
      date: '2024-03-20',
      duration: '2 days',
      passengers: 6,
      timestamp: '1 day ago',
      status: 'pending_assignment',
      isNew: false
    }
  ])

  const unreadCount = approvedRequests.filter(req => req.isNew).length

  const availableVehicles = [
    { id: 'V-001', name: 'Toyota Land Cruiser', plate: 'AA-12345', capacity: '7 seats', type: 'SUV' },
    { id: 'V-002', name: 'Mercedes Sprinter', plate: 'AA-23456', capacity: '12 seats', type: 'Van' },
    { id: 'V-003', name: 'Toyota Hiace', plate: 'AA-34567', capacity: '14 seats', type: 'Van' },
    { id: 'V-004', name: 'Nissan Patrol', plate: 'AA-45678', capacity: '8 seats', type: 'SUV' }
  ]

  const availableDrivers = [
    { id: 'D-001', name: 'Ahmed Hassan', license: 'Class A', experience: '10 years' },
    { id: 'D-002', name: 'Bekele Girma', license: 'Class B', experience: '8 years' },
    { id: 'D-003', name: 'Mohammed Ali', license: 'Class A', experience: '12 years' },
    { id: 'D-004', name: 'Tadesse Girma', license: 'Class B', experience: '6 years' }
  ]

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      type: 'Maintenance Request',
      title: 'Maintenance Request',
      description: 'Unit #V-901 - Brake Inspection',
      icon: 'maintenance'
    },
    {
      id: 2,
      type: 'Driver Onboarding',
      title: 'New Driver Onboarding',
      description: 'Robert Vance - Class A CDL',
      icon: 'driver'
    }
  ])

  // Toast notification handler
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle View All Trips
  const handleViewAllTrips = () => {
    router.push('/trips')
  }

  // Handle Approval Actions
  const handleApprove = (approval: any) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== approval.id))
    showNotification(`${approval.type} approved successfully!`)
  }

  const handleViewDetails = (approval: any) => {
    setSelectedApproval(approval)
    setShowApprovalModal(true)
  }

  const handleOpenAssignment = (request: any) => {
    setSelectedRequest(request)
    setShowAssignmentModal(true)
  }

  const handleAssignVehicleDriver = () => {
    if (!assignmentData.vehicleId || !assignmentData.driverId) {
      alert('Please select both vehicle and driver')
      return
    }

    setApprovedRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'assigned', isNew: false }
          : req
      ).filter(req => req.status !== 'assigned')
    )

    setShowAssignmentModal(false)
    setSelectedRequest(null)
    setAssignmentData({ vehicleId: '', driverId: '' })

    alert(`Vehicle and driver assigned successfully for ${selectedRequest.id}`)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Approval Details Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedApproval.title}</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">{selectedApproval.description}</p>
              
              {selectedApproval.type === 'Maintenance Request' && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">Unit #V-901</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">Brake Inspection</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-medium">ETB 5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">High</span>
                  </div>
                </div>
              )}
              
              {selectedApproval.type === 'Driver Onboarding' && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver Name:</span>
                    <span className="font-medium">Robert Vance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License Type:</span>
                    <span className="font-medium">Class A CDL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">8 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Pending Review</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedApproval)
                  setShowApprovalModal(false)
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Fleet Overview</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time fleet monitoring and deployment management</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Fleet */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs md:text-sm text-gray-600">Total Fleet</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">124</h3>
            <span className="text-emerald-500 text-xs md:text-sm font-medium mb-1">↗5%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Since last month</p>
        </div>

        {/* Available */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs md:text-sm text-gray-600">Available</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">82</h3>
            <span className="text-gray-400 text-xs md:text-sm font-medium mb-1">→0%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ready for deployment</p>
        </div>

        {/* In Use */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs md:text-sm text-gray-600">In Use</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">32</h3>
            <span className="text-emerald-500 text-xs md:text-sm font-medium mb-1">↗8%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">On active missions</p>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs md:text-sm text-gray-600">Maintenance</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">10</h3>
            <span className="text-red-500 text-xs md:text-sm font-medium mb-1">↘1%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Out of service</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Fleet Utilization Chart */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-800">Fleet Utilization</h3>
              <p className="text-xs md:text-sm text-gray-500">Vehicle usage over time</p>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="space-y-4">
            {[
              { day: 'Mon', value: 85, color: 'bg-emerald-500' },
              { day: 'Tue', value: 72, color: 'bg-emerald-500' },
              { day: 'Wed', value: 90, color: 'bg-emerald-500' },
              { day: 'Thu', value: 68, color: 'bg-emerald-500' },
              { day: 'Fri', value: 95, color: 'bg-emerald-500' },
              { day: 'Sat', value: 45, color: 'bg-blue-400' },
              { day: 'Sun', value: 30, color: 'bg-blue-400' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-medium text-gray-600 w-10">{item.day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 md:h-8 overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full flex items-center justify-end pr-2 md:pr-3 transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  >
                    <span className="text-xs md:text-sm font-medium text-white">{item.value}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Status Distribution */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-800">Vehicle Status</h3>
              <p className="text-xs md:text-sm text-gray-500">Current fleet distribution</p>
            </div>
          </div>

          {/* Donut Chart Representation */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40 md:w-48 md:h-48">
              {/* Donut segments */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Available - 66% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="167 251"
                  strokeDashoffset="0"
                />
                {/* In Use - 26% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="65 251"
                  strokeDashoffset="-167"
                />
                {/* Maintenance - 8% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="20"
                  strokeDasharray="20 251"
                  strokeDashoffset="-232"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">124</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Available</span>
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900">82 (66%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">In Use</span>
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900">32 (26%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Maintenance</span>
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900">10 (8%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Active Trips */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Today's Active Trips</h2>
            <button 
              onClick={handleViewAllTrips}
              className="text-emerald-500 text-xs md:text-sm font-medium hover:text-emerald-600"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {/* Trip 1 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <span className="text-xs text-gray-500 sm:w-20">#TRP-4521</span>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm md:text-base">Marcus Miller</p>
                <p className="text-xs md:text-sm text-gray-500 truncate">Volvo Marci#116 Thorn (AB-1234)</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-2 md:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">ON ROUTE</span>
              </div>
              <div className="w-full sm:w-28">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% Complete</p>
              </div>
            </div>

            {/* Trip 2 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <span className="text-xs text-gray-500 sm:w-20">#TRP-4522</span>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm md:text-base">Sarah Miller</p>
                <p className="text-xs md:text-sm text-gray-500 truncate">Scania SarahR450 Miller (CD-5678)</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-2 md:px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">LOADING</span>
              </div>
              <div className="w-full sm:w-28">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 transition-all duration-500" style={{width: '25%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">25% Complete</p>
              </div>
            </div>

            {/* Trip 3 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <span className="text-xs text-gray-500 sm:w-20">#TRP-4523</span>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm md:text-base">James Wilson</p>
                <p className="text-xs md:text-sm text-gray-500 truncate">Tesla JamesSemi Wilson (EL-9900)</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-2 md:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">ON ROUTE</span>
              </div>
              <div className="w-full sm:w-28">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: '60%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">60% Complete</p>
              </div>
            </div>

            {/* Trip 4 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <span className="text-xs text-gray-500 sm:w-20">#TRP-4524</span>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm md:text-base">Emma Davis</p>
                <p className="text-xs md:text-sm text-gray-500 truncate">Mercedes Sprinter (FG-2468)</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">DEPARTING</span>
              </div>
              <div className="w-full sm:w-28">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{width: '10%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">10% Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>
            
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    approval.icon === 'maintenance' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {approval.icon === 'maintenance' ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{approval.title}</p>
                    <p className="text-xs text-gray-500">{approval.description}</p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleApprove(approval)}
                        className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded hover:bg-emerald-600"
                      >
                        APPROVE
                      </button>
                      <button 
                        onClick={() => handleViewDetails(approval)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200"
                      >
                        DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">3 NEW</span>
            </div>
            
            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Engine Overheat Alert</p>
                  <p className="text-xs text-gray-500">Vehicle #V-202 (LA-NY Route)</p>
                  <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Speeding Violation</p>
                  <p className="text-xs text-gray-500">Unit #V-404 - Driver: Mark R.</p>
                  <p className="text-xs text-gray-400 mt-1">15 mins ago</p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Geofence Entry</p>
                  <p className="text-xs text-gray-500">Warehouse B - Trip #TRP-4522</p>
                  <p className="text-xs text-gray-400 mt-1">45 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Operations Map */}
      <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">LIVE OPERATIONS</h2>
            <p className="text-sm text-gray-500">24 Active Units</p>
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-emerald-50"></div>
          <div className="relative z-10 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-gray-500 text-sm">Map View - Real-time Vehicle Tracking</p>
            <p className="text-gray-400 text-xs mt-1">Integration with GPS tracking system</p>
          </div>
        </div>
      </div>
    </div>
  )
}
