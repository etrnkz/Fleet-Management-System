'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

// TypeScript interfaces
interface Trip {
  id: string
  requestNumber: string
  requester: { name: string; email: string }
  tripType: string
  purpose: string
  destination: string
  startDateTime: string
  endDateTime: string
  passengerCount: number
  state: string
  allocatedVehicle?: { id: string; plateNumber: string; make: string; model: string }
  allocatedDriver?: { id: string; user: { name: string }; licenseNumber: string }
  estimatedDistance?: number
  estimatedFuelCost?: number
  createdAt: string
  updatedAt: string
}

export default function ApprovalsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [fuelApproved, setFuelApproved] = useState(false)
  const [comments, setComments] = useState('')
  const [fuelConfirmForm, setFuelConfirmForm] = useState({
    estimatedFuelCost: '',
    estimatedDistance: '',
  })
  const [processingTrip, setProcessingTrip] = useState<string | null>(null)

  // Fetch pending approvals on mount
  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      // Filter only CAR_ALLOCATED trips that need transport approval
      const pendingTrips = Array.isArray(data) 
        ? data.filter((trip: Trip) => trip.state === 'CAR_ALLOCATED')
        : []
      setTrips(pendingTrips)
      if (pendingTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(pendingTrips[0])
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch pending approvals', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTransport = async () => {
    if (!selectedTrip || !fuelApproved) return

    const parseOpt = (s: string): number | undefined => {
      const t = s.trim()
      if (t === '') return undefined
      const n = Number(t)
      return Number.isFinite(n) && n >= 0 ? n : undefined
    }
    const fuel = parseOpt(fuelConfirmForm.estimatedFuelCost)
    const dist = parseOpt(fuelConfirmForm.estimatedDistance)

    try {
      setProcessingTrip(selectedTrip.id)
      await tripApi.confirmTransport(selectedTrip.id, {
        fuelApproved,
        comments: comments.trim() || undefined,
        ...(fuel !== undefined && { estimatedFuelCost: fuel }),
        ...(dist !== undefined && { estimatedDistance: dist }),
      })

      setToast({ message: 'Transport approved successfully', type: 'success' })
      setShowApprovalModal(false)
      setFuelApproved(false)
      setComments('')
      setFuelConfirmForm({ estimatedFuelCost: '', estimatedDistance: '' })
      await fetchPendingApprovals()
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to approve transport', type: 'error' })
    } finally {
      setProcessingTrip(null)
    }
  }

  const handleRejectTransport = async () => {
    if (!selectedTrip || !rejectionReason.trim()) return

    try {
      setProcessingTrip(selectedTrip.id)
      await tripApi.rejectTransport(selectedTrip.id, {
        reason: rejectionReason.trim()
      })
      
      setToast({ message: 'Transport rejected successfully', type: 'success' })
      setShowRejectionModal(false)
      setRejectionReason('')
      await fetchPendingApprovals()
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to reject transport', type: 'error' })
    } finally {
      setProcessingTrip(null)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Transport Approvals</h2>
            <p className="text-gray-600 mt-1">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} awaiting your approval
            </p>
          </div>
          <button
            onClick={fetchPendingApprovals}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All allocated trips have been processed.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Panel - Trip List */}
          <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
              <h3 className="text-lg font-bold text-gray-900">Awaiting Approval</h3>
              <p className="text-sm text-gray-500">{trips.length} trips</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                    selectedTrip?.id === trip.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">#{trip.requestNumber}</span>
                      <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Awaiting Approval
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{trip.requester.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {trip.allocatedVehicle?.plateNumber} • {trip.allocatedDriver?.user?.name || 'Driver'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="truncate">{trip.destination}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(trip.startDateTime)}
                    </span>
                    {trip.estimatedDistance && (
                      <span className="text-xs font-semibold text-emerald-600">
                        {trip.estimatedDistance} km
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Trip Details */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {selectedTrip ? (
              <>
                {/* Trip Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Trip #{selectedTrip.requestNumber}
                      </h3>
                      <p className="text-gray-500">
                        Requested by {selectedTrip.requester.name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      Awaiting Transport Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trip Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Trip Details</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedTrip.tripType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Passengers:</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedTrip.passengerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Destination:</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedTrip.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Start:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDateTime(selectedTrip.startDateTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">End:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDateTime(selectedTrip.endDateTime)}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Purpose</p>
                        <p className="text-sm text-gray-900">{selectedTrip.purpose}</p>
                      </div>
                    </div>

                    {/* Allocation Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Allocation Details</h4>
                      
                      {selectedTrip.allocatedVehicle && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-900">
                                {selectedTrip.allocatedVehicle.plateNumber}
                              </p>
                              <p className="text-xs text-blue-700">
                                {selectedTrip.allocatedVehicle.make} {selectedTrip.allocatedVehicle.model}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedTrip.allocatedDriver && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {selectedTrip.allocatedDriver?.user?.name ? 
                                selectedTrip.allocatedDriver.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 
                                'DR'
                              }
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-emerald-900">
                                {selectedTrip.allocatedDriver?.user?.name || 'Driver Name'}
                              </p>
                              <p className="text-xs text-emerald-700">
                                License: {selectedTrip.allocatedDriver?.licenseNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedTrip.estimatedDistance != null ||
                        selectedTrip.estimatedFuelCost != null) && (
                        <div className="space-y-2">
                          {selectedTrip.estimatedDistance != null && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Est. Distance:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {selectedTrip.estimatedDistance} km
                              </span>
                            </div>
                          )}
                          {selectedTrip.estimatedFuelCost != null && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Est. Fuel Cost:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ETB {selectedTrip.estimatedFuelCost}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFuelConfirmForm({
                          estimatedFuelCost:
                            selectedTrip.estimatedFuelCost != null
                              ? String(selectedTrip.estimatedFuelCost)
                              : '',
                          estimatedDistance:
                            selectedTrip.estimatedDistance != null
                              ? String(selectedTrip.estimatedDistance)
                              : '',
                        })
                        setFuelApproved(false)
                        setComments('')
                        setShowApprovalModal(true)
                      }}
                      disabled={processingTrip === selectedTrip.id}
                      className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingTrip === selectedTrip.id ? 'Processing...' : 'Approve Transport'}
                    </button>
                    <button
                      onClick={() => setShowRejectionModal(true)}
                      disabled={processingTrip === selectedTrip.id}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject & Reassign
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Select a trip to review details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Approve Transport</h3>
                  <p className="text-sm text-gray-500">Trip #{selectedTrip?.requestNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="fuelApproved"
                    checked={fuelApproved}
                    onChange={(e) => setFuelApproved(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="fuelApproved" className="text-sm font-medium text-emerald-900">
                    Fuel allocation approved and ready for dispatch
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Est. fuel (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={fuelConfirmForm.estimatedFuelCost}
                      onChange={(e) =>
                        setFuelConfirmForm((f) => ({
                          ...f,
                          estimatedFuelCost: e.target.value,
                        }))
                      }
                      placeholder="From deployment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep deployment value</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Est. distance (km)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={fuelConfirmForm.estimatedDistance}
                      onChange={(e) =>
                        setFuelConfirmForm((f) => ({
                          ...f,
                          estimatedDistance: e.target.value,
                        }))
                      }
                      placeholder="From deployment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep deployment value</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments about the approval..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setFuelApproved(false)
                    setComments('')
                    setFuelConfirmForm({ estimatedFuelCost: '', estimatedDistance: '' })
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveTransport}
                  disabled={!fuelApproved || processingTrip === selectedTrip?.id}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingTrip === selectedTrip?.id ? 'Processing...' : 'Approve Transport'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Transport</h3>
                  <p className="text-sm text-gray-500">Trip #{selectedTrip?.requestNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejecting this transport allocation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Rejecting will reset the allocation and send the trip back to the deployment team for reassignment with a different vehicle or driver.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectionModal(false)
                    setRejectionReason('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectTransport}
                  disabled={!rejectionReason.trim() || processingTrip === selectedTrip?.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingTrip === selectedTrip?.id ? 'Processing...' : 'Reject & Reassign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}