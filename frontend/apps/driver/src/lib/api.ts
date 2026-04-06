const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || null
  }
  return null
}

const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null
  }
  return null
}

const createHeaders = () => {
  const token = getAuthToken()
  return { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }
}

let _refreshPromise: Promise<boolean> | null = null
async function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = (async () => {
    const rt = getRefreshToken()
    if (!rt) return false
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      storage.setItem('access_token', data.access_token)
      if (data.refresh_token) storage.setItem('refreshToken', data.refresh_token)
      return true
    } catch { return false }
    finally { _refreshPromise = null }
  })()
  return _refreshPromise
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const headers = { ...createHeaders(), ...(options.headers as Record<string, string>) }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newHeaders = { ...createHeaders(), ...(options.headers as Record<string, string>) }
      const retried = await fetch(url, { ...options, headers: newHeaders })
      if (!retried.ok) {
        const err = await retried.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(err.message || 'Request failed')
      }
      return retried.json()
    }
    ;['access_token', 'refreshToken', 'user'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }))
    throw new Error(err.message || 'API request failed')
  }
  const text = await res.text()
  return text ? JSON.parse(text) : undefined
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem('user') || sessionStorage.getItem('user')
  return s ? JSON.parse(s)?.id ?? null : null
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(err.message || 'Login failed')
    }
    return res.json()
  },
  getCurrentUser: () => apiFetch(`${API_BASE_URL}/users/me`),
}

// Trip API
export const tripApi = {
  getAssignedTrips: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    const userId = getCurrentUserId()
    return (Array.isArray(trips) ? trips : []).filter((t: any) =>
      ['READY', 'CAR_ALLOCATED'].includes(t.state) &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },
  getActiveTrips: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    const userId = getCurrentUserId()
    return (Array.isArray(trips) ? trips : []).filter((t: any) =>
      t.state === 'IN_PROGRESS' &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },
  getCompletedTrips: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    const userId = getCurrentUserId()
    return (Array.isArray(trips) ? trips : []).filter((t: any) =>
      t.state === 'COMPLETED' &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },
  startTrip: (tripId: string) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/start`, { method: 'POST' }),
  completeTrip: (tripId: string, data: any) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  rejectAssignment: (tripId: string, reason: string) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/driver-reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  updateTripLog: (tripId: string, data: any) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/log`, { method: 'POST', body: JSON.stringify(data) }),
}

// Vehicle API
export const vehicleApi = {
  getAssignedVehicle: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    const userId = getCurrentUserId()
    const active = (Array.isArray(trips) ? trips : []).find((t: any) =>
      ['READY', 'CAR_ALLOCATED', 'IN_PROGRESS'].includes(t.state) &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
    return active?.allocatedVehicle || null
  },
  getVehicleInfo: (vehicleId: string) => apiFetch(`${API_BASE_URL}/vehicles/${vehicleId}`),
}

// Maintenance API
export const maintenanceApi = {
  create: (data: any) =>
    apiFetch(`${API_BASE_URL}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiFetch(`${API_BASE_URL}/maintenance`),
  getById: (id: string) => apiFetch(`${API_BASE_URL}/maintenance/${id}`),
  getStatistics: () => apiFetch(`${API_BASE_URL}/maintenance/statistics`),
}

// Tracking / GPS
export const trackingApi = {
  postLocation: (tripId: string, body: {
    latitude: number; longitude: number; speed?: number; heading?: number;
    altitude?: number; accuracy?: number; metadata?: Record<string, any>
  }) =>
    apiFetch(`${API_BASE_URL}/tracking/${tripId}/location`, { method: 'POST', body: JSON.stringify(body) }),
}

// Notifications API
export const notificationApi = {
  getAll: () => apiFetch(`${API_BASE_URL}/notifications`),
  markAsRead: (id: string) =>
    apiFetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PATCH' }),
}

// Statistics API
export const statsApi = {
  getDriverStats: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    const userId = getCurrentUserId()
    const mine = (Array.isArray(trips) ? trips : []).filter((t: any) =>
      t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId
    )
    return {
      completedTrips: mine.filter((t: any) => t.state === 'COMPLETED').length,
      totalDistance: mine.reduce((s: number, t: any) => s + (t.actualDistance || t.estimatedDistance || 0), 0),
    }
  },
}

// Profile update & password change
export const userApi = {
  updateProfile: (data: { name?: string; phoneNumber?: string }) =>
    apiFetch(`${API_BASE_URL}/users/me`, { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch(`${API_BASE_URL}/auth/change-password`, { method: 'POST', body: JSON.stringify(data) }),
  uploadProfileImage: async (file: File) => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('profileImage', file)
    const res = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(err.message || 'Upload failed')
    }
    return res.json()
  },
  removeProfileImage: () =>
    apiFetch(`${API_BASE_URL}/users/me/profile-image`, { method: 'DELETE' }),
}
