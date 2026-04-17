'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { tripApi, vehicleApi, statsApi, maintenanceApi, notificationApi, authApi, userApi } from '@/lib/api'
import { useDriverGpsTracking } from '@/hooks/useDriverGpsTracking'

export default function DriverDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('assigned-trips')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
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
  const [qrTrip, setQrTrip] = useState<any>(null)
  const [rejectTrip, setRejectTrip] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [maintenanceForm, setMaintenanceForm] = useState({
    issueDescription: '',
    priority: 'Medium',
    issueType: '',
    vehicleLocation: '',
    odometerReading: '',
    additionalNotes: '',
  })
  const [settingsTab, setSettingsTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState({ name: '', phoneNumber: '', licenseNumber: '', licenseExpiry: '', experienceYears: 0 })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }
  }, [toast])

  useEffect(() => { loadAll() }, [])
  useEffect(() => { const id = setInterval(loadActiveTrips, 45_000); return () => clearInterval(id) }, [])

  useEffect(() => {
    if (activeSection === 'assigned-trips') loadAssignedTrips()
    else if (activeSection === 'active-trip') loadActiveTrips()
    else if (activeSection === 'trip-history') loadCompletedTrips()
    else if (activeSection === 'maintenance') loadMaintenanceRequests()
    else if (activeSection === 'notifications') loadNotifications()
  }, [activeSection])

  const liveTripId = activeTrips[0]?.id ?? null
  const gpsStatus = useDriverGpsTracking(liveTripId)
  const showToast = (msg: string, type: 'success' | 'error') => setToast({ message: msg, type })

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
      setProfileForm({ name: user?.name || '', phoneNumber: user?.phoneNumber || '', licenseNumber: '', licenseExpiry: '', experienceYears: 0 })
      if (user?.profileImage) setProfileImage(user.profileImage)
      await loadActiveTrips()
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('expired')) router.push('/login')
    } finally { setLoading(false) }
  }

  const loadAssignedTrips = async () => { try { setAssignedTrips(await tripApi.getAssignedTrips()) } catch {} }
  const loadActiveTrips = async () => { try { setActiveTrips(await tripApi.getActiveTrips()) } catch {} }
  const loadCompletedTrips = async () => { try { setCompletedTrips(await tripApi.getCompletedTrips()) } catch {} }
  const loadMaintenanceRequests = async () => { try { setMaintenanceRequests(await maintenanceApi.getMyRequests()) } catch {} }
  const loadNotifications = async () => { try { setNotifications(await notificationApi.getAll()) } catch {} }

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }
  const handleMarkAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.isRead).map(n => notificationApi.markAsRead(n.id).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignedVehicle?.id) { showToast('No vehicle assigned', 'error'); return }
    try {
      // Build a comprehensive description from all form fields
      const fullDescription = [
        `Issue Type: ${maintenanceForm.issueType || 'General'}`,
        `Description: ${maintenanceForm.issueDescription}`,
        maintenanceForm.vehicleLocation ? `Location on Vehicle: ${maintenanceForm.vehicleLocation}` : '',
        maintenanceForm.odometerReading ? `Odometer: ${maintenanceForm.odometerReading} km` : '',
        maintenanceForm.additionalNotes ? `Additional Notes: ${maintenanceForm.additionalNotes}` : '',
      ].filter(Boolean).join('\n')

      await maintenanceApi.create({
        vehicleId: assignedVehicle.id,
        issueDescription: fullDescription,
        priority: maintenanceForm.priority,
      })
      showToast('Maintenance request submitted', 'success')
      setMaintenanceForm({ issueDescription: '', priority: 'Medium', issueType: '', vehicleLocation: '', odometerReading: '', additionalNotes: '' })
      loadMaintenanceRequests()
    } catch (err: any) { showToast(err.message || 'Failed', 'error') }
  }

  const handleRejectAssignment = async () => {
    if (!rejectTrip || !rejectReason.trim()) return
    setRejecting(true)
    try {
      await tripApi.rejectAssignment(rejectTrip.id, rejectReason)
      showToast('Assignment rejected', 'success')
      setRejectTrip(null); setRejectReason(''); loadAssignedTrips()
    } catch (err: any) { showToast(err.message || 'Failed', 'error') }
    finally { setRejecting(false) }
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Compress before upload
    const compressed = await new Promise<File>((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        const maxW = 400
        let { width, height } = img
        if (width > maxW) { height = (height * maxW) / width; width = maxW }
        canvas.width = width; canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => resolve(blob ? new File([blob], file.name, { type: file.type }) : file), file.type, 0.8)
      }
      img.src = URL.createObjectURL(file)
    })
    setUploadingImage(true)
    try {
      const result = await userApi.uploadProfileImage(compressed) as any
      const url = result.profileImageUrl
      setProfileImage(url)
      setUserData((p: any) => ({ ...p, profileImage: url }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), profileImage: url }))
      showToast('Profile picture updated', 'success')
    } catch (err: any) { showToast(err.message || 'Upload failed', 'error') }
    finally { setUploadingImage(false) }
  }
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await userApi.updateProfile({ name: profileForm.name, phoneNumber: profileForm.phoneNumber })
      // If license details provided, upsert driver profile
      if (profileForm.licenseNumber && profileForm.licenseExpiry) {
        await userApi.updateDriverProfile({
          licenseNumber: profileForm.licenseNumber,
          licenseExpiry: profileForm.licenseExpiry,
          experienceYears: profileForm.experienceYears || 0,
        })
      }
      setUserData((p: any) => ({ ...p, name: profileForm.name, phoneNumber: profileForm.phoneNumber }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), name: profileForm.name, phoneNumber: profileForm.phoneNumber }))
      showToast('Profile updated', 'success')
    } catch (err: any) { showToast(err.message || 'Failed', 'error') }
    finally { setSavingProfile(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showToast('Passwords do not match', 'error'); return }
    if (passwordForm.newPassword.length < 8) { showToast('Min 8 characters', 'error'); return }
    setSavingPassword(true)
    try {
      await userApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      showToast('Password changed', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) { showToast(err.message || 'Failed', 'error') }
    finally { setSavingPassword(false) }
  }

  const handleLogout = () => {
    // Clear all authentication tokens and user session
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirect to login with logout flag to prevent auto-login
    router.push('/?logout=true')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const initials = userData?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DR'

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      return next
    })
  }

  const navItems = [
    { id: 'assigned-trips', label: 'Assigned Trips' },
    { id: 'trip-history', label: 'Trip History' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'vehicle-info', label: 'Vehicle Info' },
  ]

  const allSections: Record<string, string> = { 'assigned-trips': 'Assigned Trips', 'active-trip': 'Active Trip', 'trip-history': 'Trip History', 'maintenance': 'Maintenance', 'vehicle-info': 'Vehicle Info', 'notifications': 'Notifications', 'settings': 'Settings' }
  const sectionTitle = allSections[activeSection] ?? 'Dashboard'

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
        <p className="mt-4 text-gray-500 text-sm font-semibold uppercase tracking-wide">Loading…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium ${toast.type === 'success' ? 'bg-[#1B3D2F] text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* License expiry warning */}
      {userData?.licenseExpiry && (() => {
        const daysLeft = Math.ceil((new Date(userData.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysLeft <= 30) return (
          <div className={`fixed top-0 left-0 right-0 z-[90] px-4 py-2 text-xs font-semibold text-center ${daysLeft <= 7 ? 'bg-red-600 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
            ⚠️ Your driver's license {daysLeft <= 0 ? 'has expired!' : `expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`} Please renew immediately.
          </div>
        )
        return null
      })()}

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 flex-shrink-0">
          <img src="/hulogo.png" alt="Haramaya University" className="w-8 h-8 object-contain rounded-full" />
          <div>
            <div className="font-bold text-[#1B3D2F] tracking-tight">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === item.id ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]' : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'}`}>
              <span className="flex-1 text-left antialiased tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1B3D2F] truncate">{sectionTitle}</h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {liveTripId && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${gpsStatus.engineSimulatedOff ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-[#1B3D2F]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gpsStatus.engineSimulatedOff ? 'bg-red-500' : 'bg-#f0f9f40 animate-pulse'}`} />
                {gpsStatus.engineSimulatedOff ? 'Restricted' : 'GPS live'}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifDropdown(p => !p)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-[#1B3D2F] hover:underline">Mark all read</button>}
                  </div>
                  {notifications.length === 0
                    ? <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
                    : notifications.slice(0, 15).map(n => (
                      <div key={n.id} onClick={() => handleMarkAsRead(n.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-#1B3D2F' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">{n.title || n.type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfileDropdown(p => !p)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2">
                <div className="w-8 h-8 bg-[#1B3D2F] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profileImage ? <img src={profileImage} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{initials}</span>}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-tight truncate">{userData?.name || 'Driver'}</p>
                  <p className="text-xs text-gray-500 truncate">Driver</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
                    <div className="p-4 bg-[#1B3D2F]/5 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B3D2F] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {profileImage ? <img src={profileImage} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{initials}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userData?.name || 'Driver'}</p>
                          <p className="text-xs text-gray-500 truncate">{userData?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setShowProfileDropdown(false); setActiveSection('settings') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                        Settings
                      </button>
                      <button onClick={() => { setShowProfileDropdown(false); setActiveSection('notifications') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                        Notifications {unreadCount > 0 && <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>}
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {liveTripId && gpsStatus.engineSimulatedOff && (
          <div className="fixed top-16 left-0 lg:left-64 right-0 z-30 bg-red-600 text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2">
            🚨 Engine shutdown — restricted zone{gpsStatus.violationZoneName ? `: ${gpsStatus.violationZoneName}` : ''}. Leave immediately.
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 pt-20">
          {liveTripId && gpsStatus.engineSimulatedOff && <div className="h-10" />}

          {/* ASSIGNED TRIPS */}
          {activeSection === 'assigned-trips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Assigned Trips</h2>
                <button onClick={loadAssignedTrips} className="text-xs sm:text-sm text-[#1B3D2F] hover:underline">Refresh</button>
              </div>
              {assignedTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center text-gray-400 text-sm">No assigned trips</div>
              ) : assignedTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{trip.requestNumber || trip.id.slice(0,8)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trip.state === 'READY' ? 'bg-gray-100 text-[#1B3D2F]' : 'bg-blue-100 text-blue-700'}`}>{trip.state}</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{trip.destination}</p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{trip.purpose}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(trip.startDateTime).toLocaleString()}</p>

                      {/* Requester info */}
                      {(trip.requester?.name || trip.requester?.phoneNumber) && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Passenger / Requester</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            {trip.requester?.name && (
                              <span className="text-sm font-semibold text-gray-800">{trip.requester.name}</span>
                            )}
                            {trip.requester?.phoneNumber && (
                              <a
                                href={`tel:${trip.requester.phoneNumber}`}
                                className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {trip.requester.phoneNumber}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                      <button onClick={() => setQrTrip(trip)} className="flex-1 sm:flex-none px-3 py-1.5 bg-[#1B3D2F] text-white text-xs rounded-lg hover:bg-[#152e22] font-semibold">Accept & Show QR</button>
                      <button onClick={() => setRejectTrip(trip)} className="flex-1 sm:flex-none px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE TRIP */}
          {activeSection === 'active-trip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Active Trip</h2>
                <button onClick={loadActiveTrips} className="text-xs sm:text-sm text-[#1B3D2F] hover:underline">Refresh</button>
              </div>
              {activeTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center text-gray-400 text-sm">No active trip right now</div>
              ) : activeTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 bg-#f0f9f40 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-semibold text-[#1B3D2F]">IN PROGRESS</span>
                    <span className="text-xs text-gray-400 ml-auto font-mono">{trip.requestNumber || trip.id.slice(0,8)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base sm:text-lg">{trip.destination}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{trip.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-0.5">Passengers</p><p className="font-semibold text-gray-900">{trip.passengerCount}</p></div>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-0.5">Start</p><p className="font-semibold text-gray-900 text-xs sm:text-sm">{new Date(trip.startDateTime).toLocaleTimeString()}</p></div>
                  </div>
                  {/* Requester contact */}
                  {(trip.requester?.name || trip.requester?.phoneNumber) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 mb-1.5">Passenger / Requester</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-gray-900">{trip.requester?.name}</span>
                        {trip.requester?.phoneNumber && (
                          <a
                            href={`tel:${trip.requester.phoneNumber}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {trip.requester.phoneNumber}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {liveTripId === trip.id && (
                    <div className={`rounded-lg p-3 text-xs sm:text-sm flex items-center gap-2 ${gpsStatus.engineSimulatedOff ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${gpsStatus.engineSimulatedOff ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                      <span className="font-semibold">
                        {gpsStatus.engineSimulatedOff
                          ? `⚠️ Restricted zone${gpsStatus.violationZoneName ? `: ${gpsStatus.violationZoneName}` : ''}`
                          : `GPS Live — tracking active${gpsStatus.lastPostedAt ? ` · ${new Date(gpsStatus.lastPostedAt).toLocaleTimeString()}` : ''}`}
                      </span>
                    </div>
                  )}
                  <button onClick={() => setQrTrip(trip)} className="w-full py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22]">Show QR Code</button>
                </div>
              ))}
            </div>
          )}

          {/* TRIP HISTORY */}
          {activeSection === 'trip-history' && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Trip History</h2>

              {/* Stats Summary */}
              {completedTrips.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                    <p className="text-2xl font-bold text-[#1B3D2F]">{completedTrips.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Trips</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                    <p className="text-2xl font-bold text-[#1B3D2F]">
                      {completedTrips.reduce((s: number, t: any) => s + (Number(t.actualDistance) || 0), 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Total km</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                    <p className="text-2xl font-bold text-[#1B3D2F]">
                      {completedTrips.filter((t: any) => t.feedback?.rating).length > 0
                        ? (completedTrips.reduce((s: number, t: any) => s + (t.feedback?.rating || 0), 0) / completedTrips.filter((t: any) => t.feedback?.rating).length).toFixed(1)
                        : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg Rating</p>
                  </div>
                </div>
              )}

              {completedTrips.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center text-gray-400 text-sm">No completed trips yet</div>
              ) : completedTrips.map((trip: any) => (
                <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTrip(trip)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{trip.requestNumber || trip.id.slice(0,8)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">COMPLETED</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{trip.destination}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(trip.startDateTime).toLocaleDateString()} — {new Date(trip.completedAt || trip.endDateTime).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {trip.actualDistance && <p className="text-sm font-bold text-[#1B3D2F]">{trip.actualDistance} km</p>}
                      {trip.feedback?.rating && (
                        <div className="flex items-center gap-0.5 justify-end mt-1">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-3 h-3 ${s <= trip.feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Tap to view details →</p>
                </div>
              ))}
            </div>
          )}

          {/* MAINTENANCE */}
          {activeSection === 'maintenance' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Report Vehicle Issue</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">

                  {/* Issue Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
                    <select value={maintenanceForm.issueType} onChange={e => setMaintenanceForm(p => ({ ...p, issueType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required>
                      <option value="">Select issue type</option>
                      <option>Engine Problem</option>
                      <option>Brake Issue</option>
                      <option>Tire / Wheel</option>
                      <option>Electrical / Battery</option>
                      <option>Fuel System</option>
                      <option>Transmission</option>
                      <option>Cooling System</option>
                      <option>Lights / Signals</option>
                      <option>Body / Exterior Damage</option>
                      <option>Air Conditioning</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Issue Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Description <span className="text-red-500">*</span></label>
                    <textarea value={maintenanceForm.issueDescription}
                      onChange={e => setMaintenanceForm(p => ({ ...p, issueDescription: e.target.value }))}
                      rows={4} placeholder="Describe the problem in detail — what you heard, saw, or felt..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm resize-none" required />
                  </div>

                  {/* Priority + Location row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                      <select value={maintenanceForm.priority} onChange={e => setMaintenanceForm(p => ({ ...p, priority: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm">
                        <option value="Low">Low — Can wait</option>
                        <option value="Medium">Medium — Soon</option>
                        <option value="High">High — Urgent</option>
                        <option value="Critical">Critical — Cannot drive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Location on Vehicle</label>
                      <input type="text" value={maintenanceForm.vehicleLocation}
                        onChange={e => setMaintenanceForm(p => ({ ...p, vehicleLocation: e.target.value }))}
                        placeholder="e.g. Front left wheel, Engine bay"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                    </div>
                  </div>

                  {/* Odometer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Odometer Reading (km)</label>
                    <input type="number" value={maintenanceForm.odometerReading}
                      onChange={e => setMaintenanceForm(p => ({ ...p, odometerReading: e.target.value }))}
                      placeholder="e.g. 45230"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                    <textarea value={maintenanceForm.additionalNotes}
                      onChange={e => setMaintenanceForm(p => ({ ...p, additionalNotes: e.target.value }))}
                      rows={2} placeholder="Any other relevant information..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm resize-none" />
                  </div>

                  {/* Vehicle info display */}
                  {assignedVehicle && (
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-200">
                      <span className="font-semibold">Vehicle:</span> {assignedVehicle.make} {assignedVehicle.model} — {assignedVehicle.plateNumber}
                    </div>
                  )}

                  <button type="submit" className="w-full py-3 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] transition-colors">
                    Submit Maintenance Request
                  </button>
                </form>
              </div>
              {maintenanceRequests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Previous Reports</h3>
                  {maintenanceRequests.slice(0,5).map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.priority === 'Critical' ? 'bg-red-100 text-red-700' : r.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{r.priority}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{r.issueDescription}</p>
                      <p className="text-xs text-gray-400 mt-1">Status: {r.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VEHICLE INFO */}
          {activeSection === 'vehicle-info' && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Vehicle Information</h2>
              {!assignedVehicle ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center text-gray-400 text-sm">No vehicle currently assigned</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1B3D2F]/10 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{assignedVehicle.make} {assignedVehicle.model}</p>
                      <p className="text-sm text-gray-500">{assignedVehicle.plateNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${assignedVehicle.status === 'Active' ? 'bg-gray-100 text-[#1B3D2F]' : 'bg-gray-100 text-gray-600'}`}>{assignedVehicle.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[['Year', assignedVehicle.year], ['Fuel Type', assignedVehicle.fuelType], ['Capacity', `${assignedVehicle.capacity} seats`], ['Mileage', `${assignedVehicle.currentMileage ?? 0} km`], ['Color', assignedVehicle.color || ''], ['VIN', assignedVehicle.vinNumber || '']].map(([label, value]) => (
                      <div key={label as string} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                  {assignedVehicle.notes && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><p className="text-xs font-medium text-amber-800 mb-1">Notes</p><p className="text-sm text-amber-700">{assignedVehicle.notes}</p></div>}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h2>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {unreadCount > 0 && <span className="text-xs text-gray-500">{unreadCount} unread</span>}
                  {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs sm:text-sm text-[#1B3D2F] hover:underline font-medium">Mark all read</button>}
                  <button onClick={loadNotifications} className="text-xs sm:text-sm text-gray-500 hover:underline">Refresh</button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                  <p className="text-4xl mb-3"></p>
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => handleMarkAsRead(n.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-#1B3D2F' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-[#1B3D2F]' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">{n.title || n.type}</p>
                          <p className="text-sm text-gray-500 mt-0.5 break-words">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <span className="text-xs text-[#1B3D2F] font-medium flex-shrink-0">New</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-4 sm:space-y-6 max-w-2xl">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Settings</h2>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {(['profile', 'password'] as const).map(tab => (
                    <button key={tab} onClick={() => setSettingsTab(tab)}
                      className={`flex-1 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors capitalize ${settingsTab === tab ? 'text-[#1B3D2F] border-b-2 border-[#1B3D2F] bg-[#1B3D2F]/5' : 'text-gray-500 hover:text-gray-700'}`}>
                      {tab === 'profile' ? 'Profile Information' : 'Change Password'}
                    </button>
                  ))}
                </div>

                <div className="p-4 sm:p-6">
                  {settingsTab === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      {/* Profile Picture Upload */}
                      <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1B3D2F] flex items-center justify-center border-4 border-white shadow-md">
                            {profileImage ? (
                              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-2xl font-bold">{initials}</span>
                            )}
                          </div>
                          {/* Upload button overlay */}
                          <label htmlFor="profileImageInput"
                            className="absolute bottom-0 right-0 w-7 h-7 bg-[#1B3D2F] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#152e22] shadow-lg border-2 border-white">
                            {uploadingImage ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </label>
                          <input id="profileImageInput" type="file" accept="image/*" className="hidden"
                            onChange={handleImageUpload} disabled={uploadingImage} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{userData?.name || 'Driver'}</p>
                          <p className="text-sm text-gray-500 mb-2">{userData?.role || 'Driver'}</p>
                          <label htmlFor="profileImageInput"
                            className="inline-flex items-center gap-1.5 text-xs text-[#1B3D2F] font-medium cursor-pointer hover:underline">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {uploadingImage ? 'Uploading…' : 'Upload photo'}
                          </label>
                          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · max 5MB</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <input type="email" value={userData?.email || ''} disabled
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                          <input type="tel" value={profileForm.phoneNumber} onChange={e => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))}
                            placeholder="+251912345678"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                          <input type="text" value={profileForm.licenseNumber} onChange={e => setProfileForm(p => ({ ...p, licenseNumber: e.target.value }))}
                            placeholder="e.g. ETH-DL-123456"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">License Expiry Date</label>
                          <input type="date" value={profileForm.licenseExpiry} onChange={e => setProfileForm(p => ({ ...p, licenseExpiry: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                          <input type="number" min={0} max={50} value={profileForm.experienceYears} onChange={e => setProfileForm(p => ({ ...p, experienceYears: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                          <input type="text" value={userData?.role || 'Driver'} disabled
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" disabled={savingProfile}
                          className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                          {savingProfile ? 'Saving' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  {settingsTab === 'password' && (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input type={showCurrentPw ? 'text' : 'password'} value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
                          <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">{showCurrentPw ? 'Hide' : 'Show'}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showNewPw ? 'text' : 'password'} value={passwordForm.newPassword}
                            onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
                          <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">{showNewPw ? 'Hide' : 'Show'}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                        <input type="password" value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
                      </div>
                      {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs text-red-600">Passwords do not match</p>
                      )}
                      <div className="flex justify-end pt-2">
                        <button type="submit" disabled={savingPassword}
                          className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                          {savingPassword ? 'Changing' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-xl border border-red-200 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-red-700 mb-3">Sign Out</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">Sign out of your driver account on this device.</p>
                  <button onClick={handleLogout} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex-shrink-0">Sign out</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-gray-900">Trip Details</h3>
                <p className="text-xs text-gray-400 font-mono">{selectedTrip.requestNumber || selectedTrip.id.slice(0,8)}</p>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">COMPLETED</span>
                {selectedTrip.completedAt && (
                  <span className="text-xs text-gray-400">{new Date(selectedTrip.completedAt).toLocaleString()}</span>
                )}
              </div>

              {/* Route */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1B3D2F]" />
                  <p className="text-sm text-gray-700">Main Campus</p>
                </div>
                <div className="ml-1 border-l-2 border-dashed border-gray-300 h-4" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-sm font-semibold text-gray-900">{selectedTrip.destination}</p>
                </div>
              </div>

              {/* Trip Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1B3D2F]/5 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Distance</p>
                  <p className="text-lg font-bold text-[#1B3D2F]">{selectedTrip.actualDistance || selectedTrip.estimatedDistance || '—'} <span className="text-xs font-normal">km</span></p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Fuel Cost</p>
                  <p className="text-lg font-bold text-orange-600">{selectedTrip.actualFuelCost ? `${Number(selectedTrip.actualFuelCost).toLocaleString()} ETB` : '—'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Passengers</p>
                  <p className="text-lg font-bold text-blue-600">{selectedTrip.passengerCount || '—'}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Trip Type</p>
                  <p className="text-sm font-bold text-purple-600">{selectedTrip.tripCategory || selectedTrip.tripType || 'Normal'}</p>
                </div>
              </div>

              {/* Requester */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requester</p>
                <p className="text-sm font-semibold text-gray-900">{selectedTrip.requester?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{selectedTrip.requester?.email || ''}</p>
                {selectedTrip.requester?.phoneNumber && (
                  <a href={`tel:${selectedTrip.requester.phoneNumber}`} className="text-xs text-green-700 font-semibold mt-1 block">
                    📞 {selectedTrip.requester.phoneNumber}
                  </a>
                )}
              </div>

              {/* Purpose */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Purpose</p>
                <p className="text-sm text-gray-700">{selectedTrip.purpose}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Departure</p>
                  <p className="font-medium text-gray-900">{new Date(selectedTrip.startDateTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="font-medium text-gray-900">{selectedTrip.completedAt ? new Date(selectedTrip.completedAt).toLocaleString() : '—'}</p>
                </div>
              </div>

              {/* Employee Feedback/Rating */}
              {selectedTrip.feedback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">Employee Feedback</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-5 h-5 ${s <= selectedTrip.feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm font-bold text-yellow-700 ml-1">{selectedTrip.feedback.rating}/5</span>
                  </div>
                  {selectedTrip.feedback.comment && (
                    <p className="text-sm text-gray-700 italic">"{selectedTrip.feedback.comment}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trip QR Code</h3>
              <button onClick={() => setQrTrip(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mb-3">Show this to the gate keeper to start the trip</p>
            <div className="flex justify-center mb-4 p-3 bg-white border-2 border-[#1B3D2F]/20 rounded-xl">
              <QRCodeSVG
                value={JSON.stringify({
                  tripId: qrTrip.id,
                  requestNumber: qrTrip.requestNumber,
                  destination: qrTrip.destination,
                  vehicle: qrTrip.allocatedVehicle?.plateNumber,
                  driver: userData?.name,
                  action: 'GATE_START',
                })}
                size={220}
                className="w-full max-w-[220px] h-auto"
              />
            </div>
            <p className="text-center text-sm font-semibold text-gray-800 truncate">{qrTrip.destination}</p>
            <p className="text-center text-xs text-gray-400 font-mono mt-1">{qrTrip.requestNumber || qrTrip.id.slice(0,8)}</p>
            {qrTrip.allocatedVehicle?.plateNumber && (
              <p className="text-center text-xs text-[#1B3D2F] font-semibold mt-1">{qrTrip.allocatedVehicle.plateNumber}</p>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Reject Assignment</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">Trip to {rejectTrip.destination}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="Reason for rejection"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectTrip(null); setRejectReason('') }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleRejectAssignment} disabled={rejecting || !rejectReason.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {rejecting ? 'Rejecting' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







