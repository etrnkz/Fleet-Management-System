'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { systemAdminApi } from '@/lib/api'
import { useTheme, ThemeProvider } from '@/components/ThemeProvider'
import PasswordInput from '@/components/PasswordInput'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Users', href: '/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Audit Logs', href: '/audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Broadcast', href: '/broadcast', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
  { name: 'System Config', href: '/config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [maintenanceActive, setMaintenanceActive] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { isDark, toggle: toggleTheme } = useTheme()

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [settingsToast, setSettingsToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        setUser(parsed)
        setProfileForm({ name: parsed.name || '', email: parsed.email || '', phoneNumber: parsed.phoneNumber || '' })
        if (parsed.profileImage) setProfileImage(parsed.profileImage)
      } catch {}
    }
    // Check maintenance mode status - use raw fetch to avoid auto-logout on 401
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/system-admin/config`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null).then((cfg: any) => {
      if (cfg) setMaintenanceActive(cfg?.maintenanceMode?.enabled || false)
    }).catch(() => {})

    // Load notifications + system health alerts
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : []).then((data: any) => {
      const backendNotifs = Array.isArray(data) ? data.filter((n: any) => !n.isRead).slice(0, 10) : []
      
      // Add system health alerts
      const systemAlerts: any[] = []
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/system-admin/system-health`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : null).then((health: any) => {
        if (health) {
          if (health.status !== 'healthy') {
            systemAlerts.push({ id: 'health', title: '⚠️ System Health Degraded', message: `System status: ${health.status}`, sentAt: new Date().toISOString(), isSystem: true })
          }
          if (health.memory && (health.memory.used / health.memory.total) > 0.85) {
            systemAlerts.push({ id: 'memory', title: '⚠️ High Memory Usage', message: `Memory at ${Math.round((health.memory.used / health.memory.total) * 100)}% — consider restarting`, sentAt: new Date().toISOString(), isSystem: true })
          }
        }
        setNotifications([...systemAlerts, ...backendNotifs])
      }).catch(() => setNotifications(backendNotifs))
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    window.location.href = '/?logout=true'
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profileForm.name, phoneNumber: profileForm.phoneNumber })
      })
      if (!res.ok) throw new Error('Failed to update profile')
      const updated = { ...user, name: profileForm.name, phoneNumber: profileForm.phoneNumber, profileImage }
      setUser(updated)
      const storage = (localStorage.getItem('access_token') || localStorage.getItem('accessToken')) ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(updated))
      setSettingsToast({ message: 'Profile updated successfully', type: 'success' })
      setTimeout(() => setSettingsToast(null), 3000)
    } catch (err: any) {
      setSettingsToast({ message: err.message || 'Failed to update', type: 'error' })
      setTimeout(() => setSettingsToast(null), 3000)
    } finally { setSavingProfile(false) }
  }

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSettingsToast({ message: 'Passwords do not match', type: 'error' })
      setTimeout(() => setSettingsToast(null), 3000)
      return
    }
    setSavingPassword(true)
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/users/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      })
      if (!res.ok) throw new Error('Failed to change password')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSettingsToast({ message: 'Password changed successfully', type: 'success' })
      setTimeout(() => setSettingsToast(null), 3000)
    } catch (err: any) {
      setSettingsToast({ message: err.message || 'Failed to change password', type: 'error' })
      setTimeout(() => setSettingsToast(null), 3000)
    } finally { setSavingPassword(false) }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setProfileImage(result)
      const updated = { ...user, profileImage: result }
      setUser(updated)
      const storage = (localStorage.getItem('access_token') || localStorage.getItem('accessToken')) ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(updated))
    }
    reader.readAsDataURL(file)
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SA'

  return (
    <ThemeProvider storageKey="theme_system_admin">
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 flex-shrink-0">
          <img src="/hulogo.png" alt="Haramaya University" className="w-8 h-8 object-contain rounded-full" />
          <div>
            <div className="font-bold text-[#1B3D2F] tracking-tight text-sm">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">SYSTEM ADMIN</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-base overflow-y-auto">
          {/* Maintenance Mode Warning */}
          {maintenanceActive && (
            <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 animate-pulse" />
              <span className="text-xs font-semibold text-orange-700">Maintenance Mode ON</span>
            </div>
          )}
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]' : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
                }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="antialiased tracking-tight">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Open menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-base font-semibold text-[#1B3D2F]">
              {navItems.find(n => n.href === pathname)?.name || 'System Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {maintenanceActive && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                MAINTENANCE
              </span>
            )}
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown(p => !p)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">System Notifications</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${notifications.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {notifications.length} unread
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400">No new notifications</div>
                  ) : notifications.map((n: any) => (
                    <div key={n.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${n.isSystem ? 'bg-orange-50 border-l-4 border-l-orange-400' : ''}`}>
                      <p className="text-sm font-medium text-gray-900">{n.title || n.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setShowProfileDropdown(p => !p)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'System Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'SystemAdmin'}</p>
                </div>
                <div className="w-9 h-9 bg-[#1B3D2F] rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage ? <img src={profileImage} alt="Profile photo" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{initials}</span>}
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#1B3D2F] rounded-full flex items-center justify-center overflow-hidden">
                          {profileImage ? <img src={profileImage} alt="Profile photo" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-lg">{initials}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user?.name || 'System Admin'}</p>
                          <p className="text-xs text-gray-500">{user?.role || 'SystemAdmin'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {user?.email && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        {user?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setShowProfileDropdown(false); setSettingsTab('profile'); setShowSettings(true) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button onClick={() => { setShowProfileDropdown(false); handleLogout() }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
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

        <main className="flex-1 p-4 sm:p-6 pt-20 sm:pt-24">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {settingsToast && (
              <div className={`mx-4 mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white ${settingsToast.type === 'success' ? 'bg-[#1B3D2F]' : 'bg-red-600'}`}>
                {settingsToast.message}
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Account Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close settings">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex border-b border-gray-200 px-5">
              <button onClick={() => setSettingsTab('profile')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${settingsTab === 'profile' ? 'border-[#1B3D2F] text-[#1B3D2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Profile
              </button>
              <button onClick={() => setSettingsTab('password')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${settingsTab === 'password' ? 'border-[#1B3D2F] text-[#1B3D2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Password
              </button>
            </div>
            <div className="p-5 space-y-4">
              {settingsTab === 'profile' && (
                <>
                  <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#1B3D2F] flex items-center justify-center overflow-hidden">
                        {profileImage ? <img src={profileImage} alt="Profile photo" className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-bold">{initials}</span>}
                      </div>
                      <label htmlFor="photoUpload" className="absolute bottom-0 right-0 w-7 h-7 bg-[#1B3D2F] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#152e22]">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </label>
                      <input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                    <p className="text-xs text-gray-500">Click the camera icon to change photo</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
                    <input type="email" value={profileForm.email} readOnly
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <input type="tel" value={profileForm.phoneNumber} onChange={e => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      placeholder="+251 9XX XXX XXX"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                  </div>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="w-full py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50 transition-colors">
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </>
              )}
              {settingsTab === 'password' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Current Password</label>
                    <PasswordInput value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Current password"
                      className="w-full px-3 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">New Password</label>
                    <PasswordInput value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="New password"
                      className="w-full px-3 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                    <PasswordInput value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                  </div>
                  <button onClick={handleSavePassword} disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="w-full py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50 transition-colors">
                    {savingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  )
}
