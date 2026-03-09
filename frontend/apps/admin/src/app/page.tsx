'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">H</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">HUFMS</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link href="#home" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105 transform text-sm lg:text-base">Home</Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105 transform text-sm lg:text-base">About</Link>
            <Link href="#support" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105 transform text-sm lg:text-base">Support</Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105 transform text-sm lg:text-base">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="bg-emerald-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg transform text-sm sm:text-base">
              Sign In
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
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

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col px-4 py-3 space-y-3">
              <Link 
                href="#home" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
              >
                Home
              </Link>
              <Link 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
              >
                About
              </Link>
              <Link 
                href="#support" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
              >
                Support
              </Link>
              <Link 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 mt-16 sm:mt-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-block bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-4 sm:mb-6 flex items-center gap-2 animate-bounce-slow">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ADMIN CONTROL PANEL
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Smart Fleet Control<br />
              for <span className="text-emerald-500">Haramaya<br />University</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
              Our AI-powered system for managing and monitoring fleet operations, fuel consumption, 
              and maintenance schedules for Haramaya University vehicles in a single, easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/login" className="bg-emerald-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-emerald-600 font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl transform text-center text-sm sm:text-base">
                Login as System →
              </Link>
              <button className="border border-gray-300 text-gray-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-gray-50 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg transform text-sm sm:text-base">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative animate-fade-in-right mt-8 md:mt-0">
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Admin Dashboard</p>
                    <p className="text-xs sm:text-sm text-gray-500">System-wide control</p>
                  </div>
                </div>
                <div className="h-24 sm:h-32 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the System */}
      <section id="about" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">About the System</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base">
            HUFMS is a centralized platform designed for efficiency and transparency. 
            We help users track transport logistics across all university departments. 
            By digitizing fleet workflows, we empower the university to manage its vehicles, 
            trips and resources with data-driven precision.
          </p>
        </div>
      </section>

      {/* Key Management Modules */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Key Management Modules</h2>
            <p className="text-gray-600 text-sm sm:text-base">Comprehensive tools for modern university logistics</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Monitor vehicle locations and routes in real-time with GPS integration for enhanced fleet visibility.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Fuel Monitoring</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Track fuel consumption, costs, and efficiency metrics to optimize fleet operations.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Maintenance Management</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Schedule and track vehicle maintenance to ensure fleet reliability and longevity.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Trip & Dispatch Control</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage trip requests, vehicle assignments, and dispatch operations efficiently.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Compliance & Docs</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Maintain digital records of licenses, insurance, and compliance documents.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Inspection Reporting</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Generate detailed reports on fleet performance, costs, and utilization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Benefits */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Institutional Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center animate-fade-in-up">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Cost-Efficient</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Reduce operational costs through optimized fuel usage and preventive maintenance scheduling.
              </p>
            </div>

            <div className="text-center animate-fade-in-up">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Enhanced</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Real-time insights and analytics for data-driven decision making and fleet optimization.
              </p>
            </div>

            <div className="text-center animate-fade-in-up">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Governance</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Full audit trails and compliance tracking for transparent fleet management operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System User Roles */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">System User Role</h2>
            <p className="text-gray-600 text-sm sm:text-base">Fleet Management Administration</p>
          </div>
          <div className="flex justify-center">
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 text-lg sm:text-xl mb-2">Administrator</p>
              <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                Full system control: manage vehicles, drivers, trips, maintenance, fuel, documents, and generate comprehensive reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Coverage & Restricted Access */}
      <section className="bg-emerald-500 text-white py-12 sm:py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="flex gap-4 animate-fade-in-up">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Operational Coverage</h3>
                <p className="text-emerald-50 text-sm sm:text-base">
                  The system is designed to serve all parts and campuses of Haramaya University for streamlined operations.
                </p>
              </div>
            </div>

            <div className="flex gap-4 animate-fade-in-up">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Restricted Access</h3>
                <p className="text-emerald-50 text-sm sm:text-base">
                  Only authorized personnel with valid credentials can access the system, ensuring data security and privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Support */}
      <section id="support" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Need Support?</h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                If you encounter any issues or need assistance, feel free to reach out to our support team. 
                We're here to help you get the most out of the system.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4 animate-fade-in-up">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Transport Office</p>
                    <p className="text-gray-600 text-xs sm:text-sm">For general inquiries and support</p>
                    <a href="mailto:transport@hu.edu.et" className="text-emerald-500 hover:underline text-sm">
                      transport@hu.edu.et
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 animate-fade-in-up">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">IT Helpdesk</p>
                    <p className="text-gray-600 text-xs sm:text-sm">For technical issues: 📞 +251 25 553 0325</p>
                    <a href="mailto:ithelpdesk@hu.edu.et" className="text-emerald-500 hover:underline text-sm">
                      ithelpdesk@hu.edu.et
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl animate-fade-in-up">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">System Status</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between animate-fade-in-up">
                  <span className="text-gray-600 text-sm sm:text-base">Trip Request Module</span>
                  <span className="text-emerald-500 font-medium text-sm">✓ Active</span>
                </div>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <span className="text-gray-600 text-sm sm:text-base">Tracking System</span>
                  <span className="text-emerald-500 font-medium text-sm">✓ Active</span>
                </div>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <span className="text-gray-600 text-sm sm:text-base">Mobile Platform</span>
                  <span className="text-emerald-500 font-medium text-sm">✓ Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-8 sm:py-12 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-1 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">H</span>
                </div>
                <span className="font-semibold text-sm sm:text-base">HUFMS</span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                Smart Fleet Control for Haramaya University
              </p>
            </div>

            <div className="animate-fade-in-up">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><Link href="#" className="hover:text-white">Home</Link></li>
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>

            <div className="animate-fade-in-up">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>

            <div className="animate-fade-in-up">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li>Haramaya University</li>
                <li>P.O. Box 138</li>
                <li>Dire Dawa, Ethiopia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in-up">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © 2025 by Haramaya University Fleet Management System - 
              <a href="https://haramaya.edu.et" className="text-emerald-400 hover:underline ml-1">
                haramaya.edu.et
              </a>
            </p>
            <div className="flex gap-3 sm:gap-4">
              <button className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 text-xs sm:text-sm">
                f
              </button>
              <button className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 text-xs sm:text-sm">
                in
              </button>
              <button className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 text-xs sm:text-sm">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
