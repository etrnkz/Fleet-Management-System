'use client'

import { useEffect, useState } from 'react'
import { statsApi } from '../../../lib/api'

export default function PoliciesPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await statsApi.getDashboardStats())
      } catch (err: any) {
        setError(err.message || 'Failed to load policy metrics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Policy Monitoring</h1>
      <p className="text-sm text-gray-600">
        Policy compliance is measured from live workflow metrics (trip states and completion rates).
      </p>

      {loading && <div className="text-sm text-gray-600">Loading policy metrics...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-lg p-4">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
