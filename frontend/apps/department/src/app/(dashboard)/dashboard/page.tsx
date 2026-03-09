'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'

export default function DashboardPage() {
  const [selectedMonth] = useState('October 2024')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmColor?: 'emerald' | 'red' | 'blue'
  } | null>(null)
  const itemsPerPage = 10
  
  // Form state
  const [formData, setFormData] = useState({
    purpose: '',
    from: 'Main Campus',
    to: '',
    departureDate: '',
    returnDate: '',
    departureTime: '',
    passengers: '1',
    vehicleType: '',
    priority: 'MEDIUM',
    description: '',
    requestorName: 'Dr. Ahmed Hassan',
    department: 'Department Head Office',
    email: 'department@hu.edu.et',
    phone: '+251 91 123 4567'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Trip request submitted:', formData)
    setShowRequestModal(false)
    setShowSuccessModal(true)
    // Reset form
    setTimeout(() => {
      setFormData({
        ...formData,
        purpose: '',
        to: '',
        departureDate: '',
        returnDate: '',
        departureTime: '',
        passengers: '1',
        vehicleType: '',
        priority: 'MEDIUM',
        description: ''
      })
    }, 500)
  }

  const handleQuickApprove = (id: number, name: string) => {
    setConfirmModal({
      show: true,
      title: 'Approve Trip Request',
      message: `Are you sure you want to approve the trip request from ${name}?`,
      confirmColor: 'emerald',
      onConfirm: () => {
        console.log('Quick approved:', id)
        ;(window as any).showToast?.('Trip request approved successfully!', 'success')
        setConfirmModal(null)
      }
    })
  }

  const handleQuickReject = (id: number, name: string) => {
    setConfirmModal({
      show: true,
      title: 'Reject Trip Request',
      message: `Are you sure you want to reject the trip request from ${name}? You can provide a detailed reason in the approvals page.`,
      confirmColor: 'red',
      onConfirm: () => {
        console.log('Quick rejected:', id)
        ;(window as any).showToast?.('Trip request rejected.', 'info')
        setConfirmModal(null)
      }
    })
  }

  const handleExportTrips = () => {
    console.log('Exporting trip history...')
    // Create CSV content
    const headers = ['Date', 'Route', 'Requested By', 'Fuel Consumption', 'Status']
    const csvContent = [
      headers.join(','),
      ...tripHistory.map(trip => 
        [trip.date, `"${trip.route}"`, trip.requestedBy, trip.fuel, trip.status].join(',')
      )
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const pendingApprovals = [
    { id: 1, name: 'Amanuel Tekle', role: 'Research', trip: 'Bishoftu - Oct 12-14', passengers: '4 Passengers • Toyota Hilux', priority: 'HIGH', priorityColor: 'bg-red-100 text-red-700' },
    { id: 2, name: 'Dr. Sara Ahmed', role: 'Faculty/Acad', trip: 'Harar - Oct 15-15', passengers: '15 Passengers • Coaster Bus', priority: 'MEDIUM', priorityColor: 'bg-orange-100 text-orange-700' },
    { id: 3, name: 'Kebede Jilo', role: 'Meeting', trip: 'Adama - Oct 18-17', passengers: '2 Passengers • Sedan', priority: 'LOW', priorityColor: 'bg-gray-100 text-gray-700' },
  ]

  const recentActivity = [
    { id: 1, title: 'Trip to Dire Dawa Approved', subtitle: 'Requested by Dr. Tadesse • 2 hours ago', color: 'bg-emerald-500' },
    { id: 2, title: 'Request Rejected: Incomplete Data', subtitle: 'Requested by Abdi M. • 3 hours ago', color: 'bg-red-500' },
    { id: 3, title: 'New Request Received', subtitle: 'From Prof. Martha G. • Yesterday', color: 'bg-emerald-500' },
  ]

  const fleetStatus = [
    { id: 1, name: 'Campus A Main', location: 'Campus / LOCATION', status: 'READY', statusColor: 'text-emerald-600', percentage: 85, vehicle: 'TOYOTA HILUX • HU-4-06541' },
    { id: 2, name: 'Central Garage', location: 'Garage / LOCATION', status: 'MAINTENANCE', statusColor: 'text-orange-600', percentage: 12, vehicle: 'COASTER BUS • HU-3-01122' },
    { id: 3, name: 'Main Admin Lot', location: 'Admin / LOCATION', status: 'READY', statusColor: 'text-emerald-600', percentage: 60, vehicle: 'HYUNDAI SEDAN • HU-1-06818' },
  ]

  const tripHistory = [
    { date: 'Oct 05, 2024', route: 'Main Campus → Harar', requestedBy: 'Dr. Belayneh W.', fuel: '14.5L', status: 'COMPLETED' },
    { date: 'Oct 04, 2024', route: 'Main Campus → Adama', requestedBy: 'Prof. Girma S.', fuel: '28.2L', status: 'COMPLETED' },
    { date: 'Oct 03, 2024', route: 'Main Campus → Addis Ababa', requestedBy: 'College Admin Team', fuel: '45.0L', status: 'COMPLETED' },
    { date: 'Oct 02, 2024', route: 'Main Campus → Dire Dawa', requestedBy: 'Dr. Sara M.', fuel: '32.1L', status: 'COMPLETED' },
    { date: 'Oct 01, 2024', route: 'Main Campus → Harar', requestedBy: 'Prof. Ahmed K.', fuel: '15.8L', status: 'COMPLETED' },
    { date: 'Sep 30, 2024', route: 'Main Campus → Bishoftu', requestedBy: 'Dr. Fatima H.', fuel: '12.3L', status: 'COMPLETED' },
    { date: 'Sep 29, 2024', route: 'Main Campus → Adama', requestedBy: 'Prof. Kebede J.', fuel: '26.7L', status: 'COMPLETED' },
    { date: 'Sep 28, 2024', route: 'Main Campus → Addis Ababa', requestedBy: 'Dr. Mohammed A.', fuel: '43.2L', status: 'COMPLETED' },
    { date: 'Sep 27, 2024', route: 'Main Campus → Harar', requestedBy: 'Prof. Amanuel T.', fuel: '16.4L', status: 'COMPLETED' },
    { date: 'Sep 26, 2024', route: 'Main Campus → Dire Dawa', requestedBy: 'Dr. Belayneh W.', fuel: '31.5L', status: 'COMPLETED' },
  ]

  // Filter trips based on search query
  const filteredTrips = tripHistory.filter(trip => 
    trip.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTrips = filteredTrips.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Semester II, 2024 | Last updated: Oct 12, 09:45 AM</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span className="text-lg">+</span>
          <span className="text-sm font-medium">New Special Request</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Monthly Utilization */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Monthly Utilization</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              {/* Chart Background */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex justify-between items-end h-32 md:h-48 gap-2 md:gap-3">
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '45%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">MAY</span>
                  </div>
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '60%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">JUN</span>
                  </div>
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '80%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">JUL</span>
                  </div>
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '100%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">AUG</span>
                  </div>
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '55%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">SEP</span>
                  </div>
                  <div className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="w-full bg-emerald-500 rounded-t shadow-sm" style={{ height: '70%' }}></div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">OCT</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center pt-3 md:pt-4 border-t border-gray-200">
              <div className="text-xs md:text-sm text-gray-500">Avg. Trips/Day</div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">2.4</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-2 md:gap-3">
                  <div className={`w-2 h-2 ${activity.color} rounded-full mt-1.5 md:mt-2 flex-shrink-0`}></div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm font-medium text-gray-900">{activity.title}</div>
                    <div className="text-[10px] md:text-xs text-gray-500">{activity.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Fleet Status</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {fleetStatus.map((fleet) => (
                <div key={fleet.id} className="border-b border-gray-100 pb-3 md:pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{fleet.vehicle}</div>
                      <div className="text-[10px] md:text-xs text-gray-500 truncate">{fleet.location}</div>
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium ${fleet.statusColor} whitespace-nowrap`}>{fleet.status}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div 
                        className={`h-1.5 md:h-2 rounded-full ${fleet.status === 'READY' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                        style={{ width: `${fleet.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-gray-600 whitespace-nowrap">{fleet.percentage}%</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-1">{fleet.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Trip History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Department Trip History</h2>
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none w-full"
              />
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={handleExportTrips}
              className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">ROUTE</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">REQUESTED BY</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">FUEL</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTrips.length > 0 ? (
                currentTrips.map((trip, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{trip.date}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{trip.route}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{trip.requestedBy}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{trip.fuel}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-sm text-gray-500">
                    No trips found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 md:p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs md:text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTrips.length)} of {filteredTrips.length} results
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 md:px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 md:px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Trip Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowRequestModal(false)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-3 md:p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Request Trip</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmitRequest} className="p-4 md:p-6">
                <div className="space-y-4 md:space-y-6">
                  {/* Requestor Information (Read-only) */}
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Requestor Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg">
                      <div>
                        <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Full Name</label>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{formData.requestorName}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Department</label>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{formData.department}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Email</label>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Phone</label>
                        <p className="text-xs md:text-sm font-medium text-gray-900">{formData.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Trip Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="purpose" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Purpose of Trip <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleInputChange}
                          placeholder="e.g., Academic Conference, Research Visit, Administrative Meeting"
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="from" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          From <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="from"
                          name="from"
                          value={formData.from}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="to" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          To (Destination) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="to"
                          name="to"
                          value={formData.to}
                          onChange={handleInputChange}
                          placeholder="e.g., Addis Ababa, Dire Dawa"
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="departureDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Departure Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="departureDate"
                          name="departureDate"
                          value={formData.departureDate}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="departureTime" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Departure Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="departureTime"
                          name="departureTime"
                          value={formData.departureTime}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="returnDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Return Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="returnDate"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="passengers" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Number of Passengers <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="passengers"
                          name="passengers"
                          value={formData.passengers}
                          onChange={handleInputChange}
                          min="1"
                          max="50"
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="vehicleType" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Preferred Vehicle Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="vehicleType"
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                          <option value="Toyota Hilux">Toyota Hilux</option>
                          <option value="Coaster Bus">Coaster Bus</option>
                          <option value="Minibus">Minibus</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Priority Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs md:text-sm"
                          required
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                          Additional Details
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Provide any additional information about the trip..."
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-xs md:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 mt-6 pt-4 md:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="w-full sm:flex-1 px-4 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 md:py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-3 md:p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-3">
              <div className="p-4 md:p-6">
                {/* Success Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                  Your trip request has been submitted and will be processed by the fleet management team. You will receive a notification once it's reviewed.
                </p>

                {/* Action */}
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-4 py-2.5 md:py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm md:text-base"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal?.show && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmColor={confirmModal.confirmColor}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
