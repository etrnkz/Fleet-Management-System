"use client";

import { useState } from "react";
import { Download, ChevronLeft, ChevronRight, FileText, MapPin, Car, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface HistoryTrip {
  id: string;
  requestId: string;
  destination: string;
  destinationDetail?: string;
  date: string;
  status: "Completed" | "Cancelled";
  timeline?: {
    completed?: { time: string; location: string };
    arrived?: string;
    dispatched?: string;
    driver?: { name: string; vehicle: string };
    approved?: string;
  };
  distance?: string;
  duration?: string;
  rating?: number;
}

const mockHistoryTrips: HistoryTrip[] = [
  {
    id: "1",
    requestId: "REQ-8821",
    destination: "City Center Office, Block C",
    date: "Oct 12, 2023",
    status: "Completed",
    timeline: {
      completed: { time: "Oct 12, 2:45 PM", location: "Dropped off at City Center Office" },
      arrived: "Oct 12, 2:15 PM",
      dispatched: "Oct 12, 1:45 PM",
      driver: { name: "Michael J.", vehicle: "Toyota Camry (KJC-442)" },
      approved: "Oct 12, 10:30 AM",
    },
    distance: "12.4 km",
    duration: "45 mins",
    rating: 5,
  },
  {
    id: "2",
    requestId: "REQ-8750",
    destination: "Regional Distribution Hub",
    date: "Oct 05, 2023",
    status: "Completed",
    distance: "8.2 km",
    duration: "30 mins",
    rating: 4,
  },
  {
    id: "3",
    requestId: "REQ-8612",
    destination: "International Airport Terminal 2",
    date: "Sep 28, 2023",
    status: "Cancelled",
  },
  {
    id: "4",
    requestId: "REQ-8590",
    destination: "Innovation Training Center",
    date: "Sep 15, 2023",
    status: "Completed",
    distance: "15.7 km",
    duration: "52 mins",
    rating: 5,
  },
  {
    id: "5",
    requestId: "REQ-8422",
    destination: "Executive Guest House",
    date: "Aug 22, 2023",
    status: "Completed",
    distance: "6.3 km",
    duration: "25 mins",
    rating: 4,
  },
];

const statusColors = {
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function TripHistoryPage() {
  const [selectedTrip, setSelectedTrip] = useState<HistoryTrip>(mockHistoryTrips[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalTrips = 24;
  const tripsPerPage = 5;

  return (
    <>
      <PageHeader title="Trip History" subtitle="View and manage your past travel records" />
      <div className="p-8">

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side - Trip History List */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Activity</h2>
            <p className="text-sm text-gray-500">View and manage your past travel records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500">
                    REQUEST ID
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500">
                    DESTINATION
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500">
                    DATE
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockHistoryTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedTrip.id === trip.id ? "bg-teal-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {selectedTrip.id === trip.id && (
                          <div className="w-1 h-12 bg-teal-500 rounded-r absolute left-0"></div>
                        )}
                        <span className="font-medium text-gray-900">{trip.requestId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{trip.destination}</td>
                    <td className="py-4 px-6 text-gray-600">{trip.date}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[trip.status]
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {tripsPerPage} of {totalTrips} trips
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Trip Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Trip Details</h2>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>

          {/* Request ID Badge */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-teal-50 rounded-lg">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">REQUEST ID</p>
              <p className="font-bold text-gray-900">{selectedTrip.requestId}</p>
            </div>
          </div>

          {/* Activity Timeline */}
          {selectedTrip.timeline && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {selectedTrip.timeline.completed && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Trip Completed</p>
                      <p className="text-sm text-gray-600">{selectedTrip.timeline.completed.time}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedTrip.timeline.completed.location}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTrip.timeline.arrived && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Arrived at Destination</p>
                      <p className="text-sm text-gray-600">{selectedTrip.timeline.arrived}</p>
                    </div>
                  </div>
                )}

                {selectedTrip.timeline.dispatched && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Driver Dispatched</p>
                      <p className="text-sm text-gray-600">{selectedTrip.timeline.dispatched}</p>
                      {selectedTrip.timeline.driver && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {selectedTrip.timeline.driver.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedTrip.timeline.driver.vehicle}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTrip.timeline.approved && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Request Approved</p>
                      <p className="text-sm text-gray-600">{selectedTrip.timeline.approved}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip Stats */}
          {selectedTrip.distance && selectedTrip.duration && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trip Distance</p>
                  <p className="text-xl font-bold text-gray-900">{selectedTrip.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trip Duration</p>
                  <p className="text-xl font-bold text-gray-900">{selectedTrip.duration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Rating */}
          {selectedTrip.rating && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Trip Rating</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < selectedTrip.rating! ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="fixed bottom-8 left-8 w-48 bg-teal-50 rounded-lg p-4 border border-teal-200">
        <p className="font-medium text-teal-900 mb-1">Need assistance?</p>
        <p className="text-sm text-teal-700 mb-3">
          Our support team is available 24/7 for travel emergencies.
        </p>
        <button className="w-full bg-teal-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-600">
          Get Help
        </button>
      </div>
    </div>
    </>
  );
}
