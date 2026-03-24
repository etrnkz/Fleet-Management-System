"use client";

import { useState } from "react";
import { Plus, Eye, MessageSquare } from "lucide-react";
import TripRequestModal from "./TripRequestModal";

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-gray-900">Request New Trip</span>
        </button>

        <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-gray-900">View My Trips</span>
        </button>

        <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-gray-900">Submit Feedback</span>
        </button>
      </div>
    </div>

    <TripRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
