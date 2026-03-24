"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips, requests or vehicles..."
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="text-right">
              <p className="font-medium text-gray-900">Alex Johnson</p>
              <p className="text-sm text-gray-500">Product Designer</p>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </Link>
        </div>
      </div>
    </header>
  );
}
