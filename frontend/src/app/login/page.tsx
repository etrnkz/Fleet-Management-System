'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'

const ROLE_PATHS: Record<string, string> = {
  Dean: '/college-dean/dashboard',
  CollegeHead: '/college-dean/dashboard',
  DepartmentHead: '/department/dashboard',
  DeploymentOffice: '/deployment-office/dashboard',
  DeploymentTeam: '/deployment-office/dashboard',
  Driver: '/driver/dashboard',
  Employee: '/employee/dashboard',
  User: '/employee/dashboard',
  President: '/president/dashboard',
  SystemAdmin: '/system-admin/dashboard',
  Developer: '/system-admin/dashboard',
  TransportOffice: '/transport-admin/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const remembered = localStorage.getItem('hufms_remembered')
    if (remembered) {
      try {
        const data = JSON.parse(remembered)
        if (new Date(data.expiry) > new Date()) {
          setSavedCredentials({ email: data.email, password: data.password })
        } else {
          localStorage.removeItem('hufms_remembered')
        }
      } catch {}
    }
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') ||
                  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (token && user) {
      try {
        const parsed = JSON.parse(user)
        const dest = ROLE_PATHS[parsed.role]
        if (dest) router.replace(dest)
      } catch {}
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await authApi.login(email, password, rememberMe) as any
      const storage = rememberMe ? localStorage : sessionStorage
      if (!rememberMe) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
      storage.setItem('access_token', response.access_token)
      storage.setItem('accessToken', response.access_token)
      if (response.refresh_token) storage.setItem('refreshToken', response.refresh_token)
      if (response.user) storage.setItem('user', JSON.stringify(response.user))

      // Set cookies for middleware
      const maxAgeStr = rememberMe ? `; max-age=${60 * 60 * 24 * 30}` : ''
      document.cookie = `accessToken=${response.access_token}; path=/; SameSite=Lax${maxAgeStr}`
      document.cookie = `user=${encodeURIComponent(JSON.stringify(response.user))}; path=/; SameSite=Lax${maxAgeStr}`

      if (rememberMe) {
        const expiry = new Date(); expiry.setDate(expiry.getDate() + 30)
        localStorage.setItem('hufms_remembered', JSON.stringify({ email, password, expiry: expiry.toISOString() }))
      } else {
        localStorage.removeItem('hufms_remembered')
      }

      const role = response.user?.role
      const dest = ROLE_PATHS[role]
      if (!dest) {
        setError('Your role does not have an assigned portal. Contact the system administrator.')
        setIsLoading(false)
        return
      }
      router.push(dest)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    if (savedCredentials && val.length > 0) setShowSuggestions(savedCredentials.email.toLowerCase().startsWith(val.toLowerCase()))
    else if (savedCredentials && val.length === 0) setShowSuggestions(true)
    else setShowSuggestions(false)
  }

  const handleSuggestionClick = () => {
    if (savedCredentials) { setEmail(savedCredentials.email); setPassword(savedCredentials.password); setRememberMe(true); setShowSuggestions(false) }
  }

  return (
    <div className="min-h-screen flex">
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-50/80 dark:bg-slate-900/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] dark:border-[#A8DADC] border-t-transparent" />
            <p className="mt-4 text-gray-600 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">Authenticating…</p>
          </div>
        </div>
      )}

      {/* Left — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Haramaya University</p>
                  <h1 className="text-lg font-bold text-[#1B3D2F] dark:text-[#A8DADC] tracking-tight">Fleet Management System</h1>
                </div>
              </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] dark:text-[#A8DADC] font-serif tracking-tight">Secure sign in</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-2 font-medium">Use your institutional credentials. You will be routed to your role-specific dashboard automatically.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F] dark:text-[#A8DADC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input type="email" id="email" value={email} onChange={handleEmailChange}
                  onFocus={() => { if (savedCredentials && email.length === 0) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="you@haramaya.edu.et"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 dark:focus:ring-[#A8DADC]/30 focus:border-[#1B3D2F] dark:focus:border-[#A8DADC] outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" required />
                {showSuggestions && savedCredentials && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg">
                    <button type="button" onClick={handleSuggestionClick} className="w-full px-4 py-3 text-left hover:bg-[#1B3D2F]/10 dark:hover:bg-[#A8DADC]/10 transition-colors flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B3D2F]/15 dark:bg-[#A8DADC]/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#1B3D2F] dark:text-[#A8DADC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{savedCredentials.email}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Click to fill credentials</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#1B3D2F] dark:text-[#A8DADC] hover:underline transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F] dark:text-[#A8DADC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 dark:focus:ring-[#A8DADC]/30 focus:border-[#1B3D2F] dark:focus:border-[#A8DADC] outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-[#1B3D2F] dark:hover:text-[#A8DADC]">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-[#1B3D2F] focus:ring-[#1B3D2F]" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-slate-400">Remember me</label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#152e22] dark:bg-[#1E3A5F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1B3D2F] dark:hover:bg-[#1a3356] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right — green panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#152e22] flex-col justify-center px-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative z-10 max-w-md">
          <p className="text-[#A8DADC] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Unified portal — all roles</p>
          <h2 className="text-3xl font-bold font-serif tracking-tight leading-tight">Fleet Management System</h2>
          <p className="mt-4 text-white/85 text-sm leading-relaxed font-medium">One sign-in for all roles. Your dashboard is automatically determined by your institutional role — transport staff, drivers, deans, departments, or executives.</p>
          <div className="mt-10 h-px w-24 bg-[#D1E1FF]/50" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {['Transport Admin', 'College Dean', 'Department Head', 'Deployment Office', 'Employee', 'Driver', 'President', 'System Admin'].map(r => (
              <div key={r} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A8DADC]/60 flex-shrink-0" />
                <span className="text-xs text-white/70 font-medium">{r}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-white/50 uppercase tracking-widest font-semibold">Haramaya University · Authorized users only</p>
        </div>
      </div>
    </div>
  )
}
