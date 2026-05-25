import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export interface EnabledModulesResult {
  modules: string[];       // array of active module slugs
  loading: boolean;
  isFailOpen: boolean;     // true when API failed — show all nav items
}

interface Sub {
  moduleSlug: string | null;
}

async function fetchEnabledModules(dealershipId: string): Promise<string[]> {
  const data = await apiFetch<{ subscriptions: Sub[] }>(
    `/api/dealerships/${dealershipId}/subscriptions`
  );
  return (data.subscriptions || [])
    .map((s) => s.moduleSlug)
    .filter((slug): slug is string => !!slug);
}

export function useEnabledModules(): EnabledModulesResult {
  const { user } = useAuth();
  const dealershipId = user?.dealershipId as string | undefined;

  const query = useQuery({
    queryKey: ['enabledModules', dealershipId],
    queryFn: () => {
      if (!dealershipId) return [];
      return fetchEnabledModules(dealershipId);
    },
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,   // 5 minutes
    retry: 1,
  });

  if (!dealershipId) {
    // No dealership — brand new user or operator peeking: fail open
    return { modules: [], loading: false, isFailOpen: true };
  }

  if (query.isError) {
    // API failed — fail open: show all nav items
    return { modules: [], loading: false, isFailOpen: true };
  }

  return {
    modules: query.data ?? [],
    loading: query.isPending,
    isFailOpen: false,
  };
}

/** Returns true if the slug is enabled (or we should fail-open). */
export function hasModule(modules: string[], slug: string, isFailOpen = false): boolean {
  if (isFailOpen) return true;
  if (modules.length === 0) return true;  // no subs yet — fail open for existing dealers
  return modules.includes(slug);
}
