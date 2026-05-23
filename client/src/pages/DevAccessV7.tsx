const PORTALS: { category: string; role: string; label: string; href: string }[] = [
  { category: "OPERATOR PORTAL",       role: "Operator Admin",      label: "Enter as Operator Admin →",      href: "/operator/admin/dashboard" },
  { category: "OPERATOR PORTAL",       role: "Operator Staff",      label: "Enter as Operator Staff →",      href: "/operator/staff/dashboard" },
  { category: "DEALER PORTAL",         role: "Dealer Owner",        label: "Enter as Dealer Owner →",        href: "/demo/owner/dashboard" },
  { category: "DEALER PORTAL",         role: "Dealer Staff",        label: "Enter as Dealer Staff →",        href: "/demo/staff/dashboard" },
  { category: "DEALER PORTAL",         role: "Client",              label: "Enter as Client →",              href: "/demo/client/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "Service Manager",     label: "Enter as Service Manager →",     href: "/demo/service-manager/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "Shop Manager",        label: "Enter as Shop Manager →",        href: "/demo/shop-manager/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "Parts Manager",       label: "Enter as Parts Manager →",       href: "/demo/parts-manager/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "Financial Manager",   label: "Enter as Financial Manager →",   href: "/demo/financial-manager/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "Shop Technician",     label: "Enter as Shop Technician →",     href: "/demo/shop-tech/dashboard" },
  { category: "DEALER SERVICE PORTAL", role: "On-Site Technician",  label: "Enter as On-Site Technician →",  href: "/demo/on-site-tech/dashboard" },
  { category: "MARKETPLACE PORTAL",    role: "Public Bidder",       label: "Enter as Public Bidder →",       href: "/marketplace/bidder/dashboard" },
  { category: "MARKETPLACE PORTAL",    role: "Consignor",           label: "Enter as Consignor →",           href: "/marketplace/consignor/dashboard" },
];

const CATEGORY_ORDER = ["OPERATOR PORTAL", "DEALER PORTAL", "DEALER SERVICE PORTAL", "MARKETPLACE PORTAL"];

const CATEGORY_COLORS: Record<string, string> = {
  "OPERATOR PORTAL":       "#033280",
  "DEALER PORTAL":         "#1a6b3a",
  "DEALER SERVICE PORTAL": "#7c3aed",
  "MARKETPLACE PORTAL":    "#b45309",
};

export default function DevAccessV7() {
  return (
    <div style={{ maxWidth: 600, margin: "60px auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", padding: 20 }}>
      <h1 style={{ fontSize: 22, color: "#033280", marginBottom: 6 }}>Dev Access — V7 (New URL Structure)</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>13 Portals · URL Routing · Session 3 Build</p>
      <p style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>
        Direct URL links — no role-setting. Each button navigates to the new route structure from Session 3.
      </p>

      {CATEGORY_ORDER.map(category => {
        const items = PORTALS.filter(p => p.category === category);
        const color = CATEGORY_COLORS[category];
        return (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: color, textTransform: "uppercase", marginBottom: 6 }}>
              {category}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {items.map(({ role, label, href }) => (
                <a
                  key={role}
                  href={href}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #d5dbe5",
                    borderRadius: 8,
                    background: "white",
                    fontSize: 13,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{role} → {href}</div>
                  </div>
                  <div style={{ color: color, fontSize: 18 }}>›</div>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 16, marginBottom: 12 }}>
        <strong>Dev only.</strong> These routes use the Session 3 URL structure with Layout + Page composition.
        Dealer routes use <code style={{ background: "#f0f2f5", padding: "1px 6px", borderRadius: 4 }}>/demo</code> as the placeholder dealerId.
      </p>

      <a href="/dev-access" style={{ fontSize: 12, color: "#666", textDecoration: "none" }}>
        ← View Old Portals (V6)
      </a>
    </div>
  );
}
