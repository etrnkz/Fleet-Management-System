'use client'

import { useState } from 'react'

export default function FuelPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days')
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])

  const handleDismissAlert = (index: number) => {
    setDismissedAlerts([...dismissedAlerts, index])
  }

  const alerts = [
    {
      type: 'high',
      title: 'High Fuel Usage Alert',
      message: 'Vehicle #H-02 showing a 20% spike in consumption over last 24 hours',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-cyan-500 hover:bg-cyan-600',
      details: {
        vehicleId: 'VH-H-02',
        vehicleName: 'Heavy Truck - Toyota Coaster',
        driver: 'Ahmed Hassan',
        currentConsumption: '12.5 L/100km',
        normalConsumption: '10.4 L/100km',
        spike: '+20%',
        period: 'Last 24 hours',
        totalFuelUsed: '156 L',
        distanceCovered: '1,248 km',
        lastRefuel: '2 hours ago',
        location: 'Highway A1, KM 145',
        possibleCauses: [
          'Heavy traffic conditions',
          'Aggressive driving behavior',
          'Vehicle maintenance required',
          'Route deviation from optimal path'
        ],
        recentTrips: [
          { date: '01-01-2023 14:30', route: 'Main Campus → City Center', distance: '45 km', fuel: '6.2 L' },
          { date: '01-01-2023 10:15', route: 'City Center → North Depot', distance: '38 km', fuel: '5.8 L' },
          { date: '01-01-2023 08:00', route: 'North Depot → Main Campus', distance: '42 km', fuel: '6.5 L' }
        ]
      }
    },
    {
      type: 'warning',
      title: 'High Fuel Usage Alert',
      message: 'Vehicle #H-02 showing a 20% spike in consumption over last 24 hours',
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      details: {
        vehicleId: 'VH-B-05',
        vehicleName: 'Bus - Isuzu NPR',
        driver: 'Bekele Girma',
        currentConsumption: '15.2 L/100km',
        normalConsumption: '12.7 L/100km',
        spike: '+19.7%',
        period: 'Last 24 hours',
        totalFuelUsed: '189 L',
        distanceCovered: '1,243 km',
        lastRefuel: '5 hours ago',
        location: 'South Campus Area',
        possibleCauses: [
          'AC usage in hot weather',
          'Full passenger load',
          'Uphill routes',
          'Engine performance issue'
        ],
        recentTrips: [
          { date: '01-01-2023 16:00', route: 'Student Dorms → Library', distance: '12 km', fuel: '2.1 L' },
          { date: '01-01-2023 13:30', route: 'Library → Sports Complex', distance: '8 km', fuel: '1.5 L' },
          { date: '01-01-2023 09:45', route: 'Main Gate → Student Dorms', distance: '15 km', fuel: '2.8 L' }
        ]
      }
    },
    {
      type: 'warning',
      title: 'Moderate Fuel Usage Alert',
      message: 'Vehicle #V-12 showing a 15% increase in consumption',
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      details: {
        vehicleId: 'VH-V-12',
        vehicleName: 'Van - Toyota Hiace',
        driver: 'Mohammed Ali',
        currentConsumption: '11.5 L/100km',
        normalConsumption: '10.0 L/100km',
        spike: '+15%',
        period: 'Last 24 hours',
        totalFuelUsed: '92 L',
        distanceCovered: '800 km',
        lastRefuel: '8 hours ago',
        location: 'East Campus',
        possibleCauses: [
          'City traffic conditions',
          'Frequent stops',
          'Tire pressure low',
          'Air filter needs replacement'
        ],
        recentTrips: [
          { date: '01-01-2023 15:00', route: 'Admin Block → Medical Center', distance: '18 km', fuel: '2.3 L' },
          { date: '01-01-2023 11:00', route: 'Medical Center → Engineering', distance: '22 km', fuel: '2.8 L' }
        ]
      }
    },
    {
      type: 'high',
      title: 'Critical Fuel Usage Alert',
      message: 'Vehicle #T-08 showing a 25% spike - immediate attention required',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-cyan-500 hover:bg-cyan-600',
      details: {
        vehicleId: 'VH-T-08',
        vehicleName: 'Truck - Isuzu FRR',
        driver: 'Tadesse Girma',
        currentConsumption: '18.8 L/100km',
        normalConsumption: '15.0 L/100km',
        spike: '+25.3%',
        period: 'Last 24 hours',
        totalFuelUsed: '225 L',
        distanceCovered: '1,197 km',
        lastRefuel: '1 hour ago',
        location: 'Highway B3, KM 89',
        possibleCauses: [
          'Possible fuel leak',
          'Engine malfunction',
          'Overloaded vehicle',
          'Faulty fuel injector'
        ],
        recentTrips: [
          { date: '01-01-2023 17:30', route: 'Warehouse → Distribution Center', distance: '65 km', fuel: '12.2 L' },
          { date: '01-01-2023 12:00', route: 'Distribution → Main Campus', distance: '48 km', fuel: '9.0 L' }
        ]
      }
    }
  ]

  const fuelData = [
    { vehicle: 'Truck #10', consumption: 8.5 },
    { vehicle: 'Truck #10', consumption: 7.2 },
    { vehicle: 'Truck #10', consumption: 9.1 },
    { vehicle: 'Truck #10', consumption: 6.8 },
    { vehicle: 'Truck #10', consumption: 8.0 },
    { vehicle: 'Truck #10', consumption: 7.5 },
    { vehicle: 'Truck #10', consumption: 8.8 }
  ]

  const transactions = [
    {
      vehicle: 'VH-01',
      date: '01-01-2023',
      quantity: '125.5 L',
      cost: 'ETB 6,275',
      efficiency: '38.4L/100km',
      status: 'Normal'
    },
    {
      vehicle: 'VH-02',
      date: '01-01-2023',
      quantity: '125.5 L',
      cost: 'ETB 6,275',
      efficiency: '40.4L/100km',
      status: 'Abnormal'
    },
    {
      vehicle: 'Truck #10',
      date: '01-01-2023',
      quantity: '125.5 L',
      cost: 'ETB 6,275',
      efficiency: '38.4L/100km',
      status: 'Normal'
    },
    {
      vehicle: 'VH-012',
      date: '01-01-2023',
      quantity: '125.5 L',
      cost: 'ETB 6,275',
      efficiency: '39.4L/100km',
      status: 'Abnormal'
    },
    {
      vehicle: 'VH-03',
      date: '01-01-2023',
      quantity: '125.5 L',
      cost: 'ETB 6,275',
      efficiency: '40.4L/100km',
      status: 'Normal'
    }
  ]

  const maxConsumption = Math.max(...fuelData.map(d => d.consumption))

  const activeAlerts = alerts.filter((_, index) => !dismissedAlerts.includes(index))

  return (
    <div className="p-3 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-4 md:gap-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Fuel Consumption Analytics</h1>
        <p className="text-xs md:text-sm text-gray-500">Monitor efficiency and manage intake logs</p>
      </div>

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Active Alerts ({activeAlerts.length})</h2>
          {activeAlerts.length > 2 && (
            <button 
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showAllAlerts ? 'Show Less' : 'View All Alerts'}
            </button>
          )}
        </div>
        {activeAlerts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 text-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm md:text-base text-gray-500 font-medium">No active alerts</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">All fuel consumption is within normal range</p>
          </div>
        ) : (
          <div className={`grid gap-3 md:gap-4 ${showAllAlerts ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} ${showAllAlerts ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
            {(showAllAlerts ? activeAlerts : activeAlerts.slice(0, 2)).map((alert) => {
              const originalIndex = alerts.indexOf(alert)
              return (
          <div key={originalIndex} className={`${alert.bgColor} border ${alert.borderColor} rounded-xl p-3 md:p-4 flex items-start gap-3 md:gap-4`}>
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                {alert.type === 'high' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{alert.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{alert.message}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => setSelectedAlert(alert)}
                  className={`px-3 md:px-4 py-2 ${alert.buttonColor} text-white rounded-lg transition-colors text-xs md:text-sm font-medium`}
                >
                  Investigate
                </button>
                <button 
                  onClick={() => handleDismissAlert(originalIndex)}
                  className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-xs md:text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
              )
            })}
        </div>
        )}
      </div>
      {/* Fleet Fuel Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Fleet Fuel Comparison (L/100km)</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-xs md:text-sm"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
        </div>

        {/* Bar Chart */}
        <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 overflow-x-auto">
          {fuelData.map((data, index) => (
            <div key={index} className="flex-1 min-w-[40px] md:min-w-0 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                  style={{ height: `${(data.consumption / maxConsumption) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] md:text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.consumption} L/100km
                  </div>
                </div>
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 font-medium truncate w-full text-center">{data.vehicle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Fuel Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Fuel Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm font-semibold text-gray-900">{transaction.vehicle}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm text-gray-600">{transaction.date}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm text-gray-600">{transaction.quantity}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm font-semibold text-gray-900">{transaction.cost}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-xs md:text-sm text-gray-600">{transaction.efficiency}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                      transaction.status === 'Normal' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Investigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-bold text-gray-900">Fuel Usage Investigation</h2>
                  <p className="text-xs md:text-sm text-gray-500">{selectedAlert.details.vehicleId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6">
              {/* Alert Summary */}
              <div className={`${selectedAlert.bgColor} border ${selectedAlert.borderColor} rounded-xl p-3 md:p-4 mb-4 md:mb-6`}>
                <div className="flex items-start gap-2 md:gap-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm md:text-base font-bold text-gray-900 mb-1">{selectedAlert.title}</p>
                    <p className="text-xs md:text-sm text-gray-700">{selectedAlert.message}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Vehicle Information</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Vehicle</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.vehicleName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Current Location</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.location}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Last Refuel</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.lastRefuel}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Driver Information</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 flex items-center gap-2 md:gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.driver}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Assigned Driver</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Distance Covered</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.distanceCovered}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1">Total Fuel Used</p>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">{selectedAlert.details.totalFuelUsed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consumption Comparison */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Fuel Consumption Analysis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-green-600 font-medium mb-1">Normal Consumption</p>
                    <p className="text-xl md:text-2xl font-bold text-green-700">{selectedAlert.details.normalConsumption}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-red-600 font-medium mb-1">Current Consumption</p>
                    <p className="text-xl md:text-2xl font-bold text-red-700">{selectedAlert.details.currentConsumption}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-orange-600 font-medium mb-1">Spike</p>
                    <p className="text-xl md:text-2xl font-bold text-orange-700">{selectedAlert.details.spike}</p>
                  </div>
                </div>
              </div>

              {/* Possible Causes */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Possible Causes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {selectedAlert.details.possibleCauses.map((cause: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5 md:p-3">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs md:text-sm text-gray-700">{cause}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Trips */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Recent Trips</h3>
                <div className="space-y-2">
                  {selectedAlert.details.recentTrips.map((trip: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2.5 md:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{trip.route}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{trip.date}</p>
                      </div>
                      <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500">Distance</p>
                          <p className="font-semibold text-gray-900">{trip.distance}</p>
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500">Fuel</p>
                          <p className="font-semibold text-gray-900">{trip.fuel}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm">
                  Schedule Maintenance
                </button>
                <button className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs md:text-sm">
                  Contact Driver
                </button>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs md:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
