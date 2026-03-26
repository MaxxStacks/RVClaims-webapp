/**
 * Auth API client
 *
 * Access tokens are stored in module-level memory only — never in
 * localStorage or sessionStorage, keeping them out of XSS reach.
 * Refresh tokens are held in an httpOnly cookie managed by the server.
 */

import type { PublicUser } from "@shared/schema";

// ─── In-memory token store ────────────────────────────────────────────────────

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (fetchOptions.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth && _accessToken) {
    headers.set("Authorization", `Bearer ${_accessToken}`);
  }

  const res = await fetch(path, { ...fetchOptions, headers, credentials: "include" });

  // Auto-refresh on 401 (token expired) — but only once to avoid loops
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${_accessToken!}`);
      const retryRes = await fetch(path, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
      return retryRes.json() as Promise<T>;
    }
  }

  return res.json() as Promise<T>;
}

// ─── Refresh helper ───────────────────────────────────────────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh calls
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const data = await apiFetch<{
        success: boolean;
        accessToken?: string;
        user?: PublicUser;
      }>("/api/auth/refresh", { method: "POST", skipAuth: true });

      if (data.success && data.accessToken) {
        _accessToken = data.accessToken;
        return true;
      }
      _accessToken = null;
      return false;
    } catch {
      _accessToken = null;
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dealershipName: string;
  dealershipEmail: string;
  dealershipPhone?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  user?: PublicUser;
  message?: string;
  errors?: unknown[];
}

export interface RegisterBidderPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  province: string;
}

export async function registerBidder(payload: RegisterBidderPayload): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/register-bidder", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  if (data.success && data.accessToken) {
    _accessToken = data.accessToken;
  }
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  if (data.success && data.accessToken) {
    _accessToken = data.accessToken;
  }
  return data;
}

export async function login(
  email: string,
  password: string,
  portal?: "dealer" | "operator" | "client" | "bidder",
  rememberMe?: boolean
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, ...(portal ? { portalType: portal } : {}), ...(rememberMe ? { rememberMe: true } : {}) }),
    skipAuth: true,
  });
  if (data.success && data.accessToken) {
    _accessToken = data.accessToken;
  }
  return data;
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(token: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
    skipAuth: true,
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  _accessToken = null;
}

export async function refreshSession(): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuth: true,
    // No body needed — refresh token is sent automatically via httpOnly cookie
  });
  if (data.success && data.accessToken) {
    _accessToken = data.accessToken;
  }
  return data;
}

export async function fetchMe(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/me");
}
