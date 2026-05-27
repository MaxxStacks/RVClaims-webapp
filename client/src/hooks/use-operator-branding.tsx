// client/src/hooks/use-operator-branding.tsx — Fetches operator branding for operator_admin/staff
// Returns DS360 defaults on failure or for non-operator roles.

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { apiFetch } from '@/lib/api';

interface OperatorBranding {
  operatorName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
}

const DS360_DEFAULTS: OperatorBranding = {
  operatorName: 'DS360 Operations',
  logoUrl: null,
  primaryColor: '#033280',
  secondaryColor: '#0cb22c',
  isLoading: false,
};

export function useOperatorBranding(): OperatorBranding {
  const { user } = useAuth();
  const [branding, setBranding] = useState<OperatorBranding>({ ...DS360_DEFAULTS, isLoading: true });

  useEffect(() => {
    const isOperatorRole =
      user?.role === 'operator_admin' ||
      user?.role === 'operator_staff' ||
      user?.role === 'ds360_superadmin';

    if (!user || !isOperatorRole) {
      setBranding({ ...DS360_DEFAULTS, isLoading: false });
      return;
    }

    apiFetch<{ success: boolean; operator?: any }>('/api/operators/me')
      .then(data => {
        if (data?.success && data.operator) {
          const op = data.operator;
          const primary = op.primaryColor || DS360_DEFAULTS.primaryColor;
          const secondary = op.secondaryColor || DS360_DEFAULTS.secondaryColor;

          // Apply CSS custom properties for theming
          document.documentElement.style.setProperty('--brand-primary', primary);
          document.documentElement.style.setProperty('--brand-secondary', secondary);

          setBranding({
            operatorName: op.name || DS360_DEFAULTS.operatorName,
            logoUrl: op.logoUrl || null,
            primaryColor: primary,
            secondaryColor: secondary,
            isLoading: false,
          });
        } else {
          setBranding({ ...DS360_DEFAULTS, isLoading: false });
        }
      })
      .catch(() => {
        setBranding({ ...DS360_DEFAULTS, isLoading: false });
      });
  }, [user?.id, user?.role]);

  return branding;
}
