"use client";

import Link from "next/link";
import {
  Car,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Car className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">HUFMS</h1>
              <p className="text-xs text-gray-500">Fleet Management System</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Dean Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
              College Dean Portal
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Your
              <span className="text-teal-500"> College Fleet</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Approve trip requests, monitor your fleet, and escalate special
              requests to the President's Office — all from one dashboard.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold border-2 border-gray-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Visualization */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl transform hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Approve Requests</h3>
                    <p className="text-sm text-gray-600">Review and approve trip requests</p>
                  </div>
                  <CheckCircle className="text-teal-500" size={24} />
                </div>

                <div className="flex items-center gap-4 p-4 bg-teal-50/60 rounded-xl transform hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                    <Car className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Monitor Fleet</h3>
                    <p className="text-sm text-gray-600">Track vehicles and availability</p>
                  </div>
                  <CheckCircle className="text-teal-600" size={24} />
                </div>

                <div className="flex items-center gap-4 p-4 bg-teal-50/40 rounded-xl transform hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center">
                    <Star className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Special Requests</h3>
                    <p className="text-sm text-gray-600">Escalate to President's Office</p>
                  </div>
                  <CheckCircle className="text-teal-700" size={24} />
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-teal-500" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                  <p className="text-xs text-gray-600">Approval Rate</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-teal-500" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need as a College Dean
          </h2>
          <p className="text-xl text-gray-600">
            Powerful tools to manage your college's transportation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="text-teal-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Trip Approvals</h3>
            <p className="text-gray-600 leading-relaxed">
              Review and approve trip requests from faculty and staff. Set
              priorities and manage your college's transportation queue.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <Car className="text-teal-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fleet Visibility</h3>
            <p className="text-gray-600 leading-relaxed">
              Get real-time visibility into vehicle availability, fuel levels,
              and driver assignments across your entire fleet.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="text-teal-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Reports</h3>
            <p className="text-gray-600 leading-relaxed">
              Track usage patterns, approval rates, and fleet performance with
              detailed analytics tailored for college administration.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-teal-500 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-5xl font-bold mb-2">12</p>
              <p className="text-teal-100">Colleges Managed</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">48</p>
              <p className="text-teal-100">Vehicles Available</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">95%</p>
              <p className="text-teal-100">Approval Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">
                <Users className="inline" size={40} />
              </p>
              <p className="text-teal-100">Faculty Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-linear-to-r from-teal-500 to-teal-700 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Log in to your Dean account and start managing your college fleet today
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group"
          >
            Login to Your Account
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Car className="text-white" size={18} />
            </div>
            <span className="font-bold text-white">HUFMS</span>
          </div>
          <p className="text-sm">© 2024 Fleet Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
