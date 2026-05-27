// client/src/components/ProtectedRoute.tsx
// Auth guard for portal routes — wraps layout sections in PortalRoutes.tsx

import { useAuth } from '@/hooks/use-auth';
import { useLocation, Redirect } from 'wouter';
import type { UserRole } from '@shared/schema';

// Role → their default portal root (for wrong-door redirects).
// Dealer roles that need a dealerId prefix send the user back to the dev
// selector so they can pick the correct dealership context.
const ROLE_HOME: Partial<Record<UserRole, string>> = {
  ds360_superadmin: '/superadmin/dashboard',
  operator_admin:  '/operator/admin/dashboard',
  operator_staff:  '/operator/staff/dashboard',
  dealer_owner:    '/dev-access-v7',
  dealer_staff:    '/dev-access-v7',
  client:          '/dev-access-v7',
  service_manager: '/dev-access-v7',
  shop_manager:    '/dev-access-v7',
  parts_dept:      '/dev-access-v7',
  technician:      '/dev-access-v7',
  public_bidder:   '/marketplace/bidder/dashboard',
  consignor:       '/marketplace/consignor/dashboard',
  bidder:          '/marketplace/bidder/dashboard',
};

interface ProtectedRouteProps {
  /** Actual UserRole values (from shared/constants) that may enter this section */
  allowedRoles: string[];
  /**
   * When true, verify that the URL :dealerId segment matches the
   * authenticated user's dealershipId (multi-tenant isolation).
   */
  requireDealershipId?: boolean;
  children: React.ReactNode;
}

export function ProtectedRoute({
  allowedRoles,
  requireDealershipId = false,
  children,
}: ProtectedRouteProps) {
  // Hooks must be called unconditionally — bypass check happens after.
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // ── Dev bypass ───────────────────────────────────────────────────────────
  // In development with ds360-dev-role set (via DevAccessV7), skip ALL auth
  // checks — role, dealershipId, and authentication. Read localStorage directly
  // to avoid any AuthProvider timing/Clerk-loading dependency.
  if (import.meta.env.DEV && typeof window !== 'undefined' && localStorage.getItem('ds360-dev-role')) {
    return <>{children}</>;
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
          color: '#6b7280',
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // ── Role check ───────────────────────────────────────────────────────────
  const userRole = user.role as string;
  if (!allowedRoles.includes(userRole)) {
    const home = ROLE_HOME[user.role as UserRole] ?? '/login';
    return <Redirect to={home} />;
  }

  // ── Dealership isolation check ────────────────────────────────────────────
  if (requireDealershipId) {
    const urlDealerId = location.split('/').filter(Boolean)[0];
    if (urlDealerId && user.dealershipId && urlDealerId !== user.dealershipId) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'Inter, sans-serif',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            Access Denied
          </div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>
            You can only access your own dealership&apos;s portal.
          </div>
        </div>
      );
    }
  }

  // ── Authorised ───────────────────────────────────────────────────────────
  return <>{children}</>;
}
