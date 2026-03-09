'use client'

import { useState } from 'react'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function MaintenancePage() {
  const [costPeriod, setCostPeriod] = useState('Last 6 Months')
  const [summaryFilter, setSummaryFilter] = useState('All')
  const [showNewMaintenanceForm, setShowNewMaintenanceForm] = useState(false)
  const [filterByStatus, setFilterByStatus] = useState<string | null>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [showAlertDetail, setShowAlertDetail] = useState<any>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  
  // New Maintenance Form State
  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    issue: '',
    priority: 'Medium',
    workshop: '',
    estimatedDays: ''
  })

  const vehiclesUnderMaintenance = [
    {
      vehicle: 'Ford Transit',
      id: 'VH-1234',
      issue: 'Engine Overhaul',
      priority: 'Critical',
      priorityColor: 'bg-red-100 text-red-700',
      progress: 45,
      progressColor: 'bg-red-500',
      workshop: 'Main Workshop',
      dueDate: 'Oct 24, 2023'
    },
    {
      vehicle: 'Toyota Hiace',
      id: 'VH-5678',
      issue: 'Brake Pad Replace',
      priority: 'Medium',
      priorityColor: 'bg-yellow-100 text-yellow-700',
      progress: 80,
      progressColor: 'bg-green-500',
      workshop: 'South Wing Garage',
      dueDate: 'Today'
    },
    {
      vehicle: 'Isuzu Truck',
      id: 'VH-9101',
      issue: 'Transmission Leak',
      priority: 'High',
      priorityColor: 'bg-orange-100 text-orange-700',
      progress: 15,
      progressColor: 'bg-orange-500',
      workshop: 'External Svc',
      dueDate: 'Oct 30, 2023'
    }
  ]

  const allAlerts = [
    {
      title: 'Brake Failure Reported',
      subtitle: 'Bus #42 - Campus Loop',
      severity: 'critical',
      bgColor: 'bg-red-50',
      borderColor: 'border-l-red-500',
      details: 'Complete brake system failure detected during routine inspection. Vehicle immediately taken out of service. Requires full brake system replacement including pads, rotors, and hydraulic lines.',
      vehicleId: 'VH-4242',
      reportedBy: 'Driver John Smith',
      reportedAt: 'Oct 22, 2023 - 2:30 PM',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Service Overdue (15 days)',
      subtitle: 'Maintenance Van #08',
      severity: 'warning',
      bgColor: 'bg-orange-50',
      borderColor: 'border-l-orange-500',
      details: 'Scheduled maintenance was due on Oct 7, 2023. Vehicle has exceeded service interval by 15 days and 450km. Requires immediate oil change, filter replacement, and general inspection.',
      vehicleId: 'VH-0008',
      reportedBy: 'System Auto-Alert',
      reportedAt: 'Oct 22, 2023 - 8:00 AM',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Low Fluid Pressure',
      subtitle: 'Security Patrol - Unit 03',
      severity: 'info',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-l-yellow-500',
      details: 'Hydraulic fluid pressure reading below normal threshold. May indicate minor leak or low fluid level. Recommend inspection and fluid top-up.',
      vehicleId: 'VH-0303',
      reportedBy: 'Sensor Alert',
      reportedAt: 'Oct 22, 2023 - 10:15 AM',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Tire Wear Warning',
      subtitle: 'Shuttle Bus #15',
      severity: 'warning',
      bgColor: 'bg-orange-50',
      borderColor: 'border-l-orange-500',
      details: 'Front tires showing uneven wear pattern. Tread depth below recommended level. Schedule tire rotation and alignment check.',
      vehicleId: 'VH-1515',
      reportedBy: 'Maintenance Inspector',
      reportedAt: 'Oct 21, 2023 - 4:45 PM',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Battery Voltage Low',
      subtitle: 'Delivery Truck #22',
      severity: 'info',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-l-yellow-500',
      details: 'Battery voltage reading 11.8V, below optimal 12.6V. Battery may need charging or replacement soon.',
      vehicleId: 'VH-2222',
      reportedBy: 'System Diagnostic',
      reportedAt: 'Oct 21, 2023 - 9:30 AM',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  ]

  const urgentAlerts = allAlerts.slice(0, 3)

  const costData = [
    { month: 'Issues', value: 120, color: 'bg-emerald-500' },
    { month: 'Maint', value: 180, color: 'bg-emerald-500' },
    { month: 'Security', value: 240, color: 'bg-emerald-500' },
    { month: 'Service', value: 200, color: 'bg-emerald-500' },
    { month: 'Trucks', value: 160, color: 'bg-emerald-300' }
  ]

  const commonIssues = [
    { name: 'Engine/Mechanical', percentage: 42 },
    { name: 'Electrical System', percentage: 28 },
    { name: 'Tires & Alignment', percentage: 18 },
    { name: 'Body/Structural', percentage: 12 }
  ]

  const vehicleSummary = [
    { type: 'Shuttle Buses', total: 12, operational: 10, inMaintenance: 2, decommissioned: 0, health: 'Good', healthColor: 'text-green-600', status: 'Active' },
    { type: 'Maintenance Vans', total: 8, operational: 6, inMaintenance: 1, decommissioned: 1, health: 'Fair', healthColor: 'text-yellow-600', status: 'Active' },
    { type: 'Security Patrols', total: 5, operational: 4, inMaintenance: 1, decommissioned: 0, health: 'Excellent', healthColor: 'text-green-600', status: 'Active' },
    { type: 'Delivery Trucks', total: 6, operational: 0, inMaintenance: 0, decommissioned: 6, health: 'N/A', healthColor: 'text-gray-400', status: 'Inactive' }
  ]

  const maxCost = Math.max(...costData.map(d => d.value))

  // Filter vehicles under maintenance based on status
  const filteredVehicles = vehiclesUnderMaintenance.filter(vehicle => {
    if (filterByStatus === 'In Progress') {
      return vehicle.progress > 0 && vehicle.progress < 100
    }
    if (filterByStatus === 'Critical') {
      return vehicle.priority === 'Critical'
    }
    if (filterByStatus === 'Due Today') {
      return vehicle.dueDate === 'Today'
    }
    return true
  })

  // Filter vehicle summary based on active/inactive
  const filteredSummary = vehicleSummary.filter(vehicle => {
    if (summaryFilter === 'Active') return vehicle.status === 'Active'
    if (summaryFilter === 'Inactive') return vehicle.status === 'Inactive'
    return true
  })

  // Handle download table as CSV
  const handleDownload = () => {
    const headers = ['Vehicle', 'ID', 'Issue', 'Priority', 'Progress', 'Workshop', 'Due Date']
    const rows = filteredVehicles.map(v => [
      v.vehicle, v.id, v.issue, v.priority, `${v.progress}%`, v.workshop, v.dueDate
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vehicles-under-maintenance.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Handle print table
  const handlePrint = () => {
    window.print()
  }

  // Handle new maintenance form submission
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`New maintenance entry created for vehicle ${maintenanceForm.vehicleId}`, 'success')
    setShowNewMaintenanceForm(false)
    setMaintenanceForm({
      vehicleId: '',
      issue: '',
      priority: 'Medium',
      workshop: '',
      estimatedDays: ''
    })
  }

  return (
    <>
    <div className="p-3 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-4 md:gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Maintenance Overview</h1>
            <p className="text-xs md:text-sm text-gray-500">Real-time status of university fleet maintenance operations.</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button 
              onClick={() => setFilterByStatus(filterByStatus === 'In Progress' ? null : 'In Progress')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-2 rounded-lg transition-colors text-xs md:text-sm ${
                filterByStatus === 'In Progress' 
                  ? 'bg-orange-50 border-orange-500' 
                  : 'bg-white border-orange-500 hover:bg-orange-50'
              }`}
            >
              <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-500 rounded-full shadow-sm"></span>
              <span className="font-medium text-gray-900 whitespace-nowrap">In Progress</span>
            </button>
            <button 
              onClick={() => setFilterByStatus(filterByStatus === 'Critical' ? null : 'Critical')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-2 rounded-lg transition-colors text-xs md:text-sm ${
                filterByStatus === 'Critical' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-white border-red-500 hover:bg-red-50'
              }`}
            >
              <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full shadow-sm"></span>
              <span className="font-medium text-gray-900 whitespace-nowrap">Critical</span>
            </button>
            <button 
              onClick={() => setFilterByStatus(filterByStatus === 'Due Today' ? null : 'Due Today')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border rounded-lg transition-colors text-xs md:text-sm ${
                filterByStatus === 'Due Today'
                  ? 'bg-gray-100 border-gray-400'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900 whitespace-nowrap">Due Today</span>
            </button>
            <button 
              onClick={() => setShowNewMaintenanceForm(true)}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs md:text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">New Maintenance Entry</span>
              <span className="sm:hidden">New Entry</span>
            </button>
          </div>
        </div>

        {/* Top Section - Vehicle Health & Vehicles Under Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Vehicle Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Vehicle Health</h2>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Excellent</span>
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">75%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fair</span>
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">15%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Poor</span>
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">10%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Overall fleet health is 5% higher than last month</p>
                <p className="text-xs text-emerald-700">4 vehicles transitioned from Fair to Excellent status.</p>
              </div>
            </div>
          </div>
          {/* Vehicles Under Maintenance */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Vehicles Under Maintenance</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download CSV"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Print"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Issue</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Workshop</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No vehicles match the selected filter
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                            </svg>
                            <div>
                              <p className="font-semibold text-gray-900">{vehicle.vehicle}</p>
                              <p className="text-xs text-gray-500">{vehicle.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">{vehicle.issue}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.priorityColor}`}>
                            {vehicle.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div className={`${vehicle.progressColor} h-2 rounded-full`} style={{ width: `${vehicle.progress}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{vehicle.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{vehicle.workshop}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">{vehicle.dueDate}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Middle Section - Urgent Alerts & Maintenance Cost */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Urgent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Urgent Alerts</h2>
            <div className="space-y-2 md:space-y-3">
              {(showAllAlerts ? allAlerts : urgentAlerts).map((alert, index) => (
                <div 
                  key={index} 
                  onClick={() => setShowAlertDetail(alert)}
                  className={`${alert.bgColor} border-l-4 ${alert.borderColor} rounded-r-lg p-3 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  {alert.icon}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600">{alert.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="w-full mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm py-2 flex items-center justify-center gap-1"
            >
              {showAllAlerts ? 'SHOW LESS' : 'VIEW ALL ALERTS'}
              <svg className={`w-4 h-4 transition-transform ${showAllAlerts ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Maintenance Cost & Common Issues */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Maintenance Cost */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Maintenance Cost</h2>
                <select
                  value={costPeriod}
                  onChange={(e) => setCostPeriod(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mb-4">Monthly expenditure by vehicle type</p>

              <div className="h-48 flex items-end justify-between gap-3">
                {costData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative" style={{ height: '192px' }}>
                      <div 
                        className={`absolute bottom-0 w-full ${data.color} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                        style={{ height: `${(data.value / maxCost) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2">Common Issues</h2>
              <p className="text-xs text-gray-500 mb-4 md:mb-6">Frequent problems for maintenance calls</p>

              <div className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{issue.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{issue.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${issue.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* All Vehicles Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900">All Vehicles Summary</h2>
            <div className="flex gap-2">
              {['All', 'Active', 'Inactive'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSummaryFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    summaryFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Count</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operational</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">In Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Decommissioned</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg. Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSummary.map((vehicle, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{vehicle.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{vehicle.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-green-600">{vehicle.operational}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-orange-600">{vehicle.inMaintenance}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{vehicle.decommissioned}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${vehicle.healthColor}`}>{vehicle.health}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Maintenance Entry Modal */}
      {showNewMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Maintenance Entry</h2>
              <button
                onClick={() => setShowNewMaintenanceForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={maintenanceForm.vehicleId}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, vehicleId: e.target.value})}
                  placeholder="e.g., VH-1234"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={maintenanceForm.issue}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, issue: e.target.value})}
                  placeholder="Describe the maintenance issue..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Workshop Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={maintenanceForm.workshop}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, workshop: e.target.value})}
                  placeholder="e.g., Main Workshop"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maintenanceForm.estimatedDays}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, estimatedDays: e.target.value})}
                  placeholder="Number of days"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMaintenanceForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {showAlertDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 md:px-6 py-3 md:py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showAlertDetail.icon}
                <h2 className="text-xl font-bold text-white">Alert Details</h2>
              </div>
              <button
                onClick={() => setShowAlertDetail(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{showAlertDetail.title}</h3>
                <p className="text-sm text-gray-600">{showAlertDetail.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Vehicle ID</p>
                  <p className="text-sm font-semibold text-gray-900">{showAlertDetail.vehicleId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Reported By</p>
                  <p className="text-sm font-semibold text-gray-900">{showAlertDetail.reportedBy}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Reported At</p>
                <p className="text-sm font-semibold text-gray-900">{showAlertDetail.reportedAt}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Details</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{showAlertDetail.details}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    showToast(`Maintenance scheduled for vehicle ${showAlertDetail.vehicleId}`, 'success')
                    setShowAlertDetail(null)
                  }}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Schedule Maintenance
                </button>
                <button
                  onClick={() => setShowAlertDetail(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
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
    </>
  )
}
