'use client'

import { useEffect, useState } from 'react'
import { systemAdminApi } from '@/lib/api'

export default function ConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [maintenanceDuration, setMaintenanceDuration] = useState('')
  const [togglingMaintenance, setTogglingMaintenance] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [backups, setBackups] = useState<any[]>([])
  const [creatingBackup, setCreatingBackup] = useState(false)

  useEffect(() => {
    loadConfig()
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      const data = await systemAdminApi.listBackups()
      setBackups(Array.isArray(data) ? data : [])
    } catch { setBackups([]) }
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    try {
      await systemAdminApi.createBackup()
      showToast('Backup created successfully', 'success')
      loadBackups()
    } catch (err: any) {
      showToast(err.message || 'Failed to create backup', 'error')
    } finally { setCreatingBackup(false) }
  }

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await systemAdminApi.getSystemConfig()
      setConfig(data)
      setMaintenanceMode(data?.maintenanceMode?.enabled || false)
    } catch { setConfig(null) }
    finally { setLoading(false) }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await systemAdminApi.updateSystemConfig(config)
      showToast('System configuration saved', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to save configuration', 'error')
    } finally { setSaving(false) }
  }

  const handleToggleMaintenance = async () => {
    if (!maintenanceMode && !maintenanceReason.trim()) {
      showToast('Please provide a reason for maintenance mode', 'error')
      return
    }
    setTogglingMaintenance(true)
    try {
      if (!maintenanceMode) {
        await systemAdminApi.enableMaintenanceMode(maintenanceReason, maintenanceDuration ? Number(maintenanceDuration) : undefined)
        setMaintenanceMode(true)
        showToast('Maintenance mode enabled', 'success')
      } else {
        await systemAdminApi.disableMaintenanceMode()
        setMaintenanceMode(false)
        setMaintenanceReason('')
        setMaintenanceDuration('')
        showToast('Maintenance mode disabled', 'success')
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle maintenance mode', 'error')
    } finally { setTogglingMaintenance(false) }
  }

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.')
    setConfig((prev: any) => {
      const next = { ...prev }
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-[#1B3D2F]' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3D2F]">System Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system-wide settings and parameters</p>
      </div>

      {/* Maintenance Mode Card */}
      <div className={`rounded-xl border p-5 ${maintenanceMode ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg className={`w-5 h-5 ${maintenanceMode ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className={`text-base font-semibold ${maintenanceMode ? 'text-orange-800' : 'text-gray-900'}`}>
                Maintenance Mode {maintenanceMode && <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">ACTIVE</span>}
              </h3>
            </div>
            <p className="text-sm text-gray-500">When enabled, users will see a maintenance message and cannot access the system.</p>
            {!maintenanceMode && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
                  <input value={maintenanceReason} onChange={e => setMaintenanceReason(e.target.value)}
                    placeholder="e.g. Database upgrade"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Duration (minutes)</label>
                  <input type="number" value={maintenanceDuration} onChange={e => setMaintenanceDuration(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
                </div>
              </div>
            )}
          </div>
          <button onClick={handleToggleMaintenance} disabled={togglingMaintenance}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              maintenanceMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}>
            {togglingMaintenance ? '...' : maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Config Form */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1B3D2F]" />
        </div>
      ) : config ? (
        <form onSubmit={handleSave} className="space-y-5">
          {/* Trip Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Trip Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Timeout (hours)</label>
                <input type="number" value={config?.trips?.approvalTimeoutHours ?? 48}
                  onChange={e => updateConfig('trips.approvalTimeoutHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">Time before auto-rejection if not approved</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Passengers per Trip</label>
                <input type="number" value={config?.trips?.maxPassengers ?? 50}
                  onChange={e => updateConfig('trips.maxPassengers', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Advance Booking (hours)</label>
                <input type="number" value={config?.trips?.minAdvanceHours ?? 48}
                  onChange={e => updateConfig('trips.minAdvanceHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIP Trip Enabled</label>
                <select value={config?.trips?.vipEnabled ? 'true' : 'false'}
                  onChange={e => updateConfig('trips.vipEnabled', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                <select value={config?.notifications?.emailEnabled ? 'true' : 'false'}
                  onChange={e => updateConfig('notifications.emailEnabled', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notifications</label>
                <select value={config?.notifications?.smsEnabled ? 'true' : 'false'}
                  onChange={e => updateConfig('notifications.smsEnabled', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw Config (for advanced fields) */}
          {config && Object.keys(config).filter(k => !['trips','notifications','maintenanceMode'].includes(k)).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Additional Configuration</h3>
              <div className="space-y-3">
                {Object.entries(config).filter(([k]) => !['trips','notifications','maintenanceMode'].includes(k)).map(([key, value]) => (
                  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <label className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                      {typeof value === 'boolean' ? (
                        <select value={String(value)} onChange={e => updateConfig(key, e.target.value === 'true')}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none">
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : (
                        <input type={typeof value === 'number' ? 'number' : 'text'} value={value as any}
                          onChange={e => updateConfig(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                          className="w-48 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F] outline-none" />
                      )}
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg font-semibold text-sm hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Configuration'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          Failed to load configuration. The backend may not have config data yet.
        </div>
      )}

      {/* Backups Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">System Backups</h3>
            <p className="text-xs text-gray-500 mt-0.5">Create and manage system data backups</p>
          </div>
          <button onClick={handleCreateBackup} disabled={creatingBackup}
            className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
            {creatingBackup ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</> : <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Create Backup
            </>}
          </button>
        </div>
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            No backups found
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.filename || b.name || `Backup ${i + 1}`}</p>
                  <p className="text-xs text-gray-400">{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'} {b.size ? `· ${b.size}` : ''}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Available</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
