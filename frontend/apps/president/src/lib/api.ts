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
  getPendingApprovals: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/pending-approvals`, {
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

  approve: async (tripId: string, comments?: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/approve`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ comments })
    })
    return handleResponse(response)
  },

  reject: async (tripId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/reject`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ reason })
    })
    return handleResponse(response)
  }
}

// Statistics API
export const statsApi = {
  getOverallStats: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/overall`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getBudgetStats: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/budget`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getComplianceStats: async () => {
    const response = await fetch(`${API_BASE_URL}/statistics/compliance`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Audit API
export const auditApi = {
  getAuditLogs: async () => {
    const response = await fetch(`${API_BASE_URL}/audit`, {
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

// Departments API
export const departmentApi = {
  getAllDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Colleges API
export const collegeApi = {
  getAllColleges: async () => {
    const response = await fetch(`${API_BASE_URL}/colleges`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Vehicles API
export const vehicleApi = {
  getAllVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
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

// Reports API
export const reportApi = {
  generateTripReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/trips`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  },

  generateBudgetReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/budget`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  },

  generateComplianceReport: async (filters: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/compliance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(filters)
    })
    return handleResponse(response)
  }
}