'use client'

import { useState } from 'react'
import Toast, { ToastType } from '@/components/Toast'

interface ToastMessage {
  message: string
  type: ToastType
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Fleet Management Co.',
    companyEmail: 'admin@fleetmanagement.com',
    companyPhone: '+251-911-234567',
    address: '123 Main Street, Addis Ababa',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    currency: 'ETB'
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceAlerts: true,
    fuelAlerts: true,
    documentExpiry: true,
    tripUpdates: false,
    weeklyReports: true
  })

  // User Management State
  const [users] = useState([
    { id: 1, name: 'John Admin', email: 'john@fleet.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Manager', email: 'sarah@fleet.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Mike Driver', email: 'mike@fleet.com', role: 'Driver', status: 'Active' },
    { id: 4, name: 'Lisa Supervisor', email: 'lisa@fleet.com', role: 'Supervisor', status: 'Inactive' }
  ])

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5'
  })

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('General settings saved successfully', 'success')
  }

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('Notification preferences updated', 'success')
  }

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('Security settings updated', 'success')
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'backup', name: 'Backup', icon: '💾' }
  ]

  return (
    <>
    <div className="p-3 sm:p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 pb-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your fleet management system configuration</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 p-1.5 sm:p-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">General Settings</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={generalSettings.companyName}
                        onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Company Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.companyEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, companyEmail: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.companyPhone}
                        onChange={(e) => setGeneralSettings({...generalSettings, companyPhone: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Timezone
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      >
                        <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Date Format
                      </label>
                      <select
                        value={generalSettings.dateFormat}
                        onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 md:col-span-1">
                      <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Currency
                      </label>
                      <select
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                      >
                        <option value="ETB">Ethiopian Birr (ETB)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Notification Preferences</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Notification Channels</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {[
                          { 
                            key: 'emailNotifications', 
                            label: 'Email Notifications', 
                            desc: 'Receive alerts via email',
                            options: ['All Emails', 'Critical Only', 'Daily Digest', 'Off']
                          },
                          { 
                            key: 'smsNotifications', 
                            label: 'SMS Notifications', 
                            desc: 'Receive alerts via SMS',
                            options: ['All SMS', 'Emergency Only', 'Off']
                          },
                          { 
                            key: 'pushNotifications', 
                            label: 'Push Notifications', 
                            desc: 'Receive browser push notifications',
                            options: ['All Notifications', 'Important Only', 'Off']
                          }
                        ].map((item) => (
                          <div key={item.key} className="relative group">
                            <div className="flex items-start justify-between p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors cursor-pointer">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                  onChange={(e) => setNotificationSettings({...notificationSettings, [item.key]: e.target.checked})}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-900 break-words">{item.label}</p>
                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                </div>
                              </div>
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Dropdown on hover - hidden on mobile, click to show options via toast */}
                            <div className="hidden sm:block absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="p-2">
                                {item.options.map((option, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => showToast(`${item.label} set to: ${option}`, 'success')}
                                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Alert Types</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {[
                          { 
                            key: 'maintenanceAlerts', 
                            label: 'Maintenance Alerts', 
                            desc: 'Vehicle maintenance reminders',
                            options: ['Instant', '1 Day Before', '3 Days Before', '1 Week Before', 'Off']
                          },
                          { 
                            key: 'fuelAlerts', 
                            label: 'Fuel Alerts', 
                            desc: 'Low fuel and consumption anomalies',
                            options: ['Real-time', 'Hourly Summary', 'Daily Summary', 'Off']
                          },
                          { 
                            key: 'documentExpiry', 
                            label: 'Document Expiry', 
                            desc: 'Insurance and license expiration',
                            options: ['30 Days Before', '15 Days Before', '7 Days Before', '1 Day Before', 'Off']
                          },
                          { 
                            key: 'tripUpdates', 
                            label: 'Trip Updates', 
                            desc: 'Real-time trip status updates',
                            options: ['All Updates', 'Start/End Only', 'Delays Only', 'Off']
                          },
                          { 
                            key: 'weeklyReports', 
                            label: 'Weekly Reports', 
                            desc: 'Automated weekly summary reports',
                            options: ['Every Monday', 'Every Friday', 'Custom Day', 'Off']
                          }
                        ].map((item) => (
                          <div key={item.key} className="relative group">
                            <div className="flex items-start justify-between p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors cursor-pointer">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                  onChange={(e) => setNotificationSettings({...notificationSettings, [item.key]: e.target.checked})}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-900 break-words">{item.label}</p>
                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                </div>
                              </div>
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Dropdown on hover - hidden on mobile */}
                            <div className="hidden sm:block absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="p-2">
                                {item.options.map((option, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => showToast(`${item.label} set to: ${option}`, 'success')}
                                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            )}

            {/* User Management */}
            {activeTab === 'users' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">User Management</h2>
                  <button
                    onClick={() => showToast('Add user feature coming soon', 'info')}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    + Add User
                  </button>
                </div>

                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-[11px] sm:text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                              <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-[11px] sm:text-xs md:text-sm text-gray-600 whitespace-nowrap">{user.email}</td>
                              <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                  user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                                <div className="flex gap-1.5 sm:gap-2">
                                  <button
                                    onClick={() => showToast(`Editing ${user.name}`, 'info')}
                                    className="text-emerald-600 hover:text-emerald-700 text-[10px] sm:text-xs md:text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => showToast(`Deleting ${user.name}`, 'warning')}
                                    className="text-red-600 hover:text-red-700 text-[10px] sm:text-xs md:text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Security Settings</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Add an extra layer of security to your account</p>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.passwordExpiry}
                          onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={securitySettings.loginAttempts}
                          onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: e.target.value})}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[11px] sm:text-xs md:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm"
                  >
                    Save Security Settings
                  </button>
                </div>
              </form>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Third-Party Integrations</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { name: 'Google Maps API', status: 'Connected', icon: '🗺️' },
                    { name: 'SMS Gateway', status: 'Not Connected', icon: '📱' },
                    { name: 'Payment Gateway', status: 'Connected', icon: '💳' },
                    { name: 'Email Service', status: 'Connected', icon: '📧' }
                  ].map((integration, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{integration.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{integration.name}</p>
                          <p className={`text-[10px] sm:text-xs ${integration.status === 'Connected' ? 'text-green-600' : 'text-gray-500'}`}>
                            {integration.status}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`${integration.name} configuration`, 'info')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap flex-shrink-0"
                      >
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backup */}
            {activeTab === 'backup' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Backup & Restore</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900">Last Backup</p>
                      <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5 sm:mt-1">March 6, 2026 at 2:30 AM</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => showToast('Creating backup...', 'info')}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Create Backup Now</span>
                  </button>
                  <button
                    onClick={() => showToast('Restore feature coming soon', 'info')}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Restore from Backup</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Automatic Backup Schedule</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="backup" defaultChecked className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">Daily at 2:00 AM</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="backup" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">Weekly on Sunday</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="backup" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">Monthly on 1st</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
