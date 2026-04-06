'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail')
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
      // If already logged in (token in either storage), redirect
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      if (token) router.replace('/dashboard')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Remember me: persist tokens in localStorage; otherwise use sessionStorage (clears on tab close)
      const storage = rememberMe ? localStorage : sessionStorage

      // Clear the other storage to avoid stale tokens
      if (rememberMe) {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        sessionStorage.removeItem('user')
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      storage.setItem('accessToken', data.access_token)
      storage.setItem('refreshToken', data.refresh_token)
      storage.setItem('user', JSON.stringify(data.user))

      // Keep access_token alias in same storage for compatibility
      storage.setItem('access_token', data.access_token)

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      router.push('/dashboard')
    } catch (error: any) {
      setIsLoading(false)
      alert(error.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#F8F9FA]/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-[#e0e3e5] p-8 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
            <p className="mt-4 text-[#424845] text-sm font-semibold uppercase tracking-wide">Authenticating…</p>
          </div>
        </div>
      )}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-[#F8F9FA]">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#1B3D2F] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#565F71] uppercase tracking-[0.15em]">Fleet Authority</p>
                <h1 className="text-xl font-bold text-[#1B3D2F] font-serif tracking-tight">University Portal</h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] font-serif tracking-tight">Secure sign in</h2>
            <p className="text-[#424845] text-sm mt-2 font-medium">
              Use your institutional credentials to access official transport services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="w-full px-4 py-3 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-[#424845] uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#1B3D2F] hover:text-[#1B3D2F]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727975] hover:text-[#1B3D2F]"
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
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#c1c8c4] text-[#1B3D2F] focus:ring-[#1B3D2F]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[#424845]">
                Keep me signed in
              </label>
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

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B3D2F] flex-col justify-center px-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative z-10 max-w-md">
          <p className="text-[#D1E1FF] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Official use</p>
          <h2 className="text-3xl font-bold font-serif tracking-tight leading-tight">Fleet Management System</h2>
          <p className="mt-4 text-white/85 text-sm leading-relaxed font-medium">
            Submit trip requests, track approvals, and view assignment details through this secure employee portal.
          </p>
          <div className="mt-10 h-px w-24 bg-[#D1E1FF]/50" />
          <p className="mt-6 text-xs text-white/60 uppercase tracking-widest font-semibold">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  )
}

