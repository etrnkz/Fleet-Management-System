// API Client for Department App
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1';

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
  // Get all trips (department head sees their department's trips)
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch(`/trips${query}`);
  },
  
  // Get trip by ID
  getById: (id: string) => apiFetch(`/trips/${id}`),
  
  // Create trip request
  create: (data: {
    tripType: string;
    purpose: string;
    destination: string;
    startDateTime: string;
    endDateTime: string;
    passengerCount: number;
    priority?: string;
    description?: string;
  }) => apiFetch('/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Submit trip for approval
  submit: (id: string) => apiFetch(`/trips/${id}/submit`, { method: 'POST' }),
  
  // Approve trip (department head approval)
  approve: (id: string, comments?: string) => apiFetch(`/trips/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  }),
  
  // Reject trip
  reject: (id: string, reason: string) => apiFetch(`/trips/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  
  // Get pending approvals for current user
  getPendingApprovals: () => apiFetch('/trips/pending/approvals'),
  
  // Get trip statistics
  getStatistics: () => apiFetch('/trips/statistics/overview'),
};

// Vehicle APIs
export const vehicleApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/vehicles${query}`);
  },
  
  getById: (id: string) => apiFetch(`/vehicles/${id}`),
};

// Driver APIs
export const driverApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/drivers${query}`);
  },
  
  getById: (id: string) => apiFetch(`/drivers/${id}`),
};

// User APIs
export const userApi = {
  getProfile: () => apiFetch('/users/me'),
  
  updateProfile: (data: any) => apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
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
  
  getUnreadCount: () => apiFetch('/notifications/unread/count'),
};

// Department APIs
export const departmentApi = {
  getAll: () => apiFetch('/departments'),
  
  getById: (id: string) => apiFetch(`/departments/${id}`),
};

// Audit APIs
export const auditApi = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch(`/audit${query}`);
  },
  
  getStatistics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return apiFetch(`/audit/statistics${query}`);
  },
};
