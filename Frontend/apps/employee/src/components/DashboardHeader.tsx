"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, Plus, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import TripRequestModal from "./TripRequestModal";

interface TripAlert {
  id: string;
  type: "delayed" | "confirmed" | "assigned" | "completed";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const mockAlerts: TripAlert[] = [
  {
    id: "1",
    type: "delayed",
    title: "Trip Delayed",
    message: "Request #REQ-8245 driver is running 15 mins late due to traffic.",
    time: "2 MINS AGO",
    isRead: false,
  },
  {
    id: "2",
    type: "confirmed",
    title: "Trip Confirmed",
    message: "Your trip request for Oct 25 to Airport has been approved.",
    time: "1 HOUR AGO",
    isRead: false,
  },
  {
    id: "3",
    type: "assigned",
    title: "Driver Assigned",
    message: "Michael Ross has been assigned to your downtown trip.",
    time: "YESTERDAY",
    isRead: true,
  },
  {
    id: "4",
    type: "completed",
    title: "Trip Completed",
    message: "How was your trip with Sarah Connor? Leave a rating.",
    time: "OCT 18",
    isRead: true,
  },
];

export default function DashboardHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "delayed":
        return <Clock className="text-yellow-500" size={20} />;
      case "confirmed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "assigned":
        return <AlertCircle className="text-blue-500" size={20} />;
      case "completed":
        return <CheckCircle className="text-purple-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Overview</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips, requests or vehicles..."
                className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Request Trip
            </button>

            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => markAsRead(alert.id)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !alert.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="shrink-0 mt-1">
                              {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900">
                                  {alert.title}
                                </h4>
                                {!alert.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {alert.message}
                              </p>
                              <p className="text-xs text-gray-400">{alert.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">Alex Johnson</p>
                <p className="text-sm text-gray-500">Product Designer</p>
              </div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <TripRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
