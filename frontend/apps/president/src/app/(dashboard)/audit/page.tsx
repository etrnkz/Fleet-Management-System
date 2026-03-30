'use client'

import { useEffect, useState } from 'react'
import { auditApi } from '../../../lib/api'

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const result = await auditApi.getAuditLogs()
        setLogs(Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [])
      } catch (err: any) {
        setError(err.message || 'Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      {loading && <div className="text-sm text-gray-600">Loading audit logs...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3">{log.userName || '-'}</td>
                  <td className="px-4 py-3">{log.action || '-'}</td>
                  <td className="px-4 py-3">{log.entityType || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="p-6 text-sm text-gray-500">No audit logs found.</div>}
        </div>
      )}
    </div>
  )
}
