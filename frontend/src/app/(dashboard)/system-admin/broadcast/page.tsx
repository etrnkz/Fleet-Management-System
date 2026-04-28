'use client'

import { useState } from 'react'
import { systemAdminApi } from '@/lib/api'

const ROLES = ['User', 'DepartmentHead', 'CollegeHead', 'Dean', 'President', 'TransportOffice', 'DeploymentTeam', 'MaintenanceTeam', 'Driver', 'SystemAdmin']
const TYPES = ['info', 'warning', 'success', 'error', 'announcement']

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  announcement: 'bg-purple-100 text-purple-700',
}

const PRESET_MESSAGES = [
  { label: 'System Maintenance', title: 'Scheduled Maintenance', message: 'The system will undergo scheduled maintenance. Please save your work and log out before the maintenance window.' },
  { label: 'System Restored', title: 'System Restored', message: 'All systems are now fully operational. Thank you for your patience.' },
  { label: 'New Policy', title: 'Policy Update', message: 'A new fleet management policy has been published. Please review the updated guidelines.' },
  { label: 'Emergency', title: 'Emergency Notice', message: 'An emergency situation has been reported. Please follow the emergency protocols immediately.' },
]

export default function BroadcastPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAll: true,
    targetRoles: [] as string[],
    targetUsers: [] as string[],
  })
  const [userIds, setUserIds] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleRole = (role: string) => {
    setForm(p => ({
      ...p,
      targetRoles: p.targetRoles.includes(role)
        ? p.targetRoles.filter(r => r !== role)
        : [...p.targetRoles, role]
    }))
  }

  const applyPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setForm(p => ({ ...p, title: preset.title, message: preset.message }))
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSending(true)
    try {
      const payload: any = {
        title: form.title,
        message: form.message,
        type: form.type,
      }
      if (!form.targetAll) {
        if (form.targetRoles.length > 0) payload.targetRoles = form.targetRoles
        if (userIds.trim()) payload.targetUsers = userIds.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      }
      await systemAdminApi.broadcastNotification(payload)
      showToast('Notification broadcast successfully', 'success')
      setHistory(prev => [{
        ...payload,
        sentAt: new Date().toISOString(),
        recipients: form.targetAll ? 'All users' : form.targetRoles.length > 0 ? form.targetRoles.join(', ') : 'Specific users',
      }, ...prev.slice(0, 9)])
      setForm({ title: '', message: '', type: 'info', targetAll: true, targetRoles: [], targetUsers: [] })
      setUserIds('')
    } catch (err: any) {
      showToast(err.message || 'Failed to send notification', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-[#1B3D2F]' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">Broadcast Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Send system-wide notifications to users or specific roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Compose Notification</h3>

            {/* Presets */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_MESSAGES.map(p => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-[#1B3D2F]/10 hover:text-[#1B3D2F] transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required
                  placeholder="Notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required rows={4}
                  placeholder="Write your notification message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] focus:border-[#1B3D2F] outline-none text-sm resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({...p, type: t}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${form.type === t ? TYPE_COLORS[t] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.targetAll} onChange={() => setForm(p => ({...p, targetAll: true, targetRoles: []}))}
                      className="w-4 h-4 text-[#1B3D2F]" />
                    <span className="text-sm text-gray-700">All users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!form.targetAll} onChange={() => setForm(p => ({...p, targetAll: false}))}
                      className="w-4 h-4 text-[#1B3D2F]" />
                    <span className="text-sm text-gray-700">Specific roles or users</span>
                  </label>
                </div>

                {!form.targetAll && (
                  <div className="mt-3 space-y-3 pl-6">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Select Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map(role => (
                          <button key={role} type="button" onClick={() => toggleRole(role)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${form.targetRoles.includes(role) ? 'bg-[#1B3D2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Or specific User IDs (comma/newline separated)</label>
                      <textarea value={userIds} onChange={e => setUserIds(e.target.value)} rows={2}
                        placeholder="uuid1, uuid2, ..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-xs font-mono resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {(form.title || form.message) && (
                <div className={`rounded-lg border p-4 ${TYPE_COLORS[form.type]?.replace('text-', 'border-').replace('bg-', 'bg-') || 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">Preview</p>
                  <p className="text-sm font-semibold">{form.title || 'Untitled'}</p>
                  <p className="text-xs mt-1 opacity-80">{form.message || 'No message'}</p>
                </div>
              )}

              <button type="submit" disabled={sending || !form.title.trim() || !form.message.trim()}
                className="w-full py-3 bg-[#1B3D2F] text-white rounded-lg font-semibold text-sm hover:bg-[#152e22] disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  Send Notification</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Broadcasts</h3>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No broadcasts yet this session</div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{h.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[h.type] || 'bg-gray-100 text-gray-600'}`}>{h.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{h.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400">{h.recipients}</span>
                    <span className="text-[10px] text-gray-400">{new Date(h.sentAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
