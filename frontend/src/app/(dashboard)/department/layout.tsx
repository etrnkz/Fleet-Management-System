'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { getCurrentUser } from '@/lib/api'
import { getInitials, getTimeAgo, doLogout } from '@/lib/utils'
import { useTheme, ThemeProvider } from '@/components/ThemeProvider'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const { isDark, toggle: toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile')
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '', phoneNumber: '', department: '', college: '' })
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')

  // Load user data on mount
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setFormData({
      fullName: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phoneNumber || '',
      department: currentUser.department || currentUser.college || '',
      office: currentUser.office || 'Main Campus',
      bio: currentUser.bio || '',
    })
    
    // Load notifications
    loadNotifications()
  }, [])
  
  const loadNotifications = async () => {
    try {
      const { notificationApi } = await import('@/lib/api')
      const data = await notificationApi.getAll() // Get ALL notifications
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const { notificationApi } = await import('@/lib/api')
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.filter((n: any) => n.id !== id))
    } catch {}
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    bio: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { userApi } = await import('@/lib/api')
      await userApi.updateProfile({ name: formData.fullName, phoneNumber: formData.phone })
      const updatedUser = { ...user, name: formData.fullName, phoneNumber: formData.phone }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      showToast('Profile updated successfully!', 'success')
      setProfileModalOpen(false)
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all password fields', 'error'); return
    }
    if (passwordData.newPassword === passwordData.currentPassword) {
      showToast('New password must be different from your current password', 'error'); return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match!', 'error'); return
    }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!strong.test(passwordData.newPassword)) {
      showToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error'); return
    }
    try {
      const { userApi } = await import('@/lib/api')
      await userApi.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      showToast('Password changed successfully!', 'success')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setProfileModalOpen(false)
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error')
    }
  }

  const openProfileModal = () => {
    setProfileDropdownOpen(false)
    setProfileModalOpen(true)
    setActiveTab('profile')
  }

  const openSettings = () => {
    setProfileDropdownOpen(false)
    const currentUser = getCurrentUser()
    const userData = localStorage.getItem('userData')
    const parsedData = userData ? JSON.parse(userData) : {}
    setSettingsForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      department: parsedData.department || currentUser?.department || '',
      college: parsedData.college || currentUser?.college || '',
    })
    setProfileImage(parsedData.profileImage || null)
    setSettingsTab('profile')
    setSettingsOpen(true)
  }

  const handleSettingsSave = async () => {
    try {
      setSettingsSaving(true)
      const { userApi } = await import('@/lib/api')
      await userApi.updateProfile({ name: settingsForm.name, phoneNumber: settingsForm.phoneNumber })
      const updatedUser = { ...user, name: settingsForm.name, phoneNumber: settingsForm.phoneNumber }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('userData', JSON.stringify({ ...settingsForm, profileImage }))
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSettingsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfileImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleInvite = async () => {
    setInviting(true)
    setInviteResult(null)
    try {
      const { inviteApi } = await import('@/lib/api')
      let result: any
      if (inviteMode === 'csv' && csvFile) {
        const fd = new FormData()
        fd.append('csvFile', csvFile)
        if (inviteMessage) fd.append('welcomeMessage', inviteMessage)
        result = await inviteApi.bulkInviteCsv(fd)
      } else {
        const emails = inviteEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes('@'))
        if (emails.length === 0) { showToast('Please enter at least one valid email', 'error'); setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined })
      }
      setInviteResult(result)
      showToast(result.message || 'Invitations sent!', 'success')
      setInviteEmails('')
      setCsvFile(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitations', 'error')
    } finally {
      setInviting(false)
    }
  }

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

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/department/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'My Trips', 
      href: '/department/my-trips', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      name: 'Trip Requests', 
      href: '/department/approvals', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Vehicles', 
      href: '/department/vehicles', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      )
    },
    { 
      name: 'Reports', 
      href: '/department/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Notifications', 
      href: '/department/notifications', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: unreadCount
    },
  ]

  return (
    <ThemeProvider storageKey="theme_department">
    <div className="min-h-screen bg-[var(--fa-background)] transition-colors duration-300">
      {/* Navigation Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-[var(--fa-surface)]/50 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[var(--fa-primary)]"></div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-[var(--fa-surface)] border-r border-[var(--fa-outline-variant)]/20 transition-colors duration-300 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[var(--fa-outline-variant)]/20">
          <img src="/hulogo.png" alt="Haramaya University" className="w-8 h-8 object-contain rounded-full" />
          <div>
            <div className="font-bold text-[var(--fa-primary)] tracking-tight">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--fa-secondary)] font-bold">FLEET MANAGEMENT</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  handleNavigation(e, item.href)
                  setSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[var(--fa-primary)] font-bold border-l-4 border-[var(--fa-primary)]'
                    : 'text-[var(--fa-secondary)] hover:text-[var(--fa-primary)] hover:bg-[var(--fa-surface-container)]'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 antialiased tracking-tight">{item.name}</span>
                {(item as any).badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{(item as any).badge}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[var(--fa-surface)] border-b border-[var(--fa-outline-variant)]/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 transition-colors duration-300">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[var(--fa-secondary)] hover:bg-[var(--fa-surface-container)] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-[#152e22] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-[var(--fa-primary)]">
              {pathname === '/dashboard' && 'Department Head Dashboard'}
              {pathname === '/my-trips' && 'My Trips'}
              {pathname === '/approvals' && 'Trip Requests'}
              {pathname === '/vehicles' && 'Fleet Vehicles'}
              {pathname === '/reports' && 'Reports'}
              {pathname === '/settings' && 'Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="p-2 text-[var(--fa-secondary)] hover:bg-[var(--fa-surface-container)] rounded-lg transition-colors"
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
            {/* Notification Bell */}
            <div 
              className="relative"
              onMouseEnter={() => setNotificationDropdownOpen(true)}
              onMouseLeave={() => setNotificationDropdownOpen(false)}
            >
              <button className="relative p-2 text-[var(--fa-secondary)] hover:bg-[var(--fa-surface-container)] rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--fa-error)] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--fa-surface)] rounded-lg shadow-lg border border-[var(--fa-outline-variant)]/20 z-40 max-h-[70vh] sm:max-h-[500px] overflow-y-auto transition-colors duration-300">
                  {/* Header */}
                  <div className="p-3 sm:p-4 border-b border-[var(--fa-outline-variant)]/20 flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--fa-on-surface)]">Notifications</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${unreadCount > 0 ? 'bg-[var(--fa-error)]/10 text-[var(--fa-error)]' : 'bg-[var(--fa-surface-container)] text-[var(--fa-secondary)]'}`}>
                      {unreadCount} New
                    </span>
                  </div>

                  {/* Notifications List */}
                  <div className="divide-y divide-[var(--fa-outline-variant)]/20">
                    {notifications.filter((n: any) => !n.isRead).length > 0 ? (
                      notifications.filter((n: any) => !n.isRead).map((notification: any) => {
                        const timeAgo = getTimeAgo(new Date(notification.sentAt || notification.createdAt))
                        return (
                          <div
                            key={notification.id}
                            className="block p-3 sm:p-4 bg-[var(--fa-primary-container)]/20 border-l-4 border-[var(--fa-primary)]"
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1B3D2F]/15 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--fa-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-[var(--fa-on-surface)] mb-1">{notification.title}</p>
                                <p className="text-xs text-[var(--fa-on-surface-variant)] mb-1">{notification.message}</p>
                                <p className="text-xs text-[var(--fa-secondary)] mt-1">{timeAgo}</p>
                              </div>
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex-shrink-0 text-xs text-[var(--fa-primary)] font-semibold hover:underline px-2 py-1 rounded hover:bg-[#1B3D2F]/10 transition-colors"
                              >
                                Mark read
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-8 text-center text-sm text-[var(--fa-secondary)]">
                        No new notifications
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.filter((n: any) => !n.isRead).length > 0 && (
                    <div className="p-2 sm:p-3 border-t border-[var(--fa-outline-variant)]/20 flex items-center justify-between">
                      <button
                        onClick={() => {
                          notifications.filter((n: any) => !n.isRead).forEach(n => handleMarkAsRead(n.id))
                          setNotificationDropdownOpen(false)
                        }}
                        className="text-sm font-bold text-[var(--fa-primary)] hover:text-[var(--fa-primary)]/80 transition-colors"
                      >
                        Mark all as read
                      </button>
                      <Link
                        href="/department/notifications"
                        onClick={() => setNotificationDropdownOpen(false)}
                        className="text-xs text-[var(--fa-secondary)] hover:text-[var(--fa-primary)] font-medium"
                      >
                        View all
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 lg:gap-3 hover:bg-[var(--fa-surface-container)] rounded-lg p-2 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-[var(--fa-on-surface)]">{user?.name || 'User'}</div>
                  <div className="text-xs text-[var(--fa-secondary)] hidden lg:block">{user?.department?.name || user?.college?.name || user?.role}</div>
                </div>
                <div className="w-10 h-10 bg-[#152e22] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{getInitials(user?.name || '')}</span>
                </div>
                <svg className="w-4 h-4 text-[var(--fa-secondary)] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[var(--fa-surface)] rounded-lg shadow-lg border border-[var(--fa-outline-variant)]/20 z-40 max-h-[80vh] overflow-y-auto transition-colors duration-300">
                    {/* Profile Info */}
                    <div className="p-3 sm:p-4 border-b border-[var(--fa-outline-variant)]/20">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#152e22] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-base sm:text-lg">{getInitials(user?.name || '')}</span>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-medium text-[var(--fa-on-surface)]">{user?.name || 'User'}</div>
                          <div className="text-xs sm:text-sm text-[var(--fa-secondary)]">{user?.department?.name || user?.college?.name || user?.role}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-[var(--fa-on-surface-variant)]">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{formData.email || user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--fa-on-surface-variant)]">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{formData.phone || user?.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-[var(--fa-on-surface-variant)]">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs">{formData.office || user?.office || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={openProfileModal}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[var(--fa-on-surface)] hover:bg-[var(--fa-surface-container)] rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium">Edit Profile</span>
                      </button>
                      <button
                        onClick={openSettings}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[var(--fa-on-surface)] hover:bg-[var(--fa-surface-container)] rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-[var(--fa-outline-variant)]/20">
                      <button
                        onClick={() => {
                          localStorage.clear()
                          sessionStorage.clear()
                          document.cookie = 'accessToken=; path=/; max-age=0'
                          document.cookie = 'user=; path=/; max-age=0'
                          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
                          localStorage.clear(); sessionStorage.clear()
                          window.location.href = '/?logout=true'
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[var(--fa-error)] hover:bg-[var(--fa-error)]/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-24">
          {children}
        </main>
      </div>

      {/* Profile Edit Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setProfileModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Settings</h2>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 px-4 sm:px-6">
                <nav className="flex gap-4 sm:gap-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 sm:pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'profile'
                        ? 'border-[var(--fa-primary)] text-[var(--fa-primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`pb-3 sm:pb-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'password'
                        ? 'border-[var(--fa-primary)] text-[var(--fa-primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {/* Profile Information Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Profile Picture */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-[#152e22] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">{getInitials(user?.name || '')}</span>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="px-4 py-2 bg-[#1B3D2F]/10 text-[var(--fa-primary)] rounded-lg hover:bg-[#1B3D2F]/15 transition-colors text-sm font-medium"
                          >
                            Change Photo
                          </button>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          id="department"
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Office Location */}
                    <div>
                      <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-2">
                        Office Location
                      </label>
                      <input
                        id="office"
                        type="text"
                        value={formData.office}
                        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setProfileModalOpen(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#152e22] text-white rounded-lg hover:bg-[#1B3D2F] transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
                      <p className="text-sm text-gray-500">
                        Ensure your account is using a long, random password to stay secure.
                      </p>
                    </div>

                    {/* Current Password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          setProfileModalOpen(false)
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#152e22] text-white rounded-lg hover:bg-[#1B3D2F] transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSettingsOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Tabs */}
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-4">
                  {['profile', 'account', 'invite'].map(tab => (
                    <button key={tab} onClick={() => setSettingsTab(tab)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${settingsTab === tab ? 'border-[var(--fa-primary)] text-[var(--fa-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {tab === 'invite' ? 'Invite Employees' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Content */}
              <div className="p-6">
                {settingsTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-[var(--fa-primary)]">
                          {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <label htmlFor="settingsImageUpload" className="absolute bottom-0 right-0 bg-[#152e22] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#1B3D2F]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </label>
                        <input type="file" id="settingsImageUpload" accept="image/*" onChange={handleSettingsImageUpload} className="hidden" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{settingsForm.name}</p>
                        <p className="text-sm text-gray-500">{user?.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={settingsForm.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" value={settingsForm.phoneNumber} onChange={e => setSettingsForm({...settingsForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input type="text" value={settingsForm.department} onChange={e => setSettingsForm({...settingsForm, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleSettingsSave} disabled={settingsSaving} className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium">
                        {settingsSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
                {settingsTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <div><p className="text-sm font-medium text-gray-900">Email</p><p className="text-sm text-gray-500">{settingsForm.email}</p></div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <div><p className="text-sm font-medium text-gray-900">Role</p><p className="text-sm text-gray-500">{user?.role}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'invite' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Invite Employees</h3>
                      <p className="text-sm text-gray-500 mt-1">Invited employees will receive an email with a temporary password.</p>
                    </div>
                    <div className="flex gap-2">
                      {(['email', 'csv'] as const).map(mode => (
                        <button key={mode} onClick={() => setInviteMode(mode)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === mode ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {mode === 'email' ? 'Paste Emails' : 'Upload CSV'}
                        </button>
                      ))}
                    </div>
                    {inviteMode === 'email' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses <span className="text-gray-400 font-normal">(comma or new line)</span></label>
                        <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={4} placeholder="john@university.edu, jane@university.edu" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent font-mono text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CSV File <span className="text-gray-400 font-normal">(must have "email" column)</span></label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[var(--fa-primary)] transition-colors">
                          <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUploadModal" />
                          <label htmlFor="csvUploadModal" className="cursor-pointer text-sm text-gray-500">{csvFile ? csvFile.name : 'Click to upload CSV'}</label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message <span className="text-gray-400 font-normal">(optional)</span></label>
                      <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent text-sm" />
                    </div>
                    <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                      className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium flex items-center gap-2">
                      {inviting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : 'Send Invitations'}
                    </button>
                    {inviteResult && (
                      <div className="space-y-2">
                        {inviteResult.invited.length > 0 && <div className="bg-[#1B3D2F]/10 border border-[var(--fa-primary)]/20 rounded-lg p-3"><p className="text-sm font-medium text-[var(--fa-primary)]">✓ {inviteResult.invited.length} invitation{inviteResult.invited.length !== 1 ? 's' : ''} sent</p></div>}
                        {inviteResult.failed.length > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800">✗ {inviteResult.failed.length} failed</p></div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
    </ThemeProvider>
  )
}

