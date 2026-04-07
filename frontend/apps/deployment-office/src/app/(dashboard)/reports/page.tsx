'use client'

import { useState, useEffect } from 'react'
import { tripApi, vehicleApi, driverApi, maintenanceApi } from '@/lib/api'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('trip-summary')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Real data
  const [allTrips, setAllTrips] = useState<any[]>([])
  const [allVehicles, setAllVehicles] = useState<any[]>([])
  const [allDrivers, setAllDrivers] = useState<any[]>([])
  const [allMaintenance, setAllMaintenance] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [trips, vehicles, drivers, maintenance] = await Promise.all([
        tripApi.getAllTrips().catch(() => []),
        vehicleApi.getAllVehicles().catch(() => []),
        driverApi.getAllDrivers().catch(() => []),
        maintenanceApi.getAllMaintenanceRequests().catch(() => []),
      ])
      setAllTrips(Array.isArray(trips) ? trips : [])
      setAllVehicles(Array.isArray(vehicles) ? vehicles : [])
      setAllDrivers(Array.isArray(drivers) ? drivers : [])
      setAllMaintenance(Array.isArray(maintenance) ? maintenance : [])
      setLoading(false)
    }
    load()
  }, [])

  // Filter trips by selected date range
  const getDateBounds = () => {
    const now = new Date()
    const start = new Date()
    if (dateRange === 'today') { start.setHours(0,0,0,0) }
    else if (dateRange === 'yesterday') { start.setDate(now.getDate()-1); start.setHours(0,0,0,0) }
    else if (dateRange === 'last-7-days') { start.setDate(now.getDate()-7) }
    else if (dateRange === 'last-30-days') { start.setDate(now.getDate()-30) }
    else if (dateRange === 'this-month') { start.setDate(1); start.setHours(0,0,0,0) }
    else if (dateRange === 'last-month') { start.setMonth(now.getMonth()-1); start.setDate(1); start.setHours(0,0,0,0) }
    else if (dateRange === 'this-quarter') { start.setMonth(Math.floor(now.getMonth()/3)*3); start.setDate(1) }
    else if (dateRange === 'this-year') { start.setMonth(0); start.setDate(1); start.setHours(0,0,0,0) }
    else if (dateRange === 'custom') {
      return { start: customStartDate ? new Date(customStartDate) : new Date(0), end: customEndDate ? new Date(customEndDate) : now }
    }
    return { start, end: now }
  }

  const { start: rangeStart, end: rangeEnd } = getDateBounds()
  const filteredTrips = allTrips.filter((t: any) => {
    const d = new Date(t.createdAt)
    return d >= rangeStart && d <= rangeEnd
  })

  // Trip summary stats
  const totalTrips = filteredTrips.length
  const completedTrips = filteredTrips.filter((t: any) => ['COMPLETED','completed'].includes(t.state || t.status || '')).length
  const inProgressTrips = filteredTrips.filter((t: any) => ['IN_PROGRESS','in_progress'].includes(t.state || t.status || '')).length
  const cancelledTrips = filteredTrips.filter((t: any) => ['REJECTED','rejected','CANCELLED','cancelled'].includes(t.state || t.status || '')).length
  const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0

  // Monthly trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i)
    const count = allTrips.filter((t: any) => {
      const td = new Date(t.createdAt)
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).length
    return { label: d.toLocaleString('default', { month: 'short' }), count }
  })
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.count), 1)

  // Vehicle utilization
  const totalVehicles = allVehicles.length
  const activeVehicles = allVehicles.filter((v: any) => v.status === 'Active').length
  const inUseVehicles = allVehicles.filter((v: any) => ['In Use','OnTrip'].includes(v.status)).length
  const maintenanceVehicles = allVehicles.filter((v: any) => ['UnderMaintenance','Maintenance'].includes(v.status)).length
  const utilizationRate = totalVehicles > 0 ? Math.round((inUseVehicles / totalVehicles) * 100) : 0

  // Driver performance
  const totalDrivers = allDrivers.length
  const activeDrivers = allDrivers.filter((d: any) => d.status === 'Available' || d.isAvailable).length
  const driverTrips = allDrivers.map((d: any) => ({
    name: d.user?.name || d.name || 'Unknown',
    license: d.licenseNumber || 'N/A',
    trips: filteredTrips.filter((t: any) => t.driver?.id === d.id || t.driverId === d.id).length,
    status: d.status || (d.isAvailable ? 'Available' : 'Busy'),
  })).sort((a, b) => b.trips - a.trips).slice(0, 5)

  // Maintenance stats
  const totalMaint = allMaintenance.length
  const pendingMaint = allMaintenance.filter((m: any) => ['Submitted','UnderInspection'].includes(m.status)).length
  const completedMaint = allMaintenance.filter((m: any) => m.status === 'Completed').length
  const urgentMaint = allMaintenance.filter((m: any) => m.priority === 'Critical' || m.priority === 'High').length

  const reportCategories = [
    { id: 'trip-summary', name: 'Trip Summary', color: 'emerald' },
    { id: 'vehicle-utilization', name: 'Vehicle Utilization', color: 'blue' },
    { id: 'driver-performance', name: 'Driver Performance', color: 'purple' },
    { id: 'maintenance-report', name: 'Maintenance Report', color: 'orange' },
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-5 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Live data from fleet operations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            {dateRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        {dateRange === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Start</label>
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">End</label>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </>
        )}
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2">
        {reportCategories.map(c => (
          <button key={c.id} onClick={() => setSelectedReport(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedReport === c.id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Trip Summary */}
      {selectedReport === 'trip-summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Trips', value: totalTrips, sub: `in selected period` },
              { label: 'Completed', value: completedTrips, sub: `${completionRate}% completion rate` },
              { label: 'In Progress', value: inProgressTrips, sub: 'Currently active' },
              { label: 'Cancelled', value: cancelledTrips, sub: totalTrips > 0 ? `${Math.round(cancelledTrips/totalTrips*100)}% cancellation` : '0%' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Monthly Trip Trend (Last 6 Months)</h3>
            <div className="flex items-end gap-3 h-40">
              {monthlyTrend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{m.count}</span>
                  <div className="w-full bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${(m.count / maxMonthly) * 120}px`, minHeight: m.count > 0 ? '4px' : '0' }}></div>
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent trips table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Trips ({filteredTrips.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Requester</th>
                  <th className="pb-2 pr-4">Destination</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Date</th>
                </tr></thead>
                <tbody>
                  {filteredTrips.slice(0, 10).map((t: any) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-xs text-gray-400">{t.requestNumber || t.id?.slice(0,8)}</td>
                      <td className="py-2 pr-4 font-medium text-gray-800">{t.requester?.name || 'N/A'}</td>
                      <td className="py-2 pr-4 text-gray-600 truncate max-w-[140px]">{t.destination || 'N/A'}</td>
                      <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{t.state || t.status}</span></td>
                      <td className="py-2 text-xs text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {filteredTrips.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No trips in selected period</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Utilization */}
      {selectedReport === 'vehicle-utilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Fleet', value: totalVehicles },
              { label: 'Available', value: activeVehicles },
              { label: 'In Use', value: inUseVehicles },
              { label: 'Maintenance', value: maintenanceVehicles },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                {s.label === 'In Use' && <p className="text-xs text-gray-500 mt-1">{utilizationRate}% utilization</p>}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">All Vehicles ({allVehicles.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4">Plate</th><th className="pb-2 pr-4">Make / Model</th>
                  <th className="pb-2 pr-4">Type</th><th className="pb-2">Status</th>
                </tr></thead>
                <tbody>
                  {allVehicles.map((v: any) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{v.plateNumber}</td>
                      <td className="py-2 pr-4 text-gray-600">{v.make} {v.model}</td>
                      <td className="py-2 pr-4 text-gray-500">{v.type || 'N/A'}</td>
                      <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${v.status === 'Active' ? 'bg-green-100 text-green-700' : v.status === 'OnTrip' || v.status === 'In Use' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{v.status}</span></td>
                    </tr>
                  ))}
                  {allVehicles.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No vehicles found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Driver Performance */}
      {selectedReport === 'driver-performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Drivers', value: totalDrivers },
              { label: 'Available', value: activeDrivers },
              { label: 'Trips (period)', value: filteredTrips.filter((t: any) => t.driverId || t.driver).length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Top Drivers by Trips</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4">Driver</th><th className="pb-2 pr-4">License</th>
                  <th className="pb-2 pr-4">Trips</th><th className="pb-2">Status</th>
                </tr></thead>
                <tbody>
                  {driverTrips.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{d.name}</td>
                      <td className="py-2 pr-4 text-gray-500">{d.license}</td>
                      <td className="py-2 pr-4 font-bold text-emerald-600">{d.trips}</td>
                      <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${d.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status}</span></td>
                    </tr>
                  ))}
                  {driverTrips.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No drivers found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Report */}
      {selectedReport === 'maintenance-report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: totalMaint },
              { label: 'Pending', value: pendingMaint },
              { label: 'Completed', value: completedMaint },
              { label: 'Urgent', value: urgentMaint },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Maintenance Requests ({allMaintenance.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4">Vehicle</th><th className="pb-2 pr-4">Issue</th>
                  <th className="pb-2 pr-4">Priority</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Date</th>
                </tr></thead>
                <tbody>
                  {allMaintenance.map((m: any) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{m.vehicle?.plateNumber || 'N/A'}</td>
                      <td className="py-2 pr-4 text-gray-600 truncate max-w-[160px]">{m.issueDescription?.slice(0,50) || 'N/A'}</td>
                      <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${m.priority === 'Critical' ? 'bg-red-100 text-red-700' : m.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{m.priority || 'Normal'}</span></td>
                      <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${m.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span></td>
                      <td className="py-2 text-xs text-gray-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {allMaintenance.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No maintenance records found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
