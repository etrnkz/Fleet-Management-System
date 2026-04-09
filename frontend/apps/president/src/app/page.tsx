'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Handle logout - clear all storage when redirected from logout
    const fromLogout = searchParams.get('logout') === 'true'
    if (fromLogout) {
      localStorage.clear()
      sessionStorage.clear()
      return
    }

    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed.role === 'President') router.replace('/dashboard')
      } catch {}
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C20]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#C4C6D0]/30 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-[#1B3D2F] leading-none">Fleet Authority</p>
              <p className="text-[10px] uppercase tracking-widest text-[#565F71] font-bold mt-0.5">President Portal</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-4">Executive access</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#1B3D2F] font-serif leading-tight">
              University fleet oversight &amp; final approvals
            </h1>
            <p className="text-[#44474E] mt-6 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
              Exercise final approval authority over all trip requests, monitor fleet operations across every department, and access comprehensive analytics for executive decision-making.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1B3D2F] text-white px-8 py-3 rounded font-bold shadow hover:bg-[#152e22] active:scale-[0.98] transition-all">
                President sign in
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-serif font-bold text-[#1B3D2F] text-lg">Approval queue preview</p>
                <p className="text-xs text-[#565F71] font-semibold uppercase tracking-wider">Read-only illustration</p>
              </div>
            </div>
            <div className="space-y-3">
              {[['REQ-82011', 'PENDING_PRESIDENT', 'VIP'], ['REQ-82022', 'PENDING_PRESIDENT', 'SERVICE'], ['REQ-82033', 'APPROVED', 'STANDARD']].map(([id, state, type]) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-[#ECEEF3] last:border-0">
                  <div>
                    <span className="text-sm font-mono font-bold text-[#1B3D2F]">{id}</span>
                    <span className="ml-2 text-xs text-[#565F71]">{type}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${state === 'APPROVED' ? 'bg-[#D1E1FF] text-[#1B3D2F]' : 'bg-amber-100 text-amber-700'}`}>
                    {state === 'APPROVED' ? 'Approved' : 'Pending'}
                  </span>
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
            The President Portal provides executive-level access to Haramaya University's fleet management system. As the final approval authority, the President reviews and approves VIP and service trip requests, monitors all fleet activity, and accesses comprehensive reports for institutional governance.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif tracking-tight mb-2">Key capabilities</h2>
            <p className="text-[#565F71] text-sm font-medium">Executive tools available through the president portal</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'Final approvals', d: 'Exercise final authority over VIP, service, and escalated trip requests.' },
              { t: 'Fleet oversight', d: 'Monitor all active vehicles, drivers, and ongoing trips across departments.' },
              { t: 'Department visibility', d: 'View trip activity and approval status across all colleges and departments.' },
              { t: 'Executive reports', d: 'Access comprehensive analytics, fuel costs, and fleet utilization reports.' },
              { t: 'Notifications', d: 'Receive real-time alerts on pending approvals and critical fleet events.' },
              { t: 'Policy management', d: 'Review and manage institutional transport policies and compliance records.' },
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
            <h3 className="font-serif text-xl font-bold mb-3">Operational coverage</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Full visibility across all university transport operations — from individual trip requests to fleet-wide performance metrics.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Restricted access</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              This portal is exclusively for the University President. All activity is logged for audit and institutional compliance purposes.
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
                For fleet operations or approval workflows, contact the transport office. For login or technical issues, use the IT helpdesk.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[#1B3D2F]">Transport office</p>
                  <p className="text-sm text-[#565F71]">General inquiries</p>
                  <a href="mailto:transport@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] hover:underline">transport@hu.edu.et</a>
                </div>
                <div>
                  <p className="font-bold text-[#1B3D2F]">IT helpdesk</p>
                  <p className="text-sm text-[#565F71]">Technical issues</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] hover:underline">ithelpdesk@hu.edu.et</a>
                </div>
              </div>
            </div>
            <div className="bg-[#F2F3F7] p-8 rounded border border-[#C4C6D0]/40">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1B3D2F] mb-4 border-b border-[#C4C6D0]/30 pb-2">System status</h3>
              <ul className="space-y-3 text-sm">
                {['Approval module', 'Fleet tracking', 'Portal access'].map((x) => (
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
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">President Portal</p>
            <p className="text-sm text-white/50 mt-4 max-w-sm">Official fleet management and executive transport services for Haramaya University.</p>
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
