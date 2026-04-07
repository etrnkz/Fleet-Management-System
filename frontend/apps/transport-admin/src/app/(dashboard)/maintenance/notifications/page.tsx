'use client'

import { useState, useEffect } from 'react'
import { notificationApi } from '@/lib/api'

export default function MaintenanceNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationApi.getAll()
        setNotifications(Array.isArray(data) ? data : [])
      } catch {
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      /* ignore */
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => notificationApi.markAsRead(n.id).catch(() => {})))
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const typeIcon = (type: string) => {
    if (type?.toLowerCase().includes('reject'))
      return { icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500', bg: 'bg-red-100' }
    if (type?.toLowerCase().includes('complet'))
      return { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-[#1B3D2F]', bg: 'bg-[#1B3D2F]/15' }
    if (type?.toLowerCase().includes('approv'))
      return { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500', bg: 'bg-blue-100' }
    return {
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      color: 'text-gray-500',
      bg: 'bg-gray-100',
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="px-4 py-2 text-sm text-[#1B3D2F] border border-[#1B3D2F]/30 rounded-lg hover:bg-[#1B3D2F]/10 dark:hover:bg-[#1B3D2F]/20 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          ['all', 'All'],
          ['unread', `Unread (${unreadCount})`],
          ['read', 'Read'],
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === val
                ? 'bg-[#1B3D2F] text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse h-20"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
          No notifications
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const { icon, color, bg } = typeIcon(n.type)
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => !n.isRead && markRead(n.id)}
                onKeyDown={(e) => e.key === 'Enter' && !n.isRead && markRead(n.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  !n.isRead ? 'border-[#1B3D2F]/20 dark:border-[#1B3D2F] bg-[#1B3D2F]/10/30 dark:bg-[#1B3D2F]/10' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${bg} dark:bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {n.title || n.type}
                      </p>
                      {!n.isRead && <span className="w-2 h-2 bg-[#1B3D2F] rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.sentAt || n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
