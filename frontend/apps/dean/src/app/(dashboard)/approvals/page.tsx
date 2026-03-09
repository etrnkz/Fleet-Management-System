'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { tripApi, getCurrentUser } from '@/lib/api'

export default function ApprovalsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
  }

  // Map trip states to status for filtering
  const getStatusFromState = (state: string) => {
    if (state?.includes('PENDING')) return 'pending'
    if (state === 'APPROVED' || state === 'CAR_ALLOCATED' || state === 'READY' || state === 'IN_PROGRESS' || state === 'COMPLETED') return 'approved'
    if (state === 'REJECTED' || state === 'CANCELLED') return 'rejected'
    return 'pending'
  }

  const filteredRequests = requests.filter(r => getStatusFromState(r.state) === activeFilter)

  const stats = {
    pending: requests.filter(r => getStatusFromState(r.state) === 'pending').length,
    approved: requests.filter(r => getStatusFromState(r.state) === 'approved').length,
    rejected: requests.filter(r => getStatusFromState(r.state) === 'rejected').length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-700'
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-700'
      case 'LOW':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await tripApi.approve(id)
      showToast('Trip request approved successfully!', 'success')
      setShowApproveModal(false)
      setSelectedRequest(null)
      loadRequests()
    } catch (error: any) {
      showToast(error.message || 'Failed to approve request', 'error')
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      return
    }
    
    try {
      await tripApi.reject(id, rejectionReason)
      showToast('Trip request rejected', 'info')
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedRequest(null)
      loadRequests()
    } catch (error: any) {
      showToast(error.message || 'Failed to reject request', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Trip Approvals</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Review and manage trip requests from faculty and staff</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-gray-500">Pending Requests</span>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-500 rounded-full"></div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats.pending}</div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-gray-500">Approved</span>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full"></div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.approved}</div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-gray-500">Rejected</span>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'approved'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Request Header */}
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{request.requester?.name || 'N/A'}</h3>
                  <p className="text-xs md:text-sm text-gray-500 truncate">{request.requester?.department || 'N/A'}</p>
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap ${getPriorityColor(request.priority || 'MEDIUM')}`}>
                  {request.priority || 'MEDIUM'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="truncate">{request.purpose}</span>
              </div>
            </div>

            {/* Request Details */}
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {/* Route */}
              <div className="flex items-start gap-2 md:gap-3">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-900">Route</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Main Campus → {request.destination}</p>
                </div>
              </div>

              {/* Travel Dates */}
              <div className="flex items-start gap-2 md:gap-3">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-900">Travel Dates</p>
                  <p className="text-xs md:text-sm text-gray-600">{new Date(request.startDateTime).toLocaleDateString()}</p>
                  <p className="text-[10px] md:text-xs text-gray-500">Return: {new Date(request.endDateTime).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Passengers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-[10px] md:text-xs text-gray-600">{request.passengerCount} Pax</span>
                </div>
              </div>

              {/* Request Date */}
              <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 pt-3 border-t border-gray-200">
                <span>Requested</span>
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Rejection Reason (if rejected) */}
              {request.state === 'REJECTED' && request.rejectionReason && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Reason:</span> {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 md:px-6 pb-4 md:pb-6">
              <button
                onClick={() => setSelectedRequest(request)}
                className="w-full px-4 py-2 md:py-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-xs md:text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm md:text-base text-gray-500">No {activeFilter} requests found</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSelectedRequest(null)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-3 md:p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Trip Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Requestor Info */}
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2 md:mb-3">Requestor Information</h3>
                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Name</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Department</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Email</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900 break-all">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Phone</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2 md:mb-3">Trip Details</h3>
                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Purpose</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Priority</p>
                      <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">From</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.from}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">To</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.to}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Departure Date & Time</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.departureDate} at {selectedRequest.departureTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Return Date</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.returnDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Number of Passengers</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.passengers}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500">Vehicle Type</p>
                      <p className="text-xs md:text-sm font-medium text-gray-900">{selectedRequest.vehicleType}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-xs md:text-sm text-gray-700">{selectedRequest.description}</p>
                </div>

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowApproveModal(true)}
                      className="w-full sm:flex-1 px-4 py-2.5 md:py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Request
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="w-full sm:flex-1 px-4 py-2.5 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowApproveModal(false)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-3 md:p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-3">
              <div className="p-4 md:p-6">
                {/* Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-2">
                  Approve Trip Request?
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                  Are you sure you want to approve the trip request from <span className="font-medium">{selectedRequest.requestedBy}</span> to <span className="font-medium">{selectedRequest.to}</span>?
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="w-full sm:flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm md:text-base"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setShowRejectModal(false)
              setRejectionReason('')
            }}
          ></div>

          <div className="flex min-h-full items-center justify-center p-3 md:p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-3">
              <div className="p-4 md:p-6">
                {/* Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-2">
                  Reject Trip Request
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                  Please provide a reason for rejecting the trip request from <span className="font-medium">{selectedRequest.requestedBy}</span>.
                </p>

                {/* Reason Input */}
                <div className="mb-4 md:mb-6">
                  <label htmlFor="rejectionReason" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-sm md:text-base"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectionReason('')
                    }}
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={!rejectionReason.trim()}
                    className="w-full sm:flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
