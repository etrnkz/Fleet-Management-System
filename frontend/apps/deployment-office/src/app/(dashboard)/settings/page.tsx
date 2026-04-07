'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, userApi, inviteApi, notificationApi } from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [notifList, setNotifList] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ invited: string[]; failed: { email: string; reason: string }[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'csv'>('email')

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Change Password' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'invite', label: 'Invite Employees' },
  ]

  useEffect(() => { loadUser() }, [])

  useEffect(() => {
    if (activeTab === 'notifications') {
      setLoadingNotifs(true)
      notificationApi.getNotifications()
        .then((d: any) => setNotifList(Array.isArray(d) ? d : []))
        .catch(() => setNotifList([]))
        .finally(() => setLoadingNotifs(false))
    }
  }, [activeTab])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadUser = async () => {
    try {
      const u = await authApi.getCurrentUser()
      setUser(u)
      setFormData({ name: u?.name || '', email: u?.email || '', phoneNumber: u?.phoneNumber || '' })
      if (u?.profileImage) setProfileImage(u.profileImage)
    } catch (err: any) {
      if (err?.message?.includes('401') || err?.message?.includes('expired')) router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.updateProfile({ name: formData.name, phoneNumber: formData.phoneNumber })
      setUser((p: any) => ({ ...p, name: formData.name, phoneNumber: formData.phoneNumber }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) {
        storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), name: formData.name, phoneNumber: formData.phoneNumber }))
      }
      showToast('Profile updated successfully', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Min 8 characters', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await userApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      showToast('Password changed successfully', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const result = await userApi.uploadProfileImage(file) as any
      const url = result.profileImageUrl
      setProfileImage(url)
      setUser((p: any) => ({ ...p, profileImage: url }))
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      const stored = storage.getItem('user')
      if (stored) {
        storage.setItem('user', JSON.stringify({ ...JSON.parse(stored), profileImage: url }))
      }
      showToast('Profile picture updated', 'success')
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    router.push('/login')
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
        const emails = inviteEmails.split(/[\n,]+/).map((e: string) => e.trim()).filter((e: string) => e.includes('@'))
        if (emails.length === 0) {
          showToast('Enter at least one valid email', 'error')
          setInviting(false)
          return
        }
        result = await inviteApi.bulkInvite({ emails, welcomeMessage: inviteMessage || undefined })
      }
      setInviteResult(result)
      showToast(result.message || 'Invitations sent!', 'success')
      setInviteEmails('')
      setCsvFile(null)
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitations', 'error')
    } finally {
      setInviting(false)
    }
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DO'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-[#1B3D2F] text-[#1B3D2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1B3D2F] flex items-center justify-center border-4 border-white shadow-md">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">{initials}</span>
                    )}
                  </div>
                  <label htmlFor="profileImageInput"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-[#1B3D2F] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#152e22] shadow-lg border-2 border-white">
                    {uploadingImage ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                  <input id="profileImageInput" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name || 'Deployment Officer'}</p>
                  <p className="text-sm text-gray-500 mb-1">{user?.role || 'DeploymentTeam'}</p>
                  <label htmlFor="profileImageInput" className="inline-flex items-center gap-1.5 text-xs text-[#1B3D2F] font-medium cursor-pointer hover:underline">
                    {uploadingImage ? 'Uploading...' : 'Upload photo'}
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG max 5MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={formData.email} disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" value={formData.phoneNumber} onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="+251912345678"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sign out</p>
                    <p className="text-xs text-gray-400">Sign out of your account</p>
                  </div>
                  <button type="button" onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Sign out
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
                  <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
                  <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" required />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={savingPassword}
                  className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50">
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                {notifList.filter(n => !n.isRead).length > 0 && (
                  <button onClick={async () => {
                    await Promise.all(notifList.filter(n => !n.isRead).map(n => notificationApi.markAsRead(n.id).catch(() => {})))
                    setNotifList(prev => prev.map(n => ({ ...n, isRead: true })))
                    showToast('All marked as read', 'success')
                  }} className="text-xs text-[#1B3D2F] hover:underline font-medium">
                    Mark all as read
                  </button>
                )}
              </div>
              {loadingNotifs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1B3D2F] border-t-transparent" />
                </div>
              ) : notifList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No notifications</div>
              ) : (
                <div className="space-y-2">
                  {notifList.map(n => (
                    <div key={n.id} onClick={async () => {
                      if (!n.isRead) {
                        await notificationApi.markAsRead(n.id).catch(() => {})
                        setNotifList(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
                      }
                    }} className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-[#1B3D2F]/5 border-[#1B3D2F]/20 border-l-4 border-l-[#1B3D2F]' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{n.title || n.type}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.sentAt || n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 bg-[#1B3D2F] rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Invite Employees</h3>
                <p className="text-sm text-gray-500 mt-1">Invited employees receive an email with a temporary password and must complete their profile before making trip requests.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setInviteMode('email')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'email' ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Paste Emails</button>
                <button onClick={() => setInviteMode('csv')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inviteMode === 'csv' ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Upload CSV</button>
              </div>
              {inviteMode === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Addresses</label>
                  <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={5}
                    placeholder="john@university.edu, jane@university.edu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none font-mono text-sm" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CSV File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3D2F]/40 transition-colors">
                    <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" id="csvUpload" />
                    <label htmlFor="csvUpload" className="cursor-pointer">
                      {csvFile ? <p className="text-sm font-medium text-[#1B3D2F]">{csvFile.name}</p> : <p className="text-sm text-gray-500">Click to upload CSV</p>}
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Welcome Message (optional)</label>
                <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={3}
                  placeholder="Welcome to the Fleet Management System!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm" />
              </div>
              <button onClick={handleInvite} disabled={inviting || (inviteMode === 'email' ? !inviteEmails.trim() : !csvFile)}
                className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg text-sm font-semibold hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
                {inviting ? 'Sending...' : 'Send Invitations'}
              </button>
              {inviteResult && (
                <div className="space-y-3">
                  {inviteResult.invited.length > 0 && (
                    <div className="bg-[#1B3D2F]/5 border border-[#1B3D2F]/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-[#1B3D2F] mb-2">Sent to {inviteResult.invited.length} recipient(s)</p>
                      <div className="flex flex-wrap gap-1">
                        {inviteResult.invited.map(e => <span key={e} className="text-xs bg-[#1B3D2F]/10 text-[#1B3D2F] px-2 py-1 rounded">{e}</span>)}
                      </div>
                    </div>
                  )}
                  {inviteResult.failed.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800 mb-2">{inviteResult.failed.length} failed</p>
                      <div className="space-y-1">
                        {inviteResult.failed.map(f => <p key={f.email} className="text-xs text-red-700">{f.email}: {f.reason}</p>)}
                      </div>
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