'use client'
import { useState, useEffect } from 'react'
import { driverApi } from '@/lib/api'

export default function DriversPage() {
  const [driversList, setDriversList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadDrivers() }, [])

  const loadDrivers = async () => {
    try {
      const data = await driverApi.getAllDrivers()
      setDriversList(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div></div>
  if (error) return <div className="p-8 text-center text-red-600">{error} <button onClick={loadDrivers} className="ml-2 underline">Retry</button></div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Drivers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {driversList.map(driver => {
          const name = driver.user?.name || driver.name || 'Unknown'
          return (
            <div key={driver.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-lg">{name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{driver.user?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">License:</span><span>{driver.licenseNumber || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><span>{driver.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Rating:</span><span>{driver.rating || 'N/A'}</span></div>
              </div>
            </div>
          )
        })}
        {driversList.length === 0 && <p className="col-span-3 text-center text-gray-500 py-12">No drivers found</p>}
      </div>
    </div>
  )
}
