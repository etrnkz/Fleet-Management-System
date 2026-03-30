// API Client for Employee App
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
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
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

  register: (data: any) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
};

// Trip APIs
export const tripApi = {
  getAll: () => apiFetch('/trips'),
  
  getById: (id: string) => apiFetch(`/trips/${id}`),
  
  create: (data: {
    tripType: string;
    purpose: string;
    destination: string;
    startDateTime: string;
    endDateTime: string;
    passengerCount: number;
  }) => apiFetch('/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submit: (id: string) => apiFetch(`/trips/${id}/submit`, { method: 'POST' }),
  
  cancel: (id: string, reason: string) => apiFetch(`/trips/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Notification APIs
export const notificationApi = {
  getAll: (isRead?: boolean) => {
    const query = isRead !== undefined ? `?isRead=${isRead}` : '';
    return apiFetch(`/notifications${query}`);
  },
  
  markAsRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  
  markAllAsRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
};

// Vehicle APIs
export const vehicleApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/vehicles${query}`);
  },
  
  getAvailable: (startDateTime: string, endDateTime: string, capacity?: number) => {
    let query = `?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
    if (capacity) query += `&capacity=${capacity}`;
    return apiFetch(`/vehicles/available${query}`);
  },
};

// User APIs
export const userApi = {
  getProfile: () => apiFetch('/users/me'),
  
  updateProfile: (data: any) => apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
