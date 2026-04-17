'use client'

import { useEffect, useState } from 'react'
import { vehicleApi, tripApi, collegeApi } from '../../../lib/api'

export default function ReportsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fuel' | 'compliance' | 'cost'>('fuel')

  useEffect(() => {
    Promise.all([
      tripApi.getAll().catch(() => []),
      vehicleApi.getAll().catch(() => []),
      collegeApi.getAll().catch(() => []),
    ]).then(([t, v, c]) => {
      setTrips(Array.isArray(t) ? t : [])
      setVehicles(Array.isArray(v) ? v : [])
      setColleges(Array.isArray(c) ? c : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B3D2F] border-t-transparent" />
    </div>
  )

  const completedTrips = trips.filter(t => t.state === 'COMPLETED')
  const rejectedTrips = trips.filter(t => t.state === 'REJECTED')
  const totalTrips = trips.length

  // Approval rate
  const approvalRate = totalTrips > 0 ? Math.round(((totalTrips - rejectedTrips.length) / totalTrips) * 100) : 0
  const rejectionRate = totalTrips > 0 ? Math.round((rejectedTrips.length / totalTrips) * 100) : 0

  // Fuel consumption per vehicle (from completed trips)
  const fuelByVehicle: Record<string, { plate: string; fuel: number; trips: number }> = {}
  completedTrips.forEach(t => {
    const plate = t.allocatedVehicle?.plateNumber || 'Unassigned'
    if (!fuelByVehicle[plate]) fuelByVehicle[plate] = { plate, fuel: 0, trips: 0 }
    fuelByVehicle[plate].fuel += Number(t.fuelConsumed || 0)
    fuelByVehicle[plate].trips += 1
  })
  const fuelData = Object.values(fuelByVehicle).sort((a, b) => b.fuel - a.fuel).slice(0, 8)
  const maxFuel = Math.max(...fuelData.map(f => f.fuel), 1)

  // Trip compliance: trips submitted at least 48h before departure
  let compliant = 0, nonCompliant = 0
  trips.forEach(t => {
    if (t.createdAt && t.startDateTime) {
      const diff = new Date(t.startDateTime).getTime() - new Date(t.createdAt).getTime()
      if (diff >= 48 * 60 * 60 * 1000) compliant++
      else nonCompliant++
    }
  })
  const complianceRate = totalTrips > 0 ? Math.round((compliant / totalTrips) * 100) : 0

  // Trips per college
  const tripsByCollege: Record<string, number> = {}
  colleges.forEach(c => { tripsByCollege[c.name] = 0 })
  trips.forEach(t => {
    const name = t.requester?.college?.name || t.requester?.department?.college?.name
    if (name) tripsByCollege[name] = (tripsByCollege[name] || 0) + 1
  })
  const collegeData = Object.entries(tripsByCollege)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxCollegeTrips = Math.max(...collegeData.map(([, v]) => v), 1)

  // Estimated cost (fuel cost in ETB: diesel 139.84/L, avg 8km/L)
  const DIESEL_PRICE = 139.84
  const AVG_KM_PER_L = 8
  const costByMonth: Record<string, number> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    costByMonth[key] = 0
  }
  completedTrips.forEach(t => {
    if (t.createdAt) {
      const d = new Date(t.createdAt)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      const fuel = Number(t.fuelConsumed || 0)
      const estimatedCost = fuel > 0 ? fuel * DIESEL_PRICE : (Number(t.distance || 0) / AVG_KM_PER_L) * DIESEL_PRICE
      if (key in costByMonth) costByMonth[key] += estimatedCost
    }
  })
  const maxCost = Math.max(...Object.values(costByMonth), 1)
  const totalEstimatedCost = Object.values(costByMonth).reduce((a, b) => a + b, 0)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">Executive Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Fuel efficiency, compliance & cost analytics</p>
        </div>
        <div className="flex gap-2">
          {(['fuel', 'compliance', 'cost'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab === 'fuel' ? 'Fuel' : tab === 'compliance' ? 'Compliance' : 'Cost'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 border-l-4 border-l-[#1B3D2F]">
          <div className="text-2xl font-bold text-[#1B3D2F]">{approvalRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Approval Rate</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 border-l-4 border-l-red-500">
          <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Rejection Rate</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 border-l-4 border-l-blue-500">
          <div className="text-2xl font-bold text-blue-600">{complianceRate}%</div>
          <div className="text-xs text-gray-500 mt-1">48h Compliance</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 border-l-4 border-l-orange-500">
          <div className="text-2xl font-bold text-orange-600">
            {totalEstimatedCost > 0 ? `${(totalEstimatedCost / 1000).toFixed(1)}K` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Est. Cost (ETB)</div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel by Vehicle */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Fuel Consumption by Vehicle</h2>
            {fuelData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No fuel data from completed trips</p>
            ) : (
              <div className="space-y-3">
                {fuelData.map(item => (
                  <div key={item.plate}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{item.plate}</span>
                      <span className="text-gray-500">{item.fuel.toFixed(1)}L · {item.trips} trips</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-[#1B3D2F]" style={{ width: `${(item.fuel / maxFuel) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trips per College */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Trip Requests by College</h2>
            {collegeData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No college trip data available</p>
            ) : (
              <div className="space-y-3">
                {collegeData.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium truncate max-w-[200px]">{name}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${(count / maxCollegeTrips) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Donut */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">48-Hour Advance Booking Compliance</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1B3D2F" strokeWidth="3.8"
                    strokeDasharray={`${complianceRate} ${100 - complianceRate}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#1B3D2F]">{complianceRate}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1B3D2F]" />
                  <span className="text-sm text-gray-700">Compliant: <strong>{compliant}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-700">Non-compliant: <strong>{nonCompliant}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-sm text-gray-700">Total: <strong>{totalTrips}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Approval vs Rejection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Approval vs Rejection Rate</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">Approved / Processed</span>
                  <span className="text-gray-500">{approvalRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div className="h-4 rounded-full bg-[#1B3D2F] flex items-center justify-end pr-2" style={{ width: `${approvalRate}%` }}>
                    {approvalRate > 15 && <span className="text-[10px] text-white font-bold">{approvalRate}%</span>}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">Rejected</span>
                  <span className="text-gray-500">{rejectionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div className="h-4 rounded-full bg-red-500 flex items-center justify-end pr-2" style={{ width: `${rejectionRate}%` }}>
                    {rejectionRate > 15 && <span className="text-[10px] text-white font-bold">{rejectionRate}%</span>}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                Based on {totalTrips} total trip requests
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Cost Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Estimated Monthly Fuel Cost (ETB)</h2>
            <p className="text-xs text-gray-400 mb-4">Diesel @ 139.84 ETB/L · avg 8km/L</p>
            <div className="flex items-end gap-2 h-40">
              {Object.entries(costByMonth).map(([month, cost]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-700">{cost > 0 ? `${(cost/1000).toFixed(1)}K` : '0'}</span>
                  <div className="w-full bg-orange-500 rounded-t" style={{ height: `${(cost / maxCost) * 100}%`, minHeight: cost > 0 ? '4px' : '2px' }} />
                  <span className="text-[10px] text-gray-500">{month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Cost Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Completed Trips</span>
                <span className="text-sm font-bold text-gray-900">{completedTrips.length}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Fuel Consumed</span>
                <span className="text-sm font-bold text-gray-900">
                  {completedTrips.reduce((s, t) => s + Number(t.fuelConsumed || 0), 0).toFixed(1)} L
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Est. 6-Month Cost</span>
                <span className="text-sm font-bold text-orange-600">
                  ETB {totalEstimatedCost.toLocaleString('en-ET', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Avg Cost per Trip</span>
                <span className="text-sm font-bold text-gray-900">
                  {completedTrips.length > 0
                    ? `ETB ${(totalEstimatedCost / completedTrips.length).toLocaleString('en-ET', { maximumFractionDigits: 0 })}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
