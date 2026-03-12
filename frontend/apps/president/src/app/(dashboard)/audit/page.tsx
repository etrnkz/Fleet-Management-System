'use client'

import { useState } from 'react'

export default function AuditPage() {
  const [filterType, setFilterType] = useState('all')

  const auditLogs = [
    {
      id: 1,
      date: '2024-06-15 10:30 AM',
      user: 'President',
      action: 'Approved',
      type: 'approval',
      details: 'Request REQ-2024-1245 - Engineering International Trip',
      impact: 'ETB 125,000'
    },
    {
      id: 2,
      date: '2024-06-14 02:15 PM',
      user: 'President',
      action: 'Rejected',
      type: 'approval',
      details: 'Request REQ-2024-1240 - Personal Travel Request',
      impact: 'ETB 35,000'
    },
    {
      id: 3,
      date: '2024-06-13 09:45 AM',
      user: 'Admin',
      action: 'Updated',
      type: 'policy',
      details: 'Fleet Usage Policy - Maximum trip duration changed to 7 days',
      impact: 'Policy Change'
    },
    {
      id: 4,
      date: '2024-06-12 11:20 AM',
      user: 'President',
      action: 'Approved',
      type: 'budget',
      details: 'Budget adjustment for Q2 maintenance - Increased by 15%',
      impact: 'ETB 225,000'
    },
    {
      id: 5,
      date: '2024-06-10 03:30 PM',
      user: 'Fleet Manager',
      action: 'Created',
      type: 'incident',
      details: 'Incident Report INC-2024-089 - Minor accident Toyota Hiace',
      impact: 'Vehicle Grounded'
    },
    {
      id: 6,
      date: '2024-06-08 08:15 AM',
      user: 'President',
      action: 'Approved',
      type: 'approval',
      details: 'Request REQ-2024-1238 - Medical Emergency Transport',
      impact: 'ETB 28,000'
    },
  ]

  const filteredLogs = filterType === 'all' ? auditLogs : auditLogs.filter(log => log.type === filterType)

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Audit Trail</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Complete history of all system activities</p>
        </div>
        <button className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base whitespace-nowrap">
          Export Audit Log
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'approval', 'budget', 'policy', 'incident'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm capitalize ${
                filterType === type
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 md:p-4 bg-gray-50 rounded-lg border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.action === 'Approved' ? 'bg-green-100 text-green-700' :
                      log.action === 'Rejected' ? 'bg-red-100 text-red-700' :
                      log.action === 'Updated' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium capitalize">
                      {log.type}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium text-gray-800">{log.details}</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">By {log.user} • {log.date}</p>
                </div>
                <span className="text-xs md:text-sm font-bold text-emerald-600 whitespace-nowrap">{log.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
