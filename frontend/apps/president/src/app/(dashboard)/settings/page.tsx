'use client'

import { useState, useEffect } from 'react'
import { inviteApi } from '@/lib/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    approvalAlerts: true,
    weeklyReports: true,
    language: 'en',
    timezone: 'Africa/Addis_Ababa',
    theme: 'light',
    twoFactorAuth: false,
    sessionTimeout: '30',
    autoLogout: true
  })
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Invite state
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')
  const [inviteToast, setInviteToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const handleInvite = async () => {
    setInviting(true)
    setInviteResult(null)
    try {
      let result: any
      if (inviteMode === 'csv' && csvFile) {
        const fd = new FormData()
        fd.append('csvFile', csvFile)
        if (inviteMessage) fd.append('welcomeMessage', inviteMessage)
        result = await inviteApi.bulkInviteCsv(fd)
      } else {
        const emails = inviteEmails.split(/[\n,]+/).map((e) => e.trim()).filter((e) => e.includes('@'))
        if (emails.length === 0) { setInviteToast({ msg: 'Please enter at least one valid email', ok: false }); setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined })
      }
      setInviteResult(result)
      setInviteToast({ msg: result.message || 'Invitations sent!', ok: true })
      setInviteEmails('')
      setCsvFile(null)
    } catch (error: any) {
      setInviteToast({ msg: error.message || 'Failed to send invitations', ok: false })
    } finally {
      setInviting(false)
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('presidentSettings', JSON.stringify(settings))
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  useEffect(() => {
    const savedSettings = localStorage.getItem('presidentSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'system', name: 'System', icon: '💻' },
    { id: 'invite', name: 'Invite Employees', icon: '✉️' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-1 p-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      To update your personal information, please use the profile edit option from the user menu.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Enable Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Auto Logout on Inactivity</p>
                      <p className="text-sm text-gray-600 mt-1">Automatically log out after session timeout</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoLogout}
                        onChange={(e) => setSettings({...settings, autoLogout: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Current Session</p>
                          <p className="text-sm text-gray-600">Chrome on Windows • Addis Ababa, Ethiopia</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Email Notifications</p>
                      <p className="text-sm text-gray-600 mt-1">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Push Notifications</p>
                      <p className="text-sm text-gray-600 mt-1">Receive push notifications in browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Approval Alerts</p>
                      <p className="text-sm text-gray-600 mt-1">Get notified when approval is required</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.approvalAlerts}
                        onChange={(e) => setSettings({...settings, approvalAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Weekly Reports</p>
                      <p className="text-sm text-gray-600 mt-1">Receive weekly fleet summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={(e) => setSettings({...settings, weeklyReports: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Language & Region</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="en">English</option>
                      <option value="am">Amharic (አማርኛ)</option>
                      <option value="om">Oromo (Afaan Oromoo)</option>
                      <option value="ti">Tigrinya (ትግርኛ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Africa/Addis_Ababa">East Africa Time (EAT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4 max-w-md">
                      <button
                        onClick={() => setSettings({...settings, theme: 'light'})}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          settings.theme === 'light'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-white rounded mb-2 border border-gray-200"></div>
                        <p className="text-sm font-medium text-gray-800">Light</p>
                      </button>
                      <button
                        onClick={() => setSettings({...settings, theme: 'dark'})}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          settings.theme === 'dark'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-gray-800 rounded mb-2"></div>
                        <p className="text-sm font-medium text-gray-800">Dark</p>
                      </button>
                      <button
                        onClick={() => setSettings({...settings, theme: 'auto'})}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          settings.theme === 'auto'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                        <p className="text-sm font-medium text-gray-800">Auto</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invite Employees */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Invite Employees</h3>
                <p className="text-sm text-gray-600 mt-1">Invited employees receive an email with a temporary password and must complete their profile before making trip requests.</p>
              </div>
              {inviteToast && (
                <div className={`p-3 rounded-lg text-sm font-medium ${inviteToast.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {inviteToast.msg}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setInviteMode('email')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'email' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Paste Emails</button>
                <button onClick={() => setInviteMode('csv')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'csv' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Upload CSV</button>
              </div>
              {inviteMode === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses <span className="text-gray-400 font-normal">(comma or new line separated)</span></label>
                  <textarea value={inviteEmails} onChange={(e) => setInviteEmails(e.target.value)} rows={5} placeholder="john@university.edu, jane@university.edu" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSV File <span className="text-gray-400 font-normal">(must have an "email" column)</span></label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUploadPresident" />
                    <label htmlFor="csvUploadPresident" className="cursor-pointer">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      {csvFile ? <p className="text-sm font-medium text-purple-600">{csvFile.name}</p> : <p className="text-sm text-gray-500">Click to upload CSV</p>}
                    </label>
                  </div>
                  <a href="data:text/csv;charset=utf-8,email%0Ajohn.doe%40university.edu" download="invite_template.csv" className="text-xs text-purple-600 hover:underline mt-2 inline-block">Download CSV template</a>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} rows={3} placeholder="Welcome to the Fleet Management System!" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" />
              </div>
              <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2">
                {inviting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : <>✉️ Send Invitations</>}
              </button>
              {inviteResult && (
                <div className="space-y-3">
                  {inviteResult.invited.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-2">✓ {inviteResult.invited.length} invitation{inviteResult.invited.length !== 1 ? 's' : ''} sent</p>
                      <div className="flex flex-wrap gap-1">{inviteResult.invited.map((e) => <span key={e} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{e}</span>)}</div>
                    </div>
                  )}
                  {inviteResult.failed.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800 mb-2">✗ {inviteResult.failed.length} failed</p>
                      <div className="space-y-1">{inviteResult.failed.map((f) => <p key={f.email} className="text-xs text-red-700">{f.email}: {f.reason}</p>)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Application Version</span>
                    <span className="text-sm text-gray-600">v1.0.0</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <span className="text-sm text-gray-600">June 15, 2024</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Browser</span>
                    <span className="text-sm text-gray-600">Chrome 125.0</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Export Data</p>
                        <p className="text-sm text-gray-600 mt-1">Download your account data</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </button>

                  <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Clear Cache</p>
                        <p className="text-sm text-gray-600 mt-1">Clear application cache and temporary data</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-red-600">Danger Zone</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 border-2 border-red-300 rounded-lg hover:bg-red-50 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-600">Deactivate Account</p>
                        <p className="text-sm text-gray-600 mt-1">Temporarily disable your account</p>
                      </div>
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Fleet Management System for Haramaya University. Designed to streamline vehicle allocation, 
                    tracking, and management across all university departments.
                  </p>
                  <div className="mt-4 flex space-x-4 text-sm">
                    <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
                    <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
                    <a href="#" className="text-purple-600 hover:text-purple-700">Help Center</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-start space-x-3 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Settings Saved</h4>
              <p className="text-sm text-gray-600 mt-1">Your preferences have been updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
