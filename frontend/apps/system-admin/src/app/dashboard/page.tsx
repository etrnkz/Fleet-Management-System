'use client';

import { useEffect, useState } from 'react';
import { systemAdminApi } from '../../lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [tripStats, setTripStats] = useState<any>(null);
  const [vehicleStats, setVehicleStats] = useState<any>(null);
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewData, userStatsData, tripStatsData, vehicleStatsData, maintenanceStatsData, healthData] = await Promise.all([
          systemAdminApi.getSystemOverview(),
          systemAdminApi.getUserStatistics(),
          systemAdminApi.getTripStatistics(),
          systemAdminApi.getVehicleStatistics(),
          systemAdminApi.getMaintenanceStatistics(),
          systemAdminApi.getSystemHealth(),
        ]);

        setOverview(overviewData);
        setUserStats(userStatsData);
        setTripStats(tripStatsData);
        setVehicleStats(vehicleStatsData);
        setMaintenanceStats(maintenanceStatsData);
        setSystemHealth(healthData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-blue-600 hover:text-blue-800 mr-4">← Back</a>
              <h1 className="text-xl font-semibold text-gray-900">System Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* System Health Status */}
          <div className="mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${systemHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">{systemHealth?.status === 'healthy' ? 'System Healthy' : 'System Issues Detected'}</span>
                  <span className="ml-4 text-sm text-gray-500">
                    Uptime: {Math.floor((systemHealth?.uptime || 0) / 3600)}h {Math.floor(((systemHealth?.uptime || 0) % 3600) / 60)}m
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Memory: {systemHealth?.memory?.used}MB / {systemHealth?.memory?.total}MB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview?.users?.total || 0}</dd>
                      <dd className="text-sm text-green-600">{overview?.users?.active || 0} active</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🚗</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Vehicles</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview?.vehicles?.total || 0}</dd>
                      <dd className="text-sm text-green-600">{overview?.vehicles?.available || 0} available</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✈️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview?.trips?.total || 0}</dd>
                      <dd className="text-sm text-yellow-600">{overview?.trips?.pending || 0} pending</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🔧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Maintenance</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview?.maintenance?.total || 0}</dd>
                      <dd className="text-sm text-red-600">{overview?.maintenance?.pending || 0} pending</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
                <div className="space-y-3">
                  {userStats?.byRole?.map((stat: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{stat.role}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Statistics</h3>
                <div className="space-y-3">
                  {tripStats?.byState?.map((stat: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{stat.state}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vehicle Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Statistics</h3>
                <div className="space-y-3">
                  {vehicleStats?.byStatus?.map((stat: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{stat.status}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Maintenance Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Statistics</h3>
                <div className="space-y-3">
                  {maintenanceStats?.byStatus?.map((stat: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{stat.status}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="text-sm font-medium text-gray-900">${maintenanceStats?.costs?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Cost</span>
                      <span className="text-sm font-medium text-gray-900">${maintenanceStats?.costs?.average?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}