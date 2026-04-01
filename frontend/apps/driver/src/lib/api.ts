const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
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

// Handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Trip API
export const tripApi = {
  getAssignedTrips: async () => {
    // Backend has no /trips/assigned — fetch all and filter by driver's user id
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    const arr = Array.isArray(trips) ? trips : []
    // Get current user id from localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    return arr.filter((t: any) =>
      ['READY', 'CAR_ALLOCATED'].includes(t.state) &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },

  getActiveTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    const arr = Array.isArray(trips) ? trips : []
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    return arr.filter((t: any) =>
      t.state === 'IN_PROGRESS' &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },

  getCompletedTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    const arr = Array.isArray(trips) ? trips : []
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    return arr.filter((t: any) =>
      t.state === 'COMPLETED' &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
  },

  startTrip: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/start`, {
      method: 'POST',
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  completeTrip: async (tripId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/complete`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  rejectAssignment: async (tripId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/driver-reject`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ reason })
    })
    return handleResponse(response)
  },

  updateTripLog: async (tripId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/log`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

// Vehicle API
export const vehicleApi = {
  getAssignedVehicle: async () => {
    // Get the driver's assigned trip and extract the vehicle
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    const arr = Array.isArray(trips) ? trips : []
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    const activeTrip = arr.find((t: any) =>
      ['READY', 'CAR_ALLOCATED', 'IN_PROGRESS'].includes(t.state) &&
      (t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId)
    )
    return activeTrip?.allocatedVehicle || null
  },

  getVehicleInfo: async (vehicleId: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Maintenance API
export const maintenanceApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance/statistics`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Statistics API
export const statsApi = {
  getDriverStats: async () => {
    // Derive stats from trips
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    const arr = Array.isArray(trips) ? trips : []
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    const myTrips = arr.filter((t: any) =>
      t.allocatedDriver?.user?.id === userId || t.allocatedDriver?.userId === userId
    )
    return {
      completedTrips: myTrips.filter((t: any) => t.state === 'COMPLETED').length,
      totalDistance: myTrips.reduce((sum: number, t: any) => sum + (t.actualDistance || t.estimatedDistance || 0), 0),
    }
  }
}