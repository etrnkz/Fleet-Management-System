'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock data for charts
  const fleetUtilization = [
    { department: 'Engineering', percentage: 85, color: 'bg-blue-500' },
    { department: 'Medicine', percentage: 72, color: 'bg-green-500' },
    { department: 'Business', percentage: 68, color: 'bg-purple-500' },
    { department: 'Science', percentage: 55, color: 'bg-yellow-500' },
    { department: 'Arts', percentage: 45, color: 'bg-pink-500' },
  ]

  const vehicleStatus = [
    { status: 'Active', count: 28, percentage: 70, color: '#10b981' },
    { status: 'Maintenance', count: 8, percentage: 20, color: '#f59e0b' },
    { status: 'Idle', count: 4, percentage: 10, color: '#6b7280' },
  ]

  const monthlyTrips = [
    { month: 'Jan', trips: 145 },
    { month: 'Feb', trips: 168 },
    { month: 'Mar', trips: 192 },
    { month: 'Apr', trips: 178 },
    { month: 'May', trips: 205 },
    { month: 'Jun', trips: 220 },
  ]

  const ganttData = [
    { vehicle: 'Toyota Coaster - ABC 1234', task: 'Engineering Dept Trip', start: 10, duration: 30, color: 'bg-blue-500' },
    { vehicle: 'Isuzu NPR - XYZ 5678', task: 'Medical Supplies', start: 25, duration: 40, color: 'bg-green-500' },
    { vehicle: 'Toyota Hiace - DEF 9012', task: 'Business Conference', start: 45, duration: 25, color: 'bg-purple-500' },
    { vehicle: 'Mitsubishi Rosa - GHI 3456', task: 'Science Lab Equipment', start: 15, duration: 35, color: 'bg-yellow-500' },
    { vehicle: 'Nissan Civilian - JKL 7890', task: 'Arts Exhibition', start: 55, duration: 30, color: 'bg-pink-500' },
  ]

  const maxValue = Math.max(...monthlyTrips.map(m => m.trips))

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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium opacity-90">Total Fleet</h3>
            <svg className="w-6 h-6 md:w-8 md:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold">40</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium opacity-90">Active Trips</h3>
            <svg className="w-6 h-6 md:w-8 md:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold">18</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">In Progress</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-emerald-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium opacity-90">Pending Approvals</h3>
            <svg className="w-6 h-6 md:w-8 md:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold">12</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Awaiting Review</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium opacity-90">Fleet Efficiency</h3>
            <svg className="w-6 h-6 md:w-8 md:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-2xl md:text-3xl font-bold">87%</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Utilization Rate</p>
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
                {/* Active - 70% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
                {/* Maintenance - 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray="50.24 200.96"
                  strokeDashoffset="-175.84"
                />
                {/* Idle - 10% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="20"
                  strokeDasharray="25.12 225.08"
                  strokeDashoffset="-226.08"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-gray-800">40</p>
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

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Active Fleet Schedule (Gantt Chart)</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Time Header */}
            <div className="flex items-center mb-4">
              <div className="w-40 md:w-48 text-xs md:text-sm font-medium text-gray-700">Vehicle / Task</div>
              <div className="flex-1 flex">
                {[0, 6, 12, 18, 24].map((hour) => (
                  <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                    {hour}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="space-y-3">
              {ganttData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-40 md:w-48 pr-3 md:pr-4">
                    <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{item.vehicle}</p>
                    <p className="text-xs text-gray-600 truncate">{item.task}</p>
                  </div>
                  <div className="flex-1 relative h-10 md:h-12 bg-gray-100 rounded">
                    <div
                      className={`absolute top-1 bottom-1 ${item.color} rounded shadow-md flex items-center px-2`}
                      style={{
                        left: `${item.start}%`,
                        width: `${item.duration}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium truncate">{item.task}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Request ID</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Department</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Purpose</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">#REQ-1245</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">Engineering</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">International Conference</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">Jun 15, 2024</td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full whitespace-nowrap">Pending</span>
                  </td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <button className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium whitespace-nowrap">Review</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">#REQ-1246</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">Medicine</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">Medical Equipment Transport</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">Jun 16, 2024</td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full whitespace-nowrap">Pending</span>
                  </td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <button className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium whitespace-nowrap">Review</button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">#REQ-1243</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">Business</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">Executive Meeting</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">Jun 14, 2024</td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">Approved</span>
                  </td>
                  <td className="py-2 md:py-3 px-3 md:px-4">
                    <button className="text-gray-400 text-xs md:text-sm font-medium whitespace-nowrap">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
