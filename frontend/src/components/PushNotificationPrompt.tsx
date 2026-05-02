'use client'

import { useEffect, useState } from 'react'
import {
  isPushNotificationSupported,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getExistingSubscription,
  listenForPushMessages,
  playNotificationSound,
  showBrowserNotification,
} from '@/lib/pushNotifications'

interface InAppNotif {
  id: number
  title: string
  body: string
  url: string
}

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inAppNotifs, setInAppNotifs] = useState<InAppNotif[]>([])

  useEffect(() => {
    checkSubscriptionStatus()

    // Listen for push messages from the service worker
    const cleanup = listenForPushMessages(({ title, body, url }) => {
      // Show in-app toast
      const id = Date.now()
      setInAppNotifs(prev => [...prev, { id, title, body, url }])
      // Auto-dismiss after 6 seconds
      setTimeout(() => setInAppNotifs(prev => prev.filter(n => n.id !== id)), 6000)
    })

    return cleanup
  }, [])

  async function checkSubscriptionStatus() {
    if (!isPushNotificationSupported()) return
    const registration = await registerServiceWorker()
    if (!registration) return
    const existing = await getExistingSubscription(registration)
    if (existing) {
      setIsSubscribed(true)
      await sendSubscriptionToBackend(existing)
    } else if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('pushNotificationPromptDismissed')
      if (!dismissed) setShowPrompt(true)
    }
  }

  async function handleEnable() {
    setIsLoading(true)
    try {
      const permission = await requestNotificationPermission()
      if (permission === 'granted') {
        const registration = await registerServiceWorker()
        if (!registration) throw new Error('SW failed')
        const subscription = await subscribeToPushNotifications(registration)
        if (!subscription) throw new Error('Subscription failed')
        await sendSubscriptionToBackend(subscription)
        setIsSubscribed(true)
        setShowPrompt(false)
        // Play sound to confirm it works
        playNotificationSound()
        showBrowserNotification('Notifications enabled', 'You will now receive fleet management alerts.')
      } else {
        setShowPrompt(false)
      }
    } catch {
      setShowPrompt(false)
      localStorage.setItem('pushNotificationPromptDismissed', Date.now().toString())
    } finally {
      setIsLoading(false)
    }
  }

  async function sendSubscriptionToBackend(subscription: PushSubscription) {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token')
      if (!token) return
      const base = process.env.NEXT_PUBLIC_API_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'
      await fetch(`${base}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      })
    } catch {}
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('pushNotificationPromptDismissed', Date.now().toString())
  }

  return (
    <>
      {/* Permission prompt */}
      {showPrompt && !isSubscribed && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-[#1B3D2F]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Enable Notifications</h3>
                <p className="text-xs text-gray-500 mb-3">Get instant alerts with sound for trip approvals, assignments, and fleet updates</p>
                <div className="flex gap-2">
                  <button onClick={handleEnable} disabled={isLoading}
                    className="flex-1 px-3 py-2 bg-[#1B3D2F] text-white text-xs font-medium rounded-lg hover:bg-[#152e22] transition-colors disabled:opacity-50">
                    {isLoading ? 'Enabling...' : 'Enable'}
                  </button>
                  <button onClick={handleDismiss} disabled={isLoading}
                    className="px-3 py-2 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    Not now
                  </button>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app notification toasts (shown when app is open) */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {inAppNotifs.map(notif => (
          <div key={notif.id}
            className="pointer-events-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-4 max-w-sm w-full flex items-start gap-3 animate-slide-in"
            style={{ animation: 'slideIn 0.3s ease-out' }}>
            {/* Bell icon with pulse */}
            <div className="flex-shrink-0 w-9 h-9 bg-[#1B3D2F] rounded-full flex items-center justify-center relative">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{notif.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.body}</p>
              {notif.url && notif.url !== '/' && (
                <button
                  onClick={() => { window.location.href = notif.url; setInAppNotifs(p => p.filter(n => n.id !== notif.id)) }}
                  className="text-xs text-[#1B3D2F] font-semibold mt-1.5 hover:underline">
                  View →
                </button>
              )}
            </div>
            <button
              onClick={() => setInAppNotifs(p => p.filter(n => n.id !== notif.id))}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  )
}
