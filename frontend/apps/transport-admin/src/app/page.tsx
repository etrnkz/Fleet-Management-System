'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDark, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    // Handle logout - clear all storage when redirected from logout
    const fromLogout = searchParams.get('logout') === 'true'
    if (fromLogout) {
      localStorage.clear()
      sessionStorage.clear()
      return
    }

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (token && user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.role === 'TransportOffice') router.replace('/dashboard')
      } catch {}
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F172A] text-[#191C20] dark:text-[#E2E8F0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-slate-900/97 backdrop-blur-md border-b border-[#C4C6D0]/30 dark:border-slate-700/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-[#1B3D2F] dark:text-[#A8DADC] leading-none">Fleet Authority</p>
              <p className="text-[10px] uppercase tracking-widest text-[#565F71] dark:text-slate-400 font-bold mt-0.5">Transport Office Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {['#home', '#about', '#modules', '#support'].map((href, i) => (
              <Link key={href} href={href} className="text-sm font-medium text-[#565F71] dark:text-slate-400 hover:text-[#1B3D2F] dark:hover:text-[#A8DADC] transition-colors">
                {['Home', 'About', 'Services', 'Support'][i]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-[#565F71] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <Link href="/login"
              className="bg-[#1B3D2F] dark:bg-[#1E3A5F] text-white px-5 sm:px-6 py-2 rounded font-bold text-sm shadow hover:bg-[#152e22] dark:hover:bg-[#1a3356] active:scale-[0.98] transition-all">
              Sign in
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#565F71] dark:text-slate-400 hover:text-[#1B3D2F] dark:hover:text-[#A8DADC]" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#C4C6D0]/20 dark:border-slate-700/50 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
            {['#home', '#about', '#modules', '#support'].map((href, i) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#565F71] dark:text-slate-400 font-medium hover:text-[#1B3D2F] dark:hover:text-[#A8DADC]">
                {['Home', 'About', 'Services', 'Support'][i]}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] dark:text-slate-400 mb-4">Transport Office access</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#1B3D2F] dark:text-[#A8DADC] font-serif leading-tight">
              Fleet operations &amp; transport coordination
            </h1>
            <p className="text-[#44474E] dark:text-slate-300 mt-6 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
              Manage vehicle allocations, coordinate drivers, confirm trip logistics, and oversee all transport operations for Haramaya University through this secure portal.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1B3D2F] dark:bg-[#1E3A5F] text-white px-8 py-3 rounded font-bold shadow hover:bg-[#152e22] dark:hover:bg-[#1a3356] active:scale-[0.98] transition-all">
                Transport Office sign in
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a href="#about"
                className="inline-flex items-center justify-center px-8 py-3 rounded font-semibold text-[#1B3D2F] dark:text-[#A8DADC] border border-[#C4C6D0] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-[#F2F3F7] dark:hover:bg-slate-700 transition-colors">
                Learn more
              </a>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded bg-[#D1E1FF]/60 dark:bg-[#A8DADC]/10 flex items-center justify-center text-[#1B3D2F] dark:text-[#A8DADC]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <p className="font-serif font-bold text-[#1B3D2F] dark:text-[#A8DADC] text-lg">Operations preview</p>
                <p className="text-xs text-[#565F71] dark:text-slate-400 font-semibold uppercase tracking-wider">Read-only illustration</p>
              </div>
            </div>
            <div className="space-y-3">
              {[['VH-001', 'Toyota Land Cruiser', 'Active'], ['VH-002', 'Isuzu Bus', 'On Trip'], ['VH-003', 'Mitsubishi Pickup', 'Maintenance']].map(([id, name, status]) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-[#ECEEF3] dark:border-slate-700 last:border-0">
                  <div>
                    <span className="text-sm font-mono font-bold text-[#1B3D2F] dark:text-[#A8DADC]">{id}</span>
                    <span className="ml-2 text-xs text-[#565F71] dark:text-slate-400">{name}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                    status === 'Active' ? 'bg-[#D1E1FF] dark:bg-[#A8DADC]/15 text-[#1B3D2F] dark:text-[#A8DADC]' :
                    status === 'On Trip' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}>{status}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#565F71] dark:text-slate-500 mt-6 italic">Figures shown are illustrative.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white dark:bg-slate-800 border-y border-[#C4C6D0]/20 dark:border-slate-700/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3D2F] dark:text-[#A8DADC] font-serif tracking-tight mb-4">About the portal</h2>
          <p className="text-[#44474E] dark:text-slate-300 leading-relaxed font-medium">
            The Transport Office Portal centralizes all fleet operations for Haramaya University. Transport staff manage vehicle and driver assignments, confirm trip logistics, track fuel and maintenance, and coordinate with departments — all through a single institutional platform.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-[#1B3D2F] dark:text-[#A8DADC] font-serif tracking-tight mb-2">Key capabilities</h2>
            <p className="text-[#565F71] dark:text-slate-400 text-sm font-medium">Tools available through the transport office portal</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'Trip approvals', d: 'Review, confirm, and coordinate approved trip requests from all departments.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { t: 'Vehicle management', d: 'Track fleet availability, assign vehicles, and manage maintenance schedules.', icon: 'M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' },
              { t: 'Driver coordination', d: 'Assign drivers to trips, monitor availability, and manage driver records.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { t: 'Fuel tracking', d: 'Monitor fuel consumption, costs, and efficiency across the entire fleet.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { t: 'Maintenance oversight', d: 'Schedule and track vehicle maintenance to ensure fleet reliability.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
              { t: 'Reports & analytics', d: 'Generate operational reports on trips, costs, and fleet utilization.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((item) => (
              <div key={item.t} className="bg-white dark:bg-slate-800 p-6 rounded border border-[#C4C6D0]/40 dark:border-slate-700 shadow-sm hover:border-[#1B3D2F]/25 dark:hover:border-[#A8DADC]/25 transition-colors">
                <div className="w-12 h-12 bg-[#1B3D2F]/10 dark:bg-[#A8DADC]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#1B3D2F] dark:text-[#A8DADC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1B3D2F] dark:text-[#A8DADC] mb-2">{item.t}</h3>
                <p className="text-sm text-[#44474E] dark:text-slate-300 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-[#1B3D2F] dark:bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Operational coverage</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Covers all university transport operations — from trip allocation to driver dispatch and fuel management across all campuses.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Restricted access</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              This portal is exclusively for Transport Office staff. All activity is logged for audit and institutional compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-16 sm:py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1B3D2F] dark:text-[#A8DADC] mb-4">Need support?</h2>
              <p className="text-[#44474E] dark:text-slate-300 mb-8 leading-relaxed">
                For operational issues contact the transport office directly. For login or technical problems use the IT helpdesk.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[#1B3D2F] dark:text-[#A8DADC]">Transport office</p>
                  <p className="text-sm text-[#565F71] dark:text-slate-400">General inquiries</p>
                  <a href="mailto:transport@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] dark:text-[#A8DADC] hover:underline">transport@hu.edu.et</a>
                </div>
                <div>
                  <p className="font-bold text-[#1B3D2F] dark:text-[#A8DADC]">IT helpdesk</p>
                  <p className="text-sm text-[#565F71] dark:text-slate-400">Technical issues</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] dark:text-[#A8DADC] hover:underline">ithelpdesk@hu.edu.et</a>
                </div>
              </div>
            </div>
            <div className="bg-[#F2F3F7] dark:bg-slate-700/50 p-8 rounded border border-[#C4C6D0]/40 dark:border-slate-600">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1B3D2F] dark:text-[#A8DADC] mb-4 border-b border-[#C4C6D0]/30 dark:border-slate-600 pb-2">System status</h3>
              <ul className="space-y-3 text-sm">
                {['Trip allocation module', 'Vehicle tracking', 'Portal access'].map((x) => (
                  <li key={x} className="flex justify-between text-[#44474E] dark:text-slate-300">
                    <span>{x}</span>
                    <span className="font-bold text-[#1B3D2F] dark:text-[#A8DADC]">Active</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#191C20] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-serif font-bold text-lg text-white">Fleet Authority</p>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">Transport Office Portal</p>
            <p className="text-sm text-white/50 mt-4 max-w-sm">Official fleet management and transport coordination for Haramaya University.</p>
          </div>
          <div className="text-sm text-white/60">
            <p>Haramaya University</p>
            <p>P.O. Box 138, Dire Dawa, Ethiopia</p>
            <p className="mt-4">© {new Date().getFullYear()} Haramaya University ·{' '}
              <a href="https://haramaya.edu.et" className="text-[#D1E1FF] hover:underline">haramaya.edu.et</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LandingPageContent />
    </Suspense>
  )
}
