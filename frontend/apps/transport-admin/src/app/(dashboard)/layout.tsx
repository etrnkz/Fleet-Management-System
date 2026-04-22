'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Toast, { ToastType } from '@/components/Toast'
import { getCurrentUser, tripApi, userApi, inviteApi } from '@/lib/api'
import { useTheme } from '@/components/ThemeProvider'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const { isDark, toggle: toggleTheme } = useTheme()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [settingsToast, setSettingsToast] = useState<{ message: string; type: string } | null>(null)
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({ companyName: 'Fleet Management Co.', companyEmail: 'transport.office@haramaya.edu.et', companyPhone: '+251-911-234567', address: '123 Main Street, Addis Ababa', timezone: 'Africa/Addis_Ababa', dateFormat: 'DD/MM/YYYY', currency: 'ETB' })
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({ emailNotifications: true, smsNotifications: false, pushNotifications: true, maintenanceAlerts: true, fuelAlerts: true, documentExpiry: true, tripUpdates: false, weeklyReports: true })
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({ twoFactorAuth: false, sessionTimeout: '30', passwordExpiry: '90', loginAttempts: '5' })
  // Users
  const [settingsUsers, setSettingsUsers] = useState<any[]>([])
  // Invite
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('User')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
  })
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Load user and notifications on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is logged in
        const cachedUser = getCurrentUser()
        if (!cachedUser) {
          router.push('/login')
          return
        }
        
        // Set cached user immediately for display
        setUser(cachedUser)

        // Fetch fresh data from API in background
        try {
          const freshUser = await userApi.getProfile()
          // Update state and cache with fresh data
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
        } catch (apiError) {
          // If API fails, keep using cached data
          console.warn('Using cached user data, API fetch failed:', apiError)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        router.push('/login')
      }
    }

    loadUserData()
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
        : null
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setNotifications(list.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title || n.type,
        message: n.message,
        time: new Date(n.sentAt || n.createdAt).toLocaleString(),
        read: n.isRead,
        isRead: n.isRead,
        details: n.metadata || {}
      })))
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
    }
  }

  const unreadCount = notifications.filter((n: any) => !n.read && !n.isRead).length

  const handleLogout = () => {
    // Clear all authentication tokens and user session
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirect to login with logout flag to prevent auto-login
    router.push('/?logout=true')
  }

  const showSettingsToast = (message: string, type: string) => {
    setSettingsToast({ message, type })
    setTimeout(() => setSettingsToast(null), 3000)
  }

  const openSettings = async () => {
    setShowProfileDropdown(false)
    setSettingsTab('general')
    setShowSettings(true)
    // Load real user profile data
    try {
      const profile: any = await userApi.getProfile()
      setGeneralSettings(p => ({
        ...p,
        companyName: profile.name || p.companyName,
        companyEmail: profile.email || p.companyEmail,
        companyPhone: profile.phoneNumber || p.companyPhone,
      }))
    } catch {}
    // Load users
    try {
      const data = await userApi.getAll()
      setSettingsUsers(Array.isArray(data) ? data : [])
    } catch { setSettingsUsers([]) }
  }

  const handleInvite = async () => {
    setInviting(true)
    setInviteResult(null)
    try {
      let result: any
      if (inviteMode === 'csv' && csvFile) {
        const fd = new FormData()
        fd.append('csvFile', csvFile)
        if (inviteMessage) fd.append('welcomeMessage', inviteMessage)
        result = await inviteApi.bulkInviteCsv(fd)
      } else {
        const emails = inviteEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes('@'))
        if (emails.length === 0) { showSettingsToast('Enter at least one valid email', 'error'); setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined, role: inviteRole || undefined })
      }
      setInviteResult(result)
      showSettingsToast(result.message || 'Invitations sent!', 'success')
      setInviteEmails('')
      setCsvFile(null)
    } catch (error: any) {
      showSettingsToast(error.message || 'Failed to send invitations', 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read via API
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
      : null
    if (token && !notification.isRead && !notification.read) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'}/notifications/${notification.id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {})
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, isRead: true } : n))
    }
    setSelectedTrip(notification)
    setShowNotifications(false)
  }

  const handleAllocateTrip = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(
      'Confirm fuel allocation through the official trip workflow when the API is wired for this step.',
      'info',
    )
    setSelectedTrip(null)
  }

  const handleOpenProfileModal = () => {
    setEditedProfile({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      role: user?.role || '',
    })
    setTempProfileImage(null)
    setShowProfileModal(true)
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // Upload photo first if a new one was selected
      if (selectedPhotoFile) {
        const result: any = await userApi.uploadProfileImage(selectedPhotoFile)
        const updatedUser = { ...user, ...editedProfile, profileImage: result.profileImage || tempProfileImage }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        await userApi.updateProfile(editedProfile)
        const updatedUser = { ...user, ...editedProfile }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      setSelectedPhotoFile(null)
      setTempProfileImage(null)
      setShowProfileModal(false)
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    }
  }

  const isActive = (path: string) => pathname === path

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (pathname !== path) {
      e.preventDefault()
      setIsLoading(true)
      router.push(path)
    }
  }

  // Clear spinner once navigation completes
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
            <div>
              <div className="font-bold text-emerald-700 tracking-tight text-sm">Haramaya University</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link 
              href="/dashboard" 
              onClick={(e) => {
                handleNavigation(e, '/dashboard')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
            
            <Link 
              href="/vehicles" 
              onClick={(e) => {
                handleNavigation(e, '/vehicles')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/vehicles')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              Vehicles
            </Link>

            <Link 
              href="/tracking" 
              onClick={(e) => {
                handleNavigation(e, '/tracking')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/tracking')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Live Tracking
            </Link>

            <Link 
              href="/drivers" 
              onClick={(e) => {
                handleNavigation(e, '/drivers')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/drivers')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Drivers
            </Link>

            <Link 
              href="/trips" 
              onClick={(e) => {
                handleNavigation(e, '/trips')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/trips')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Trips
            </Link>

            <Link 
              href="/approvals" 
              onClick={(e) => {
                handleNavigation(e, '/approvals')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/approvals')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Approvals
            </Link>

            <Link 
              href="/fuel" 
              onClick={(e) => {
                handleNavigation(e, '/fuel')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/fuel')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Fuel
            </Link>

            <Link 
              href="/documents" 
              onClick={(e) => {
                handleNavigation(e, '/documents')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/documents')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents
            </Link>


            <Link 
              href="/reports" 
              onClick={(e) => {
                handleNavigation(e, '/reports')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/reports')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reports
            </Link>

            <Link 
              href="/feedback" 
              onClick={(e) => {
                handleNavigation(e, '/feedback')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/feedback')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Feedback
            </Link>

            <Link 
              href="/notifications" 
              onClick={(e) => {
                handleNavigation(e, '/notifications')
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/notifications')
                  ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 transition-colors duration-300 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-sm sm:text-base md:text-xl font-bold text-gray-900 transition-colors duration-300 truncate">
                {pathname === '/dashboard' && 'Dashboard Overview'}
                {pathname === '/drivers' && 'Drivers'}
                {pathname === '/vehicles' && 'Vehicles'}
                {pathname === '/tracking' && 'Live Tracking'}
                {pathname === '/trips' && 'Trips'}
                {pathname === '/approvals' && 'Pending Approvals'}
                {pathname === '/fuel' && 'Fuel Management'}
                {pathname === '/documents' && 'Documents'}
                {pathname === '/reports' && 'Reports'}
                {pathname === '/feedback' && 'Feedback'}
                {pathname === '/settings' && 'Settings'}
                {pathname === '/notifications' && 'Notifications'}
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
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
                <button 
                  onClick={() => setShowNotifications(prev => !prev)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${unreadCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{unreadCount} Unread</span>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.filter(n => !n.read && !n.isRead).length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : notifications.filter(n => !n.read && !n.isRead).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-blue-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => { handleNotificationClick(notification); setShowNotifications(false) }}
                            >
                              <p className="font-semibold text-gray-900 text-sm mb-1">{notification.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                const token = typeof window !== 'undefined'
                                  ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
                                  : null
                                if (token) {
                                  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'}/notifications/${notification.id}/read`, {
                                    method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
                                  }).catch(() => {})
                                }
                                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true, isRead: true } : n))
                              }}
                              className="text-[10px] text-[#1B3D2F] hover:text-emerald-700 font-medium whitespace-nowrap flex-shrink-0 mt-1"
                            >
                              Mark read
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-between gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            const token = typeof window !== 'undefined'
                              ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
                              : null
                            if (token) {
                              await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'}/notifications/read-all`, {
                                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
                              }).catch(() => {})
                            }
                            setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })))
                          }}
                          className="text-xs text-[#1B3D2F] hover:text-emerald-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium ml-auto"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#1B3D2F] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'}
                      </span>
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 leading-tight truncate max-w-[100px] md:max-w-[150px]">{user?.name || 'User'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 leading-tight truncate max-w-[100px] md:max-w-[150px]">{user?.role || 'Transport Admin'}</p>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-4 bg-[#1B3D2F]/10 border-b border-[#1B3D2F]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1B3D2F] rounded-full flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-sm text-gray-600 truncate">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    {/* Menu Items */}
                    <div className="py-2">
                      <button onClick={() => { setShowProfileDropdown(false); handleOpenProfileModal() }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">My Profile</p>
                          <p className="text-xs text-gray-500">View and edit profile</p>
                        </div>
                      </button>
                      <button onClick={() => { setShowProfileDropdown(false); setShowSettings(true) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Settings</p>
                          <p className="text-xs text-gray-500">Preferences and options</p>
                        </div>
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={() => { setShowProfileDropdown(false); handleLogout() }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Logout</p>
                          <p className="text-xs text-red-400">Sign out of your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Trip Allocation Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedTrip.type === 'president_approval' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    selectedTrip.type === 'president_approval' ? 'text-purple-600' : 'text-blue-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Trip Allocation</h2>
                  <p className="text-sm text-gray-500">{selectedTrip.details.tripId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Trip Request Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Request Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Requested By</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.requestedBy}</p>
                    <p className="text-sm text-gray-600">{selectedTrip.details.requestedByEmail}</p>
                    <p className="text-sm text-gray-600">{selectedTrip.details.requestedByPhone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">College/Department</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.college}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Destination</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.destination}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trip Date</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.tripDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Departure Time</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.departureTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Return Time</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.returnTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Passengers</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.passengers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Distance</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.estimatedDistance}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Purpose</p>
                    <p className="text-gray-900 font-semibold">{selectedTrip.details.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Allocation Form */}
              <form onSubmit={handleAllocateTrip}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle & Driver Assignment</h3>
                
                {/* Vehicle and Driver Info (Read-only - Assigned by Deployment Office) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                      </svg>
                      <p className="text-sm font-semibold text-blue-900">Assigned Vehicle</p>
                    </div>
                    <p className="text-gray-900 font-bold mb-1">VEH-042 - Toyota Coaster Bus</p>
                    <p className="text-sm text-gray-600">Plate: ET-3-12345 • Capacity: 45 seats</p>
                    <p className="text-xs text-blue-600 mt-2">Assigned by Deployment Office</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm font-semibold text-blue-900">Assigned Driver</p>
                    </div>
                    <p className="text-gray-900 font-bold mb-1">Lemesa Girma</p>
                    <p className="text-sm text-gray-600">License: ET-DL-123456</p>
                    <p className="text-sm text-gray-600">Phone: +251-911-234567</p>
                    <p className="text-xs text-blue-600 mt-2">Assigned by Deployment Office</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Fuel allocation (transport office)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Allocation (Liters) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 80"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Estimated: ~45 liters for {selectedTrip.details.estimatedDistance}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="diesel">Diesel</option>
                      <option value="gasoline">Gasoline</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Allocation Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any notes regarding fuel allocation..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] transition-colors font-medium"
                  >
                    Allocate Fuel & Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrip(null)}
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-[#1B3D2F]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1B3D2F] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Photo Section */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative">
                  {tempProfileImage || user?.profileImage ? (
                    <img 
                      src={tempProfileImage || user?.profileImage} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#1B3D2F]/20"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-[#1B3D2F]/15 rounded-full flex items-center justify-center border-4 border-[#1B3D2F]/20">
                      <span className="text-[#1B3D2F] text-4xl font-bold">
                        {editedProfile.name ? editedProfile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'}
                      </span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-[#1B3D2F] text-white p-2 rounded-full cursor-pointer hover:bg-[#152e22] transition-colors shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-3">Click the camera icon to upload a new photo</p>
              </div>

              {/* Profile Information Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700 w-1/3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Full Name
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="text" 
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F]"
                          placeholder="Enter your full name"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Address
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="email" 
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F]"
                          placeholder="your.email@example.com"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Role/Position
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="text" 
                          value={editedProfile.role}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F]"
                          placeholder="e.g., Transport Administrator"
                          disabled
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="tel" 
                          value={editedProfile.phoneNumber}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F]"
                          placeholder="+251-91-234-5678"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 bg-[#1B3D2F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#152e22] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Toast */}
      {settingsToast && (
        <div className={`fixed top-4 right-4 z-[300] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${settingsToast.type === 'success' ? 'bg-emerald-600' : settingsToast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
          {settingsToast.message}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSettings(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Tabs */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-1 p-2 min-w-max">
                  {[['general','General'],['invite','Invite Employees']].map(([id,label]) => (
                    <button key={id} onClick={() => setSettingsTab(id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${settingsTab === id ? 'bg-[#1B3D2F] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {/* General */}
                {settingsTab === 'general' && (
                  <form onSubmit={async e => { e.preventDefault(); try { await userApi.updateProfile({ name: generalSettings.companyName, phoneNumber: generalSettings.companyPhone }); showSettingsToast('General settings saved', 'success') } catch (err: any) { showSettingsToast(err.message || 'Failed to save', 'error') } }} className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900">General Settings</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[['Company Name','companyName','text'],['Company Email','companyEmail','email'],['Phone Number','companyPhone','tel'],['Address','address','text']].map(([label,key,type]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type={type} value={(generalSettings as any)[key]} onChange={e => setGeneralSettings(p => ({...p, [key]: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none text-sm" />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select value={generalSettings.timezone} onChange={e => setGeneralSettings(p => ({...p, timezone: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                          <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select value={generalSettings.currency} onChange={e => setGeneralSettings(p => ({...p, currency: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                          <option value="ETB">Ethiopian Birr (ETB)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <button type="submit" className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-sm font-medium">Save Changes</button>
                    </div>
                  </form>
                )}
                {/* Invite */}
                {settingsTab === 'invite' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Invite Employees</h3>
                      <p className="text-sm text-gray-500 mt-1">Invited employees receive an email with a temporary password.</p>
                    </div>
                    <div className="flex gap-2">
                      {(['email','csv'] as const).map(mode => (
                        <button key={mode} onClick={() => setInviteMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === mode ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {mode === 'email' ? 'Paste Emails' : 'Upload CSV'}
                        </button>
                      ))}
                    </div>
                    {inviteMode === 'email' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses <span className="text-gray-400 font-normal">(comma or new line)</span></label>
                        <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={4} placeholder="john@university.edu, jane@university.edu" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none font-mono text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CSV File <span className="text-gray-400 font-normal">(must have "email" column)</span></label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3D2F] transition-colors">
                          <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUploadTA" />
                          <label htmlFor="csvUploadTA" className="cursor-pointer text-sm text-gray-500">{csvFile ? csvFile.name : 'Click to upload CSV'}</label>
                        </div>
                        <a href="data:text/csv;charset=utf-8,email%0Ajohn.doe%40university.edu" download="invite_template.csv" className="text-xs text-[#1B3D2F] hover:underline mt-2 inline-block">Download CSV template</a>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role to Assign</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                        <option value="User">Employee (User)</option>
                        <option value="DepartmentHead">Department Head</option>
                        <option value="CollegeHead">College Head</option>
                        <option value="Dean">Dean</option>
                        <option value="Driver">Driver</option>
                        <option value="MaintenanceTeam">Maintenance Team</option>
                        <option value="Gate">Gate / Security</option>
                        <option value="DeploymentTeam">Deployment Team</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message <span className="text-gray-400 font-normal">(optional)</span></label>
                      <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
                    </div>
                    <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                      className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium flex items-center gap-2 text-sm">
                      {inviting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : 'Send Invitations'}
                    </button>
                    {inviteResult && (
                      <div className="space-y-2">
                        {inviteResult.invited.length > 0 && <div className="bg-[#1B3D2F]/10 border border-[#1B3D2F]/20 rounded-lg p-3"><p className="text-sm font-medium text-[#1B3D2F]">✓ {inviteResult.invited.length} invitation{inviteResult.invited.length !== 1 ? 's' : ''} sent</p><div className="flex flex-wrap gap-1 mt-1">{inviteResult.invited.map(e => <span key={e} className="text-xs bg-[#1B3D2F]/15 text-[#1B3D2F] px-2 py-1 rounded">{e}</span>)}</div></div>}
                        {inviteResult.failed.length > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800">✗ {inviteResult.failed.length} failed</p><div className="space-y-1 mt-1">{inviteResult.failed.map(f => <p key={f.email} className="text-xs text-red-700">{f.email}: {f.reason}</p>)}</div></div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
