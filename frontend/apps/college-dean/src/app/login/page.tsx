'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null)

  useEffect(() => {
    const remembered = localStorage.getItem('collegeDeanRememberedUser')
    if (remembered) {
      const userData = JSON.parse(remembered)
      if (new Date(userData.expiry) > new Date()) {
        setSavedCredentials({ email: userData.email, password: userData.password })
      } else {
        localStorage.removeItem('collegeDeanRememberedUser')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { authApi } = await import('../../lib/api')
      const response: any = await authApi.login(email, password)

      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      localStorage.setItem('user', JSON.stringify(response.user))

      if (rememberMe) {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 30)
        localStorage.setItem('collegeDeanRememberedUser', JSON.stringify({ email, password, expiry: expiry.toISOString() }))
      } else {
        localStorage.removeItem('collegeDeanRememberedUser')
      }

      const role = response.user?.role
      if (role !== 'Dean' && role !== 'CollegeHead') {
        ;['accessToken', 'access_token', 'refreshToken', 'user'].forEach(k => localStorage.removeItem(k))
        setError('Access denied. This portal is for College Deans only.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setEmail(value)
    if (savedCredentials && value.length > 0) {
      setShowSuggestions(savedCredentials.email.toLowerCase().startsWith(value.toLowerCase()))
    }
  }

  const handleSuggestionClick = () => {
    if (savedCredentials) {
      setEmail(savedCredentials.email)
      setPassword(savedCredentials.password)
      setRememberMe(true)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {loading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
            <p className="mt-4 text-gray-600 text-sm font-semibold uppercase tracking-wide">Authenticating…</p>
          </div>
        </div>
      )}

      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img src="/hulogo.png" alt="Haramaya University" className="w-8 h-8 object-contain rounded-full" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Haramaya University</p>
                <h1 className="text-lg font-bold text-[#1B3D2F] tracking-tight">College Dean Portal</h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] tracking-tight">Secure sign in</h2>
            <p className="text-gray-600 text-sm mt-2">Use your assigned college dean credentials to access the portal.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email" type="email" value={email}
                  onChange={handleEmailChange}
                  onFocus={() => savedCredentials && email.length === 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="dean@haramaya.edu.et"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  required
                />
                {showSuggestions && savedCredentials && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <button type="button" onClick={handleSuggestionClick}
                      className="w-full px-4 py-3 text-left hover:bg-[#1B3D2F]/10 transition-colors flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B3D2F]/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#1B3D2F] hover:underline transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B3D2F]">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1B3D2F] focus:ring-[#1B3D2F]" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#152e22] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1B3D2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#1B3D2F] transition-colors">
              ← Back to portal overview
            </Link>
          </div>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#152e22] flex-col justify-center px-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative z-10 max-w-md">
          <p className="text-[#D1E1FF] text-xs font-semibold uppercase tracking-[0.2em] mb-4">College Dean access</p>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">Fleet Management System</h2>
          <p className="mt-4 text-white/85 text-sm leading-relaxed font-medium">
            Review and approve trip requests, oversee college-level fleet operations, and coordinate with the transport office through this secure portal.
          </p>
          <div className="mt-10 h-px w-24 bg-[#D1E1FF]/50" />
          <p className="mt-6 text-xs text-white/60 uppercase tracking-widest font-semibold">Authorized personnel only</p>
        </div>
      </div>
    </div>
  )
}
