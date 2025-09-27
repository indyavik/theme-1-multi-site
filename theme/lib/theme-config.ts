// Backend API base URL - separate service on port 8000
export const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:8000';

export function getApiUrl(path: string): string {
  // Always use the backend API base (dev: http://localhost:8000)
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// Optional identifiers for publish payload (if present, they will be sent)
// Deprecated: per-site slug is now sourced from site-data.json
export const SITE_SLUG: string = process.env.NEXT_PUBLIC_SITE_SLUG || '';
export const SITE_ID: string | undefined = process.env.NEXT_PUBLIC_SITE_ID || undefined;
// Optional: bearer token from env (left as-is for now)
export function getAuthHeader(): Record<string, string> | undefined {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  if (token) return { Authorization: `Bearer ${token}` };
  return undefined;
}

export const theme_version = '1.0.0'; // Made using bookkeeper theme version 1.0.0
