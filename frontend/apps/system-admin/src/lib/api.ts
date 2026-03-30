const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

// System Admin API
export const systemAdminApi = {
  // System Overview
  getSystemOverview: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/statistics/overview`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // User Management
  getAllUsers: async (filters?: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/system-admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  createUser: async (userData: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  updateUser: async (id: string, userData: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/users/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  deleteUser: async (id: string) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  toggleUserStatus: async (id: string, activate: boolean) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const endpoint = activate ? 'activate' : 'deactivate';
    const response = await fetch(`${API_BASE_URL}/system-admin/users/${id}/${endpoint}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  resetUserPassword: async (id: string) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Statistics
  getUserStatistics: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/statistics/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getTripStatistics: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/statistics/trips`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getVehicleStatistics: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/statistics/vehicles`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getMaintenanceStatistics: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/statistics/maintenance`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // System Health
  getSystemHealth: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/system-health`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Audit Logs
  getAuditLogs: async (filters?: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/system-admin/audit-logs?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // System Configuration
  getSystemConfig: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/config`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateSystemConfig: async (config: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/config`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(config),
    });
    return response.json();
  },

  // Maintenance Mode
  enableMaintenanceMode: async (reason: string, estimatedDuration?: number) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/maintenance-mode`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ reason, estimatedDuration }),
    });
    return response.json();
  },

  disableMaintenanceMode: async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/maintenance-mode`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Broadcast Notifications
  broadcastNotification: async (notification: any) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/system-admin/notifications/broadcast`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(notification),
    });
    return response.json();
  },
};