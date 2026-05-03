'use client'

import { useEffect, useState } from 'react'
import { systemAdminApi } from '@/lib/api'

// Matches the backend SystemAdminService.systemConfig shape exactly
interface SystemConfig {
  maintenanceMode: boolean
  maintenanceReason: string
  estimatedDuration: number
  maxTripAdvanceDays: number
  minTripAdvanceHours: number
  autoApprovalThreshold: number
  emailNotifications: boolean
  smsNotifications: boolean
}

const DEFAULT_CONFIG: SystemConfig = {
  maintenanceMode: false,
  maintenanceReason: '',
  estimatedDuration: 0,
  maxTripAdvanceDays: 30,
  minTripAdvanceHours: 48,
  autoApprovalThreshold: 1000,
  emailNotifications: true,
  smsNotifications: false,
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data: any = await systemAdminApi.getSystemConfig()
      if (data) {
        setConfig({ ...DEFAULT_CONFIG, ...data })
        setMaintenanceReason(data.maintenanceReason || '')
        setMaintenanceDuration(data.estimatedDuration ? String(data.estimatedDuration) : '')
      }
    } catch { }
    finally { setLoading(false) }
  }

  const loadBackups = async () => {
    try {
      const data: any = await systemAdminApi.listBackups()
      const list = data?.backups ?? (Array.isArray(data) ? data : [])
      setBackups(list)
    } catch { setBackups([]) }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Send only the flat fields the backend expects
      await systemAdminApi.updateSystemConfig({
        maxTripAdvanceDays: config.maxTripAdvanceDays,
        minTripAdvanceHours: config.minTripAdvanceHours,
        autoApprovalThreshold: config.autoApprovalThreshold,
        emailNotifications: config.emailNotifications,
        smsNotifications: config.smsNotifications,
      })
      showToast('Configuration saved successfully', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to save configuration', 'error')
    } finally { setSaving(false) }
  }

  const handleToggleMaintenance = async () => {
    if (!config.maintenanceMode && !maintenanceReason.trim()) {
      showToast('Please provide a reason for maintenance mode', 'error')
      return
    }
    setTogglingMaintenance(true)
    try {
      if (!config.maintenanceMode) {
        await systemAdminApi.enableMaintenanceMode(maintenanceReason, maintenanceDuration ? Number(maintenanceDuration) : undefined)
        setConfig(c => ({ ...c, maintenanceMode: true, maintenanceReason }))
        showToast('Maintenance mode enabled', 'success')
      } else {
        await systemAdminApi.disableMaintenanceMode()
        setConfig(c => ({ ...c, maintenanceMode: false, maintenanceReason: '' }))
        setMaintenanceReason('')
        setMaintenanceDuration('')
        showToast('Maintenance mode disabled', 'success')
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle maintenance mode', 'error')
    } finally { setTogglingMaintenance(false) }
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

      {/* Maintenance Mode */}
      <div className={`rounded-xl border p-5 ${config.maintenanceMode ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg className={`w-5 h-5 ${config.maintenanceMode ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className={`text-base font-semibold ${config.maintenanceMode ? 'text-orange-800' : 'text-gray-900'}`}>
                Maintenance Mode
                {config.maintenanceMode && <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">ACTIVE</span>}
              </h3>
            </div>
            <p className="text-sm text-gray-500">When enabled, users will see a maintenance message and cannot access the system.</p>
            {config.maintenanceMode && config.maintenanceReason && (
              <p className="text-sm text-orange-700 mt-1 font-medium">Reason: {config.maintenanceReason}</p>
            )}
            {!config.maintenanceMode && (
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
              config.maintenanceMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}>
            {togglingMaintenance ? '...' : config.maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Config Form */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1B3D2F]" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">

          {/* Trip Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Trip Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Advance Days</label>
                <input type="number" min={1} value={config.maxTripAdvanceDays}
                  onChange={e => setConfig(c => ({ ...c, maxTripAdvanceDays: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">How far in advance a trip can be booked</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Advance Hours</label>
                <input type="number" min={0} value={config.minTripAdvanceHours}
                  onChange={e => setConfig(c => ({ ...c, minTripAdvanceHours: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">Minimum hours before trip start to submit request</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Approval Threshold (ETB)</label>
                <input type="number" min={0} value={config.autoApprovalThreshold}
                  onChange={e => setConfig(c => ({ ...c, autoApprovalThreshold: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">Trips below this fuel cost may be auto-approved</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                <select value={config.emailNotifications ? 'true' : 'false'}
                  onChange={e => setConfig(c => ({ ...c, emailNotifications: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notifications</label>
                <select value={config.smsNotifications ? 'true' : 'false'}
                  onChange={e => setConfig(c => ({ ...c, smsNotifications: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F] outline-none text-sm">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[#1B3D2F] text-white rounded-lg font-semibold text-sm hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Backups */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">System Backups</h3>
            <p className="text-xs text-gray-500 mt-0.5">Create and manage system data backups</p>
          </div>
          <button onClick={handleCreateBackup} disabled={creatingBackup}
            className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] disabled:opacity-50 flex items-center gap-2">
            {creatingBackup
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              : <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Create Backup
                </>}
          </button>
        </div>
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">No backups found</div>
        ) : (
          <div className="space-y-2">
            {backups.map((b: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.filename || b.name || `Backup ${i + 1}`}</p>
                  <p className="text-xs text-gray-400">{b.createdAt ? new Date(b.createdAt).toLocaleString() : b.created || 'N/A'} {b.size ? `· ${b.size}` : ''}</p>
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
