'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_DEPARTMENT: 'bg-yellow-100 text-yellow-700',
  PENDING_COLLEGE: 'bg-blue-100 text-blue-700',
  PENDING_PRESIDENT: 'bg-purple-100 text-purple-700',
  APPROVED_FOR_ALLOCATION: 'bg-emerald-100 text-emerald-700',
  CAR_ALLOCATED: 'bg-teal-100 text-teal-700',
  READY: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)

  const minDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)

  const [form, setForm] = useState({
    destination: '',
    purpose: '',
    purposeCategory: 'Official Meeting',
    pickupLocation: '',
    notes: '',
    startDateTime: '',
    endDateTime: '',
    passengerCount: 1,
    tripType: 'Normal' as 'Normal' | 'VIP',
  })

  useEffect(() => { loadMyTrips() }, [])

  const loadMyTrips = async () => {
    setLoading(true)
    try {
      const data = await tripApi.getAll()
      const all = Array.isArray(data) ? data : []
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
      const mine = all.filter((t: any) => t.requester?.id === user.id || t.requesterId === user.id)
      setTrips(mine)
    } catch { setTrips([]) } finally { setLoading(false) }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (new Date(form.startDateTime).getTime() - Date.now() < 48 * 60 * 60 * 1000) {
      showToast('Trip must be requested at least 48 hours in advance', 'error'); return
    }
    if (new Date(form.endDateTime) <= new Date(form.startDateTime)) {
      showToast('End date must be after start date', 'error'); return
    }
    setSubmitting(true)
    try {
      const purposeText = [
        form.purposeCategory,
        form.purpose ? `Details: ${form.purpose}` : '',
        form.pickupLocation ? `Pickup: ${form.pickupLocation}` : '',
        form.notes ? `Notes: ${form.notes}` : '',
      ].filter(Boolean).join(' | ')

      const created: any = await tripApi.create({
        destination: form.destination,
        purpose: purposeText,
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        passengerCount: form.passengerCount,
        tripType: form.tripType,
      })
      await tripApi.submit(created.id)
      showToast('Trip request submitted successfully!', 'success')
      setShowForm(false)
      setForm({ destination: '', purpose: '', purposeCategory: 'Official Meeting', pickupLocation: '', notes: '', startDateTime: '', endDateTime: '', passengerCount: 1, tripType: 'Normal' })
      loadMyTrips()
    } catch (err: any) {
      showToast(err.message || 'Failed to submit trip', 'error')
    } finally { setSubmitting(false) }
  }

  const handleCancel = async (tripId: string) => {
    if (!confirm('Cancel this trip request?')) return
    try {
      await tripApi.reject(tripId, 'Cancelled by requester')
      showToast('Trip cancelled', 'success')
      loadMyTrips()
    } catch (err: any) { showToast(err.message || 'Failed to cancel', 'error') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-700"></div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-emerald-800' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600">My Trips</h1>
          <p className="text-sm text-gray-500 mt-1">Request and track your own trip requests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Trip Request
        </button>
      </div>

      {/* Trip Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">New Trip Request</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Category</label>
                  <select value={form.purposeCategory} onChange={e => setForm({...form, purposeCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700">
                    {['Official Meeting','Conference','Research Activity','Field Work','Training','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                  <select value={form.tripType} onChange={e => setForm({...form, tripType: e.target.value as 'Normal'|'VIP'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700">
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <input required value={form.destination} onChange={e => setForm({...form, destination: e.target.value})}
                    placeholder="e.g. Addis Ababa" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Details</label>
                  <textarea rows={2} value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})}
                    placeholder="Describe the purpose..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input value={form.pickupLocation} onChange={e => setForm({...form, pickupLocation: e.target.value})}
                    placeholder="e.g. Main Campus Gate" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <input type="number" min={1} max={50} value={form.passengerCount} onChange={e => setForm({...form, passengerCount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                  <input required type="datetime-local" min={minDateTime} value={form.startDateTime} onChange={e => setForm({...form, startDateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                  <input required type="datetime-local" min={form.startDateTime || minDateTime} value={form.endDateTime} onChange={e => setForm({...form, endDateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Any additional information..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-700 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Trip Details</h3>
              <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Trip ID', value: selectedTrip.requestNumber || selectedTrip.id?.slice(0,8) },
                { label: 'Status', value: <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[selectedTrip.state] || 'bg-gray-100 text-gray-700'}`}>{selectedTrip.state}</span> },
                { label: 'Destination', value: selectedTrip.destination },
                { label: 'Purpose', value: selectedTrip.purpose },
                { label: 'Passengers', value: selectedTrip.passengerCount },
                { label: 'Start', value: selectedTrip.startDateTime ? new Date(selectedTrip.startDateTime).toLocaleString() : 'N/A' },
                { label: 'End', value: selectedTrip.endDateTime ? new Date(selectedTrip.endDateTime).toLocaleString() : 'N/A' },
                { label: 'Vehicle', value: selectedTrip.allocatedVehicle ? `${selectedTrip.allocatedVehicle.make} ${selectedTrip.allocatedVehicle.model} (${selectedTrip.allocatedVehicle.plateNumber})` : 'Not assigned' },
                { label: 'Driver', value: selectedTrip.allocatedDriver?.user?.name || selectedTrip.allocatedDriver?.name || 'Not assigned' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{value || 'N/A'}</span>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              {['DRAFT', 'PENDING_DEPARTMENT', 'PENDING_COLLEGE', 'PENDING_PRESIDENT'].includes(selectedTrip.state) && (
                <button onClick={() => { handleCancel(selectedTrip.id); setSelectedTrip(null) }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Cancel Request
                </button>
              )}
              <button onClick={() => setSelectedTrip(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Trips List */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-500 font-medium">No trip requests yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "New Trip Request" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip: any) => (
            <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{trip.requestNumber || trip.id?.slice(0,8)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[trip.state] || 'bg-gray-100 text-gray-700'}`}>{trip.state?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium truncate">{trip.destination}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{trip.purpose}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {trip.startDateTime ? new Date(trip.startDateTime).toLocaleDateString() : 'N/A'} — {trip.endDateTime ? new Date(trip.endDateTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <button onClick={() => setSelectedTrip(trip)}
                  className="px-3 py-1.5 border border-emerald-700 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-50 flex-shrink-0">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
