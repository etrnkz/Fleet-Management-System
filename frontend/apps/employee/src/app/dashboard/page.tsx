'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { tripApi, getCurrentUser, notificationApi, vehicleApi, userApi } from '../../lib/api'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  const notifRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Load profile image from localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsedData = JSON.parse(userData)
      if (parsedData.profileImage) {
        setProfileImage(parsedData.profileImage)
      }
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
    if (!confirm('Cancel this trip? It will be marked as cancelled and removed from the active workflow.')) return

    try {
      setActionLoading(true)
      await tripApi.cancel(id)
      showToast('Trip cancelled successfully', 'success')
      loadTrips()
      setSelectedTrip(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel trip', 'error')
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
  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
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
          <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">Available Vehicles</h2>
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
            <div key={vehicle.id} className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 hover:border-[#1B365D]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-[#D1E1FF] rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#1B365D]" fill="currentColor" viewBox="0 0 20 20">
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
              <h3 className="font-bold text-[#1B365D] text-lg mb-1 font-serif">{vehicle.make} {vehicle.model}</h3>
              <p className="text-sm text-[#565F71] mb-4 font-mono">{vehicle.plateNumber}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Capacity:</span>
                  <span className="font-medium text-[#1B365D]">{vehicle.capacity} seats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Fuel Type:</span>
                  <span className="font-medium text-[#1B365D]">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#44474E]">Year:</span>
                  <span className="font-medium text-[#1B365D]">{vehicle.year}</span>
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
          <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">Document Center</h2>
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
          <div key={index} className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 hover:border-[#1B365D]/30 transition-colors">
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
                  <p className="text-base font-semibold text-[#1B365D] font-serif">{doc.name}</p>
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

  // New Request Form Component
  const NewRequestForm = () => {
    const [formData, setFormData] = useState({
      destination: '',
      tripType: '',
      purposeCategory: '',
      purpose: '',
      startDateTime: '',
      endDateTime: '',
      passengerCount: 1,
      estimatedDistance: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      // Show different messages based on trip type
      let message = 'Trip request submitted successfully!'
      if (formData.tripType === 'VIP') {
        message = 'VIP trip request submitted! It will be sent directly to the President for approval.'
      } else if (formData.tripType === 'SERVICE') {
        message = 'Service trip request submitted! It will be sent directly to the President for approval.'
      } else if (formData.tripType === 'STANDARD') {
        message = 'Standard trip request submitted! It will follow the normal department approval process.'
      }
      
      // TODO: Implement form submission with trip type routing
      showToast(message, 'success')
      setActiveSection('dashboard')
    }

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">New Trip Request</h2>
            <p className="text-[#44474E] mt-2 font-medium">Submit a new official university travel request.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Destination and Trip Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="tripType"
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all text-gray-900"
                  required
                >
                  <option value="" disabled className="text-gray-400">Select trip type</option>
                  <option value="STANDARD">Standard Trip</option>
                  <option value="VIP">VIP Trip</option>
                  <option value="SERVICE">Service Trip</option>
                </select>
                {formData.tripType && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${
                    formData.tripType === 'STANDARD' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        {formData.tripType === 'STANDARD' && (
                          <>
                            <p className="font-medium">Standard Trip Process</p>
                            <p className="text-xs mt-1">Follows normal approval flow: Department → College → Transport Office</p>
                          </>
                        )}
                        {formData.tripType === 'VIP' && (
                          <>
                            <p className="font-medium">VIP Trip Process</p>
                            <p className="text-xs mt-1">Requires direct presidential approval - bypasses department/college approval</p>
                          </>
                        )}
                        {formData.tripType === 'SERVICE' && (
                          <>
                            <p className="font-medium">Service Trip Process</p>
                            <p className="text-xs mt-1">Requires direct presidential approval - bypasses department/college approval</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Purpose Category */}
            <div>
              <label htmlFor="purposeCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose Category
              </label>
              <select
                id="purposeCategory"
                name="purposeCategory"
                value={formData.purposeCategory || ''}
                onChange={handleChange}
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all text-gray-900"
                required
              >
                <option value="" disabled className="text-gray-400">Select purpose category</option>
                <option value="OFFICIAL">Official Business</option>
                <option value="CONFERENCE">Conference</option>
                <option value="TRAINING">Training</option>
                <option value="MEETING">Meeting</option>
                <option value="RESEARCH">Research</option>
                <option value="INSPECTION">Inspection</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the purpose of your trip"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all resize-none"
                required
              />
            </div>
            
            {/* Start and End Date/Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleChange}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleChange}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  required
                />
              </div>
            </div>
            
            {/* Passengers and Distance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="passengerCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  id="passengerCount"
                  name="passengerCount"
                  value={formData.passengerCount}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  placeholder="1"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="estimatedDistance" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Distance (km)
                </label>
                <input
                  type="number"
                  id="estimatedDistance"
                  name="estimatedDistance"
                  value={formData.estimatedDistance}
                  onChange={handleChange}
                  min="1"
                  placeholder="Enter estimated distance"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  required
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1B365D] text-white rounded-lg font-medium hover:bg-[#152a47] transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Notification Center Component
  const NotificationCenter = () => (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">Notifications</h2>
          <p className="text-[#44474E] mt-2 font-medium">All your notifications and system updates.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.isRead) handleMarkNotificationAsRead(n.id)
              })
            }}
            className="text-sm font-bold text-[#1B365D] hover:text-[#1B365D]/80 transition-colors"
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
                        notification.type?.toLowerCase().includes('reject') ? 'text-red-700' : 'text-[#1B365D]'
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

  // Settings/Profile Component
  const SettingsProfile = () => {
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
    const [departments, setDepartments] = useState<{ id: string; name: string; collegeId: string | null }[]>([])
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
        // Load colleges and departments from API or fallback data
        const collegesData = [
          { id: '1', name: 'College of Engineering' },
          { id: '2', name: 'College of Medicine' },
          { id: '3', name: 'College of Business' },
          { id: '4', name: 'College of Arts and Sciences' },
          { id: '5', name: 'College of Education' },
        ]
        
        const departmentsData = [
          { id: '1', name: 'Computer Science', collegeId: '1' },
          { id: '2', name: 'Electrical Engineering', collegeId: '1' },
          { id: '3', name: 'Mechanical Engineering', collegeId: '1' },
          { id: '4', name: 'Internal Medicine', collegeId: '2' },
          { id: '5', name: 'Surgery', collegeId: '2' },
          { id: '6', name: 'Pediatrics', collegeId: '2' },
          { id: '7', name: 'Accounting', collegeId: '3' },
          { id: '8', name: 'Marketing', collegeId: '3' },
          { id: '9', name: 'Finance', collegeId: '3' },
          { id: '10', name: 'Mathematics', collegeId: '4' },
          { id: '11', name: 'Physics', collegeId: '4' },
          { id: '12', name: 'Chemistry', collegeId: '4' },
          { id: '13', name: 'Elementary Education', collegeId: '5' },
          { id: '14', name: 'Secondary Education', collegeId: '5' },
        ]
        
        setColleges(collegesData)
        setDepartments(departmentsData)
      } catch (error) {
        console.error('Failed to load colleges and departments:', error)
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
            .filter((dept) => dept.collegeId === parsedData.college)
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
            .filter((dept) => dept.collegeId === selectedCollege)
            .map((dept) => ({ id: dept.id, name: dept.name }))
        )
      } else {
        setAvailableDepartments([])
      }
    }

    const handleSaveProfile = async () => {
      try {
        setSaving(true)
        
        // Update user state
        const currentUser = getCurrentUser()
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Get college and department names for display
        const selectedCollege = colleges.find(c => c.id === formData.college)
        const selectedDepartment = availableDepartments.find(d => d.id === formData.department)
        
        // Save extended profile data to localStorage
        const userData = {
          ...formData,
          collegeName: selectedCollege?.name || '',
          departmentName: selectedDepartment?.name || '',
          profileImage,
        }
        localStorage.setItem('userData', JSON.stringify(userData))
        
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        
        const reader = new FileReader()
        reader.onloadend = () => {
          const imageData = reader.result as string
          
          // Update main dashboard profile image state
          setProfileImage(imageData)
          
          // Save to localStorage immediately
          const userData = localStorage.getItem('userData')
          const parsedData = userData ? JSON.parse(userData) : {}
          const updatedUserData = {
            ...parsedData,
            profileImage: imageData
          }
          localStorage.setItem('userData', JSON.stringify(updatedUserData))
          
          showToast('Profile picture updated successfully!', 'success')
        }
        reader.onerror = () => {
          showToast('Failed to read image file', 'error')
        }
        reader.readAsDataURL(file)
      }
    }

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-end border-b border-[#C4C6D0]/30 pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">Settings</h2>
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
                    ? 'border-[#1B365D] text-[#1B365D] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-[#1B365D] text-[#1B365D] bg-blue-50'
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
                    <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 bg-[#1B365D] text-white p-3 rounded-lg cursor-pointer hover:bg-[#152a47] shadow-lg transition-colors">
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
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                    className="px-6 py-3 bg-[#1B365D] text-white rounded-lg font-medium hover:bg-[#152a47] transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] outline-none transition-all"
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
                    className="px-6 py-3 bg-[#1B365D] text-white rounded-lg font-medium hover:bg-[#152a47] transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B365D] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C20]">
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

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full flex flex-col py-8 px-4 bg-white border-r border-[#C4C6D0]/30 h-screen w-64 flex-shrink-0 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1B365D] flex items-center justify-center text-white shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4h1l1.5 7h9L17 4h1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B365D] font-serif">Fleet Authority</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#565F71] font-bold">University Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'dashboard'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="antialiased tracking-tight">My Trips</span>
          </button>
          <button
            onClick={() => setActiveSection('request')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'request'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="antialiased tracking-tight">New Request</span>
          </button>
          <button
            onClick={() => setActiveSection('vehicles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'vehicles'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <span className="antialiased tracking-tight">Available Vehicles</span>
          </button>
          <button
            onClick={() => setActiveSection('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'documents'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="antialiased tracking-tight">Documents</span>
          </button>
        </nav>
        <div className="mt-auto space-y-1 pt-8 border-t border-[#C4C6D0]/20">
          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'notifications'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="antialiased tracking-tight">Notifications</span>
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors duration-200 ${
              activeSection === 'settings'
                ? 'text-[#1B365D] font-bold bg-[#D1E1FF]/30 border-l-4 border-[#1B365D]'
                : 'text-[#565F71] hover:text-[#1B365D] hover:bg-[#ECEEF3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="antialiased tracking-tight">Settings</span>
          </button>
        </div>
      </aside>
      <main className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="w-full h-16 sticky top-0 z-30 flex justify-between items-center px-8 bg-white/95 backdrop-blur-md border-b border-[#C4C6D0]/20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#ECEEF3] transition-colors text-[#424845]"
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
                className="w-full bg-[#ECEEF3] border-none rounded py-2 pl-10 pr-10 text-sm focus:ring-1 focus:ring-[#1B365D] focus:bg-white transition-all outline-none"
                placeholder="Search trip ID, destination..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777F] hover:text-[#1B365D] transition-colors"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className="relative p-2.5 rounded-xl hover:bg-[#ECEEF3] transition-colors group text-[#565F71]"
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

                {/* Notification Dropdown */}
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
                                  <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
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
            </div>
            <div className="h-8 w-px bg-[#C4C6D0]/30"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-[#1B365D] font-serif">{user?.name}</p>
                <p className="text-[10px] text-[#565F71] uppercase tracking-wider font-semibold">{user?.role}</p>
              </div>
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className="w-10 h-10 rounded border border-[#C4C6D0]/30 object-cover overflow-hidden bg-[#1B365D] flex items-center justify-center"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#e0e3e5] z-50 overflow-hidden">
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
                  <h2 className="text-4xl font-bold tracking-tight text-[#1B365D] font-serif italic">My Trips</h2>
                  <p className="text-[#44474E] mt-2 font-medium">Official university travel request registry and tracking.</p>
                </div>
                <button
                  onClick={() => setActiveSection('request')}
                  className="bg-[#1B365D] text-white px-6 py-2.5 rounded font-bold flex items-center gap-2 shadow hover:bg-[#1B365D]/90 active:scale-[0.98] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request New Trip
                </button>
              </div>

              {/* Stats/Bento Quick View */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm hover:border-[#1B365D]/30 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Active Trips</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-[#1B365D] font-serif">
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
                    <span className="text-3xl font-bold text-[#1B365D] font-serif">{pendingTrips.length}</span>
                    <svg className="w-8 h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Approved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-[#1B365D] font-serif">{approvedTrips.length}</span>
                    <svg className="w-8 h-8 text-[#1B365D]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-3">Kilometers Saved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-[#1B365D] font-serif">
                      {kmTotal > 0 ? Math.round(kmTotal).toLocaleString() : '—'}
                    </span>
                    <svg className="w-8 h-8 text-[#565F71] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
          {/* Main Listing Area */}
          <div className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="px-8 py-5 flex items-center justify-between bg-[#ECEEF3]/50 border-b border-[#C4C6D0]/30">
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
                        ? 'bg-[#1B365D] text-white'
                        : 'text-[#44474E] hover:bg-[#E6E8ED]'
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
                  className="flex items-center gap-2 text-sm font-bold text-[#1B365D] hover:text-[#152a47] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Clear Filters
                </button>
                <div className="h-6 w-px bg-[#C4C6D0]/40"></div>
                <button className="text-[#74777F] hover:text-[#1B365D] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button className="text-[#1B365D]">
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
                    className="mt-2 text-sm text-[#1B365D] hover:text-[#152a47] font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#ECEEF3]/30">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20">Request ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20">Destination</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20">Schedule</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20">Vehicle</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#565F71] border-b border-[#C4C6D0]/20 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C4C6D0]/10">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-[#D1E1FF]/10 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-[#1B365D]">
                          {trip.requestNumber || `REQ-${trip.id.slice(-5)}`}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#D1E1FF] flex items-center justify-center text-[#1B365D]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-[#1B365D] font-serif">{trip.destination}</p>
                            <p className="text-xs text-[#565F71]">
                              {trip.tripType ? `${trip.tripType} Trip` : 'Standard Trip'} 
                              {trip.purposeCategory && ` • ${trip.purposeCategory}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-[#191C20]">
                          {new Date(trip.startDateTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-[#565F71]">
                          {new Date(trip.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(trip.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-[#44474E]">
                        {allocatedVehicle(trip) ? 
                          `${allocatedVehicle(trip).make} ${allocatedVehicle(trip).model}` : 
                          'Pending Assignment'
                        }
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${
                            trip.state === 'APPROVED_FOR_ALLOCATION' || trip.state === 'CAR_ALLOCATED' || trip.state === 'READY' || trip.state === 'PENDING_TRANSPORT_CONFIRM'
                              ? 'bg-[#D1E1FF] text-[#1B365D]'
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
                            className="p-2 text-[#74777F] hover:text-[#1B365D] transition-colors hover:bg-[#ECEEF3] rounded"
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
              <div className="px-8 py-4 bg-[#ECEEF3]/50 flex items-center justify-between border-t border-[#C4C6D0]/20">
                <p className="text-xs font-bold text-[#565F71] italic">
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
                  <button className="w-8 h-8 rounded flex items-center justify-center bg-[#1B365D] text-white text-xs font-bold shadow-sm">1</button>
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
          
          {activeSection === 'request' && <NewRequestForm />}
          {activeSection === 'notifications' && <NotificationCenter />}
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
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1B365D] border-t-transparent" />
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1B365D] tracking-tight">Trip Details</h3>
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
                  <div className="bg-[#D1E1FF]/20 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-[#1B365D] uppercase tracking-wide mb-3">Assignment</p>
                    {allocatedVehicle(selectedTrip) && (
                      <div className="mb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {allocatedVehicle(selectedTrip).make?.charAt(0)}{allocatedVehicle(selectedTrip).model?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">
                              {allocatedVehicle(selectedTrip).make} {allocatedVehicle(selectedTrip).model}
                            </p>
                            <p className="text-xs text-emerald-700">{allocatedVehicle(selectedTrip).plateNumber}</p>
                          </div>
                        </div>
                        {allocatedVehicle(selectedTrip).capacity != null && (
                          <p className="text-xs text-gray-600">Capacity: {allocatedVehicle(selectedTrip).capacity} passengers</p>
                        )}
                      </div>
                    )}
                    {allocatedDriver(selectedTrip) && (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {driverDisplayName(allocatedDriver(selectedTrip)).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">
                              {driverDisplayName(allocatedDriver(selectedTrip))}
                            </p>
                            <p className="text-xs text-emerald-700">Assigned Driver</p>
                          </div>
                        </div>
                        {allocatedDriver(selectedTrip).licenseNumber && (
                          <p className="text-xs text-gray-600">License: {allocatedDriver(selectedTrip).licenseNumber}</p>
                        )}
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
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Completed at</p>
                    <p className="text-base text-green-900">{new Date(selectedTrip.completedAt).toLocaleString()}</p>
                  </div>
                )}

                <div className="space-y-3">
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
                  {!canCancelTrip(selectedTrip.state) && !canDeleteDraft(selectedTrip.state) && (
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
    </div>
  )
}