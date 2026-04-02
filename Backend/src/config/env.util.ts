/**
 * Dotenv leaves trailing `\r` when .env uses CRLF (common on Windows).
 * Use for any string read from process.env that is passed to drivers, DNS, or URLs.
 */
export function envString(name: string, fallback: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v.trim();
}

export function envStringOptional(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === '') return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
}
