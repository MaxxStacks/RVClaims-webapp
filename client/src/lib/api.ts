/**
 * api.ts — Central API client for all portal data calls.
 *
 * Uses the in-memory access token from auth-api.ts.
 * Handles 401 by calling /api/auth/refresh automatically, then retries once.
 * All portals import `apiFetch` from here — never call fetch directly.
 */

import { getAccessToken, setAccessToken } from "./auth-api";

// ─── Refresh deduplication ────────────────────────────────────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
      setAccessToken(null);
      return false;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export interface ApiFetchOptions extends RequestInit {
  /** Skip attaching the Bearer token (used internally for refresh calls) */
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  // Always JSON for body payloads
  if (fetchOptions.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // Auto-refresh on 401 — only once to avoid loops
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
      const retry = await fetch(path, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
      if (!retry.ok) throw new Error(`${retry.status}: ${retry.statusText}`);
      return retry.json() as Promise<T>;
    }
    // Refresh failed — redirect to login
    window.location.href = "/dealer";
    throw new Error("Session expired");
  }

  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string) => apiFetch<T>(path),

  post: <T = unknown>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T = unknown>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T = unknown>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T = unknown>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};

// ─── TanStack Query helper ────────────────────────────────────────────────────
// Use this as queryFn to attach auth headers automatically.
// Example: useQuery({ queryKey: ['/api/claims'], queryFn: authQueryFn })

export function authQueryFn<T = unknown>({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<T> {
  const path = queryKey.join("") as string;
  return apiFetch<T>(path);
}
