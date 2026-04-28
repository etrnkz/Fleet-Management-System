'use client'

import { useState, useEffect } from 'react'
import { notificationApi } from '@/lib/api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch { setNotifications([]) }
    finally { setLoading(false) }
  }

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    await Promise.all(unread.map(n => notificationApi.markAsRead(n.id).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications
  const unreadCount = notifications.filter(n => !n.isRead).length

  const getTypeColor = (type: string) => {
    if (type?.includes('Geofence') || type?.includes('Violation')) return 'bg-red-100 text-red-700'
    if (type?.includes('Warning')) return 'bg-amber-100 text-amber-700'
    if (type?.includes('Approved') || type?.includes('Allocated')) return 'bg-[#1B3D2F]/10 text-[#1B3D2F]'
    if (type?.includes('Rejected')) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-sm text-[#1B3D2F] font-medium hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B3D2F] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-400 text-sm">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`bg-white rounded-xl border p-4 transition-colors ${!n.isRead ? 'border-[#1B3D2F]/20 border-l-4 border-l-[#1B3D2F] cursor-pointer hover:bg-gray-50' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{n.title || n.type}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(n.type)}`}>{n.type}</span>
                    {!n.isRead && <span className="w-2 h-2 bg-[#1B3D2F] rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={e => { e.stopPropagation(); handleMarkAsRead(n.id) }}
                    className="text-xs text-[#1B3D2F] hover:underline flex-shrink-0 font-medium">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
