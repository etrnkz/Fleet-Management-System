"use client";

import { useState } from "react";
import { Camera, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@company.com",
    phone: "+1 (555) 123-4567",
    department: "Product Design",
    location: "New York, NY",
    employeeId: "EMP-8821",
    joinDate: "January 15, 2022",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
    console.log("Profile updated:", formData);
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account information" />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.name}</h2>
                  <p className="text-gray-600 mb-2">{formData.department}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {formData.employeeId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formData.joinDate}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{formData.location}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{formData.department}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{formData.employeeId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Trip Statistics</h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-600 mb-2">128</p>
                <p className="text-sm text-gray-600">Total Trips</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">2</p>
                <p className="text-sm text-gray-600">Active Trips</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 mb-2">5</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
