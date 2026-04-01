'use client'

import { useState, useEffect } from 'react'
import { vehicleApi, driverApi, tripApi, fuelApi, maintenanceApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [selectedReport, setSelectedReport] = useState('fleet-performance')
  const [dateRange, setDateRange] = useState('last-30-days')
  
  // Data states
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [fuelRecords, setFuelRecords] = useState<any[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [vehiclesData, driversData, tripsData, fuelData, maintenanceData] = await Promise.all([
        vehicleApi.getAll(),
        driverApi.getAll(),
        tripApi.getAll(),
        fuelApi.getAll(),
        maintenanceApi.getAll(),
      ])
      
      setVehicles(vehiclesData as any[])
      setDrivers(driversData as any[])
      setTrips(tripsData as any[])
      setFuelRecords(fuelData as any[])
      setMaintenanceRequests(maintenanceData as any[])
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to fetch data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: string) => {
    setToast({ message: `Exporting ${selectedReport} report as ${format.toUpperCase()}`, type: 'success' })
  }

  // Calculate statistics
  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'Available').length,
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === 'Available').length,
    totalTrips: trips.length,
    completedTrips: trips.filter(t => t.state === 'COMPLETED').length,
    totalFuelCost: fuelRecords.reduce((sum, f) => sum + (f.totalCost || 0), 0),
    totalMaintenanceCost: maintenanceRequests.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0),
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-4 md:gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
            <p className="text-xs md:text-sm text-gray-500">Generate comprehensive reports and analyze fleet performance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Total Vehicles</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalVehicles}</p>
            <p className="text-xs text-green-600 mt-1">{stats.activeVehicles} active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Total Drivers</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalDrivers}</p>
            <p className="text-xs text-green-600 mt-1">{stats.activeDrivers} available</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Total Trips</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
            <p className="text-xs text-green-600 mt-1">{stats.completedTrips} completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <p className="text-xs md:text-sm text-gray-600 mb-2">Total Fuel Cost</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600">
              ETB {stats.totalFuelCost.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Fleet Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Fleet Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mileage</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fuel Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.slice(0, 10).map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{vehicle.plateNumber}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{vehicle.make} {vehicle.model}</p>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                        vehicle.status === 'Available' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="text-xs md:text-sm text-gray-900">
                        {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '-'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="text-xs md:text-sm text-gray-900">{vehicle.fuelType || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Driver Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {drivers.slice(0, 6).map((driver) => (
              <div key={driver.id} className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {(driver.user?.name || driver.name || 'DR').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{driver.user?.name || driver.name || 'Unknown'}</p>
                    <p className="text-[10px] md:text-xs text-gray-500">{driver.licenseNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    driver.status === 'Available' ? 'bg-green-100 text-green-700' :
                    driver.status === 'On Trip' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {driver.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Maintenance Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Submitted</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700">
                {maintenanceRequests.filter(m => m.status === 'Submitted').length}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 md:p-4 border border-orange-200">
              <p className="text-xs text-orange-600 mb-1">In Progress</p>
              <p className="text-xl md:text-2xl font-bold text-orange-700">
                {maintenanceRequests.filter(m => m.status === 'InProgress').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
              <p className="text-xs text-green-600 mb-1">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">
                {maintenanceRequests.filter(m => m.status === 'Completed').length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 md:p-4 border border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Total Cost</p>
              <p className="text-xl md:text-2xl font-bold text-purple-700">
                ETB {stats.totalMaintenanceCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Trip Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Trip Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{trips.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">In Progress</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700">
                {trips.filter(t => t.state === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
              <p className="text-xs text-green-600 mb-1">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">
                {trips.filter(t => t.state === 'COMPLETED').length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 md:p-4 border border-yellow-200">
              <p className="text-xs text-yellow-600 mb-1">Pending</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-700">
                {trips.filter(t => t.state.includes('PENDING')).length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 md:p-4 border border-red-200">
              <p className="text-xs text-red-600 mb-1">Cancelled</p>
              <p className="text-xl md:text-2xl font-bold text-red-700">
                {trips.filter(t => t.state === 'CANCELLED' || t.state === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
