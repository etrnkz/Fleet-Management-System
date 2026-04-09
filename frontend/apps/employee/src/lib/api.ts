// API Client for Employee App
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Storage helpers — uses localStorage when "remember me" was checked, sessionStorage otherwise
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  // If a refresh token exists in localStorage, user chose "remember me"
  return localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
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

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr =
    localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Refresh the access token using the refresh token
let _refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // Deduplicate concurrent refresh calls
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
      // Store in the same storage the refresh token came from
      const storage =
        localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
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
  ['accessToken', 'refreshToken', 'user', 'access_token'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  // Token expired — try to refresh and retry once
  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch<T>(endpoint, options, false);
    // Refresh failed — clear session and redirect to login
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
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
    tripCategory?: string;
    purpose: string;
    destination: string;
    startDateTime: string;
    endDateTime: string;
    passengerCount: number;
    estimatedDistance?: number;
  }) => apiFetch('/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submit: (id: string) => apiFetch(`/trips/${id}/submit`, { method: 'POST' }),

  cancel: (id: string) =>
    apiFetch(`/trips/${id}/cancel`, {
      method: 'POST',
    }),

  /** Remove a trip that is still in DRAFT (not yet submitted). */
  deleteDraft: (id: string) =>
    apiFetch<void>(`/trips/${id}`, {
      method: 'DELETE',
    }),

  submitFeedback: (id: string, feedback: {
    overallRating: number;
    driverRating?: number;
    vehicleRating?: number;
    punctualityRating?: number;
    comments?: string;
    suggestions?: string;
    wouldRecommend?: boolean;
    issues?: string[];
  }) => apiFetch(`/trips/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedback),
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

  uploadProfileImage: async (file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  removeProfileImage: () => apiFetch('/users/me/profile-image', {
    method: 'DELETE',
  }),
};

// Department APIs
export const departmentApi = {
  getAll: () => apiFetch('/departments'),
  
  getByCollege: (collegeId: string) => apiFetch(`/departments?collegeId=${collegeId}`),
};

// College APIs
export const collegeApi = {
  getAll: () => apiFetch('/colleges'),
  
  getById: (id: string) => apiFetch(`/colleges/${id}`),
};

