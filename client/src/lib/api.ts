/**
 * api.ts — Central API client.
 *
 * Uses Clerk session token via window.Clerk for authentication.
 * Backward-compatible: apiFetch, api, authQueryFn are kept for portals.
 * New code should use useApiFetch() hook.
 */

import { useAuth } from "@clerk/clerk-react";

// ─── Global Clerk type (set by ClerkProvider on window) ──────────────────────

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

// ─── Token retrieval (works outside React components) ────────────────────────

async function getClerkToken(): Promise<string | null> {
  try {
    return (await window.Clerk?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
}

// ─── Hook-based fetch wrapper (for new code inside React components) ─────────

export function useApiFetch() {
  const { getToken } = useAuth();

  return async function apiFetchHook<T = unknown>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    const headers = new Headers(options.headers);
    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(path, { ...options, headers, credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  };
}

// ─── Core fetch wrapper (backward-compatible for portals) ────────────────────

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (fetchOptions.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = await getClerkToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !skipAuth) {
    window.location.href = "/login";
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

export function authQueryFn<T = unknown>({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<T> {
  const path = queryKey.join("") as string;
  return apiFetch<T>(path);
}
