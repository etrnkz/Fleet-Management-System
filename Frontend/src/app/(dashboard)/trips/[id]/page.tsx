'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Trip {
  id: string;
  driver: {
    id: string;
    name: string;
    phone: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
  };
  route: {
    origin: string;
    destination: string;
    distance: number;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
}

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/trips/${tripId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trip details');
        }
        
        const data = await response.json();
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading trip details...</div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error || 'Trip not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
        <p className="text-gray-600 mt-2">Trip ID: {trip.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Status</h2>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  trip.status
                )}`}
              >
                {trip.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Driver Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{trip.driver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{trip.driver.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Make & Model</p>
                <p className="text-gray-900 font-medium">
                  {trip.vehicle.make} {trip.vehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Plate</p>
                <p className="text-gray-900">{trip.vehicle.licensePlate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Route Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="text-gray-900 font-medium">{trip.route.origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="text-gray-900 font-medium">{trip.route.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-gray-900">{trip.route.distance} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Time Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="text-gray-900">
                  {new Date(trip.startTime).toLocaleString()}
                </p>
              </div>
              {trip.endTime && (
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="text-gray-900">
                    {new Date(trip.endTime).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Estimated Duration</p>
                <p className="text-gray-900">{trip.estimatedDuration} minutes</p>
              </div>
              {trip.actualDuration && (
                <div>
                  <p className="text-sm text-gray-500">Actual Duration</p>
                  <p className="text-gray-900">{trip.actualDuration} minutes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Route Map</h2>
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="mt-2 text-gray-500">Map integration coming soon</p>
              <p className="text-sm text-gray-400 mt-1">
                Route: {trip.route.origin} → {trip.route.destination}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
