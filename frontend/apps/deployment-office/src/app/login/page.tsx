'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedCredentials, setSavedCredentials] = useState<{email: string; password: string} | null>(null)

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser)
      const expiryDate = new Date(userData.expiry)
      
      if (expiryDate > new Date()) {
        setSavedCredentials({
          email: userData.email,
          password: userData.password
        })
      } else {
        localStorage.removeItem('rememberedUser')
      }
    }
  }, [])

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login(formData.email, formData.password)
      
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('accessToken', response.access_token)
      
      if (rememberMe) {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        
        localStorage.setItem('rememberedUser', JSON.stringify({
          email: formData.email,
          password: formData.password,
          expiry: expiryDate.toISOString()
        }))
      } else {
        localStorage.removeItem('rememberedUser')
      }
      
      router.push('/dashboard')
    } catch (error: any) {
      setErrors({ email: error.message || 'Login failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData(prev => ({ ...prev, email: value }))
    
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }

    if (savedCredentials && value.length > 0) {
      if (savedCredentials.email.toLowerCase().startsWith(value.toLowerCase())) {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }
  }

  const handleSuggestionClick = () => {
    if (savedCredentials) {
      setFormData({
        email: savedCredentials.email,
        password: savedCredentials.password
      })
      setRememberMe(true)
      setShowSuggestions(false)
    }
  }

  const handleEmailFocus = () => {
    if (savedCredentials && formData.email.length === 0) {
      setShowSuggestions(true)
    }
  }

  const handleEmailBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'email') {
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner message="Signing in..." />}
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started Now</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all`}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && savedCredentials && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <button
                      type="button"
                      onClick={handleSuggestionClick}
                      className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{savedCredentials.email}</div>
                        <div className="text-xs text-gray-500">Click to fill credentials</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Signin
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Have an account?{' '}
              <Link href="/" className="text-emerald-500 hover:text-emerald-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-20 h-20 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-4">
            HUFMS<span className="text-sm align-super">.md</span>
          </h2>
          
          <p className="text-teal-50 text-lg max-w-md mx-auto">
            Fleet Management System
          </p>

          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center gap-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Truck Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="100" width="120" height="60" fill="white" rx="4"/>
            <rect x="170" y="120" width="80" height="40" fill="white" rx="4"/>
            <circle cx="90" cy="170" r="15" fill="white"/>
            <circle cx="210" cy="170" r="15" fill="white"/>
            
            <rect x="400" y="90" width="140" height="70" fill="white" rx="4"/>
            <rect x="540" y="115" width="90" height="45" fill="white" rx="4"/>
            <circle cx="445" cy="170" r="15" fill="white"/>
            <circle cx="585" cy="170" r="15" fill="white"/>
            
            <rect x="800" y="105" width="110" height="55" fill="white" rx="4"/>
            <rect x="910" y="125" width="75" height="35" fill="white" rx="4"/>
            <circle cx="835" cy="170" r="15" fill="white"/>
            <circle cx="950" cy="170" r="15" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
