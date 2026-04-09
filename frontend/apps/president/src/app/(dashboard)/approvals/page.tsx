'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'

export default function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [approvalRequests, setApprovalRequests] = useState<any[]>([])
  const [approvedRequests, setApprovedRequests] = useState<any[]>([])
  const [rejectedRequests, setRejectedRequests] = useState<any[]>([])

  useEffect(() => {
    loadApprovalsData()
  }, [])

  const loadApprovalsData = async () => {
    try {
      setLoading(true)
      
      // Load all trips and filter client-side by status
      const allTrips = await tripApi.getAll().catch(() => [])

      const pendingStatuses = ['pending_president', 'PENDING_PRESIDENT']
      const approvedStatuses = ['approved_for_allocation', 'APPROVED_FOR_ALLOCATION', 'approved', 'APPROVED', 'completed', 'COMPLETED', 'in_progress', 'IN_PROGRESS']
      const rejectedStatuses = ['rejected', 'REJECTED']

      const pendingTrips = allTrips.filter((t: any) => pendingStatuses.includes(t.status || t.state || ''))
      const approvedTrips = allTrips.filter((t: any) => approvedStatuses.includes(t.status || t.state || ''))
      const rejectedTrips = allTrips.filter((t: any) => rejectedStatuses.includes(t.status || t.state || ''))

      // Transform pending trips to approval requests format
      const transformedPending = pendingTrips.map((trip: any) => ({
        id: trip.id,
        type: trip.purpose?.includes('International') ? 'International Trip' : 
              trip.purpose?.includes('Research') ? 'Research Trip' :
              trip.purpose?.includes('VIP') ? 'VIP Transport' :
              trip.purpose?.includes('Emergency') ? 'Medical Emergency' : 'Academic Trip',
        department: trip.requester?.department?.name || trip.requester?.college?.name || 'Unknown Department',
        requester: {
          name: trip.requester ? (trip.requester.name || `${trip.requester.firstName || ''} ${trip.requester.lastName || ''}`.trim() || 'Unknown') : 'Unknown',
          position: trip.requester?.role || 'Staff',
          email: trip.requester?.email || 'N/A',
          phone: trip.requester?.phone || 'N/A'
        },
        purpose: trip.purpose || 'Official business',
        destination: trip.destination || 'N/A',
        tripDates: {
          start: trip.startDateTime ? new Date(trip.startDateTime).toISOString().split('T')[0] : 'N/A',
          end: trip.endDateTime ? new Date(trip.endDateTime).toISOString().split('T')[0] : 'N/A'
        },
        duration: trip.startDateTime && trip.endDateTime ? 
          `${Math.ceil((new Date(trip.endDateTime).getTime() - new Date(trip.startDateTime).getTime()) / (1000 * 60 * 60 * 24))} days` : 'N/A',
        vehicleType: trip.allocatedVehicle ? `${trip.allocatedVehicle.make} ${trip.allocatedVehicle.model}` : 'To be assigned',
        passengers: trip.passengerCount || 1,
        estimatedCost: trip.estimatedFuelCost ? `ETB ${Number(trip.estimatedFuelCost).toLocaleString()}` : 'N/A',
        budgetStatus: 'Available',
        deanApproval: {
          status: trip.state?.includes('COLLEGE') ? 'Approved' : 'Pending',
          date: trip.updatedAt ? new Date(trip.updatedAt).toISOString().split('T')[0] : 'N/A',
          comments: 'Approved by college dean'
        },
        priority: trip.purpose?.toLowerCase().includes('emergency') ? 'urgent' :
                 trip.purpose?.toLowerCase().includes('international') ? 'high' : 'normal',
        status: 'pending',
        submittedDate: trip.createdAt ? new Date(trip.createdAt).toISOString().split('T')[0] : 'N/A',
        documents: ['Trip Request.pdf']
      }))

      // Transform approved trips
      const transformedApproved = approvedTrips.map((trip: any) => ({
        id: trip.id,
        type: trip.purpose?.includes('Research') ? 'Research Trip' : 'Academic Trip',
        department: trip.requester?.department?.name || trip.requester?.college?.name || 'Unknown Department',
        requester: { 
          name: trip.requester ? (trip.requester.name || `${trip.requester.firstName || ''} ${trip.requester.lastName || ''}`.trim() || 'Unknown') : 'Unknown',
          position: trip.requester?.role || 'Staff'
        },
        purpose: trip.purpose || 'Official business',
        destination: trip.destination || 'N/A',
        status: 'approved',
        approvedDate: trip.updatedAt ? new Date(trip.updatedAt).toISOString().split('T')[0] : 'N/A',
        approvedBy: 'President',
        priority: 'normal'
      }))

      // Transform rejected trips
      const transformedRejected = rejectedTrips.map((trip: any) => ({
        id: trip.id,
        type: 'Trip Request',
        department: trip.requester?.department?.name || trip.requester?.college?.name || 'Unknown Department',
        requester: { 
          name: trip.requester ? (trip.requester.name || `${trip.requester.firstName || ''} ${trip.requester.lastName || ''}`.trim() || 'Unknown') : 'Unknown',
          position: trip.requester?.role || 'Staff'
        },
        purpose: trip.purpose || 'Official business',
        destination: trip.destination || 'N/A',
        status: 'rejected',
        rejectedDate: trip.updatedAt ? new Date(trip.updatedAt).toISOString().split('T')[0] : 'N/A',
        rejectedBy: 'President',
        reason: trip.rejectionReason || 'Not approved',
        priority: 'normal'
      }))

      setApprovalRequests(transformedPending)
      setApprovedRequests(transformedApproved)
      setRejectedRequests(transformedRejected)
    } catch (error) {
      console.error('Failed to load approvals data:', error)
      setApprovalRequests([])
      setApprovedRequests([])
      setRejectedRequests([])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
    return null
  }

  const handleApprove = async (request: any) => {
    try {
      await tripApi.approve(request.id)
      setToastMessage(`Request ${request.id} approved successfully`)
      setShowSuccessToast(true)
      setShowDetailModal(false)
      setTimeout(() => setShowSuccessToast(false), 3000)
      // Small delay to ensure backend has processed the approval
      await new Promise(resolve => setTimeout(resolve, 500))
      loadApprovalsData() // Reload data
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to approve request')
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  const handleReject = async () => {
    if (selectedRequest && rejectReason.trim()) {
      try {
        await tripApi.reject(selectedRequest.id, rejectReason)
        setToastMessage(`Request ${selectedRequest.id} rejected`)
        setShowSuccessToast(true)
        setShowRejectModal(false)
        setShowDetailModal(false)
        setRejectReason('')
        setTimeout(() => setShowSuccessToast(false), 3000)
        loadApprovalsData() // Reload data
      } catch (error: any) {
        setToastMessage(error.message || 'Failed to reject request')
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      }
    }
  }

  const filteredRequests = approvalRequests.filter(req => {
    if (filterDepartment !== 'all' && req.department !== filterDepartment) return false
    if (filterPriority !== 'all' && req.priority !== filterPriority) return false
    return true
  })

  const stats = {
    pending: approvalRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
    urgent: approvalRequests.filter(r => r.priority === 'urgent').length
  }

  const currentRequests = selectedTab === 'pending' ? filteredRequests :
                         selectedTab === 'approved' ? approvedRequests :
                         rejectedRequests

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Approval Management</h1>
          <p className="text-gray-600 mt-1">Review and manage fleet request approvals</p>
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
        <h1 className="text-3xl font-bold text-gray-800">Approval Management</h1>
        <p className="text-gray-600 mt-1">Review and manage fleet request approvals</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs md:text-sm text-gray-500">Pending</p>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs md:text-sm text-gray-500">Approved</p>
            <div className="w-2 h-2 bg-[#1B3D2F] rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs md:text-sm text-gray-500">Rejected</p>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs md:text-sm text-gray-500">Urgent</p>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              selectedTab === 'pending'
                ? 'bg-[#1B3D2F] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">Pending </span>({stats.pending})
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              selectedTab === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">Approved </span>({stats.approved})
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              selectedTab === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="hidden sm:inline">Rejected </span>({stats.rejected})
          </button>
        </div>

        {/* Filters - Only show for pending */}
        {selectedTab === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm"
            >
              <option value="all">All Departments</option>
              <option value="College of Engineering">Engineering</option>
              <option value="College of Natural Sciences">Natural Sciences</option>
              <option value="College of Business">Business</option>
              <option value="College of Medicine">Medicine</option>
              <option value="Office of the President">President Office</option>
              <option value="University Health Center">Health Center</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {currentRequests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No {selectedTab} requests found</p>
          </div>
        ) : (
          currentRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer border-l-4 hover:scale-[1.01] duration-300"
            style={{
              borderLeftColor: 
                request.priority === 'urgent' ? '#ef4444' :
                request.priority === 'high' ? '#f97316' : '#3b82f6'
            }}
            onClick={() => {
              setSelectedRequest(request)
              setShowDetailModal(true)
            }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-3 md:p-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    request.priority === 'urgent' ? 'bg-red-100' :
                    request.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    {request.priority === 'urgent' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : request.priority === 'high' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 truncate">{request.id}</h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{request.type}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getPriorityColor(request.priority)}`}>
                    {(request.priority || 'normal').toUpperCase()}
                  </span>
                  {selectedTab === 'approved' && (
                    <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-200 whitespace-nowrap">
                      ✓ APPROVED
                    </span>
                  )}
                  {selectedTab === 'rejected' && (
                    <span className="px-2 md:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border-2 border-red-200 whitespace-nowrap">
                      ✗ REJECTED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 md:p-6">
              {/* Purpose */}
              <div className="mb-4 p-3 md:p-4 bg-[#1B3D2F]/10 rounded-lg border-l-4 border-[#1B3D2F]">
                <p className="text-xs md:text-sm font-semibold text-[#1B3D2F] mb-1">Purpose</p>
                <p className="text-sm md:text-base text-gray-800 font-medium line-clamp-2">{request.purpose}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Department</p>
                    <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{request.department}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Requester</p>
                    <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{request.requester.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Destination</p>
                    <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{request.destination}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Submitted</p>
                    <p className="text-xs md:text-sm font-bold text-gray-800">{request.submittedDate}</p>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs md:text-sm">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{request.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-600">{request.passengers}</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600 font-semibold">{request.estimatedCost}</span>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-3 md:px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium text-xs md:text-sm whitespace-nowrap">
                  View Details →
                </button>
              </div>
              {/* Quick Actions for pending */}
              {selectedTab === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(request) }}
                    className="flex-1 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] font-medium text-sm transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setShowRejectModal(true) }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1B3D2F] to-green-600 p-4 md:p-6 text-white">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 truncate">{selectedRequest.id}</h3>
                  <p className="text-sm md:text-lg opacity-90 truncate">{selectedRequest.type}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-180px)] md:max-h-[calc(90vh-200px)] space-y-4 md:space-y-6">
              {/* Requester Information */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Requester Information</h4>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Name</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.requester.name}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Position</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.requester.position}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Email</p>
                    <p className="text-sm md:text-base font-medium text-gray-800 break-all">{selectedRequest.requester.email}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Phone</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.requester.phone}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Trip Details</h4>
                <div className="bg-[#1B3D2F]/10 rounded-xl p-3 md:p-4 border-l-4 border-[#1B3D2F] space-y-3">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Purpose</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.purpose}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Destination</p>
                      <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.destination}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Duration</p>
                      <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.duration || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Start Date</p>
                      <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.tripDates?.start || selectedRequest.startDateTime ? new Date(selectedRequest.startDateTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">End Date</p>
                      <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.tripDates?.end || selectedRequest.endDateTime ? new Date(selectedRequest.endDateTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Cost */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Vehicle & Cost Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-gray-600">Vehicle Type</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.vehicleType || "To be assigned"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-gray-600">Passengers</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.passengers || selectedRequest.passengerCount || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-sm md:text-base font-medium text-gray-800">{selectedRequest.estimatedFuelCost ? `ETB ${selectedRequest.estimatedFuelCost}` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-gray-600">Trip Status</p>
                    <p className="text-sm md:text-base font-medium text-green-600">{selectedRequest.state}</p>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Approval History</h4>
                <div className="space-y-3">
                  {(selectedRequest.approvals || []).map((approval: any, idx: number) => (
                    <div key={idx} className={`rounded-xl p-3 md:p-4 border-l-4 ${
                      approval.status === 'Approved' ? 'bg-green-50 border-green-500' :
                      approval.status === 'Rejected' ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-600">Level</p><p className="text-sm font-medium text-gray-800">{approval.approvalLevel}</p></div>
                        <div><p className="text-xs text-gray-600">Status</p><p className="text-sm font-medium text-gray-800">{approval.status}</p></div>
                        {approval.comments && <div className="col-span-2"><p className="text-xs text-gray-600">Comments</p><p className="text-sm font-medium text-gray-800">{approval.comments}</p></div>}
                        {approval.approvedAt && <div><p className="text-xs text-gray-600">Date</p><p className="text-sm font-medium text-gray-800">{new Date(approval.approvedAt).toLocaleDateString()}</p></div>}
                      </div>
                    </div>
                  ))}
                  {(!selectedRequest.approvals || selectedRequest.approvals.length === 0) && (
                    <p className="text-sm text-gray-400">No approval history yet</p>
                  )}
                </div>
              </div>

              {/* Documents - only show if real data exists */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Supporting Documents</h4>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium text-gray-800 truncate">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedTab === 'pending' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowRejectModal(true)
                  }}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all text-sm md:text-base"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-[#1B3D2F] to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium text-sm md:text-base"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Reject Request</h3>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Please provide a reason for rejecting request {selectedRequest.id}</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm md:text-base"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="bg-gray-50 border-t border-gray-200 p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="w-full sm:w-auto px-4 md:px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="w-full sm:w-auto px-4 md:px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-md">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-3 md:p-4 flex items-start space-x-2 md:space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900">Success</h4>
              <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
