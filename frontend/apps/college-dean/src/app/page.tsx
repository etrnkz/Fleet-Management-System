'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-sm">H</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Haramaya University</p>
              <p className="text-sm font-bold text-emerald-700 leading-tight tracking-tight">College Dean Portal</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Support', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-600 hover:text-emerald-700 font-medium transition-colors">{item}</a>
            ))}
          </nav>

          <Link href="/login" className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-700/10 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full" />
              College Dean Portal — Haramaya University
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-emerald-700 font-serif leading-tight mb-6">
              Smart Fleet Control<br />
              for <span className="text-emerald-600">Haramaya<br />University</span>
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Manage your assigned trips, track active journeys, report vehicle issues, and stay connected with the transport office — all in one secure college dean portal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="bg-emerald-700 text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors">
                Login as College Dean →
              </Link>
              <a href="#about" className="border border-emerald-700/30 text-emerald-700 px-7 py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700/5 transition-colors">
                Learn More
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CD</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">College Dean Dashboard</p>
                  <p className="text-xs text-gray-400">Real-time trip management</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />GPS Live
                </span>
              </div>
              {[
                { label: 'Assigned Trips', value: '3', color: 'bg-blue-50 text-blue-700' },
                { label: 'Active Trip', value: '1', color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Completed', value: '47', color: 'bg-gray-50 text-gray-700' },
              ].map(s => (
                <div key={s.label} className={`flex items-center justify-between px-4 py-3 rounded-lg ${s.color}`}>
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-lg font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-emerald-700 font-serif mb-4">About the System</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            HUFMS is a centralized platform designed for efficiency and transparency. It helps track transport logistics across all university departments, digitizing fleet workflows to empower data-driven management of vehicles, trips, and resources.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-700 font-serif mb-3">Key Management Modules</h2>
            <p className="text-gray-500 text-sm">Comprehensive tools for modern university logistics</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Real-Time Tracking', desc: 'Monitor vehicle locations and routes in real-time with GPS integration.', icon: '📍' },
              { title: 'Fuel Monitoring', desc: 'Track fuel consumption, costs, and efficiency metrics.', icon: '⛽' },
              { title: 'Maintenance Management', desc: 'Schedule and track vehicle maintenance for fleet reliability.', icon: '🔧' },
              { title: 'Trip & Dispatch Control', desc: 'Manage trip requests, vehicle assignments, and dispatch operations.', icon: '🚗' },
              { title: 'Compliance & Docs', desc: 'Maintain digital records of licenses, insurance, and compliance documents.', icon: '📋' },
              { title: 'Inspection Reporting', desc: 'Generate detailed reports on fleet performance, costs, and utilization.', icon: '📊' },
            ].map(m => (
              <div key={m.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{m.icon}</div>
                <h3 className="text-base font-semibold text-emerald-700 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-emerald-700 font-serif text-center mb-12">Institutional Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Cost-Efficient', desc: 'Reduce operational costs through optimized fuel usage and preventive maintenance.', icon: '💰' },
              { title: 'Enhanced Visibility', desc: 'Real-time insights and analytics for data-driven decision making.', icon: '📈' },
              { title: 'Strong Governance', desc: 'Full audit trails and compliance tracking for transparent fleet management.', icon: '🔒' },
            ].map(b => (
              <div key={b.title} className="text-center">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-emerald-700 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Operational Coverage</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">Designed to serve all parts and campuses of Haramaya University for streamlined operations.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Restricted Access</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">Only authorized personnel with valid credentials can access the system, ensuring data security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-emerald-700 font-serif mb-4">Need Support?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">If you encounter any issues or need assistance, reach out to our support team. We're here to help.</p>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-700/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✉️</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Transport Office</p>
                  <p className="text-gray-500 text-sm">For general inquiries and support</p>
                  <a href="mailto:transport@hu.edu.et" className="text-emerald-700 text-sm hover:underline">transport@hu.edu.et</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-700/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💻</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">IT Helpdesk</p>
                  <p className="text-gray-500 text-sm">Technical issues: +251 25 553 0325</p>
                  <a href="mailto:ithelpdesk@hu.edu.et" className="text-emerald-700 text-sm hover:underline">ithelpdesk@hu.edu.et</a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              {['Trip Request Module', 'GPS Tracking System', 'Mobile Platform', 'Notification Service'].map(s => (
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
      <footer id="contact" className="bg-emerald-700 text-white py-12">
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
              <p className="text-emerald-100 text-xs leading-relaxed">Smart Fleet Control for Haramaya University</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-emerald-100 text-xs">
                <li><a href="#home" className="hover:text-white">Home</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><Link href="/login" className="hover:text-white">College Dean Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-emerald-100 text-xs">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-1 text-emerald-100 text-xs">
                <li>Haramaya University</li>
                <li>P.O. Box 138</li>
                <li>Dire Dawa, Ethiopia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-emerald-100 text-xs">
              © 2025 Haramaya University Fleet Management System ·{' '}
              <a href="https://haramaya.edu.et" className="hover:text-white underline">haramaya.edu.et</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
