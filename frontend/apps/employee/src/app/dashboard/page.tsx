'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Load user data from localStorage
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('userData')
      if (storedData) {
        setUserData(JSON.parse(storedData))
      }
    }
  })

  const handleLogout = () => {
    // Clear any session data here if needed
    router.push('/')
  }

  const handleSectionChange = (section: string) => {
    setIsLoading(true)
    setActiveSection(section) // Change section immediately
    setSidebarOpen(false) // Close sidebar on mobile after selection
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  // Mock notifications data
  const notifications = [
    { 
      id: 1, 
      type: 'approved', 
      message: 'Your trip request to Muna Campus has been approved', 
      time: '2 hours ago', 
      read: false,
      details: {
        destination: 'Muna Campus',
        vehicle: 'Toyota Hilux 4x4',
        plate: 'AA-3-12345',
        driver: 'Ahmed Mohammed',
        driverPhone: '+251-91-234-5678',
        date: 'Feb 21, 2025',
        time: '08:00 AM'
      }
    },
    { 
      id: 2, 
      type: 'rejected', 
      message: 'Your trip request to Addis Ababa has been rejected', 
      time: '1 day ago', 
      read: false,
      details: {
        destination: 'Addis Ababa',
        reason: 'No vehicles available for the requested date'
      }
    },
    { 
      id: 3, 
      type: 'approved', 
      message: 'Your trip request to Dire Dawa has been approved', 
      time: '3 days ago', 
      read: true,
      details: {
        destination: 'Dire Dawa',
        vehicle: 'Toyota Coaster Bus',
        plate: 'AA-3-67890',
        driver: 'Yohannes Tadesse',
        driverPhone: '+251-91-876-5432',
        date: 'Feb 19, 2025',
        time: '06:00 AM'
      }
    },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isLoadingNotification, setIsLoadingNotification] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    organizationType: '',
    college: '',
    office: '',
    department: '',
    phone: '',
    profileImage: ''
  })
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 4000)
  }

  // College and Department data
  const collegeData = {
    'College of Computing and Informatics': [
      'Computer Science',
      'Information Technology',
      'Software Engineering',
      'Information Systems'
    ],
    'College of Natural and Computational Sciences': [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Statistics'
    ],
    'College of Agriculture and Environmental Sciences': [
      'Plant Sciences',
      'Animal Sciences',
      'Agricultural Economics',
      'Natural Resource Management'
    ],
    'College of Business and Economics': [
      'Accounting and Finance',
      'Management',
      'Economics',
      'Marketing Management'
    ],
    'College of Social Sciences and Humanities': [
      'English Language and Literature',
      'History',
      'Geography',
      'Sociology',
      'Psychology'
    ],
    'College of Education and Behavioral Sciences': [
      'Educational Planning and Management',
      'Curriculum and Instruction',
      'Special Needs Education'
    ],
    'College of Health Sciences': [
      'Public Health',
      'Nursing',
      'Medical Laboratory Sciences'
    ],
    'College of Law': [
      'Law'
    ]
  }

  // Administrative Offices and Other Departments
  const administrativeOffices = [
    'Office of the President',
    'Office of the Vice President for Academic Affairs',
    'Office of the Vice President for Research and Technology Transfer',
    'Office of the Vice President for Administration and Development',
    'Main Registrar Office',
    'Human Resource Management Office',
    'Finance Office',
    'Procurement Office',
    'Internal Audit Office',
    'Legal Affairs Office',
    'Public Relations and Communications Office',
    'ICT Directorate',
    'Library Services',
    'Student Services Office',
    'Quality Assurance Office',
    'Planning and Development Office',
    'Transport and Logistics Office',
    'Facility Management Office',
    'Security Office',
    'Health Center',
    'Other'
  ]

  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])

  const handleNotificationClick = (notification: any) => {
    setIsLoadingNotification(true)
    setTimeout(() => {
      setSelectedNotification(notification)
      setIsLoadingNotification(false)
    }, 2000)
  }

  const handleOpenProfileModal = () => {
    // Load current user data into edit form
    setEditedProfile({
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      employeeId: userData?.employeeId || '',
      organizationType: userData?.organizationType || '',
      college: userData?.college || '',
      office: userData?.office || '',
      department: userData?.department || '',
      phone: userData?.phone || '',
      profileImage: userData?.profileImage || ''
    })
    setTempProfileImage(userData?.profileImage || null)
    if (userData?.college && collegeData[userData.college as keyof typeof collegeData]) {
      setAvailableDepartments(collegeData[userData.college as keyof typeof collegeData])
    }
    setShowProfileModal(true)
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string)
        setEditedProfile(prev => ({ ...prev, profileImage: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollege = e.target.value
    setEditedProfile(prev => ({
      ...prev,
      college: selectedCollege,
      department: '' // Reset department when college changes
    }))
    
    if (selectedCollege && collegeData[selectedCollege as keyof typeof collegeData]) {
      setAvailableDepartments(collegeData[selectedCollege as keyof typeof collegeData])
    } else {
      setAvailableDepartments([])
    }
  }

  const handleOrganizationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value
    setEditedProfile(prev => ({
      ...prev,
      organizationType: selectedType,
      college: '',
      office: '',
      department: ''
    }))
    setAvailableDepartments([])
  }

  const handleSaveProfile = () => {
    // Save to localStorage
    const updatedUserData = {
      ...userData,
      ...editedProfile
    }
    localStorage.setItem('userData', JSON.stringify(updatedUserData))
    setUserData(updatedUserData)
    setShowProfileModal(false)
    
    // Show success message
    showToast('Profile updated successfully!', 'success')
  }

  const RequestTripForm = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Request New Trip
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <input type="text" placeholder="e.g. Dire Dawa Office" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
            <option>Official Meeting</option>
            <option>Conference</option>
            <option>Field Visit</option>
            <option>Training</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
            <option>Toyota Hilux</option>
            <option>Toyota Coaster Bus</option>
            <option>Sedan</option>
            <option>Van</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers</label>
          <input type="number" defaultValue="1" min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea placeholder="Any special requirements..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
        </div>
        <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Submit Request
        </button>
      </div>
    </div>
  )

  const FeedbackForm = () => {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Share Your Feedback
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Related Trip</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
              <option>Recent: Addis Ababa (Feb 20)</option>
              <option>Muna Campus (Feb 21)</option>
              <option>Dire Dawa (Feb 19)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors focus:outline-none"
                >
                  <svg 
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">You rated: {rating} star{rating > 1 ? 's' : ''}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
            <textarea placeholder="How was your journey? Share your experience..." rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" style={{ color: '#111827', backgroundColor: '#ffffff' }} />
          </div>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Send Feedback
          </button>
        </div>
      </div>
    )
  }

  const DocumentCenter = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Document Center
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Vehicle Usage Policy.pdf', date: 'Updated Jan 2025', size: '2.5 MB', color: 'red' },
          { name: 'Trip Request Guide.docx', date: 'Uploaded Jan 2025', size: '1.2 MB', color: 'blue' },
          { name: 'Route & Rate Table 2025.xlsx', date: 'Updated Feb 2025', size: '945 KB', color: 'green' },
          { name: 'Safety Guidelines.pdf', date: 'Updated Dec 2024', size: '1.8 MB', color: 'red' },
          { name: 'Fleet Maintenance Schedule.pdf', date: 'Updated Feb 2025', size: '3.1 MB', color: 'red' },
        ].map((doc, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${doc.color}-50 rounded flex items-center justify-center`}>
                  <svg className={`w-6 h-6 text-${doc.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const AvailableVehicles = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('All Types')

    const allVehicles = [
      { name: 'Toyota Hilux 4x4', plate: 'AA-3-12345', type: 'Pickup', location: 'Main Campus', seats: 4, status: 'Available', fuel: 'Diesel', year: 2022, mileage: '45,230 km' },
      { name: 'Toyota Coaster Bus', plate: 'AA-3-67890', type: 'Bus', location: 'Haramaya', seats: 30, status: 'Available', fuel: 'Diesel', year: 2021, mileage: '78,450 km' },
      { name: 'Toyota Land Cruiser', plate: 'AA-3-54321', type: 'SUV', location: 'Main Campus', seats: 7, status: 'Available', fuel: 'Diesel', year: 2023, mileage: '12,890 km' },
      { name: 'Isuzu D-Max', plate: 'AA-3-98765', type: 'Pickup', location: 'Dire Dawa', seats: 4, status: 'In Use', fuel: 'Diesel', year: 2022, mileage: '52,100 km' },
      { name: 'Toyota Hiace Van', plate: 'AA-3-11223', type: 'Van', location: 'Main Campus', seats: 14, status: 'Available', fuel: 'Diesel', year: 2020, mileage: '95,670 km' },
      { name: 'Toyota Corolla', plate: 'AA-3-44556', type: 'Sedan', location: 'Haramaya', seats: 5, status: 'Maintenance', fuel: 'Petrol', year: 2021, mileage: '68,340 km' },
      { name: 'Mitsubishi L200', plate: 'AA-3-77889', type: 'Pickup', location: 'Main Campus', seats: 4, status: 'Available', fuel: 'Diesel', year: 2022, mileage: '38,920 km' },
      { name: 'Toyota Prado', plate: 'AA-3-33445', type: 'SUV', location: 'Dire Dawa', seats: 7, status: 'Available', fuel: 'Diesel', year: 2023, mileage: '15,230 km' },
      { name: 'Nissan Patrol', plate: 'AA-3-66778', type: 'SUV', location: 'Main Campus', seats: 7, status: 'Available', fuel: 'Petrol', year: 2021, mileage: '72,450 km' },
    ]

    // Filter vehicles based on search query and type filter
    const filteredVehicles = allVehicles.filter(vehicle => {
      const matchesSearch = searchQuery === '' || 
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === 'All Types' || vehicle.type === filterType
      
      return matchesSearch && matchesType
    })

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
            Available Vehicles
          </h2>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
              style={{ color: '#111827', backgroundColor: '#ffffff' }} 
            />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            >
              <option>All Types</option>
              <option>Pickup</option>
              <option>Van</option>
              <option>Bus</option>
              <option>Sedan</option>
              <option>SUV</option>
            </select>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No vehicles found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    vehicle.status === 'Available' ? 'bg-green-100 text-green-700' :
                    vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-800 text-lg mb-1">{vehicle.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{vehicle.plate}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-800">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-800 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {vehicle.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Seats:</span>
                    <span className="font-medium text-gray-800 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {vehicle.seats}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fuel:</span>
                    <span className="font-medium text-gray-800">{vehicle.fuel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium text-gray-800">{vehicle.year}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium text-gray-800">{vehicle.mileage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-[70] animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {toast.type === 'success' && (
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-800' :
                toast.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className={`flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-600 hover:text-green-800' :
                toast.type === 'error' ? 'text-red-600 hover:text-red-800' :
                'text-blue-600 hover:text-blue-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Notification Loading Spinner */}
      {isLoadingNotification && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading notification...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-emerald-600 border-b border-emerald-700 px-4 sm:px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-emerald-700 rounded-lg transition-colors text-white"
          >
            {sidebarOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-xs sm:text-sm">H</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-semibold text-white text-sm">Haramaya University</span>
            <span className="text-xs text-emerald-100">Fleet Management System</span>
          </div>
          <span className="sm:hidden font-semibold text-white text-sm">HUFMS</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div 
            className="relative"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <button 
              className="relative text-white hover:text-emerald-100 transition-colors"
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute right-4 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</h3>
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-emerald-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'approved' 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
                          }`}>
                            {notification.type === 'approved' ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            <button className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 font-medium">
                              View Details →
                            </button>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleOpenProfileModal}
            className="flex items-center gap-2 hover:bg-emerald-700 px-2 py-1 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <span className="text-sm text-white hidden sm:inline">{userData?.fullName || 'Alex Johnson'}</span>
            {userData?.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-700"
              />
            ) : (
              <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center border-2 border-emerald-500">
                <span className="text-white text-sm font-medium">
                  {userData?.fullName ? userData.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AJ'}
                </span>
              </div>
            )}
          </button>
          <button onClick={handleLogout} className="text-white hover:text-emerald-100 transition-colors" title="Logout">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 pt-16 z-10 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => handleSectionChange('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'overview' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('request-trip')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'request-trip' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">Request New Trip</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('feedback')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'feedback' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="font-medium">Your Feedback</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('vehicles')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'vehicles' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                <span className="font-medium">Available Vehicles</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('documents')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'documents' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Document Center</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[5] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="ml-0 lg:ml-64 p-4 sm:p-6 pt-16 sm:pt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userData?.fullName || 'Alex Johnson'}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span className="text-green-500">●</span>
            Employee Dashboard • Tuesday, February 23, 2025
          </p>
        </div>

        {/* Notification Details Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={() => setSelectedNotification(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className={`p-6 border-b border-gray-200 ${
                selectedNotification.type === 'approved' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedNotification.type === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {selectedNotification.type === 'approved' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedNotification.type === 'approved' ? 'Trip Request Approved' : 'Trip Request Rejected'}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedNotification.time}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedNotification.type === 'approved' ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Trip Details</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Destination:</span>
                          <span className="text-sm font-semibold text-gray-800">{selectedNotification.details.destination}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Date & Time:</span>
                          <span className="text-sm font-semibold text-gray-800">{selectedNotification.details.date} at {selectedNotification.details.time}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned Vehicle</h3>
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">{selectedNotification.details.vehicle}</h4>
                            <p className="text-sm text-gray-600">Plate: {selectedNotification.details.plate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned Driver</h3>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{selectedNotification.details.driver}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${selectedNotification.details.driverPhone}`} className="text-sm text-blue-600 hover:underline">
                                {selectedNotification.details.driverPhone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Important Reminder</p>
                          <p className="text-sm text-yellow-700 mt-1">Please be ready 15 minutes before the scheduled departure time. Contact the driver if you need any assistance.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Trip Details</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Destination:</span>
                          <span className="text-sm font-semibold text-gray-800">{selectedNotification.details.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                          <p className="text-sm text-red-700 mt-1">{selectedNotification.details.reason}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">You can submit a new trip request with different dates or contact the fleet manager for more information.</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  {selectedNotification.type === 'approved' && (
                    <button 
                      onClick={() => {
                        setSelectedNotification(null)
                        handleSectionChange('request-trip')
                      }}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Request Another Trip
                    </button>
                  )}
                  {selectedNotification.type === 'rejected' && (
                    <button 
                      onClick={() => {
                        setSelectedNotification(null)
                        handleSectionChange('request-trip')
                      }}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Submit New Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conditional Content Based on Active Section */}
        {activeSection === 'overview' && (
          <>
            {/* Professional Trip Performance Chart */}
            <div className="max-w-5xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Trip Performance Overview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Last 6 months trend analysis</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-600">Growth Rate</p>
                    <p className="text-sm font-bold text-green-600">+25%</p>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500 font-medium">
                  <span>10</span>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>

                {/* Grid lines */}
                <div className="absolute left-10 right-4 top-4 bottom-8 flex flex-col justify-between">
                  <div className="border-t border-gray-200 border-dashed"></div>
                  <div className="border-t border-gray-200 border-dashed"></div>
                  <div className="border-t border-gray-200 border-dashed"></div>
                  <div className="border-t border-gray-200 border-dashed"></div>
                  <div className="border-t border-gray-200 border-dashed"></div>
                  <div className="border-t border-gray-300"></div>
                </div>

                {/* Chart bars with trend line */}
                <div className="relative ml-10 mr-4">
                  <svg className="absolute inset-0 w-full h-80 pointer-events-none" style={{ zIndex: 10 }}>
                    {/* Upward trend line */}
                    <polyline
                      points="8.33%,80% 25%,70% 41.67%,55% 58.33%,35% 75%,15% 91.67%,0%"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dots on trend line */}
                    <circle cx="8.33%" cy="80%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                    <circle cx="25%" cy="70%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                    <circle cx="41.67%" cy="55%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                    <circle cx="58.33%" cy="35%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                    <circle cx="75%" cy="15%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                    <circle cx="91.67%" cy="0%" r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                  </svg>

                  <div className="grid grid-cols-6 gap-3 h-80 items-end relative">
                    {/* October - 2 trips */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '64px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          2 trips
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">2</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Oct</span>
                    </div>

                    {/* November - 3 trips */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '96px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          3 trips
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">3</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Nov</span>
                    </div>

                    {/* December - 4 trips */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '128px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          4 trips
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">4</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Dec</span>
                    </div>

                    {/* January - 6 trips */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '192px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          6 trips
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">6</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Jan</span>
                    </div>

                    {/* February - 8 trips */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '256px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          8 trips
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">8</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Feb</span>
                    </div>

                    {/* March - 10 trips (Peak) */}
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-300 hover:from-emerald-700 hover:to-emerald-500 shadow-md hover:shadow-xl cursor-pointer" style={{ height: '320px' }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-t-lg transition-opacity"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          10 trips • Peak
                        </div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <svg className="w-6 h-6 text-yellow-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="flex items-end justify-center h-full pb-3">
                          <span className="text-white font-bold text-lg drop-shadow-lg">10</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Mar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend and Stats */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded"></div>
                    <span className="text-sm text-gray-600">Trip Volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-green-500"></div>
                    <span className="text-sm text-gray-600">Growth Trend</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-gray-800">33 trips</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Peak:</span>
                    <span className="font-bold text-emerald-600">March (10)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Avg:</span>
                    <span className="font-bold text-gray-800">5.5/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">Trip to Muna Campus approved</p>
                    <p className="text-xs text-gray-500 mt-1">Your trip request has been approved by the fleet manager</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">Trip to Dire Dawa completed</p>
                    <p className="text-xs text-gray-500 mt-1">Your trip has been marked as completed</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">New trip request submitted</p>
                    <p className="text-xs text-gray-500 mt-1">Your request for Addis Ababa is pending review</p>
                    <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">Feedback submitted</p>
                    <p className="text-xs text-gray-500 mt-1">Thank you for rating your trip experience</p>
                    <p className="text-xs text-gray-400 mt-1">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'request-trip' && <RequestTripForm />}
        {activeSection === 'feedback' && <FeedbackForm />}
        {activeSection === 'vehicles' && <AvailableVehicles />}
        {activeSection === 'documents' && <DocumentCenter />}
      </main>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Photo Section */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative">
                  {tempProfileImage ? (
                    <img 
                      src={tempProfileImage} 
                      alt="Profile Preview" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200">
                      <span className="text-emerald-600 text-4xl font-bold">
                        {editedProfile.fullName ? editedProfile.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'AJ'}
                      </span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-3">Click the camera icon to upload a new photo</p>
              </div>

              {/* Profile Information Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700 w-1/3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Full Name
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="text" 
                          value={editedProfile.fullName}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter your full name"
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Address
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="email" 
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="your.email@example.com"
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          Employee ID
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="text" 
                          value={editedProfile.employeeId}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, employeeId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="EMP-12345"
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Organization Type
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          value={editedProfile.organizationType || 'college'}
                          onChange={handleOrganizationTypeChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        >
                          <option value="college">College</option>
                          <option value="administrative">Administrative Office/Other</option>
                        </select>
                      </td>
                    </tr>

                    {editedProfile.organizationType === 'college' && (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              College
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <select 
                              value={editedProfile.college}
                              onChange={handleCollegeChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            >
                              <option value="">Select College</option>
                              {Object.keys(collegeData).map((college) => (
                                <option key={college} value={college}>{college}</option>
                              ))}
                            </select>
                          </td>
                        </tr>

                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Department
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <select 
                              value={editedProfile.department}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              style={{ color: '#111827', backgroundColor: '#ffffff' }}
                              disabled={!editedProfile.college}
                            >
                              <option value="">Select Department</option>
                              {availableDepartments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      </>
                    )}

                    {editedProfile.organizationType === 'administrative' && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Office/Department
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={editedProfile.office || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, office: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          >
                            <option value="">Select Office/Department</option>
                            {administrativeOffices.map((office) => (
                              <option key={office} value={office}>{office}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )}

                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 bg-gray-50 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="tel" 
                          value={editedProfile.phone}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="+251-91-234-5678"
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
