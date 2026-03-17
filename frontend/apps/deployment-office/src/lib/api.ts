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

// Trip API - Deployment Office manages approved trips
export const tripApi = {
  getApprovedTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips?state=APPROVED`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getAllTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  assignVehicleAndDriver: async (tripId: string, vehicleId: string, driverId: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/assign`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ vehicleId, driverId })
    })
    return handleResponse(response)
  },

  updateTripStatus: async (tripId: string, status: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/status`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ status, notes })
    })
    return handleResponse(response)
  }
}

// Vehicle API
export const vehicleApi = {
  getAllVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getAvailableVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles?status=AVAILABLE`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  createVehicle: async (vehicleData: any) => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(vehicleData)
    })
    return handleResponse(response)
  },

  updateVehicle: async (vehicleId: string, vehicleData: any) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(vehicleData)
    })
    return handleResponse(response)
  },

  deleteVehicle: async (vehicleId: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getVehicleStats: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles/stats`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Driver API
export const driverApi = {
  getAllDrivers: async () => {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getAvailableDrivers: async () => {
    const response = await fetch(`${API_BASE_URL}/drivers?status=AVAILABLE`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  createDriver: async (driverData: any) => {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(driverData)
    })
    return handleResponse(response)
  },

  updateDriver: async (driverId: string, driverData: any) => {
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(driverData)
    })
    return handleResponse(response)
  },

  deleteDriver: async (driverId: string) => {
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'DELETE',
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Maintenance API
export const maintenanceApi = {
  getAllMaintenanceRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  createMaintenanceRequest: async (maintenanceData: any) => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(maintenanceData)
    })
    return handleResponse(response)
  },

  updateMaintenanceRequest: async (requestId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${requestId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

// Statistics API
export const statsApi = {
  getDeploymentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/deployment`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getFleetUtilization: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/fleet-utilization`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Notifications API
export const notificationApi = {
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  markAsRead: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Reports API
export const reportApi = {
  generateDeploymentReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/deployment`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  },

  generateVehicleUtilizationReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/vehicle-utilization`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  },

  generateMaintenanceReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/maintenance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  }
}