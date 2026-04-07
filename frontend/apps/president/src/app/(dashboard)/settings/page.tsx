'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { userApi, getCurrentUser, authApi, inviteApi } from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' })

  // Invite state
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('User')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) { router.push('/login'); return }
    setUser(currentUser)
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
    })
    setProfileImage(currentUser.profileImage || null)
    setLoading(false)
  }, [])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ show: true, message, type })

  const handleSave = async () => {
    try {
      setSaving(true)
      await userApi.updateProfile({ name: formData.name, phoneNumber: formData.phoneNumber })
      const updatedUser = { ...user, name: formData.name, phoneNumber: formData.phoneNumber }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) { showToast('New passwords do not match', 'error'); return }
    if (passwordData.newPassword.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    try {
      setSavingPassword(true)
      await userApi.updateProfile({ password: passwordData.newPassword, currentPassword: passwordData.currentPassword })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfileImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.clear()
    router.push('/')
  }

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
        if (emails.length === 0) { showToast('Please enter at least one valid email', 'error'); setInviting(false); return }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined, role: inviteRole || undefined })
      }
      setInviteResult(result)
      showToast(result.message || 'Invitations sent!', 'success')
      setInviteEmails('')
      setCsvFile(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitations', 'error')
    } finally {
      setInviting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B3D2F]"></div></div>

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'account', label: 'Account' },
    { id: 'invite', label: 'Invite Employees' },
  ]

  return (
    <div className="space-y-6">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3D2F]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, password, and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-1 px-6 min-w-max">
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === id ? 'border-[#1B3D2F] text-[#1B3D2F]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#1B3D2F]">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#152e22] text-white text-2xl font-bold">
                        {(formData.name || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 bg-[#152e22] text-white p-2 rounded-full cursor-pointer hover:bg-[#1B3D2F] shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-5 max-w-md">
              <p className="text-sm text-gray-500">Update your password. You'll need your current password to confirm.</p>
              {[
                { label: 'Current Password', key: 'currentPassword', show: showCurrentPassword, toggle: () => setShowCurrentPassword(!showCurrentPassword) },
                { label: 'New Password', key: 'newPassword', show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={(passwordData as any)[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent outline-none" />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handlePasswordChange} disabled={savingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  {[['Email', formData.email], ['Role', user?.role], ['Status', 'Active']].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-sm text-gray-500">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sign out</p>
                      <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invite Employees</h3>
                <p className="text-sm text-gray-500 mt-1">Invited users receive an email with a temporary password.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setInviteMode('email')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'email' ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Paste Emails</button>
                <button onClick={() => setInviteMode('csv')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'csv' ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Upload CSV</button>
              </div>

              {inviteMode === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses <span className="text-gray-400 font-normal">(comma or new line separated)</span></label>
                  <textarea value={inviteEmails} onChange={(e) => setInviteEmails(e.target.value)} rows={5}
                    placeholder="john@university.edu, jane@university.edu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent font-mono text-sm" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSV File <span className="text-gray-400 font-normal">(must have an "email" column)</span></label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3D2F] transition-colors">
                    <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUpload" />
                    <label htmlFor="csvUpload" className="cursor-pointer">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      {csvFile ? <p className="text-sm font-medium text-[#1B3D2F]">{csvFile.name}</p> : <p className="text-sm text-gray-500">Click to upload CSV</p>}
                    </label>
                  </div>
                  <a href="data:text/csv;charset=utf-8,email%0Ajohn.doe%40university.edu" download="invite_template.csv" className="text-xs text-[#1B3D2F] hover:underline mt-2 inline-block">Download CSV template</a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role to Assign</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent text-sm">
                  <option value="User">Employee (User)</option>
                  <option value="DepartmentHead">Department Head</option>
                  <option value="CollegeHead">College Head</option>
                  <option value="DeploymentTeam">Deployment Team</option>
                  <option value="MaintenanceTeam">Maintenance Team</option>
                  <option value="Driver">Driver</option>
                  <option value="Gate">Gate / Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} rows={3}
                  placeholder="Welcome to the Fleet Management System!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-transparent text-sm" />
              </div>

              <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                className="px-6 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] disabled:opacity-50 font-medium flex items-center gap-2">
                {inviting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Send Invitations
                </>}
              </button>

              {inviteResult && (
                <div className="space-y-3">
                  {inviteResult.invited.length > 0 && (
                    <div className="bg-[#1B3D2F]/10 border border-[#1B3D2F]/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-[#1B3D2F] mb-2">✓ {inviteResult.invited.length} invitation{inviteResult.invited.length !== 1 ? 's' : ''} sent</p>
                      <div className="flex flex-wrap gap-1">{inviteResult.invited.map((e) => <span key={e} className="text-xs bg-[#1B3D2F]/15 text-[#1B3D2F] px-2 py-1 rounded">{e}</span>)}</div>
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
        </div>
      </div>
    </div>
  )
}
