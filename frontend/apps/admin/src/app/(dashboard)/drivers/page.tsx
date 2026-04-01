'use client'

import { useState, useEffect } from 'react'
import { driverApi } from '@/lib/api'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

interface Driver {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
  licenseNumber: string
  licenseExpiry: string
  status: string
  isAvailable: boolean
}

export default function DriversPage() {
  const [activeFilter, setActiveFilter] = useState('All Drivers')
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const data = await driverApi.getAll()
      setDrivers(Array.isArray(data) ? data : [])
      if (data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0].id)
      }
    } catch (error: any) {
      console.error('Failed to load drivers:', error)
      showToast(error.message || 'Failed to load drivers', 'error')
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const getStatusInfo = (driver: Driver) => {
    if (!driver.isAvailable) {
      return {
        label: 'OFF DUTY',
        color: 'bg-gray-100 text-gray-700',
        dotColor: 'bg-gray-500'
      }
    }
    // You can add logic here to check if driver is on a trip
    return {
      label: 'AVAILABLE',
      color: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500'
    }
  }

  const getFilteredDrivers = () => {
    if (activeFilter === 'All Drivers') return drivers
    
    return drivers.filter(driver => {
      const status = getStatusInfo(driver)
      if (activeFilter === 'Available') return status.label === 'AVAILABLE'
      if (activeFilter === 'On Trip') return status.label === 'ON TRIP'
      if (activeFilter === 'Off Duty') return status.label === 'OFF DUTY'
      return true
    })
  }

  const filteredDrivers = getFilteredDrivers()
  const selectedDriverData = drivers.find(d => d.id === selectedDriver)

  const availableCount = drivers.filter(d => getStatusInfo(d).label === 'AVAILABLE').length
  const onTripCount = drivers.filter(d => getStatusInfo(d).label === 'ON TRIP').length
  const offDutyCount = drivers.filter(d => getStatusInfo(d).label === 'OFF DUTY').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
  
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Management</h1>
        <p className="text-gray-600">Monitor and manage your fleet drivers' status and assignments.</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveFilter('All Drivers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'All Drivers'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Drivers ({drivers.length})
        </button>
        <button
          onClick={() => setActiveFilter('Available')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'Available'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Available ({availableCount})
        </button>
        <button
          onClick={() => setActiveFilter('On Trip')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'On Trip'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          On Trip ({onTripCount})
        </button>
        <button
          onClick={() => setActiveFilter('Off Duty')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'Off Duty'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          Off Duty ({offDutyCount})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No drivers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDrivers.map((driver) => {
                const status = getStatusInfo(driver)
                const isSelected = selectedDriver === driver.id
                const fullName = `${driver.user.firstName} ${driver.user.lastName}`
                
                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver.id)}
                    className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg cursor-pointer ${
                      isSelected ? 'border-emerald-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{fullName}</h3>
                        <p className="text-sm text-gray-500">ID: {driver.id.substring(0, 13)}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>LIC: {driver.licenseNumber}</span>
                      </div>
                      {driver.user.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{driver.user.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{driver.user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status.label === 'ON TRIP' ? (
                        <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          View Trip
                        </button>
                      ) : status.label === 'AVAILABLE' ? (
                        <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                          Assign Trip
                        </button>
                      ) : (
                        <button className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium" disabled>
                          Off Duty
                        </button>
                      )}
                      <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedDriverData && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Driver Details</h3>
              <p className="text-sm text-gray-600 mb-4">
                Selected: <span className="text-emerald-600 font-medium">
                  {selectedDriverData.user.firstName} {selectedDriverData.user.lastName}
                </span>
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedDriverData.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Expiry</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedDriverData.licenseExpiry).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedDriverData.user.email}</p>
                </div>
                {selectedDriverData.user.phoneNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedDriverData.user.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusInfo(selectedDriverData).color}`}>
                    {getStatusInfo(selectedDriverData).label}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => showToast('Driver details viewed', 'info')}
                className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                View Full Profile
              </button>
            </div>
          )}

          <div className="bg-emerald-600 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-2">FLEET PERFORMANCE</h3>
            
            <div className="mb-4">
              <p className="text-sm text-emerald-100 mb-2">Active Drivers</p>
              <p className="text-4xl font-bold">{availableCount + onTripCount}</p>
            </div>

            <div className="mb-2">
              <div className="w-full bg-emerald-500 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${drivers.length > 0 ? ((availableCount + onTripCount) / drivers.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-emerald-100">
              {drivers.length > 0 ? Math.round(((availableCount + onTripCount) / drivers.length) * 100) : 0}% of drivers currently active.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Drivers</span>
                <span className="font-bold text-gray-900">{drivers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-bold text-green-600">{availableCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">On Trip</span>
                <span className="font-bold text-blue-600">{onTripCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Off Duty</span>
                <span className="font-bold text-gray-600">{offDutyCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
