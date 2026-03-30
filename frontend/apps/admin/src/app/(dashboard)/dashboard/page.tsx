'use client'

import { useState, useEffect } from 'react'
import Toast, { ToastType } from '@/components/Toast'
import { tripApi, vehicleApi, driverApi, maintenanceApi, fuelApi } from '@/lib/api'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function DashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null)
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeTrips: 0,
    pendingMaintenance: 0,
    fuelUsage: 0,
  })
  const [alerts, setAlerts] = useState<any[]>([])
  const [allVehicles, setAllVehicles] = useState<any[]>([])
  const [allDrivers, setAllDrivers] = useState<any[]>([])
  const [allTrips, setAllTrips] = useState<any[]>([])
  const [allMaintenance, setAllMaintenance] = useState<any[]>([])

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [vehicles, trips, maintenance, fuel, drivers, allTripsData] = await Promise.all([
        vehicleApi.getAll().catch(() => []),
        tripApi.getAll({ state: 'IN_PROGRESS' }).catch(() => []),
        maintenanceApi.getAll('Submitted,EstimateProvided').catch(() => []),
        fuelApi.getAll().catch(() => []),
        driverApi.getAll().catch(() => []),
        tripApi.getAll().catch(() => []),
      ])

      const vehiclesArray = Array.isArray(vehicles) ? vehicles : []
      const tripsArray = Array.isArray(trips) ? trips : []
      const maintenanceArray = Array.isArray(maintenance) ? maintenance : []
      const fuelArray = Array.isArray(fuel) ? fuel : []
      const driversArray = Array.isArray(drivers) ? drivers : []
      const allTripsArray = Array.isArray(allTripsData) ? allTripsData : []

      setAllVehicles(vehiclesArray)
      setAllDrivers(driversArray)
      setAllTrips(allTripsArray)
      setAllMaintenance(maintenanceArray)

      setStats({
        totalVehicles: vehiclesArray.length,
        activeTrips: tripsArray.length,
        pendingMaintenance: maintenanceArray.length,
        fuelUsage: fuelArray.reduce((sum: number, record: any) => sum + (record.quantity || 0), 0),
      })

      // Create alerts from real data
      const newAlerts: any[] = []
      
      // Add maintenance alerts
      maintenanceArray.slice(0, 2).forEach((m: any) => {
        newAlerts.push({
          type: 'Maintenance Due',
          message: `${m.vehicle?.plateNumber || 'Vehicle'} requires maintenance`,
          time: new Date(m.createdAt).toLocaleString(),
          color: 'border-yellow-500',
          details: {
            vehicle: m.vehicle?.plateNumber || 'N/A',
            issueDescription: m.issueDescription,
            priority: m.priority,
            status: m.status,
            severity: 'Medium'
          },
          icon: (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        })
      })

      // Add trip completion alerts
      tripsArray.slice(0, 2).forEach((t: any) => {
        newAlerts.push({
          type: 'Active Trip',
          message: `Trip to ${t.destination} is in progress`,
          time: new Date(t.startDateTime).toLocaleString(),
          color: 'border-emerald-500',
          details: {
            destination: t.destination,
            purpose: t.purpose,
            driver: t.allocatedDriver?.user?.firstName || 'N/A',
            vehicle: t.allocatedVehicle?.plateNumber || 'N/A',
            status: t.state,
          },
          icon: (
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        })
      })

      setAlerts(newAlerts)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    {
      label: 'TOTAL VEHICLES',
      value: stats.totalVehicles.toString(),
      change: '+2.4%',
      changePositive: true,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      ),
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'ACTIVE TRIPS',
      value: stats.activeTrips.toString(),
      change: '+5.1%',
      changePositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'MAINTENANCE',
      value: stats.pendingMaintenance.toString(),
      subtitle: 'Pending',
      change: '-1.2%',
      changePositive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      label: 'FUEL USAGE',
      value: Math.round(stats.fuelUsage).toString(),
      subtitle: 'Liters',
      change: '-3.5%',
      changePositive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    },
  ]

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert)
  }

  const closeAlertDetails = () => {
    setSelectedAlert(null)
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      const vehicleData: any = {
        vehicleId: formData.get('vehicleId'),
        plateNumber: formData.get('plateNumber'),
        vehicleType: formData.get('vehicleType'),
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        fuelType: formData.get('fuelType'),
        status: formData.get('status') || 'Active',
      }

      // Add optional fields if provided
      if (formData.get('color')) vehicleData.color = formData.get('color')
      if (formData.get('vinNumber')) vehicleData.vinNumber = formData.get('vinNumber')
      if (formData.get('fuelCapacity')) vehicleData.fuelCapacity = parseInt(formData.get('fuelCapacity') as string)
      if (formData.get('capacity')) vehicleData.capacity = parseInt(formData.get('capacity') as string)
      if (formData.get('currentMileage')) vehicleData.currentMileage = parseInt(formData.get('currentMileage') as string)
      if (formData.get('purchaseDate')) vehicleData.purchaseDate = formData.get('purchaseDate')
      if (formData.get('insuranceExpiryDate')) vehicleData.insuranceExpiryDate = formData.get('insuranceExpiryDate')
      if (formData.get('nextServiceDate')) vehicleData.nextServiceDate = formData.get('nextServiceDate')
      if (formData.get('notes')) vehicleData.notes = formData.get('notes')

      await vehicleApi.create(vehicleData)
      showToast('Vehicle added successfully!', 'success')
      setShowAddVehicleForm(false)
      loadDashboardData() // Reload data
    } catch (error: any) {
      showToast(error.message || 'Failed to add vehicle', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <>
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.subtitle && <span className="text-sm text-gray-500">{stat.subtitle}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Fuel Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => setShowAddVehicleForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Vehicle
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Assign Driver
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Log Trip
              </button>
            </div>
          </div>

          {/* Fuel Consumption Trend */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fuel Consumption Trend</h2>
                <p className="text-sm text-gray-500">Weekly usage in liters across fleet</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>

            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-2 md:gap-3 border-b border-gray-200 pb-2">
              {[
                { day: 'MON', height: 55, value: 220 },
                { day: 'TUE', height: 70, value: 280 },
                { day: 'WED', height: 85, value: 340 },
                { day: 'THU', height: 75, value: 300 },
                { day: 'FRI', height: 60, value: 240 },
                { day: 'SAT', height: 90, value: 360 },
                { day: 'SUN', height: 65, value: 260 },
              ].map((bar, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tooltip */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {bar.value}L
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:from-emerald-700 hover:to-emerald-500 transition-all cursor-pointer shadow-sm"
                      style={{ height: `${bar.height}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{bar.day}</span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span>Fuel Usage (Liters)</span>
              </div>
            </div>
          </div>

          {/* Charts Row - Trip Status + Fleet Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Trip Status Donut */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-4">Trip Status</h2>
              {(() => {
                const pending = allTrips.filter(t => t.state?.includes('PENDING')).length
                const approved = allTrips.filter(t => t.state === 'APPROVED_FOR_ALLOCATION' || t.state === 'CAR_ALLOCATED' || t.state === 'READY').length
                const inProgress = allTrips.filter(t => t.state === 'IN_PROGRESS').length
                const completed = allTrips.filter(t => t.state === 'COMPLETED').length
                const total = Math.max(pending + approved + inProgress + completed, 1)
                const circ = 2 * Math.PI * 38
                const segments = [
                  { label: 'Pending', count: pending, color: '#eab308', bg: 'bg-yellow-400' },
                  { label: 'Approved', count: approved, color: '#10b981', bg: 'bg-emerald-500' },
                  { label: 'In Progress', count: inProgress, color: '#3b82f6', bg: 'bg-blue-500' },
                  { label: 'Completed', count: completed, color: '#6366f1', bg: 'bg-indigo-500' },
                ]
                let off = 0
                return (
                  <div className="flex items-center gap-4">
                    <svg width="90" height="90" viewBox="0 0 100 100" className="flex-shrink-0">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="16"/>
                      {segments.map((s, i) => {
                        const dash = (s.count / total) * circ
                        const seg = <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={s.color} strokeWidth="16"
                          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} transform="rotate(-90 50 50)"/>
                        off += dash
                        return seg
                      })}
                      <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827">{allTrips.length}</text>
                      <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#6b7280">Total</text>
                    </svg>
                    <div className="space-y-2 flex-1 text-xs">
                      {segments.map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${s.bg}`}></div><span className="text-gray-600">{s.label}</span></div>
                          <span className="font-bold text-gray-800">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Fleet Status Donut */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-4">Fleet Status</h2>
              {(() => {
                const active = allVehicles.filter(v => v.status === 'Active').length
                const maintenance = allVehicles.filter(v => v.status === 'UnderMaintenance').length
                const inactive = allVehicles.filter(v => v.status === 'Inactive').length
                const total = Math.max(active + maintenance + inactive, 1)
                const circ = 2 * Math.PI * 38
                const segments = [
                  { label: 'Active', count: active, color: '#10b981', bg: 'bg-emerald-500' },
                  { label: 'Maintenance', count: maintenance, color: '#f97316', bg: 'bg-orange-500' },
                  { label: 'Inactive', count: inactive, color: '#ef4444', bg: 'bg-red-500' },
                ]
                let off = 0
                return (
                  <div className="flex items-center gap-4">
                    <svg width="90" height="90" viewBox="0 0 100 100" className="flex-shrink-0">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="16"/>
                      {segments.map((s, i) => {
                        const dash = (s.count / total) * circ
                        const seg = <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={s.color} strokeWidth="16"
                          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} transform="rotate(-90 50 50)"/>
                        off += dash
                        return seg
                      })}
                      <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827">{allVehicles.length}</text>
                      <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#6b7280">Total</text>
                    </svg>
                    <div className="space-y-2 flex-1 text-xs">
                      {segments.map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${s.bg}`}></div><span className="text-gray-600">{s.label}</span></div>
                          <span className="font-bold text-gray-800">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Monthly Trips Trend */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Monthly Trip Requests</h2>
                <p className="text-xs text-gray-500">Last 6 months</p>
              </div>
            </div>
            {(() => {
              const now = new Date()
              const months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
                return { label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() }
              })
              const counts = months.map(m => allTrips.filter(t => {
                const d = new Date(t.createdAt)
                return d.getFullYear() === m.year && d.getMonth() === m.month
              }).length)
              const maxVal = Math.max(...counts, 1)
              return (
                <div>
                  <div className="flex items-end gap-2 h-28 border-b border-gray-100 pb-2">
                    {months.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{counts[i]} trips</div>
                          <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t hover:from-emerald-700 hover:to-emerald-500 transition-colors"
                            style={{ height: `${(counts[i] / maxVal) * 100}px`, minHeight: counts[i] > 0 ? '4px' : '0' }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Pending Approvals by Level */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-base font-bold text-gray-900 mb-4">Pending Approvals by Level</h2>
            {(() => {
              const levels = [
                { level: 'Department Head', state: 'PENDING_DEPARTMENT', color: 'bg-yellow-400' },
                { level: 'College Head', state: 'PENDING_COLLEGE', color: 'bg-orange-400' },
                { level: 'Dean', state: 'PENDING_DEAN', color: 'bg-red-400' },
                { level: 'Deployment Team', state: 'APPROVED_FOR_ALLOCATION', color: 'bg-blue-400' },
                { level: 'Transport Office', state: 'CAR_ALLOCATED', color: 'bg-purple-400' },
              ].map(l => ({ ...l, count: allTrips.filter(t => t.state === l.state).length }))
              const maxCount = Math.max(...levels.map(l => l.count), 1)
              return (
                <div className="space-y-3">
                  {levels.map(item => (
                    <div key={item.level}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{item.level}</span>
                        <span className="font-bold text-gray-800">{item.count}</span>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '8px' : '0' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Right Column - Real-time Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Real-time Alerts</h2>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <button
                key={index}
                onClick={() => handleAlertClick(alert)}
                className={`w-full text-left border-l-4 ${alert.color} bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  {alert.icon}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{alert.type}</p>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <button className="w-full mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm py-2">
            View All Activity
          </button>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                {selectedAlert.icon}
                <h2 className="text-xl font-bold text-gray-900">{selectedAlert.type}</h2>
              </div>
              <button
                onClick={closeAlertDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Alert Message */}
              <div className={`border-l-4 ${selectedAlert.color} bg-gray-50 p-4 rounded-r-lg mb-6`}>
                <p className="text-gray-900 font-medium mb-2">{selectedAlert.message}</p>
                <p className="text-sm text-gray-500">{selectedAlert.time}</p>
              </div>

              {/* Alert Details Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedAlert.details).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-gray-900 font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Take Action
                </button>
                <button 
                  onClick={closeAlertDetails}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
              </div>
              <button
                onClick={() => setShowAddVehicleForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAddVehicle} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleId"
                    required
                    placeholder="e.g., VEH-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    required
                    placeholder="e.g., ET-3-12345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicleType"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="make"
                    required
                    placeholder="e.g., Toyota"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    required
                    placeholder="e.g., Hilux"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    placeholder="e.g., 2024"
                    min="1990"
                    max="2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    placeholder="e.g., White"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIN Number
                  </label>
                  <input
                    type="text"
                    name="vinNumber"
                    placeholder="Vehicle Identification Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Technical Specifications */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Specifications</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuelType"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Capacity (Liters)
                  </label>
                  <input
                    type="number"
                    name="fuelCapacity"
                    placeholder="e.g., 80"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    name="currentMileage"
                    placeholder="e.g., 15000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Operational Details */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Operational Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Under Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    name="nextServiceDate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Additional information about the vehicle..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVehicleForm(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
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
    </>
  )
}
