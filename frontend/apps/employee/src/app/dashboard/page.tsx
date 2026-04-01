'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, notificationApi, vehicleApi, getCurrentUser } from '../../lib/api'

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
    <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Request New Trip</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in all required details for your trip request</p>
      </div>

      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-700">Trip must be requested at least 48 hours in advance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trip Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {(['Normal', 'VIP'] as const).map(type => (
              <button key={type} type="button"
                onClick={() => setFormData({ ...formData, tripType: type })}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.tripType === type
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {type === 'Normal' ? '🚗 Normal Trip' : '⭐ VIP Trip'}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required />
        </div>

        {/* Purpose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose Category <span className="text-red-500">*</span></label>
            <select value={formData.purposeCategory}
              onChange={(e) => setFormData({ ...formData, purposeCategory: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        {/* Pickup Location & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <input type="text" value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="e.g. Main Gate, Admin Building, College of Engineering"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <input type="text" value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Need large vehicle, accessibility requirements"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date & Time <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={formData.startDateTime} min={minDateTime}
              onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Date & Time <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={formData.endDateTime} min={formData.startDateTime || minDateTime}
              onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, passengerCount: Math.max(1, formData.passengerCount - 1) })}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
            <input type="number" value={formData.passengerCount}
              onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
              min="1" max="50"
              className="w-24 px-4 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 outline-none" required />
            <button type="button" onClick={() => setFormData({ ...formData, passengerCount: Math.min(50, formData.passengerCount + 1) })}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">+</button>
            <span className="text-sm text-gray-500">passengers (including yourself)</span>
          </div>
        </div>

        {/* Summary */}
        {formData.destination && formData.startDateTime && formData.endDateTime && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
            <p className="font-medium text-emerald-800 mb-1">Trip Summary</p>
            <p className="text-emerald-700">📍 {formData.destination}</p>
            <p className="text-emerald-700">📅 {new Date(formData.startDateTime).toLocaleString()} → {new Date(formData.endDateTime).toLocaleString()}</p>
            <p className="text-emerald-700">👥 {formData.passengerCount} passenger{formData.passengerCount > 1 ? 's' : ''} • {formData.tripType} trip</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button"
            onClick={() => setFormData({ destination: '', purpose: '', purposeCategory: 'Official Meeting', pickupLocation: '', notes: '', startDateTime: '', endDateTime: '', passengerCount: 1, tripType: 'Normal' })}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Clear Form
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Submitting...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Submit Request</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


export default function DashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
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
  // Overview Component
  const Overview = () => {
    const pendingTrips = trips.filter((t: any) => t.state?.includes('PENDING'))
    const approvedTrips = trips.filter((t: any) => t.state === 'APPROVED' || t.state === 'CAR_ALLOCATED')
    const completedTrips = trips.filter((t: any) => t.state === 'COMPLETED')

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Trips</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingTrips.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Trips</p>
                <p className="text-3xl font-bold text-green-600">{approvedTrips.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Trips</p>
                <p className="text-3xl font-bold text-blue-600">{completedTrips.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Trip Requests</h3>
            {trips.length > 0 && (
              <button
                onClick={() => router.push('/trips')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View All
              </button>
            )}
          </div>
          {trips.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trip requests yet</p>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip: any) => (
                <div key={trip.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-200 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{trip.destination}</p>
                    <p className="text-sm text-gray-500">{trip.purpose}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trip.state?.includes('PENDING') ? 'bg-yellow-100 text-yellow-700' :
                    trip.state === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    trip.state === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
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
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Vehicles</h2>
      {vehicles.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No vehicles available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Document Center</h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Vehicle Usage Policy.pdf', date: 'Updated Jan 2025', size: '2.5 MB', color: 'red' },
          { name: 'Trip Request Guide.docx', date: 'Uploaded Jan 2025', size: '1.2 MB', color: 'blue' },
          { name: 'Route & Rate Table 2025.xlsx', date: 'Updated Feb 2025', size: '945 KB', color: 'green' },
          { name: 'Safety Guidelines.pdf', date: 'Updated Dec 2024', size: '1.8 MB', color: 'red' },
          { name: 'Fleet Maintenance Schedule.pdf', date: 'Updated Feb 2025', size: '3.1 MB', color: 'red' },
        ].map((doc, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-bounce-once">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-emerald-600 border-emerald-700 text-white'
              : 'bg-red-600 border-red-700 text-white'
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg h-16">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4h1l1.5 7h9L17 4h1" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">HUFMS</span>
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
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                title="Notifications"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
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
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(prev => !prev)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center ring-2 ring-emerald-100 group-hover:ring-emerald-200 transition-all overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-emerald-600 leading-tight">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* Profile header */}
                  <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
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
                    <button onClick={() => { setShowProfileDropdown(false); handleSectionChange('notifications') }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
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
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={sidebarOpen ? 'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-lg z-30 transition-transform duration-300 translate-x-0 lg:translate-x-0' : 'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-lg z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0'}>
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', type: 'section' },
              { id: 'request', label: 'Request Trip', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', type: 'section' },
              { id: 'trips', label: 'My Trips', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', type: 'page' },
              { id: 'vehicles', label: 'Available Vehicles', icon: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z', type: 'section' },
              { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', type: 'page', badge: unreadCount },
              { id: 'documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', type: 'section' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.type === 'page' ? router.push(`/${item.id}`) : handleSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1 text-left">{item.label}</span>
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
          {activeSection === 'overview' && <Overview />}
          {activeSection === 'request' && <RequestTripForm onSuccess={() => { loadDashboardData(); setActiveSection('overview') }} onToast={showToast} user={user} />}
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
                    className={`pb-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${profileActiveTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
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
                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea rows={3} value={profileFormData.bio}
                      onChange={e => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => setShowProfileModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveProfile} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save Changes</button>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  ))}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => setShowProfileModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => {
                      if (passwordData.newPass !== passwordData.confirm) { showToast('Passwords do not match', 'error'); return }
                      showToast('Password changed successfully', 'success')
                      setShowProfileModal(false)
                      setPasswordData({ current: '', newPass: '', confirm: '' })
                    }} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Change Password</button>
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
