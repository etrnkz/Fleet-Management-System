'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, getCurrentUser } from '../../lib/api'
import Toast from '../../components/Toast'

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

  const terminalStates = new Set([
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'AUTO_REJECTED_TIMEOUT',
  ])

  const canCancelTrip = (state: string | undefined) =>
    Boolean(state && !terminalStates.has(state))

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Trips</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            New Request
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
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
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trips List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No trips found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{trip.destination}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{trip.purpose}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startDateTime).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(trip.state)}`}>
                          {trip.state?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTrip(trip)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Trip Details</h3>
              <button onClick={() => setSelectedTrip(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
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

              {selectedTrip.vehicle && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Vehicle</p>
                  <p className="text-base text-gray-900">
                    {selectedTrip.vehicle.make} {selectedTrip.vehicle.model} ({selectedTrip.vehicle.plateNumber})
                  </p>
                </div>
              )}

              {selectedTrip.driver && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Driver</p>
                  <p className="text-base text-gray-900">{selectedTrip.driver.name}</p>
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
    </div>
  )
}
