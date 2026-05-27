import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

// Role-to-portal URL mapping. Dealer roles use /:dealerId/role/... paths.
// portal-router is used when navigating back to portal root.
const DEV_DEALER_ID = "dev-dealer-001";
const ROLE_TARGETS: Record<string, string> = {
  operator_admin:   "/operator/admin/dashboard",
  operator_staff:   "/operator/staff/dashboard",
  dealer_owner:     `/${DEV_DEALER_ID}/owner/dashboard`,
  dealer_staff:     `/${DEV_DEALER_ID}/staff/dashboard`,
  service_manager:  `/${DEV_DEALER_ID}/service-manager/dashboard`,
  shop_manager:     `/${DEV_DEALER_ID}/shop-manager/dashboard`,
  parts_dept:       `/${DEV_DEALER_ID}/parts-manager/dashboard`,
  technician:       `/${DEV_DEALER_ID}/shop-tech/dashboard`,
  public_bidder:    "/marketplace/bidder/dashboard",
  consignor:        "/marketplace/consignor/dashboard",
  bidder:           "/marketplace/independent/dashboard",
  client:           `/${DEV_DEALER_ID}/client/dashboard`,
};

export default function PortalRouter() {
  const { user, isLoaded } = useUser();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const attempt = async () => {
      // Always reload to get fresh publicMetadata — session token may be stale
      // immediately after OAuth sign-in before Clerk syncs the metadata.
      await user.reload().catch(() => {});

      const role = user.publicMetadata?.role as string | undefined;
      const target = role ? ROLE_TARGETS[role] : null;

      if (target && !redirectedRef.current) {
        redirectedRef.current = true;
        if (pollRef.current) clearInterval(pollRef.current);
        window.location.href = target;
      }
    };

    attempt();
    // Poll every 2 s — role may not be in publicMetadata yet if the Clerk
    // webhook hasn't fired or the operator hasn't assigned a role yet.
    pollRef.current = setInterval(attempt, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#555" }}>Loading...</p>
      </div>
    );
  }

  // Not signed in — show nothing; Clerk's middleware will redirect to /login
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#555" }}>Loading...</p>
      </div>
    );
  }

  const role = user.publicMetadata?.role as string | undefined;
  const hasTarget = role && ROLE_TARGETS[role];

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
      {hasTarget ? (
        <p style={{ color: "#555" }}>Redirecting to your portal...</p>
      ) : (
        <>
          <p style={{ fontWeight: 600, color: "#033280" }}>Setting up your account...</p>
          <p style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
            This may take a moment while your account is configured.
          </p>
        </>
      )}
    </div>
  );
}
