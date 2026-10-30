/**
 * CUTAS API client.
 *
 * Security model:
 *  - The short-lived access token (JWT, 15 min) is kept in memory only, never in localStorage.
 *  - The refresh token lives in an HttpOnly cookie set by the API (JavaScript can never read it).
 *  - Every request carries `X-CUTAS-Client: web`; the API requires it for cookie-based endpoints,
 *    which blocks cross-site request forgery.
 *  - When the access token expires, one refresh is attempted (shared by concurrent requests)
 *    and the original request is retried once.
 */

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');
const API_URL = new URL(API_BASE, window.location.origin);
export const API_ORIGIN = API_URL.origin;

const CLIENT_HEADERS: Record<string, string> = { 'X-CUTAS-Client': 'web' };

export class ApiError extends Error {
  status: number;
  data: unknown;
  fieldErrors: Record<string, string>;
  code?: string;

  constructor(status: number, message: string, data: unknown = null, fieldErrors: Record<string, string> = {}, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

// ---------------------------------------------------------------- key case conversion
const SNAKE_KEY = /^[a-z][a-z0-9_]*$/;
const toCamelKey = (k: string) => (SNAKE_KEY.test(k) ? k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase()) : k);
const toSnakeKey = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;
}

export function camelize<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => camelize(v)) as T;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[toCamelKey(k)] = camelize(v);
    return out as T;
  }
  return value as T;
}

export function snakify(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(snakify);
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[toSnakeKey(k)] = snakify(v);
    return out;
  }
  return value;
}

/** Media URLs come back relative ("/api/v1/media/..."): resolve them against the API origin. */
export function resolveApiUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    const url = new URL(path, API_ORIGIN);
    return url.origin === API_ORIGIN ? url.toString() : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- session state
let accessToken: string | null = null;
let refreshInFlight: Promise<unknown | null> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function hasAccessToken() {
  return accessToken !== null;
}

export function onSessionExpired(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const url = new URL(API_URL.pathname.replace(/\/+$/, '') + path, API_ORIGIN);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(toSnakeKey(k), String(v));
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<ApiError> {
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error body */
  }
  const fieldErrors: Record<string, string> = {};
  let message = '';
  let code: string | undefined;
  if (isPlainObject(data)) {
    for (const [k, v] of Object.entries(data)) {
      const text = Array.isArray(v) ? String(v[0] ?? '') : typeof v === 'string' ? v : '';
      if (k === 'detail') message = text;
      else if (k === 'code') code = text;
      else if (k === 'non_field_errors') message = message || text;
      else if (text && k !== 'retry_after') fieldErrors[toCamelKey(k)] = text;
    }
  }
  if (!message) {
    const first = Object.values(fieldErrors)[0];
    message =
      first ||
      (res.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : res.status >= 500
          ? 'The CUTAS server had a problem. Please try again shortly.'
          : res.status === 403
            ? 'You do not have permission to do that.'
            : res.status === 404
              ? 'Not found.'
              : 'Request failed.');
  }
  return new ApiError(res.status, message, data, fieldErrors, code);
}

/** Online preview without a server (e.g. GitHub Pages): no API calls are made at all. */
export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === 'true';
export const PREVIEW_MESSAGE =
  'This is an online preview of the CUTAS website. The CUTAS server is not connected yet, so sign-in and live data are not available.';

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  if (PREVIEW_MODE) throw new ApiError(0, PREVIEW_MESSAGE);
  try {
    return await fetch(url, { credentials: 'include', cache: 'no-store', ...init });
  } catch {
    throw new ApiError(0, 'Cannot reach the CUTAS server. Check your internet connection and try again.');
  }
}

/** Uses the HttpOnly refresh cookie to get a new access token. Resolves to the user payload or null. */
export function refreshSession(): Promise<unknown | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await doFetch(buildUrl('/auth/refresh/'), {
          method: 'POST',
          headers: { ...CLIENT_HEADERS, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: '{}',
        }).catch(() => null);
        if (res && res.ok) {
          const data = camelize<{ access: string; user: unknown }>(await res.json());
          accessToken = data.access;
          return data.user ?? null;
        }
        // Another tab may have rotated the cookie a moment ago: retry once.
        if (res && res.status === 401 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 350));
          continue;
        }
        break;
      }
      accessToken = null;
      return null;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** false for sign-in endpoints: never attach a token or try to refresh. */
  auth?: boolean;
  signal?: AbortSignal;
}

async function send(method: string, path: string, opts: RequestOptions = {}, retried = false): Promise<Response> {
  const headers: Record<string, string> = { ...CLIENT_HEADERS, Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(snakify(opts.body));
  }
  const useAuth = opts.auth !== false;
  if (useAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await doFetch(buildUrl(path, opts.query), { method, headers, body, signal: opts.signal });

  if (res.status === 401 && useAuth && !retried) {
    const hadToken = accessToken !== null;
    const user = await refreshSession();
    if (user !== null) return send(method, path, opts, true);
    if (hadToken) sessionExpiredHandler?.();
  }
  if (!res.ok) throw await parseError(res);
  return res;
}

export async function request<T = unknown>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await send(method, path, opts);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? camelize<T>(JSON.parse(text)) : (undefined as T));
}

export const api = {
  get: <T = unknown>(path: string, query?: RequestOptions['query'], signal?: AbortSignal) =>
    request<T>('GET', path, { query, signal }),
  post: <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, 'body'> = {}) =>
    request<T>('POST', path, { ...opts, body: body ?? {} }),
  patch: <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, { body: body ?? {} }),
  put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, { body: body ?? {} }),
  delete: <T = unknown>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),
};

function filenameFrom(res: Response, fallback: string) {
  const cd = res.headers.get('Content-Disposition') || '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  const name = match ? decodeURIComponent(match[1]) : fallback;
  return name.replace(/[^\w.\-]/g, '_') || fallback;
}

/** Downloads a file the API generates (PDF, CSV, JSON) with the user's credentials. */
export async function downloadFile(
  method: 'GET' | 'POST',
  path: string,
  fallbackName: string,
  opts: RequestOptions = {},
): Promise<void> {
  const res = await send(method, path, opts);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filenameFrom(res, fallbackName);
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
