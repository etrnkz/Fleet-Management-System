'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { maintenanceApi, getCurrentUser } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-yellow-100 text-yellow-700',
  UnderInspection: 'bg-blue-100 text-blue-700',
  EstimateProvided: 'bg-purple-100 text-purple-700',
  BudgetApproved: 'bg-indigo-100 text-indigo-700',
  InProgress: 'bg-orange-100 text-orange-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'text-gray-500',
  Medium: 'text-yellow-600',
  High: 'text-orange-600',
  Critical: 'text-red-600',
}

const getMonthlyData = (records: any[]) => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const count = records.filter((r) => {
      const rd = new Date(r.createdAt)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    return { label: d.toLocaleString('default', { month: 'short' }), count }
  })
}

export default function MaintenanceOverviewPage() {
  const router = useRouter()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    maintenanceApi
      .getAll()
      .then((d: any) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: records.length,
    submitted: records.filter((r) => r.status === 'Submitted').length,
    inProgress: records.filter((r) => r.status === 'InProgress').length,
    completed: records.filter((r) => r.status === 'Completed').length,
    rejected: records.filter((r) => r.status === 'Rejected').length,
    underInspection: records.filter((r) => r.status === 'UnderInspection').length,
  }

  const priorities = ['Low', 'Medium', 'High', 'Critical']
  const priorityCounts = priorities.map((p) => ({
    label: p,
    count: records.filter((r) => r.priority === p).length,
    color:
      { Low: 'bg-gray-400', Medium: 'bg-yellow-400', High: 'bg-orange-500', Critical: 'bg-red-500' }[p] ||
      'bg-gray-400',
    text:
      { Low: 'text-gray-600', Medium: 'text-yellow-700', High: 'text-orange-700', Critical: 'text-red-700' }[p] ||
      'text-gray-600',
  }))
  const maxPriority = Math.max(...priorityCounts.map((p) => p.count), 1)

  const donutData = [
    { label: 'Completed', count: stats.completed, color: '#10b981', stroke: '#10b981' },
    { label: 'In Progress', count: stats.inProgress, color: '#f97316', stroke: '#f97316' },
    { label: 'Submitted', count: stats.submitted, color: '#eab308', stroke: '#eab308' },
    { label: 'Rejected', count: stats.rejected, color: '#ef4444', stroke: '#ef4444' },
    { label: 'Inspection', count: stats.underInspection, color: '#3b82f6', stroke: '#3b82f6' },
  ]
  const donutTotal = donutData.reduce((s, d) => s + d.count, 1)
  const circumference = 2 * Math.PI * 40
  let offset = 0
  const donutSegments = donutData.map((d) => {
    const dash = (d.count / donutTotal) * circumference
    const seg = { ...d, dash, offset }
    offset += dash
    return seg
  })

  const now = new Date()
  const costData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthRecords = records.filter((r) => {
      const rd = new Date(r.createdAt)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    })
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      estimated: monthRecords.reduce((s, r) => s + (parseFloat(r.estimatedCost) || 0), 0),
      actual: monthRecords
        .filter((r) => r.status === 'Completed')
        .reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
    }
  })
  const maxCost = Math.max(...costData.flatMap((c) => [c.estimated, c.actual]), 1)

  const recent = records.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || 'Team'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Fleet maintenance overview •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/maintenance/requests')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + New request
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total',
            value: stats.total,
            color: 'text-gray-900',
            bg: 'bg-white dark:bg-gray-800',
            border: 'border-gray-200 dark:border-gray-700',
          },
          {
            label: 'Submitted',
            value: stats.submitted,
            color: 'text-yellow-700',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
          },
          {
            label: 'In Progress',
            value: stats.inProgress,
            color: 'text-orange-700',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
          },
          {
            label: 'Completed',
            value: stats.completed,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
          },
          {
            label: 'Rejected',
            value: stats.rejected,
            color: 'text-red-700',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl p-5 border ${s.border} hover:shadow-md transition-shadow`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color} mt-1`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Status distribution
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="18" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={seg.stroke}
                    strokeWidth="18"
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={-seg.offset}
                    transform="rotate(-90 50 50)"
                  />
                ))}
                <text
                  x="50"
                  y="46"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="currentColor"
                  className="text-gray-900 dark:text-white"
                >
                  {loading ? '—' : stats.total}
                </text>
                <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6b7280">
                  Total
                </text>
              </svg>
            </div>
            <div className="space-y-2 flex-1">
              {donutData.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {loading ? '—' : d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Requests by priority
          </h3>
          <div className="space-y-4">
            {priorityCounts.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium ${p.text}`}>{p.label}</span>
                  <span className="text-gray-600 font-semibold">{loading ? '—' : p.count}</span>
                </div>
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all duration-700`}
                    style={{
                      width: loading ? '0%' : `${(p.count / maxPriority) * 100}%`,
                      minWidth: p.count > 0 ? '8px' : '0',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Monthly trend</h3>
          <p className="text-xs text-gray-500 mb-4">Last 6 months</p>
          {(() => {
            const monthly = getMonthlyData(records)
            const maxVal = Math.max(...monthly.map((m) => m.count), 1)
            return (
              <>
                <div className="relative h-32">
                  <div className="absolute inset-0 flex items-end gap-1 pb-0">
                    {monthly.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-emerald-500 rounded-t-sm min-h-0"
                          style={{
                            height: `${(m.count / maxVal) * 100}%`,
                            minHeight: m.count > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 mt-1">
                  {monthly.map((m) => (
                    <div key={m.label} className="flex-1 text-center text-xs text-gray-400">
                      {m.label}
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent requests</h3>
          <button
            type="button"
            onClick={() => router.push('/maintenance/requests')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all →
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No maintenance requests yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Request #</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Issue</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Priority</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {r.requestNumber || r.id?.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      {r.vehicle?.plateNumber || r.vehicle?.make || '—'}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {r.issueDescription?.slice(0, 40) || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs font-semibold ${PRIORITY_COLORS[r.priority] || 'text-gray-500'}`}
                      >
                        {r.priority || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
