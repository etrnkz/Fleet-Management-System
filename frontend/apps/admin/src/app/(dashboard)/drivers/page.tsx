'use client'

import { useState } from 'react'

export default function DriversPage() {
  const [activeFilter, setActiveFilter] = useState('All Drivers')
  const [selectedDriver, setSelectedDriver] = useState('Lemesa Girma')

  const drivers = [
    {
      name: 'Lemesa Girma',
      id: 'DRV-9821-ET',
      status: 'AVAILABLE',
      statusColor: 'bg-green-100 text-green-700',
      license: '98218842-X',
      phone: '+251914625477',
      hasTrip: false,
      selected: true
    },
    {
      name: 'Abdi Girma',
      id: 'DRV-5590-ET',
      status: 'ON TRIP',
      statusColor: 'bg-blue-100 text-blue-700',
      license: '55901122-Z',
      phone: '+251914625477',
      hasTrip: true,
      selected: false
    },
    {
      name: 'Tadesse Girma',
      id: 'DRV-1102-ET',
      status: 'OFF DUTY',
      statusColor: 'bg-gray-100 text-gray-700',
      license: '11027788-W',
      phone: '+251914625477',
      hasTrip: false,
      selected: false
    },
    {
      name: 'Bekele Girma',
      id: 'DRV-3321-ET',
      status: 'ON TRIP',
      statusColor: 'bg-blue-100 text-blue-700',
      license: '33213344-Y',
      phone: '+251914625477',
      hasTrip: true,
      selected: false
    },
    {
      name: 'Amanuel Girma',
      id: 'DRV-8098-ET',
      status: 'AVAILABLE',
      statusColor: 'bg-green-100 text-green-700',
      license: '00986677-Q',
      phone: '+251914625477',
      hasTrip: false,
      selected: false
    },
    {
      name: 'Tesfaye Girma',
      id: 'DRV-4421-ET',
      status: 'AVAILABLE',
      statusColor: 'bg-green-100 text-green-700',
      license: '44218822-L',
      phone: '+251914625477',
      hasTrip: false,
      selected: false
    },
  ]

  const activityLog = [
    {
      type: 'Status Update',
      message: 'Driver marked as Available at Addis Ababa Yard.',
      time: '2 min ago',
      color: 'bg-green-500'
    },
    {
      type: 'Trip Completed',
      message: 'Completed Trip #8842 (Addis Ababa to Adama).',
      time: '45 min ago',
      color: 'bg-blue-500'
    },
    {
      type: 'Maintenance Alert',
      message: 'Reported minor engine noise on Vehicle ET-450.',
      time: '3 hrs ago',
      color: 'bg-yellow-500'
    },
    {
      type: 'Shift Started',
      message: 'Logged in via mobile app.',
      time: 'Today, 08:00 AM',
      color: 'bg-blue-500'
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Management</h1>
        <p className="text-gray-600">Monitor and manage your fleet drivers' status and assignments.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveFilter('All Drivers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'All Drivers'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Drivers
        </button>
        <button
          onClick={() => setActiveFilter('Available')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Available
        </button>
        <button
          onClick={() => setActiveFilter('On Trip')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          On Trip
        </button>
        <button
          onClick={() => setActiveFilter('Off Duty')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          Off Duty
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drivers Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                  driver.selected
                    ? 'border-emerald-500'
                    : 'border-gray-200'
                }`}
              >
                {/* Driver Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{driver.name}</h3>
                    <p className="text-sm text-gray-500">ID: {driver.id}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${driver.statusColor}`}>
                      {driver.status}
                    </span>
                  </div>
                </div>

                {/* Driver Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>LIC: {driver.license}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{driver.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {driver.hasTrip ? (
                    <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      View Trip
                    </button>
                  ) : (
                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                      Assign Trip
                    </button>
                  )}
                  <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Activity Log */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Activity Log</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selected Driver: <span className="text-emerald-600 font-medium">{selectedDriver}</span>
            </p>

            <div className="space-y-4">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{activity.type}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
              View Full History
            </button>
          </div>

          {/* Fleet Performance */}
          <div className="bg-emerald-600 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-2">FLEET PERFORMANCE</h3>
            
            <div className="mb-4">
              <p className="text-sm text-emerald-100 mb-2">Active Trips</p>
              <p className="text-4xl font-bold">12</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-emerald-500 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: '80%' }}></div>
              </div>
            </div>

            <p className="text-sm text-emerald-100">
              80% of capacity currently in transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
