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

// Real monthly data computed from records
const getMonthlyData = (records: any[]) => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const count = records.filter(r => {
      const rd = new Date(r.createdAt)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    return { label: d.toLocaleString('default', { month: 'short' }), count }
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    maintenanceApi.getAll()
      .then((d: any) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: records.length,
    submitted: records.filter(r => r.status === 'Submitted').length,
    inProgress: records.filter(r => r.status === 'InProgress').length,
    completed: records.filter(r => r.status === 'Completed').length,
    rejected: records.filter(r => r.status === 'Rejected').length,
    underInspection: records.filter(r => r.status === 'UnderInspection').length,
  }

  // Priority breakdown
  const priorities = ['Low', 'Medium', 'High', 'Critical']
  const priorityCounts = priorities.map(p => ({
    label: p,
    count: records.filter(r => r.priority === p).length,
    color: { Low: 'bg-gray-400', Medium: 'bg-yellow-400', High: 'bg-orange-500', Critical: 'bg-red-500' }[p] || 'bg-gray-400',
    text: { Low: 'text-gray-600', Medium: 'text-yellow-700', High: 'text-orange-700', Critical: 'text-red-700' }[p] || 'text-gray-600',
  }))
  const maxPriority = Math.max(...priorityCounts.map(p => p.count), 1)

  // Status donut data
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
  const donutSegments = donutData.map(d => {
    const dash = (d.count / donutTotal) * circumference
    const seg = { ...d, dash, offset }
    offset += dash
    return seg
  })

  // Cost data computed from real records — last 6 months
  const now = new Date()
  const costData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthRecords = records.filter(r => {
      const rd = new Date(r.createdAt)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    })
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      estimated: monthRecords.reduce((s, r) => s + (parseFloat(r.estimatedCost) || 0), 0),
      actual: monthRecords.filter(r => r.status === 'Completed').reduce((s, r) => s + (parseFloat(r.actualCost) || 0), 0),
    }
  })
  const maxCost = Math.max(...costData.flatMap(c => [c.estimated, c.actual]), 1)

  const recent = records.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'Maintenance Team'}</h1>
          <p className="text-sm text-gray-500 mt-1">Fleet Maintenance Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => router.push('/requests')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
          { label: 'Submitted', value: stats.submitted, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 border ${s.border} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">{s.label}</p>
              <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Status Distribution</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="18" />
                {donutSegments.map((seg, i) => (
                  <circle key={i} cx="50" cy="50" r="40" fill="none"
                    stroke={seg.stroke} strokeWidth="18"
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={-seg.offset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
                <text x="50" y="46" textAnchor="middle" className="text-xs" fontSize="14" fontWeight="bold" fill="#111827">{loading ? '—' : stats.total}</text>
                <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6b7280">Total</text>
              </svg>
            </div>
            <div className="space-y-2 flex-1">
              {donutData.map(d => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                    <span className="text-gray-600">{d.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{loading ? '—' : d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Requests by Priority</h2>
          <div className="space-y-4">
            {priorityCounts.map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium ${p.text}`}>{p.label}</span>
                  <span className="text-gray-600 font-semibold">{loading ? '—' : p.count}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                    style={{ width: loading ? '0%' : `${(p.count / maxPriority) * 100}%`, minWidth: p.count > 0 ? '8px' : '0' }}
                  >
                    {p.count > 0 && <span className="text-white text-xs font-bold">{p.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

                {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Monthly Trend</h2>
          <p className="text-xs text-gray-500 mb-4">Requests over last 6 months</p>
          {(() => {
            const monthly = getMonthlyData(records)
            const maxVal = Math.max(...monthly.map(m => m.count), 1)
            return (
              <>
                <div className="relative h-32">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0,1,2,3].map(i => <div key={i} className="border-t border-gray-100 w-full" />)}
                  </div>
                  <div className="absolute inset-0 flex items-end gap-1 pb-0">
                    {monthly.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition-colors relative group"
                          style={{ height: `${(m.count / maxVal) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {m.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 mt-1">
                  {monthly.map(m => <div key={m.label} className="flex-1 text-center text-xs text-gray-400">{m.label}</div>)}
                </div>
              </>
            )
          })()}
        </div>

      {/* Cost Comparison Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Cost Overview</h2>
              <p className="text-xs text-gray-500">Estimated vs Actual (ETB)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded"></div><span className="text-gray-600">Estimated</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-gray-600">Actual</span></div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {costData.map(c => (
              <div key={c.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                  <div className="flex-1 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors"
                    style={{ height: `${(c.estimated / maxCost) * 100}%` }} title={`ETB ${c.estimated.toLocaleString()}`} />
                  <div className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${(c.actual / maxCost) * 100}%` }} title={`ETB ${c.actual.toLocaleString()}`} />
                </div>
                <span className="text-xs text-gray-400">{c.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Active Jobs Timeline</h2>
          <p className="text-xs text-gray-500 mb-4">Current week — in progress & submitted</p>
          <div className="space-y-3">
            <div className="flex gap-1 text-xs text-gray-400 mb-2">
              <div className="w-24 flex-shrink-0"></div>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="flex-1 text-center">{d}</div>
              ))}
            </div>
            {(() => {
              const activeJobs = records
                .filter(r => ['Submitted','UnderInspection','InProgress','BudgetApproved','EstimateProvided'].includes(r.status))
                .slice(0, 5)
              const colors = ['bg-orange-400','bg-blue-400','bg-emerald-400','bg-purple-400','bg-yellow-400']
              if (activeJobs.length === 0) return (
                <p className="text-center text-gray-400 py-4 text-sm">No active jobs this week</p>
              )
              return activeJobs.map((job, i) => {
                const created = new Date(job.createdAt)
                const dayOfWeek = created.getDay() === 0 ? 6 : created.getDay() - 1
                const duration = job.status === 'InProgress' ? 3 : job.status === 'UnderInspection' ? 2 : 1
                return (
                  <div key={job.id} className="flex items-center gap-1">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{job.issueDescription?.slice(0,15) || 'Job'}</p>
                      <p className="text-xs text-gray-400">{job.vehicle?.plateNumber || '—'}</p>
                    </div>
                    {[0,1,2,3,4,5,6].map(day => (
                      <div key={day} className="flex-1 h-7 rounded">
                        {day >= dayOfWeek && day < dayOfWeek + duration ? (
                          <div className={`h-full ${colors[i % colors.length]} rounded opacity-80`}></div>
                        ) : (
                          <div className="h-full bg-gray-50 rounded"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Requests</h2>
          <button onClick={() => router.push('/requests')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All →</button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : recent.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No maintenance requests yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Request #</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Issue</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Priority</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">{r.requestNumber || r.id?.slice(0,8)}</td>
                    <td className="py-3 px-3 text-gray-600">{r.vehicle?.plateNumber || r.vehicle?.make || '—'}</td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate">{r.issueDescription?.slice(0, 40) || '—'}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[r.priority] || 'text-gray-500'}`}>{r.priority || '—'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
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
