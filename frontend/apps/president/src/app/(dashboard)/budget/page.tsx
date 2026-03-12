'use client'

import { useState } from 'react'

export default function BudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedYear, setSelectedYear] = useState('2024')

  const budgetData = {
    totalBudget: 5000000,
    totalSpent: 4350000,
    remaining: 650000,
    percentageUsed: 87
  }

  const categoryBreakdown = [
    { category: 'Fuel', budget: 2000000, spent: 1850000, percentage: 92.5, color: 'bg-red-500' },
    { category: 'Maintenance', budget: 1500000, spent: 1200000, percentage: 80, color: 'bg-yellow-500' },
    { category: 'Insurance', budget: 800000, spent: 800000, percentage: 100, color: 'bg-green-500' },
    { category: 'Registration', budget: 300000, spent: 250000, percentage: 83.3, color: 'bg-blue-500' },
    { category: 'Driver Salaries', budget: 400000, spent: 250000, percentage: 62.5, color: 'bg-purple-500' },
  ]

  const departmentCosts = [
    { name: 'Engineering', cost: 1250000, trips: 145, avgCost: 8620 },
    { name: 'Medicine', cost: 980000, trips: 112, avgCost: 8750 },
    { name: 'Business', cost: 750000, trips: 98, avgCost: 7653 },
    { name: 'Natural Sciences', cost: 620000, trips: 85, avgCost: 7294 },
    { name: 'Arts', cost: 450000, trips: 67, avgCost: 6716 },
    { name: 'Agriculture', cost: 300000, trips: 45, avgCost: 6667 },
  ]

  const monthlyTrend = [
    { month: 'Jan', budget: 416667, spent: 380000 },
    { month: 'Feb', budget: 416667, spent: 395000 },
    { month: 'Mar', budget: 416667, spent: 425000 },
    { month: 'Apr', budget: 416667, spent: 410000 },
    { month: 'May', budget: 416667, spent: 445000 },
    { month: 'Jun', budget: 416667, spent: 460000 },
  ]

  const alerts = [
    { type: 'critical', message: 'Fuel budget exceeded by 12% this month', action: 'Review fuel consumption' },
    { type: 'warning', message: 'Insurance renewal due in 15 days', action: 'Process renewal' },
    { type: 'info', message: 'Maintenance costs 20% under budget', action: 'View details' },
  ]

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Budget & Financial Overview</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Comprehensive fleet financial management</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base whitespace-nowrap">
            Export Report
          </button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Total Budget</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">ETB {(budgetData.totalBudget / 1000000).toFixed(1)}M</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Fiscal Year {selectedYear}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Total Spent</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">ETB {(budgetData.totalSpent / 1000000).toFixed(1)}M</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">{budgetData.percentageUsed}% of budget</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Remaining</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">ETB {(budgetData.remaining / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">{100 - budgetData.percentageUsed}% available</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Avg Cost/Trip</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">ETB 7,850</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">552 trips total</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Budget Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 md:p-4 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm md:text-base text-gray-800 font-medium">{alert.message}</p>
                <button className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                  {alert.action} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Budget by Category</h3>
          <div className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-xs md:text-sm font-bold text-gray-800">
                    ETB {(item.spent / 1000).toFixed(0)}K / {(item.budget / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                  <div
                    className={`${item.color} h-2.5 md:h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.percentage}% utilized</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Monthly Spending Trend</h3>
          <div className="space-y-4">
            {monthlyTrend.map((item) => (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.month}</span>
                  <span className="text-xs md:text-sm font-bold text-gray-800">
                    ETB {(item.spent / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                  <div
                    className={`h-2.5 md:h-3 rounded-full transition-all duration-500 ${
                      item.spent > item.budget ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(item.spent / item.budget) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {item.spent > item.budget ? 'Over' : 'Under'} budget by ETB {Math.abs(item.spent - item.budget).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Costs */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Cost by Department</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Department</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Total Cost</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Trips</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Avg/Trip</th>
                </tr>
              </thead>
              <tbody>
                {departmentCosts.map((dept) => (
                  <tr key={dept.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800 font-medium">{dept.name}</td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-800">ETB {(dept.cost / 1000).toFixed(0)}K</td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">{dept.trips}</td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm text-emerald-600 font-medium">ETB {dept.avgCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
