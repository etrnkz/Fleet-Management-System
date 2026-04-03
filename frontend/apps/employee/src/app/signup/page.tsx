'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationType: '',
    college: '',
    office: '',
    department: '',
    employeeId: '',
    phone: '',
    agreeToTerms: false
  })

  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string; collegeId: string | null }[]>([])
  const [administrativeOffices, setAdministrativeOffices] = useState<string[]>([])
  const [availableDepartments, setAvailableDepartments] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const loadSignupMetadata = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup-metadata`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load signup metadata')
        }

        setColleges(Array.isArray(data.colleges) ? data.colleges : [])
        const departmentsData = Array.isArray(data.departments) ? data.departments : []
        setDepartments(departmentsData)
        setAdministrativeOffices(
          departmentsData
            .filter((dept: any) => !dept.collegeId)
            .map((dept: any) => dept.name),
        )
      } catch {
        // Fallback list when metadata endpoint is unavailable
        setAdministrativeOffices([
          'Office of the President',
          'Main Registrar Office',
          'Human Resource Management Office',
          'Finance Office',
          'Transport and Logistics Office',
          'ICT Directorate',
          'Library Services',
          'Other',
        ])
      }
    }

    loadSignupMetadata()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 4000)
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
          .map((dept) => ({ id: dept.id, name: dept.name })),
      )
      return
    }
    setAvailableDepartments([])
  }

  const handleOrganizationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value
    setFormData(prev => ({
      ...prev,
      organizationType: selectedType,
      college: '',
      office: '',
      department: ''
    }))
    setAvailableDepartments([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'error')
      return
    }

    if (!formData.agreeToTerms) {
      showToast('Please agree to the terms and conditions', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone,
          role: 'User', // Default role for employee signup
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Save user data to localStorage for profile
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        employeeId: formData.employeeId,
        organizationType: formData.organizationType,
        college: formData.college,
        office: formData.office,
        department: formData.department,
        phone: formData.phone,
        profileImage: profileImage
      }
      localStorage.setItem('userData', JSON.stringify(userData))

      showToast('Account created successfully! Redirecting to login...', 'success')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      setIsLoading(false)
      showToast(error.message || 'Registration failed. Please try again.', 'error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[70] animate-slide-in-right">
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
            <p className="mt-4 text-gray-700 font-medium">Creating account...</p>
          </div>
        </div>
      )}

      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up py-4 sm:py-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm sm:text-base">Sign up to get started with HUFMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-emerald-500">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Upload profile picture</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Enter your employee ID"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Organization Type */}
            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type
              </label>
              <select
                id="organizationType"
                name="organizationType"
                value={formData.organizationType}
                onChange={handleOrganizationTypeChange}
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                required
              >
                <option value="" disabled className="text-gray-400">Select organization type</option>
                <option value="college">College</option>
                <option value="administrative">Administrative Office/Other</option>
              </select>
            </div>

            {/* College - Only show if organizationType is 'college' */}
            {formData.organizationType === 'college' && (
              <>
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-2">
                    College
                  </label>
                  <select
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleCollegeChange}
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                    required
                  >
                    <option value="" disabled className="text-gray-400">Select your college</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>{college.name}</option>
                    ))}
                  </select>
                </div>

                {/* Department - Only show if college is selected */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!formData.college}
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="" disabled className="text-gray-400">
                      {formData.college ? 'Select your department' : 'Please select a college first'}
                    </option>
                    {availableDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Administrative Office - Only show if organizationType is 'administrative' */}
            {formData.organizationType === 'administrative' && (
              <div>
                <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-2">
                  Office/Department
                </label>
                <select
                  id="office"
                  name="office"
                  value={formData.office}
                  onChange={handleChange}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  required
                >
                  <option value="" disabled className="text-gray-400">Select your office/department</option>
                  {administrativeOffices.map((office) => (
                    <option key={office} value={office}>{office}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251-91-234-5678"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image with Logo */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-emerald-400 to-emerald-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="mb-6 animate-bounce-slow">
              <svg className="w-32 h-32 mx-auto text-white" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10 L50 35 M50 35 Q50 40 45 40 L20 40 Q15 40 15 45 L15 70 Q15 75 20 75 L80 75 Q85 75 85 70 L85 45 Q85 40 80 40 L55 40 Q50 40 50 35 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="30" cy="60" r="8" />
                <circle cx="70" cy="60" r="8" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-2">HUFMS.md</h2>
            <p className="text-white/90 text-lg">Fleet Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}
