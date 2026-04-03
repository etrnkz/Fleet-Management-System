'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, getCurrentUser } from '../../lib/api'
import Toast from '../../components/Toast'
import { EmployeeShell } from '../../components/EmployeeShell'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [tripDetailLoading, setTripDetailLoading] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      setTrips(Array.isArray(data) ? data : [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load trips', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  const openTripDetails = async (trip: any) => {
    setSelectedTrip(trip)
    setTripDetailLoading(true)
    try {
      const full = await tripApi.getById(trip.id)
      setSelectedTrip(full)
    } catch (error: any) {
      showToast(error.message || 'Failed to load trip details', 'error')
      setSelectedTrip(null)
    } finally {
      setTripDetailLoading(false)
    }
  }

  const allocatedVehicle = (t: any) => t?.allocatedVehicle ?? t?.vehicle ?? null
  const allocatedDriver = (t: any) => t?.allocatedDriver ?? t?.driver ?? null
  const driverDisplayName = (d: any) => {
    if (!d) return ''
    return d.user?.name ?? d.name ?? '—'
  }

  const formatMoney = (n: unknown) => {
    if (n == null || n === '') return '—'
    const num = typeof n === 'string' ? parseFloat(n) : Number(n)
    if (Number.isNaN(num)) return String(n)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatNum = (n: unknown) => {
    if (n == null || n === '') return '—'
    const num = typeof n === 'string' ? parseFloat(n) : Number(n)
    if (Number.isNaN(num)) return String(n)
    return String(num)
  }

  const terminalStates = new Set([
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'AUTO_REJECTED_TIMEOUT',
  ])

  const canCancelTrip = (state: string | undefined) =>
    Boolean(
      state &&
        !terminalStates.has(state) &&
        state !== 'IN_PROGRESS',
    )

  const canDeleteDraft = (state: string | undefined) => state === 'DRAFT'

  const handleCancelTrip = async (id: string) => {
    if (!confirm('Cancel this trip? It will be marked as cancelled and removed from the active workflow.')) return

    try {
      setActionLoading(true)
      await tripApi.cancel(id)
      showToast('Trip cancelled successfully', 'success')
      loadTrips()
      setSelectedTrip(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel trip', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDraft = async (id: string) => {
    if (
      !confirm(
        'Delete this draft permanently? This cannot be undone. (Submitted trips must be cancelled instead.)',
      )
    )
      return

    try {
      setActionLoading(true)
      await tripApi.deleteDraft(id)
      showToast('Draft deleted', 'success')
      loadTrips()
      setSelectedTrip(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete trip', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const getStateColor = (state: string) => {
    if (state === 'DRAFT') return 'bg-slate-100 text-slate-800'
    if (state?.includes('PENDING')) return 'bg-yellow-100 text-yellow-700'
    if (
      state === 'APPROVED_FOR_ALLOCATION' ||
      state === 'CAR_ALLOCATED' ||
      state === 'READY' ||
      state === 'PENDING_TRANSPORT_CONFIRM'
    )
      return 'bg-green-100 text-green-700'
    if (state === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700'
    if (state === 'COMPLETED') return 'bg-gray-100 text-gray-700'
    if (state === 'CANCELLED' || state === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    if (filter === 'pending') return trip.state?.includes('PENDING')
    if (filter === 'approved')
      return [
        'APPROVED_FOR_ALLOCATION',
        'CAR_ALLOCATED',
        'READY',
        'PENDING_TRANSPORT_CONFIRM',
      ].includes(trip.state)
    if (filter === 'active') return trip.state === 'IN_PROGRESS'
    if (filter === 'completed') return trip.state === 'COMPLETED'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B365D] border-t-transparent" />
      </div>
    )
  }

  return (
    <EmployeeShell
      title="My Trips"
      subtitle="Official university travel request registry and tracking."
      headerActions={
        <button
          type="button"
          onClick={() => router.push('/dashboard?section=request')}
          className="px-4 py-2.5 bg-[#1B365D] text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#152a47] transition-colors shadow-sm"
        >
          New Request
        </button>
      }
    >
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Trips' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                  filter === f.id
                    ? 'bg-[#1B365D] text-white'
                    : 'bg-[#eceef0] text-[#424845] hover:bg-[#e0e3e5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trips List */}
        <div className="bg-white rounded-xl border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)] overflow-hidden">
          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-[#424845]">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#c1c8c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium">No trips found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f4f6] border-b border-[#e0e3e5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-[#424845] uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-[#424845] uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-[#424845] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-[#424845] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-[#424845] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e5]">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-[#F8F9FA]/80">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#1B365D]">{trip.destination}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#424845]">{trip.purpose}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#424845]">
                          {new Date(trip.startDateTime).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStateColor(trip.state)}`}>
                          {trip.state?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openTripDetails(trip)}
                            className="text-[#1B365D] hover:text-[#1B365D] text-xs font-semibold uppercase tracking-wide"
                          >
                            View
                          </button>
                          {canDeleteDraft(trip.state) && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleDeleteDraft(trip.id)}
                              className="text-red-700 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                          {canCancelTrip(trip.state) && !canDeleteDraft(trip.state) && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleCancelTrip(trip.id)}
                              className="text-orange-700 hover:text-orange-800 text-sm font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl border border-[#e0e3e5] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {tripDetailLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B365D] border-t-transparent" />
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1B365D] tracking-tight">Trip Details</h3>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedTrip.requestNumber && (
                <div>
                  <p className="text-sm text-gray-500">Request number</p>
                  <p className="text-base font-medium text-gray-900">{selectedTrip.requestNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-base font-medium text-gray-900">{selectedTrip.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStateColor(selectedTrip.state)}`}>
                    {selectedTrip.state?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="text-base text-gray-900">{selectedTrip.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date & Time</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedTrip.startDateTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date & Time</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedTrip.endDateTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Trip Type</p>
                  <p className="text-base text-gray-900">{selectedTrip.tripType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="text-base text-gray-900">{selectedTrip.passengerCount}</p>
                </div>
              </div>

              {(selectedTrip.estimatedFuelCost != null ||
                selectedTrip.estimatedDistance != null ||
                selectedTrip.actualFuelCost != null ||
                selectedTrip.actualDistance != null) && (
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Est. fuel cost</p>
                    <p className="text-base text-gray-900">{formatMoney(selectedTrip.estimatedFuelCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Est. distance (km)</p>
                    <p className="text-base text-gray-900">{formatNum(selectedTrip.estimatedDistance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual fuel cost</p>
                    <p className="text-base text-gray-900">{formatMoney(selectedTrip.actualFuelCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual distance (km)</p>
                    <p className="text-base text-gray-900">{formatNum(selectedTrip.actualDistance)}</p>
                  </div>
                </div>
              )}

              {(allocatedVehicle(selectedTrip) || allocatedDriver(selectedTrip)) && (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assignment</p>
                  {allocatedVehicle(selectedTrip) && (
                    <div>
                      <p className="text-sm text-gray-500">Assigned vehicle</p>
                      <p className="text-base text-gray-900">
                        {allocatedVehicle(selectedTrip).make} {allocatedVehicle(selectedTrip).model} (
                        {allocatedVehicle(selectedTrip).plateNumber})
                        {allocatedVehicle(selectedTrip).capacity != null && (
                          <span className="text-gray-600"> · Capacity {allocatedVehicle(selectedTrip).capacity}</span>
                        )}
                      </p>
                    </div>
                  )}
                  {allocatedDriver(selectedTrip) && (
                    <div>
                      <p className="text-sm text-gray-500">Assigned driver</p>
                      <p className="text-base text-gray-900">{driverDisplayName(allocatedDriver(selectedTrip))}</p>
                      {allocatedDriver(selectedTrip).licenseNumber && (
                        <p className="text-sm text-gray-600">License: {allocatedDriver(selectedTrip).licenseNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(selectedTrip.deploymentTeamMember || selectedTrip.transportOfficer) && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Deployment</p>
                  {selectedTrip.deploymentTeamMember && (
                    <div>
                      <p className="text-sm text-gray-500">Deployment team</p>
                      <p className="text-base text-gray-900">{selectedTrip.deploymentTeamMember.name}</p>
                    </div>
                  )}
                  {selectedTrip.transportOfficer && (
                    <div>
                      <p className="text-sm text-gray-500">Transport officer</p>
                      <p className="text-base text-gray-900">{selectedTrip.transportOfficer.name}</p>
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(selectedTrip.approvals) && selectedTrip.approvals.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Approvals</p>
                  <ul className="space-y-2">
                    {selectedTrip.approvals.map((a: any) => (
                      <li key={a.id} className="text-sm text-gray-800 flex flex-wrap gap-x-2 gap-y-1">
                        <span className="font-medium">{a.approvalLevel}</span>
                        <span className="text-gray-500">{a.status}</span>
                        {a.approver?.name && <span className="text-gray-600">· {a.approver.name}</span>}
                        {a.approvedAt && (
                          <span className="text-gray-500">
                            · {new Date(a.approvedAt).toLocaleString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedTrip.state === 'REJECTED' || selectedTrip.state === 'AUTO_REJECTED_TIMEOUT') &&
                selectedTrip.rejectionReason && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <p className="text-sm font-medium text-red-800">Rejection reason</p>
                    <p className="text-sm text-red-900 mt-1">{selectedTrip.rejectionReason}</p>
                  </div>
                )}

              {selectedTrip.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed at</p>
                  <p className="text-base text-gray-900">{new Date(selectedTrip.completedAt).toLocaleString()}</p>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                {canDeleteDraft(selectedTrip.state) && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDeleteDraft(selectedTrip.id)}
                    className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete draft
                  </button>
                )}
                {canCancelTrip(selectedTrip.state) && !canDeleteDraft(selectedTrip.state) && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleCancelTrip(selectedTrip.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel trip
                  </button>
                )}
                {!canCancelTrip(selectedTrip.state) && !canDeleteDraft(selectedTrip.state) && (
                  <p className="text-sm text-gray-500 text-center">
                    This trip cannot be cancelled or deleted.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </EmployeeShell>
  )
}
