'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { authApi, notificationApi, userApi, inviteApi } from '@/lib/api'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile')
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [notifList, setNotifList] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('User')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')
  const [settingsToast, setSettingsToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const user = await authApi.getCurrentUser()
      setUserData(user)
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized') || err?.message?.includes('expired')) {
        router.push('/login')
      }
    }
    try {
      const notifs = await notificationApi.getNotifications()
      setNotifications(Array.isArray(notifs) ? notifs : [])
    } catch { setNotifications([]) }
  }

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleLogout = () => {
    // Clear all authentication tokens and user session
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirect to login with logout flag to prevent auto-login
    router.push('/login?logout=true')
  }

  const showSettingsToast = (message: string, type: 'success' | 'error') => {
    setSettingsToast({ message, type })
    setTimeout(() => setSettingsToast(null), 4000)
  }

  const openSettings = () => {
    setShowProfileDropdown(false)
    setSettingsForm({ name: userData?.name || '', email: userData?.email || '', phoneNumber: userData?.phoneNumber || '' })
    setProfileImage(userData?.profileImage || null)
    setSettingsTab('profile')
    setShowSettings(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      await userApi.updateProfile({ name: settingsForm.name, phoneNumber: settingsForm.phoneNumber })
      setUserData((p: any) => ({ ...p, name: settingsForm.name, phoneNumber: settingsForm.phoneNumber }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), name: settingsForm.name, phoneNumber: settingsForm.phoneNumber }))
      showSettingsToast('Profile updated successfully', 'success')
    } catch (err: any) {
      showSettingsToast(err.message || 'Failed to update', 'error')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showSettingsToast('Passwords do not match', 'error'); return }
    if (passwordForm.newPassword.length < 8) { showSettingsToast('Min 8 characters', 'error'); return }
    setSavingPassword(true)
    try {
      await userApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      showSettingsToast('Password changed successfully', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showSettingsToast(err.message || 'Failed to change password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const result = await userApi.uploadProfileImage(file) as any
      const url = result.profileImageUrl
      setProfileImage(url)
      setUserData((p: any) => ({ ...p, profileImage: url }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), profileImage: url }))
      showSettingsToast('Profile picture updated', 'success')
    } catch (err: any) {
      showSettingsToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const loadNotifList = async () => {
    setLoadingNotifs(true)
    try {
      const d = await notificationApi.getNotifications()
      setNotifList(Array.isArray(d) ? d : [])
    } catch { setNotifList([]) }
    finally { setLoadingNotifs(false) }
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
        const emails = inviteEmails.split(/[\n,]+/).map((e: string) => e.trim()).filter((e: string) => e.includes('@'))
        if (emails.length === 0) { showSettingsToast('Enter at least one valid email', 'error'); setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined, role: inviteRole || undefined })
      }
      setInviteResult(result)
      showSettingsToast(result.message || 'Invitations sent!', 'success')
      setInviteEmails('')
      setCsvFile(null)
    } catch (err: any) {
      showSettingsToast(err.message || 'Failed to send invitations', 'error')
    } finally {
      setInviting(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const initials = userData?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DO'

  const navItems = [
    {
      name: 'Dashboard', path: '/dashboard',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    {
      name: 'Trips', path: '/trips',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    },
    {
      name: 'Vehicles', path: '/vehicles',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
    },
    {
      name: 'Drivers', path: '/drivers',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    {
      name: 'Maintenance', path: '/maintenance',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      name: 'Reports', path: '/reports',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      name: 'Notifications', path: '/notifications',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    },
  ]

  const pageTitle = navItems.find(n => n.path === pathname)?.name ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center">
            <span className="text-emerald-700 font-bold text-sm">H</span>
          </div>
          <div>
            <div className="font-bold text-emerald-700 tracking-tight">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-base">
          {navItems.map(item => {
            const isActive = pathname === item.path
            return (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-emerald-700 font-bold border-l-4 border-emerald-700'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
                }`}>
                {item.icon}
                <span className="flex-1 antialiased tracking-tight">{item.name}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifDropdown(p => !p)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 sm:px-1.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${unreadCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{unreadCount} new</span>
                  </div>
                  {notifications.length === 0
                    ? <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
                    : notifications.slice(0, 15).map(n => (
                      <div key={n.id} onClick={() => handleMarkAsRead(n.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-[#1B3D2F]' : ''}`}>
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
              <button onClick={() => setShowProfileDropdown(p => !p)}
                className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="hidden sm:block text-right">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] md:max-w-[120px]">{userData?.name || 'Deployment Officer'}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 hidden lg:block truncate max-w-[80px] md:max-w-[120px]">{userData?.role || 'Deployment Office'}</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#152e22] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-xs sm:text-sm">{initials}</span>
                </div>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-[80vh] overflow-y-auto">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#152e22] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-base sm:text-lg">{initials}</span>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-medium text-gray-900">{userData?.name || 'Deployment Officer'}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{userData?.role || 'Deployment Office'}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{userData?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{userData?.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={openSettings}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pt-24 sm:pt-24">
          {children}
        </main>
      </div>

      {/* Settings Toast */}
      {settingsToast && (
        <div className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${settingsToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {settingsToast.message}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSettings(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-1 px-6 min-w-max">
                  {[['profile','Profile'],['password','Change Password'],['invite','Invite Employees']].map(([id,label]) => (
                    <button key={id} onClick={() => setSettingsTab(id)}
                      className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${settingsTab === id ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {settingsTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-700 flex items-center justify-center border-4 border-white shadow-md">
                          {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-bold">{initials}</span>}
                        </div>
                        <label htmlFor="settingsImgInput" className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#152e22] shadow-lg border-2 border-white">
                          {uploadingImage ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        </label>
                        <input id="settingsImgInput" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{userData?.name || 'Deployment Officer'}</p>
                        <p className="text-sm text-gray-500">{userData?.role || 'DeploymentTeam'}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input type="text" value={settingsForm.name} onChange={e => setSettingsForm(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input type="email" value={settingsForm.email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                        <input type="tel" value={settingsForm.phoneNumber} onChange={e => setSettingsForm(p => ({...p, phoneNumber: e.target.value}))} placeholder="+251912345678" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={settingsSaving} className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                        {settingsSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Email</p><p className="text-sm text-gray-500">{userData?.email}</p>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Role</p><p className="text-sm text-gray-500">{userData?.role}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div><p className="text-sm font-medium text-gray-900">Sign out</p><p className="text-xs text-gray-400">Sign out of your account</p></div>
                        <button type="button" onClick={() => { setShowSettings(false); handleLogout() }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Sign out</button>
                      </div>
                    </div>
                  </form>
                )}
                {settingsTab === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {[
                      { label: 'Current Password', key: 'currentPassword', show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                      { label: 'New Password', key: 'newPassword', show: showNewPw, toggle: () => setShowNewPw(p => !p) },
                      { label: 'Confirm New Password', key: 'confirmPassword', show: false, toggle: () => {} },
                    ].map(({ label, key, show, toggle }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                        <div className="relative">
                          <input type={show ? 'text' : 'password'} value={(passwordForm as any)[key]} onChange={e => setPasswordForm(p => ({...p, [key]: e.target.value}))}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none text-sm" required />
                          {key !== 'confirmPassword' && <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={savingPassword} className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                        {savingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
                {settingsTab === 'invite' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Invite Employees</h3>
                      <p className="text-sm text-gray-500 mt-1">Invited employees receive an email with a temporary password.</p>
                    </div>
                    <div className="flex gap-2">
                      {(['email','csv'] as const).map(mode => (
                        <button key={mode} onClick={() => setInviteMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === mode ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {mode === 'email' ? 'Paste Emails' : 'Upload CSV'}
                        </button>
                      ))}
                    </div>
                    {inviteMode === 'email' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Addresses</label>
                        <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={4} placeholder="john@university.edu, jane@university.edu" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none font-mono text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CSV File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-700/40 transition-colors">
                          <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUploadModal" />
                          <label htmlFor="csvUploadModal" className="cursor-pointer text-sm text-gray-500">{csvFile ? csvFile.name : 'Click to upload CSV'}</label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Role to Assign</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none text-sm">
                        <option value="User">Employee (User)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Welcome Message (optional)</label>
                      <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 outline-none text-sm" />
                    </div>
                    <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                      className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
                      {inviting ? 'Sending...' : 'Send Invitations'}
                    </button>
                    {inviteResult && (
                      <div className="space-y-2">
                        {inviteResult.invited.length > 0 && <div className="bg-emerald-700/5 border border-emerald-700/20 rounded-lg p-3"><p className="text-sm font-medium text-emerald-700">Sent to {inviteResult.invited.length} recipient(s)</p><div className="flex flex-wrap gap-1 mt-1">{inviteResult.invited.map(e => <span key={e} className="text-xs bg-emerald-700/10 text-emerald-700 px-2 py-1 rounded">{e}</span>)}</div></div>}
                        {inviteResult.failed.length > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800">{inviteResult.failed.length} failed</p><div className="space-y-1 mt-1">{inviteResult.failed.map(f => <p key={f.email} className="text-xs text-red-700">{f.email}: {f.reason}</p>)}</div></div>}
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
