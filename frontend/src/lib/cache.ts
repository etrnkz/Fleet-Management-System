/**
 * Simple in-memory cache for API responses.
 * Prevents redundant network requests when the same data is needed
 * by multiple components on the same page load.
 *
 * Usage:
 *   const vehicles = await cachedFetch('vehicles', () => vehicleApi.getAll(), 30_000)
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<any>>()

/**
 * Fetch data with a TTL-based cache.
 * @param key    Unique cache key
 * @param fetcher Function that returns a Promise of the data
 * @param ttlMs  Time-to-live in milliseconds (default: 30 seconds)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 30_000,
): Promise<T> {
  const entry = store.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }
  const data = await fetcher()
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
  return data
}

/** Manually invalidate a cache entry (call after mutations) */
export function invalidateCache(key: string): void {
  store.delete(key)
}

/** Invalidate all cache entries matching a prefix */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

/** Clear the entire cache */
export function clearCache(): void {
  store.clear()
}

/**
 * Pre-defined cache keys for consistency.
 * Use these constants instead of raw strings.
 */
export const CACHE_KEYS = {
  VEHICLES: 'vehicles:all',
  VEHICLES_AVAILABLE: 'vehicles:available',
  VEHICLES_SERVICE: 'vehicles:service',
  DRIVERS: 'drivers:all',
  TRIPS: 'trips:all',
  TRIPS_PENDING: 'trips:pending',
  TRIPS_ACTIVE: 'trips:active',
  COLLEGES: 'colleges:all',
  DEPARTMENTS: 'departments:all',
  NOTIFICATIONS: 'notifications:all',
  FUEL: 'fuel:all',
  MAINTENANCE: 'maintenance:all',
  STATISTICS: 'statistics:overview',
} as const
