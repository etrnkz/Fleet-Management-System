'use client'
import { useState, useEffect } from 'react'
import { vehicleApi } from '@/lib/api'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    vehicleApi.getAll().then((d: any) => setVehicles(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    UnderMaintenance: 'bg-orange-100 text-orange-700',
    Inactive: 'bg-red-100 text-red-700',
  }

  const filtered = vehicles.filter(v =>
    !search ||
    (v.plateNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.make || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.model || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Active').length,
    maintenance: vehicles.filter(v => v.status === 'UnderMaintenance').length,
    inactive: vehicles.filter(v => v.status === 'Inactive').length,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Vehicles</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200"><p className="text-sm text-gray-500">Total</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-200"><p className="text-sm text-gray-500">Active</p><p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-200"><p className="text-sm text-gray-500">Under Maintenance</p><p className="text-3xl font-bold text-orange-600 mt-1">{stats.maintenance}</p></div>
        <div className="bg-white rounded-xl p-4 border border-gray-200"><p className="text-sm text-gray-500">Inactive</p><p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input type="text" placeholder="Search by plate, make, or model..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[v.status] || 'bg-gray-100 text-gray-700'}`}>{v.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{v.make} {v.model} ({v.year})</h3>
              <p className="text-sm text-gray-500 mb-3">{v.plateNumber}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>Capacity:</span><span>{v.capacity} seats</span></div>
                <div className="flex justify-between"><span>Fuel:</span><span>{v.fuelType}</span></div>
                <div className="flex justify-between"><span>Mileage:</span><span>{v.currentMileage?.toLocaleString()} km</span></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-3 text-center text-gray-400 py-12">No vehicles found</p>}
        </div>
      )}
    </div>
  )
}
