import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import logoLight from "@assets/DS360_logo_light.png";
import type { UserRole } from "@shared/schema";

// V7 URL targets — new route structure from Session 3
// Dealer role portals use /:dealerId/role/... — dev uses the fixed "dev-dealer-001" ID
// so these URLs bypass the /dealer/:rest* v6 catch-all and hit the v7 portal sections.
const DEV_DEALER_ID = "dev-dealer-001";
const PORTAL_TARGETS: Record<string, string> = {
  operator_admin:       "/operator/admin/dashboard",
  operator_staff:       "/operator/staff/dashboard",
  dealer_owner:         `/${DEV_DEALER_ID}/owner/dashboard`,
  dealer_staff:         `/${DEV_DEALER_ID}/staff/dashboard`,
  client:               `/${DEV_DEALER_ID}/client/dashboard`,
  service_manager:      `/${DEV_DEALER_ID}/service-manager/dashboard`,
  shop_manager:         `/${DEV_DEALER_ID}/shop-manager/dashboard`,
  parts_dept:           `/${DEV_DEALER_ID}/parts-manager/dashboard`,
  financial_manager:    `/${DEV_DEALER_ID}/financial-manager/dashboard`,
  shop_tech:            `/${DEV_DEALER_ID}/shop-tech/dashboard`,
  on_site_tech:         `/${DEV_DEALER_ID}/on-site-tech/dashboard`,
  public_bidder:        "/marketplace/bidder/dashboard",
  consignor:            "/marketplace/consignor/dashboard",
  independent_bidder:   "/marketplace/independent/dashboard",
  marketplace_admin:    "/marketplace/admin/dashboard",
  marketplace_staff:    "/marketplace/staff/dashboard",
};

interface RoleCard {
  role: string;        // the ds360-dev-role value stored in localStorage
  label: string;
  desc: string;
  urlRole: string;     // the UserRole-compatible value written to localStorage
}

const SECTIONS: { label: string; color: string; bg: string; roles: RoleCard[] }[] = [
  {
    label: "Operator Portal",
    color: "#033280",
    bg: "#eff6ff",
    roles: [
      { role: "operator_admin", urlRole: "operator_admin", label: "Operator Admin", desc: "God mode — all dealers, all data, billing, settings, user management" },
      { role: "operator_staff", urlRole: "operator_staff", label: "Operator Staff", desc: "Claims processing across all dealers — no billing or platform settings" },
    ],
  },
  {
    label: "Dealer Portal",
    color: "#059669",
    bg: "#f0fdf4",
    roles: [
      { role: "dealer_owner",  urlRole: "dealer_owner",  label: "Dealer Owner", desc: "Full dealership control — claims, units, staff, billing, subscription" },
      { role: "dealer_staff",  urlRole: "dealer_staff",  label: "Dealer Staff", desc: "Claims and units only — no billing, no staff management" },
      { role: "client",        urlRole: "client",        label: "Client",       desc: "RV owner — warranty tracking, claim status, documents, tickets, roadside" },
    ],
  },
  {
    label: "Dealer Service Portal",
    color: "#0891b2",
    bg: "#f0f9ff",
    roles: [
      { role: "service_manager",   urlRole: "service_manager", label: "Service Manager",   desc: "Work orders, dispatch, technician management, parts, full unit bio" },
      { role: "shop_manager",      urlRole: "shop_manager",    label: "Shop Manager",       desc: "All shop WOs, dispatch board (if enabled by Dealer Admin), parts access" },
      { role: "parts_dept",        urlRole: "parts_dept",      label: "Parts Manager",      desc: "Parts inventory, orders, supplier management — configured by Dealer Admin" },
      { role: "financial_manager", urlRole: "dealer_owner",    label: "Financial Manager",  desc: "Financial reporting, invoicing, billing, revenue dashboards" },
      { role: "shop_tech",         urlRole: "technician",      label: "Shop Technician",    desc: "Assigned shop work orders only — no WO creation, no billing, no admin" },
      { role: "on_site_tech",      urlRole: "technician",      label: "On-Site Technician", desc: "Mobile/field work orders, on-site dispatch — no billing, no admin" },
    ],
  },
  {
    label: "Marketplace Portal",
    color: "#b45309",
    bg: "#fffbeb",
    roles: [
      { role: "public_bidder",      urlRole: "public_bidder",  label: "Public Bidder",      desc: "Marketplace browsing, auction bidding, escrow payments" },
      { role: "consignor",          urlRole: "consignor",      label: "Consignor",           desc: "Consignment listings, offer management, payout tracking" },
      { role: "independent_bidder", urlRole: "bidder",         label: "Independent Bidder",  desc: "Independent dealer bidding portal — verified dealer accounts only" },
      { role: "marketplace_admin",  urlRole: "operator_admin", label: "Marketplace Admin",   desc: "Full marketplace oversight — members, listings, auctions, escrow, reports" },
      { role: "marketplace_staff",  urlRole: "operator_staff", label: "Marketplace Staff",   desc: "Marketplace moderation — listings, bids, member management" },
    ],
  },
];

export default function DevAccessV7() {
  const { user: clerkUser, isLoaded } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const active = typeof window !== "undefined"
    ? localStorage.getItem("ds360-dev-role") ?? undefined
    : undefined;

  const enter = (role: RoleCard) => {
    setLoading(role.role);
    localStorage.setItem("ds360-dev-role", role.urlRole as UserRole);
    window.location.href = PORTAL_TARGETS[role.role] ?? "/";
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
            <div style={{ fontSize: 13, fontWeight: 700, color: "#033280", textTransform: "uppercase", letterSpacing: "1px" }}>Dev Access — V7</div>
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
          <a href="/dev-access" style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#64748b", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
            ← V6 Portals
          </a>
        </div>
      </div>

      {/* Warning */}
      <div style={{ background: "#fef3c7", borderBottom: "1px solid #fcd34d", padding: "10px 40px", fontSize: 13, color: "#92400e" }}>
        <span style={{ fontWeight: 700 }}>⚠ Development Only</span>
        {" — Role override stored in localStorage (ds360-dev-role). useAuth() reads this before Clerk, giving any portal the selected role. These are the real V7 portals — changes made here are to the actual components. Clear before production testing."}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Select a Role to Preview</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 40 }}>
          Clicking a role sets ds360-dev-role in localStorage and navigates to the real V7 portal. These are the actual layout + page components — what you see here is what gets shipped.
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
                  const isActive = active === r.urlRole;
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
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>{PORTAL_TARGETS[r.role]}</div>
                      </div>
                      <button
                        onClick={() => enter(r)}
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
