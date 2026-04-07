const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1'

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

// Convenience wrapper
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
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message || 'Login failed')
    }
    return response.json()
  },

  getCurrentUser: async () => apiFetch(`${API_BASE_URL}/users/me`)
}

// Trip API - Deployment Office manages approved trips
export const tripApi = {
  getApprovedTrips: async () => {
    const trips = await apiFetch(`${API_BASE_URL}/trips`)
    return Array.isArray(trips)
      ? trips.filter((trip: any) => trip.state === 'APPROVED_FOR_ALLOCATION')
      : []
  },

  getAllTrips: async () => apiFetch(`${API_BASE_URL}/trips`),

  assignVehicleAndDriver: async (tripId: string, vehicleId: string, driverId: string, estimatedFuelCost = 0, estimatedDistance = 0) =>
    apiFetch(`${API_BASE_URL}/trips/${tripId}/allocate`, {
      method: 'POST',
      body: JSON.stringify({ vehicleId, driverId, estimatedFuelCost, estimatedDistance })
    }),

  updateTripStatus: async (tripId: string, status: string, notes?: string) => {
    const endpoint = status === 'IN_PROGRESS' ? 'start' : 'complete'
    return apiFetch(`${API_BASE_URL}/trips/${tripId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    })
  }
}

// Vehicle API
export const vehicleApi = {
  getAllVehicles: async () => apiFetch(`${API_BASE_URL}/vehicles`),
  getAvailableVehicles: async () => apiFetch(`${API_BASE_URL}/vehicles/available`),
  createVehicle: async (vehicleData: any) =>
    apiFetch(`${API_BASE_URL}/vehicles`, { method: 'POST', body: JSON.stringify(vehicleData) }),
  updateVehicle: async (vehicleId: string, vehicleData: any) =>
    apiFetch(`${API_BASE_URL}/vehicles/${vehicleId}`, { method: 'PATCH', body: JSON.stringify(vehicleData) }),
  deleteVehicle: async (vehicleId: string) =>
    apiFetch(`${API_BASE_URL}/vehicles/${vehicleId}`, { method: 'DELETE' }),
  getVehicleStats: async () => apiFetch(`${API_BASE_URL}/vehicles/statistics`)
}

// Driver API
export const driverApi = {
  getAllDrivers: async () => apiFetch(`${API_BASE_URL}/drivers`),
  getAvailableDrivers: async () => apiFetch(`${API_BASE_URL}/drivers/available`),
  createDriver: async (driverData: any) =>
    apiFetch(`${API_BASE_URL}/drivers`, { method: 'POST', body: JSON.stringify(driverData) }),
  updateDriver: async (driverId: string, driverData: any) =>
    apiFetch(`${API_BASE_URL}/drivers/${driverId}`, { method: 'PATCH', body: JSON.stringify(driverData) }),
  deleteDriver: async (driverId: string) =>
    apiFetch(`${API_BASE_URL}/drivers/${driverId}`, { method: 'DELETE' })
}

// Maintenance API
export const maintenanceApi = {
  getAllMaintenanceRequests: async () => apiFetch(`${API_BASE_URL}/maintenance`),
  createMaintenanceRequest: async (maintenanceData: any) =>
    apiFetch(`${API_BASE_URL}/maintenance`, { method: 'POST', body: JSON.stringify(maintenanceData) }),
  updateMaintenanceRequest: async (requestId: string, data: any) =>
    apiFetch(`${API_BASE_URL}/maintenance/${requestId}/inspect`, { method: 'POST', body: JSON.stringify(data) })
}

// Statistics
export const statsApi = {
  getDeploymentStats: async () => {
    const [vehicles, trips, maintenance] = await Promise.all([
      vehicleApi.getAllVehicles().catch(() => []),
      tripApi.getAllTrips().catch(() => []),
      maintenanceApi.getAllMaintenanceRequests().catch(() => []),
    ])
    const vehiclesArr = Array.isArray(vehicles) ? vehicles : []
    const tripsArr = Array.isArray(trips) ? trips : []
    const maintenanceArr = Array.isArray(maintenance) ? maintenance : []
    return {
      totalFleet: vehiclesArr.length,
      available: vehiclesArr.filter((v: any) => v.status === 'Active').length,
      inUse: tripsArr.filter((t: any) => t.state === 'IN_PROGRESS').length,
      maintenance: maintenanceArr.filter((m: any) => m.status !== 'Completed').length,
      activeTrips: tripsArr.filter((t: any) => t.state === 'IN_PROGRESS').length,
      pendingAllocation: tripsArr.filter((t: any) => t.state === 'APPROVED_FOR_ALLOCATION').length,
    }
  },
  getFleetUtilization: async () => apiFetch(`${API_BASE_URL}/vehicles/statistics`)
}

// Notifications API
export const notificationApi = {
  getNotifications: async () => apiFetch(`${API_BASE_URL}/notifications`),
  markAsRead: async (notificationId: string) =>
    apiFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PATCH' })
}

// Reports API
export const reportApi = {
  generateDeploymentReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/deployment`, { method: 'POST', body: JSON.stringify(filters) }),
  generateVehicleUtilizationReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/vehicle-utilization`, { method: 'POST', body: JSON.stringify(filters) }),
  generateMaintenanceReport: async (filters: any) =>
    apiFetch(`${API_BASE_URL}/reports/maintenance`, { method: 'POST', body: JSON.stringify(filters) })
}
// User profile API
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
}

// Invite API
export const inviteApi = {
  bulkInvite: (data: { emails: string[]; departmentId?: string; collegeId?: string; welcomeMessage?: string }) =>
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
