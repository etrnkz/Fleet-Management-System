'use client'

import { useState } from 'react'

export default function CompliancePage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const complianceStats = {
    compliant: 32,
    expiringSoon: 5,
    expired: 3,
    total: 40
  }

  const registrations = [
    { vehicle: 'Toyota Coaster ABC-1234', status: 'expiring', expiryDate: '2024-06-25', daysLeft: 10 },
    { vehicle: 'Isuzu NPR XYZ-5678', status: 'expiring', expiryDate: '2024-07-05', daysLeft: 20 },
    { vehicle: 'Mitsubishi Rosa DEF-9012', status: 'expired', expiryDate: '2024-06-01', daysLeft: -14 },
  ]

  const insurance = [
    { vehicle: 'Toyota Hiace GHI-3456', provider: 'Ethiopian Insurance', expiryDate: '2024-08-15', status: 'active' },
    { vehicle: 'Nissan Civilian JKL-7890', provider: 'Awash Insurance', expiryDate: '2024-06-30', status: 'expiring' },
  ]

  const safetyInspections = [
    { vehicle: 'Toyota Coaster ABC-1234', lastInspection: '2024-05-15', nextDue: '2024-11-15', status: 'passed' },
    { vehicle: 'Isuzu NPR XYZ-5678', lastInspection: '2024-06-01', nextDue: '2024-12-01', status: 'passed' },
    { vehicle: 'Mitsubishi Rosa DEF-9012', lastInspection: '2024-05-20', nextDue: '2024-11-20', status: 'failed' },
  ]

  const incidents = [
    { 
      date: '2024-06-10', 
      vehicle: 'Toyota Hiace GHI-3456', 
      type: 'Minor Accident', 
      severity: 'low',
      description: 'Rear-end collision in parking lot',
      status: 'Resolved'
    },
    { 
      date: '2024-05-28', 
      vehicle: 'Nissan Civilian JKL-7890', 
      type: 'Mechanical Failure', 
      severity: 'medium',
      description: 'Engine overheating on highway',
      status: 'Under Investigation'
    },
  ]

  const driverCertifications = [
    { name: 'Ahmed Hassan', license: 'DL-12345', expiryDate: '2025-03-15', status: 'valid' },
    { name: 'Fatuma Mohammed', license: 'DL-23456', expiryDate: '2024-07-20', status: 'expiring' },
    { name: 'Dawit Alemayehu', license: 'DL-34567', expiryDate: '2024-05-30', status: 'expired' },
  ]

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Compliance & Safety</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Monitor regulatory compliance and safety standards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Compliant</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">{complianceStats.compliant}</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Expiring Soon</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">{complianceStats.expiringSoon}</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Within 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Expired</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">{complianceStats.expired}</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Action Required</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-xs md:text-sm opacity-90">Compliance Rate</p>
          <p className="text-2xl md:text-3xl font-bold mt-2">{((complianceStats.compliant / complianceStats.total) * 100).toFixed(0)}%</p>
          <p className="text-xs md:text-sm opacity-80 mt-1">Overall</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {['overview', 'registration', 'insurance', 'safety', 'incidents', 'drivers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm capitalize ${
                selectedTab === tab
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {selectedTab === 'registration' && (
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-bold text-gray-800">Vehicle Registration Status</h3>
              {registrations.map((item, idx) => (
                <div key={idx} className={`p-3 md:p-4 rounded-lg border-l-4 ${
                  item.status === 'expired' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-800">{item.vehicle}</p>
                      <p className="text-xs md:text-sm text-gray-600">Expires: {item.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} days overdue` : `${item.daysLeft} days left`}
                      </span>
                      <button className="text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
                        Renew →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'insurance' && (
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-bold text-gray-800">Insurance Coverage</h3>
              {insurance.map((item, idx) => (
                <div key={idx} className={`p-3 md:p-4 rounded-lg border-l-4 ${
                  item.status === 'expiring' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-800">{item.vehicle}</p>
                      <p className="text-xs md:text-sm text-gray-600">{item.provider} • Expires: {item.expiryDate}</p>
                    </div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                      item.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'safety' && (
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-bold text-gray-800">Safety Inspections</h3>
              {safetyInspections.map((item, idx) => (
                <div key={idx} className={`p-3 md:p-4 rounded-lg border-l-4 ${
                  item.status === 'failed' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-800">{item.vehicle}</p>
                      <p className="text-xs md:text-sm text-gray-600">Last: {item.lastInspection} • Next: {item.nextDue}</p>
                    </div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                      item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'incidents' && (
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-bold text-gray-800">Incident Reports</h3>
              {incidents.map((item, idx) => (
                <div key={idx} className="p-3 md:p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-800">{item.type}</p>
                      <p className="text-xs md:text-sm text-gray-600">{item.vehicle} • {item.date}</p>
                    </div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                      item.severity === 'low' ? 'bg-blue-100 text-blue-700' :
                      item.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 mb-2">{item.description}</p>
                  <p className="text-xs text-gray-600">Status: {item.status}</p>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'drivers' && (
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-bold text-gray-800">Driver Certifications</h3>
              {driverCertifications.map((item, idx) => (
                <div key={idx} className={`p-3 md:p-4 rounded-lg border-l-4 ${
                  item.status === 'expired' ? 'bg-red-50 border-red-500' :
                  item.status === 'expiring' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs md:text-sm text-gray-600">{item.license} • Expires: {item.expiryDate}</p>
                    </div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                      item.status === 'expired' ? 'bg-red-100 text-red-700' :
                      item.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
