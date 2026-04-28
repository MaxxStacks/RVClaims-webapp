import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import logoLight from "@assets/DS360_logo_light.png";

const PORTAL_TARGETS: Record<string, string> = {
  operator_admin:  "/operator-v6",
  operator_staff:  "/operator-v6",
  dealer_owner:    "/dealer-v6",
  dealer_staff:    "/dealer-v6",
  service_manager: "/dealer-v6",
  shop_manager:    "/dealer-v6",
  parts_dept:      "/dealer-v6",
  technician:      "/dealer-v6",
  public_bidder:   "/dealer-v6",
  consignor:       "/dealer-v6",
  client:          "/client-v6",
  bidder:          "/bidder-v6",
};

interface RoleCard {
  role: string;
  label: string;
  desc: string;
}

const SECTIONS: { label: string; color: string; bg: string; roles: RoleCard[] }[] = [
  {
    label: "Operator Portal",
    color: "#033280",
    bg: "#eff6ff",
    roles: [
      { role: "operator_admin", label: "Operator Admin", desc: "God mode — all dealers, all data, billing, settings, user management" },
      { role: "operator_staff", label: "Operator Staff", desc: "Claims processing across all dealers — no billing or platform settings" },
    ],
  },
  {
    label: "Dealer Portal",
    color: "#059669",
    bg: "#f0fdf4",
    roles: [
      { role: "dealer_owner",  label: "Dealer Owner",   desc: "Full dealership control — claims, units, staff, billing, subscription" },
      { role: "dealer_staff",  label: "Dealer Staff",   desc: "Claims and units only — no billing, no staff management" },
      { role: "public_bidder", label: "Public Bidder",  desc: "Marketplace browsing, auction bidding, escrow payments" },
      { role: "consignor",     label: "Consignor",      desc: "Consignment listings, offer management, payout tracking" },
    ],
  },
  {
    label: "Service Portal (Dealer-v6)",
    color: "#0891b2",
    bg: "#f0f9ff",
    roles: [
      { role: "service_manager", label: "Service Manager", desc: "Work orders, dispatch scheduler, technician management, parts, full unit bio" },
      { role: "shop_manager",    label: "Shop Manager",    desc: "All shop WOs, dispatch board (if enabled by Dealer Admin), parts access" },
      { role: "technician",      label: "Technician",      desc: "Assigned work orders only — no WO creation, no billing, no admin" },
      { role: "parts_dept",      label: "Parts Department", desc: "Parts department portal — menu items configured by Dealer Admin" },
    ],
  },
  {
    label: "Client Portal",
    color: "#7c3aed",
    bg: "#faf5ff",
    roles: [
      { role: "client", label: "Client (RV Owner)", desc: "Warranty tracking, claim status, documents, tickets, roadside" },
    ],
  },
  {
    label: "Bidder Portal",
    color: "#b45309",
    bg: "#fffbeb",
    roles: [
      { role: "bidder", label: "Independent Bidder", desc: "Auction room, live bidding, my bids, verification, escrow" },
    ],
  },
];

export default function DevAccess() {
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  // Read active role from localStorage — use-auth.tsx prioritizes this over Clerk session
  const active = typeof window !== "undefined"
    ? localStorage.getItem("ds360-dev-role") ?? undefined
    : undefined;

  const enter = (role: string) => {
    setLoading(role);
    localStorage.setItem("ds360-dev-role", role);
    window.location.href = PORTAL_TARGETS[role] ?? "/";
  };

  const clear = () => {
    localStorage.removeItem("ds360-dev-role");
    window.location.reload();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={logoLight} alt="Dealer Suite 360" style={{ height: 48, width: "auto" }} />
          <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#033280", textTransform: "uppercase", letterSpacing: "1px" }}>Dev Access</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {isLoaded && clerkUser
                ? `Signed in as ${clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.id} · role override via localStorage`
                : "Not signed in · role override via localStorage"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {active && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              <span>●</span> Active override: {active}
            </div>
          )}
          {active && (
            <button
              onClick={clear}
              style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#64748b", cursor: "pointer", fontWeight: 500 }}
            >
              Clear Override
            </button>
          )}
        </div>
      </div>

      {/* Warning */}
      <div style={{ background: "#fef3c7", borderBottom: "1px solid #fcd34d", padding: "10px 40px", fontSize: 13, color: "#92400e" }}>
        <span style={{ fontWeight: 700 }}>⚠ Development Only</span>
        {" — Role override stored in localStorage (ds360-dev-role). useAuth() reads this before Clerk, giving any portal the selected role. Clear before production testing."}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Select a Role to Preview</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 40 }}>
          Clicking a role sets ds360-dev-role in localStorage and navigates to that portal. useAuth() picks it up on load without touching your Clerk session.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 20, background: section.color, borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: section.color, textTransform: "uppercase", letterSpacing: "1.5px" }}>{section.label}</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {section.roles.map((r) => {
                  const isActive = active === r.role;
                  const isSpinning = loading === r.role;
                  return (
                    <div
                      key={r.role}
                      style={{
                        background: isActive ? section.bg : "#fff",
                        border: `2px solid ${isActive ? section.color : "#e2e8f0"}`,
                        borderRadius: 10,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{r.label}</span>
                          {isActive && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: section.color, color: "#fff", borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{r.desc}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>{r.role}</div>
                      </div>
                      <button
                        onClick={() => enter(r.role)}
                        disabled={!!loading}
                        style={{
                          padding: "9px 0",
                          background: isActive ? section.color : "#f8fafc",
                          color: isActive ? "#fff" : section.color,
                          border: `1px solid ${isActive ? section.color : "#e2e8f0"}`,
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: loading ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          opacity: loading && !isSpinning ? 0.5 : 1,
                        }}
                      >
                        {isSpinning ? "Navigating…" : isActive ? "Re-enter Portal →" : `Enter as ${r.label} →`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
