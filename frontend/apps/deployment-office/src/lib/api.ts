const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token')
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

// Trip API - Deployment Office manages approved trips
export const tripApi = {
  getApprovedTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    const trips = await handleResponse(response)
    return Array.isArray(trips)
      ? trips.filter((trip: any) => trip.state === 'APPROVED_FOR_ALLOCATION')
      : []
  },

  getAllTrips: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  assignVehicleAndDriver: async (tripId: string, vehicleId: string, driverId: string, estimatedFuelCost: number = 0, estimatedDistance: number = 0) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/allocate`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ vehicleId, driverId, estimatedFuelCost, estimatedDistance })
    })
    return handleResponse(response)
  },

  updateTripStatus: async (tripId: string, status: string, notes?: string) => {
    const endpoint = status === 'IN_PROGRESS' ? 'start' : 'complete'
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/${endpoint}`, {
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
    const response = await fetch(`${API_BASE_URL}/vehicles/available`, {
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
      method: 'PATCH',
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
    const response = await fetch(`${API_BASE_URL}/vehicles/statistics`, {
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
    const response = await fetch(`${API_BASE_URL}/drivers/available`, {
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
      method: 'PATCH',
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
    const response = await fetch(`${API_BASE_URL}/maintenance/${requestId}/inspect`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

// Statistics: no /statistics/deployment on backend; derive from list endpoints when needed.
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
  getFleetUtilization: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles/statistics`, {
      headers: createHeaders(),
    })
    return handleResponse(response)
  },
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
      method: 'PATCH',
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