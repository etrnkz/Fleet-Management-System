'use client'

import { useState } from 'react'
import Link from 'next/link'
import { userApi } from '@/lib/api'
import Toast from '@/components/Toast'
import { EmployeeShell } from '@/components/EmployeeShell'

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false, message: '', type: 'success',
  })

  const strength = (pw: string) => {
    if (!pw) return null
    const n = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[\W_]/.test(pw)].filter(Boolean).length
    if (n <= 2) return { label: 'Weak', color: 'bg-red-500', w: 'w-1/4' }
    if (n === 3) return { label: 'Fair', color: 'bg-yellow-500', w: 'w-2/4' }
    if (n === 4) return { label: 'Good', color: 'bg-blue-500', w: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', w: 'w-full' }
  }

  const handleSubmit = async () => {
    if (!current || !next || !confirm) { setToast({ show: true, message: 'Fill in all fields', type: 'error' }); return }
    if (next === current) { setToast({ show: true, message: 'New password must be different', type: 'error' }); return }
    if (next !== confirm) { setToast({ show: true, message: 'Passwords do not match', type: 'error' }); return }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(next)) {
      setToast({ show: true, message: 'Min 8 chars with uppercase, lowercase, number & special character', type: 'error' }); return
    }
    try {
      setSaving(true)
      await userApi.changePassword({ currentPassword: current, newPassword: next })
      setCurrent(''); setNext(''); setConfirm('')
      setToast({ show: true, message: 'Password changed successfully', type: 'success' })
    } catch (e: any) {
      setToast({ show: true, message: e.message || 'Failed to change password', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const eye = (visible: boolean) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={visible
        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
    </svg>
  )

  const s = strength(next)

  return (
    <EmployeeShell title="Change Password" subtitle="Update your account password">
      {toast.show && (
        <Toast message={toast.message} type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Nav between the two pages */}
        <div className="flex gap-2">
          <Link href="/employee/profile"
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-[#1B3D2F] hover:bg-gray-100 rounded-lg transition-colors">
            Personal Information
          </Link>
          <span className="px-4 py-2 text-sm font-semibold text-[#1B3D2F] bg-[#1B3D2F]/10 rounded-lg border border-[#1B3D2F]/20">
            Change Password
          </span>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-8 border border-[#e0e3e5]/80 shadow-[40px_0_40px_-20px_rgba(4,30,24,0.04)]">
          <div className="max-w-md space-y-5">

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={current}
                  onChange={e => setCurrent(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-10 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {eye(showCurrent)}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">New Password</label>
              <div className="relative">
                <input type={showNext ? 'text' : 'password'} value={next}
                  onChange={e => setNext(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-10 border border-[#c1c8c4] rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none" />
                <button type="button" onClick={() => setShowNext(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {eye(showNext)}
                </button>
              </div>
              {next && s && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${s.color} ${s.w}`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#424845] uppercase tracking-wide mb-2">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none ${
                    confirm && next !== confirm ? 'border-red-400 bg-red-50' : 'border-[#c1c8c4]'
                  }`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {eye(showConfirm)}
                </button>
              </div>
              {confirm && next !== confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              {confirm && next === confirm && next && <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>}
            </div>

            <button type="button" onClick={handleSubmit} disabled={saving}
              className="px-6 py-2.5 bg-[#1B3D2F] text-white text-sm font-semibold rounded-lg hover:bg-[#152e22] disabled:opacity-50 transition-colors">
              {saving ? 'Updating…' : 'Update Password'}
            </button>

          </div>
        </div>

      </div>
    </EmployeeShell>
  )
}
