'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { tripApi, notificationApi, vehicleApi, userApi, getCurrentUser } from '../../lib/api'

// Defined outside DashboardPage to prevent state reset on parent re-render
function RequestTripForm({ onSuccess, onToast, user }: {
  onSuccess: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
  user: any
}) {
  const minDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    purposeCategory: 'Official Meeting',
    pickupLocation: '',
    notes: '',
    startDateTime: '',
    endDateTime: '',
    passengerCount: 1,
    tripType: 'Normal' as 'Normal' | 'VIP',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const startTime = new Date(formData.startDateTime).getTime()
    if (startTime - Date.now() < 48 * 60 * 60 * 1000) {
      onToast('Trip must be requested at least 48 hours in advance', 'error')
      return
    }
    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      onToast('End date must be after start date', 'error')
      return
    }
    setSubmitting(true)
    try {
      const purposeText = [
        formData.purposeCategory,
        formData.purpose ? `Details: ${formData.purpose}` : '',
        formData.pickupLocation ? `Pickup: ${formData.pickupLocation}` : '',
        formData.notes ? `Notes: ${formData.notes}` : '',
      ].filter(Boolean).join(' | ')

      const payload = {
        destination: formData.destination,
        purpose: purposeText,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        passengerCount: formData.passengerCount,
        tripType: formData.tripType,
      }
      const createdTrip: any = await tripApi.create(payload)
      await tripApi.submit(createdTrip.id)
      onToast('Trip request submitted successfully!', 'success')
      onSuccess()
    } catch (error: any) {
      onToast(error.message || 'Failed to submit trip request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1B365D] tracking-tight">Request New Trip</h2>
        <p className="text-sm text-[#424845] mt-1 font-medium">Official transport request — all fields marked * are required</p>
      </div>

      <div className="mb-5 p-3 bg-amber-50/90 border border-amber-200/80 rounded-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-700">Trip must be requested at least 48 hours in advance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trip Type */}
        <div>
          <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Trip Type <span className="text-[#ba1a1a]">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {(['Normal', 'VIP'] as const).map(type => (
              <button key={type} type="button"
                onClick={() => setFormData({ ...formData, tripType: type })}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  formData.tripType === type
                    ? 'border-[#1B365D] bg-[#f2f4f6] text-[#1B365D]'
                    : 'border-[#c1c8c4] text-[#424845] hover:border-[#727975]'
                }`}>
                {type === 'Normal' ? 'Normal Trip' : 'VIP Trip'}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination <span className="text-red-500">*</span></label>
          <input type="text" value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="e.g. Dire Dawa Campus, Ministry of Education, Addis Ababa"
            className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none"
            required />
        </div>

        {/* Purpose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose Category <span className="text-red-500">*</span></label>
            <select value={formData.purposeCategory}
              onChange={(e) => setFormData({ ...formData, purposeCategory: e.target.value })}
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none">
              <option>Official Meeting</option>
              <option>Academic Conference</option>
              <option>Field Visit</option>
              <option>Training & Workshop</option>
              <option>Research Activity</option>
              <option>Government Business</option>
              <option>Student Activity</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose Details</label>
            <input type="text" value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Brief description of the trip purpose"
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" />
          </div>
        </div>

        {/* Pickup Location & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <input type="text" value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="e.g. Main Gate, Admin Building, College of Engineering"
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <input type="text" value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Need large vehicle, accessibility requirements"
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date & Time <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={formData.startDateTime} min={minDateTime}
              onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Date & Time <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={formData.endDateTime} min={formData.startDateTime || minDateTime}
              onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
              className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" required />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, passengerCount: Math.max(1, formData.passengerCount - 1) })}
              className="w-10 h-10 rounded-lg border border-[#c1c8c4] flex items-center justify-center text-[#424845] hover:bg-[#eceef0] text-lg font-bold">−</button>
            <input type="number" value={formData.passengerCount}
              onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
              min="1" max="50"
              className="w-24 px-4 py-3 border border-[#c1c8c4] rounded-lg text-center focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none" required />
            <button type="button" onClick={() => setFormData({ ...formData, passengerCount: Math.min(50, formData.passengerCount + 1) })}
              className="w-10 h-10 rounded-lg border border-[#c1c8c4] flex items-center justify-center text-[#424845] hover:bg-[#eceef0] text-lg font-bold">+</button>
            <span className="text-sm text-[#727975]">passengers (including yourself)</span>
          </div>
        </div>

        {/* Summary */}
        {formData.destination && formData.startDateTime && formData.endDateTime && (
          <div className="p-4 bg-[#f2f4f6] border border-[#e0e3e5] rounded-lg text-sm">
            <p className="font-semibold text-[#1B365D] mb-1 uppercase tracking-wide text-xs">Trip Summary</p>
            <p className="text-[#424845]"><span className="font-medium text-[#191c1e]">Destination:</span> {formData.destination}</p>
            <p className="text-[#424845]"><span className="font-medium text-[#191c1e]">Schedule:</span> {new Date(formData.startDateTime).toLocaleString()} → {new Date(formData.endDateTime).toLocaleString()}</p>
            <p className="text-[#424845]"><span className="font-medium text-[#191c1e]">Passengers:</span> {formData.passengerCount} • {formData.tripType}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button"
            onClick={() => setFormData({ destination: '', purpose: '', purposeCategory: 'Official Meeting', pickupLocation: '', notes: '', startDateTime: '', endDateTime: '', passengerCount: 1, tripType: 'Normal' })}
            className="flex-1 py-3 border border-[#c1c8c4] text-[#424845] rounded-lg font-semibold text-sm uppercase tracking-wide hover:bg-[#eceef0] transition-colors">
            Clear Form
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-[#1B365D] text-white py-3 rounded-lg font-semibold text-sm uppercase tracking-wide hover:bg-[#152a47] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Submitting...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Submit Request</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


function DashboardPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Data states
  const [trips, setTrips] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI states
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Load user and data on mount
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Load profile image
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsedData = JSON.parse(userData)
      setProfileImage(parsedData.profileImage || null)
    }
    
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (searchParams.get('section') === 'request') setActiveSection('request')
  }, [searchParams])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [tripsData, notificationsData, vehiclesData] = await Promise.all([
        tripApi.getAll().catch(() => []),
        notificationApi.getAll().catch(() => []),
        vehicleApi.getAll('Active').catch(() => [])
      ])
      setTrips(Array.isArray(tripsData) ? tripsData.filter((t: any) => t.state !== 'CANCELLED') : [])
      setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleSectionChange = (section: string) => {
    if (section === 'request') {
      router.replace('/dashboard?section=request')
      setActiveSection('request')
      return
    }
    if (section === 'dashboard') {
      router.replace('/dashboard')
      setActiveSection('dashboard')
      return
    }
    setActiveSection(section)
  }

  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileFormData, setProfileFormData] = useState({ name: '', email: '', phone: '', department: '', office: '', bio: '' })
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' })
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpenProfileModal = () => {
    setProfileFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      department: user?.department?.name || '',
      office: user?.office || '',
      bio: user?.bio || '',
    })
    setShowProfileDropdown(false)
    setShowProfileModal(true)
    setProfileActiveTab('profile')
  }

  const handleSaveProfile = async () => {
    try {
      await userApi.updateProfile({ name: profileFormData.name, phoneNumber: profileFormData.phone })
      const updated = { ...user, name: profileFormData.name, phoneNumber: profileFormData.phone }
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      setShowProfileModal(false)
      showToast('Profile updated successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error')
    }
  }

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
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

  // Request Trip Form Component - defined outside to prevent re-creation on parent re-render
  // Main dashboard: status bento (matches HTML reference — no separate “Overview” tab)
  const DashboardHome = () => {
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

    return (
      <div className="space-y-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#C4C6D0]/30 pb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">Dashboard</h2>
            <p className="text-[#44474E] mt-2 font-medium">Official university travel request registry and tracking.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionChange('request')}
            className="inline-flex items-center justify-center gap-2 bg-[#1B365D] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-[#152a47] active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm hover:border-[#1B365D]/30 transition-colors">
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Active Trips</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1B365D] font-serif tabular-nums">
                {String(activeTrips.length).padStart(2, '0')}
              </span>
              <span className="bg-[#FAD8FD]/80 text-[#28132E] px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter italic">
                Live
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Pending Approval</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1B365D] font-serif tabular-nums">{pendingTrips.length}</span>
              <svg className="w-8 h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Approved</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1B365D] font-serif tabular-nums">{approvedTrips.length}</span>
              <svg className="w-8 h-8 text-[#1B365D]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Kilometers (recorded)</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1B365D] font-serif tabular-nums">
                {kmTotal > 0 ? Math.round(kmTotal).toLocaleString() : '—'}
              </span>
              <svg className="w-8 h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1B365D] tracking-tight">Recent Trip Requests</h3>
            {trips.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/trips')}
                className="text-xs font-semibold uppercase tracking-wide text-[#1B365D] hover:text-[#1B365D]"
              >
                View all
              </button>
            )}
          </div>
          {trips.length === 0 ? (
            <p className="text-[#727975] text-center py-10 text-sm font-medium">No trip requests on file</p>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip: any) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border border-transparent rounded-xl hover:border-[#e0e3e5] hover:shadow-md transition-all bg-[#F8F9FA]/50"
                >
                  <div>
                    <p className="font-semibold text-[#1B365D]">{trip.destination}</p>
                    <p className="text-xs text-[#424845] mt-1 line-clamp-2">{trip.purpose}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shrink-0 ml-3 ${
                      trip.state?.includes('PENDING')
                        ? 'bg-amber-50 text-amber-800'
                        : trip.state === 'COMPLETED'
                          ? 'bg-[#eceef0] text-[#424845]'
                          : 'bg-[#D1E1FF]/60 text-[#1B365D]'
                    }`}
                  >
                    {trip.state?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Available Vehicles Component
  const AvailableVehicles = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1B365D] tracking-tight">Fleet availability</h2>
        <p className="text-sm text-[#424845] font-medium mt-1">Reference listing — assignment is coordinated by transport office</p>
      </div>
      {vehicles.length === 0 ? (
        <p className="text-[#727975] text-center py-12 font-medium">No vehicles listed</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white rounded-xl p-6 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {vehicle.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{vehicle.make} {vehicle.model}</h3>
              <p className="text-sm text-gray-500 mb-4">{vehicle.plateNumber}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity} seats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="font-medium">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{vehicle.year}</span>
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1B365D] tracking-tight">Document center</h2>
        <p className="text-sm text-[#424845] font-medium mt-1">Official policies and reference materials</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Vehicle Usage Policy.pdf', date: 'Updated Jan 2025', size: '2.5 MB', color: 'red' },
          { name: 'Trip Request Guide.docx', date: 'Uploaded Jan 2025', size: '1.2 MB', color: 'blue' },
          { name: 'Route & Rate Table 2025.xlsx', date: 'Updated Feb 2025', size: '945 KB', color: 'green' },
          { name: 'Safety Guidelines.pdf', date: 'Updated Dec 2024', size: '1.8 MB', color: 'red' },
          { name: 'Fleet Maintenance Schedule.pdf', date: 'Updated Feb 2025', size: '3.1 MB', color: 'red' },
        ].map((doc, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)] hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-800">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B365D] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191c1e]">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-bounce-once">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-[#1B365D] border-[#152a47] text-white'
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 backdrop-blur-md bg-[#F8F9FA]/90 border-b border-[#e0e3e5]/80">
        <div className="h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#eceef0] transition-colors text-[#424845]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#1B365D] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4h1l1.5 7h9L17 4h1" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold text-[#1B365D] font-serif tracking-tight leading-none">Fleet Authority</p>
                <p className="text-[10px] text-[#565F71] font-bold uppercase tracking-widest">University Portal</p>
              </div>
            </div>
          </div>

          {/* Right: notification + profile + logout */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification Bell */}
            <div
              className="relative"
              ref={notifRef}
            >
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2.5 rounded-xl hover:bg-[#eceef0] transition-colors group text-[#424845]"
                title="Notifications"
              >
                <svg className="w-5 h-5 group-hover:text-[#1B365D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg bg-red-500">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#e0e3e5] z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#eceef0] flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#1B365D] uppercase tracking-wide">Notifications</h3>
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
                              onClick={() => { handleMarkNotificationAsRead(notification.id) }}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.isRead
                                  ? notification.type?.toLowerCase().includes('reject')
                                    ? 'bg-red-50 border-l-4 border-red-400'
                                    : 'bg-blue-50 border-l-4 border-blue-400'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  !notification.isRead
                                    ? notification.type?.toLowerCase().includes('reject') ? 'bg-red-500' : 'bg-blue-500'
                                    : 'bg-gray-300'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={notification.type?.toLowerCase().includes('reject') ? 'text-sm font-medium truncate text-red-700' : 'text-sm font-medium truncate text-gray-900'}>
                                    {notification.title || notification.type}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.sentAt || notification.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-[#c1c8c4]/50 mx-1 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setShowProfileDropdown(prev => !prev)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#eceef0] transition-colors group"
              >
                <div className="w-9 h-9 bg-[#1B365D] rounded-lg flex items-center justify-center ring-2 ring-[#D1E1FF]/50 group-hover:ring-[#D1E1FF] transition-all overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-[#424845] font-medium uppercase tracking-wide leading-tight">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#e0e3e5] z-50 overflow-hidden">
                  {/* Profile header */}
                  <div className="p-4 bg-[#f2f4f6] border-b border-[#e0e3e5]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#1B365D] rounded-lg flex items-center justify-center overflow-hidden">
                        {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.department?.name || user?.role}</p>
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
                  {/* Menu items */}
                  <div className="p-2">
                    <button onClick={handleOpenProfileModal}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <div><p className="text-sm font-medium">Edit Profile</p><p className="text-xs text-gray-400">Update your information</p></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false)
                        router.push('/notifications')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-gray-400">{unreadCount} unread</p></div>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button onClick={() => { setShowProfileDropdown(false); handleLogout() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <div><p className="text-sm font-medium">Logout</p><p className="text-xs text-red-400">Sign out of your account</p></div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-[#c1c8c4]/50 mx-1 hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={sidebarOpen ? 'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#f2f4f6] border-r border-[#e0e3e5]/80 z-30 transition-transform duration-300 translate-x-0 lg:translate-x-0 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]' : 'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#f2f4f6] border-r border-[#e0e3e5]/80 z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]'}>
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', type: 'section' },
              { id: 'request', label: 'Request Trip', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', type: 'section' },
              { id: 'trips', label: 'My Trips', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', type: 'page' },
              { id: 'vehicles', label: 'Available Vehicles', icon: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z', type: 'section' },
              { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', type: 'page', badge: unreadCount },
              { id: 'documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', type: 'section' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  item.type === 'page' ? router.push(`/${item.id}`) : handleSectionChange(item.id)
                }
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-white text-[#1B365D] border border-[#e0e3e5]/80 shadow-sm'
                    : 'text-[#424845] hover:bg-[#eceef0]'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wide">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-64">
          {activeSection === 'dashboard' && <DashboardHome />}
          {activeSection === 'request' && (
            <RequestTripForm
              onSuccess={() => {
                loadDashboardData()
                setActiveSection('dashboard')
                router.replace('/dashboard')
              }}
              onToast={showToast}
              user={user}
            />
          )}
          {activeSection === 'vehicles' && <AvailableVehicles />}
          {activeSection === 'documents' && <DocumentCenter />}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex gap-6">
                {(['profile', 'password'] as const).map(tab => (
                  <button key={tab} onClick={() => setProfileActiveTab(tab)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${profileActiveTab === tab ? 'border-[#1B365D] text-[#1B365D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'profile' ? 'Profile Information' : 'Change Password'}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6">
              {profileActiveTab === 'profile' && (
                <div className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#1B365D] rounded-lg flex items-center justify-center overflow-hidden">
                      {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Profile Photo</p>
                      <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Email', key: 'email', type: 'email' },
                      { label: 'Phone', key: 'phone', type: 'tel' },
                      { label: 'Department', key: 'department', type: 'text' },
                      { label: 'Office', key: 'office', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <input type={f.type} value={(profileFormData as any)[f.key]}
                          onChange={e => setProfileFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D]" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea rows={3} value={profileFormData.bio}
                      onChange={e => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => setShowProfileModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveProfile} className="px-5 py-2 bg-[#1B365D] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#152a47]">Save Changes</button>
                  </div>
                </div>
              )}
              {profileActiveTab === 'password' && (
                <div className="space-y-4">
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password', key: 'newPass' },
                    { label: 'Confirm New Password', key: 'confirm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input type="password" value={(passwordData as any)[f.key]}
                        onChange={e => setPasswordData(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D]" />
                    </div>
                  ))}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => setShowProfileModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => {
                      if (passwordData.newPass !== passwordData.confirm) { showToast('Passwords do not match', 'error'); return }
                      showToast('Password changed successfully', 'success')
                      setShowProfileModal(false)
                      setPasswordData({ current: '', newPass: '', confirm: '' })
                    }} className="px-5 py-2 bg-[#1B365D] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#152a47]">Change Password</button>
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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B365D] border-t-transparent" />
        </div>
      }
    >
      <DashboardPageInner />
    </Suspense>
  )
}
