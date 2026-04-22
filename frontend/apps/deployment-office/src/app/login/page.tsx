'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'

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
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem('do_remembered')
      if (remembered) {
        try {
          const data = JSON.parse(remembered)
          if (new Date(data.expiry) > new Date()) {
            setSavedCredentials({ email: data.email, password: data.password })
          } else {
            localStorage.removeItem('do_remembered')
          }
        } catch {}
      }
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (token) router.replace('/dashboard')
    }
  }, [])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setEmail(val)
    if (savedCredentials && val.length > 0) setShowSuggestions(savedCredentials.email.toLowerCase().startsWith(val.toLowerCase()))
    else if (savedCredentials && val.length === 0) setShowSuggestions(true)
    else setShowSuggestions(false)
  }
  const handleSuggestionClick = () => {
    if (savedCredentials) { setEmail(savedCredentials.email); setPassword(savedCredentials.password); setRememberMe(true); setShowSuggestions(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await authApi.login(email, password, rememberMe)
      const storage = rememberMe ? localStorage : sessionStorage
      if (!rememberMe) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
      storage.setItem('access_token', response.access_token)
      storage.setItem('accessToken', response.access_token)
      if (response.user) storage.setItem('user', JSON.stringify(response.user))
      if (rememberMe) {
        const expiry = new Date(); expiry.setDate(expiry.getDate() + 30)
        localStorage.setItem('do_remembered', JSON.stringify({ email, password, expiry: expiry.toISOString() }))
      } else {
        localStorage.removeItem('do_remembered')
        storage.setItem('sessionExpiry', String(Date.now() + 7 * 60 * 60 * 1000))
      }

      // Role check — only DeploymentTeam allowed
      const role = response.user?.role
      if (role !== 'DeploymentTeam') {
        ;['access_token', 'accessToken', 'user'].forEach(k => { storage.removeItem(k) })
        setError('Access denied. This portal is for Deployment Office staff only.')
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#F8F9FA]/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
            <p className="mt-4 text-gray-500 text-sm font-semibold uppercase tracking-wide">Authenticating…</p>
          </div>
        </div>
      )}

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <img src="/hulogo.png" alt="Haramaya University" className="w-12 h-12 object-contain rounded-full" />
              <div>
                <p className="text-[10px] font-semibold text-[#565F71] uppercase tracking-[0.15em]">Fleet Authority</p>
                <h1 className="text-xl font-bold text-[#1B3D2F] font-serif tracking-tight">Deployment Office</h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] font-serif tracking-tight">Secure sign in</h2>
            <p className="text-[#424845] text-sm mt-2 font-medium">
              Use your deployment office credentials to access the portal.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => { if (savedCredentials && email.length === 0) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="deployment@haramaya.edu.et"
                  className="w-full pl-10 pr-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all bg-white"
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
                <label htmlFor="password" className="block text-xs font-semibold text-[#424845] uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#1B3D2F] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727975] hover:text-[#1B3D2F]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#c1c8c4] text-[#1B3D2F] focus:ring-[#1B3D2F]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[#424845]">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B3D2F] text-white py-3 rounded-lg font-semibold text-sm uppercase tracking-wide hover:bg-[#152e22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B3D2F] flex-col justify-center px-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative z-10 max-w-md">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Official access</p>
          <h2 className="text-3xl font-bold font-serif tracking-tight leading-tight">Fleet Management System</h2>
          <p className="mt-4 text-white/80 text-sm leading-relaxed font-medium">
            Allocate vehicles, assign drivers, manage trip dispatch, and oversee maintenance operations through this secure deployment portal.
          </p>
          <div className="mt-10 h-px w-24 bg-white/20" />
          <p className="mt-6 text-xs text-white/50 uppercase tracking-widest font-semibold">Authorized personnel only</p>
        </div>
      </div>
    </div>
  )
}
