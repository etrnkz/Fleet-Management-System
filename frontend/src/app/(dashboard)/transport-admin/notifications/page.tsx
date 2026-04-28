'use client'

import { useState, useEffect } from 'react'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
    : null

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markAsRead = async (id: string) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` }
    }).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = async () => {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` }
    }).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B3D2F]"></div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-[#1B3D2F] hover:bg-[#1B3D2F]/10 rounded-lg font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-[#1B3D2F] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f} {f === 'all' ? `(${notifications.length})` : f === 'unread' ? `(${unreadCount})` : `(${notifications.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">No {filter === 'all' ? '' : filter} notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(n => (
              <div key={n.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{n.title || n.type}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.sentAt || n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)}
                          className="text-xs text-[#1B3D2F] hover:text-[#1B3D2F] font-medium flex-shrink-0 mt-0.5">
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
  )
}
