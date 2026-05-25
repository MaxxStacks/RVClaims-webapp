// client/src/components/ProtectedRoute.tsx
// Auth guard for portal routes — wraps layout sections in PortalRoutes.tsx

import { useAuth } from '@/hooks/use-auth';
import { useLocation, Redirect } from 'wouter';
import type { UserRole } from '@shared/schema';

// Role → their default portal root (for wrong-door redirects).
// Dealer roles that need a dealerId prefix send the user back to the dev
// selector so they can pick the correct dealership context.
const ROLE_HOME: Partial<Record<UserRole, string>> = {
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
  const { user, isLoading, isAuthenticated, isDevMode } = useAuth();
  const [location] = useLocation();

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
    // Dev mode: if localStorage has ds360-dev-role set but user is somehow
    // null, redirect back to the dev selector rather than /login.
    if (isDevMode) return <Redirect to="/dev-access-v7" />;
    return <Redirect to="/login" />;
  }

  // ── Role check ───────────────────────────────────────────────────────────
  const userRole = user.role as string;
  if (!allowedRoles.includes(userRole)) {
    const home = ROLE_HOME[user.role as UserRole] ?? '/login';
    return <Redirect to={home} />;
  }

  // ── Dealership isolation check ────────────────────────────────────────────
  // In development with an active role override the URL uses a placeholder
  // segment ("dealer", "client", etc.) rather than a real dealershipId, so
  // the segment-vs-id comparison would always fail. Skip the check entirely.
  if (requireDealershipId && !(import.meta.env.DEV && isDevMode)) {
    // The dealerId is always the FIRST non-empty path segment for dealer
    // portals (e.g. /dev-dealer-001/owner/dashboard).
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
