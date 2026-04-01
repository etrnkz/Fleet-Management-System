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

// User API
export const userApi = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

// Trip API
export const tripApi = {
  getPendingApprovals: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/pending/approvals`, {
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

  getAll: async (filters?: any) => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : ''
    const response = await fetch(`${API_BASE_URL}/trips${queryParams ? `?${queryParams}` : ''}`, {
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
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/trips/statistics/overview`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getVehicleStats: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles/statistics`, {
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
const fetchNotificationsList = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: createHeaders()
  })
  return handleResponse(response)
}

export const notificationApi = {
  getNotifications: fetchNotificationsList,
  /** Alias for layout code that calls `getAll` */
  getAll: fetchNotificationsList,

  markAsRead: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
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
  },

  getByCollege: async (collegeId: string) => {
    const response = await fetch(`${API_BASE_URL}/departments?collegeId=${collegeId}`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  }
}

// Colleges API
const fetchAllColleges = async () => {
  const response = await fetch(`${API_BASE_URL}/colleges`, {
    headers: createHeaders()
  })
  return handleResponse(response)
}

export const collegeApi = {
  getAllColleges: fetchAllColleges,
  /** Alias for pages that expect `getAll` */
  getAll: fetchAllColleges,
}

// Vehicles API
export const vehicleApi = {
  getAllVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
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

// Maintenance API (fleet maintenance requests)
export const maintenanceApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },
}

// Drivers API
export const driverApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      headers: createHeaders()
    })
    return handleResponse(response)
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
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