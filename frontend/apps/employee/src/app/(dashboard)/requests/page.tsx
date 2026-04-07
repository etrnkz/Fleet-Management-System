'use client'

import { useState } from 'react'
import { tripApi } from '@/lib/api'

export default function RequestsPage() {
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    startDateTime: '',
    endDateTime: '',
    passengerCount: '1',
    tripType: 'Normal' as 'Normal' | 'VIP',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await tripApi.create({
        destination: formData.destination,
        purpose: formData.purpose,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        passengerCount: parseInt(formData.passengerCount),
        tripType: formData.tripType,
      })
      setSubmitted(true)
      setFormData({
        destination: '',
        purpose: '',
        startDateTime: '',
        endDateTime: '',
        passengerCount: '1',
        tripType: 'Normal',
      })
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit trip request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Submit Trip Request</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {submitted && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Trip request submitted successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Enter destination"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <select
                value={formData.tripType}
                onChange={(e) => setFormData({ ...formData, tripType: e.target.value as 'Normal' | 'VIP' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Enter purpose"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers</label>
              <input
                type="number"
                min="1"
                value={formData.passengerCount}
                onChange={(e) => setFormData({ ...formData, passengerCount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
