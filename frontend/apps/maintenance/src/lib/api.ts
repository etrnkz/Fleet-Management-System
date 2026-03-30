const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
})

const handle = async (resPromise: Promise<Response>) => {
  const res = await resPromise
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export const authApi = {
  login: (email: string, password: string) =>
    handle(fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) })),
  logout: () =>
    handle(fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', headers: headers() })),
}

export const maintenanceApi = {
  getAll: (params?: any) => {
    const q = params ? `?${new URLSearchParams(params)}` : ''
    return handle(fetch(`${API_BASE_URL}/maintenance${q}`, { headers: headers() }))
  },
  getById: (id: string) => handle(fetch(`${API_BASE_URL}/maintenance/${id}`, { headers: headers() })),
  create: (data: any) => handle(fetch(`${API_BASE_URL}/maintenance`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
  inspect: (id: string, data: any) => handle(fetch(`${API_BASE_URL}/maintenance/${id}/inspect`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
  approveBudget: (id: string, data: any) => handle(fetch(`${API_BASE_URL}/maintenance/${id}/approve-budget`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
  start: (id: string) => handle(fetch(`${API_BASE_URL}/maintenance/${id}/start`, { method: 'POST', headers: headers() })),
  complete: (id: string, data: any) => handle(fetch(`${API_BASE_URL}/maintenance/${id}/complete`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
  reject: (id: string, data: any) => handle(fetch(`${API_BASE_URL}/maintenance/${id}/reject`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
  getStats: () => handle(fetch(`${API_BASE_URL}/maintenance/statistics`, { headers: headers() })),
}

export const vehicleApi = {
  getAll: () => handle(fetch(`${API_BASE_URL}/vehicles`, { headers: headers() })),
}

export const notificationApi = {
  getAll: () => handle(fetch(`${API_BASE_URL}/notifications`, { headers: headers() })),
  markAsRead: (id: string) => handle(fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PATCH', headers: headers() })),
}
