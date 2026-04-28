'use client'

import { useState } from 'react'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function ReportsPage() {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const [selectedReport, setSelectedReport] = useState('fleet-performance')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [compareMode, setCompareMode] = useState(false)

  const reportCategories = [
    { 
      id: 'fleet-performance', 
      name: 'Fleet Performance', 
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'financial-summary', 
      name: 'Financial Summary', 
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'driver-analytics', 
      name: 'Driver Analytics', 
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'utilization', 
      name: 'Utilization Analysis', 
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      id: 'compliance', 
      name: 'Compliance Status', 
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'cost-analysis', 
      name: 'Cost Analysis', 
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const handleExport = (format: string) => {
    showToast(`Exporting ${selectedReport} report as ${format.toUpperCase()}`, 'success')
  }

  const handleScheduleReport = () => {
    showToast('Schedule report dialog would open here', 'info')
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-4 md:gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
            <p className="text-xs md:text-sm text-gray-500">Generate comprehensive reports and analyze fleet performance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleScheduleReport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Schedule Report</span>
              <span className="sm:hidden">Schedule</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {dateRange === 'custom' && (
                <>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                  compareMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compare Periods
              </button>
              <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-sm">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {reportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedReport(category.id)}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                selectedReport === category.id
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="mb-2 flex justify-center">{category.icon}</div>
              <p className={`text-xs md:text-sm font-semibold text-center ${
                selectedReport === category.id ? 'text-emerald-900' : 'text-gray-900'
              }`}>
                {category.name}
              </p>
            </button>
          ))}
        </div>

        {/* Report Content */}
        {selectedReport === 'fleet-performance' && (
          <div className="space-y-4 md:space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-600">Total Distance</h3>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">45,678 km</p>
                <p className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +12% from last period
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-600">Avg Utilization</h3>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">78.5%</p>
                <p className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +5.2% improvement
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-600">Avg Fuel Efficiency</h3>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">8.2 km/L</p>
                <p className="text-xs md:text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                  -3% from last period
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-600">Cost per KM</h3>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">12.5 ETB</p>
                <p className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                  -8% cost reduction
                </p>
              </div>
            </div>

            {/* Performance Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Performance Trends</h3>
              <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 overflow-x-auto">
                {[65, 72, 68, 78, 85, 82, 88, 92, 87, 90, 95, 93].map((value, index) => (
                  <div key={index} className="flex-1 min-w-[30px] md:min-w-0 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '192px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${value}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-600 font-medium">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Performance Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Top Performing Vehicles</h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  { id: 'VHL-001', distance: 5420, utilization: 92, efficiency: 9.2, score: 95 },
                  { id: 'VHL-003', distance: 5180, utilization: 88, efficiency: 8.8, score: 91 },
                  { id: 'VHL-007', distance: 4950, utilization: 85, efficiency: 8.5, score: 88 },
                  { id: 'VHL-012', distance: 4720, utilization: 82, efficiency: 8.2, score: 85 },
                  { id: 'VHL-005', distance: 4500, utilization: 78, efficiency: 7.9, score: 82 }
                ].map((vehicle, index) => (
                  <div key={vehicle.id} className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-lg font-bold text-sm md:text-base flex-shrink-0">
                      #{index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Vehicle ID</p>
                        <p className="text-sm font-semibold text-gray-900">{vehicle.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Distance (km)</p>
                        <p className="text-sm font-semibold text-gray-900">{vehicle.distance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Utilization</p>
                        <p className="text-sm font-semibold text-gray-900">{vehicle.utilization}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Efficiency (km/L)</p>
                        <p className="text-sm font-semibold text-gray-900">{vehicle.efficiency}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">Performance Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${vehicle.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">{vehicle.score}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'financial-summary' && (
          <div className="space-y-4 md:space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Total Operating Cost</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">1,245,680 ETB</p>
                <p className="text-xs md:text-sm text-red-600">+8.5% from last month</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Fuel Expenses</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">685,420 ETB</p>
                <p className="text-xs md:text-sm text-gray-600">55% of total cost</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Maintenance Cost</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">342,180 ETB</p>
                <p className="text-xs md:text-sm text-gray-600">27.5% of total cost</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Other Expenses</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">218,080 ETB</p>
                <p className="text-xs md:text-sm text-gray-600">17.5% of total cost</p>
              </div>
            </div>

            {/* Cost Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Monthly Cost Breakdown</h3>
              <div className="h-48 md:h-64 lg:h-80 flex items-end justify-between gap-1 md:gap-2 lg:gap-3 overflow-x-auto">
                {[
                  { fuel: 65, maintenance: 25, other: 18 },
                  { fuel: 72, maintenance: 28, other: 15 },
                  { fuel: 68, maintenance: 32, other: 20 },
                  { fuel: 78, maintenance: 22, other: 16 },
                  { fuel: 85, maintenance: 30, other: 19 },
                  { fuel: 82, maintenance: 26, other: 17 }
                ].map((data, index) => (
                  <div key={index} className="flex-1 min-w-[40px] md:min-w-0 flex flex-col items-center gap-2">
                    <div className="w-full relative h-48 md:h-64 lg:h-80">
                      <div className="absolute bottom-0 w-full flex flex-col">
                        <div className="bg-blue-500 rounded-t" style={{ height: `${data.other * 1.2}px` }}></div>
                        <div className="bg-yellow-500" style={{ height: `${data.maintenance * 1.2}px` }}></div>
                        <div className="bg-emerald-500" style={{ height: `${data.fuel * 1.2}px` }}></div>
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-600 font-medium">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-4 md:mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded"></div>
                  <span className="text-xs md:text-sm text-gray-600">Fuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs md:text-sm text-gray-600">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
                  <span className="text-xs md:text-sm text-gray-600">Other</span>
                </div>
              </div>
            </div>

            {/* Cost per Vehicle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Cost per Vehicle (Last 30 Days)</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle ID</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fuel Cost</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Maintenance</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Other</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cost/KM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { id: 'VHL-001', fuel: 45200, maintenance: 12500, other: 8300, distance: 5420 },
                      { id: 'VHL-003', fuel: 42800, maintenance: 15200, other: 7900, distance: 5180 },
                      { id: 'VHL-007', fuel: 41500, maintenance: 9800, other: 6500, distance: 4950 },
                      { id: 'VHL-012', fuel: 39200, maintenance: 18500, other: 9100, distance: 4720 }
                    ].map((vehicle) => {
                      const total = vehicle.fuel + vehicle.maintenance + vehicle.other
                      const costPerKm = (total / vehicle.distance).toFixed(2)
                      return (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-900">{vehicle.id}</td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{vehicle.fuel.toLocaleString()} ETB</td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{vehicle.maintenance.toLocaleString()} ETB</td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{vehicle.other.toLocaleString()} ETB</td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-900">{total.toLocaleString()} ETB</td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-emerald-600">{costPerKm} ETB/km</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'driver-analytics' && (
          <div className="space-y-4 md:space-y-6">
            {/* Driver Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Total Drivers</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">24</p>
                <p className="text-xs md:text-sm text-green-600">2 new this month</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Avg Performance Score</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">87.5</p>
                <p className="text-xs md:text-sm text-green-600">+3.2 from last month</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Total Hours Driven</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">3,842 hrs</p>
                <p className="text-xs md:text-sm text-gray-600">Avg 160 hrs/driver</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Safety Incidents</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">3</p>
                <p className="text-xs md:text-sm text-green-600">-40% from last month</p>
              </div>
            </div>

            {/* Top Drivers Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Driver Performance Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { name: 'John Doe', trips: 145, distance: 5420, score: 95, rating: 4.9 },
                  { name: 'Jane Smith', trips: 138, distance: 5180, score: 92, rating: 4.8 },
                  { name: 'Mike Johnson', trips: 132, distance: 4950, score: 89, rating: 4.7 },
                  { name: 'Sarah Williams', trips: 128, distance: 4720, score: 87, rating: 4.6 },
                  { name: 'David Brown', trips: 125, distance: 4500, score: 85, rating: 4.5 }
                ].map((driver, index) => (
                  <div key={driver.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-white flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Driver</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{driver.trips}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Trips Completed</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{driver.distance.toLocaleString()} km</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Distance Covered</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{driver.score}/100</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Performance Score</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs md:text-sm font-semibold text-gray-900">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Efficiency Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Driver Efficiency Metrics</h3>
              <div className="space-y-4">
                {[
                  { name: 'Fuel Efficiency', drivers: [
                    { name: 'John Doe', value: 92 },
                    { name: 'Jane Smith', value: 88 },
                    { name: 'Mike Johnson', value: 85 }
                  ]},
                  { name: 'On-Time Performance', drivers: [
                    { name: 'John Doe', value: 96 },
                    { name: 'Jane Smith', value: 94 },
                    { name: 'Mike Johnson', value: 91 }
                  ]},
                  { name: 'Safety Score', drivers: [
                    { name: 'John Doe', value: 98 },
                    { name: 'Jane Smith', value: 95 },
                    { name: 'Mike Johnson', value: 93 }
                  ]}
                ].map((metric) => (
                  <div key={metric.name}>
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">{metric.name}</p>
                    <div className="space-y-2">
                      {metric.drivers.map((driver) => (
                        <div key={driver.name} className="flex items-center gap-2 md:gap-3">
                          <span className="text-[10px] md:text-xs text-gray-600 w-24 md:w-32">{driver.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${driver.value}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] md:text-xs font-semibold text-gray-900 w-10 md:w-12 text-right">{driver.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'utilization' && (
          <div className="space-y-4 md:space-y-6">
            {/* Utilization Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Fleet Utilization Rate</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">78.5%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mt-3 md:mt-4">
                  <div className="bg-emerald-600 h-2 md:h-3 rounded-full" style={{ width: '78.5%' }}></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Peak Usage Hours</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">8AM - 5PM</p>
                <p className="text-xs md:text-sm text-gray-600">85% of daily trips</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Idle Time</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">21.5%</p>
                <p className="text-xs md:text-sm text-yellow-600">Can be optimized</p>
              </div>
            </div>

            {/* Hourly Utilization Pattern */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Daily Utilization Pattern</h3>
              <div className="h-48 md:h-64 flex items-end justify-between gap-0.5 md:gap-1 overflow-x-auto">
                {[15, 12, 10, 8, 12, 25, 45, 75, 85, 90, 88, 85, 82, 80, 78, 75, 70, 65, 55, 40, 30, 25, 20, 18].map((value, index) => (
                  <div key={index} className="flex-1 min-w-[12px] md:min-w-0 flex flex-col items-center gap-1 md:gap-2">
                    <div className="w-full bg-gray-200 rounded-t-lg relative h-48 md:h-64">
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                          value > 70 ? 'bg-emerald-600' : value > 40 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ height: `${value}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] md:text-xs text-gray-600">{index}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Utilization Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Vehicle Utilization Breakdown</h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  { id: 'VHL-001', active: 92, idle: 8, maintenance: 0, status: 'Excellent' },
                  { id: 'VHL-003', active: 88, idle: 10, maintenance: 2, status: 'Good' },
                  { id: 'VHL-007', active: 75, idle: 20, maintenance: 5, status: 'Good' },
                  { id: 'VHL-012', active: 65, idle: 25, maintenance: 10, status: 'Fair' },
                  { id: 'VHL-005', active: 45, idle: 45, maintenance: 10, status: 'Poor' }
                ].map((vehicle) => (
                  <div key={vehicle.id} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{vehicle.id}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Utilization Status: <span className={`font-semibold ${
                          vehicle.status === 'Excellent' ? 'text-green-600' :
                          vehicle.status === 'Good' ? 'text-emerald-600' :
                          vehicle.status === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                        }`}>{vehicle.status}</span></p>
                      </div>
                      <span className="text-base md:text-lg font-bold text-gray-900">{vehicle.active}%</span>
                    </div>
                    <div className="flex gap-1 h-2 md:h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-600" style={{ width: `${vehicle.active}%` }}></div>
                      <div className="bg-gray-400" style={{ width: `${vehicle.idle}%` }}></div>
                      <div className="bg-yellow-500" style={{ width: `${vehicle.maintenance}%` }}></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-[10px] md:text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-600 rounded"></div>
                        <span className="text-gray-600">Active: {vehicle.active}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded"></div>
                        <span className="text-gray-600">Idle: {vehicle.idle}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded"></div>
                        <span className="text-gray-600">Maintenance: {vehicle.maintenance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'compliance' && (
          <div className="space-y-4 md:space-y-6">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Overall Compliance</h3>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">94.5%</p>
                <p className="text-xs md:text-sm text-gray-600">Excellent standing</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Expiring Soon</h3>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600 mb-2">8</p>
                <p className="text-xs md:text-sm text-gray-600">Within 30 days</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Expired Documents</h3>
                <p className="text-2xl md:text-3xl font-bold text-red-600 mb-2">2</p>
                <p className="text-xs md:text-sm text-gray-600">Requires action</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 md:mb-4">Up to Date</h3>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">42</p>
                <p className="text-xs md:text-sm text-gray-600">All compliant</p>
              </div>
            </div>

            {/* Compliance by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Compliance Status by Category</h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  { category: 'Vehicle Insurance', total: 25, compliant: 24, expiring: 1, expired: 0 },
                  { category: 'Vehicle Registration', total: 25, compliant: 23, expiring: 2, expired: 0 },
                  { category: 'Driver Licenses', total: 24, compliant: 22, expiring: 1, expired: 1 },
                  { category: 'Medical Certificates', total: 24, compliant: 20, expiring: 3, expired: 1 },
                  { category: 'Safety Inspections', total: 25, compliant: 24, expiring: 1, expired: 0 }
                ].map((item) => {
                  const complianceRate = ((item.compliant / item.total) * 100).toFixed(1)
                  return (
                    <div key={item.category} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div>
                          <p className="text-xs md:text-sm font-semibold text-gray-900">{item.category}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">{item.total} total documents</p>
                        </div>
                        <span className={`text-base md:text-lg font-bold ${
                          parseFloat(complianceRate) >= 95 ? 'text-green-600' :
                          parseFloat(complianceRate) >= 85 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{complianceRate}%</span>
                      </div>
                      <div className="flex gap-1 h-2 md:h-3 rounded-full overflow-hidden mb-2">
                        <div className="bg-green-600" style={{ width: `${(item.compliant / item.total) * 100}%` }}></div>
                        <div className="bg-yellow-500" style={{ width: `${(item.expiring / item.total) * 100}%` }}></div>
                        <div className="bg-red-600" style={{ width: `${(item.expired / item.total) * 100}%` }}></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs">
                        <span className="text-green-600">✓ {item.compliant} Compliant</span>
                        <span className="text-yellow-600">⚠ {item.expiring} Expiring</span>
                        <span className="text-red-600">✗ {item.expired} Expired</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Upcoming Renewals (Next 30 Days)</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document Type</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entity</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days Left</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { type: 'Vehicle Insurance', entity: 'VHL-002', expiry: '2024-11-15', days: 12, priority: 'High' },
                      { type: 'Driver License', entity: 'John Doe', expiry: '2024-11-20', days: 17, priority: 'Medium' },
                      { type: 'Medical Certificate', entity: 'Jane Smith', expiry: '2024-11-25', days: 22, priority: 'Medium' },
                      { type: 'Safety Inspection', entity: 'VHL-008', expiry: '2024-11-28', days: 25, priority: 'Low' }
                    ].map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-900">{doc.type}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{doc.entity}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">{doc.expiry}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`text-xs md:text-sm font-semibold ${
                            doc.days <= 15 ? 'text-red-600' : doc.days <= 25 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {doc.days} days
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                            doc.priority === 'High' ? 'bg-red-100 text-red-700' :
                            doc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {doc.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'cost-analysis' && (
          <div className="space-y-4 md:space-y-6">
            {/* Cost Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Cost Trends (Last 12 Months)</h3>
              <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 overflow-x-auto">
                {[95000, 102000, 98000, 105000, 112000, 108000, 115000, 120000, 118000, 122000, 128000, 125000].map((value, index) => (
                  <div key={index} className="flex-1 min-w-[30px] md:min-w-0 flex flex-col items-center gap-1 md:gap-2">
                    <div className="w-full bg-gray-200 rounded-t-lg relative h-48 md:h-64">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg"
                        style={{ height: `${(value / 130000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-600">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Budget vs Actual</h3>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { category: 'Fuel', budget: 700000, actual: 685420 },
                    { category: 'Maintenance', budget: 350000, actual: 342180 },
                    { category: 'Insurance', budget: 150000, actual: 148500 },
                    { category: 'Other', budget: 100000, actual: 69580 }
                  ].map((item) => {
                    const variance = ((item.actual - item.budget) / item.budget * 100).toFixed(1)
                    const isOver = item.actual > item.budget
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs md:text-sm font-semibold text-gray-700">{item.category}</span>
                          <span className={`text-xs md:text-sm font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                            {isOver ? '+' : ''}{variance}%
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 mb-1">Budget</p>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-600 mt-1">{item.budget.toLocaleString()} ETB</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 mb-1">Actual</p>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`} 
                                   style={{ width: `${(item.actual / item.budget) * 100}%` }}></div>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-600 mt-1">{item.actual.toLocaleString()} ETB</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Cost Savings Opportunities</h3>
                <div className="space-y-3">
                  {[
                    { opportunity: 'Route Optimization', potential: 45000, impact: 'High' },
                    { opportunity: 'Fuel Efficiency Training', potential: 32000, impact: 'Medium' },
                    { opportunity: 'Preventive Maintenance', potential: 28000, impact: 'High' },
                    { opportunity: 'Idle Time Reduction', potential: 18000, impact: 'Medium' }
                  ].map((item) => (
                    <div key={item.opportunity} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{item.opportunity}</p>
                        <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-medium self-start ${
                          item.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.impact} Impact
                        </span>
                      </div>
                      <p className="text-base md:text-lg font-bold text-emerald-600">{item.potential.toLocaleString()} ETB/month</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
