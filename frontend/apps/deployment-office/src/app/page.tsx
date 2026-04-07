'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B3D2F] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Fleet Authority</p>
              <p className="text-sm font-bold text-[#1B3D2F] leading-tight">Deployment Office</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Support', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#1B3D2F] font-medium transition-colors">{item}</a>
            ))}
          </nav>
          <Link href="/login" className="bg-[#1B3D2F] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#152e22] transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1B3D2F]/10 text-[#1B3D2F] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-1.5 h-1.5 bg-[#1B3D2F] rounded-full" />
              Deployment Office Portal
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#1B3D2F] font-serif leading-tight mb-6">
              Smart Fleet Control<br />
              for <span className="text-emerald-600">Haramaya<br />University</span>
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Manage vehicle allocations, driver assignments, trip dispatching, and maintenance operations — all from one secure deployment portal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="bg-[#1B3D2F] text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-[#152e22] transition-colors">
                Login as Deployment Office
              </Link>
              <a href="#about" className="border border-[#1B3D2F]/30 text-[#1B3D2F] px-7 py-3 rounded-lg font-semibold text-sm hover:bg-[#1B3D2F]/5 transition-colors">
                Learn More
              </a>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-[#1B3D2F] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">DO</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Deployment Dashboard</p>
                <p className="text-xs text-gray-400">Fleet operations control</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Live
              </span>
            </div>
            {[
              { label: 'Pending Allocation', value: '5', color: 'bg-amber-50 text-amber-700' },
              { label: 'Active Trips', value: '12', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Available Vehicles', value: '8', color: 'bg-blue-50 text-blue-700' },
            ].map(s => (
              <div key={s.label} className={`flex items-center justify-between px-4 py-3 rounded-lg ${s.color}`}>
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-lg font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif mb-4">About the System</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            HUFMS is a centralized platform designed for efficiency and transparency. The Deployment Office manages vehicle dispatch, driver allocation, and trip lifecycle — ensuring every university trip is handled with precision and accountability.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-[#F8F9FA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif mb-3">Key Management Modules</h2>
            <p className="text-gray-500 text-sm">Comprehensive tools for modern university logistics</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Trip Allocation', desc: 'Assign vehicles and drivers to approved trip requests efficiently.' },
              { title: 'Fleet Tracking', desc: 'Monitor vehicle locations and routes in real-time with GPS.' },
              { title: 'Driver Management', desc: 'Manage driver profiles, availability, and assignments.' },
              { title: 'Maintenance Control', desc: 'Schedule and track vehicle maintenance for fleet reliability.' },
              { title: 'Reports & Analytics', desc: 'Generate detailed reports on fleet performance and utilization.' },
              { title: 'Compliance & Docs', desc: 'Maintain digital records of licenses, insurance, and documents.' },
            ].map(m => (
              <div key={m.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#1B3D2F]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#1B3D2F] mb-2">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#1B3D2F] py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Operational Coverage</h3>
              <p className="text-white/70 text-sm leading-relaxed">Designed to serve all parts and campuses of Haramaya University for streamlined operations.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Restricted Access</h3>
              <p className="text-white/70 text-sm leading-relaxed">Only authorized deployment personnel with valid credentials can access the system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-[#1B3D2F] font-serif mb-4">Need Support?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">If you encounter any issues or need assistance, reach out to our support team.</p>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#1B3D2F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Transport Office</p>
                  <p className="text-gray-500 text-sm">For general inquiries and support</p>
                  <a href="mailto:transport@hu.edu.et" className="text-[#1B3D2F] text-sm hover:underline">transport@hu.edu.et</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#1B3D2F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">IT Helpdesk</p>
                  <p className="text-gray-500 text-sm">Technical issues: +251 25 553 0325</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-[#1B3D2F] text-sm hover:underline">ithelpdesk@hu.edu.et</a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              {['Trip Allocation Module', 'GPS Tracking System', 'Driver Management', 'Maintenance Module'].map(s => (
                <div key={s} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{s}</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Operational
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1B3D2F] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <span className="font-bold text-sm">HUFMS</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">Smart Fleet Control for Haramaya University</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-white/60 text-xs">
                <li><a href="#home" className="hover:text-white">Home</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-white/60 text-xs">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-1 text-white/60 text-xs">
                <li>Haramaya University</li>
                <li>P.O. Box 138</li>
                <li>Dire Dawa, Ethiopia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-white/50 text-xs">© 2025 Haramaya University Fleet Management System · <a href="https://haramaya.edu.et" className="hover:text-white underline">haramaya.edu.et</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
