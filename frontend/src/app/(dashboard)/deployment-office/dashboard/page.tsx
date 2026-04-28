'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, vehicleApi, driverApi, maintenanceApi } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [approvedRequests, setApprovedRequests] = useState<any[]>([])
  const [allTrips, setAllTrips] = useState<any[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
  const [pendingMaintenance, setPendingMaintenance] = useState<any[]>([])
  const [vehicleStats, setVehicleStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  useEffect(() => { loadDashboardData() }, [])

  const loadDashboardData = async () => {
    try {
      const [approvedTrips, allVehicles, assignableVehicles, drivers, maintenance, allTripsData] = await Promise.all([
        tripApi.getApprovedTrips().catch(() => []),
        vehicleApi.getAllVehicles().catch(() => []),
        vehicleApi.getAvailableVehicles().catch(() => []),
        driverApi.getAvailableDrivers().catch(() => []),
        maintenanceApi.getAllMaintenanceRequests().catch(() => []),
        tripApi.getAllTrips().catch(() => []),
      ])
      const vehicles = Array.isArray(allVehicles) ? allVehicles : []
      const forAssignment = Array.isArray(assignableVehicles) ? assignableVehicles : []
      const assignableIds = new Set(forAssignment.map((v: any) => v.id))
      const trips = Array.isArray(approvedTrips) ? approvedTrips : []
      const maint = Array.isArray(maintenance) ? maintenance : []
      setApprovedRequests(trips)
      setAllTrips(Array.isArray(allTripsData) ? allTripsData : [])
      setAvailableVehicles(forAssignment)
      setAvailableDrivers(Array.isArray(drivers) ? drivers : [])
      setPendingMaintenance(maint.filter((m: any) => ['Submitted','UnderInspection'].includes(m.status)).slice(0, 5))
      const activeFleet = vehicles.filter((v: any) => v.status === 'Active')
      const inUseActive = activeFleet.filter((v: any) => !assignableIds.has(v.id)).length
      setVehicleStats({
        total: vehicles.length,
        available: forAssignment.length,
        inUse: inUseActive,
        maintenance: vehicles.filter((v: any) => v.status === 'UnderMaintenance' || v.status === 'Maintenance').length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg); setToastType(type); setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Filter allTrips by selected period and build chart data
  const getPeriodStart = () => {
    const now = new Date()
    if (selectedPeriod === 'day') { const d = new Date(now); d.setHours(0,0,0,0); return d }
    if (selectedPeriod === 'week') { const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d }
    if (selectedPeriod === 'month') { const d = new Date(now); d.setDate(1); d.setHours(0,0,0,0); return d }
    // year
    return new Date(now.getFullYear(), 0, 1)
  }

  const periodTrips = allTrips.filter((t: any) => new Date(t.createdAt) >= getPeriodStart())

  // Build bar chart labels + counts based on period
  const chartData = (() => {
    const now = new Date()
    if (selectedPeriod === 'day') {
      // 24 hours, grouped by hour
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${String(h).padStart(2,'0')}h`,
        count: periodTrips.filter((t: any) => new Date(t.createdAt).getHours() === h).length,
      })).filter((_, i) => i % 3 === 0) // show every 3h to avoid clutter
    }
    if (selectedPeriod === 'week') {
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return {
          label: dayNames[d.getDay()],
          count: periodTrips.filter((t: any) => {
            const td = new Date(t.createdAt)
            return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth() && td.getDate() === d.getDate()
          }).length,
        }
      })
    }
    if (selectedPeriod === 'month') {
      // Group by week of month (week 1–5)
      return Array.from({ length: 5 }, (_, i) => ({
        label: `Wk ${i+1}`,
        count: periodTrips.filter((t: any) => Math.floor((new Date(t.createdAt).getDate() - 1) / 7) === i).length,
      }))
    }
    // year — last 12 months
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        count: periodTrips.filter((t: any) => {
          const td = new Date(t.createdAt)
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
        }).length,
      }
    })
  })()

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  // Donut
  const circ = 2 * Math.PI * 40
  const total = Math.max(vehicleStats.total, 1)
  const availDash = (vehicleStats.available / total) * circ
  const inUseDash = (vehicleStats.inUse / total) * circ
  const maintDash = (vehicleStats.maintenance / total) * circ

  const stateLabel: Record<string, { label: string; color: string }> = {
    APPROVED_FOR_ALLOCATION: { label: 'APPROVED', color: 'bg-[#1B3D2F]/15 text-emerald-700' },
    CAR_ALLOCATED: { label: 'ALLOCATED', color: 'bg-blue-100 text-blue-700' },
    PENDING_TRANSPORT_CONFIRM: { label: 'CONFIRMING', color: 'bg-yellow-100 text-yellow-700' },
    READY: { label: 'READY', color: 'bg-indigo-100 text-indigo-700' },
    IN_PROGRESS: { label: 'ON ROUTE', color: 'bg-[#1B3D2F]/15 text-emerald-700' },
  }
  const gradients = ['from-cyan-400 to-blue-500','from-[#1B3D2F]-400 to-cyan-500','from-blue-400 to-indigo-500','from-purple-400 to-pink-500']

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#152e22]"></div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white ${toastType === 'success' ? 'bg-[#152e22]' : 'bg-red-600'}`}>{toastMessage}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fleet Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time fleet monitoring and deployment management</p>
        </div>
        <div className="flex gap-2">
          {['day','week','month','year'].map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${selectedPeriod === p ? 'bg-[#1B3D2F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Fleet', value: vehicleStats.total, icon: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z', bg: 'bg-[#1B3D2F]/15', color: 'text-[#152e22]' },
          { label: 'Available', value: vehicleStats.available, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'In Use', value: vehicleStats.inUse, icon: 'M13 10V3L4 14h7v7l9-11h-7z', bg: 'bg-purple-100', color: 'text-purple-600' },
          { label: 'Maintenance', value: vehicleStats.maintenance, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', bg: 'bg-orange-100', color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm text-gray-600">{s.label}</span>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Requests Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Trip Requests</h2>
            <span className="text-xs text-gray-400 capitalize">{selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'Last 7 days' : selectedPeriod === 'month' ? 'This month' : 'This year'} · {periodTrips.length} total</span>
          </div>
          <div className="space-y-2">
            {chartData.map((item) => {
              const pct = Math.round((item.count / maxCount) * 100)
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-10 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                    <div className="bg-[#1B3D2F] h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${pct}%`, minWidth: item.count > 0 ? '20px' : '0' }}>
                      {item.count > 0 && <span className="text-xs font-medium text-white">{item.count}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vehicle Status Donut */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Vehicle Status</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20"
                  strokeDasharray={`${availDash} ${circ - availDash}`} strokeDashoffset="0"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20"
                  strokeDasharray={`${inUseDash} ${circ - inUseDash}`} strokeDashoffset={-availDash}/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20"
                  strokeDasharray={`${maintDash} ${circ - maintDash}`} strokeDashoffset={-(availDash + inUseDash)}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{vehicleStats.total}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 flex-1 w-full">
              {[
                { label: 'Available', count: vehicleStats.available, color: 'bg-[#1B3D2F]' },
                { label: 'In Use', count: vehicleStats.inUse, color: 'bg-blue-500' },
                { label: 'Maintenance', count: vehicleStats.maintenance, color: 'bg-orange-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${s.color}`}></div>
                    <span className="text-gray-600">{s.label}</span>
                  </div>
                  <span className="font-bold text-gray-900">{s.count} ({vehicleStats.total > 0 ? Math.round(s.count / vehicleStats.total * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trip Trend */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Monthly Trip Requests</h2>
            <p className="text-xs text-gray-500">Last 6 months — real data</p>
          </div>
        </div>
        {(() => {
          const now = new Date()
          const monthly = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
            const count = allTrips.filter((t: any) => {
              const td = new Date(t.createdAt)
              return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
            }).length
            return { label: d.toLocaleString('default', { month: 'short' }), count }
          })
          const maxVal = Math.max(...monthly.map(m => m.count), 1)
          return (
            <div>
              <div className="flex items-end gap-1 sm:gap-2 h-24 sm:h-32 border-b border-gray-100 pb-2">
                {monthly.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {m.count} trips
                      </div>
                      <div className="w-full bg-gradient-to-t from-[#152e22] to-emerald-400 rounded-t hover:from-emerald-700 hover:to-[#1B3D2F] transition-colors"
                        style={{ height: `${(m.count / maxVal) * 120}px`, minHeight: m.count > 0 ? '4px' : '0' }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <div className="w-3 h-3 bg-[#1B3D2F] rounded"></div>
                <span>Total: {allTrips.length} trips</span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trips */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Trips Awaiting Allocation</h2>
            <button onClick={() => router.push('/trips')} className="text-emerald-700 text-xs sm:text-sm font-medium hover:text-emerald-800 text-left sm:text-right">View All →</button>
          </div>
          <div className="space-y-3">
            {approvedRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No trips awaiting allocation</p>
              </div>
            ) : approvedRequests.slice(0, 4).map((trip: any, idx: number) => {
              const sl = stateLabel[trip.state] || { label: trip.state, color: 'bg-gray-100 text-gray-700' }
              return (
                <div key={trip.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-xs text-gray-500 sm:w-24">{trip.requestNumber || trip.id?.slice(0,8)}</span>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex-shrink-0 flex items-center justify-center`}>
                    <span className="text-white font-bold">{trip.requester?.name?.charAt(0)?.toUpperCase() || 'T'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{trip.requester?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">→ {trip.destination}</p>
                  </div>
                  <span className={`px-3 py-1 ${sl.color} text-xs font-medium rounded-full`}>{sl.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Maintenance Alerts */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Maintenance Alerts</h2>
              {pendingMaintenance.length > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">{pendingMaintenance.length} NEW</span>
              )}
            </div>
            <div className="space-y-3">
              {pendingMaintenance.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No pending alerts</p>
              ) : pendingMaintenance.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.issueDescription?.slice(0, 50) || 'Maintenance Required'}</p>
                    <p className="text-xs text-gray-500">{item.vehicle?.plateNumber || 'Vehicle'} • {item.priority}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Operations */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Live Operations</h2>
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {allTrips.filter((t: any) => t.state === 'IN_PROGRESS').length} Active
              </span>
            </div>
            {(() => {
              const active = allTrips.filter((t: any) => t.state === 'IN_PROGRESS')
              if (active.length === 0) {
                return (
                  <div className="h-40 sm:h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-gray-400 text-xs">No active trips right now</p>
                    </div>
                  </div>
                )
              }
              return (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {active.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{t.requestNumber}</p>
                          <p className="text-xs text-gray-500 truncate">→ {t.destination}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs text-gray-600 truncate max-w-[80px]">{t.allocatedVehicle?.plateNumber || '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[80px]">{t.allocatedDriver?.user?.name || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

    </div>
  )
}
