'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, getCurrentUser, notificationApi, vehicleApi, userApi, collegeApi, departmentApi } from '@/lib/api'
import TripRequestForm from '@/components/TripRequestForm'
import { useTheme, ThemeProvider } from '@/components/ThemeProvider'
import PasswordInput from '@/components/PasswordInput'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'

export default function DashboardPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [tripDetailLoading, setTripDetailLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  
  // Dashboard-style states
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { isDark, toggle: toggleTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  const notifRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Safe localStorage setter that handles quota exceeded errors
  const safeSetLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        // Clear some non-essential data and try again
        localStorage.removeItem('userData')
        try {
          localStorage.setItem(key, value)
        } catch (retryError) {
          console.warn('localStorage quota exceeded, unable to save:', key)
          showToast('Storage quota exceeded. Some settings may not be saved.', 'error')
        }
      } else {
        console.error('localStorage error:', error)
      }
    }
  }

  // Compress image before upload to reduce size
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original if compression fails
            }
          },
          file.type,
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Load profile image from user data (comes from backend)
    if (currentUser.profileImage) {
      setProfileImage(currentUser.profileImage)
    }
    
    // Clean up any large userData entries to prevent quota issues
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const parsedData = JSON.parse(userData)
        // Remove profileImage from userData if it exists (it should be in user object instead)
        if (parsedData.profileImage) {
          delete parsedData.profileImage
          safeSetLocalStorage('userData', JSON.stringify(parsedData))
        }
      }
    } catch (error) {
      // If userData is corrupted or too large, clear it
      localStorage.removeItem('userData')
    }
    
    loadTrips()
    loadDashboardData()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [notificationsData, vehiclesData] = await Promise.all([
        notificationApi.getAll().catch(() => []),
        vehicleApi.getAll('Active').catch(() => [])
      ])
      setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }
  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await tripApi.getAll()
      setTrips(Array.isArray(data) ? data : [])
    } catch (error: any) {
      showToast(error.message || 'Failed to load trips', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  const openTripDetails = async (trip: any) => {
    setSelectedTrip(trip)
    setTripDetailLoading(true)
    try {
      const full = await tripApi.getById(trip.id)
      setSelectedTrip(full)
    } catch (error: any) {
      showToast(error.message || 'Failed to load trip details', 'error')
      setSelectedTrip(null)
    } finally {
      setTripDetailLoading(false)
    }
  }

  const allocatedVehicle = (t: any) => t?.allocatedVehicle ?? t?.vehicle ?? null
  const allocatedDriver = (t: any) => t?.allocatedDriver ?? t?.driver ?? null
  const driverDisplayName = (d: any) => {
    if (!d) return ''
    return d.user?.name ?? d.name ?? '—'
  }

  const formatMoney = (n: unknown) => {
    if (n == null || n === '') return '—'
    const num = typeof n === 'string' ? parseFloat(n) : Number(n)
    if (Number.isNaN(num)) return String(n)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatNum = (n: unknown) => {
    if (n == null || n === '') return '—'
    const num = typeof n === 'string' ? parseFloat(n) : Number(n)
    if (Number.isNaN(num)) return String(n)
    return String(num)
  }

  const terminalStates = new Set([
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'AUTO_REJECTED_TIMEOUT',
  ])

  const canCancelTrip = (state: string | undefined) =>
    Boolean(
      state &&
        !terminalStates.has(state) &&
        state !== 'IN_PROGRESS',
    )

  const canDeleteDraft = (state: string | undefined) => state === 'DRAFT'
  const handleCancelTrip = async (id: string) => {
    setCancelTripId(id)
    setSelectedTrip(null) // close the big modal
    setShowCancelModal(true)
  }

  const confirmCancelTrip = async () => {
    if (!cancelTripId) return
    try {
      setActionLoading(true)
      await tripApi.cancel(cancelTripId)
      setCancelSuccess(true)
      loadTrips()
      setSelectedTrip(null)
      setCancelTripId(null)
      // Close after 2 seconds
      setTimeout(() => { setShowCancelModal(false); setCancelSuccess(false) }, 2000)
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel trip', 'error')
      setShowCancelModal(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDraft = async (id: string) => {
    if (
      !confirm(
        'Delete this draft permanently? This cannot be undone. (Submitted trips must be cancelled instead.)',
      )
    )
      return

    try {
      setActionLoading(true)
      await tripApi.deleteDraft(id)
      showToast('Draft deleted', 'success')
      loadTrips()
      setSelectedTrip(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete trip', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelTripId, setCancelTripId] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [tripCompleted, setTripCompleted] = useState(false)

  const handleCompleteTrip = async () => {
    if (!selectedTrip) return
    try {
      setActionLoading(true)
      await tripApi.completeTrip(selectedTrip.id, {
        actualDistance: 0,
        actualFuelCost: 0,
        finalMileage: 0
      })
      setTripCompleted(true)
      loadTrips()
      setSelectedTrip(null)
      setTimeout(() => {
        setShowCompleteModal(false)
        setTripCompleted(false)
      }, 2500)
    } catch (error: any) {
      showToast(error.message || 'Failed to complete trip', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const canCompleteTrip = (state: string | undefined) => state === 'IN_PROGRESS'

  const getStateColor = (state: string) => {
    if (state === 'DRAFT') return 'bg-slate-100 text-slate-800'
    if (state?.includes('PENDING')) return 'bg-yellow-100 text-yellow-700'
    if (
      state === 'APPROVED_FOR_ALLOCATION' ||
      state === 'CAR_ALLOCATED' ||
      state === 'READY' ||
      state === 'PENDING_TRANSPORT_CONFIRM'
    )
      return 'bg-green-100 text-green-700'
    if (state === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700'
    if (state === 'COMPLETED') return 'bg-gray-100 text-gray-700'
    if (state === 'CANCELLED' || state === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }
  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    window.location.href = '/?logout=true'
  }

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.filter((n: any) => n.id !== id))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  // Poll notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      notificationApi.getAll().then((data: any) => {
        setNotifications(Array.isArray(data) ? data : [])
      }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredTrips = trips.filter(trip => {
    // Filter by status
    let statusMatch = true
    if (filter === 'pending') statusMatch = trip.state?.includes('PENDING')
    else if (filter === 'approved') statusMatch = [
      'APPROVED_FOR_ALLOCATION',
      'CAR_ALLOCATED',
      'READY',
      'PENDING_TRANSPORT_CONFIRM',
    ].includes(trip.state)
    else if (filter === 'active') statusMatch = trip.state === 'IN_PROGRESS'
    else if (filter === 'completed') statusMatch = trip.state === 'COMPLETED'
    
    // Filter by search query
    let searchMatch = true
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      const requestNumber = trip.requestNumber || `REQ-${trip.id.slice(-5)}`
      searchMatch = 
        trip.destination?.toLowerCase().includes(query) ||
        requestNumber.toLowerCase().includes(query) ||
        trip.purpose?.toLowerCase().includes(query) ||
        trip.tripType?.toLowerCase().includes(query) ||
        trip.purposeCategory?.toLowerCase().includes(query)
    }
    
    return statusMatch && searchMatch
  })

  // Calculate stats for bento cards
  const pendingTrips = trips.filter((t: any) => t.state?.includes('PENDING'))
  const approvedStates = [
    'APPROVED_FOR_ALLOCATION',
    'CAR_ALLOCATED',
    'READY',
    'PENDING_TRANSPORT_CONFIRM',
  ]
  const approvedTrips = trips.filter((t: any) => approvedStates.includes(t.state))
  const activeTrips = trips.filter((t: any) => t.state === 'IN_PROGRESS')
  const kmTotal = trips.reduce((acc: number, t: any) => {
    const d = t.actualDistance ?? t.estimatedDistance
    if (d == null || d === '') return acc
    const n = typeof d === 'string' ? parseFloat(d) : Number(d)
    return acc + (Number.isNaN(n) ? 0 : n)
  }, 0)

  // Available Vehicles Component
  const AvailableVehicles = () => (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Available Vehicles</h2>
          <p className="text-[#44474E] mt-2 font-medium">Fleet availability reference listing — assignment is coordinated by transport office.</p>
        </div>
      </div>
      {vehicles.length === 0 ? (
        <div className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-12 text-center text-[#44474E]">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#C4C6D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <p className="text-sm font-medium">No vehicles available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 hover:border-[#1B3D2F]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-[#D1E1FF] rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#1B3D2F]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-tight ${
                  vehicle.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <h3 className="font-bold text-[#1B3D2F] text-lg mb-1 font-serif">{vehicle.make} {vehicle.model}</h3>
              <p className="text-sm text-[#565F71] mb-4 font-mono">{vehicle.plateNumber}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Capacity:</span>
                  <span className="font-medium text-[#1B3D2F]">{vehicle.capacity} seats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Fuel Type:</span>
                  <span className="font-medium text-[#1B3D2F]">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Year:</span>
                  <span className="font-medium text-[#1B3D2F]">{vehicle.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Document Center Component
  const DocumentCenter = () => (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Document Center</h2>
          <p className="text-[#44474E] mt-2 font-medium">Official policies and reference materials for university transport.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Vehicle Usage Policy.pdf', date: 'Updated Jan 2025', size: '2.5 MB', color: 'red' },
          { name: 'Trip Request Guide.docx', date: 'Uploaded Jan 2025', size: '1.2 MB', color: 'blue' },
          { name: 'Route & Rate Table 2025.xlsx', date: 'Updated Feb 2025', size: '945 KB', color: 'green' },
          { name: 'Safety Guidelines.pdf', date: 'Updated Dec 2024', size: '1.8 MB', color: 'red' },
          { name: 'Fleet Maintenance Schedule.pdf', date: 'Updated Feb 2025', size: '3.1 MB', color: 'red' },
        ].map((doc, index) => (
          <div key={index} className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 hover:border-[#1B3D2F]/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded flex items-center justify-center ${
                  doc.color === 'red' ? 'bg-red-50' : doc.color === 'blue' ? 'bg-blue-50' : 'bg-green-50'
                }`}>
                  <svg className={`w-6 h-6 ${
                    doc.color === 'red' ? 'text-red-600' : doc.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1B3D2F] font-serif">{doc.name}</p>
                  <p className="text-sm text-[#565F71]">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#ECEEF3] rounded-lg transition-colors" title="View">
                  <svg className="w-5 h-5 text-[#565F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-[#ECEEF3] rounded-lg transition-colors" title="Download">
                  <svg className="w-5 h-5 text-[#565F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Notification Center Component
  const NotificationCenter = () => (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Notifications</h2>
          <p className="text-[#44474E] mt-2 font-medium">All your notifications and system updates.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.isRead) handleMarkNotificationAsRead(n.id)
              })
            }}
            className="text-sm font-bold text-[#1B3D2F] hover:text-[#1B3D2F]/80 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>
      
      <div className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[#44474E]">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#C4C6D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[#C4C6D0]/10">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                onClick={() => { if (!notification.isRead) handleMarkNotificationAsRead(notification.id) }}
                className={`p-6 hover:bg-[#D1E1FF]/10 transition-colors cursor-pointer ${
                  !notification.isRead
                    ? notification.type?.toLowerCase().includes('reject')
                      ? 'bg-red-50 border-l-4 border-red-400'
                      : 'bg-blue-50 border-l-4 border-blue-400'
                    : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    !notification.isRead
                      ? notification.type?.toLowerCase().includes('reject') ? 'bg-red-500' : 'bg-blue-500'
                      : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-bold ${
                        notification.type?.toLowerCase().includes('reject') ? 'text-red-700' : 'text-[#1B3D2F]'
                      }`}>
                        {notification.title || notification.type}
                      </h3>
                      <span className="text-xs text-[#565F71] font-medium">
                        {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[#44474E] leading-relaxed">{notification.message}</p>
                    {notification.tripId && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-[#565F71]">
                          Related to Trip ID: <span className="font-mono font-bold">{notification.tripId}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Feedback Component — memoized to prevent remount on parent re-renders
  // eslint-disable-next-line react/display-name
  const FeedbackSection = useMemo(() => () => {
    const [selectedTrip, setSelectedTrip] = useState<any>(null)
    const [feedbackForm, setFeedbackForm] = useState({
      overallRating: 0,
      driverRating: 0,
      vehicleRating: 0,
      punctualityRating: 0,
      comments: '',
      suggestions: '',
      wouldRecommend: false,
      issues: [] as string[]
    })
    const [submitting, setSubmitting] = useState(false)
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
    const [completedTripsForFeedback, setCompletedTripsForFeedback] = useState<any[]>([])

    useEffect(() => {
      loadCompletedTrips()
    }, [])

    const loadCompletedTrips = async () => {
      try {
        const allTrips = await tripApi.getAll() as any[]
        const completed = allTrips.filter((t: any) => t.state === 'COMPLETED')
        setCompletedTripsForFeedback(completed)
      } catch (error) {
        console.error('Failed to load completed trips:', error)
      }
    }

    const StarRating = ({ rating, onRate, label }: { rating: number; onRate: (rating: number) => void; label: string }) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRate(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 self-center">{rating > 0 ? `${rating}/5` : 'Not rated'}</span>
        </div>
      </div>
    )

    const handleSubmitFeedback = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedTrip) return
      if (feedbackForm.overallRating === 0) {
        showToast('Please provide an overall rating', 'error')
        return
      }

      setSubmitting(true)
      try {
        await tripApi.submitFeedback(selectedTrip.id, feedbackForm)
        setFeedbackSubmitted(true)
        setSelectedTrip(null)
        setFeedbackForm({
          overallRating: 0,
          driverRating: 0,
          vehicleRating: 0,
          punctualityRating: 0,
          comments: '',
          suggestions: '',
          wouldRecommend: false,
          issues: []
        })
        loadCompletedTrips()
        // Auto-hide success after 3 seconds
        setTimeout(() => setFeedbackSubmitted(false), 3000)
      } catch (error: any) {
        showToast(error.message || 'Failed to submit feedback', 'error')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Trip Feedback</h2>
            <p className="text-[#44474E] mt-2 font-medium">Share your experience and help us improve our service.</p>
          </div>
        </div>

        {/* Success state */}
        {feedbackSubmitted && (
          <div className="bg-white rounded-xl border border-green-200 shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Feedback Submitted!</h3>
            <p className="text-gray-500 text-sm text-center">Thank you for your feedback. It has been sent to the transport office.</p>
          </div>
        )}

        {!feedbackSubmitted && !selectedTrip ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select a completed trip to provide feedback</h3>
            {completedTripsForFeedback.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#C4C6D0]/40 shadow-sm p-8 sm:p-12 text-center text-gray-400 text-sm">
                No completed trips available for feedback
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedTripsForFeedback.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-xl border border-[#C4C6D0]/40 shadow-sm p-4 sm:p-6 hover:border-[#1B3D2F]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{trip.requestNumber || `REQ-${trip.id.slice(-5)}`}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">COMPLETED</span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate">{trip.destination}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{trip.purpose}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(trip.startDateTime).toLocaleDateString()}</p>
                      </div>
                      <button className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] flex-shrink-0">
                        Give Feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          !feedbackSubmitted && <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 sm:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback for Trip</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Destination:</span> {selectedTrip.destination}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Date:</span> {new Date(selectedTrip.startDateTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <StarRating
                rating={feedbackForm.overallRating}
                onRate={(rating) => setFeedbackForm({ ...feedbackForm, overallRating: rating })}
                label="Overall Experience *"
              />

              <StarRating
                rating={feedbackForm.driverRating}
                onRate={(rating) => setFeedbackForm({ ...feedbackForm, driverRating: rating })}
                label="Driver Performance"
              />

              <StarRating
                rating={feedbackForm.vehicleRating}
                onRate={(rating) => setFeedbackForm({ ...feedbackForm, vehicleRating: rating })}
                label="Vehicle Condition"
              />

              <StarRating
                rating={feedbackForm.punctualityRating}
                onRate={(rating) => setFeedbackForm({ ...feedbackForm, punctualityRating: rating })}
                label="Punctuality"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions for Improvement</label>
                <textarea
                  value={feedbackForm.suggestions}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                  rows={3}
                  placeholder="How can we improve?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={feedbackForm.wouldRecommend}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, wouldRecommend: e.target.checked })}
                  className="w-4 h-4 text-[#1B3D2F] border-gray-300 rounded focus:ring-[#1B3D2F]"
                />
                <label htmlFor="wouldRecommend" className="text-sm font-medium text-gray-700">
                  I would recommend this service to others
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrip(null)
                    setFeedbackForm({
                      overallRating: 0,
                      driverRating: 0,
                      vehicleRating: 0,
                      punctualityRating: 0,
                      comments: '',
                      suggestions: '',
                      wouldRecommend: false,
                      issues: []
                    })
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || feedbackForm.overallRating === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-[#1B3D2F] text-white rounded-lg font-medium hover:bg-[#152e22] transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }, [])

  // Settings/Profile Component
  const SettingsProfile = () => {
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
    const [departments, setDepartments] = useState<{ id: string; name: string; collegeId?: string; college?: { id: string } }[]>([])
    const [availableDepartments, setAvailableDepartments] = useState<{ id: string; name: string }[]>([])
    const [formData, setFormData] = useState({
      name: '',
      phoneNumber: '',
      employeeId: '',
      organizationType: '',
      college: '',
      office: '',
      department: '',
    })
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    useEffect(() => {
      loadProfileData()
      loadCollegesAndDepartments()
    }, [])

    const loadCollegesAndDepartments = async () => {
      try {
        // Load colleges and departments from backend API
        const [collegesResponse, departmentsResponse] = await Promise.all([
          collegeApi.getAll().catch(() => []),
          departmentApi.getAll().catch(() => [])
        ])
        
        // Set the data from API
        setColleges(Array.isArray(collegesResponse) ? collegesResponse : [])
        setDepartments(Array.isArray(departmentsResponse) ? departmentsResponse : [])
        
        // If API fails, fallback to hardcoded data
        if (!Array.isArray(collegesResponse) || collegesResponse.length === 0) {
          const fallbackColleges = [
            { id: '1', name: 'College of Agriculture and Environmental Sciences' },
            { id: '2', name: 'College of Business and Economics' },
            { id: '3', name: 'College of Computing and Informatics' },
            { id: '4', name: 'College of Education and Behavioural Sciences' },
            { id: '5', name: 'College of Health and Medical Science' },
            { id: '6', name: 'College of Law' },
            { id: '7', name: 'College of Natural and Computational Science' },
            { id: '8', name: 'College of Social Sciences and Humanities' },
            { id: '9', name: 'College of Veterinary Medicine' },
            { id: '10', name: 'Haramaya Institute of Technology (HIT)' },
          ]
          setColleges(fallbackColleges)
        }
        
        if (!Array.isArray(departmentsResponse) || departmentsResponse.length === 0) {
          const fallbackDepartments = [
            // College of Agriculture and Environmental Sciences
            { id: '1', name: 'Agricultural Economics and Agribusiness', collegeId: '1' },
            { id: '2', name: 'Animal and Range Science', collegeId: '1' },
            { id: '3', name: 'Natural Resources and Environmental Science', collegeId: '1' },
            { id: '4', name: 'Plant Sciences', collegeId: '1' },
            { id: '5', name: 'Rural Development and Agricultural Innovation', collegeId: '1' },
            
            // College of Business and Economics
            { id: '6', name: 'Accounting and Finance', collegeId: '2' },
            { id: '7', name: 'Cooperatives', collegeId: '2' },
            { id: '8', name: 'Economics', collegeId: '2' },
            { id: '9', name: 'Management', collegeId: '2' },
            { id: '10', name: 'Public Administration and Development Management', collegeId: '2' },
            
            // College of Computing and Informatics
            { id: '11', name: 'Computer Science', collegeId: '3' },
            { id: '12', name: 'Information Technology', collegeId: '3' },
            { id: '13', name: 'Information System', collegeId: '3' },
            { id: '14', name: 'Information Science', collegeId: '3' },
            { id: '15', name: 'Software Engineering', collegeId: '3' },
            { id: '16', name: 'Statistics', collegeId: '3' },
            
            // College of Education and Behavioural Sciences
            { id: '17', name: 'Adult Education and Community Development', collegeId: '4' },
            { id: '18', name: 'Educational Planning and Management', collegeId: '4' },
            { id: '19', name: 'Psychology', collegeId: '4' },
            { id: '20', name: 'Special Needs and Inclusive Education', collegeId: '4' },
            
            // College of Health and Medical Science
            { id: '21', name: 'Environmental Health Sciences', collegeId: '5' },
            { id: '22', name: 'Medicine', collegeId: '5' },
            { id: '23', name: 'Medical Laboratory Sciences', collegeId: '5' },
            { id: '24', name: 'Nursing and Midwifery', collegeId: '5' },
            { id: '25', name: 'Pharmacy', collegeId: '5' },
            { id: '26', name: 'Public Health', collegeId: '5' },
            
            // College of Law
            { id: '27', name: 'Law', collegeId: '6' },
            
            // College of Natural and Computational Science
            { id: '28', name: 'Biological Sciences and Biotechnology', collegeId: '7' },
            { id: '29', name: 'Mathematics', collegeId: '7' },
            { id: '30', name: 'Physics', collegeId: '7' },
            { id: '31', name: 'Chemistry', collegeId: '7' },
            
            // College of Social Sciences and Humanities
            { id: '32', name: 'Geography Environmental Studies', collegeId: '8' },
            { id: '33', name: 'History and Heritage Management', collegeId: '8' },
            { id: '34', name: 'Foreign Language Studies', collegeId: '8' },
            { id: '35', name: 'Afaan Oromoo', collegeId: '8' },
            { id: '36', name: 'Gender and Development Studies', collegeId: '8' },
            { id: '37', name: 'Sociology', collegeId: '8' },
            
            // College of Veterinary Medicine
            { id: '38', name: 'Doctor of Veterinary Medicine', collegeId: '9' },
            { id: '39', name: 'Veterinary Laboratory Technology', collegeId: '9' },
            
            // HIT (Haramaya Institute of Technology)
            { id: '40', name: 'School of Water Resources and Environmental Engineering', collegeId: '10' },
            { id: '41', name: 'School of Electrical and Computer Engineering', collegeId: '10' },
            { id: '42', name: 'Chemical Engineering', collegeId: '10' },
            { id: '43', name: 'Civil Engineering', collegeId: '10' },
            { id: '44', name: 'Food Science and Post-harvest Technology', collegeId: '10' },
            { id: '45', name: 'Food Technology and Process', collegeId: '10' },
            { id: '46', name: 'Mechanical Engineering', collegeId: '10' },
          ]
          setDepartments(fallbackDepartments)
        }
      } catch (error) {
        console.error('Failed to load colleges and departments:', error)
        // Use fallback data on error
        setColleges([
          { id: '1', name: 'College of Agriculture and Environmental Sciences' },
          { id: '2', name: 'College of Business and Economics' },
          { id: '3', name: 'College of Computing and Informatics' },
        ])
        setDepartments([
          { id: '1', name: 'Computer Science', collegeId: '3' },
          { id: '2', name: 'Management', collegeId: '2' },
        ])
      }
    }

    const loadProfileData = () => {
      const currentUser = getCurrentUser()
      const userData = localStorage.getItem('userData')
      const parsedData = userData ? JSON.parse(userData) : {}
      
      setFormData({
        name: currentUser?.name || '',
        phoneNumber: currentUser?.phoneNumber || '',
        employeeId: parsedData.employeeId || '',
        organizationType: parsedData.organizationType || '',
        college: parsedData.college || '',
        office: parsedData.office || '',
        department: parsedData.department || '',
      })
      
      // Set available departments if college is selected
      if (parsedData.college) {
        setAvailableDepartments(
          departments
            .filter((dept) => {
              // Handle both collegeId and college.id structures from API
              const deptCollegeId = dept.collegeId || dept.college?.id
              return deptCollegeId === parsedData.college
            })
            .map((dept) => ({ id: dept.id, name: dept.name }))
        )
      }
    }

    const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCollege = e.target.value
      setFormData(prev => ({
        ...prev,
        college: selectedCollege,
        department: '' // Reset department when college changes
      }))
      
      // Update available departments based on selected college
      if (selectedCollege) {
        setAvailableDepartments(
          departments
            .filter((dept) => {
              // Handle both collegeId and college.id structures from API
              const deptCollegeId = dept.collegeId || dept.college?.id
              return deptCollegeId === selectedCollege
            })
            .map((dept) => ({ id: dept.id, name: dept.name }))
        )
      } else {
        setAvailableDepartments([])
      }
    }

    const handleRemoveProfileImage = async () => {
      try {
        setSaving(true)
        
        // Remove from backend
        await userApi.removeProfileImage()
        
        // Update local state
        setProfileImage(null)
        
        // Update user object in localStorage (main source of truth)
        const currentUser = getCurrentUser()
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            profileImage: null
          }
          setUser(updatedUser)
          safeSetLocalStorage('user', JSON.stringify(updatedUser))
        }
        
        showToast('Profile picture removed successfully!', 'success')
      } catch (error: any) {
        showToast(error.message || 'Failed to remove profile picture', 'error')
      } finally {
        setSaving(false)
      }
    }

    const handleSaveProfile = async () => {
      try {
        setSaving(true)
        
        // Update profile via backend API
        const profileData = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }
        
        await userApi.updateProfile(profileData)
        
        // Update local user state
        const currentUser = getCurrentUser()
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }
        setUser(updatedUser)
        safeSetLocalStorage('user', JSON.stringify(updatedUser))
        
        // Save only non-image data to userData (to avoid localStorage quota issues)
        const userData = {
          employeeId: formData.employeeId,
          organizationType: formData.organizationType,
          college: formData.college,
          office: formData.office,
          department: formData.department,
          // Don't store profileImage here to avoid quota issues
        }
        safeSetLocalStorage('userData', JSON.stringify(userData))
        
        showToast('Profile updated successfully!', 'success')
      } catch (error: any) {
        showToast(error.message || 'Failed to update profile', 'error')
      } finally {
        setSaving(false)
      }
    }

    const handleChangePassword = async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showToast('New passwords do not match', 'error')
        return
      }
      
      if (passwordData.newPassword.length < 6) {
        showToast('Password must be at least 6 characters long', 'error')
        return
      }

      try {
        setSaving(true)
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        showToast('Password changed successfully!', 'success')
      } catch (error: any) {
        showToast(error.message || 'Failed to change password', 'error')
      } finally {
        setSaving(false)
      }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast('Image size must be less than 5MB', 'error')
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file', 'error')
          return
        }
        
        try {
          setSaving(true)
          
          // Compress image before upload to reduce storage requirements
          const compressedFile = await compressImage(file, 400, 0.7) // Smaller size for profile pics
          
          // Upload to backend
          const response = await userApi.uploadProfileImage(compressedFile)
          
          // Update local state with the returned image URL
          setProfileImage(response.profileImageUrl)
          
          // Update user object in localStorage (this is the main source of truth)
          const currentUser = getCurrentUser()
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              profileImage: response.profileImageUrl
            }
            setUser(updatedUser)
            safeSetLocalStorage('user', JSON.stringify(updatedUser))
          }
          
          showToast('Profile picture updated successfully!', 'success')
        } catch (error: any) {
          showToast(error.message || 'Failed to upload profile picture', 'error')
        } finally {
          setSaving(false)
        }
      }
    }

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Settings</h2>
            <p className="text-[#44474E] mt-2 font-medium">Manage your profile and account settings.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#1B3D2F] text-[#1B3D2F] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-[#1B3D2F] text-[#1B3D2F] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 border-4 border-[#D1E1FF]">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 bg-[#1B3D2F] text-white p-3 rounded-lg cursor-pointer hover:bg-[#152e22] shadow-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input
                      type="file"
                      id="profileImageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-sm text-gray-500">Click to change profile picture</p>
                    {profileImage && (
                      <button
                        onClick={handleRemoveProfileImage}
                        disabled={saving}
                        className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        title="Remove profile picture"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+251-91-234-5678"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        placeholder="Enter your employee ID"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                    >
                      <option value="">Select organization type</option>
                      <option value="college">College</option>
                      <option value="administrative">Administrative Office</option>
                    </select>
                  </div>

                  {formData.organizationType === 'college' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
                        <select
                          value={formData.college}
                          onChange={handleCollegeChange}
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                        >
                          <option value="">Select your college</option>
                          {colleges.map((college) => (
                            <option key={college.id} value={college.id}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={!formData.college}
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select your department</option>
                          {availableDepartments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.organizationType === 'administrative' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Office/Department</label>
                      <input
                        type="text"
                        value={formData.office}
                        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                        placeholder="Enter your office/department"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={loadProfileData}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-[#1B3D2F] text-white rounded-lg font-medium hover:bg-[#152e22] transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <PasswordInput
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <PasswordInput
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <PasswordInput
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="px-6 py-3 bg-[#1B3D2F] text-white rounded-lg font-medium hover:bg-[#152e22] transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
      </div>
    )
  }

  return (
    <ThemeProvider storageKey="theme_employee">
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C20]">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-bounce-once">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-[#1B3D2F] border-[#152e22] text-white'
              : 'bg-[#ba1a1a] border-[#93000a] text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-semibold">{toast.message}</p>
            <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F]"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full flex flex-col bg-white border-r border-gray-200 w-64 flex-shrink-0 z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
          <div>
            <div className="font-bold text-[#1B3D2F] tracking-tight text-sm">Haramaya University</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">FLEET MANAGEMENT</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('dashboard'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'dashboard'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="antialiased tracking-tight">My Trips</span>
          </button>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('request'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'request'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="antialiased tracking-tight">New Request</span>
          </button>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('vehicles'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'vehicles'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <span className="antialiased tracking-tight">Available Vehicles</span>
          </button>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('documents'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'documents'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="antialiased tracking-tight">Documents</span>
          </button>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('notifications'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'notifications'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="antialiased tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => { setActiveSection('feedback'); setIsLoading(false) }, 700) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors transition-colors duration-200 ${
              activeSection === 'feedback'
                ? 'text-[#1B3D2F] font-bold border-l-4 border-[#1B3D2F]'
                : 'text-gray-600 hover:text-[#1B3D2F] hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="antialiased tracking-tight">Feedback</span>
          </button>
        </nav>
        <div className="p-4 space-y-1 border-t border-gray-200">
        </div>
      </aside>
      <main className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="w-full h-16 sticky top-0 z-30 flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-[#C4C6D0]/20 shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#ECEEF3] transition-colors text-[#424845] flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative w-full max-w-md">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#74777F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('')
                  }
                }}
                className="w-full bg-[#ECEEF3] border-none rounded py-2 pl-10 pr-10 text-sm focus:ring-1 focus:ring-[#1B3D2F] focus:bg-white transition-all outline-none"
                placeholder="Search trip ID, destination..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777F] hover:text-[#1B3D2F] transition-colors"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => toggleTheme()}
                className="p-2.5 rounded-xl hover:bg-[#ECEEF3] transition-colors text-[#565F71]"
                title="Toggle theme"
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
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(prev => !prev)}
                  className="relative p-2.5 rounded-xl hover:bg-[#ECEEF3] transition-colors group text-[#565F71]"
                  title="Notifications"
                >
                  <svg className="w-5 h-5 group-hover:text-[#1B3D2F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg bg-red-500">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-[#e0e3e5] z-50 overflow-hidden" style={{ left: 'auto', right: '0', marginLeft: '1rem', marginRight: '0' }}>
                    <div className="px-4 py-3 border-b border-[#eceef0] flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#1B3D2F] uppercase tracking-wide">Notifications</h3>
                      <span className={unreadCount > 0 ? 'text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600' : 'text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500'}>
                        {unreadCount} New
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.filter((n: any) => !n.isRead).length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.filter((n: any) => !n.isRead).map((notification: any) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 transition-colors ${
                                notification.type?.toLowerCase().includes('reject')
                                  ? 'bg-red-50 border-l-4 border-red-400'
                                  : 'bg-blue-50 border-l-4 border-blue-400'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  notification.type?.toLowerCase().includes('reject') ? 'bg-red-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={notification.type?.toLowerCase().includes('reject') ? 'text-sm font-medium truncate text-red-700' : 'text-sm font-medium truncate text-gray-900'}>
                                    {notification.title || notification.type}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.sentAt || notification.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  className="flex-shrink-0 text-xs text-[#1B3D2F] font-semibold hover:underline px-2 py-1 rounded hover:bg-[#1B3D2F]/10 transition-colors"
                                  title="Mark as read"
                                >
                                  Mark read
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.filter((n: any) => !n.isRead).length > 0 && (
                      <div className="px-4 py-3 border-t border-[#eceef0] flex items-center justify-between">
                        <button
                          onClick={() => {
                            notifications.filter((n: any) => !n.isRead).forEach(n => handleMarkNotificationAsRead(n.id))
                            setShowNotifications(false)
                          }}
                          className="text-sm font-bold text-[#1B3D2F] hover:text-[#1B3D2F]/80 transition-colors"
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={() => { setShowNotifications(false); setActiveSection('notifications') }}
                          className="text-xs text-[#565F71] hover:text-[#1B3D2F] transition-colors"
                        >
                          View all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-[#C4C6D0]/30"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-[#1B3D2F] font-serif truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-[#565F71] uppercase tracking-wider font-semibold truncate max-w-[120px]">
                  {user?.department?.name || user?.role || 'Employee'}
                </p>
              </div>
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#C4C6D0]/30 object-cover overflow-hidden bg-[#1B3D2F] flex items-center justify-center flex-shrink-0"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-[#e0e3e5] z-50 overflow-hidden">
                    <div className="p-4 bg-[#f2f4f6] border-b border-[#e0e3e5]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#1B3D2F] rounded-full flex items-center justify-center overflow-hidden">
                          {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.department?.name || user?.role || 'Employee'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="truncate">{user?.email}</span>
                        </div>
                        {user?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>{user?.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button onClick={() => { setShowProfileDropdown(false); setActiveSection('settings') }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                      <button onClick={() => { setShowProfileDropdown(false); handleLogout() }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <div><p className="text-sm font-medium">Logout</p><p className="text-xs text-red-400">Sign out of your account</p></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Content Canvas */}
        <div className="p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">My Trips</h2>
                  <p className="text-[#44474E] mt-2 font-medium">Official university travel request registry and tracking.</p>
                </div>
                <button
                  onClick={() => setActiveSection('request')}
                  className="bg-[#1B3D2F] text-white px-6 py-2.5 rounded font-bold flex items-center gap-2 shadow hover:bg-[#1B3D2F]/90 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request New Trip
                </button>
              </div>

              {/* Stats/Bento Quick View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm hover:border-[#1B3D2F]/30 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Active Trips</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-[#1B3D2F] font-serif">
                      {String(activeTrips.length).padStart(2, '0')}
                    </span>
                    <span className="bg-[#FAD8FD]/80 text-[#28132E] px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter italic">
                      Live
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Pending Approval</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-[#1B3D2F] font-serif">{pendingTrips.length}</span>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Approved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-[#1B3D2F] font-serif">{approvedTrips.length}</span>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#1B3D2F]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Kilometers Saved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-[#1B3D2F] font-serif">
                      {kmTotal > 0 ? Math.round(kmTotal).toLocaleString() : '—'}
                    </span>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
          {/* Main Listing Area */}
          <div className="bg-white dark:bg-slate-800 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="px-8 py-5 flex items-center justify-between bg-[#ECEEF3]/50 dark:bg-slate-700/50 border-b border-[#C4C6D0]/30 dark:border-slate-600">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All Trips' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'active', label: 'Active' },
                  { id: 'completed', label: 'Completed' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-5 py-1.5 rounded text-sm font-bold transition-colors ${
                      filter === f.id
                        ? 'bg-[#1B3D2F] text-white'
                        : 'text-[#44474E] dark:text-slate-300 hover:bg-[#E6E8ED] dark:hover:bg-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                {searchQuery && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search: "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:bg-blue-200 rounded p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    // Clear search and reset to all trips
                    setSearchQuery('')
                    setFilter('all')
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-[#1B3D2F] hover:text-[#152e22] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Clear Filters
                </button>
                <div className="h-6 w-px bg-[#C4C6D0]/40"></div>
                <button className="text-[#74777F] hover:text-[#1B3D2F] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button className="text-[#1B3D2F]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Table Content */}
            {filteredTrips.length === 0 ? (
              <div className="p-12 text-center text-[#44474E]">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#C4C6D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium">
                  {debouncedSearchQuery ? `No trips found matching "${debouncedSearchQuery}"` : 'No trips found'}
                </p>
                {debouncedSearchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-sm text-[#1B3D2F] hover:text-[#152e22] font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#ECEEF3]/30 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600">Request ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600">Destination</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600">Schedule</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600">Vehicle</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 border-b border-[#C4C6D0]/20 dark:border-slate-600 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C4C6D0]/10 dark:divide-slate-700">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-[#D1E1FF]/10 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-[#1B3D2F]">
                          {trip.requestNumber || `REQ-${trip.id.slice(-5)}`}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#D1E1FF] flex items-center justify-center text-[#1B3D2F]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-[#1B3D2F] dark:text-[#A8DADC] font-serif">{trip.destination}</p>
                            <p className="text-xs text-[#565F71] dark:text-slate-400">
                              {trip.tripType ? `${trip.tripType} Trip` : 'Standard Trip'} 
                              {trip.purposeCategory && ` • ${trip.purposeCategory}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-[#191C20] dark:text-slate-200">
                          {new Date(trip.startDateTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-[#565F71] dark:text-slate-400">
                          {new Date(trip.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(trip.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-[#44474E] dark:text-slate-300">
                        {allocatedVehicle(trip) ? (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-slate-200">{allocatedVehicle(trip).make} {allocatedVehicle(trip).model}</p>
                            <p className="text-xs font-mono text-[#1B3D2F] dark:text-[#A8DADC]">{allocatedVehicle(trip).plateNumber}</p>
                            {['READY', 'IN_PROGRESS'].includes(trip.state) && allocatedDriver(trip) && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-green-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="font-semibold">{allocatedDriver(trip).user?.phoneNumber || allocatedDriver(trip).phoneNumber || driverDisplayName(allocatedDriver(trip))}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          'Pending Assignment'
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${
                            trip.state === 'APPROVED_FOR_ALLOCATION' || trip.state === 'CAR_ALLOCATED' || trip.state === 'READY' || trip.state === 'PENDING_TRANSPORT_CONFIRM'
                              ? 'bg-[#D1E1FF] text-[#1B3D2F]'
                              : trip.state?.includes('PENDING')
                                ? 'bg-[#E6E8ED] text-[#565F71]'
                                : trip.state === 'IN_PROGRESS'
                                  ? 'bg-[#FAD8FD] text-[#28132E]'
                                  : 'bg-[#E6E8ED] text-[#565F71]'
                          }`}>
                            {trip.state?.replace(/_/g, ' ')}
                          </span>
                          {(trip.tripType === 'VIP' || trip.tripType === 'SERVICE') && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                              trip.tripType === 'VIP' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}>
                              {trip.tripType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openTripDetails(trip)}
                            className="p-2 text-[#74777F] hover:text-[#1B3D2F] transition-colors hover:bg-[#ECEEF3] rounded"
                            title="Review"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {canDeleteDraft(trip.state) && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDeleteDraft(trip.id)}
                              className="p-2 text-[#74777F] hover:text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/20 rounded"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          {canCancelTrip(trip.state) && !canDeleteDraft(trip.state) && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleCancelTrip(trip.id)}
                              className="p-2 text-[#74777F] hover:text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/20 rounded"
                              title="Cancel"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination/Footer */}
            {filteredTrips.length > 0 && (
              <div className="px-8 py-4 bg-[#ECEEF3]/50 dark:bg-slate-700/50 flex items-center justify-between border-t border-[#C4C6D0]/20 dark:border-slate-600">
                <p className="text-xs font-bold text-[#565F71] dark:text-slate-400 italic">
                  {debouncedSearchQuery 
                    ? `Showing ${filteredTrips.length} of ${trips.length} trips matching "${debouncedSearchQuery}"`
                    : `Showing 1 to ${filteredTrips.length} of ${trips.length} registry entries`
                  }
                </p>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded flex items-center justify-center border border-[#C4C6D0]/30 text-[#74777F] hover:bg-white transition-all disabled:opacity-30" disabled>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded flex items-center justify-center bg-[#1B3D2F] text-white text-xs font-bold shadow-sm">1</button>
                  <button className="w-8 h-8 rounded flex items-center justify-center border border-[#C4C6D0]/30 text-[#74777F] hover:bg-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
            </div>
          )}
          
          {activeSection === 'request' && <TripRequestForm 
            onSuccess={() => {
              // Delay switching back so the checkmark success state is visible for 2s
              setTimeout(() => {
                setActiveSection('dashboard')
                loadTrips()
              }, 2200)
            }}
            onCancel={() => setActiveSection('dashboard')}
            showToast={showToast}
          />}
          {activeSection === 'notifications' && <NotificationCenter />}
          {activeSection === 'feedback' && <FeedbackSection />}
          {activeSection === 'settings' && <SettingsProfile />}
          {activeSection === 'vehicles' && <AvailableVehicles />}
          {activeSection === 'documents' && <DocumentCenter />}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl border border-[#e0e3e5] max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {tripDetailLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B3D2F] border-t-transparent" />
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1B3D2F] tracking-tight">Trip Details</h3>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-4">
                {selectedTrip.requestNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Request number</p>
                    <p className="text-base font-medium text-gray-900">{selectedTrip.requestNumber}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="text-base font-medium text-gray-900">{selectedTrip.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStateColor(selectedTrip.state)}`}>
                      {selectedTrip.state?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="text-base text-gray-900">{selectedTrip.purpose}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date & Time</p>
                    <p className="text-base text-gray-900">
                      {new Date(selectedTrip.startDateTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date & Time</p>
                    <p className="text-base text-gray-900">
                      {new Date(selectedTrip.endDateTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Trip Type</p>
                    <p className="text-base text-gray-900">{selectedTrip.tripType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Passengers</p>
                    <p className="text-base text-gray-900">{selectedTrip.passengerCount}</p>
                  </div>
                </div>

                {(selectedTrip.estimatedFuelCost != null ||
                  selectedTrip.estimatedDistance != null ||
                  selectedTrip.actualFuelCost != null ||
                  selectedTrip.actualDistance != null) && (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Est. fuel cost</p>
                      <p className="text-base text-gray-900">{formatMoney(selectedTrip.estimatedFuelCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Est. distance (km)</p>
                      <p className="text-base text-gray-900">{formatNum(selectedTrip.estimatedDistance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Actual fuel cost</p>
                      <p className="text-base text-gray-900">{formatMoney(selectedTrip.actualFuelCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Actual distance (km)</p>
                      <p className="text-base text-gray-900">{formatNum(selectedTrip.actualDistance)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Details */}
              <div className="space-y-6">
                {(allocatedVehicle(selectedTrip) || allocatedDriver(selectedTrip)) && (
                  <div className={`p-4 rounded-lg border ${
                    ['READY', 'IN_PROGRESS'].includes(selectedTrip.state)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-[#D1E1FF]/20 border-[#D1E1FF]'
                  }`}>
                    {['READY', 'IN_PROGRESS'].includes(selectedTrip.state) && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-sm font-bold text-green-700 uppercase tracking-wide">
                          {selectedTrip.state === 'IN_PROGRESS' ? 'Trip In Progress' : 'Trip Ready — Your Assignment'}
                        </p>
                      </div>
                    )}
                    {!['READY', 'IN_PROGRESS'].includes(selectedTrip.state) && (
                      <p className="text-xs font-semibold text-[#1B3D2F] uppercase tracking-wide mb-3">Assignment</p>
                    )}

                    {allocatedVehicle(selectedTrip) && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vehicle</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#1B3D2F] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {allocatedVehicle(selectedTrip).make?.charAt(0)}{allocatedVehicle(selectedTrip).model?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {allocatedVehicle(selectedTrip).make} {allocatedVehicle(selectedTrip).model}
                              {allocatedVehicle(selectedTrip).year ? ` (${allocatedVehicle(selectedTrip).year})` : ''}
                            </p>
                            <p className="text-xs font-mono font-bold text-[#1B3D2F]">{allocatedVehicle(selectedTrip).plateNumber}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mt-1">
                          {allocatedVehicle(selectedTrip).color && (
                            <span>Color: <span className="font-medium text-gray-800">{allocatedVehicle(selectedTrip).color}</span></span>
                          )}
                          {allocatedVehicle(selectedTrip).fuelType && (
                            <span>Fuel: <span className="font-medium text-gray-800">{allocatedVehicle(selectedTrip).fuelType}</span></span>
                          )}
                          {allocatedVehicle(selectedTrip).capacity != null && (
                            <span>Capacity: <span className="font-medium text-gray-800">{allocatedVehicle(selectedTrip).capacity} seats</span></span>
                          )}
                          {allocatedVehicle(selectedTrip).vehicleType && (
                            <span>Type: <span className="font-medium text-gray-800">{allocatedVehicle(selectedTrip).vehicleType}</span></span>
                          )}
                        </div>
                      </div>
                    )}

                    {allocatedDriver(selectedTrip) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Driver</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#1B3D2F] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {driverDisplayName(allocatedDriver(selectedTrip)).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {driverDisplayName(allocatedDriver(selectedTrip))}
                            </p>
                            <p className="text-xs text-gray-500">Assigned Driver</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          {(allocatedDriver(selectedTrip).user?.phoneNumber || allocatedDriver(selectedTrip).phoneNumber) && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a
                                href={`tel:${allocatedDriver(selectedTrip).user?.phoneNumber || allocatedDriver(selectedTrip).phoneNumber}`}
                                className="font-semibold text-green-700 hover:underline"
                              >
                                {allocatedDriver(selectedTrip).user?.phoneNumber || allocatedDriver(selectedTrip).phoneNumber}
                              </a>
                            </div>
                          )}
                          {allocatedDriver(selectedTrip).licenseNumber && (
                            <span>License: <span className="font-medium text-gray-800">{allocatedDriver(selectedTrip).licenseNumber}</span></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(selectedTrip.deploymentTeamMember || selectedTrip.transportOfficer) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Deployment</p>
                    {selectedTrip.deploymentTeamMember && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500">Deployment team</p>
                        <p className="text-base text-gray-900">{selectedTrip.deploymentTeamMember.name}</p>
                      </div>
                    )}
                    {selectedTrip.transportOfficer && (
                      <div>
                        <p className="text-sm text-gray-500">Transport officer</p>
                        <p className="text-base text-gray-900">{selectedTrip.transportOfficer.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {Array.isArray(selectedTrip.approvals) && selectedTrip.approvals.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Approvals</p>
                    <ul className="space-y-2">
                      {selectedTrip.approvals.map((a: any) => (
                        <li key={a.id} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-900">{a.approvalLevel}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              a.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                              a.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                          {a.approver?.name && <p className="text-xs text-blue-600 mt-1">{a.approver.name}</p>}
                          {a.approvedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(a.approvedAt).toLocaleString()}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedTrip.state === 'REJECTED' || selectedTrip.state === 'AUTO_REJECTED_TIMEOUT') &&
                  selectedTrip.rejectionReason && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Rejection reason</p>
                      <p className="text-sm text-red-900">{selectedTrip.rejectionReason}</p>
                    </div>
                  )}

                {selectedTrip.completedAt && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completed at</p>
                      <p className="text-base text-green-900">{new Date(selectedTrip.completedAt).toLocaleString()}</p>
                    </div>
                    
                    {/* Trip Completion Statistics */}
                    {(selectedTrip.actualDistance || selectedTrip.actualFuelCost) && (
                      <div className="pt-3 border-t border-green-200">
                        <p className="text-sm text-green-600 font-medium mb-2">Trip Statistics</p>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedTrip.actualDistance && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <p className="text-xs text-gray-600 font-medium">Distance</p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{selectedTrip.actualDistance} km</p>
                            </div>
                          )}
                          
                          {selectedTrip.actualFuelCost && selectedTrip.allocatedVehicle && (
                            <>
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <p className="text-xs text-gray-600 font-medium">Fuel Used</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                  {(() => {
                                    // Calculate fuel used from cost and fuel type
                                    const fuelPricePerLiter = selectedTrip.allocatedVehicle.fuelType === 'Diesel' ? 139.84 : 132.18
                                    const fuelUsed = selectedTrip.actualFuelCost / fuelPricePerLiter
                                    return Math.round(fuelUsed * 100) / 100
                                  })()} L
                                </p>
                              </div>
                              
                              <div className="bg-white rounded-lg p-3 col-span-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-xs text-gray-600 font-medium">Fuel Cost</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{selectedTrip.actualFuelCost} Birr</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedTrip.allocatedVehicle.fuelType} @ {selectedTrip.allocatedVehicle.fuelType === 'Diesel' ? '139.84' : '132.18'} Birr/L
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {canCompleteTrip(selectedTrip.state) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleCompleteTrip}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Completing...
                        </>
                      ) : 'Complete Trip'}
                    </button>
                  )}
                  {canDeleteDraft(selectedTrip.state) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleDeleteDraft(selectedTrip.id)}
                      className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete draft
                    </button>
                  )}
                  {canCancelTrip(selectedTrip.state) && !canDeleteDraft(selectedTrip.state) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleCancelTrip(selectedTrip.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel trip
                    </button>
                  )}
                  {!canCancelTrip(selectedTrip.state) && !canDeleteDraft(selectedTrip.state) && !canCompleteTrip(selectedTrip.state) && (
                    <p className="text-sm text-gray-500 text-center">
                      This trip cannot be cancelled or deleted.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Trip Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            {cancelSuccess ? (
              <div className="flex flex-col items-center py-6 space-y-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">Trip Cancelled</h3>
                <p className="text-sm text-gray-500 text-center">Your trip request has been cancelled successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Cancel Trip Request</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to cancel this trip? It will be marked as cancelled and removed from the active workflow.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowCancelModal(false); setCancelTripId(null) }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                    Keep Trip
                  </button>
                  <button onClick={confirmCancelTrip} disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Complete Trip Success Modal */}
      {showCompleteModal && tripCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Trip Completed!</h3>
            <p className="text-gray-500 text-sm text-center">Your trip has been marked as completed successfully.</p>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  )
}
