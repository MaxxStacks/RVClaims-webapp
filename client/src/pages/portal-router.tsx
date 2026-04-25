import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

// Sub-paths required — exact paths (/client, /dealer, etc.) are redirect-to-/login stubs in the router.
// Must include a sub-path segment to match /client/:rest*, /dealer/:rest*, etc.
const ROLE_TARGETS: Record<string, string> = {
  operator_admin: "/operator/dashboard",
  operator_staff: "/operator/dashboard",
  dealer_owner:   "/dealer/dashboard",
  dealer_staff:   "/dealer/dashboard",
  technician:     "/dealer/dashboard",
  public_bidder:  "/dealer/dashboard",
  consignor:      "/dealer/dashboard",
  bidder:         "/bidder/dashboard",
  client:         "/client/dashboard",
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

      console.log("[portal-router]", {
        isLoaded: true,
        isSignedIn: true,
        userId: user.id,
        publicMetadata: user.publicMetadata,
        role,
        target: target ?? "(no role yet — polling)",
      });

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
