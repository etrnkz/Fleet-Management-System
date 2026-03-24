"use client";

import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";

interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  department: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

export default function ProfileModal({ isOpen, profile, onClose, onSave }: ProfileModalProps) {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const initials = form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Camera size={14} className="text-white" />
              </button>
            </div>
          </div>

          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Title", key: "title", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Phone", key: "phone", type: "text" },
            { label: "Department", key: "department", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof Profile]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
