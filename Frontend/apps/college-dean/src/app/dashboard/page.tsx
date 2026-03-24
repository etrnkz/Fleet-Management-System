"use client";

import { useState, useRef, useEffect } from "react";
import {
  Package,
  Car,
  MapPin,
  Star,
  Bell,
  Send,
  LogOut,
  User,
  ChevronDown,
  X,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TripRequest {
  id: string;
  requester: string;
  destination: string;
  time: string;
  priority: "CRITICAL" | "REGULAR" | "HIGH";
  status: "Pending" | "Approved" | "Rejected";
}

const mockRequests: TripRequest[] = [
  {
    id: "#TR-2901",
    requester: "Prof. Julian Reed",
    destination: "North Campus Annex",
    time: "10:30 AM",
    priority: "CRITICAL",
    status: "Pending",
  },
  {
    id: "#TR-2895",
    requester: "Dr. Sarah Laine",
    destination: "Main Hospital Complex",
    time: "01:45 PM",
    priority: "REGULAR",
    status: "Approved",
  },
  {
    id: "#TR-2882",
    requester: "Engineering Dept.",
    destination: "Field Research Site A",
    time: "08:00 AM",
    priority: "HIGH",
    status: "Rejected",
  },
];

const defaultProfile = {
  name: "Dr. Alice Carter",
  title: "Academic Dean",
  email: "alice.carter@university.edu",
  phone: "+1 (555) 012-3456",
  department: "College of Engineering",
};

export default function DeanDashboard() {
  const router = useRouter();
  const [requests] = useState(mockRequests);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [editForm, setEditForm] = useState(defaultProfile);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Dean Dashboard</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">System Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Approve Requests
            </button>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2">
              <Send size={16} />
              Send Special Request
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900 leading-none">{profile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{profile.title}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setEditForm(profile); setShowProfileModal(true); setShowProfileMenu(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User size={16} className="text-gray-400" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Package className="text-orange-500" size={24} />
              </div>
              <span className="text-orange-500 text-sm font-semibold">+12%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-gray-900">24</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Car className="text-green-500" size={24} />
              </div>
              <span className="text-green-500 text-sm font-semibold">88%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Vehicles Available</p>
            <p className="text-3xl font-bold text-gray-900">42</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <MapPin className="text-blue-500" size={24} />
              </div>
              <span className="text-blue-500 text-sm font-semibold">18 active</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Vehicles On Route</p>
            <p className="text-3xl font-bold text-gray-900">15</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Star className="text-purple-500" size={24} />
              </div>
              <span className="text-purple-500 text-sm font-semibold">High priority</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Special Requests</p>
            <p className="text-3xl font-bold text-gray-900">08</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Trip Request Approval */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Trip Request Approval</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Requester</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Destination</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">{request.id}</td>
                      <td className="p-4 text-sm text-gray-700">{request.requester}</td>
                      <td className="p-4 text-sm text-gray-700">{request.destination}</td>
                      <td className="p-4 text-sm text-gray-700">{request.time}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.priority === "CRITICAL"
                              ? "bg-red-50 text-red-600"
                              : request.priority === "HIGH"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {request.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              request.status === "Pending"
                                ? "bg-orange-500"
                                : request.status === "Approved"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-700">{request.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Special Request Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Special Request Panel</h3>
              <p className="text-sm text-gray-500 mb-4">Direct escalation to President's Office</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">REQUEST TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. Presidential Visit Shuttle"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DESCRIPTION</label>
                  <textarea
                    placeholder="Explain the urgent requirement..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VEHICLE TYPE</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Executive Sedan</option>
                      <option>Van</option>
                      <option>Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PRIORITY</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                  <Send size={16} />
                  Send to President
                </button>
              </div>
            </div>

            {/* Fleet Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Fleet Status</h3>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Manage Fleet</button>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Van-772", driver: "Alex Moreno", status: "AVAILABLE", fuel: 75, color: "green" },
                  { name: "Bus-104", driver: "Sarah Jones", status: "ON ROUTE", fuel: 32, color: "blue" },
                  { name: "Sedan-40", driver: "Routine Maintenance", status: "SERVICE", fuel: 95, color: "orange" },
                ].map((v) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <div className={`p-2 bg-${v.color}-50 rounded-lg`}>
                      <Car className={`text-${v.color}-500`} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{v.name}</span>
                        <span className={`text-xs font-semibold text-${v.color}-600 bg-${v.color}-50 px-2 py-1 rounded`}>
                          {v.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {v.status === "SERVICE" ? `Status: ${v.driver}` : `Driver: ${v.driver}`}
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`bg-${v.color}-500 h-1.5 rounded-full`} style={{ width: `${v.fuel}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{v.fuel}% Fuel</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {editForm.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Camera size={14} className="text-white" />
                  </button>
                </div>
              </div>
              {([
                { label: "Full Name", key: "name", type: "text" },
                { label: "Title", key: "title", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Department", key: "department", type: "text" },
              ] as { label: string; key: keyof typeof editForm; type: string }[]).map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => { setProfile(editForm); setShowProfileModal(false); }} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
