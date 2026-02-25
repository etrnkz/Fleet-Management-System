'use client';

import { useState, useEffect } from 'react';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface DriverListProps {
  onDriverClick?: (driver: Driver) => void;
}

export const DriverList = ({ onDriverClick }: DriverListProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/drivers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading drivers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No drivers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              License Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {drivers.map((driver) => (
            <tr
              key={driver.id}
              onClick={() => onDriverClick?.(driver)}
              className={onDriverClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{driver.licenseNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{driver.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    driver.status
                  )}`}
                >
                  {driver.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
