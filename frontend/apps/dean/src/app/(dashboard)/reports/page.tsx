'use client'

import { useState } from 'react'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const reportCategories = [
    {
      id: 'trip-reports',
      title: 'Trip Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      reports: [
        { id: 'completed-trips', name: 'Completed Trips Summary', count: 45 },
        { id: 'pending-trips', name: 'Pending Trip Requests', count: 12 },
        { id: 'cancelled-trips', name: 'Cancelled Trips', count: 3 },
        { id: 'trip-by-purpose', name: 'Trips by Purpose', count: null },
      ]
    },
    {
      id: 'vehicle-reports',
      title: 'Vehicle Reports',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      ),
      reports: [
        { id: 'vehicle-utilization', name: 'Vehicle Utilization Rate', count: null },
        { id: 'vehicle-availability', name: 'Vehicle Availability', count: 8 },
        { id: 'maintenance-history', name: 'Maintenance History', count: 15 },
        { id: 'fuel-consumption', name: 'Fuel Consumption Analysis', count: null },
      ]
    },
    {
      id: 'department-reports',
      title: 'Department Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      reports: [
        { id: 'dept-usage', name: 'Department Usage Statistics', count: null },
        { id: 'faculty-requests', name: 'Faculty Request Summary', count: 28 },
        { id: 'dept-comparison', name: 'Department Comparison', count: null },
      ]
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      reports: [
        { id: 'fuel-costs', name: 'Fuel Cost Analysis', count: null },
        { id: 'maintenance-costs', name: 'Maintenance Costs', count: null },
        { id: 'budget-overview', name: 'Budget Overview', count: null },
      ]
    }
  ]

  const recentReports = [
    { name: 'October 2024 Trip Summary', date: '2024-10-15', type: 'Trip Report', size: '2.4 MB' },
    { name: 'Q3 Vehicle Utilization', date: '2024-10-01', type: 'Vehicle Report', size: '1.8 MB' },
    { name: 'September Fuel Analysis', date: '2024-09-30', type: 'Financial Report', size: '1.2 MB' },
    { name: 'Department Usage - Sept', date: '2024-09-28', type: 'Department Report', size: '980 KB' },
  ]

  const quickStats = [
    { label: 'Total Trips This Month', value: '45', change: '+12%', trend: 'up' },
    { label: 'Avg. Trip Duration', value: '4.2 hrs', change: '-5%', trend: 'down' },
    { label: 'Vehicle Utilization', value: '78%', change: '+8%', trend: 'up' },
    { label: 'Fuel Efficiency', value: '12.5 km/L', change: '+3%', trend: 'up' },
  ]

  const monthlyTripData = [
    { month: 'Apr', trips: 38 },
    { month: 'May', trips: 42 },
    { month: 'Jun', trips: 35 },
    { month: 'Jul', trips: 48 },
    { month: 'Aug', trips: 52 },
    { month: 'Sep', trips: 41 },
    { month: 'Oct', trips: 45 },
  ]

  const maxTrips = Math.max(...monthlyTripData.map(d => d.trips))

  const departmentUsage = [
    { dept: 'Engineering', trips: 18, percentage: 40 },
    { dept: 'Agriculture', trips: 12, percentage: 27 },
    { dept: 'Medical Sciences', trips: 8, percentage: 18 },
    { dept: 'Administration', trips: 7, percentage: 15 },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Generate and view comprehensive reports</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex-1 sm:flex-initial"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
            <p className="text-[10px] md:text-xs text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
              <span className={`text-[10px] md:text-xs font-medium flex items-center gap-0.5 ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Monthly Trip Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Monthly Trip Trends</h2>
            <button className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
          <div className="p-4 md:p-6">
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex justify-between items-end h-40 md:h-48 gap-2 md:gap-3">
                {monthlyTripData.map((data, index) => (
                  <div key={index} className="flex flex-col justify-end items-center gap-1 md:gap-2 flex-1">
                    <div className="relative group">
                      <div 
                        className="w-full bg-emerald-500 rounded-t shadow-sm hover:bg-emerald-600 transition-colors cursor-pointer" 
                        style={{ height: `${(data.trips / maxTrips) * 100}%`, minHeight: '40px' }}
                      ></div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.trips} trips
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-700 font-medium">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-2 md:p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600">Total Trips</p>
                <p className="text-lg md:text-2xl font-bold text-emerald-600">301</p>
              </div>
              <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600">Avg per Month</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">43</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Usage */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Department Usage</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {departmentUsage.map((dept, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate mr-2">{dept.dept}</span>
                    <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{dept.trips} trips</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div 
                      className="bg-emerald-500 h-1.5 md:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {reportCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 md:p-5 border-b border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {category.icon}
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">{category.title}</h3>
              </div>
            </div>
            <div className="p-3 md:p-4">
              <div className="space-y-2">
                {category.reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-700 group-hover:text-emerald-600 transition-colors truncate mr-2">
                        {report.name}
                      </span>
                      {report.count !== null && (
                        <span className="text-[10px] md:text-xs font-medium text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap">
                          {report.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Reports</h2>
          <button className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Report Name</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentReports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">{report.name}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{report.date}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{report.size}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 md:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Share">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Custom Report */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Need a Custom Report?</h3>
            <p className="text-sm md:text-base text-emerald-50">Generate detailed reports with custom parameters and filters</p>
          </div>
          <button className="bg-white text-emerald-600 px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm md:text-base flex items-center gap-2 w-full md:w-auto justify-center whitespace-nowrap">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
