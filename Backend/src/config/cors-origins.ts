/**
 * CORS: allow any origin. With credentials, Nest/Express reflects the request
 * `Origin` header (equivalent to permitting all origins; `*` is not allowed with credentials).
 */
export function getCorsOrigin(): boolean {
  return true;
}
