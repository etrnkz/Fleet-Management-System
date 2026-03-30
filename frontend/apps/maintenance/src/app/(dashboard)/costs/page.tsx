'use client'
import { useState, useEffect } from 'react'
import { maintenanceApi, vehicleApi } from '@/lib/api'

export default function CostsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState('all')

  useEffect(() => {
    Promise.all([
      maintenanceApi.getAll().catch(() => []),
      vehicleApi.getAll().catch(() => []),
    ]).then(([m, v]) => {
      setRecords(Array.isArray(m) ? m : [])
      setVehicles(Array.isArray(v) ? v : [])
    }).finally(() => setLoading(false))
  }, [])

  const completed = records.filter(r => r.status === 'Completed')
  const filtered = selectedVehicle === 'all' ? completed : completed.filter(r => r.vehicle?.id === selectedVehicle)

  const totalEstimated = records.reduce((s, r) => s + (parseFloat(r.estimatedCost) || 0), 0)
  const totalActual = completed.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0)
  const avgCost = completed.length ? totalActual / completed.length : 0
  const savings = totalEstimated - totalActual

  // Cost by priority
  const byPriority = ['Low', 'Medium', 'High', 'Critical'].map(p => ({
    priority: p,
    count: records.filter(r => r.priority === p).length,
    cost: records.filter(r => r.priority === p).reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
  }))

  // Per-vehicle cost summary
  const vehicleCosts = vehicles.map(v => {
    const vRecords = completed.filter(r => r.vehicle?.id === v.id)
    return {
      id: v.id,
      name: `${v.make} ${v.model}`,
      plate: v.plateNumber,
      count: vRecords.length,
      total: vRecords.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
    }
  }).filter(v => v.count > 0).sort((a, b) => b.total - a.total)

  const maxVehicleCost = Math.max(...vehicleCosts.map(v => v.total), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cost Tracking</h1>
        <p className="text-sm text-gray-500 mt-1">Maintenance expenditure analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Estimated', value: `ETB ${totalEstimated.toLocaleString()}`, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Total Actual', value: `ETB ${totalActual.toLocaleString()}`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Avg Cost / Job', value: `ETB ${avgCost.toFixed(0)}`, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: savings >= 0 ? 'Savings' : 'Overrun', value: `ETB ${Math.abs(savings).toLocaleString()}`, color: savings >= 0 ? 'text-emerald-700' : 'text-red-700', bg: savings >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-gray-200`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Priority */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Cost by Priority</h2>
          <div className="space-y-4">
            {byPriority.map(p => {
              const maxCost = Math.max(...byPriority.map(x => x.cost), 1)
              const colors = { Low: 'bg-gray-400', Medium: 'bg-yellow-400', High: 'bg-orange-500', Critical: 'bg-red-500' }
              return (
                <div key={p.priority}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{p.priority} ({p.count} jobs)</span>
                    <span className="font-bold text-gray-800">ETB {p.cost.toLocaleString()}</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[p.priority as keyof typeof colors] || 'bg-gray-400'} rounded-full`}
                      style={{ width: `${(p.cost / maxCost) * 100}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estimated vs Actual */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Estimated vs Actual</h2>
          <div className="flex items-end gap-6 h-40 border-b border-gray-100 pb-2">
            {[
              { label: 'Estimated', value: totalEstimated, color: 'bg-blue-400' },
              { label: 'Actual', value: totalActual, color: 'bg-emerald-500' },
            ].map(b => {
              const max = Math.max(totalEstimated, totalActual, 1)
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">ETB {b.value.toLocaleString()}</span>
                  <div className={`w-full ${b.color} rounded-t`} style={{ height: `${(b.value / max) * 120}px` }}></div>
                  <span className="text-xs text-gray-500">{b.label}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">Budget variance: <span className={`font-bold ${savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{savings >= 0 ? '-' : '+'}ETB {Math.abs(savings).toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {/* Per-Vehicle Cost */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Cost by Vehicle</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : vehicleCosts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No completed maintenance records yet</p>
        ) : (
          <div className="space-y-3">
            {vehicleCosts.map(v => (
              <div key={v.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{v.name} <span className="text-gray-400 font-normal">({v.plate})</span></span>
                  <span className="font-bold text-gray-900">ETB {v.total.toLocaleString()} <span className="text-xs text-gray-400 font-normal">({v.count} jobs)</span></span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(v.total / maxVehicleCost) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Records */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Completed Jobs</h2>
          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plateNumber})</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No completed records</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>{['Request #','Vehicle','Issue','Estimated','Actual','Variance','Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => {
                  const est = parseFloat(r.estimatedCost) || 0
                  const act = parseFloat(r.actualCost) || 0
                  const variance = act - est
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-800">{r.requestNumber || r.id?.slice(0,8)}</td>
                      <td className="py-2 px-3 text-gray-600">{r.vehicle?.plateNumber || '—'}</td>
                      <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{r.issueDescription?.slice(0,40) || '—'}</td>
                      <td className="py-2 px-3 text-gray-600">ETB {est.toLocaleString()}</td>
                      <td className="py-2 px-3 font-medium text-gray-800">ETB {act.toLocaleString()}</td>
                      <td className="py-2 px-3"><span className={`text-xs font-semibold ${variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{variance > 0 ? '+' : ''}ETB {variance.toLocaleString()}</span></td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
