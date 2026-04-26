'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { authApi, notificationApi } from '@/lib/api'
import { useTheme, ThemeProvider } from '@/components/ThemeProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile')
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [settingsProfileImage, setSettingsProfileImage] = useState<string | null>(null)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('User')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [showNotificationDetail, setShowNotificationDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const { isDark, toggle: toggleTheme } = useTheme()
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    phone: '',
    office: '',
    title: '',
    department: '',
    emergencyContact: '',
    emergencyPhone: '',
    bio: '',
    profilePhoto: '',
    educationLevel: ''
  })
  const [photoPreview, setPhotoPreview] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') ||
                  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (!token || !userStr) {
      router.push('/login')
      return
    }
    try {
      const parsed = JSON.parse(userStr)
      if (parsed.role !== 'President' && parsed.role !== 'Developer') {
        router.push('/login')
        return
      }
    } catch {
      router.push('/login')
      return
    }
    loadUserData()
    loadNotifications()
  }, [router])

  const loadUserData = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      setUser(userData)
      setEditedUser({
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        phone: userData.phone || '',
        office: userData.office || 'President Office, Main Building',
        title: userData.title || 'University President',
        department: userData.department || 'Executive Office',
        emergencyContact: userData.emergencyContact || '',
        emergencyPhone: userData.emergencyPhone || '',
        bio: userData.bio || '',
        profilePhoto: userData.profilePhoto || '',
        educationLevel: userData.educationLevel || 'Ph.D.'
      })
      setPhotoPreview(userData.profilePhoto || '')
    } catch (error) {
      console.error('Failed to load user data:', error)
      router.push('/login')
    }
  }

  const loadNotifications = async () => {
    try {
      const notificationsData = await notificationApi.getAll()
      
      // Transform notifications to use real data where available
      const enhancedNotifications = notificationsData.map((notif: any) => {
        // Extract real details from notification data
        const details = notif.metadata || notif.data || {}
        
        return {
          ...notif,
          category: notif.type || 'General',
          details: {
            requestId: details.requestId || details.tripId || 'N/A',
            department: details.department || details.requesterDepartment || 'N/A',
            requestedBy: details.requestedBy || details.requesterName || 'N/A',
            purpose: details.purpose || details.reason || notif.message || 'N/A',
            destination: details.destination || 'N/A',
            duration: details.duration || 'N/A',
            vehicleType: details.vehicleType || details.vehicle || 'N/A',
            passengers: details.passengers || details.passengerCount || 'N/A',
            estimatedCost: details.estimatedCost || details.cost || 'N/A',
            deanApproval: details.deanApproval || details.approvalStatus || 'N/A',
            budgetStatus: details.budgetStatus || 'N/A',
            urgency: details.urgency || details.priority || 'Normal',
            alertType: details.alertType || notif.type || 'General',
            period: details.period || 'Current',
            budgetAllocated: details.budgetAllocated || 'N/A',
            actualExpense: details.actualExpense || 'N/A',
            variance: details.variance || 'N/A',
            mainCauses: details.mainCauses || [],
            affectedDepartments: details.affectedDepartments || 'N/A',
            recommendation: details.recommendation || 'N/A',
            actionRequired: details.actionRequired || 'Review required'
          }
        }
      })
      
      setNotifications(enhancedNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
    }
  }

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Navigate using Next.js router for smoother transition
    setTimeout(() => {
      router.push(path)
      // Keep spinner visible a bit longer to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }, 300)
  }

  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    window.location.href = '/?logout=true'
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setEditedUser({...editedUser, profilePhoto: result})
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview('')
    setEditedUser({...editedUser, profilePhoto: ''})
  }

  const handleSaveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        ...editedUser
      }
      // In a real app, you would call an API to update the user
      // await userApi.update(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setShowProfileModal(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const openSettings = () => {
    setShowProfileDropdown(false)
    setSettingsForm({ name: user?.name || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '' })
    setSettingsProfileImage(user?.profileImage || null)
    setActiveSettingsTab('profile')
    setShowSettingsModal(true)
  }

  const handleSettingsSave = async () => {
    try {
      setSettingsSaving(true)
      const { userApi } = await import('@/lib/api')
      await userApi.updateProfile({ name: settingsForm.name, phoneNumber: settingsForm.phoneNumber })
      // Fetch fresh user data from backend
      const freshUserData = await userApi.getProfile()
      setUser(freshUserData)
      localStorage.setItem('user', JSON.stringify(freshUserData))
    } catch (error: any) {
      console.error('Failed to save settings:', error)
    } finally {
      setSettingsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) return
    if (passwordData.newPassword.length < 6) return
    try {
      setSavingPassword(true)
      const { userApi } = await import('@/lib/api')
      await userApi.updateProfile({ password: passwordData.newPassword, currentPassword: passwordData.currentPassword })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Failed to change password:', error)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleSettingsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setSettingsProfileImage(reader.result as string)
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
        if (emails.length === 0) { setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined, role: inviteRole || undefined })
      }
      setInviteResult(result)
      setInviteEmails('')
      setCsvFile(null)
    } catch (error: any) {
      console.error('Failed to send invitations:', error)
    } finally {
      setInviting(false)
    }
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/president/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Approvals', 
      href: '/president/approvals', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Budget & Finance', 
      href: '/president/budget', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Compliance', 
      href: '/president/compliance', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      name: 'Vehicles', 
      href: '/president/vehicles', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )
    },
    { 
      name: 'Reports', 
      href: '/president/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Colleges', 
      href: '/president/departments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      name: 'Audit Trail', 
      href: '/president/audit', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
  ]

  if (!user) return null

  return (
    <ThemeProvider storageKey="theme_president">
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <img src="/hulogo.png" alt="Haramaya University" className="w-8 h-8 object-contain rounded-full" />
              <div className="hidden sm:block">
                <div className="font-bold text-[#1B3D2F] tracking-tight">Haramaya University</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
              </div>
            </div>
          </div>

          {/* Right: Notifications, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
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

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {notifications.filter((n: any) => !n.isRead).length > 9 ? '9+' : notifications.filter((n: any) => !n.isRead).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
                  <div className="p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">Notifications</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${notifications.filter((n: any) => !n.isRead).length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {notifications.filter((n: any) => !n.isRead).length} Unread
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {notifications.filter((n: any) => !n.isRead).length > 0 ? notifications.filter((n: any) => !n.isRead).map((notif: any) => (
                      <div
                        key={notif.id}
                        className="p-3 md:p-4 hover:bg-gray-50 transition-colors bg-blue-50"
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'urgent' ? 'bg-red-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            notif.type === 'approval' || notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={async () => {
                            try { await notificationApi.markAsRead(notif.id) } catch {}
                            setNotifications((prev: any[]) => prev.filter((n: any) => n.id !== notif.id))
                            setSelectedNotification(notif)
                            setShowNotificationDetail(true)
                            setShowNotifications(false)
                          }}>
                            <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.sentAt ? new Date(notif.sentAt).toLocaleString() : notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</p>
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              try { await notificationApi.markAsRead(notif.id) } catch {}
                              setNotifications((prev: any[]) => prev.filter((n: any) => n.id !== notif.id))
                            }}
                            className="text-[10px] text-[#1B3D2F] font-semibold border border-[#1B3D2F]/30 px-2 py-1 rounded hover:bg-[#1B3D2F]/10 transition-colors whitespace-nowrap flex-shrink-0"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                    )}
                  </div>

                  <div className="p-2 md:p-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 flex items-center justify-between gap-2">
                    {notifications.filter((n: any) => !n.isRead).length > 0 && (
                      <button
                        onClick={async () => {
                          try { await notificationApi.markAllAsRead() } catch {}
                          setNotifications([])
                          setShowNotifications(false)
                        }}
                        className="text-sm font-bold text-[#1B3D2F] hover:text-[#1B3D2F]/80 transition-colors"
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

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1B3D2F] to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                <svg className="hidden sm:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1B3D2F] to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.role || 'University President'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{user?.phone || '+251-11-123-4567'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-700">{user?.office || 'President Office, Main Building'}</span>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowProfileModal(true)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowSettingsModal(true)
                        setActiveSettingsTab('profile')
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 text-left"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium text-red-600">Logout</span>
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleNavigation(e, item.href)
                    setShowMobileMenu(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                      : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="antialiased tracking-tight">{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Fixed Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                  : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="antialiased tracking-tight">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Profile Photo Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Profile Photo</h4>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer block relative group"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-[#1B3D2F] group-hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#1B3D2F] to-green-600 rounded-full flex items-center justify-center border-4 border-[#1B3D2F] group-hover:opacity-75 transition-opacity">
                          <span className="text-white text-2xl md:text-3xl font-bold">{editedUser.name?.charAt(0) || 'P'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </label>
                    {photoPreview && (
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center z-10"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Click on the photo to upload</p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or GIF (MAX. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="Dr. Ahmed Hassan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editedUser.title}
                      onChange={(e) => setEditedUser({...editedUser, title: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="University President"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="president@hu.edu.et"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="+251-11-123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Education Level</label>
                    <select
                      value={editedUser.educationLevel}
                      onChange={(e) => setEditedUser({...editedUser, educationLevel: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                    >
                      <option value="">Select Education Level</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Ph.D.">Ph.D.</option>
                      <option value="Post-Doctorate">Post-Doctorate</option>
                      <option value="Professor">Professor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Office Information Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Office Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={editedUser.department}
                      onChange={(e) => setEditedUser({...editedUser, department: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="Executive Office"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Office Location</label>
                    <input
                      type="text"
                      value={editedUser.office}
                      onChange={(e) => setEditedUser({...editedUser, office: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="President Office, Main Building"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editedUser.emergencyContact}
                      onChange={(e) => setEditedUser({...editedUser, emergencyContact: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={editedUser.emergencyPhone}
                      onChange={(e) => setEditedUser({...editedUser, emergencyPhone: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                      placeholder="+251-91-234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Professional Bio</h4>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Biography</label>
                  <textarea
                    value={editedUser.bio}
                    onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                    rows={4}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] text-sm md:text-base"
                    placeholder="Brief professional biography..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-sm md:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-start space-x-3 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Profile Updated Successfully</h4>
              <p className="text-sm text-gray-600 mt-1">Your profile information has been saved.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showNotificationDetail && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 ${
              selectedNotification.type === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              selectedNotification.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              selectedNotification.type === 'approval' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              selectedNotification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-[#152e22]' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            } text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      {selectedNotification.category}
                    </span>
                    {selectedNotification.type === 'urgent' && (
                      <span className="px-3 py-1 bg-red-900/50 rounded-full text-xs font-bold">
                        URGENT
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedNotification.title}</h3>
                  <p className="text-white/90 text-sm">{selectedNotification.time}</p>
                </div>
                <button
                  onClick={() => setShowNotificationDetail(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-[#1B3D2F]">
                  <p className="text-gray-800 font-medium">{selectedNotification.message}</p>
                </div>

                {/* Details */}
                {selectedNotification.details && (
                  <div className="space-y-4">
                    {Object.entries(selectedNotification.details).map(([key, value]) => {
                      if (typeof value === 'string') {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-gray-800">{value}</p>
                          </div>
                        )
                      } else if (Array.isArray(value)) {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <ul className="space-y-2">
                              {value.map((item, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-[#1B3D2F] mt-1">•</span>
                                  <span className="text-gray-800 flex-1">
                                    {typeof item === 'object' && item !== null ? (
                                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                        {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                                          <div key={k} className="flex justify-between">
                                            <span className="text-sm text-gray-600 capitalize">
                                              {k.replace(/([A-Z])/g, ' $1').trim()}:
                                            </span>
                                            <span className="text-sm font-medium text-gray-800">{String(v)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      item
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      } else if (value !== null && typeof value === 'object') {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 capitalize">
                                    {k.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificationDetail(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all"
              >
                Close
              </button>
              {(selectedNotification.type === 'urgent' || selectedNotification.type === 'approval') && (
                <>
                  <button
                    onClick={() => {
                      setShowNotificationDetail(false)
                      setShowSuccessToast(true)
                      setTimeout(() => setShowSuccessToast(false), 3000)
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationDetail(false)
                      setShowSuccessToast(true)
                      setTimeout(() => setShowSuccessToast(false), 3000)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-[#1B3D2F] to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1B3D2F]"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSettingsModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-1 px-6 min-w-max">
                  {[['profile','Profile'],['password','Password'],['account','Account'],['invite','Invite Employees']].map(([id,label]) => (
                    <button key={id} onClick={() => setActiveSettingsTab(id)}
                      className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeSettingsTab === id ? 'border-[#1B3D2F] text-[#1B3D2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {/* Profile Tab */}
                {activeSettingsTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1B3D2F]">
                          {settingsProfileImage ? <img src={settingsProfileImage} alt="Profile" className="w-full h-full object-cover" /> : (
                            <div className="w-full h-full flex items-center justify-center bg-[#152e22] text-white text-2xl font-bold">
                              {(settingsForm.name || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <label htmlFor="settingsImgUpload" className="absolute bottom-0 right-0 bg-[#152e22] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#1B3D2F]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </label>
                        <input type="file" id="settingsImgUpload" accept="image/*" onChange={handleSettingsImageUpload} className="hidden" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{settingsForm.name}</p>
                        <p className="text-sm text-gray-500">{user?.role}</p>
                        <p className="text-xs text-gray-400">{settingsForm.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" value={settingsForm.email} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" value={settingsForm.phoneNumber} onChange={e => setSettingsForm({...settingsForm, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleSettingsSave} disabled={settingsSaving} className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium">
                        {settingsSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
                {/* Password Tab */}
                {activeSettingsTab === 'password' && (
                  <div className="space-y-5 max-w-md">
                    <p className="text-sm text-gray-500">Update your password. You'll need your current password to confirm.</p>
                    {[
                      { label: 'Current Password', key: 'currentPassword', show: showCurrentPassword, toggle: () => setShowCurrentPassword(!showCurrentPassword) },
                      { label: 'New Password', key: 'newPassword', show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
                      { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
                    ].map(({ label, key, show, toggle }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                        <div className="relative">
                          <input type={show ? 'text' : 'password'} value={(passwordData as any)[key]} onChange={e => setPasswordData({...passwordData, [key]: e.target.value})}
                            className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                          <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {show ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handlePasswordChange} disabled={savingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium">
                      {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                )}
                {/* Account Tab */}
                {activeSettingsTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Account Information</h3>
                      <div className="space-y-3">
                        {[['Email', settingsForm.email], ['Role', user?.role], ['Status', 'Active']].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-700">{label}</p>
                            <p className="text-sm text-gray-500">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Danger Zone</h3>
                      <div className="border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div><p className="text-sm font-medium text-gray-900">Sign out</p><p className="text-sm text-gray-500">Sign out of your account</p></div>
                          <button onClick={() => { setShowSettingsModal(false); handleLogout() }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Logout</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Invite Tab */}
                {activeSettingsTab === 'invite' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Invite Employees</h3>
                      <p className="text-sm text-gray-500 mt-1">Invited users receive an email with a temporary password.</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses <span className="text-gray-400 font-normal">(comma or new line)</span></label>
                        <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={4} placeholder="john@university.edu, jane@university.edu" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent font-mono text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CSV File <span className="text-gray-400 font-normal">(must have "email" column)</span></label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3D2F] transition-colors">
                          <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUploadSettings" />
                          <label htmlFor="csvUploadSettings" className="cursor-pointer text-sm text-gray-500">{csvFile ? csvFile.name : 'Click to upload CSV'}</label>
                        </div>
                        <a href="data:text/csv;charset=utf-8,email%0Ajohn.doe%40university.edu" download="invite_template.csv" className="text-xs text-[#1B3D2F] hover:underline mt-2 inline-block">Download CSV template</a>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role to Assign</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent text-sm">
                        <option value="User">Employee (User)</option>
                        <option value="DepartmentHead">Department Head</option>
                        <option value="CollegeHead">College Head</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message <span className="text-gray-400 font-normal">(optional)</span></label>
                      <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent text-sm" />
                    </div>
                    <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                      className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium flex items-center gap-2">
                      {inviting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Send Invitations
                      </>}
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
    </ThemeProvider>
  )
}
