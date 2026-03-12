'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('account')
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [showNotificationDetail, setShowNotificationDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    phone: '',
    office: '',
    title: '',
    department: '',
    emergencyContact: '',
    emergencyPhone: '',
    bio: '',
    profilePhoto: '',
    educationLevel: ''
  })
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('presidentLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    const userData = localStorage.getItem('presidentUser')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditedUser({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '+251-11-123-4567',
        office: parsedUser.office || 'President Office, Main Building',
        title: parsedUser.title || 'University President',
        department: parsedUser.department || 'Executive Office',
        emergencyContact: parsedUser.emergencyContact || '',
        emergencyPhone: parsedUser.emergencyPhone || '',
        bio: parsedUser.bio || '',
        profilePhoto: parsedUser.profilePhoto || '',
        educationLevel: parsedUser.educationLevel || 'Ph.D.'
      })
      setPhotoPreview(parsedUser.profilePhoto || '')
    }
  }, [router])

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Navigate using Next.js router for smoother transition
    setTimeout(() => {
      router.push(path)
      // Keep spinner visible a bit longer to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }, 300)
  }

  const handleLogout = () => {
    localStorage.removeItem('presidentLoggedIn')
    localStorage.removeItem('presidentUser')
    router.push('/')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setEditedUser({...editedUser, profilePhoto: result})
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview('')
    setEditedUser({...editedUser, profilePhoto: ''})
  }

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      ...editedUser
    }
    localStorage.setItem('presidentUser', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setShowProfileModal(false)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Approvals', 
      href: '/approvals', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Budget & Finance', 
      href: '/budget', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Compliance', 
      href: '/compliance', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      name: 'Vehicles', 
      href: '/vehicles', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Colleges', 
      href: '/departments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      name: 'Audit Trail', 
      href: '/audit', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Policies', 
      href: '/policies', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
  ]

  const notifications = [
    { 
      id: 1, 
      title: 'High Priority Approval', 
      message: 'Engineering Dept. international conference trip requires presidential approval', 
      time: '5 min ago', 
      type: 'urgent',
      category: 'Approval Request',
      details: {
        requestId: 'REQ-2024-1245',
        department: 'College of Engineering',
        requestedBy: 'Dr. Abebe Kebede',
        purpose: 'International Conference on Sustainable Engineering',
        destination: 'Nairobi, Kenya',
        duration: '5 days (June 20-24, 2024)',
        vehicleType: 'Toyota Coaster (40 seats)',
        passengers: '35 faculty members and students',
        estimatedCost: 'ETB 125,000',
        deanApproval: 'Approved on June 10, 2024',
        budgetStatus: 'Funds available in department budget',
        urgency: 'Conference registration deadline: June 15, 2024'
      }
    },
    { 
      id: 2, 
      title: 'Dean Approved Request', 
      message: 'College Dean approved 3-day research trip to Addis Ababa - awaiting final approval', 
      time: '15 min ago', 
      type: 'approval',
      category: 'Dean Approved',
      details: {
        requestId: 'REQ-2024-1246',
        department: 'College of Natural Sciences',
        requestedBy: 'Prof. Fatuma Mohammed',
        purpose: 'Research collaboration with Addis Ababa University',
        destination: 'Addis Ababa',
        duration: '3 days (June 18-20, 2024)',
        vehicleType: 'Toyota Hiace (14 seats)',
        passengers: '8 researchers',
        estimatedCost: 'ETB 45,000',
        deanApproval: 'Approved on June 11, 2024',
        budgetStatus: 'Research grant funds allocated',
        urgency: 'Meeting scheduled for June 18, 2024'
      }
    },
    { 
      id: 3, 
      title: 'Budget Alert', 
      message: 'Monthly fuel expenses exceeded threshold by 12% - review required', 
      time: '1 hour ago', 
      type: 'warning',
      category: 'Financial',
      details: {
        alertType: 'Budget Overrun',
        period: 'May 2024',
        budgetAllocated: 'ETB 500,000',
        actualExpense: 'ETB 560,000',
        variance: '+ETB 60,000 (12% over budget)',
        mainCauses: [
          'Increased fuel prices (8% increase)',
          'Higher trip frequency (15% more trips)',
          'Emergency medical transports (5 unplanned trips)'
        ],
        affectedDepartments: 'All departments',
        recommendation: 'Review fuel consumption policies and consider trip consolidation',
        actionRequired: 'Approve budget adjustment or implement cost control measures'
      }
    },
    { 
      id: 4, 
      title: 'Fleet Status Alert', 
      message: 'Vehicle utilization dropped to 68% - below optimal threshold', 
      time: '2 hours ago', 
      type: 'info',
      category: 'Fleet Status',
      details: {
        alertType: 'Low Utilization',
        currentUtilization: '68%',
        optimalThreshold: '75%',
        totalVehicles: '40 vehicles',
        activeVehicles: '27 vehicles',
        idleVehicles: '13 vehicles',
        analysis: 'Utilization has decreased by 9% compared to last month',
        idleVehiclesList: [
          'Toyota Coaster ABC-1234 (idle for 5 days)',
          'Isuzu NPR XYZ-5678 (idle for 3 days)',
          'Mitsubishi Rosa DEF-9012 (idle for 7 days)'
        ],
        recommendation: 'Consider reassigning idle vehicles or scheduling maintenance during low-demand periods',
        potentialSavings: 'ETB 35,000/month through optimized scheduling'
      }
    },
    { 
      id: 5, 
      title: 'Compliance Notice', 
      message: '3 vehicle registrations expiring within 30 days', 
      time: '3 hours ago', 
      type: 'warning',
      category: 'Compliance',
      details: {
        alertType: 'Registration Expiry',
        affectedVehicles: [
          {
            vehicle: 'Toyota Coaster ABC-1234',
            expiryDate: 'June 25, 2024',
            daysRemaining: 10,
            renewalCost: 'ETB 8,500'
          },
          {
            vehicle: 'Isuzu NPR XYZ-5678',
            expiryDate: 'July 5, 2024',
            daysRemaining: 20,
            renewalCost: 'ETB 7,200'
          },
          {
            vehicle: 'Mitsubishi Rosa DEF-9012',
            expiryDate: 'July 12, 2024',
            daysRemaining: 27,
            renewalCost: 'ETB 8,000'
          }
        ],
        totalRenewalCost: 'ETB 23,700',
        actionRequired: 'Initiate renewal process immediately to avoid penalties',
        penalty: 'Late renewal penalty: ETB 2,000 per vehicle',
        responsibleOffice: 'Transport Office'
      }
    },
    { 
      id: 6, 
      title: 'Emergency Request', 
      message: 'Medical emergency transport request from Health Center', 
      time: '4 hours ago', 
      type: 'urgent',
      category: 'Emergency',
      details: {
        requestId: 'EMRG-2024-089',
        requestedBy: 'University Health Center',
        contactPerson: 'Dr. Hanna Tesfaye',
        emergencyType: 'Medical Emergency',
        patient: 'Student (confidential)',
        destination: 'Hiwot Fana Specialized Hospital',
        distance: '18 km',
        vehicleAssigned: 'Ambulance AMB-001',
        driver: 'Ahmed Hassan (Emergency certified)',
        status: 'Completed - Patient transported safely',
        departureTime: '10:30 AM',
        arrivalTime: '10:55 AM',
        notes: 'Patient stabilized and admitted to emergency ward'
      }
    },
    { 
      id: 7, 
      title: 'Weekly Report Available', 
      message: 'Fleet operations summary for Week 24 is ready for review', 
      time: '5 hours ago', 
      type: 'info',
      category: 'Reports',
      details: {
        reportType: 'Weekly Fleet Operations Summary',
        period: 'Week 24 (June 10-16, 2024)',
        totalTrips: '127 trips',
        totalDistance: '8,450 km',
        fuelConsumption: '1,850 liters',
        averageFuelEfficiency: '4.57 km/liter',
        maintenanceEvents: '8 scheduled services',
        emergencyRepairs: '2 incidents',
        topDepartments: [
          'College of Engineering (28 trips)',
          'College of Medicine (22 trips)',
          'College of Business (18 trips)'
        ],
        costSummary: {
          fuel: 'ETB 125,000',
          maintenance: 'ETB 35,000',
          other: 'ETB 12,000',
          total: 'ETB 172,000'
        },
        highlights: 'Fleet efficiency improved by 3% compared to previous week'
      }
    },
    { 
      id: 8, 
      title: 'Safety Alert', 
      message: 'Vehicle ABC-1234 failed safety inspection - immediate action required', 
      time: '6 hours ago', 
      type: 'urgent',
      category: 'Safety',
      details: {
        alertType: 'Failed Safety Inspection',
        vehicle: 'Toyota Coaster ABC-1234',
        inspectionDate: 'June 15, 2024',
        inspector: 'Mechanical Engineering Team',
        failedItems: [
          'Brake system - Worn brake pads (critical)',
          'Tire condition - 2 tires below minimum tread depth',
          'Suspension - Shock absorbers need replacement',
          'Lights - Rear brake lights malfunction'
        ],
        safetyRating: 'UNSAFE - Do not operate',
        estimatedRepairCost: 'ETB 45,000',
        estimatedRepairTime: '3-5 days',
        currentStatus: 'Vehicle grounded pending repairs',
        actionRequired: 'Approve emergency repair budget and schedule immediate maintenance',
        impactedSchedule: '2 upcoming trips need vehicle reassignment'
      }
    },
    { 
      id: 9, 
      title: 'VIP Transport Request', 
      message: 'Diplomatic visit scheduled - special vehicle arrangement needed', 
      time: '8 hours ago', 
      type: 'approval',
      category: 'VIP Request',
      details: {
        requestId: 'VIP-2024-015',
        requestedBy: 'Office of the President',
        visitor: 'Ambassador of Kenya to Ethiopia',
        visitPurpose: 'Academic collaboration discussion',
        visitDate: 'June 22, 2024',
        arrivalTime: '10:00 AM',
        departureTime: '4:00 PM',
        pickupLocation: 'Harar Airport',
        itinerary: [
          'Airport pickup',
          'Campus tour',
          'Meeting with President',
          'Lunch at Guest House',
          'Return to airport'
        ],
        vehicleRequired: 'Executive sedan with driver',
        securityRequirements: 'Security escort required',
        estimatedCost: 'ETB 15,000',
        specialArrangements: 'University flag display, protocol officer accompaniment'
      }
    },
    { 
      id: 10, 
      title: 'Maintenance Budget', 
      message: 'Q2 maintenance costs 8% under budget - efficiency report available', 
      time: '1 day ago', 
      type: 'success',
      category: 'Financial',
      details: {
        reportType: 'Quarterly Maintenance Performance',
        period: 'Q2 2024 (April-June)',
        budgetAllocated: 'ETB 450,000',
        actualExpense: 'ETB 414,000',
        savings: 'ETB 36,000 (8% under budget)',
        maintenanceBreakdown: {
          preventiveMaintenance: 'ETB 280,000',
          emergencyRepairs: 'ETB 95,000',
          partsReplacement: 'ETB 39,000'
        },
        efficiencyFactors: [
          'Improved preventive maintenance schedule',
          'Bulk parts procurement (12% cost savings)',
          'In-house minor repairs (reduced outsourcing)',
          'Better vehicle utilization planning'
        ],
        vehicleAvailability: '94% (up from 89% in Q1)',
        recommendation: 'Continue current maintenance strategy and consider expanding in-house repair capabilities'
      }
    },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-800">President Portal</h1>
              </div>
            </div>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Notifications */}
            <div 
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 mt-2 sm:w-96 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] sm:max-h-[600px] overflow-y-auto z-50">
                  <div className="p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">Notifications</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                        {notifications.filter(n => n.type === 'urgent').length} Urgent
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedNotification(notif)
                          setShowNotificationDetail(true)
                          setShowNotifications(false)
                        }}
                      >
                        <div className="flex items-start space-x-2 md:space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'urgent' ? 'bg-red-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            notif.type === 'approval' ? 'bg-green-500' :
                            notif.type === 'success' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mt-1">
                                  {notif.category}
                                </span>
                              </div>
                              {notif.type === 'urgent' && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium flex-shrink-0">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 md:p-3 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                    <button className="w-full text-center text-xs md:text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                <svg className="hidden sm:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.role || 'University President'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{user?.phone || '+251-11-123-4567'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-700">{user?.office || 'President Office, Main Building'}</span>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowProfileModal(true)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowSettingsModal(true)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 text-left"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium text-red-600">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleNavigation(e, item.href)
                    setShowMobileMenu(false)
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Fixed Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Profile Photo Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Profile Photo</h4>
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer block relative group"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-emerald-100 group-hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center border-4 border-emerald-100 group-hover:opacity-75 transition-opacity">
                          <span className="text-white text-2xl md:text-3xl font-bold">{editedUser.name?.charAt(0) || 'P'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </label>
                    {photoPreview && (
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center z-10"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Click on the photo to upload</p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or GIF (MAX. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="Dr. Ahmed Hassan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editedUser.title}
                      onChange={(e) => setEditedUser({...editedUser, title: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="University President"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="president@hu.edu.et"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="+251-11-123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Education Level</label>
                    <select
                      value={editedUser.educationLevel}
                      onChange={(e) => setEditedUser({...editedUser, educationLevel: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    >
                      <option value="">Select Education Level</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Ph.D.">Ph.D.</option>
                      <option value="Post-Doctorate">Post-Doctorate</option>
                      <option value="Professor">Professor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Office Information Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Office Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={editedUser.department}
                      onChange={(e) => setEditedUser({...editedUser, department: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="Executive Office"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Office Location</label>
                    <input
                      type="text"
                      value={editedUser.office}
                      onChange={(e) => setEditedUser({...editedUser, office: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="President Office, Main Building"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editedUser.emergencyContact}
                      onChange={(e) => setEditedUser({...editedUser, emergencyContact: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={editedUser.emergencyPhone}
                      onChange={(e) => setEditedUser({...editedUser, emergencyPhone: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                      placeholder="+251-91-234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Professional Bio</h4>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Biography</label>
                  <textarea
                    value={editedUser.bio}
                    onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                    rows={4}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Brief professional biography..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm md:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-start space-x-3 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Profile Updated Successfully</h4>
              <p className="text-sm text-gray-600 mt-1">Your profile information has been saved.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 md:p-6 text-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">Settings</h3>
                  <p className="text-emerald-100 mt-1 text-sm md:text-base">Customize your experience</p>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-white/50 backdrop-blur-sm p-3 md:p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-emerald-100 flex-shrink-0">
                <nav className="flex md:flex-col md:space-y-2 space-x-2 md:space-x-0 overflow-x-auto md:overflow-x-visible">
                  <button
                    onClick={() => setActiveSettingsTab('account')}
                    className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap ${
                      activeSettingsTab === 'account'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Account</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('security')}
                    className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap ${
                      activeSettingsTab === 'security'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium">Security</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('notifications')}
                    className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap ${
                      activeSettingsTab === 'notifications'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="font-medium">Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSettingsTab('preferences')}
                    className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap ${
                      activeSettingsTab === 'preferences'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Preferences</span>
                  </button>
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                {activeSettingsTab === 'account' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        Account Information
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-emerald-500 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Update your personal information from the profile menu in the top right corner.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </span>
                        Change Password
                      </h4>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                        Two-Factor Authentication
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800">Enable 2FA</p>
                          <p className="text-sm text-gray-600 mt-1">Extra security for your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-600 peer-checked:to-green-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        Session Timeout
                      </h4>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-4">
                    {[
                      { name: 'Email Notifications', desc: 'Receive updates via email', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                      { name: 'Push Notifications', desc: 'Browser notifications', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
                      { name: 'Approval Alerts', desc: 'Get notified for approvals', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                      { name: 'Weekly Reports', desc: 'Fleet summary reports', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-emerald-600">{item.icon}</span>
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSettingsTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        Language & Region
                      </h4>
                      <div className="space-y-4">
                        <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
                          <option>English</option>
                          <option>Amharic (አማርኛ)</option>
                          <option>Oromo (Afaan Oromoo)</option>
                        </select>
                        <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
                          <option>East Africa Time (EAT)</option>
                          <option>UTC</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </span>
                        Theme
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {['Light', 'Dark', 'Auto'].map((theme) => (
                          <button
                            key={theme}
                            className="p-4 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all"
                          >
                            <div className={`w-full h-20 rounded-lg mb-2 ${
                              theme === 'Light' ? 'bg-white border-2 border-gray-200' :
                              theme === 'Dark' ? 'bg-gray-800' :
                              'bg-gradient-to-r from-white to-gray-800'
                            }`}></div>
                            <p className="text-sm font-medium">{theme}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-emerald-100 p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 md:px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSuccessToast(true)
                  setTimeout(() => setShowSuccessToast(false), 3000)
                }}
                className="px-4 md:px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium text-sm md:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showNotificationDetail && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 ${
              selectedNotification.type === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              selectedNotification.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              selectedNotification.type === 'approval' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              selectedNotification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            } text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      {selectedNotification.category}
                    </span>
                    {selectedNotification.type === 'urgent' && (
                      <span className="px-3 py-1 bg-red-900/50 rounded-full text-xs font-bold">
                        URGENT
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedNotification.title}</h3>
                  <p className="text-white/90 text-sm">{selectedNotification.time}</p>
                </div>
                <button
                  onClick={() => setShowNotificationDetail(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-emerald-500">
                  <p className="text-gray-800 font-medium">{selectedNotification.message}</p>
                </div>

                {/* Details */}
                {selectedNotification.details && (
                  <div className="space-y-4">
                    {Object.entries(selectedNotification.details).map(([key, value]) => {
                      if (typeof value === 'string') {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-gray-800">{value}</p>
                          </div>
                        )
                      } else if (Array.isArray(value)) {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <ul className="space-y-2">
                              {value.map((item, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-emerald-600 mt-1">•</span>
                                  <span className="text-gray-800 flex-1">
                                    {typeof item === 'object' ? (
                                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                        {Object.entries(item).map(([k, v]) => (
                                          <div key={k} className="flex justify-between">
                                            <span className="text-sm text-gray-600 capitalize">
                                              {k.replace(/([A-Z])/g, ' $1').trim()}:
                                            </span>
                                            <span className="text-sm font-medium text-gray-800">{String(v)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      item
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      } else if (typeof value === 'object') {
                        return (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <p className="text-sm font-semibold text-gray-600 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              {Object.entries(value).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 capitalize">
                                    {k.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificationDetail(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all"
              >
                Close
              </button>
              {(selectedNotification.type === 'urgent' || selectedNotification.type === 'approval') && (
                <>
                  <button
                    onClick={() => {
                      setShowNotificationDetail(false)
                      setShowSuccessToast(true)
                      setTimeout(() => setShowSuccessToast(false), 3000)
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationDetail(false)
                      setShowSuccessToast(true)
                      setTimeout(() => setShowSuccessToast(false), 3000)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
