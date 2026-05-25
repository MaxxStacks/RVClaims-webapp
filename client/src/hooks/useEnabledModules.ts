import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const cache: { modules: string[] | null; fetchedAt: number } = { modules: null, fetchedAt: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useEnabledModules(): { modules: string[]; loading: boolean } {
  const [modules, setModules] = useState<string[]>(cache.modules ?? []);
  const [loading, setLoading] = useState(cache.modules === null);

  useEffect(() => {
    const now = Date.now();
    if (cache.modules !== null && now - cache.fetchedAt < CACHE_TTL) {
      setModules(cache.modules);
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiFetch<{ modules: string[] }>('/api/v6/dealerships/my-modules')
      .then(data => {
        if (cancelled) return;
        cache.modules = data.modules ?? [];
        cache.fetchedAt = Date.now();
        setModules(cache.modules);
      })
      .catch(() => {
        // Fail open — show all nav items if API fails
        if (!cancelled) setModules([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { modules, loading };
}

export function hasModule(modules: string[], key: string): boolean {
  // While loading (modules is empty array but not yet fetched), fail open
  return modules.length === 0 || modules.includes(key);
}
