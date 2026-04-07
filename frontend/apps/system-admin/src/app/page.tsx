'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.role === 'SystemAdmin' || parsed.role === 'Developer') router.replace('/dashboard')
      } catch {}
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C20]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#C4C6D0]/30 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#1B3D2F] flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-[#1B3D2F] leading-none">Fleet Authority</p>
              <p className="text-[10px] uppercase tracking-widest text-[#565F71] font-bold mt-0.5">System Admin Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {['#home', '#about', '#modules', '#support'].map((href, i) => (
              <Link key={href} href={href} className="text-sm font-medium text-[#565F71] hover:text-[#1B3D2F] transition-colors">
                {['Home', 'About', 'Services', 'Support'][i]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="bg-[#1B3D2F] text-white px-5 sm:px-6 py-2 rounded font-bold text-sm shadow hover:bg-[#152e22] active:scale-[0.98] transition-all">
              Sign in
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#565F71] hover:text-[#1B3D2F]" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#C4C6D0]/20 bg-white px-4 py-3 space-y-2">
            {['#home', '#about', '#modules', '#support'].map((href, i) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#565F71] font-medium hover:text-[#1B3D2F]">
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-4">System Admin access</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#1B3D2F] font-serif leading-tight">
              System administration &amp; platform governance
            </h1>
            <p className="text-[#44474E] mt-6 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
              Full control over users, roles, system configuration, audit logs, and platform health for the Haramaya University Fleet Management System.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1B3D2F] text-white px-8 py-3 rounded font-bold shadow hover:bg-[#152e22] active:scale-[0.98] transition-all">
                Admin sign in
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a href="#about"
                className="inline-flex items-center justify-center px-8 py-3 rounded font-semibold text-[#1B3D2F] border border-[#C4C6D0] bg-white hover:bg-[#F2F3F7] transition-colors">
                Learn more
              </a>
            </div>
          </div>
          <div className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded bg-[#D1E1FF]/60 flex items-center justify-center text-[#1B3D2F]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-serif font-bold text-[#1B3D2F] text-lg">System overview</p>
                <p className="text-xs text-[#565F71] font-semibold uppercase tracking-wider">Read-only illustration</p>
              </div>
            </div>
            <div className="space-y-3">
              {[['Users', '142', 'Active'], ['Roles', '12', 'Configured'], ['System', 'v1.0', 'Healthy']].map(([label, value, status]) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-[#ECEEF3] last:border-0">
                  <span className="text-sm font-medium text-[#44474E]">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#1B3D2F]">{value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#D1E1FF] text-[#1B3D2F]">{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#565F71] mt-6 italic">Figures shown are illustrative.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white border-y border-[#C4C6D0]/20 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3D2F] font-serif tracking-tight mb-4">About the portal</h2>
          <p className="text-[#44474E] leading-relaxed font-medium">
            The System Admin Portal provides full administrative control over the Fleet Management System. Administrators manage user accounts, configure role permissions, monitor system health, review audit logs, and broadcast system-wide notifications.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif tracking-tight mb-2">Key capabilities</h2>
            <p className="text-[#565F71] text-sm font-medium">Administrative tools available through this portal</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'User management', d: 'Create, update, deactivate, and manage all user accounts across the system.' },
              { t: 'Role configuration', d: 'Define and assign roles with granular permission controls for each user type.' },
              { t: 'System health', d: 'Monitor server status, API health, and platform performance in real time.' },
              { t: 'Audit logs', d: 'Review complete activity logs for accountability and compliance tracking.' },
              { t: 'Notifications', d: 'Broadcast system-wide messages and alerts to all or specific user groups.' },
              { t: 'System configuration', d: 'Manage global settings, integrations, and platform-level configurations.' },
            ].map((item) => (
              <div key={item.t} className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm hover:border-[#1B3D2F]/25 transition-colors">
                <h3 className="font-serif font-bold text-lg text-[#1B3D2F] mb-2">{item.t}</h3>
                <p className="text-sm text-[#44474E] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-[#1B3D2F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Full system access</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              System admins have unrestricted access to all platform features, user data, and configuration settings.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Restricted access</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              This portal is exclusively for authorized system administrators. All actions are logged for security and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1B3D2F] mb-4">Need support?</h2>
              <p className="text-[#44474E] mb-8 leading-relaxed">
                For platform issues or escalations, contact the IT department directly.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[#1B3D2F]">IT helpdesk</p>
                  <p className="text-sm text-[#565F71]">Technical issues & escalations</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] hover:underline">ithelpdesk@hu.edu.et</a>
                </div>
              </div>
            </div>
            <div className="bg-[#F2F3F7] p-8 rounded border border-[#C4C6D0]/40">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1B3D2F] mb-4 border-b border-[#C4C6D0]/30 pb-2">System status</h3>
              <ul className="space-y-3 text-sm">
                {['API services', 'Database', 'Portal access'].map((x) => (
                  <li key={x} className="flex justify-between text-[#44474E]">
                    <span>{x}</span>
                    <span className="font-bold text-[#1B3D2F]">Active</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#191C20] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-serif font-bold text-lg text-white">Fleet Authority</p>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">System Admin Portal</p>
            <p className="text-sm text-white/50 mt-4 max-w-sm">Official fleet management system administration for Haramaya University.</p>
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
