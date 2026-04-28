'use client'

import { useEffect, useState } from 'react'
import { systemAdminApi } from '@/lib/api'

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [tripStats, setTripStats] = useState<any>(null)
  const [vehicleStats, setVehicleStats] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [ov, us, ts, vs, h] = await Promise.all([
        systemAdminApi.getSystemOverview().catch(() => null),
        systemAdminApi.getUserStatistics().catch(() => null),
        systemAdminApi.getTripStatistics().catch(() => null),
        systemAdminApi.getVehicleStatistics().catch(() => null),
        systemAdminApi.getSystemHealth().catch(() => null),
      ])
      setOverview(ov)
      setUserStats(us)
      setTripStats(ts)
      setVehicleStats(vs)
      setHealth(h)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F]" />
      </div>
    )
  }

  const isHealthy = health?.status === 'healthy'
  const uptimeH = Math.floor((health?.uptime || 0) / 3600)
  const uptimeM = Math.floor(((health?.uptime || 0) % 3600) / 60)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 30 seconds</p>
        </div>
        <button onClick={load} className="p-2 text-gray-500 hover:text-[#1B3D2F] hover:bg-gray-100 rounded-lg transition-colors" title="Refresh now">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* System Health Banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-4 ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
            {isHealthy ? 'All systems operational' : 'System issues detected'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Uptime: {uptimeH}h {uptimeM}m
            {health?.memory && ` · Memory: ${health.memory.used}MB / ${health.memory.total}MB`}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isHealthy ? 'HEALTHY' : 'DEGRADED'}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: overview?.users?.total ?? 0, sub: `${overview?.users?.active ?? 0} active`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Vehicles', value: overview?.vehicles?.total ?? 0, sub: `${overview?.vehicles?.available ?? 0} available`, color: 'text-[#1B3D2F]', bg: 'bg-[#1B3D2F]/10' },
          { label: 'Total Trips', value: overview?.trips?.total ?? 0, sub: `${overview?.trips?.pending ?? 0} pending`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Maintenance', value: overview?.maintenance?.total ?? 0, sub: `${overview?.maintenance?.pending ?? 0} pending`, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {userStats?.byRole?.length > 0 ? (() => {
              const max = Math.max(...userStats.byRole.map((s: any) => s.count), 1)
              return userStats.byRole.map((s: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.role}</span>
                    <span className="text-xs font-bold text-[#1B3D2F]">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#1B3D2F]" style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                </div>
              ))
            })() : <p className="text-sm text-gray-400">No data</p>}
          </div>
        </div>

        {/* Trips by State */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Trips by State</h3>
          <div className="space-y-3">
            {tripStats?.byState?.length > 0 ? (() => {
              const max = Math.max(...tripStats.byState.map((s: any) => s.count), 1)
              const colors: Record<string, string> = { COMPLETED: 'bg-green-500', IN_PROGRESS: 'bg-blue-500', REJECTED: 'bg-red-500', CANCELLED: 'bg-gray-400' }
              return tripStats.byState.map((s: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.state?.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-[#1B3D2F]">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${colors[s.state] || 'bg-purple-500'}`} style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                </div>
              ))
            })() : <p className="text-sm text-gray-400">No data</p>}
          </div>
        </div>

        {/* Vehicles by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Vehicles by Status</h3>
          <div className="space-y-3">
            {vehicleStats?.byStatus?.length > 0 ? (() => {
              const max = Math.max(...vehicleStats.byStatus.map((s: any) => s.count), 1)
              const colors: Record<string, string> = { Active: 'bg-green-500', Maintenance: 'bg-orange-500', Inactive: 'bg-gray-400' }
              return vehicleStats.byStatus.map((s: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.status}</span>
                    <span className="text-xs font-bold text-[#1B3D2F]">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${colors[s.status] || 'bg-[#1B3D2F]'}`} style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                </div>
              ))
            })() : <p className="text-sm text-gray-400">No data</p>}
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      {health?.memory && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Server Memory Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Used: {health.memory.used}MB</span>
              <span>Total: {health.memory.total}MB</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              {(() => {
                const pct = Math.round((health.memory.used / health.memory.total) * 100)
                return (
                  <div className={`h-3 rounded-full transition-all ${pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-yellow-500' : 'bg-[#1B3D2F]'}`}
                    style={{ width: `${pct}%` }}>
                  </div>
                )
              })()}
            </div>
            <p className="text-xs text-gray-400">
              {Math.round((health.memory.used / health.memory.total) * 100)}% used
              {health.memory.free && ` · ${health.memory.free}MB free`}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Manage Users', href: '/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Audit Logs', href: '/audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Broadcast', href: '/broadcast', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
            { label: 'System Config', href: '/config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map(({ label, href, icon }) => (
            <a key={label} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#1B3D2F] hover:bg-[#1B3D2F]/5 transition-colors text-center">
              <svg className="w-6 h-6 text-[#1B3D2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
              </svg>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
