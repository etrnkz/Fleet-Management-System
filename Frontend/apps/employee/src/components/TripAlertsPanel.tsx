"use client";

import { AlertCircle, CheckCircle, UserCheck, Star } from "lucide-react";
import { TripAlert } from "@/types";

const alertIcons = {
  delayed: AlertCircle,
  confirmed: CheckCircle,
  assigned: UserCheck,
  completed: Star,
};

const alertColors = {
  delayed: "bg-red-50 border-red-200",
  confirmed: "bg-teal-50 border-teal-200",
  assigned: "bg-blue-50 border-blue-200",
  completed: "bg-gray-50 border-gray-200",
};

interface TripAlertsPanelProps {
  alerts: TripAlert[];
}

export default function TripAlertsPanel({ alerts }: TripAlertsPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Trip Alerts</h2>
        <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded">NEW</span>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${alertColors[alert.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-teal-600 text-sm font-medium hover:text-teal-700">
        View All Notifications
      </button>
    </div>
  );
}
