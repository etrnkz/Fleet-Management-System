'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { authApi, tripApi, vehicleApi, statsApi, maintenanceApi, notificationApi } from '@/lib/api'
import { useDriverGpsTracking } from '@/hooks/useDriverGpsTracking'

export default function DriverDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const [userData, setUserData] = useState<any>(null)
  const [assignedVehicle, setAssignedVehicle] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [assignedTrips, setAssignedTrips] = useState<any[]>([])
  const [activeTrips, setActiveTrips] = useState<any[]>([])
  const [completedTrips, setCompletedTrips] = useState<any[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [qrTrip, setQrTrip] = useState<any>(null)
  const [rejectTrip, setRejectTrip] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({ issueDescription: '', priority: 'Medium' })

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }
  }, [toast])

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    const id = setInterval(() => loadActiveTrips(), 45_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (activeSection === 'assigned-trips') loadAssignedTrips()
    else if (activeSection === 'active-trip') loadActiveTrips()
    else if (activeSection === 'trip-history') loadCompletedTrips()
    else if (activeSection === 'maintenance') loadMaintenanceRequests()
  }, [activeSection])

  const liveTripId = activeTrips[0]?.id ?? null
  const gpsStatus = useDriverGpsTracking(liveTripId)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadAll = async () => {
    try {
      const [user, vehicle, driverStats, notifs] = await Promise.all([
        authApi.getCurrentUser(),
        vehicleApi.getAssignedVehicle(),
        statsApi.getDriverStats(),
        notificationApi.getAll().catch(() => []),
      ])
      setUserData(user)
      setAssignedVehicle(vehicle)
      setStats(driverStats)
      setNotifications(Array.isArray(notifs) ? notifs : [])
      await loadActiveTrips()
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('expired')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAssignedTrips = async () => {
    try { setAssignedTrips(await tripApi.getAssignedTrips()) } catch {}
  }
  const loadActiveTrips = async () => {
    try { setActiveTrips(await tripApi.getActiveTrips()) } catch {}
  }
  const loadCompletedTrips = async () => {
    try { setCompletedTrips(await tripApi.getCompletedTrips()) } catch {}
  }
  const loadMaintenanceRequests = async () => {
    try { setMaintenanceRequests(await maintenanceApi.getAll()) } catch {}
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignedVehicle?.id) { showToast('No vehicle assigned', 'error'); return }
    try {
      await maintenanceApi.create({ vehicleId: assignedVehicle.id, ...maintenanceForm })
      showToast('Maintenance request submitted', 'success')
      setMaintenanceForm({ issueDescription: '', priority: 'Medium' })
      loadMaintenanceRequests()
    } catch (err: any) { showToast(err.message || 'Failed to submit', 'error') }
  }

  const handleRejectAssignment = async () => {
    if (!rejectTrip || !rejectReason.trim()) return
    setRejecting(true)
    try {
      await tripApi.rejectAssignment(rejectTrip.id, rejectReason)
      showToast('Assignment rejected', 'success')
      setRejectTrip(null); setRejectReason('')
      loadAssignedTrips()
    } catch (err: any) { showToast(err.message || 'Failed to reject', 'error') }
    finally { setRejecting(false) }
  }

  const handleLogout = () => {
    ;['access_token', 'refreshToken', 'user'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    router.push('/login')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const initials = userData?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DR'

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'assigned-trips', label: 'Assigned Trips', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { id: 'active-trip', label: 'Active Trip', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg> },
    { id: 'trip-history', label: 'Trip History', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'maintenance', label: 'Maintenance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'vehicle-info', label: 'Vehicle Info', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ]

  const sectionTitle = navItems.find(n => n.id === activeSection)?.label ?? 'Dashboard'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-8 shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B365D] border-t-transparent" />
          <p className="mt-4 text-[#424845] text-sm font-semibold uppercase tracking-wide">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          {toast.message}
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-[#1B365D] rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Haramaya University</div>
            <div className="text-xs text-gray-500">DRIVER PORTAL</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${activeSection === item.id ? 'bg-[#1B365D]/10 text-[#1B365D] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'active-trip' && activeTrips.length > 0 && (
                <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Driver info at bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B365D] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userData?.name || 'Driver'}</p>
              <p className="text-xs text-gray-500 truncate">{userData?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{sectionTitle}</h1>
              {assignedVehicle && <p className="text-xs text-gray-500">{assignedVehicle.plateNumber} · {assignedVehicle.make} {assignedVehicle.model}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* GPS status pill */}
            {liveTripId && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${gpsStatus.engineSimulatedOff ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gpsStatus.engineSimulatedOff ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                {gpsStatus.engineSimulatedOff ? 'Restricted zone' : 'GPS live'}
              </div>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(p => !p)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${unreadCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{unreadCount} new</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
                  ) : notifications.slice(0, 20).map(n => (
                    <div key={n.id} onClick={async () => {
                      await notificationApi.markAsRead(n.id).catch(() => {})
                      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
                    }} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-[#1B365D]' : ''}`}>
                      <p className="text-sm font-medium text-gray-900">{n.title || n.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfileDropdown(p => !p)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                <div className="w-8 h-8 bg-[#1B365D] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{userData?.name || 'Driver'}</p>
                  <p className="text-xs text-gray-500">Driver</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
                    <div className="p-4 bg-[#1B365D]/5 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B365D] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{userData?.name || 'Driver'}</p>
                          <p className="text-xs text-gray-500">{userData?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setShowProfileDropdown(false); setActiveSection('vehicle-info') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Vehicle Info
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* GPS geofence banner */}
        {liveTripId && gpsStatus.engineSimulatedOff && (
          <div className="fixed top-16 left-0 lg:left-64 right-0 z-30 bg-red-600 text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            🚨 Engine shutdown — inside restricted zone{gpsStatus.violationZoneName ? `: ${gpsStatus.violationZoneName}` : ''}. Leave this area immediately.
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-20">
          {/* Extra space when geofence shutdown banner is showing */}
          {liveTripId && gpsStatus.engineSimulatedOff && <div className="h-10" />}

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Assigned', value: assignedTrips.length, color: 'bg-blue-50 text-blue-700', icon: '📋' },
                  { label: 'Active', value: activeTrips.length, color: 'bg-emerald-50 text-emerald-700', icon: '🚗' },
                  { label: 'Completed', value: stats?.completedTrips ?? 0, color: 'bg-green-50 text-green-700', icon: '✅' },
                  { label: 'Distance (km)', value: stats?.totalDistance ?? 0, color: 'bg-purple-50 text-purple-700', icon: '📍' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <span className="text-xl">{s.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Assigned vehicle */}
              {assignedVehicle && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Assigned Vehicle</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1B365D]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-[#1B365D]" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.year})</p>
                      <p className="text-sm text-gray-500">{assignedVehicle.plateNumber} · {assignedVehicle.fuelType} · {assignedVehicle.capacity} seats</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${assignedVehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{assignedVehicle.status}</span>
                  </div>
                </div>
              )}

              {/* Active trip GPS */}
              {liveTripId && (
                <div className={`rounded-xl border p-5 ${gpsStatus.engineSimulatedOff ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${gpsStatus.engineSimulatedOff ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${gpsStatus.engineSimulatedOff ? 'text-red-800' : 'text-emerald-800'}`}>
                        {gpsStatus.engineSimulatedOff ? '🚨 Engine shutdown — restricted zone' : '📡 GPS active — sharing live location'}
                      </p>
                      {gpsStatus.lastPostedAt && <p className="text-xs text-gray-500 mt-0.5">Last update: {new Date(gpsStatus.lastPostedAt).toLocaleTimeString()}</p>}
                      {gpsStatus.lastError && <p className="text-xs text-red-600 mt-0.5">{gpsStatus.lastError}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ASSIGNED TRIPS ── */}
          {activeSection === 'assigned-trips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Trips</h2>
                <button onClick={loadAssignedTrips} className="text-sm text-[#1B365D] hover:underline">Refresh</button>
              </div>
              {assignedTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm">No assigned trips</p>
                </div>
              ) : assignedTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{trip.requestNumber || trip.id.slice(0, 8)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trip.state === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{trip.state}</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{trip.destination}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{trip.purpose}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(trip.startDateTime).toLocaleString()} → {new Date(trip.endDateTime).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setQrTrip(trip)} className="px-3 py-1.5 bg-[#1B365D] text-white text-xs rounded-lg hover:bg-[#152a47]">QR Code</button>
                      <button onClick={() => setRejectTrip(trip)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ACTIVE TRIP ── */}
          {activeSection === 'active-trip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Trip</h2>
                <button onClick={loadActiveTrips} className="text-sm text-[#1B365D] hover:underline">Refresh</button>
              </div>
              {activeTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm">No active trip right now</p>
                </div>
              ) : activeTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-700">IN PROGRESS</span>
                    <span className="text-xs text-gray-400 ml-auto font-mono">{trip.requestNumber || trip.id.slice(0, 8)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{trip.destination}</p>
                    <p className="text-sm text-gray-500">{trip.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Passengers</p>
                      <p className="font-semibold text-gray-900">{trip.passengerCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Start time</p>
                      <p className="font-semibold text-gray-900">{new Date(trip.startDateTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {liveTripId === trip.id && (
                    <div className={`rounded-lg p-3 text-sm ${gpsStatus.engineSimulatedOff ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {gpsStatus.engineSimulatedOff
                        ? `🚨 Restricted zone${gpsStatus.violationZoneName ? `: ${gpsStatus.violationZoneName}` : ''}`
                        : `📡 GPS sharing live location${gpsStatus.lastPostedAt ? ` · ${new Date(gpsStatus.lastPostedAt).toLocaleTimeString()}` : ''}`}
                    </div>
                  )}
                  <button onClick={() => setQrTrip(trip)} className="w-full py-2.5 bg-[#1B365D] text-white rounded-lg text-sm font-medium hover:bg-[#152a47]">
                    Show QR Code
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TRIP HISTORY ── */}
          {activeSection === 'trip-history' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Trip History</h2>
              {completedTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm">No completed trips yet</p>
                </div>
              ) : completedTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{trip.requestNumber || trip.id.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">COMPLETED</span>
                      </div>
                      <p className="font-semibold text-gray-900">{trip.destination}</p>
                      <p className="text-sm text-gray-500">{trip.purpose}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(trip.startDateTime).toLocaleDateString()}</p>
                    </div>
                    {trip.actualDistance && <p className="text-sm font-medium text-gray-700">{trip.actualDistance} km</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MAINTENANCE ── */}
          {activeSection === 'maintenance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Report Vehicle Issue</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Description</label>
                    <textarea
                      value={maintenanceForm.issueDescription}
                      onChange={e => setMaintenanceForm(p => ({ ...p, issueDescription: e.target.value }))}
                      rows={4}
                      placeholder="Describe the issue in detail…"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={maintenanceForm.priority}
                      onChange={e => setMaintenanceForm(p => ({ ...p, priority: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none text-sm"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#1B365D] text-white rounded-lg text-sm font-semibold hover:bg-[#152a47] transition-colors">
                    Submit Report
                  </button>
                </form>
              </div>

              {maintenanceRequests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Previous Reports</h3>
                  {maintenanceRequests.slice(0, 5).map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.priority === 'Critical' ? 'bg-red-100 text-red-700' : r.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{r.priority}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.issueDescription}</p>
                      <p className="text-xs text-gray-400 mt-1">Status: {r.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── VEHICLE INFO ── */}
          {activeSection === 'vehicle-info' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
              {!assignedVehicle ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm">No vehicle currently assigned</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1B365D]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#1B365D]" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{assignedVehicle.make} {assignedVehicle.model}</p>
                      <p className="text-sm text-gray-500">{assignedVehicle.plateNumber}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${assignedVehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{assignedVehicle.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Year', assignedVehicle.year],
                      ['Fuel Type', assignedVehicle.fuelType],
                      ['Capacity', `${assignedVehicle.capacity} seats`],
                      ['Mileage', `${assignedVehicle.currentMileage ?? 0} km`],
                      ['Color', assignedVehicle.color || '—'],
                      ['VIN', assignedVehicle.vinNumber || '—'],
                    ].map(([label, value]) => (
                      <div key={label as string} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  {assignedVehicle.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-800 mb-1">Notes</p>
                      <p className="text-sm text-amber-700">{assignedVehicle.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* QR Modal */}
      {qrTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Trip QR Code</h3>
              <button onClick={() => setQrTrip(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrTrip.id} size={200} />
            </div>
            <p className="text-center text-sm text-gray-500">{qrTrip.destination}</p>
            <p className="text-center text-xs text-gray-400 font-mono mt-1">{qrTrip.requestNumber || qrTrip.id.slice(0, 8)}</p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject Assignment</h3>
            <p className="text-sm text-gray-500 mb-4">Trip to {rejectTrip.destination}</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection…"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none text-sm mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectTrip(null); setRejectReason('') }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleRejectAssignment} disabled={rejecting || !rejectReason.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {rejecting ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
