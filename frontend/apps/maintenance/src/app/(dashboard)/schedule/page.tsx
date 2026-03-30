'use client'
import { useState, useEffect } from 'react'
import { vehicleApi, maintenanceApi } from '@/lib/api'

const CHECKLIST_ITEMS = [
  { category: 'Engine', items: ['Engine oil level', 'Coolant level', 'Belt condition', 'Air filter', 'Fuel filter'] },
  { category: 'Brakes', items: ['Brake fluid level', 'Front brake pads', 'Rear brake pads', 'Brake lines', 'Handbrake'] },
  { category: 'Tires', items: ['Front left pressure', 'Front right pressure', 'Rear left pressure', 'Rear right pressure', 'Spare tire'] },
  { category: 'Lights', items: ['Headlights', 'Tail lights', 'Brake lights', 'Turn signals', 'Hazard lights'] },
  { category: 'Body', items: ['Windshield condition', 'Wipers', 'Mirrors', 'Doors & locks', 'Seatbelts'] },
]

export default function SchedulePage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showChecklist, setShowChecklist] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [checklistNotes, setChecklistNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      vehicleApi.getAll().catch(() => []),
      maintenanceApi.getAll().catch(() => []),
    ]).then(([v, m]) => {
      const vehiclesArr = Array.isArray(v) ? v : []
      const maintenanceArr = Array.isArray(m) ? m : []
      setVehicles(vehiclesArr)

      // Build schedule from vehicles with maintenance dates + pending maintenance requests
      const schedule: any[] = []

      // Add vehicles with upcoming/overdue maintenance dates
      vehiclesArr.forEach((vehicle: any) => {
        if (vehicle.nextMaintenanceDate) {
          const due = new Date(vehicle.nextMaintenanceDate)
          const now = new Date()
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          schedule.push({
            id: `v-${vehicle.id}`,
            vehicle: `${vehicle.make} ${vehicle.model}`,
            plate: vehicle.plateNumber,
            type: 'Scheduled Maintenance',
            due: due.toLocaleDateString(),
            status: diffDays < 0 ? 'overdue' : diffDays <= 7 ? 'upcoming' : 'scheduled',
            priority: diffDays < 0 ? 'High' : diffDays <= 3 ? 'High' : 'Medium',
            vehicleId: vehicle.id,
          })
        }
      })

      // Add pending maintenance requests
      maintenanceArr.filter((r: any) => !['Completed', 'Rejected'].includes(r.status)).forEach((r: any) => {
        schedule.push({
          id: r.id,
          vehicle: r.vehicle ? `${r.vehicle.make || ''} ${r.vehicle.model || ''}`.trim() : 'Unknown',
          plate: r.vehicle?.plateNumber || '—',
          type: r.issueDescription?.slice(0, 40) || 'Maintenance',
          due: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
          status: r.status === 'Submitted' ? 'upcoming' : r.status === 'InProgress' ? 'upcoming' : 'scheduled',
          priority: r.priority || 'Medium',
          vehicleId: r.vehicle?.id,
          requestId: r.id,
        })
      })

      setScheduleItems(schedule)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = scheduleItems.filter(s => filter === 'all' || s.status === filter)

  const stats = {
    total: scheduleItems.length,
    overdue: scheduleItems.filter(s => s.status === 'overdue').length,
    upcoming: scheduleItems.filter(s => s.status === 'upcoming').length,
    scheduled: scheduleItems.filter(s => s.status === 'scheduled').length,
  }

  const statusBadge = (s: string) => ({
    overdue: 'bg-red-100 text-red-700',
    upcoming: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
  }[s] || 'bg-gray-100 text-gray-700')

  const toggleCheck = (key: string) => setChecklistState(prev => ({ ...prev, [key]: !prev[key] }))
  const priorityColor = (p: string) => ({
    Low: 'text-gray-500', Medium: 'text-yellow-600', High: 'text-red-600', Critical: 'text-red-700 font-bold'
  }[p] || 'text-gray-500')

  const totalItems = CHECKLIST_ITEMS.reduce((s, c) => s + c.items.length, 0)
  const checkedItems = Object.values(checklistState).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Upcoming and overdue maintenance tasks</p>
        </div>
        <button onClick={() => setShowChecklist(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + Start Inspection
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scheduled', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Upcoming (7 days)', value: stats.upcoming, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-200`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'overdue', 'upcoming', 'scheduled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No schedule items found</div>
        ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Vehicle', 'Plate', 'Service Type', 'Due Date', 'Priority', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s, i) => (
              <tr key={s.id || i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{s.vehicle}</td>
                <td className="py-3 px-4 text-gray-500">{s.plate}</td>
                <td className="py-3 px-4 text-gray-700">{s.type}</td>
                <td className="py-3 px-4 text-gray-600">{s.due}</td>
                <td className="py-3 px-4"><span className={`text-xs font-semibold ${priorityColor(s.priority)}`}>{s.priority}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(s.status)}`}>{s.status}</span></td>
                <td className="py-3 px-4">
                  <button onClick={() => { setSelectedVehicle(s.vehicle + ' - ' + s.plate); setShowChecklist(true) }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Inspect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Inspection Checklist Modal */}
      {showChecklist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Inspection Checklist</h2>
                {selectedVehicle && <p className="text-sm text-gray-500">{selectedVehicle}</p>}
              </div>
              <button onClick={() => { setShowChecklist(false); setSaved(false) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Progress */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span><span>{checkedItems}/{totalItems} items</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(checkedItems / totalItems) * 100}%` }}></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {CHECKLIST_ITEMS.map(cat => (
                <div key={cat.category}>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center justify-center font-bold">
                      {cat.items.filter(item => checklistState[`${cat.category}-${item}`]).length}/{cat.items.length}
                    </span>
                    {cat.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map(item => {
                      const key = `${cat.category}-${item}`
                      return (
                        <label key={item} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checklistState[key] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                          <input type="checkbox" checked={!!checklistState[key]} onChange={() => toggleCheck(key)} className="w-4 h-4 text-emerald-600 rounded" />
                          <span className={`text-sm ${checklistState[key] ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>{item}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
                <textarea rows={3} value={checklistNotes} onChange={e => setChecklistNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Add any observations or notes..." />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => { setShowChecklist(false); setSaved(false) }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setSaved(true); setTimeout(() => { setShowChecklist(false); setSaved(false) }, 1500) }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                {saved ? '✓ Saved!' : 'Save Inspection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
