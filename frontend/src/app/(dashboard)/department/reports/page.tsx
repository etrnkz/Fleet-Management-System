'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { tripApi, vehicleApi, driverApi, getCurrentUser } from '@/lib/api'

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const [tripsData, vehiclesData, driversData, statsData] = await Promise.all([
        tripApi.getAll().catch(() => []),
        vehicleApi.getAll().catch(() => []),
        driverApi.getAll().catch(() => []),
        tripApi.getStatistics().catch(() => null)
      ])
      
      setTrips(Array.isArray(tripsData) ? tripsData : [])
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
      setDrivers(Array.isArray(driversData) ? driversData : [])
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to load report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleExportPDF = () => {
    // Build a printable HTML page and trigger browser print dialog
    const rows = trips.slice(0, 500).map(t => `
      <tr>
        <td>${t.startDateTime ? new Date(t.startDateTime).toLocaleDateString() : 'N/A'}</td>
        <td>${t.destination || 'N/A'}</td>
        <td>${t.requester?.name || 'N/A'}</td>
        <td>${t.state?.replace(/_/g, ' ') || 'N/A'}</td>
        <td>${t.actualFuelCost ? `ETB ${Number(t.actualFuelCost).toFixed(2)}` : 'N/A'}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html><head><title>Department Report</title>
      <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:12px}
      th{background:#1B3D2F;color:white}h1{color:#1B3D2F}</style></head>
      <body><h1>Department Trip Report</h1>
      <p>Generated: ${new Date().toLocaleString()} | Total trips: ${trips.length}</p>
      <table><thead><tr><th>Date</th><th>Destination</th><th>Requester</th><th>Status</th><th>Fuel Cost</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.print() }
    showToast('Print dialog opened', 'success')
  }

  const handleExportExcel = () => {
    // Export as CSV with .csv extension (opens in Excel)
    const headers = ['Date', 'Destination', 'Requester', 'Status', 'Fuel Cost (ETB)', 'Distance (km)', 'Passengers']
    const rows = trips.slice(0, 500).map(t => [
      t.startDateTime ? new Date(t.startDateTime).toLocaleDateString() : 'N/A',
      t.destination || 'N/A',
      t.requester?.name || 'N/A',
      t.state?.replace(/_/g, ' ') || 'N/A',
      t.actualFuelCost ? Number(t.actualFuelCost).toFixed(2) : 'N/A',
      t.actualDistance ? Number(t.actualDistance).toFixed(1) : 'N/A',
      t.passengerCount || 'N/A',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `department-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    showToast('Report exported', 'success')
  }

  const completedTrips = trips.filter(t => t.state === 'COMPLETED')
  const pendingTrips = trips.filter(t => t.state?.includes('PENDING'))
  const activeVehicles = vehicles.filter(v => v.status === 'Active')
  const availableDrivers = drivers.filter(d => d.status === 'Available')

  if (loading) {
    return null
  }

  return (
    <div className="space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Department fleet management overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#1B3D2F] text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Trips</span>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B3D2F]">{trips.length}</div>
          <p className="text-xs text-gray-500 mt-1">{completedTrips.length} completed</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Active Vehicles</span>
            <div className="w-10 h-10 bg-[#1B3D2F]/15 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B3D2F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B3D2F]">{activeVehicles.length}</div>
          <p className="text-xs text-gray-500 mt-1">of {vehicles.length} total</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Available Drivers</span>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B3D2F]">{availableDrivers.length}</div>
          <p className="text-xs text-gray-500 mt-1">of {drivers.length} total</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending Approvals</span>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B3D2F]">{pendingTrips.length}</div>
          <p className="text-xs text-gray-500 mt-1">awaiting review</p>
        </div>
      </div>

      {/* Fleet Summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fleet Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.slice(0, 10).map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.make} {vehicle.model}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.plateNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.vehicleType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'Active' ? 'bg-[#1B3D2F]/15 text-[#1B3D2F]' :
                      vehicle.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.currentMileage ? `${Number(vehicle.currentMileage).toLocaleString()} km` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trips.slice(0, 10).map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(trip.startDateTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{trip.destination}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{trip.requester?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.state === 'COMPLETED' ? 'bg-[#1B3D2F]/15 text-[#1B3D2F]' :
                      trip.state?.includes('PENDING') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {trip.state?.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
