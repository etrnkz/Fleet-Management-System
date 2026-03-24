"use client";

import { TripRequest } from "@/types";

interface TripRequestsTableProps {
  requests: TripRequest[];
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

export default function TripRequestsTable({ requests }: TripRequestsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">My Trip Requests</h2>
        <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
          See all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">REQUEST ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">DESTINATION</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">DATE</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">STATUS</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">DRIVER</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">VEHICLE</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{request.requestId}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{request.destination}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{request.date}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{request.driver || "--"}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{request.vehicle || "--"}</td>
                <td className="py-4 px-4 text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-700">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
