'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userApi, getCurrentUser } from '@/lib/api'
import Toast from '@/components/Toast'
import { EmployeeShell } from '@/components/EmployeeShell'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', employeeId: '' })
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false, message: '', type: 'success',
  })

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])

  const loadProfile = useCallback(() => {
    const currentUser = getCurrentUser()
    const parsedData = (() => { try { return JSON.parse(localStorage.getItem('userData') || '{}') } catch { return {} } })()
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      employeeId: parsedData.employeeId || '',
    })
    setProfileImage(parsedData.profileImage || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) { router.push('/login'); return }
    setUser(currentUser)
    loadProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await userApi.updateProfile({ name: formData.name, phoneNumber: formData.phoneNumber })
      const fresh = await userApi.getProfile()
      setUser(fresh)
      localStorage.setItem('user', JSON.stringify(fresh))
      localStorage.setItem('userData', JSON.stringify({ ...formData, profileImage }))
      setEditMode(false)
      showToast('Profile updated successfully!', 'success')
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
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

  const headerActions = useMemo(() => !editMode ? (
    <button type="button" onClick={() => setEditMode(true)}
      className="px-4 py-2.5 bg-[#1B3D2F] text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#152e22]">
      Edit Profile
    </button>
  ) : (
    <div className="flex gap-2">
      <button type="button" onClick={() => { setEditMode(false); loadProfile() }}
        className="px-4 py-2.5 bg-[#eceef0] text-[#424845] text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#e0e3e5]">
        Cancel
      </button>
      <button type="button" onClick={handleSave} disabled={saving}
        className="px-4 py-2.5 bg-[#1B3D2F] text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#152e22] disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [editMode, saving])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
      </div>
    )
  }

  return (
    <EmployeeShell title="Personal Information" subtitle="Your account details" headerActions={headerActions}>
      {toast.show && (
        <Toast message={toast.message} type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Nav between the two pages */}
        <div className="flex gap-2">
          <span className="px-4 py-2 text-sm font-semibold text-[#1B3D2F] bg-[#1B3D2F]/10 rounded-lg border border-[#1B3D2F]/20">
            Personal Information
          </span>
          <Link href="/employee/change-password"
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-[#1B3D2F] hover:bg-gray-100 rounded-lg transition-colors">
            Change Password
          </Link>
        </div>

        {/* Avatar */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-[#eceef0] border-4 border-[#D1E1FF]">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              {editMode && (
                <label htmlFor="profileImageUpload"
                  className="absolute bottom-0 right-0 bg-[#1B3D2F] text-white p-3 rounded-lg cursor-pointer hover:bg-[#152e22] shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
              <input type="file" id="profileImageUpload" accept="image/*"
                onChange={handleImageUpload} className="hidden" disabled={!editMode} />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] mt-4 tracking-tight">{formData.name}</h2>
            <p className="text-sm text-[#424845] font-medium uppercase tracking-wide">{user?.role}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Full Name</label>
                {editMode ? (
                  <input type="text" value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Email</label>
                <p className="text-base text-gray-900 py-2">{formData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Phone Number</label>
                {editMode ? (
                  <input type="tel" value={formData.phoneNumber}
                    onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Employee ID</label>
                {editMode ? (
                  <input type="text" value={formData.employeeId}
                    onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.employeeId || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </EmployeeShell>
  )
}
