/**
 * Origins allowed for REST CORS and Socket.IO. Override with CORS_ORIGIN (comma-separated).
 * Include every Vercel subdomain (and preview URLs if needed) that calls this API.
 */
const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010',
] as const;

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    return [...DEFAULT_DEV_ORIGINS];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}
