'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    organizationType: '',
    college: '',
    office: '',
    department: '',
  })
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadProfile()
  }, [])

  const loadProfile = () => {
    const currentUser = getCurrentUser()
    const userData = localStorage.getItem('userData')
    const parsedData = userData ? JSON.parse(userData) : {}
    
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      employeeId: parsedData.employeeId || '',
      organizationType: parsedData.organizationType || '',
      college: parsedData.college || '',
      office: parsedData.office || '',
      department: parsedData.department || '',
    })
    setProfileImage(parsedData.profileImage || null)
    setLoading(false)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('Please fill in all password fields', 'error'); return }
    if (newPassword === currentPassword) { showToast('New password must be different from your current password', 'error'); return }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) { showToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error'); return }
    try {
      setPwSaving(true)
      await userApi.changePassword({ currentPassword, newPassword })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error')
    } finally {
      setPwSaving(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Update backend
      await userApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      })
      
      // Fetch fresh user data from backend
      const freshUserData = await userApi.getProfile()
      setUser(freshUserData)
      localStorage.setItem('user', JSON.stringify(freshUserData))
      
      // Save extended profile data to localStorage
      const userData = {
        ...formData,
        profileImage,
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      
      setEditMode(false)
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1B3D2F] border-t-transparent" />
      </div>
    )
  }

  return (
    <EmployeeShell
      title="My Profile"
      subtitle="Official employee record (on file)"
      headerActions={
        !editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="px-4 py-2.5 bg-[#1B3D2F] text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#152e22]"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                loadProfile()
              }}
              className="px-4 py-2.5 bg-[#eceef0] text-[#424845] text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#e0e3e5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-[#1B3D2F] text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-[#1e4a6e] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )
      }
    >
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Image */}
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
                <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 bg-[#1B3D2F] text-white p-3 rounded-lg cursor-pointer hover:bg-[#152e22] shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
              <input
                type="file"
                id="profileImageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={!editMode}
              />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3D2F] mt-4 tracking-tight">{formData.name}</h2>
            <p className="text-sm text-[#424845] font-medium uppercase tracking-wide">{user?.role}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <h3 className="text-sm font-bold text-[#1B3D2F] uppercase tracking-wider mb-6">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                  />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-base text-gray-900 py-2">{formData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                  />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Employee ID</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                  />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.employeeId || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <h3 className="text-sm font-bold text-[#1B3D2F] uppercase tracking-wider mb-6">Organization Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Organization Type</label>
              {editMode ? (
                <select
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                >
                  <option value="">Select type</option>
                  <option value="college">College</option>
                  <option value="administrative">Administrative Office</option>
                </select>
              ) : (
                <p className="text-base text-[#191c1e] py-2">{formData.organizationType || 'Not provided'}</p>
              )}
            </div>

            {formData.organizationType === 'college' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">College</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                    />
                  ) : (
                    <p className="text-base text-[#191c1e] py-2">{formData.college || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Department</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                    />
                  ) : (
                    <p className="text-base text-[#191c1e] py-2">{formData.department || 'Not provided'}</p>
                  )}
                </div>
              </>
            )}

            {formData.organizationType === 'administrative' && (
              <div>
                <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Office</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                  />
                ) : (
                  <p className="text-base text-[#191c1e] py-2">{formData.office || 'Not provided'}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <h3 className="text-sm font-bold text-[#1B3D2F] uppercase tracking-wider mb-6">Change Password</h3>
          <div className="space-y-4 max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-10 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-10 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none"
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {pwForm.newPassword && (() => {
                const checks = { length: pwForm.newPassword.length >= 8, upper: /[A-Z]/.test(pwForm.newPassword), lower: /[a-z]/.test(pwForm.newPassword), number: /\d/.test(pwForm.newPassword), special: /[\W_]/.test(pwForm.newPassword) }
                const passed = Object.values(checks).filter(Boolean).length
                const s = passed <= 2 ? { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' } : passed === 3 ? { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' } : passed === 4 ? { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' } : { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
                return (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${s.color} ${s.width}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{s.label} - min 8 chars, uppercase, lowercase, number, special character</p>
                  </div>
                )
              })()}
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none ${pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword ? 'border-red-400 bg-red-50' : 'border-[#c1c8c4]'}`}
                />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && pwForm.newPassword && (
                <p className="text-xs text-green-600 mt-1">Passwords match</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={pwSaving}
              className="px-6 py-2.5 bg-[#1B3D2F] text-white text-sm font-semibold rounded-lg hover:bg-[#152e22] disabled:opacity-50 transition-colors"
            >
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

      </div>
    </EmployeeShell>
  )
}

