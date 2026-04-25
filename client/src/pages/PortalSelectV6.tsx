import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

const PORTAL_TARGETS: Record<string, string> = {
  operator_admin: "/operator-v6",
  operator_staff: "/operator-v6",
  dealer_owner: "/dealer-v6",
  dealer_staff: "/dealer-v6",
  technician: "/dealer-v6",
  public_bidder: "/dealer-v6",
  consignor: "/dealer-v6",
  client: "/client-v6",
  bidder: "/bidder-v6",
};

const ROLE_LABELS: Record<string, string> = {
  operator_admin: "Operator Admin",
  operator_staff: "Operator Staff",
  dealer_owner: "Dealer Owner",
  dealer_staff: "Dealer Staff",
  technician: "Technician",
  public_bidder: "Public Bidder (Dealer-sponsored)",
  consignor: "Consignor (Dealer-sponsored)",
  client: "Client",
  bidder: "Independent Bidder",
};

export default function PortalSelectV6() {
  const { user, isLoaded } = useUser();
  const [busy, setBusy] = useState(false);

  if (!isLoaded) {
    return <div style={{padding:40, textAlign:"center"}}>Loading...</div>;
  }
  if (!user) {
    return (
      <div style={{padding:40, textAlign:"center"}}>
        <p>You must be signed in to use the portal selector.</p>
        <a href="/login" style={{color:"#033280"}}>Sign in</a>
      </div>
    );
  }

  const currentRole = (user.publicMetadata?.role as string) || "(not set)";
  const currentRoles = ((user.publicMetadata?.roles as string[]) || []);

  async function setRole(role: string) {
    setBusy(true);
    try {
      // Note: in production we'd call a backend endpoint that uses Clerk's
      // backend SDK to set publicMetadata. For dev testing we use Clerk's
      // user.update which only allows unsafeMetadata client-side.
      // Workaround: use unsafeMetadata for test override; portal code
      // reads role from publicMetadata first, then falls back to unsafeMetadata.
      await user!.update({
        unsafeMetadata: { ...user!.unsafeMetadata, devRoleOverride: role }
      });
      window.location.href = PORTAL_TARGETS[role];
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{maxWidth: 600, margin: "60px auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", padding: 20}}>
      <h1 style={{fontSize: 22, color: "#033280", marginBottom: 6}}>DS360 v6 — Portal Test Selector</h1>
      <p style={{fontSize: 13, color: "#666", marginBottom: 8}}>Pick a role to preview that portal. RBAC filters apply automatically.</p>
      <p style={{fontSize: 12, color: "#999", marginBottom: 24}}>
        Current Clerk role: <code style={{background:"#f0f2f5",padding:"1px 6px",borderRadius:4}}>{currentRole}</code>
        {currentRoles.length > 0 && <> — also has: {currentRoles.map(r => <code key={r} style={{background:"#f0f2f5",padding:"1px 6px",borderRadius:4,marginLeft:4}}>{r}</code>)}</>}
      </p>

      <div style={{display: "grid", gap: 8, marginBottom: 24}}>
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <button
            key={role}
            onClick={() => setRole(role)}
            disabled={busy}
            style={{
              padding: "12px 16px",
              border: "1px solid #d5dbe5",
              borderRadius: 8,
              background: "white",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: busy ? "wait" : "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{fontWeight: 600}}>{label}</div>
              <div style={{fontSize: 11, color: "#888", marginTop: 2}}>{role} → {PORTAL_TARGETS[role]}</div>
            </div>
            <div style={{color: "#033280", fontSize: 18}}>›</div>
          </button>
        ))}
      </div>

      <p style={{fontSize: 11, color: "#aaa", marginTop: 16}}>
        <strong>Dev only.</strong> Clicking a button stores a role override in Clerk's unsafeMetadata.
        The v6 portals read this override before falling back to publicMetadata.role.
        In production, role changes happen through invitations or admin actions — not this page.
      </p>
    </div>
  );
}
