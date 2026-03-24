"use client";

import { Truck, MapPin, History, MessageSquare, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import TripRequestModal from "./TripRequestModal";

const menuItems = [
  { icon: Truck, label: "Dashboard", href: "/dashboard" },
  { icon: MapPin, label: "Request Trip", href: "#", isModal: true },
  { icon: History, label: "My Trips", href: "/my-trips" },
  { icon: History, label: "Trip History", href: "/trip-history" },
  { icon: MessageSquare, label: "Feedback", href: "/feedback" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.isModal) {
      setIsModalOpen(true);
    }
  };

  const handleLogout = () => {
    // Clear any session/auth data here if needed
    // For now, just redirect to landing page
    router.push("/");
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">HUFMS</h1>
              <p className="text-xs text-gray-500">EMPLOYEE PORTAL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.isModal) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors w-full text-left",
                    "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                  isActive
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">ACCOUNT</p>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-700 hover:bg-gray-100"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <TripRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
