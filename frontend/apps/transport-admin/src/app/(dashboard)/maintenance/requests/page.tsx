'use client'

import { useState, useEffect, useCallback } from 'react'
import { maintenanceApi, vehicleApi, getCurrentUser } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

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

function getNextActions(status: string, role: string | undefined) {
  const actions: { key: string; label: string; color: string }[] = []
  const isMaint = role === 'MaintenanceTeam'
  const isTransport = role === 'TransportOffice'

  if (status === 'Submitted' && isMaint) {
    actions.push({ key: 'inspect', label: 'Inspect', color: 'bg-blue-500 text-white' })
  }
  if (status === 'EstimateProvided' && isTransport) {
    actions.push({ key: 'budget', label: 'Approve budget', color: 'bg-indigo-500 text-white' })
  }
  if (status === 'BudgetApproved' && isMaint) {
    actions.push({ key: 'start', label: 'Start work', color: 'bg-orange-500 text-white' })
  }
  if (status === 'InProgress' && isMaint) {
    actions.push({ key: 'complete', label: 'Complete', color: 'bg-emerald-500 text-white' })
  }
  if (!['Completed', 'Rejected'].includes(status) && (isTransport || isMaint)) {
    actions.push({ key: 'reject', label: 'Reject', color: 'bg-red-500 text-white' })
  }
  return actions
}

export default function MaintenanceRequestsPage() {
  const user = getCurrentUser()
  const role = user?.role as string | undefined

  const [records, setRecords] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [actionModal, setActionModal] = useState<string | null>(null)
  const [actionData, setActionData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await maintenanceApi.getAll()
      setRecords(Array.isArray(d) ? d : [])
      const v = await vehicleApi.getAll()
      setVehicles(Array.isArray(v) ? v : [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAction = async () => {
    setSubmitting(true)
    try {
      if (actionModal === 'create') {
        await maintenanceApi.create({
          vehicleId: actionData.vehicleId,
          issueDescription: actionData.issueDescription,
          priority: actionData.priority || 'Medium',
        })
      } else if (!selected) {
        return
      } else if (actionModal === 'inspect') {
        await maintenanceApi.inspect(selected.id, {
          inspectionNotes: actionData.inspectionNotes || '',
          estimatedCost: Number(actionData.estimatedCost) || 0,
        })
      } else if (actionModal === 'budget') {
        await maintenanceApi.approveBudget(selected.id)
      } else if (actionModal === 'start') {
        await maintenanceApi.start(selected.id)
      } else if (actionModal === 'complete') {
        await maintenanceApi.complete(selected.id, {
          actualCost: Number(actionData.actualCost) || 0,
          completionNotes: actionData.completionNotes || actionData.notes || 'Completed',
        })
      } else if (actionModal === 'reject') {
        await maintenanceApi.reject(selected.id, { reason: actionData.reason || 'Rejected' })
      }
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

  const filtered = records.filter((r) => {
    const matchSearch =
      !search ||
      (r.requestNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicle?.plateNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.issueDescription || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const canCreate =
    role === 'TransportOffice' || role === 'MaintenanceTeam' || role === 'Developer'

  return (
    <div className="space-y-6">
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance requests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {records.length} total • Inspect/start/complete require Maintenance team; approve budget
            requires Transport office.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setActionModal('create')
                setSelected(null)
                setActionData({ priority: 'Medium' })
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              + New request
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by ID, plate, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse h-28"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
          No maintenance requests found
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {r.requestNumber || r.id}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {r.vehicle?.make} {r.vehicle?.model} • {r.vehicle?.plateNumber}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[r.priority] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{r.issueDescription}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {r.submittedBy?.name && <span>By: {r.submittedBy.name}</span>}
                    {r.estimatedCost != null && <span>Est.: ETB {r.estimatedCost}</span>}
                    {r.actualCost != null && <span>Actual: ETB {r.actualCost}</span>}
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Details
                  </button>
                  {getNextActions(r.status, role).map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => {
                        setSelected(r)
                        setActionModal(a.key)
                        setActionData({})
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${a.color}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && !actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Request details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="sr-only">Close</span>✕
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ['Request #', selected.requestNumber || selected.id],
                ['Status', selected.status],
                ['Priority', selected.priority],
                [
                  'Vehicle',
                  `${selected.vehicle?.make || ''} ${selected.vehicle?.model || ''} (${selected.vehicle?.plateNumber || 'N/A'})`,
                ],
                ['Issue', selected.issueDescription],
                ['Submitted by', selected.submittedBy?.name || 'N/A'],
                ['Inspection notes', selected.inspectionNotes || '—'],
                [
                  'Estimated cost',
                  selected.estimatedCost != null ? `ETB ${selected.estimatedCost}` : '—',
                ],
                ['Actual cost', selected.actualCost != null ? `ETB ${selected.actualCost}` : '—'],
                ['Created', new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 gap-4"
                >
                  <dt className="text-gray-500 font-medium shrink-0">{k}</dt>
                  <dd className="text-gray-800 dark:text-gray-200 text-right break-words">{v as string}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {(selected || actionModal === 'create') && actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {actionModal === 'budget'
                  ? 'Approve budget'
                  : actionModal === 'create'
                    ? 'New maintenance request'
                    : `${actionModal} request`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActionModal(null)
                  setActionData({})
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            {actionModal !== 'create' && selected && (
              <p className="text-sm text-gray-500 mb-4">
                Request:{' '}
                <span className="font-medium text-gray-800 dark:text-white">
                  {selected.requestNumber || selected.id}
                </span>
              </p>
            )}

            {actionModal === 'inspect' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Inspection notes
                  </label>
                  <textarea
                    rows={3}
                    value={actionData.inspectionNotes || ''}
                    onChange={(e) => setActionData({ ...actionData, inspectionNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Describe findings..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated cost (ETB)
                  </label>
                  <input
                    type="number"
                    value={actionData.estimatedCost ?? ''}
                    onChange={(e) => setActionData({ ...actionData, estimatedCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            {actionModal === 'budget' && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Approve the estimated budget and move this request to budget approved?
              </p>
            )}
            {actionModal === 'complete' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actual cost (ETB)
                  </label>
                  <input
                    type="number"
                    value={actionData.actualCost ?? ''}
                    onChange={(e) => setActionData({ ...actionData, actualCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Completion notes
                  </label>
                  <textarea
                    rows={2}
                    value={actionData.completionNotes || ''}
                    onChange={(e) => setActionData({ ...actionData, completionNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Work completed..."
                  />
                </div>
              </div>
            )}
            {actionModal === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            )}
            {actionModal === 'start' && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Start maintenance work on this vehicle?
              </p>
            )}
            {actionModal === 'create' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle</label>
                  <select
                    required
                    value={actionData.vehicleId || ''}
                    onChange={(e) => setActionData({ ...actionData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} — {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Issue description</label>
                  <textarea
                    rows={3}
                    value={actionData.issueDescription || ''}
                    onChange={(e) => setActionData({ ...actionData, issueDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={actionData.priority || 'Medium'}
                    onChange={(e) => setActionData({ ...actionData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null)
                  setActionData({})
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
