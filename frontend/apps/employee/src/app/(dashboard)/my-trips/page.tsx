'use client'

import { useState, useEffect } from 'react'
import { tripApi } from '@/lib/api'

export default function MyTripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      setTrips(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to load trips:', err)
      setError(err.message || 'Failed to load trips')
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-700 border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          No trips found
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{trip.destination}</h3>
                  <p className="text-sm text-gray-600 mt-1">{trip.purpose}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(trip.startDateTime).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trip.state === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : trip.state === 'READY'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {trip.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
