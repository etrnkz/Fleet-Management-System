const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Get auth token from localStorage or sessionStorage
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
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null;
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

async function apiFetch(url: string, options: RequestInit = {}, retry = true): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch(url, options, false);
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, appType: 'system-admin' }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  getCurrentUser: async () => apiFetch(`${API_BASE_URL}/users/me`),
};

// System Admin API
export const systemAdminApi = {
  getSystemOverview: () => apiFetch(`${API_BASE_URL}/system-admin/statistics/overview`),

  getAllUsers: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiFetch(`${API_BASE_URL}/system-admin/users?${params}`);
  },

  createUser: (userData: any) =>
    apiFetch(`${API_BASE_URL}/system-admin/users`, { method: 'POST', body: JSON.stringify(userData) }),

  updateUser: (id: string, userData: any) =>
    apiFetch(`${API_BASE_URL}/system-admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(userData) }),

  deleteUser: (id: string) =>
    apiFetch(`${API_BASE_URL}/system-admin/users/${id}`, { method: 'DELETE' }),

  toggleUserStatus: (id: string, activate: boolean) => {
    const endpoint = activate ? 'activate' : 'deactivate';
    return apiFetch(`${API_BASE_URL}/system-admin/users/${id}/${endpoint}`, { method: 'PATCH' });
  },

  resetUserPassword: (id: string) =>
    apiFetch(`${API_BASE_URL}/system-admin/users/${id}/reset-password`, { method: 'POST' }),

  getUserStatistics: () => apiFetch(`${API_BASE_URL}/system-admin/statistics/users`),
  getTripStatistics: () => apiFetch(`${API_BASE_URL}/system-admin/statistics/trips`),
  getVehicleStatistics: () => apiFetch(`${API_BASE_URL}/system-admin/statistics/vehicles`),
  getMaintenanceStatistics: () => apiFetch(`${API_BASE_URL}/system-admin/statistics/maintenance`),
  getSystemHealth: () => apiFetch(`${API_BASE_URL}/system-admin/system-health`),

  getAuditLogs: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return apiFetch(`${API_BASE_URL}/system-admin/audit-logs?${params}`);
  },

  getSystemConfig: () => apiFetch(`${API_BASE_URL}/system-admin/config`),

  updateSystemConfig: (config: any) =>
    apiFetch(`${API_BASE_URL}/system-admin/config`, { method: 'PATCH', body: JSON.stringify(config) }),

  enableMaintenanceMode: (reason: string, estimatedDuration?: number) =>
    apiFetch(`${API_BASE_URL}/system-admin/maintenance-mode`, {
      method: 'POST',
      body: JSON.stringify({ reason, estimatedDuration }),
    }),

  disableMaintenanceMode: () =>
    apiFetch(`${API_BASE_URL}/system-admin/maintenance-mode`, { method: 'DELETE' }),

  broadcastNotification: (notification: any) =>
    apiFetch(`${API_BASE_URL}/system-admin/notifications/broadcast`, {
      method: 'POST',
      body: JSON.stringify(notification),
    }),

  bulkImportUsers: (users: any[]) =>
    apiFetch(`${API_BASE_URL}/system-admin/bulk/users/import`, {
      method: 'POST',
      body: JSON.stringify({ users }),
    }),

  exportUsers: (options: { format: 'csv' | 'json'; filters?: any }) =>
    apiFetch(`${API_BASE_URL}/system-admin/bulk/users/export`, {
      method: 'POST',
      body: JSON.stringify(options),
    }),

  createBackup: () =>
    apiFetch(`${API_BASE_URL}/system-admin/backup`, { method: 'POST' }),

  listBackups: () =>
    apiFetch(`${API_BASE_URL}/system-admin/backups`),
};
