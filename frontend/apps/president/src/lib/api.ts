const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// Get auth token from localStorage or sessionStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      null
    )
  }
  return null
}

const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null
  }
  return null
}

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Deduplicated refresh promise
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
      if (data.refresh_token) storage.setItem('refreshToken', data.refresh_token)
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
  ;['accessToken', 'access_token', 'refreshToken', 'user'].forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

// Handle API responses with auto-refresh
async function handleResponse(response: Response, retry: () => Promise<Response>): Promise<any> {
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const retried = await retry()
      if (!retried.ok) {
        const error = await retried.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || 'API request failed')
      }
      return retried.json()
    }
    clearSession()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

// Convenience wrapper used by all API methods
async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const headers = { ...createHeaders(), ...(options.headers as Record<string, string>) }
  const response = await fetch(url, { ...options, headers })
  return handleResponse(response, () => {
    const newHeaders = { ...createHeaders(), ...(options.headers as Record<string, string>) }
    return fetch(url, { ...options, headers: newHeaders })
  })
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, appType: 'president' })
    })
    return handleResponse(response, () =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, appType: 'president' }),
      })
    )
  },

  getCurrentUser: async () => apiFetch(`${API_BASE_URL}/users/me`),

  logout: async () => {
    try { await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }) } catch {}
  }
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// User API
export const userApi = {
  getProfile: async () => apiFetch(`${API_BASE_URL}/users/me`),

  updateProfile: async (data: any) =>
    apiFetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
}

// Trip API
export const tripApi = {
  getPendingApprovals: async () => apiFetch(`${API_BASE_URL}/trips/pending/approvals`),

  getAllTrips: async () => apiFetch(`${API_BASE_URL}/trips`),

  getAll: async (filters?: any) => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : ''
    return apiFetch(`${API_BASE_URL}/trips${queryParams ? `?${queryParams}` : ''}`)
  },

  approve: async (tripId: string, comments?: string) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    }),

  reject: async (tripId: string, reason: string) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
}

// Statistics API
export const statsApi = {
  getDashboardStats: async () => apiFetch(`${API_BASE_URL}/trips/statistics/overview`),
  getVehicleStats: async () => apiFetch(`${API_BASE_URL}/vehicles/statistics`),
  getFleetUtilization: async () => apiFetch(`${API_BASE_URL}/statistics/fleet-utilization`)
}

// Audit API
export const auditApi = {
  getAuditLogs: async () => apiFetch(`${API_BASE_URL}/audit`)
}

// Notifications API
const fetchNotificationsList = async () => apiFetch(`${API_BASE_URL}/notifications`)

export const notificationApi = {
  getNotifications: fetchNotificationsList,
  getAll: fetchNotificationsList,

  markAsRead: async (notificationId: string) =>
    apiFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PATCH' }),

  markAllAsRead: async () =>
    apiFetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PATCH' })
}

// Departments API
export const departmentApi = {
  getAllDepartments: async () => apiFetch(`${API_BASE_URL}/departments`),
  getByCollege: async (collegeId: string) =>
    apiFetch(`${API_BASE_URL}/departments?collegeId=${collegeId}`)
}

// Colleges API
const fetchAllColleges = async () => apiFetch(`${API_BASE_URL}/colleges`)

export const collegeApi = {
  getAllColleges: fetchAllColleges,
  getAll: fetchAllColleges,
}

// Vehicles API
export const vehicleApi = {
  getAllVehicles: async () => apiFetch(`${API_BASE_URL}/vehicles`),
  getAll: async () => apiFetch(`${API_BASE_URL}/vehicles`),
  getVehicleStats: async () => apiFetch(`${API_BASE_URL}/vehicles/statistics`)
}

// Maintenance API
export const maintenanceApi = {
  getAll: async () => apiFetch(`${API_BASE_URL}/maintenance`)
}

// Drivers API
export const driverApi = {
  getAll: async () => apiFetch(`${API_BASE_URL}/drivers`),
  getById: async (id: string) => apiFetch(`${API_BASE_URL}/drivers/${id}`)
}

// Reports API
export const reportApi = {
  generateTripReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/trips`, { method: 'POST', body: JSON.stringify(filters) }),

  generateBudgetReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/budget`, { method: 'POST', body: JSON.stringify(filters) }),

  generateComplianceReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/compliance`, { method: 'POST', body: JSON.stringify(filters) })
}

// Invite APIs
export const inviteApi = {
  bulkInvite: (data: { emails: string[]; role?: string; departmentId?: string; collegeId?: string; welcomeMessage?: string }) =>
    apiFetch(`${API_BASE_URL}/users/bulk-invite`, { method: 'POST', body: JSON.stringify(data) }),
  bulkInviteCsv: (formData: FormData) => {
    const token = getAuthToken()
    return fetch(`${API_BASE_URL}/users/bulk-invite-csv`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(err.message || 'Upload failed')
      }
      return res.json()
    })
  },
}
