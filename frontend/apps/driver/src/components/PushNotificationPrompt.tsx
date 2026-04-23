'use client'

import { useEffect, useState } from 'react'
import {
  isPushNotificationSupported,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getExistingSubscription
} from '../lib/pushNotifications'

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => { checkSubscriptionStatus() }, [])

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
      } else {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function sendSubscriptionToBackend(subscription: PushSubscription) {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token')
      if (!token) return
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/subscribe`, {
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

  if (!showPrompt || isSubscribed) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[#1B3D2F]/10 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Enable Notifications</h3>
            <p className="text-xs text-gray-500 mb-3">Get instant updates about your assigned trips</p>
            <div className="flex gap-2">
              <button onClick={handleEnable} disabled={isLoading}
                className="flex-1 px-3 py-2 bg-[#1B3D2F] text-white text-xs font-medium rounded hover:bg-[#152e22] transition-colors disabled:opacity-50">
                {isLoading ? 'Enabling...' : 'Enable'}
              </button>
              <button onClick={handleDismiss} disabled={isLoading}
                className="px-3 py-2 text-gray-500 text-xs font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50">
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
