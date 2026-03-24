"use client";

import { useState } from "react";
import TripAlertsPanel from "@/components/TripAlertsPanel";
import PageHeader from "@/components/PageHeader";
import { TripAlert } from "@/types";
import { TrendingUp, Calendar, CheckCircle2, Clock } from "lucide-react";

const mockAlerts: TripAlert[] = [
  {
    id: "1",
    type: "delayed",
    title: "Trip Delayed",
    message: "Request #REQ-8245 driver is running 15 mins late due to traffic.",
    time: "2 MINS AGO",
  },
  {
    id: "2",
    type: "confirmed",
    title: "Trip Confirmed",
    message: "Your trip request for Oct 25 to Airport has been approved.",
    time: "1 HOUR AGO",
  },
  {
    id: "3",
    type: "assigned",
    title: "Driver Assigned",
    message: "Michael Ross has been assigned to your downtown trip.",
    time: "YESTERDAY",
  },
  {
    id: "4",
    type: "completed",
    title: "Trip Completed",
    message: "How was your trip with Sarah Connor? Leave a rating.",
    time: "OCT 18",
  },
];

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview" />
      <div className="p-4 md:p-8">
        {/* Period Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedPeriod("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedPeriod === "week"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedPeriod === "month"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod("year")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedPeriod === "year"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            This Year
          </button>
        </div>

        {/* Statistics Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Status Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">My Trip Status</h3>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 group-hover:text-yellow-600 transition-colors">
                    Pending
                  </span>
                  <span className="text-sm font-medium group-hover:scale-110 transition-transform inline-block">
                    1
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500 ease-out hover:bg-yellow-600"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">
                    Approved
                  </span>
                  <span className="text-sm font-medium group-hover:scale-110 transition-transform inline-block">
                    1
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out hover:bg-green-600"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    Completed
                  </span>
                  <span className="text-sm font-medium group-hover:scale-110 transition-transform inline-block">
                    3
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out hover:bg-blue-600"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trip Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Statistics</h3>
              <Calendar className="text-purple-500" size={24} />
            </div>
            <div className="space-y-4">
              <div className="group cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-all duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-500" size={20} />
                    <span className="text-sm text-gray-600">Total Requests</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                    5
                  </span>
                </div>
              </div>
              <div className="group cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-all duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-sm text-gray-600">Approved Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                    80%
                  </span>
                </div>
              </div>
              <div className="group cursor-pointer p-3 rounded-lg hover:bg-purple-50 transition-all duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-purple-500" size={20} />
                    <span className="text-sm text-gray-600">This {selectedPeriod}</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                    {selectedPeriod === "week" ? "1" : selectedPeriod === "month" ? "2" : "15"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Alerts */}
          <div className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <TripAlertsPanel alerts={mockAlerts} />
          </div>
        </div>
      </div>
    </>
  );
}
