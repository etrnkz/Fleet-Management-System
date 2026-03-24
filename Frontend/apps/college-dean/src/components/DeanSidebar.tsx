"use client";

import { LayoutDashboard, FileText, Car, Star, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DeanSidebarProps {
  profile?: { name: string; title: string };
  onEditProfile?: () => void;
}

export default function DeanSidebar({ profile, onEditProfile }: DeanSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = profile?.name ?? "Dr. Alice Carter";
  const displayTitle = profile?.title ?? "Academic Dean";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Trip Requests", href: "/trip-requests" },
    { icon: Car, label: "Vehicle Fleet", href: "/vehicle-fleet" },
    { icon: Star, label: "Special Requests", href: "/special-requests" },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <Car className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">HUFMS</h1>
            <p className="text-xs text-gray-500">College Dean</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-600"
                    : "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            SYSTEM
          </p>
          <Link
            href="/settings"
            className={
              pathname === "/settings"
                ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-600"
                : "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
            }
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-teal-50 transition-colors group"
        >
          <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayTitle}</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-teal-500 transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
