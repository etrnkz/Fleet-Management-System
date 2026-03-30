'use client'
import { useState, useEffect } from 'react'
import { maintenanceApi } from '@/lib/api'

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
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

export default function RequestsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [actionModal, setActionModal] = useState<string | null>(null)
  const [actionData, setActionData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const d = await maintenanceApi.getAll()
      setRecords(Array.isArray(d) ? d : [])
    } catch {}
    finally { setLoading(false) }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      if (actionModal === 'inspect') await maintenanceApi.inspect(selected.id, actionData)
      else if (actionModal === 'budget') await maintenanceApi.approveBudget(selected.id, actionData)
      else if (actionModal === 'start') await maintenanceApi.start(selected.id)
      else if (actionModal === 'complete') await maintenanceApi.complete(selected.id, actionData)
      else if (actionModal === 'reject') await maintenanceApi.reject(selected.id, actionData)
      else if (actionModal === 'create') await maintenanceApi.create(actionData)
      showToast('Action completed successfully')
      setActionModal(null)
      setSelected(null)
      setActionData({})
      load()
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      (r.requestNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.plateNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.issueDescription || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const getNextActions = (status: string) => {
    const actions: { key: string; label: string; color: string }[] = []
    if (status === 'Submitted') actions.push({ key: 'inspect', label: 'Inspect', color: 'bg-blue-500 text-white' })
    if (status === 'UnderInspection' || status === 'EstimateProvided') actions.push({ key: 'budget', label: 'Approve Budget', color: 'bg-indigo-500 text-white' })
    if (status === 'BudgetApproved') actions.push({ key: 'start', label: 'Start Work', color: 'bg-orange-500 text-white' })
    if (status === 'InProgress') actions.push({ key: 'complete', label: 'Complete', color: 'bg-emerald-500 text-white' })
    if (!['Completed', 'Rejected'].includes(status)) actions.push({ key: 'reject', label: 'Reject', color: 'bg-red-500 text-white' })
    return actions
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{records.length} total requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Refresh</button>
          <button onClick={() => { setActionModal('create'); setSelected(null); setActionData({}) }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            + New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by ID, vehicle, or description..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500">
          <option value="all">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No maintenance requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{r.requestNumber || r.id}</p>
                      <p className="text-sm text-gray-500">{r.vehicle?.make} {r.vehicle?.model} • {r.vehicle?.plateNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[r.priority] || 'bg-gray-100 text-gray-600'}`}>{r.priority}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{r.issueDescription}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {r.requestedBy?.name && <span>By: {r.requestedBy.name}</span>}
                    {r.estimatedCost && <span>Est. Cost: ETB {r.estimatedCost}</span>}
                    {r.actualCost && <span>Actual: ETB {r.actualCost}</span>}
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelected(r)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200">Details</button>
                  {getNextActions(r.status).map(a => (
                    <button key={a.key} onClick={() => { setSelected(r); setActionModal(a.key); setActionData({}) }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${a.color}`}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selected && !actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Request #', selected.requestNumber || selected.id],
                ['Status', selected.status],
                ['Priority', selected.priority],
                ['Vehicle', `${selected.vehicle?.make || ''} ${selected.vehicle?.model || ''} (${selected.vehicle?.plateNumber || 'N/A'})`],
                ['Issue', selected.issueDescription],
                ['Requested By', selected.requestedBy?.name || 'N/A'],
                ['Inspected By', selected.inspectedBy?.name || 'N/A'],
                ['Inspection Notes', selected.inspectionNotes || 'N/A'],
                ['Estimated Cost', selected.estimatedCost ? `ETB ${selected.estimatedCost}` : 'N/A'],
                ['Actual Cost', selected.actualCost ? `ETB ${selected.actualCost}` : 'N/A'],
                ['Created', new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{k}</span>
                  <span className="text-gray-800 text-right max-w-xs">{v as string}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {(selected || actionModal === 'create') && actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 capitalize">{actionModal === 'budget' ? 'Approve Budget' : actionModal === 'create' ? 'New Maintenance Request' : actionModal} Request</h3>
              <button onClick={() => { setActionModal(null); setActionData({}) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {actionModal !== 'create' && selected && (
              <p className="text-sm text-gray-500 mb-4">Request: <span className="font-medium text-gray-800">{selected.requestNumber || selected.id}</span></p>
            )}

            {actionModal === 'inspect' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Notes</label>
                  <textarea rows={3} value={actionData.inspectionNotes || ''} onChange={e => setActionData({ ...actionData, inspectionNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Describe findings..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (ETB)</label>
                  <input type="number" value={actionData.estimatedCost || ''} onChange={e => setActionData({ ...actionData, estimatedCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="0.00" />
                </div>
              </div>
            )}
            {actionModal === 'budget' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Budget (ETB)</label>
                <input type="number" value={actionData.approvedBudget || ''} onChange={e => setActionData({ ...actionData, approvedBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="0.00" />
              </div>
            )}
            {actionModal === 'complete' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost (ETB)</label>
                  <input type="number" value={actionData.actualCost || ''} onChange={e => setActionData({ ...actionData, actualCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                  <textarea rows={2} value={actionData.notes || ''} onChange={e => setActionData({ ...actionData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Work completed..." />
                </div>
              </div>
            )}
            {actionModal === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                <textarea rows={3} value={actionData.reason || ''} onChange={e => setActionData({ ...actionData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Reason for rejection..." />
              </div>
            )}
            {actionModal === 'start' && <p className="text-sm text-gray-600">Confirm starting maintenance work on this vehicle?</p>}

            {actionModal === 'create' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                  <input value={actionData.vehicleId || ''} onChange={e => setActionData({...actionData, vehicleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Vehicle ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea rows={3} value={actionData.issueDescription || ''} onChange={e => setActionData({...actionData, issueDescription: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Describe the issue..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={actionData.priority || 'Medium'} onChange={e => setActionData({...actionData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setActionModal(null); setActionData({}) }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleAction} disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm font-medium">
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
