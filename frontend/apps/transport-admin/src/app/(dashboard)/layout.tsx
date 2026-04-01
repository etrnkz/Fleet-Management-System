'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Toast, { ToastType } from '@/components/Toast'
import { getCurrentUser, tripApi, userApi } from '@/lib/api'

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
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
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
  const pathname = usePathname()
  const router = useRouter()

  // Load user and notifications on mount
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
        : null
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/notifications`, {
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

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const unreadCount = notifications.filter((n: any) => !n.read && !n.isRead).length

  const handleLogout = () => {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberedEmail')
    } catch {
      /* ignore */
    }
    router.push('/login')
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read via API
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
      : null
    if (token && !notification.isRead && !notification.read) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/notifications/${notification.id}/read`, {
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
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await userApi.updateProfile(editedProfile)
      const updatedUser = { ...user, ...editedProfile }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
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
      
      setTimeout(() => {
        router.push(path)
      }, 300)
      
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">HUFMS</p>
              <p className="text-xs text-gray-500">Transport Admin</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link 
              href="/dashboard" 
              onClick={(e) => handleNavigation(e, '/dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
            
            <Link 
              href="/vehicles" 
              onClick={(e) => handleNavigation(e, '/vehicles')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/vehicles')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
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
              onClick={(e) => handleNavigation(e, '/tracking')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/tracking')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
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
              onClick={(e) => handleNavigation(e, '/drivers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/drivers')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Drivers
            </Link>

            <Link 
              href="/trips" 
              onClick={(e) => handleNavigation(e, '/trips')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/trips')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Trips
            </Link>

            <Link 
              href="/fuel" 
              onClick={(e) => handleNavigation(e, '/fuel')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/fuel')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Fuel
            </Link>

            <Link 
              href="/maintenance" 
              onClick={(e) => handleNavigation(e, '/maintenance')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/maintenance')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Maintenance
            </Link>

            <Link 
              href="/documents" 
              onClick={(e) => handleNavigation(e, '/documents')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/documents')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents
            </Link>

            <Link 
              href="/reports" 
              onClick={(e) => handleNavigation(e, '/reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/reports')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reports
            </Link>

            <Link 
              href="/notifications" 
              onClick={(e) => handleNavigation(e, '/notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/notifications')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                {pathname === '/dashboard' && 'Dashboard Overview'}
                {pathname === '/drivers' && 'Drivers'}
                {pathname === '/vehicles' && 'Vehicles'}
                {pathname === '/tracking' && 'Live Tracking'}
                {pathname === '/trips' && 'Trips'}
                {pathname === '/fuel' && 'Fuel Management'}
                {pathname.startsWith('/maintenance') && 'Maintenance'}
                {pathname === '/documents' && 'Documents'}
                {pathname === '/reports' && 'Reports'}
                {pathname === '/settings' && 'Settings'}
                {pathname === '/notifications' && 'Notifications'}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
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
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      <span className="text-xs text-emerald-600 font-medium">{unreadCount} new</span>
                    </div>
                    <div className="overflow-y-auto max-h-[420px]">
                      {notifications.filter(n => !n.read && !n.isRead).length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : notifications.filter(n => !n.read && !n.isRead).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => { handleNotificationClick(notification); setShowNotifications(false) }}
                          className="w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-emerald-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm mb-1">{notification.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-2"></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(prev => !prev)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.59-1.59a.75.75 0 00-1.06-1.061l-1.59 1.59z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 leading-tight">{user?.role || 'Transport Admin'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'}
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
                      <button onClick={() => { setShowProfileDropdown(false); router.push('/settings') }}
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Estimated: ~45 liters for {selectedTrip.details.estimatedDistance}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
            <div className="p-6 border-b border-gray-200 bg-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
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
                  {tempProfileImage ? (
                    <img 
                      src={tempProfileImage} 
                      alt="Profile Preview" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200">
                      <span className="text-emerald-600 text-4xl font-bold">
                        {editedProfile.name ? editedProfile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AD'}
                      </span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
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
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter your full name"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="your.email@example.com"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="e.g., Transport Administrator"
                          disabled
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
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
    </div>
  )
}
