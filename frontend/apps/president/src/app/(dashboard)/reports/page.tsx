'use client'

import { useEffect, useState } from 'react'
import { statsApi, vehicleApi, tripApi } from '../../../lib/api'

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [tripStats, vehicleStats, allTrips] = await Promise.all([
          statsApi.getDashboardStats(),
          vehicleApi.getVehicleStats(),
          tripApi.getAll(),
        ])

        setSummary({
          tripStats,
          vehicleStats,
          totalTrips: Array.isArray(allTrips) ? allTrips.length : 0,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load report summary')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <p className="text-sm text-gray-600">System-generated summary using backend analytics endpoints.</p>

      {loading && <div className="text-sm text-gray-600">Loading report summary...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard title="Trips Overview" data={summary.tripStats} />
          <ReportCard title="Vehicles Overview" data={summary.vehicleStats} />
        </div>
      )}
    </div>
  )
}

function ReportCard({ title, data }: { title: string; data: any }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="font-semibold text-gray-900 mb-3">{title}</h2>
      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
