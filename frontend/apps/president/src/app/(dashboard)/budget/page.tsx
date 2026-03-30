'use client'

import { useEffect, useMemo, useState } from 'react'
import { tripApi, maintenanceApi, vehicleApi } from '@/lib/api'

export default function BudgetPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m, v] = await Promise.all([tripApi.getAll(), maintenanceApi.getAll(), vehicleApi.getAll()])
        setTrips(Array.isArray(t) ? t : [])
        setMaintenance(Array.isArray(m) ? m : [])
        setVehicles(Array.isArray(v) ? v : [])
      } catch (err: any) {
        setError(err.message || 'Failed to load budget data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totals = useMemo(() => {
    const fuel = trips.reduce((sum, t) => sum + Number(t.actualFuelCost || 0), 0)
    const maintenanceCost = maintenance.reduce((sum, m) => sum + Number(m.actualCost || m.estimatedCost || 0), 0)
    return {
      fuel,
      maintenance: maintenanceCost,
      total: fuel + maintenanceCost,
      assets: vehicles.length,
    }
  }, [trips, maintenance, vehicles])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Budget Overview</h1>
      {loading && <div className="text-sm text-gray-600">Loading budget overview...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Fuel Cost" value={`ETB ${totals.fuel.toLocaleString()}`} />
          <Card title="Maintenance Cost" value={`ETB ${totals.maintenance.toLocaleString()}`} />
          <Card title="Total Operational Cost" value={`ETB ${totals.total.toLocaleString()}`} />
          <Card title="Fleet Size" value={`${totals.assets}`} />
        </div>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-600">{title}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
