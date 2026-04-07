'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const pathname = usePathname()
  const router = useRouter()

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
      const { notificationApi } = await import('@/lib/api')
      const data = await notificationApi.getAll()
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

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const handleLogout = () => {
    ;['access_token', 'accessToken', 'refreshToken', 'user'].forEach(k => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })
    router.push('/')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'My Trips',
      href: '/my-trips',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      name: 'Trip Requests',
      href: '/requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: unreadCount,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-sm">H</span>
          </div>
          <div>
            <div className="font-bold text-emerald-600 tracking-tight">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-emerald-600 font-bold border-l-4 border-emerald-600'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 antialiased tracking-tight">{item.name}</span>
                {(item as any).badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {(item as any).badge > 9 ? '9+' : (item as any).badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-emerald-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-emerald-600">
              {pathname === '/dashboard' && 'Employee Dashboard'}
              {pathname === '/my-trips' && 'My Trips'}
              {pathname === '/requests' && 'Trip Requests'}
              {pathname === '/notifications' && 'Notifications'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="relative"
              onMouseEnter={() => setNotificationDropdownOpen(true)}
              onMouseLeave={() => setNotificationDropdownOpen(false)}
            >
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-[70vh] sm:max-h-[500px] overflow-y-auto">
                  <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Notifications</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        unreadCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {unreadCount} New
                    </span>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {notifications.length > 0 ? (
                      notifications.map((notification: any) => {
                        const timeAgo = getTimeAgo(new Date(notification.sentAt || notification.createdAt))
                        return (
                          <div
                            key={notification.id}
                            onClick={() => {
                              handleMarkAsRead(notification.id)
                              setNotificationDropdownOpen(false)
                            }}
                            className={`block p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                                <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                    )}
                  </div>

                  <div className="p-2 sm:p-3 border-t border-gray-200">
                    <Link
                      href="/notifications"
                      onClick={() => setNotificationDropdownOpen(false)}
                      className="block text-center text-xs sm:text-sm text-emerald-800 hover:text-emerald-700 font-medium"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'Employee'}</div>
                  <div className="text-xs text-gray-500 hidden lg:block">{user?.role || 'Employee'}</div>
                </div>
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'EM'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)}></div>

                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-[80vh] overflow-y-auto">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-base sm:text-lg">
                            {user?.name
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase() || 'EM'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-medium text-gray-900">{user?.name || 'Employee'}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{user?.email || ''}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{user?.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
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

        <main className="p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-24">{children}</main>
      </div>
    </div>
  )
}
