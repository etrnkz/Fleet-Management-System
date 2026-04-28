// Unified API client — all roles
import { logout } from './logout'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    null
  )
}

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem('user') || sessionStorage.getItem('user')
  return s ? JSON.parse(s) : null
}

let _refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
      storage.setItem('accessToken', data.access_token)
      storage.setItem('access_token', data.access_token)
      if (data.refresh_token) storage.setItem('refreshToken', data.refresh_token)
      // Sync cookie for middleware
      document.cookie = `accessToken=${data.access_token}; path=/; SameSite=Lax; max-age=${60 * 60 * 7}`
      // Also update server-side cookie
      fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.access_token, user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'), rememberMe: !!localStorage.getItem('accessToken') }),
      }).catch(() => {})
      return true
    } catch {
      return false
    } finally {
      _refreshPromise = null
    }
  })()
  return _refreshPromise
}

function clearSession() {
  ;['accessToken', 'access_token', 'refreshToken', 'user'].forEach(k => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
  document.cookie = 'accessToken=; path=/; max-age=0'
  document.cookie = 'user=; path=/; max-age=0'
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetch<T>(endpoint, options, false)
    // Refresh token expired — auto logout and redirect to login
    await logout()
    throw new Error('Session expired.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, keepMeSignedIn = false) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, keepMeSignedIn }),
    }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getCurrentUser: () => apiFetch('/users/me'),
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export const tripApi = {
  getAll: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/trips${q}`)
  },
  getAllTrips: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/trips${q}`)
  },
  getById: (id: string) => apiFetch(`/trips/${id}`),
  create: (data: any) => apiFetch('/trips', { method: 'POST', body: JSON.stringify(data) }),
  submit: (id: string) => apiFetch(`/trips/${id}/submit`, { method: 'POST' }),
  approve: (id: string, comments?: string) =>
    apiFetch(`/trips/${id}/approve`, { method: 'POST', body: JSON.stringify({ comments }) }),
  reject: (id: string, reason: string) =>
    apiFetch(`/trips/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  cancel: (id: string) => apiFetch(`/trips/${id}/cancel`, { method: 'POST' }),
  allocate: (id: string, data: any) =>
    apiFetch(`/trips/${id}/allocate`, { method: 'POST', body: JSON.stringify(data) }),
  assignVehicleAndDriver: (tripId: string, vehicleId: string, driverId: string, estimatedFuelCost = 0, estimatedDistance = 0) =>
    apiFetch(`/trips/${tripId}/allocate`, { method: 'POST', body: JSON.stringify({ vehicleId, driverId, estimatedFuelCost, estimatedDistance }) }),
  confirmTransport: (id: string, data: any) =>
    apiFetch(`/trips/${id}/confirm-transport`, { method: 'POST', body: JSON.stringify(data) }),
  rejectTransport: (id: string, data: { reason: string }) =>
    apiFetch(`/trips/${id}/reject-transport`, { method: 'POST', body: JSON.stringify(data) }),
  rejectAssignment: (id: string, data: { reason: string }) =>
    apiFetch(`/trips/${id}/driver-reject`, { method: 'POST', body: JSON.stringify(data) }),
  complete: (id: string, data: any) =>
    apiFetch(`/trips/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  completeTrip: (id: string, data: any) =>
    apiFetch(`/trips/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  deleteDraft: (id: string) => apiFetch(`/trips/${id}`, { method: 'DELETE' }),
  feedback: (id: string, data: any) =>
    apiFetch(`/trips/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  submitFeedback: (id: string, data: any) =>
    apiFetch(`/trips/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  getFeedback: (id: string) => apiFetch(`/trips/${id}/feedback`),
  getFeedbackStatistics: () => apiFetch('/trips/feedback/statistics'),
  getStatistics: () => apiFetch('/trips/statistics'),
  getPendingApprovals: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(Object.entries({ ...params, status: 'PENDING_APPROVAL' }).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))
    return apiFetch(`/trips?${q}`)
  },
  getActiveTrips: async () => {
    const trips = await apiFetch('/trips') as any[]
    return Array.isArray(trips) ? trips.filter((t: any) => t.state === 'IN_PROGRESS' || t.state === 'PENDING_RETURN') : []
  },
  getApprovedTrips: () => apiFetch('/trips?status=APPROVED'),
  getCompletedTrips: async () => {
    const trips = await apiFetch('/trips') as any[]
    return Array.isArray(trips) ? trips.filter((t: any) => t.state === 'COMPLETED') : []
  },
  getAssignedTrips: async () => {
    const trips = await apiFetch('/trips') as any[]
    return Array.isArray(trips) ? trips.filter((t: any) => t.state === 'READY') : []
  },
  filterForDriver: (trips: any[], userId: string) =>
    trips.filter((t: any) =>
      t.allocatedDriver?.user?.id === userId ||
      t.allocatedDriver?.userId === userId
    ),
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
export const vehicleApi = {
  getAll: (status?: string) => apiFetch(`/vehicles${status ? `?status=${status}` : ''}`),
  getAllVehicles: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/vehicles${q}`)
  },
  getAvailableVehicles: () => apiFetch('/vehicles?status=AVAILABLE'),
  getAssignedVehicle: async () => {
    // Get current driver's profile and return their assigned vehicle
    const drivers: any[] = await apiFetch('/drivers') as any[]
    const user = getCurrentUser()
    if (!user) return null
    const myDriver = Array.isArray(drivers) ? drivers.find((d: any) => d.user?.id === user.id) : null
    return myDriver?.assignedVehicle ?? null
  },
  getById: (id: string) => apiFetch(`/vehicles/${id}`),
  create: (data: any) => apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' }),
  assignDriver: (vehicleId: string, driverId: string) =>
    apiFetch(`/vehicles/${vehicleId}/assign-driver`, { method: 'PATCH', body: JSON.stringify({ driverId }) }),
  unassignDriver: (vehicleId: string) =>
    apiFetch(`/vehicles/${vehicleId}/unassign-driver`, { method: 'PATCH' }),
}

// ── Drivers ───────────────────────────────────────────────────────────────────
export const driverApi = {
  getAll: (status?: string) => apiFetch(`/drivers${status ? `?status=${status}` : ''}`),
  getAllDrivers: () => apiFetch('/drivers'),
  getAvailableDrivers: () => apiFetch('/drivers?status=AVAILABLE'),
  getById: (id: string) => apiFetch(`/drivers/${id}`),
  create: (data: any) => apiFetch('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/drivers/${id}`, { method: 'DELETE' }),
  assignVehicle: (driverId: string, vehicleId: string) =>
    apiFetch(`/drivers/${driverId}/assign-vehicle`, { method: 'POST', body: JSON.stringify({ vehicleId }) }),
  unassignVehicle: (driverId: string) =>
    apiFetch(`/drivers/${driverId}/assign-vehicle`, { method: 'DELETE' }),
}

// ── Maintenance ───────────────────────────────────────────────────────────────
export const maintenanceApi = {
  getAll: (status?: string) => apiFetch(`/maintenance${status ? `?status=${status}` : ''}`),
  getAllMaintenanceRequests: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/maintenance${q}`)
  },
  getMyRequests: () => apiFetch('/maintenance?mine=true'),
  getById: (id: string) => apiFetch(`/maintenance/${id}`),
  create: (data: any) => apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  inspect: (id: string, data: any) =>
    apiFetch(`/maintenance/${id}/inspect`, { method: 'POST', body: JSON.stringify(data) }),
  approveBudget: (id: string) => apiFetch(`/maintenance/${id}/approve-budget`, { method: 'POST' }),
  start: (id: string) => apiFetch(`/maintenance/${id}/start`, { method: 'POST' }),
  complete: (id: string, data: any) =>
    apiFetch(`/maintenance/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  reject: (id: string, data: { reason: string }) =>
    apiFetch(`/maintenance/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
  getStatistics: () => apiFetch('/maintenance/statistics'),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => apiFetch('/notifications'),
  getNotifications: () => apiFetch('/notifications'),
  markAsRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  getUnreadCount: () => apiFetch('/notifications/unread-count'),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => apiFetch('/users'),
  getProfile: () => apiFetch('/users/me'),
  updateProfile: (data: any) => apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  create: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: any) =>
    apiFetch('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadProfileImage: async (file: File) => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('profileImage', file)
    const res = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  },
  removeProfileImage: () => apiFetch('/users/me/profile-image', { method: 'DELETE' }),
}

// ── Fuel ──────────────────────────────────────────────────────────────────────
export const fuelApi = {
  getAll: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/fuel${q}`)
  },
  getById: (id: string) => apiFetch(`/fuel/${id}`),
  create: (data: any) => apiFetch('/fuel', { method: 'POST', body: JSON.stringify(data) }),
  getStatistics: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/fuel/statistics${q}`)
  },
  getCostAnalysis: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/fuel/cost-analysis${q}`)
  },
  getVehicleHistory: (vehicleId: string) => apiFetch(`/fuel/vehicle/${vehicleId}/history`),
  getVehicleEfficiency: (vehicleId: string) => apiFetch(`/fuel/vehicle/${vehicleId}/efficiency`),
}

// ── Tracking ──────────────────────────────────────────────────────────────────
export const trackingApi = {
  getAll: () => apiFetch('/tracking/live'),
  getTripRoute: (tripId: string) => apiFetch(`/tracking/${tripId}/route`),
  getLatest: (tripId: string) => apiFetch(`/tracking/${tripId}/current`),
  postLocation: (tripId: string, data: { latitude: number; longitude: number; speed?: number; heading?: number }) =>
    apiFetch(`/tracking/${tripId}/location`, { method: 'POST', body: JSON.stringify(data) }),
  bulkUpdateLocations: (tripId: string, locations: any[]) =>
    apiFetch(`/tracking/${tripId}/bulk-update`, { method: 'POST', body: JSON.stringify({ locations }) }),
}

export const WS_URL = (() => {
  const base = (process.env.NEXT_PUBLIC_WS_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com').replace(/\/$/, '')
  // Remove /tracking suffix if present — the namespace is added by socket.io client
  return base.endsWith('/tracking') ? base.slice(0, -'/tracking'.length) : base
})()

// ── Departments / Colleges ────────────────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch('/departments'),
  getById: (id: string) => apiFetch(`/departments/${id}`),
  getByCollege: (collegeId: string) => apiFetch(`/departments?collegeId=${collegeId}`),
}

export const collegeApi = {
  getAll: () => apiFetch('/colleges'),
  getById: (id: string) => apiFetch(`/colleges/${id}`),
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export const auditApi = {
  getAll: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/audit${q}`)
  },
  getAuditLogs: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/audit${q}`)
  },
  getStatistics: () => apiFetch('/audit/statistics'),
}

// ── Invite ────────────────────────────────────────────────────────────────────
export const inviteApi = {
  bulkInvite: (data: { emails: string[]; role?: string; departmentId?: string; collegeId?: string; welcomeMessage?: string }) =>
    apiFetch('/users/bulk-invite', { method: 'POST', body: JSON.stringify(data) }),
  bulkInviteCsv: (formData: FormData) => {
    const token = getAuthToken()
    return fetch(`${API_BASE_URL}/users/bulk-invite-csv`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(err.message || 'Upload failed')
      }
      return res.json()
    })
  },
}

// ── System Admin ──────────────────────────────────────────────────────────────
export const systemAdminApi = {
  getUsers: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/system-admin/users${q}`)
  },
  getAllUsers: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/system-admin/users${q}`)
  },
  createUser: (data: any) => apiFetch('/system-admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) =>
    apiFetch(`/system-admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch(`/system-admin/users/${id}`, { method: 'DELETE' }),
  activateUser: (id: string) => apiFetch(`/system-admin/users/${id}/activate`, { method: 'PATCH' }),
  deactivateUser: (id: string) => apiFetch(`/system-admin/users/${id}/deactivate`, { method: 'PATCH' }),
  toggleUserStatus: (id: string, activate: boolean) =>
    activate
      ? apiFetch(`/system-admin/users/${id}/activate`, { method: 'PATCH' })
      : apiFetch(`/system-admin/users/${id}/deactivate`, { method: 'PATCH' }),
  resetUserPassword: (id: string) => apiFetch(`/system-admin/users/${id}/reset-password`, { method: 'POST' }),
  exportUsers: (params?: any) => apiFetch('/system-admin/bulk/users/export', { method: 'POST', body: JSON.stringify(params || {}) }),
  getConfig: () => apiFetch('/system-admin/config'),
  getSystemConfig: () => apiFetch('/system-admin/config'),
  updateConfig: (data: any) =>
    apiFetch('/system-admin/config', { method: 'PATCH', body: JSON.stringify(data) }),
  updateSystemConfig: (data: any) =>
    apiFetch('/system-admin/config', { method: 'PATCH', body: JSON.stringify(data) }),
  broadcast: (data: { title: string; message: string; roles?: string[] }) =>
    apiFetch('/system-admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(data) }),
  broadcastNotification: (data: { title: string; message: string; roles?: string[] }) =>
    apiFetch('/system-admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(data) }),
  getStatisticsOverview: () => apiFetch('/system-admin/statistics/overview'),
  getSystemOverview: () => apiFetch('/system-admin/statistics/overview'),
  getStatisticsUsers: () => apiFetch('/system-admin/statistics/users'),
  getUserStatistics: () => apiFetch('/system-admin/statistics/users'),
  getStatisticsTrips: () => apiFetch('/system-admin/statistics/trips'),
  getTripStatistics: () => apiFetch('/system-admin/statistics/trips'),
  getStatisticsVehicles: () => apiFetch('/system-admin/statistics/vehicles'),
  getVehicleStatistics: () => apiFetch('/system-admin/statistics/vehicles'),
  getStatisticsMaintenance: () => apiFetch('/system-admin/statistics/maintenance'),
  getSystemHealth: () => apiFetch('/system-admin/system-health'),
  getAuditLogs: (params?: Record<string, string | number>) => {
    const q = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}))}` : ''
    return apiFetch(`/audit${q}`)
  },
  createBackup: () => apiFetch('/system-admin/backup', { method: 'POST' }),
  getBackups: () => apiFetch('/system-admin/backups'),
  listBackups: () => apiFetch('/system-admin/backups'),
  enableMaintenanceMode: (reason?: string, duration?: number) =>
    apiFetch('/system-admin/maintenance-mode', { method: 'POST', body: JSON.stringify({ reason, duration }) }),
  disableMaintenanceMode: () => apiFetch('/system-admin/maintenance-mode', { method: 'DELETE' }),
  bulkImportUsers: (formData: FormData) => {
    const token = getAuthToken()
    return fetch(`${API_BASE_URL}/system-admin/bulk/users/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async res => {
      if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Failed' })); throw new Error(err.message) }
      return res.json()
    })
  },
}

// ── Stats (Driver) ────────────────────────────────────────────────────────────
export const statsApi = {
  getDriverStats: async () => {
    const trips: any = await tripApi.getAll()
    const user = getCurrentUser()
    const userId = user?.id
    const mine = (Array.isArray(trips) ? trips : []).filter((t: any) =>
      t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId
    )
    return {
      completedTrips: mine.filter((t: any) => t.state === 'COMPLETED').length,
      totalDistance: mine.reduce((s: number, t: any) => s + (t.actualDistance || t.estimatedDistance || 0), 0),
    }
  },
}
