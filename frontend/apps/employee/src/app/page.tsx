'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function LandingPageContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle logout - clear all storage when redirected from logout
    const fromLogout = searchParams.get('logout') === 'true'
    if (fromLogout) {
      localStorage.clear()
      sessionStorage.clear()
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C20]">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#C4C6D0]/30 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/hulogo.png" alt="Haramaya University" className="w-10 h-10 object-contain rounded-full" />
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-[#1B3D2F] leading-none">Fleet Authority</p>
              <p className="text-[10px] uppercase tracking-widest text-[#565F71] font-bold mt-0.5">University Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#home" className="text-sm font-medium text-[#565F71] hover:text-[#1B3D2F] transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium text-[#565F71] hover:text-[#1B3D2F] transition-colors">
              About
            </Link>
            <Link href="#modules" className="text-sm font-medium text-[#565F71] hover:text-[#1B3D2F] transition-colors">
              Services
            </Link>
            <Link href="#support" className="text-sm font-medium text-[#565F71] hover:text-[#1B3D2F] transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-[#1B3D2F] text-white px-5 sm:px-6 py-2 rounded font-bold text-sm shadow hover:bg-[#152e22] active:scale-[0.98] transition-all"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#565F71] hover:text-[#1B3D2F]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#C4C6D0]/20 bg-white px-4 py-3 space-y-2">
            {['#home', '#about', '#modules', '#support'].map((h, i) => (
              <Link
                key={h}
                href={h}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#565F71] font-medium hover:text-[#1B3D2F]"
              >
                {['Home', 'About', 'Services', 'Support'][i]}
              </Link>
            ))}
          </div>
        )}
      </header>

      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-widest text-[#565F71] mb-4">Official employee access</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#1B3D2F] font-serif leading-tight">
              University fleet registry &amp; trip coordination
            </h1>
            <p className="text-[#44474E] mt-6 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
              Submit travel requests, track approvals, and stay informed on vehicle assignments through a single
              institutional portal aligned with transport office procedures.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1B3D2F] text-white px-8 py-3 rounded font-bold shadow hover:bg-[#152e22] active:scale-[0.98] transition-all text-center"
              >
                Employee sign in
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-8 py-3 rounded font-semibold text-[#1B3D2F] border border-[#C4C6D0] bg-white hover:bg-[#F2F3F7] transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="relative animate-fade-in-right">
            <div className="bg-white rounded border border-[#C4C6D0]/40 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded bg-[#D1E1FF]/60 flex items-center justify-center text-[#1B3D2F]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-serif font-bold text-[#1B3D2F] text-lg">Trip registry preview</p>
                  <p className="text-xs text-[#565F71] font-semibold uppercase tracking-wider">Read-only illustration</p>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-[#ECEEF3] last:border-0"
                  >
                    <span className="text-sm font-mono font-bold text-[#1B3D2F]">REQ-{82000 + i * 11}</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                        i === 1 ? 'bg-[#D1E1FF] text-[#1B3D2F]' : 'bg-[#E0E2E8] text-[#565F71]'
                      }`}
                    >
                      {i === 1 ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#565F71] mt-6 italic">Figures shown are illustrative.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white border-y border-[#C4C6D0]/20 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3D2F] font-serif tracking-tight mb-4">About the portal</h2>
          <p className="text-[#44474E] leading-relaxed font-medium">
            Fleet Authority centralizes official transport workflows for Haramaya University. The system supports
            transparent approvals, documented trip records, and coordination with the transport office—consistent with
            institutional governance and duty-of-care standards.
          </p>
        </div>
      </section>

      <section id="modules" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif tracking-tight mb-2">Key capabilities</h2>
            <p className="text-[#565F71] text-sm font-medium">Tools available through the employee portal</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                t: 'Trip requests',
                d: 'Submit and track official travel requests with structured approval paths.',
              },
              {
                t: 'Status & registry',
                d: 'View pending, approved, and completed trips in a clear registry layout.',
              },
              {
                t: 'Notifications',
                d: 'Receive updates on approvals, assignments, and transport office messages.',
              },
              {
                t: 'Fleet visibility',
                d: 'See vehicle availability context where published by transport operations.',
              },
              {
                t: 'Profile & settings',
                d: 'Maintain contact details and institutional affiliation information.',
              },
              {
                t: 'Support channels',
                d: 'Reach the transport office or IT helpdesk through published contact routes.',
              },
            ].map((item) => (
              <div
                key={item.t}
                className="bg-white p-6 rounded border border-[#C4C6D0]/40 shadow-sm hover:border-[#1B3D2F]/25 transition-colors"
              >
                <h3 className="font-serif font-bold text-lg text-[#1B3D2F] mb-2">{item.t}</h3>
                <p className="text-sm text-[#44474E] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1B3D2F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Operational coverage</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Services are intended for authorized university personnel and official business in line with transport
              office policies.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Restricted access</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              Sign-in requires valid institutional credentials. Activity may be logged for audit and compliance purposes.
            </p>
          </div>
        </div>
      </section>

      <section id="support" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1B3D2F] mb-4">Need support?</h2>
              <p className="text-[#44474E] mb-8 leading-relaxed">
                For trip scheduling, approvals, or driver coordination, contact the transport office. For login or
                technical issues, use the IT helpdesk.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[#1B3D2F]">Transport office</p>
                  <p className="text-sm text-[#565F71]">General inquiries</p>
                  <a href="mailto:transport@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] hover:underline">
                    transport@hu.edu.et
                  </a>
                </div>
                <div>
                  <p className="font-bold text-[#1B3D2F]">IT helpdesk</p>
                  <p className="text-sm text-[#565F71]">Technical issues</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-sm font-semibold text-[#1B3D2F] hover:underline">
                    ithelpdesk@hu.edu.et
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-[#F2F3F7] p-8 rounded border border-[#C4C6D0]/40">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1B3D2F] mb-4 border-b border-[#C4C6D0]/30 pb-2">
                System status
              </h3>
              <ul className="space-y-3 text-sm">
                {['Trip request module', 'Employee notifications', 'Portal access'].map((x) => (
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

      <footer id="contact" className="bg-[#191C20] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-serif font-bold text-lg text-white">Fleet Authority</p>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">University Portal</p>
            <p className="text-sm text-white/50 mt-4 max-w-sm">
              Official fleet management and employee transport services for Haramaya University.
            </p>
          </div>
          <div className="text-sm text-white/60">
            <p>Haramaya University</p>
            <p>P.O. Box 138, Dire Dawa, Ethiopia</p>
            <p className="mt-4">
              © {new Date().getFullYear()} Haramaya University ·{' '}
              <a href="https://haramaya.edu.et" className="text-[#D1E1FF] hover:underline">
                haramaya.edu.et
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]" />}>
      <LandingPageContent />
    </Suspense>
  )
}

