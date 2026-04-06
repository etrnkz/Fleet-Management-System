// API Client for Department App
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://exact-journals-interfaces-sure.trycloudflare.com/api/v1';

// Helper to get auth token (checks both storages)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    null
  );
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('refreshToken') ||
    sessionStorage.getItem('refreshToken') ||
    null
  );
};

// Helper to get current user
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr =
    localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Deduplicated refresh promise
let _refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      storage.setItem('accessToken', data.access_token);
      if (data.refresh_token) storage.setItem('refreshToken', data.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

function clearSession() {
  ['accessToken', 'access_token', 'refreshToken', 'user'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

// Generic fetch wrapper with auto-refresh
async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
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

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch<T>(endpoint, options, false);
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
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

// Invite APIs
export const inviteApi = {
  bulkInvite: (data: { emails: string[]; departmentId?: string; collegeId?: string; welcomeMessage?: string }) =>
    apiFetch('/users/bulk-invite', { method: 'POST', body: JSON.stringify(data) }),

  bulkInviteCsv: (formData: FormData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/users/bulk-invite-csv`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }
      return res.json();
    });
  },
};
