'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { userApi, getCurrentUser } from '../../lib/api'
import Toast from '../../components/Toast'

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

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Update backend
      await userApi.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      })
      
      // Update user state
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditMode(false)
                  loadProfile()
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Image */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-emerald-500">
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
                <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 bg-emerald-500 text-white p-3 rounded-full cursor-pointer hover:bg-emerald-600 shadow-lg">
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
            <h2 className="text-2xl font-bold text-gray-900 mt-4">{formData.name}</h2>
            <p className="text-gray-500">{user?.role}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-base text-gray-900 py-2">{formData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{formData.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{formData.employeeId || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Organization Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
              {editMode ? (
                <select
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="college">College</option>
                  <option value="administrative">Administrative Office</option>
                </select>
              ) : (
                <p className="text-base text-gray-900 py-2">{formData.organizationType || 'Not provided'}</p>
              )}
            </div>

            {formData.organizationType === 'college' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 py-2">{formData.college || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-base text-gray-900 py-2">{formData.department || 'Not provided'}</p>
                  )}
                </div>
              </>
            )}

            {formData.organizationType === 'administrative' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{formData.office || 'Not provided'}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
