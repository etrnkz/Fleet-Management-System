const API_BASE_URL = 'http://localhost:3000/api/v1'

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
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Trip API
export const tripApi = {
  getAssignedTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/assigned`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getActiveTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/active`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getCompletedTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/completed`, {
      headers: createHeaders()
    })
    return handleResponse(response)
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
    const response = await fetch(`${API_BASE_URL}/vehicles/assigned`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getVehicleInfo: async (vehicleId: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  reportMaintenance: async (vehicleId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/maintenance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  getMaintenanceHistory: async (vehicleId: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/maintenance`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Statistics API
export const statsApi = {
  getDriverStats: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/driver`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}