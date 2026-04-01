'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { authApi, tripApi, vehicleApi, statsApi, maintenanceApi } from '@/lib/api'

export default function DriverDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [assignedVehicle, setAssignedVehicle] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [assignedTrips, setAssignedTrips] = useState<any[]>([])
  const [activeTrips, setActiveTrips] = useState<any[]>([])
  const [completedTrips, setCompletedTrips] = useState<any[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedTripDetail, setSelectedTripDetail] = useState<any>(null)
  const [qrTrip, setQrTrip] = useState<any>(null)
  const [rejectTrip, setRejectTrip] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({
    issueDescription: '',
    priority: 'Medium'
  })

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (activeSection === 'assigned-trips') {
      loadAssignedTrips()
    } else if (activeSection === 'active-trip') {
      loadActiveTrips()
    } else if (activeSection === 'trip-history') {
      loadCompletedTrips()
    } else if (activeSection === 'maintenance') {
      loadMaintenanceRequests()
    }
  }, [activeSection])

  const loadUserData = async () => {
    try {
      const [user, vehicle, driverStats] = await Promise.all([
        authApi.getCurrentUser(),
        vehicleApi.getAssignedVehicle(),
        statsApi.getDriverStats()
      ])
      
      setUserData(user)
      setAssignedVehicle(vehicle)
      setStats(driverStats)
    } catch (error: unknown) {
      console.error('Failed to load user data:', error)
      const msg = error instanceof Error ? error.message : ''
      if (msg.includes('token') || msg.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAssignedTrips = async () => {
    try {
      const trips = await tripApi.getAssignedTrips()
      setAssignedTrips(trips)
    } catch (error) {
      console.error('Failed to load assigned trips:', error)
    }
  }

  const loadActiveTrips = async () => {
    try {
      const trips = await tripApi.getActiveTrips()
      setActiveTrips(trips)
    } catch (error) {
      console.error('Failed to load active trips:', error)
    }
  }

  const loadCompletedTrips = async () => {
    try {
      const trips = await tripApi.getCompletedTrips()
      setCompletedTrips(trips)
    } catch (error) {
      console.error('Failed to load completed trips:', error)
    }
  }

  const loadMaintenanceRequests = async () => {
    try {
      const requests = await maintenanceApi.getAll()
      setMaintenanceRequests(requests)
    } catch (error) {
      console.error('Failed to load maintenance requests:', error)
    }
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignedVehicle?.id) {
      setToast({ message: 'No vehicle assigned', type: 'error' })
      return
    }

    try {
      const maintenanceData = {
        vehicleId: assignedVehicle.id,
        issueDescription: maintenanceForm.issueDescription,
        priority: maintenanceForm.priority
      }

      await maintenanceApi.create(maintenanceData)
      setToast({ message: 'Maintenance request submitted successfully', type: 'success' })
      
      // Reset form
      setMaintenanceForm({
        issueDescription: '',
        priority: 'Medium'
      })
      
      // Reload maintenance requests
      loadMaintenanceRequests()
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to submit maintenance request', type: 'error' })
    }
  }

  const handleRejectAssignment = async () => {
    if (!rejectTrip || !rejectReason.trim()) return
    setRejecting(true)
    try {
      await tripApi.rejectAssignment(rejectTrip.id, rejectReason)
      setToast({ message: 'Assignment rejected. Deployment office will reassign.', type: 'success' })
      setRejectTrip(null)
      setRejectReason('')
      loadAssignedTrips()
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to reject', type: 'error' })
    } finally {
      setRejecting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('userData')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Sidebar - Fixed Position */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Driver Portal</h1>
              <p className="text-xs text-gray-500">{userData?.fullName || 'Loading...'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <button
              onClick={() => {
                setActiveSection('overview')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'overview'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('assigned-trips')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'assigned-trips'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">Assigned Trips</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('active-trip')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'active-trip'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              <span className="font-medium">Active Trip</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('trip-history')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'trip-history'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Trip History</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('maintenance')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'maintenance'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Maintenance</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('vehicle-info')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'vehicle-info'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Vehicle Info</span>
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">
                  {userData?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'D'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userData?.fullName || 'Driver'}</p>
                <p className="text-xs text-gray-500 truncate">{userData?.email || 'driver@hu.edu.et'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area - With left margin for sidebar on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header - Fixed Position */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {activeSection.replace('-', ' ')}
                  </h2>
                  <p className="text-sm text-gray-500">{assignedVehicle?.plateNumber || userData?.vehicleAssigned || 'No vehicle assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">{userData?.status || 'Available'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assigned Trips</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{assignedTrips.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Trip</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{activeTrips.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.completedTrips || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalDistance || '0'} km</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Vehicle Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Vehicle</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{assignedVehicle?.make} {assignedVehicle?.model} - {assignedVehicle?.plateNumber}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900">{assignedVehicle?.type || 'Vehicle'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fuel Level</p>
                      <p className="font-medium text-gray-900">{assignedVehicle?.fuelLevel || '0'}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-medium text-gray-900">{assignedVehicle?.mileage || '0'} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-emerald-600">{assignedVehicle?.status || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveSection('assigned-trips')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Trip</h3>
                <p className="text-sm text-gray-600">Begin your assigned trip</p>
              </button>

              <button
                onClick={() => setActiveSection('maintenance')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Report Issue</h3>
                <p className="text-sm text-gray-600">Report vehicle problems</p>
              </button>

              <button
                onClick={() => setActiveSection('vehicle-info')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Documents</h3>
                <p className="text-sm text-gray-600">Access vehicle documents</p>
              </button>
            </div>
          </div>
        )}

        {/* Assigned Trips Section */}
        {activeSection === 'assigned-trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Assigned Trips</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {assignedTrips.length} Upcoming
              </span>
            </div>

            <div className="grid gap-6">
              {assignedTrips.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">No assigned trips yet</p>
                </div>
              ) : assignedTrips.map((trip: any) => (
                <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{trip.destination}</h3>
                        <p className="text-sm text-gray-600 mt-1">Requester: {trip.requester?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{trip.requester?.department?.name || ''}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{trip.state}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Start</p>
                      <p className="font-medium text-gray-900">{trip.startDateTime ? new Date(trip.startDateTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End</p>
                      <p className="font-medium text-gray-900">{trip.endDateTime ? new Date(trip.endDateTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-medium text-gray-900">{trip.estimatedDistance ? `${trip.estimatedDistance} km` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">{trip.allocatedVehicle?.plateNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTripDetail(trip)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                      Details
                    </button>
                    <button
                      onClick={() => setQrTrip(trip)}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept & Show QR
                    </button>
                    <button
                      onClick={() => { setRejectTrip(trip); setRejectReason('') }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Trip Section */}
        {activeSection === 'active-trip' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Trip</h2>

            {activeTrips.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No active trip</p>
                <p className="text-sm text-gray-400 mt-1">Your trip will appear here once the gate keeper scans your QR code to start it</p>
                <button onClick={() => setActiveSection('assigned-trips')}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  View Assigned Trips
                </button>
              </div>
            ) : activeTrips.map((trip: any) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{trip.destination}</h3>
                    <p className="text-gray-600 mt-1">Requester: {trip.requester?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{trip.purpose}</p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    In Progress
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Start</p>
                    <p className="font-medium text-gray-900">{trip.startDateTime ? new Date(trip.startDateTime).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. End</p>
                    <p className="font-medium text-gray-900">{trip.endDateTime ? new Date(trip.endDateTime).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-medium text-gray-900">{trip.estimatedDistance ? `${trip.estimatedDistance} km` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900">{trip.allocatedVehicle?.plateNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                  Trip is in progress. Complete it at the destination or report any issues via the Maintenance section.
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trip History Section */}
        {activeSection === 'trip-history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Trip History</h2>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Export Report
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passenger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fuel Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{trip.destination}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trip.passenger}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trip.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trip.distance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trip.duration}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trip.fuelUsed}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Section */}
        {activeSection === 'maintenance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Maintenance</h2>

            {/* Report Maintenance Issue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Maintenance Issue</h3>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select 
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Low">Low - Can wait</option>
                    <option value="Medium">Medium - Schedule soon</option>
                    <option value="High">High - Urgent</option>
                    <option value="Critical">Critical - Immediate attention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={maintenanceForm.issueDescription}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, issueDescription: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  ></textarea>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Vehicle Information</p>
                  <p className="font-medium text-gray-900">
                    {assignedVehicle?.make} {assignedVehicle?.model} - {assignedVehicle?.plateNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Mileage: {assignedVehicle?.currentMileage || 'N/A'} km
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Submit Maintenance Request
                </button>
              </form>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Maintenance Requests</h3>
              <div className="space-y-4">
                {maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 font-medium">No maintenance requests found</p>
                    <p className="text-sm text-gray-400 mt-1">Submit your first maintenance request above</p>
                  </div>
                ) : (
                  maintenanceRequests.map((request: any) => {
                    const getStatusColor = (status: string) => {
                      const colors: Record<string, string> = {
                        'Submitted': 'bg-blue-100 text-blue-700',
                        'EstimateProvided': 'bg-purple-100 text-purple-700',
                        'BudgetApproved': 'bg-green-100 text-green-700',
                        'InProgress': 'bg-orange-100 text-orange-700',
                        'Completed': 'bg-gray-100 text-gray-700',
                        'Rejected': 'bg-red-100 text-red-700'
                      }
                      return colors[status] || 'bg-gray-100 text-gray-700'
                    }

                    const getPriorityColor = (priority: string) => {
                      const colors: Record<string, string> = {
                        'Low': 'bg-gray-100 text-gray-700',
                        'Medium': 'bg-yellow-100 text-yellow-700',
                        'High': 'bg-orange-100 text-orange-700',
                        'Critical': 'bg-red-100 text-red-700'
                      }
                      return colors[priority] || 'bg-gray-100 text-gray-700'
                    }

                    return (
                      <div key={request.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          request.status === 'Completed' ? 'bg-green-100' : 
                          request.status === 'Rejected' ? 'bg-red-100' :
                          request.status === 'InProgress' ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          {request.status === 'Completed' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : request.status === 'Rejected' ? (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : request.status === 'InProgress' ? (
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{request.requestNumber}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.issueDescription}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                                  {request.priority}
                                </span>
                              </div>
                              {request.estimatedCost && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Estimated Cost: ETB {request.estimatedCost.toLocaleString()}
                                </p>
                              )}
                              {request.actualCost && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Actual Cost: ETB {request.actualCost.toLocaleString()}
                                </p>
                              )}
                              {request.rejectionReason && (
                                <p className="text-sm text-red-600 mt-1">
                                  Rejection Reason: {request.rejectionReason}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 flex-shrink-0">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Info Section */}
        {activeSection === 'vehicle-info' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Information</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-32 h-32 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-20 h-20 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Toyota Hilux</h3>
                  <p className="text-lg text-gray-600 mt-1">ET-3-12345</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                  <p className="text-lg font-semibold text-gray-900">{assignedVehicle?.type || 'Vehicle Type'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Year</p>
                  <p className="text-lg font-semibold text-gray-900">2022</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <p className="text-lg font-semibold text-gray-900">White</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Engine</p>
                  <p className="text-lg font-semibold text-gray-900">2.8L Diesel</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Transmission</p>
                  <p className="text-lg font-semibold text-gray-900">Automatic</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-gray-900">Diesel</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Seating Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">5 Passengers</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Current Mileage</p>
                  <p className="text-lg font-semibold text-gray-900">{assignedVehicle?.mileage || '0'} km</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fuel Level</p>
                  <p className="text-lg font-semibold text-gray-900">{assignedVehicle?.fuelLevel || '0'}%</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Registration</p>
                      <p className="text-sm text-gray-600">Valid until: 2025-12-31</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Insurance</p>
                      <p className="text-sm text-gray-600">Valid until: 2025-08-15</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Inspection Report</p>
                      <p className="text-sm text-gray-600">Last: 2025-01-01</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Service Manual</p>
                      <p className="text-sm text-gray-600">Toyota Hilux 2022</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      </div>

      {/* Reject Assignment Modal */}
      {rejectTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reject Assignment</h3>
                <p className="text-sm text-gray-500">Trip to {rejectTrip.destination}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason. The deployment office will be notified to reassign this trip.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Health issue, vehicle problem, emergency..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectTrip(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleRejectAssignment} disabled={!rejectReason.trim() || rejecting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {rejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrTrip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Trip Accepted ✓</h3>
              <button onClick={() => setQrTrip(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Show this QR to the gate keeper to start your trip</p>
            <div className="flex justify-center p-4 bg-white border-2 border-gray-100 rounded-xl mb-4">
              <QRCodeSVG
                value={JSON.stringify({
                  tripId: qrTrip.id,
                  requestNumber: qrTrip.requestNumber,
                  destination: qrTrip.destination,
                  vehicle: qrTrip.allocatedVehicle?.plateNumber,
                  driver: userData?.name,
                  action: 'START_TRIP'
                })}
                size={220}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-left space-y-1 bg-gray-50 rounded-lg p-3 text-sm">
              <p><span className="text-gray-500">Trip:</span> <span className="font-semibold">{qrTrip.requestNumber}</span></p>
              <p><span className="text-gray-500">To:</span> <span className="font-semibold">{qrTrip.destination}</span></p>
              <p><span className="text-gray-500">Vehicle:</span> <span className="font-semibold">{qrTrip.allocatedVehicle?.plateNumber || 'N/A'}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Trip Detail Modal - Read Only */}
      {selectedTripDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Trip Details</h3>
              <button onClick={() => setSelectedTripDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Trip ID', value: selectedTripDetail.requestNumber || selectedTripDetail.id?.slice(0,8) },
                { label: 'Status', value: selectedTripDetail.state },
                { label: 'Destination', value: selectedTripDetail.destination },
                { label: 'Purpose', value: selectedTripDetail.purpose },
                { label: 'Requester', value: selectedTripDetail.requester?.name },
                { label: 'Department', value: selectedTripDetail.requester?.department?.name || 'N/A' },
                { label: 'Passengers', value: selectedTripDetail.passengerCount },
                { label: 'Start Date', value: selectedTripDetail.startDateTime ? new Date(selectedTripDetail.startDateTime).toLocaleString() : 'N/A' },
                { label: 'End Date', value: selectedTripDetail.endDateTime ? new Date(selectedTripDetail.endDateTime).toLocaleString() : 'N/A' },
                { label: 'Vehicle', value: selectedTripDetail.allocatedVehicle ? `${selectedTripDetail.allocatedVehicle.make} ${selectedTripDetail.allocatedVehicle.model} (${selectedTripDetail.allocatedVehicle.plateNumber})` : 'N/A' },
                { label: 'Est. Distance', value: selectedTripDetail.estimatedDistance ? `${selectedTripDetail.estimatedDistance} km` : 'N/A' },
                { label: 'Est. Fuel Cost', value: selectedTripDetail.estimatedFuelCost ? `ETB ${selectedTripDetail.estimatedFuelCost}` : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{value || 'N/A'}</span>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-200">
              <button onClick={() => setSelectedTripDetail(null)}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
