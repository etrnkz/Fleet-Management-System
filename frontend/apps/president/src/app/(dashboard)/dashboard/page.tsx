'use client'

import { useState, useEffect } from 'react'
import { tripApi, vehicleApi } from '../../../lib/api'

interface DashboardStats {
  totalVehicles: number
  activeTrips: number
  pendingApprovals: number
  fleetEfficiency: number
}

interface VehicleStatus {
  status: string
  count: number
  percentage: number
  color: string
}

interface MonthlyTrip {
  month: string
  trips: number
}

interface FleetUtilization {
  department: string
  percentage: number
  color: string
}

interface PendingRequest {
  id: string
  department: string
  purpose: string
  requestedDate: string
  status: string
  requesterName: string
}

function formatTripStateLabel(raw: string | undefined | null): string {
  const s = String(raw ?? 'Unknown')
  return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeTrips: 0,
    pendingApprovals: 0,
    fleetEfficiency: 0
  })
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus[]>([])
  const [monthlyTrips, setMonthlyTrips] = useState<MonthlyTrip[]>([])
  const [fleetUtilization, setFleetUtilization] = useState<FleetUtilization[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [vehicles, trips, pendingTrips] = await Promise.all([
        vehicleApi.getAllVehicles(),
        tripApi.getAllTrips(),
        tripApi.getPendingApprovals(),
      ])

      const allTrips = trips || []
      const allVehicles = vehicles || []

      // Filter trips by selected period
      const now = new Date()
      const periodStart = new Date()
      if (selectedPeriod === 'week') {
        periodStart.setDate(now.getDate() - 7)
      } else if (selectedPeriod === 'month') {
        periodStart.setMonth(now.getMonth() - 1)
      } else {
        periodStart.setFullYear(now.getFullYear() - 1)
      }
      const filteredTrips = allTrips.filter((t: any) => {
        const d = new Date(t.createdAt || t.startDateTime)
        return d >= periodStart
      })

      // Stats from filtered trips
      const totalVehicles = allVehicles.length
      const activeTrips = filteredTrips.filter((t: any) =>
        ['IN_PROGRESS', 'in_progress', 'READY', 'ready'].includes(t.status || t.state || '')
      ).length
      const pendingApprovals = (pendingTrips || []).length
      const activeVehicles = allVehicles.filter((v: any) =>
        ['Active', 'active', 'ACTIVE'].includes(v.status || '')
      ).length
      const fleetEfficiency = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0

      setDashboardStats({ totalVehicles, activeTrips, pendingApprovals, fleetEfficiency })

      // Vehicle status breakdown
      const statusMap: any = {}
      allVehicles.forEach((v: any) => {
        const s = v.status || 'Idle'
        statusMap[s] = (statusMap[s] || 0) + 1
      })
      setVehicleStatus([
        { status: 'Active', count: statusMap['Active'] || statusMap['active'] || 0, color: '#10b981' },
        { status: 'Maintenance', count: statusMap['Maintenance'] || statusMap['maintenance'] || 0, color: '#f59e0b' },
        { status: 'Idle', count: statusMap['Idle'] || statusMap['idle'] || 0, color: '#6b7280' },
      ].map(item => ({
        ...item,
        percentage: totalVehicles > 0 ? Math.round((item.count / totalVehicles) * 100) : 0
      })))

      // Monthly chart — number of bars depends on period
      const barCount = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 4 : 12
      const labels: string[] = []
      const counts: number[] = []

      if (selectedPeriod === 'week') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(now.getDate() - i)
          labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
          counts.push(allTrips.filter((t: any) => {
            const td = new Date(t.createdAt || t.startDateTime)
            return td.toDateString() === d.toDateString()
          }).length)
        }
      } else if (selectedPeriod === 'month') {
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(); weekStart.setDate(now.getDate() - i * 7 - 6)
          const weekEnd = new Date(); weekEnd.setDate(now.getDate() - i * 7)
          labels.push(`W${4 - i}`)
          counts.push(allTrips.filter((t: any) => {
            const td = new Date(t.createdAt || t.startDateTime)
            return td >= weekStart && td <= weekEnd
          }).length)
        }
      } else {
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          labels.push(monthNames[d.getMonth()])
          counts.push(allTrips.filter((t: any) => {
            const td = new Date(t.createdAt || t.startDateTime)
            return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
          }).length)
        }
      }
      setMonthlyTrips(labels.map((month, i) => ({ month, trips: counts[i] })))

      setTrips(filteredTrips)

      // Pending requests list
      if (pendingTrips) {
        setPendingRequests(pendingTrips.slice(0, 5).map((trip: any) => ({
          id: trip.id,
          department: trip.requester?.department?.name || 'Unknown',
          purpose: trip.purpose || 'No purpose specified',
          requestedDate: new Date(trip.createdAt).toLocaleDateString(),
          status: trip.state || trip.status || 'unknown',
          requesterName: trip.requester?.name || 'Unknown',
        })))
      }

      // Fleet utilization by department (from filtered trips)
      const deptUsage: any = {}
      filteredTrips.forEach((trip: any) => {
        const dept = trip.requester?.department?.name || trip.requester?.college?.name || 'Unknown'
        if (!deptUsage[dept]) deptUsage[dept] = { trips: 0, vehicles: new Set() }
        deptUsage[dept].trips += 1
        const vid = trip.allocatedVehicle?.id
        if (vid) deptUsage[dept].vehicles.add(vid)
      })
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500']
      setFleetUtilization(
        Object.entries(deptUsage)
          .map(([dept, data]: [string, any], i) => ({
            department: dept,
            percentage: Math.min(Math.round((data.trips / Math.max(filteredTrips.length, 1)) * 100), 100),
            color: colors[i % colors.length]
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5)
      )

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...monthlyTrips.map(m => m.trips), 1) // Avoid division by zero

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Executive Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Comprehensive fleet analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              selectedPeriod === 'week' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              selectedPeriod === 'month' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              selectedPeriod === 'year' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Fleet</h3>
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{dashboardStats.totalVehicles}</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Vehicles</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Active Trips</h3>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{dashboardStats.activeTrips}</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">In Progress</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Pending Approvals</h3>
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{dashboardStats.pendingApprovals}</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Awaiting Review</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Fleet Efficiency</h3>
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{dashboardStats.fleetEfficiency}%</p>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Utilization Rate</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart - Vehicle Status */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Fleet Status Distribution</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Pie Chart */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {vehicleStatus.map((item, index) => {
                  const circumference = 2 * Math.PI * 40
                  const strokeDasharray = circumference
                  const strokeDashoffset = circumference - (item.percentage / 100) * circumference
                  const rotation = vehicleStatus.slice(0, index).reduce((acc, prev) => acc + (prev.percentage / 100) * 360, 0)
                  
                  return (
                    <circle
                      key={item.status}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-gray-800">{dashboardStats.totalVehicles}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full md:w-auto">
              {vehicleStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs md:text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-xs md:text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart - Monthly Trips */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Monthly Trip Statistics</h3>
          <div className="space-y-3 md:space-y-4">
            {monthlyTrips.map((item) => (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.month}</span>
                  <span className="text-xs md:text-sm font-bold text-emerald-600">{item.trips}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 md:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(item.trips / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Trips Schedule */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Active Fleet Schedule</h3>
        <div className="overflow-x-auto">
          {trips &&
          trips.filter(
            (trip: any) =>
              trip.state === 'IN_PROGRESS' || trip.status === 'in_progress',
          ).length > 0 ? (
            <div className="min-w-[600px]">
              {/* Time Header */}
              <div className="flex items-center mb-4">
                <div className="w-40 md:w-48 text-xs md:text-sm font-medium text-gray-700">Vehicle / Trip</div>
                <div className="flex-1 flex">
                  {[0, 6, 12, 18, 24].map((hour) => (
                    <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                      {hour}:00
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Trips */}
              <div className="space-y-3">
                {trips
                  .filter(
                    (trip: any) =>
                      trip.state === 'IN_PROGRESS' ||
                      trip.status === 'in_progress',
                  )
                  .slice(0, 5)
                  .map((trip: any, index: number) => {
                  const startTime = new Date(trip.startDateTime)
                  const endTime = new Date(trip.endDateTime)
                  const startHour = startTime.getHours()
                  const endHour = endTime.getHours()
                  const startPercent = (startHour / 24) * 100
                  const durationPercent = ((endHour - startHour) / 24) * 100
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                  
                  return (
                    <div key={trip.id} className="flex items-center">
                      <div className="w-40 md:w-48 pr-3 md:pr-4">
                        <p className="text-xs md:text-sm font-medium text-gray-800 truncate">
                          {trip.allocatedVehicle?.plateNumber ||
                            trip.vehicle?.plateNumber ||
                            'Vehicle TBD'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{trip.purpose}</p>
                      </div>
                      <div className="flex-1 relative h-10 md:h-12 bg-gray-100 rounded">
                        <div
                          className={`absolute top-1 bottom-1 ${colors[index % colors.length]} rounded shadow-md flex items-center px-2`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${Math.max(durationPercent, 8)}%`,
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate">
                            {(trip.purpose || '').substring(0, 20)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active trips at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Utilization */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Department Fleet Utilization</h3>
        <div className="space-y-3 md:space-y-4">
          {fleetUtilization.map((dept) => (
            <div key={dept.department}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-gray-700">{dept.department}</span>
                <span className="text-xs md:text-sm font-bold text-gray-800">{dept.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                <div
                  className={`${dept.color} h-3 md:h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${dept.percentage}%` }}
                >
                  {dept.percentage > 20 && (
                    <span className="text-xs text-white font-medium">{dept.percentage}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent High-Priority Requests */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">High-Priority Approval Requests</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            {pendingRequests.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Request ID</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Department</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Purpose</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Requester</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">
                        #{request.id.substring(0, 8)}
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">
                        {request.department}
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">
                        {request.purpose}
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                        {request.requestedDate}
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                        {request.requesterName}
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            /PRESIDENT|DEAN|COLLEGE|DEPARTMENT|pending_dean/i.test(
                              request.status,
                            )
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {formatTripStateLabel(request.status)}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-3 md:px-4">
                        <button 
                          className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium whitespace-nowrap"
                          onClick={() => window.location.href = `/approvals?trip=${request.id}`}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending approval requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
