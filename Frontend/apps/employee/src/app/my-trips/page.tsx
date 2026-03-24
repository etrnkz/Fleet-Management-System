"use client";

import { useState } from "react";
import { ChevronRight, Phone, MapPin, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Trip {
  id: string;
  requestId: string;
  destination: string;
  date: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  driver?: {
    name: string;
    phone: string;
    rating: number;
    reviews: number;
  };
  vehicle?: {
    model: string;
    plate: string;
    color: string;
  };
  timeline?: {
    requested: string;
    approved: string;
    driverAssigned: string;
    started?: string;
  };
}

const mockTrips: Trip[] = [
  {
    id: "1",
    requestId: "TRP-8821",
    destination: "New York, NY",
    date: "Oct 24, 2023",
    status: "Confirmed",
    driver: {
      name: "Robert Jackson",
      phone: "+1 (124) 1234",
      rating: 4.9,
      reviews: 124,
    },
    vehicle: {
      model: "Tesla Model S",
      plate: "NYC-4492",
      color: "Black Sedan",
    },
    timeline: {
      requested: "Oct 20, 10:45 AM",
      approved: "Oct 21, 02:15 PM",
      driverAssigned: "In Progress",
    },
  },
  {
    id: "2",
    requestId: "TRP-9012",
    destination: "London, UK",
    date: "Nov 12, 2023",
    status: "Pending",
  },
  {
    id: "3",
    requestId: "TRP-7723",
    destination: "San Francisco, CA",
    date: "Oct 15, 2023",
    status: "Completed",
  },
  {
    id: "4",
    requestId: "TRP-6610",
    destination: "Chicago, IL",
    date: "Sep 28, 2023",
    status: "Cancelled",
  },
];

const statusColors = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function MyTripsPage() {
  const [activeFilter, setActiveFilter] = useState("All Trips");
  const [selectedTrip, setSelectedTrip] = useState<Trip>(mockTrips[0]);

  const filters = ["All Trips", "Upcoming", "Completed", "Cancelled"];
  const activeCount = mockTrips.filter(t => t.status === "Confirmed").length;

  return (
    <>
      <PageHeader title="My Trips" subtitle="Manage your active and upcoming trips" />
      <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-teal-500 text-white text-sm px-3 py-1 rounded-full">
            {activeCount} ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side - Trips List */}
        <div className="col-span-2 bg-white rounded-lg border border-gray-200">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex gap-6">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                    activeFilter === filter
                      ? "text-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {filter}
                  {activeFilter === filter && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
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
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {mockTrips.map((trip) => (
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
                    <td className="py-4 px-6">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Trip Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Trip Details</h2>
            <span className="text-sm text-gray-500">{selectedTrip.requestId}</span>
          </div>

          {/* Timeline */}
          {selectedTrip.timeline && (
            <div className="mb-6">
              <div className="space-y-4">
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
                    <p className="font-medium text-gray-900">Requested</p>
                    <p className="text-sm text-gray-500">{selectedTrip.timeline.requested}</p>
                  </div>
                </div>

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
                    <p className="font-medium text-gray-900">Approved</p>
                    <p className="text-sm text-gray-500">{selectedTrip.timeline.approved}</p>
                  </div>
                </div>

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
                    <p className="font-medium text-gray-900">Driver Assigned</p>
                    <p className="text-sm text-teal-600">{selectedTrip.timeline.driverAssigned}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-400">Trip Started</p>
                    <p className="text-sm text-gray-400">Scheduled for Oct 24</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Driver & Vehicle Info */}
          {selectedTrip.driver && selectedTrip.vehicle && (
            <>
              <div className="border-t border-gray-200 pt-6 mb-6">
                <p className="text-xs font-medium text-gray-500 mb-4">DRIVER & VEHICLE</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedTrip.driver.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">
                          {selectedTrip.driver.rating} ({selectedTrip.driver.reviews} trips)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center hover:bg-teal-100">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{selectedTrip.vehicle.color}</p>
                      <p className="font-medium text-gray-900">{selectedTrip.vehicle.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Plate</p>
                      <p className="font-medium text-gray-900">{selectedTrip.vehicle.plate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="mb-6">
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                    Route Preview
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Modify Trip
            </button>
            <button className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
              Cancel Request
            </button>
          </div>
        </div>
      </div>

      {/* Help Section in Sidebar */}
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
