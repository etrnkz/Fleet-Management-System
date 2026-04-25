'use client'

import { useEffect, useMemo, useState } from 'react'
import { vehicleApi, driverApi } from '@/lib/api'

export default function CompliancePage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [v, d] = await Promise.all([vehicleApi.getAll(), driverApi.getAll()])
        setVehicles(Array.isArray(v) ? v : [])
        setDrivers(Array.isArray(d) ? d : [])
      } catch (err: any) {
        setError(err.message || 'Failed to load compliance data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const expiredInsurance = vehicles.filter((v) => v.insuranceExpiryDate && new Date(v.insuranceExpiryDate) < new Date()).length
    const expiringLicenses = drivers.filter((d) => {
      if (!d.licenseExpiry) return false
      const diff = new Date(d.licenseExpiry).getTime() - Date.now()
      return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60
    }).length
    return {
      totalVehicles: vehicles.length,
      totalDrivers: drivers.length,
      expiredInsurance,
      expiringLicenses,
    }
  }, [vehicles, drivers])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
      {loading && <div className="text-sm text-gray-600">Loading compliance metrics...</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total Vehicles" value={stats.totalVehicles} />
            <Card title="Total Drivers" value={stats.totalDrivers} />
            <Card title="Expired Insurance" value={stats.expiredInsurance} />
            <Card title="Licenses Expiring < 60d" value={stats.expiringLicenses} />
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Vehicle Insurance Expiry</h2>
            <div className="space-y-2">
              {vehicles.map((v) => (
                <div key={v.id} className="border rounded p-3 text-sm flex items-center justify-between">
                  <span>{`${v.plateNumber} - ${v.make} ${v.model}`}</span>
                  <span>{v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              ))}
              {vehicles.length === 0 && <div className="text-sm text-gray-500">No vehicle records.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
