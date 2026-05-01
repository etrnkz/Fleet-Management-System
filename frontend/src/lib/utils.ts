/**
 * Shared utility functions used across all dashboard roles.
 * Import from here instead of defining locally in each file.
 */

/** Get 2-letter initials from a full name */
export function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Human-readable relative time (e.g. "3 hours ago") */
export function getTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return d.toLocaleDateString()
}

/** Format ISO date string to locale date */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A'
  try { return new Date(iso).toLocaleDateString() } catch { return 'N/A' }
}

/** Format ISO date string to locale date + time */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'N/A'
  try { return new Date(iso).toLocaleString() } catch { return 'N/A' }
}

/** Tailwind classes for vehicle status badges */
export function getVehicleStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':   return 'bg-[#1B3D2F]/15 text-[#1B3D2F]'
    case 'in use':
    case 'on trip':  return 'bg-blue-100 text-blue-700'
    case 'maintenance': return 'bg-orange-100 text-orange-700'
    case 'inactive':
    case 'out of service': return 'bg-gray-100 text-gray-700'
    default:         return 'bg-gray-100 text-gray-600'
  }
}

/** Tailwind classes for trip state badges */
export function getTripStateColor(state: string): string {
  switch (state) {
    case 'COMPLETED':              return 'bg-green-100 text-green-700'
    case 'IN_PROGRESS':            return 'bg-blue-100 text-blue-700'
    case 'READY':                  return 'bg-indigo-100 text-indigo-700'
    case 'PENDING_RETURN':         return 'bg-orange-100 text-orange-700'
    case 'PENDING_DEPARTMENT':
    case 'PENDING_COLLEGE':
    case 'PENDING_PRESIDENT':      return 'bg-yellow-100 text-yellow-700'
    case 'APPROVED_FOR_ALLOCATION':
    case 'CAR_ALLOCATED':
    case 'PENDING_TRANSPORT_CONFIRM': return 'bg-teal-100 text-teal-700'
    case 'REJECTED':
    case 'AUTO_REJECTED_TIMEOUT':
    case 'CANCELLED':              return 'bg-red-100 text-red-700'
    case 'DRAFT':                  return 'bg-gray-100 text-gray-600'
    default:                       return 'bg-gray-100 text-gray-600'
  }
}

/** Tailwind classes for maintenance status badges */
export function getMaintenanceStatusColor(status: string): string {
  switch (status) {
    case 'Completed':       return 'bg-green-100 text-green-700'
    case 'InProgress':      return 'bg-blue-100 text-blue-700'
    case 'BudgetApproved':  return 'bg-teal-100 text-teal-700'
    case 'EstimateProvided':return 'bg-purple-100 text-purple-700'
    case 'UnderInspection': return 'bg-yellow-100 text-yellow-700'
    case 'Submitted':       return 'bg-orange-100 text-orange-700'
    case 'Rejected':        return 'bg-red-100 text-red-700'
    default:                return 'bg-gray-100 text-gray-600'
  }
}

/** Format a number as ETB currency */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null || amount === '') return 'N/A'
  const n = Number(amount)
  if (isNaN(n)) return 'N/A'
  return `ETB ${n.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Format distance in km */
export function formatDistance(km: number | string | null | undefined): string {
  if (km == null || km === '') return 'N/A'
  const n = Number(km)
  if (isNaN(n)) return 'N/A'
  return `${n.toFixed(1)} km`
}

/** Compute monthly trip counts for the last N months from a trips array */
export function getMonthlyTripBars(trips: any[], months = 6): { label: string; count: number; pct: string }[] {
  const now = new Date()
  const bars = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1)
    const label = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const count = trips.filter((t: any) => {
      const td = new Date(t.createdAt || t.startDateTime)
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    }).length
    return { label, count }
  })
  const max = Math.max(...bars.map(b => b.count), 1)
  return bars.map(b => ({ ...b, pct: `${Math.round((b.count / max) * 100)}%` }))
}

/** Logout helper — clears all storage and redirects */
export function doLogout(): void {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie = 'accessToken=; path=/; max-age=0'
  document.cookie = 'user=; path=/; max-age=0'
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  window.location.href = '/?logout=true'
}
