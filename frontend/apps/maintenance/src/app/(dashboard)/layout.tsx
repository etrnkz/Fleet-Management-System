'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, authApi, notificationApi } from '@/lib/api'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', department: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { router.push('/login'); return }
    setUser(u)
    setProfileForm({ name: u.name || '', email: u.email || '', phone: u.phoneNumber || '', department: u.department?.name || u.college?.name || '' })
    notificationApi.getAll().then((d: any) => setNotifications(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // Hide spinner when route changes — minimum 800ms so it's visible
  useEffect(() => {
    if (navigating) {
      const timer = setTimeout(() => setNavigating(false), 800)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleNav = (href: string) => {
    if (href !== pathname) {
      setNavigating(true)
      setSidebarOpen(false)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const unread = notifications.filter((n: any) => !n.isRead).length

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/requests', label: 'Maintenance Requests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '/schedule', label: 'Schedule & Inspection', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/vehicles', label: 'Vehicles', icon: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
    { href: '/costs', label: 'Cost Tracking', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation spinner */}
      {navigating && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
            <p className="text-sm text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      )}
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Haramaya University</p>
            <p className="text-xs text-gray-500">MAINTENANCE</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href} onClick={() => handleNav(item.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${pathname === item.href ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="hidden lg:block text-lg font-semibold text-gray-900">
            {nav.find(n => n.href === pathname)?.label || 'Maintenance'}
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" onMouseEnter={() => setShowNotif(true)} onMouseLeave={() => setShowNotif(false)}>
              <button className="relative p-2.5 rounded-xl hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${unread > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{unread} New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? <p className="p-6 text-center text-sm text-gray-400">No notifications</p> :
                      notifications.slice(0, 10).map((n: any) => (
                        <div key={n.id} className={`px-4 py-3 text-sm ${!n.isRead ? 'bg-emerald-50' : ''}`}>
                          <p className="font-medium text-gray-900">{n.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-6 bg-gray-200" />
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center ring-2 ring-emerald-100">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-emerald-600 leading-tight">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfile && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-40">
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.name || 'Maintenance Team'}</p>
                          <p className="text-xs text-emerald-600">{user?.role || 'MaintenanceTeam'}</p>
                        </div>
                      </div>
                    </div>
                    {/* Profile Details */}
                    <div className="p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{user?.email || 'maintenance@test.com'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{user?.phoneNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                        <span>{user?.department?.name || user?.college?.name || 'Maintenance Department'}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="p-3 border-t border-gray-100 space-y-1">
                      <button
                        onClick={() => { setShowProfile(false); setShowSettings(true) }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button
                        onClick={() => { setShowProfile(false); handleLogout() }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="pt-16">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                  <p className="text-xs text-gray-500">Manage your account preferences</p>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'password', label: 'Change Password' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'system', label: 'System' },
              ].map(t => (
                <button key={t.id} onClick={() => setSettingsTab(t.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${settingsTab === t.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {settingsSaved && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Changes saved successfully
                </div>
              )}

              {/* Profile Tab */}
              {settingsTab === 'profile' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-emerald-600">{user?.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+251 9xx xxx xxxx" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input value={user?.role || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000) }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              )}

              {/* Password Tab */}
              {settingsTab === 'password' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPw ? 'text' : 'password'} value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCurrentPw ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input type={showNewPw ? 'text' : 'password'} value={passwordForm.newPass}
                        onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showNewPw ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirm}
                      onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  {passwordForm.newPass && passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                  <button onClick={() => { setSettingsSaved(true); setPasswordForm({current:'',newPass:'',confirm:''}); setTimeout(() => setSettingsSaved(false), 3000) }}
                    disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    Update Password
                  </button>
                </div>
              )}

              {/* Notifications Tab */}
              {settingsTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { label: 'New maintenance request assigned', desc: 'Get notified when a request is assigned to you' },
                    { label: 'Request status updates', desc: 'Notifications when request status changes' },
                    { label: 'Budget approval alerts', desc: 'Alerts when budget needs approval' },
                    { label: 'Vehicle maintenance due', desc: 'Reminders for scheduled maintenance' },
                    { label: 'System announcements', desc: 'Important system-wide notifications' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* System Tab */}
              {settingsTab === 'system' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm">Application Info</h3>
                    {[['App Name','HUFMS Maintenance Portal'],['Version','1.0.0'],['API Endpoint', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'],['Environment','Development']].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-800 text-right max-w-xs truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm">System Status</h3>
                    {['Backend API','Database','Notification Service'].map(s => (
                      <div key={s} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{s}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-600 font-medium text-xs">Online</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h3 className="font-medium text-red-800 text-sm mb-2">Danger Zone</h3>
                    <p className="text-xs text-red-600 mb-3">These actions are irreversible. Please be careful.</p>
                    <button onClick={() => { localStorage.clear(); router.push('/login') }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      Sign Out All Devices
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
