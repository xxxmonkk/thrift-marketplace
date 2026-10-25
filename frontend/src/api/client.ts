// ============================================================
// SALIXIR — Centralized API Client
// Handles base URL, auth token injection, and error parsing.
// ============================================================

import type { ApiError } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ----- Storage key for JWT -----
const TOKEN_KEY = 'salixir_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ----- Custom API Error -----
export class ApiRequestError extends Error {
  public status: number;
  public data: ApiError;

  constructor(status: number, data: ApiError) {
    super(data.error ?? 'Request failed');
    this.name = 'ApiRequestError';
    this.status = status;
    this.data = data;
  }
}

// ----- Core fetch wrapper -----
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    // Network failure — throw a typed error
    throw new ApiRequestError(0, { error: 'Network error — could not reach the server.' });
  }

  // No-content responses
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json().catch(() => ({ error: 'Invalid JSON response' }));

  if (!response.ok) {
    throw new ApiRequestError(response.status, json as ApiError);
  }

  return json as T;
}

// ----- Query string builder -----
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}
