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

export default function MaintenanceSchedulePage() {
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
    Promise.all([vehicleApi.getAll().catch(() => []), maintenanceApi.getAll().catch(() => [])]).then(
      ([v, m]) => {
        const vehiclesArr = Array.isArray(v) ? v : []
        const maintenanceArr = Array.isArray(m) ? m : []
        setVehicles(vehiclesArr)
        const schedule: any[] = []
        vehiclesArr.forEach((vehicle: any) => {
          if (vehicle.nextMaintenanceDate) {
            const due = new Date(vehicle.nextMaintenanceDate)
            const now = new Date()
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            schedule.push({
              id: `v-${vehicle.id}`,
              vehicle: `${vehicle.make} ${vehicle.model}`,
              plate: vehicle.plateNumber,
              type: 'Scheduled maintenance',
              due: due.toLocaleDateString(),
              status: diffDays < 0 ? 'overdue' : diffDays <= 7 ? 'upcoming' : 'scheduled',
              priority: diffDays < 0 ? 'High' : diffDays <= 3 ? 'High' : 'Medium',
              vehicleId: vehicle.id,
            })
          }
        })
        maintenanceArr
          .filter((r: any) => !['Completed', 'Rejected'].includes(r.status))
          .forEach((r: any) => {
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
      },
    ).finally(() => setLoading(false))
  }, [])

  const filtered = scheduleItems.filter((s) => filter === 'all' || s.status === filter)
  const stats = {
    total: scheduleItems.length,
    overdue: scheduleItems.filter((s) => s.status === 'overdue').length,
    upcoming: scheduleItems.filter((s) => s.status === 'upcoming').length,
    scheduled: scheduleItems.filter((s) => s.status === 'scheduled').length,
  }
  const statusBadge = (s: string) =>
    ({
      overdue: 'bg-red-100 text-red-700',
      upcoming: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    }[s] || 'bg-gray-100 text-gray-700')

  const toggleCheck = (key: string) => setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }))
  const priorityColor = (p: string) =>
    ({
      Low: 'text-gray-500',
      Medium: 'text-yellow-600',
      High: 'text-red-600',
      Critical: 'text-red-700 font-bold',
    }[p] || 'text-gray-500')

  const totalItems = CHECKLIST_ITEMS.reduce((s, c) => s + c.items.length, 0)
  const checkedItems = Object.values(checklistState).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule & inspection</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upcoming and open maintenance work</p>
        </div>
        <button
          type="button"
          onClick={() => setShowChecklist(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Inspection checklist
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total scheduled', value: stats.total, color: 'text-gray-900', bg: 'bg-white dark:bg-gray-800' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Upcoming (7d)', value: stats.upcoming, color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'overdue', 'upcoming', 'scheduled'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No schedule items</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {['Vehicle', 'Plate', 'Type', 'Due', 'Priority', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{s.vehicle}</td>
                    <td className="py-3 px-4 text-gray-500">{s.plate}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{s.type}</td>
                    <td className="py-3 px-4 text-gray-600">{s.due}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold ${priorityColor(s.priority)}`}>{s.priority}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicle(`${s.vehicle} — ${s.plate}`)
                          setShowChecklist(true)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Checklist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showChecklist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inspection checklist</h3>
                {selectedVehicle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVehicle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChecklist(false)
                  setSaved(false)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {checkedItems}/{totalItems}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(checkedItems / totalItems) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {CHECKLIST_ITEMS.map((cat) => (
                <div key={cat.category}>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">{cat.category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item) => {
                      const key = `${cat.category}-${item}`
                      return (
                        <label
                          key={item}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                            checklistState[key]
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!checklistState[key]}
                            onChange={() => toggleCheck(key)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Observations (local only — not sent to API)"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowChecklist(false)
                  setSaved(false)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaved(true)
                  setTimeout(() => {
                    setShowChecklist(false)
                    setSaved(false)
                  }, 1200)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                {saved ? 'Saved' : 'Save locally'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
