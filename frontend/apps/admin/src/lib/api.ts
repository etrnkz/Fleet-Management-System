// API Client for Admin App
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Helper to get current user
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
};

// Trip APIs
export const tripApi = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch(`/trips${query}`);
  },
  
  getById: (id: string) => apiFetch(`/trips/${id}`),
  
  approve: (id: string, comments?: string) => apiFetch(`/trips/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  }),
  
  reject: (id: string, reason: string) => apiFetch(`/trips/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  allocate: (id: string, data: { vehicleId: string; driverId: string }) => 
    apiFetch(`/trips/${id}/allocate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Vehicle APIs
export const vehicleApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/vehicles${query}`);
  },
  
  getById: (id: string) => apiFetch(`/vehicles/${id}`),
  
  create: (data: any) => apiFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiFetch(`/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' }),
};

// Driver APIs
export const driverApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/drivers${query}`);
  },
  
  getById: (id: string) => apiFetch(`/drivers/${id}`),
  
  create: (data: any) => apiFetch('/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiFetch(`/drivers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiFetch(`/drivers/${id}`, { method: 'DELETE' }),
};

// Maintenance APIs
export const maintenanceApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/maintenance${query}`);
  },
  
  getById: (id: string) => apiFetch(`/maintenance/${id}`),
  
  create: (data: any) => apiFetch('/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  inspect: (id: string, data: any) => apiFetch(`/maintenance/${id}/inspect`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  approveBudget: (id: string) => apiFetch(`/maintenance/${id}/approve-budget`, {
    method: 'POST',
  }),
  
  complete: (id: string, data: any) => apiFetch(`/maintenance/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Fuel APIs
export const fuelApi = {
  getAll: (vehicleId?: string, type?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (vehicleId) params.append('vehicleId', vehicleId)
    if (type) params.append('type', type)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch(`/fuel${query}`)
  },
  
  getById: (id: string) => apiFetch(`/fuel/${id}`),
  
  getStatistics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch(`/fuel/statistics${query}`)
  },
  
  getCostAnalysis: (vehicleId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (vehicleId) params.append('vehicleId', vehicleId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch(`/fuel/cost-analysis${query}`)
  },
  
  getVehicleHistory: (vehicleId: string) => apiFetch(`/fuel/vehicle/${vehicleId}/history`),
  
  getVehicleEfficiency: (vehicleId: string) => apiFetch(`/fuel/vehicle/${vehicleId}/efficiency`),
  
  create: (data: any) => apiFetch('/fuel', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// User APIs
export const userApi = {
  getAll: () => apiFetch('/users'),
  
  getProfile: () => apiFetch('/users/me'),
  
  updateProfile: (data: any) => apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  create: (data: any) => apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Tracking APIs
export const trackingApi = {
  // Get all GPS locations
  getAll: () => apiFetch('/tracking'),
  
  // Get location for specific vehicle
  getByVehicle: (vehicleId: string) => apiFetch(`/tracking/vehicle/${vehicleId}`),
  
  // Get latest location for specific vehicle
  getLatest: (vehicleId: string) => apiFetch(`/tracking/vehicle/${vehicleId}/latest`),
  
  // Update location (for drivers)
  updateLocation: (data: { vehicleId: string; latitude: number; longitude: number; speed?: number; heading?: number }) =>
    apiFetch('/tracking', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// WebSocket URL for real-time tracking
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
