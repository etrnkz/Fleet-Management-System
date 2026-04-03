'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, notificationApi } from '../../lib/api'
import Toast from '../../components/Toast'
import { EmployeeShell } from '../../components/EmployeeShell'

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Temporarily disable useNotifications to fix Turbopack error
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const isConnected = false
  const markAsRead = () => {}
  const markAllAsRead = () => {}
  const refreshNotifications = async () => {
    try {
      const data = await notificationApi.getAll()
      setNotifications(Array.isArray(data) ? data : [])
      const unread = Array.isArray(data) ? data.filter((n: any) => !n.isRead).length : 0
      setUnreadCount(unread)
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }

  // Load notifications on mount
  useEffect(() => {
    refreshNotifications()
  }, [])

  // const {
  //   notifications,
  //   unreadCount,
  //   isConnected,
  //   markAsRead,
  //   markAllAsRead,
  //   refreshNotifications,
  // } = useNotifications()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      showToast('All notifications marked as read', 'success')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      showToast('Failed to mark notifications as read', 'error')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  return (
    <EmployeeShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread message(s)` : 'Official system messages'}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshNotifications}
            className="p-2.5 text-[#424845] hover:bg-[#eceef0] rounded-lg border border-[#e0e3e5]/80"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B365D] hover:bg-[#D1E1FF]/40 rounded-lg border border-[#1B365D]/30"
            >
              Mark all read
            </button>
          )}
        </div>
      }
    >
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                  filter === f.id
                    ? 'bg-[#1B365D] text-white'
                    : 'bg-[#eceef0] text-[#424845] hover:bg-[#e0e3e5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)] overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-[#424845]">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#c1c8c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-medium">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e0e3e5]">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  className={`p-6 hover:bg-[#F8F9FA] cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-[#D1E1FF]/25 border-l-4 border-[#1B365D]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      !notification.isRead ? 'bg-[#1B365D]' : 'bg-[#c1c8c4]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1B365D] mb-1">
                            {notification.title || notification.type}
                          </p>
                          <p className="text-sm text-[#424845] mb-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] font-medium text-[#727975] uppercase tracking-wide">
                            {new Date(notification.sentAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="text-[#1B365D] hover:text-[#1B365D] text-xs font-semibold uppercase tracking-wide flex-shrink-0"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeShell>
  )
}
