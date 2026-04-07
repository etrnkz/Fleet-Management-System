'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/30 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-emerald-700 leading-none">Haramaya University</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mt-0.5">FLEET MANAGEMENT</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#home" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
              About
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
              Features
            </Link>
            <Link href="#support" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-emerald-700 text-white px-5 sm:px-6 py-2 rounded font-bold text-sm shadow hover:bg-emerald-800 active:scale-[0.98] transition-all"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-700"
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
          <div className="md:hidden border-t border-gray-200/20 bg-white px-4 py-3 space-y-2">
            {['#home', '#about', '#features', '#support'].map((h, i) => (
              <Link
                key={h}
                href={h}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 font-medium hover:text-emerald-700"
              >
                {['Home', 'About', 'Features', 'Support'][i]}
              </Link>
            ))}
          </div>
        )}
      </header>

      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Employee access portal</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-emerald-700 font-serif leading-tight">
              University fleet trip coordination
            </h1>
            <p className="text-gray-700 mt-6 text-base sm:text-lg leading-relaxed font-medium max-w-xl">
              Submit travel requests, track approvals, and stay informed on vehicle assignments through a single
              institutional portal aligned with transport office procedures.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-8 py-3 rounded font-bold shadow hover:bg-emerald-800 active:scale-[0.98] transition-all text-center"
              >
                Employee sign in
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-8 py-3 rounded font-semibold text-emerald-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="relative animate-fade-in-right">
            <div className="bg-white rounded border border-gray-200/40 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded bg-emerald-100/60 flex items-center justify-center text-emerald-700">
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
                  <p className="font-serif font-bold text-emerald-700 text-lg">Trip requests preview</p>
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Read-only illustration</p>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-mono font-bold text-emerald-700">REQ-{82000 + i * 11}</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                        i === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i === 1 ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-6 italic">Figures shown are illustrative.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white border-y border-gray-200/20 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-700 font-serif tracking-tight mb-4">About the portal</h2>
          <p className="text-gray-700 leading-relaxed font-medium">
            The Employee Portal centralizes official transport workflows for Haramaya University. The system supports
            transparent approvals, documented trip records, and coordination with the transport office—consistent with
            institutional governance and duty-of-care standards.
          </p>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-emerald-700 font-serif tracking-tight mb-2">Key capabilities</h2>
            <p className="text-gray-600 text-sm font-medium">Tools available through the employee portal</p>
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
                className="bg-white p-6 rounded border border-gray-200/40 shadow-sm hover:border-emerald-700/25 transition-colors"
              >
                <h3 className="font-serif font-bold text-lg text-emerald-700 mb-2">{item.t}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-700 text-white py-16">
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
              <h2 className="font-serif text-3xl font-bold text-emerald-700 mb-4">Need support?</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                For trip scheduling, approvals, or driver coordination, contact the transport office. For login or
                technical issues, use the IT helpdesk.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-emerald-700">Transport office</p>
                  <p className="text-sm text-gray-600">General inquiries</p>
                  <a href="mailto:transport@hu.edu.et" className="text-sm font-semibold text-emerald-700 hover:underline">
                    transport@hu.edu.et
                  </a>
                </div>
                <div>
                  <p className="font-bold text-emerald-700">IT helpdesk</p>
                  <p className="text-sm text-gray-600">Technical issues</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-sm font-semibold text-emerald-700 hover:underline">
                    ithelpdesk@hu.edu.et
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 p-8 rounded border border-gray-200/40">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-4 border-b border-gray-200/30 pb-2">
                System status
              </h3>
              <ul className="space-y-3 text-sm">
                {['Trip request module', 'Employee notifications', 'Portal access'].map((x) => (
                  <li key={x} className="flex justify-between text-gray-700">
                    <span>{x}</span>
                    <span className="font-bold text-emerald-700">Active</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-serif font-bold text-lg text-white">Haramaya University</p>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-1">FLEET MANAGEMENT</p>
            <p className="text-sm text-white/50 mt-4 max-w-sm">
              Official fleet management and employee transport services for Haramaya University.
            </p>
          </div>
          <div className="text-sm text-white/60">
            <p>Haramaya University</p>
            <p>P.O. Box 138, Dire Dawa, Ethiopia</p>
            <p className="mt-4">
              © {new Date().getFullYear()} Haramaya University ·{' '}
              <a href="https://haramaya.edu.et" className="text-emerald-400 hover:underline">
                haramaya.edu.et
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

