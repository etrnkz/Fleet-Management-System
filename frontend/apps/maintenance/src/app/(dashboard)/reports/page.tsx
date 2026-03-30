'use client'
import { useState, useEffect } from 'react'
import { maintenanceApi } from '@/lib/api'

export default function ReportsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    maintenanceApi.getAll().then((d: any) => setRecords(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const completed = records.filter(r => r.status === 'Completed')
  const totalCost = completed.reduce((sum, r) => sum + (parseFloat(r.actualCost) || 0), 0)
  const avgCost = completed.length ? totalCost / completed.length : 0

  const byPriority = ['Low', 'Medium', 'High', 'Critical'].map(p => ({
    priority: p,
    count: records.filter(r => r.priority === p).length,
  }))

  const byStatus = Object.entries(
    records.reduce((acc: any, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})
  ).map(([status, count]) => ({ status, count }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Maintenance Reports</h1>

      {loading ? <div className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{records.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Maintenance Cost</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">ETB {totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Avg Cost per Job</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">ETB {avgCost.toFixed(0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">By Priority</h2>
              <div className="space-y-3">
                {byPriority.map(({ priority, count }) => (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">{priority}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: records.length ? `${(count / records.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">By Status</h2>
              <div className="space-y-3">
                {byStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status}</span>
                    <span className="text-sm font-bold text-gray-900">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
