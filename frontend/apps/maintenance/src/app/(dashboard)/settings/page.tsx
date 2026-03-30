'use client'
import { getCurrentUser } from '@/lib/api'

export default function SettingsPage() {
  const user = getCurrentUser()
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          {[['Name', user?.name], ['Email', user?.email], ['Role', user?.role], ['Phone', user?.phoneNumber]].map(([k, v]) => (
            <div key={k as string} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-800">{v || 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-2">System</h2>
        <p className="text-sm text-gray-500">API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}</p>
        <p className="text-sm text-gray-500 mt-1">App: Maintenance Portal v1.0</p>
      </div>
    </div>
  )
}
