'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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

function LandingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fromLogout = searchParams.get('logout') === 'true'
    if (fromLogout) {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie = 'accessToken=; path=/; max-age=0'
      document.cookie = 'user=; path=/; max-age=0'
      return
    }
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (token && user) {
      try {
        const parsed = JSON.parse(user)
        const dest = ROLE_PATHS[parsed.role]
        if (dest) router.replace(dest)
      } catch {}
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f17]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/hulogo.png"
            alt="Haramaya University"
            className="w-9 h-9 object-contain rounded-full ring-1 ring-white/10"
          />
          <div>
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] leading-none">
              Haramaya University
            </p>
            <p className="text-sm font-bold text-white leading-tight tracking-tight">
              Fleet Management System
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors border border-white/10"
        >
          Sign In
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Haramaya University · Authorized Access Only
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white font-serif leading-[1.08] tracking-tight max-w-3xl mb-6">
          Fleet Management
          <br />
          <span className="text-emerald-400">System</span>
        </h1>

        <p className="text-white/50 text-base sm:text-lg max-w-md mb-12 leading-relaxed">
          Haramaya University
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:-translate-y-0.5"
        >
          Sign In to Your Portal
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 max-w-lg w-full">
          {[
            { value: '10+', label: 'User Roles' },
            { value: '8', label: 'Portals' },
            { value: '24/7', label: 'Live Tracking' },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1f17] px-6 py-5 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60 mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-8 py-5 flex items-center justify-between border-t border-white/5">
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} Haramaya University Fleet Management System
        </p>
        <a
          href="https://haramaya.edu.et"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white/80 text-xs transition-colors"
        >
          haramaya.edu.et
        </a>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1f17]" />}>
      <LandingPageContent />
    </Suspense>
  )
}
