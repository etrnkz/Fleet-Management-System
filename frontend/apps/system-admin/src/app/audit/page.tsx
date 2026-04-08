'use client'

import { useEffect, useState } from 'react'
import { systemAdminApi } from '../../lib/api'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  APPROVE: 'bg-[#1B3D2F]/15 text-[#1B3D2F]',
  REJECT: 'bg-orange-100 text-orange-700',
  SUBMIT: 'bg-purple-100 text-purple-700',
  LOGIN: 'bg-gray-100 text-gray-700',
  LOGOUT: 'bg-gray-100 text-gray-500',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [limit, setLimit] = useState(100)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const filters: any = { limit }
      if (filterAction) filters.action = filterAction
      if (filterUserId) filters.userId = filterUserId
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
      const data = await systemAdminApi.getAuditLogs(filters)
      setLogs(Array.isArray(data) ? data : data?.data || [])
    } catch { setLogs([]) }
    finally { setLoading(false) }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    loadLogs()
  }

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'LOGIN', 'LOGOUT']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-1">Complete log of all system activities</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none">
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input value={filterUserId} onChange={e => setFilterUserId(e.target.value)}
            placeholder="Filter by User ID"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
          <button type="submit"
            className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22]">
            Apply Filters
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="text-sm text-gray-600">Show last</label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none">
            {[50, 100, 250, 500].map(n => <option key={n} value={n}>{n} records</option>)}
          </select>
          <button type="button" onClick={() => { setFilterAction(''); setFilterUserId(''); setStartDate(''); setEndDate(''); setLimit(100); setTimeout(loadLogs, 0) }}
            className="text-sm text-gray-500 hover:text-[#1B3D2F] underline">Clear filters</button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1B3D2F]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No audit logs found</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">{logs.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Details'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {log.timestamp || log.createdAt
                          ? new Date(log.timestamp || log.createdAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{log.userName || log.user?.name || '—'}</div>
                        <div className="text-xs text-gray-400">{log.user?.email || log.userId || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{log.entityType || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {log.entityId ? log.entityId.slice(0, 8) + '…' : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {log.details || log.description || log.metadata
                          ? JSON.stringify(log.details || log.description || log.metadata).slice(0, 80)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
