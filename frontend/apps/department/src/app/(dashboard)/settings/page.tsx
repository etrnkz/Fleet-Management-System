'use client'

// Settings is now a modal — opened from the profile dropdown in the layout.
// This page redirects back to dashboard if accessed directly.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard') }, [])
  return null
}
