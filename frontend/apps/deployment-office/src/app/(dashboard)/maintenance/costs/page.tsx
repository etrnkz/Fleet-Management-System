'use client'

import { useState, useEffect } from 'react'
import { maintenanceApi, vehicleApi } from '@/lib/api'

export default function MaintenanceCostsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState('all')

  useEffect(() => {
    Promise.all([maintenanceApi.getAll().catch(() => []), vehicleApi.getAll().catch(() => [])]).then(
      ([m, v]) => {
        setRecords(Array.isArray(m) ? m : [])
        setVehicles(Array.isArray(v) ? v : [])
      },
    ).finally(() => setLoading(false))
  }, [])

  const completed = records.filter((r) => r.status === 'Completed')
  const filtered =
    selectedVehicle === 'all' ? completed : completed.filter((r) => r.vehicle?.id === selectedVehicle)

  const totalEstimated = records.reduce((s, r) => s + (parseFloat(r.estimatedCost) || 0), 0)
  const totalActual = completed.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0)
  const avgCost = completed.length ? totalActual / completed.length : 0
  const savings = totalEstimated - totalActual

  const byPriority = ['Low', 'Medium', 'High', 'Critical'].map((p) => ({
    priority: p,
    count: records.filter((r) => r.priority === p).length,
    cost: records.filter((r) => r.priority === p).reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
  }))

  const vehicleCosts = vehicles
    .map((v) => {
      const vRecords = completed.filter((r) => r.vehicle?.id === v.id)
      return {
        id: v.id,
        name: `${v.make} ${v.model}`,
        plate: v.plateNumber,
        count: vRecords.length,
        total: vRecords.reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
      }
    })
    .filter((v) => v.count > 0)
    .sort((a, b) => b.total - a.total)

  const maxVehicleCost = Math.max(...vehicleCosts.map((v) => v.total), 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance costs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Spend analysis from completed jobs</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total estimated', value: `ETB ${totalEstimated.toLocaleString()}`, color: 'text-gray-900' },
          { label: 'Total actual', value: `ETB ${totalActual.toLocaleString()}`, color: 'text-[#1B3D2F]' },
          { label: 'Avg / job', value: `ETB ${avgCost.toFixed(0)}`, color: 'text-emerald-700' },
          {
            label: savings >= 0 ? 'Savings' : 'Overrun',
            value: `ETB ${Math.abs(savings).toLocaleString()}`,
            color: savings >= 0 ? 'text-green-700' : 'text-red-700',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Cost by priority</h3>
          <div className="space-y-4">
            {byPriority.map((p) => {
              const maxCost = Math.max(...byPriority.map((x) => x.cost), 1)
              const colors = { Low: 'bg-gray-400', Medium: 'bg-yellow-400', High: 'bg-orange-500', Critical: 'bg-red-500' }
              return (
                <div key={p.priority}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">
                      {p.priority} ({p.count})
                    </span>
                    <span className="font-bold text-gray-800 dark:text-white">ETB {p.cost.toLocaleString()}</span>
                  </div>
                  <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[p.priority as keyof typeof colors] || 'bg-gray-400'} rounded-full`}
                      style={{ width: `${(p.cost / maxCost) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Estimated vs actual</h3>
          <div className="flex items-end gap-6 h-40 border-b border-gray-100 dark:border-gray-700 pb-2">
            {[
              { label: 'Estimated', value: totalEstimated, color: 'bg-emerald-400' },
              { label: 'Actual', value: totalActual, color: 'bg-[#1B3D2F]' },
            ].map((b) => {
              const max = Math.max(totalEstimated, totalActual, 1)
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    ETB {b.value.toLocaleString()}
                  </span>
                  <div className={`w-full ${b.color} rounded-t`} style={{ height: `${(b.value / max) * 120}px` }} />
                  <span className="text-xs text-gray-500">{b.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">By vehicle</h3>
        {vehicleCosts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No completed maintenance yet</p>
        ) : (
          <div className="space-y-3">
            {vehicleCosts.map((v) => (
              <div key={v.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {v.name} <span className="text-gray-400 font-normal">({v.plate})</span>
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ETB {v.total.toLocaleString()}{' '}
                    <span className="text-xs text-gray-400 font-normal">({v.count} jobs)</span>
                  </span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1B3D2F] rounded-full"
                    style={{ width: `${(v.total / maxVehicleCost) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-800 dark:text-white">Completed jobs</h3>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="all">All vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.plateNumber})
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No records</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Request #', 'Vehicle', 'Issue', 'Est.', 'Actual', 'Variance', 'Date'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((r) => {
                  const est = parseFloat(r.estimatedCost) || 0
                  const act = parseFloat(r.actualCost) || 0
                  const variance = act - est
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-2 px-3 font-medium">{r.requestNumber || r.id?.slice(0, 8)}</td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{r.vehicle?.plateNumber || '—'}</td>
                      <td className="py-2 px-3 text-gray-600 max-w-xs truncate">
                        {r.issueDescription?.slice(0, 40) || '—'}
                      </td>
                      <td className="py-2 px-3">ETB {est.toLocaleString()}</td>
                      <td className="py-2 px-3 font-medium">ETB {act.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {variance > 0 ? '+' : ''}
                          ETB {variance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">
                        {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}
                      </td>
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
