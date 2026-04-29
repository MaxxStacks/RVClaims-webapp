import { useState } from "react";
import { PageLayout } from "@/components/page-layout";

// ─── Data ────────────────────────────────────────────────────────────────────

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance" | "coming_soon";

interface Release {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  changes: string[];
}

interface Upcoming {
  version: string;
  eta: string;
  features: string[];
}

interface ServiceDef {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  version: string | null;
  uptime30d: number | null;
  lastDeploy: string;
  managed?: boolean;
  releases: Release[];
  upcoming: Upcoming[];
}

interface Group {
  label: string;
  services: ServiceDef[];
}

const PORTAL_UPCOMING: Upcoming[] = [
  {
    version: "v2.2.0",
    eta: "May 2026",
    features: [
      "Stripe in-portal payments and wallet top-up",
      "WebSocket real-time notifications",
      "Transactional email via SendGrid / SES",
      "Customer ticket system (live)",
    ],
  },
  {
    version: "v2.3.0",
    eta: "June 2026",
    features: [
      "AI photo quality scanner for claim lines",
      "Progressive Web App (PWA) with offline support",
      "AI F&I Presenter (Tavus video avatar)",
      "Responsive mobile layout for all portals",
    ],
  },
  {
    version: "v3.0.0",
    eta: "Q3 2026",
    features: [
      "Dealer Suite 360 full US market launch",
      "Multi-currency support (USD / CAD)",
      "Advanced analytics dashboard",
      "Live auction streaming with real-time bidding",
    ],
  },
];

const GROUPS: Group[] = [
  {
    label: "Infrastructure",
    services: [
      {
        id: "api",
        name: "API Server",
        description: "Express.js / Node.js backend — claims, auth, marketplace, billing",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.91,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "JWT access + refresh token authentication (15 min / 7 day)",
              "PostgreSQL / Neon serverless integration via Drizzle ORM",
              "Clerk webhook integration for user sync",
              "Marketplace and auction REST endpoints",
              "WebSocket server scaffold (ws library)",
              "Rate limiting and input sanitization added to all public endpoints",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "Gen2 multi-tenant schema: dealers, dealer_users, operator_users, claim_lines",
              "FRC code database with per-manufacturer fuzzy search",
              "Signed URL file upload pipeline (Cloudflare R2)",
              "Billing engine: subscription (Plan A) and pre-funded wallet (Plan B)",
              "Invite + password-reset token flows",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "database",
        name: "Database",
        description: "PostgreSQL 15 via Neon Serverless — multi-tenant, row-level isolation",
        status: "operational",
        version: "PostgreSQL 15.4",
        uptime30d: 99.97,
        lastDeploy: "Apr 29, 2026",
        managed: true,
        releases: [
          {
            version: "Schema v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "marketplace_listings, marketplace_members, marketplace_transactions tables",
              "live_auctions, auction_bids tables with real-time escrow logic",
              "audit_log table for compliance tracking",
              "Full-text search index on frc_codes.search_vector",
            ],
          },
          {
            version: "Schema v2.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "Core multi-tenant tables: dealers, dealer_users, operator_users",
              "claim_lines, line_photos, inspection_photos — per-line tracking",
              "parts_orders, invoices, wallet_transactions, subscriptions",
              "notifications, units (expanded with VIN + warranty fields)",
            ],
          },
        ],
        upcoming: [
          {
            version: "Schema v2.2",
            eta: "May 2026",
            features: [
              "Stripe customer + subscription IDs on dealer records",
              "ticket_threads and ticket_messages tables",
              "Webhook event log for idempotency",
            ],
          },
        ],
      },
      {
        id: "auth",
        name: "Authentication",
        description: "Clerk identity platform — SSO, OAuth, MFA, session management",
        status: "operational",
        version: "Clerk SDK v5",
        uptime30d: 99.99,
        lastDeploy: "Apr 15, 2026",
        managed: true,
        releases: [
          {
            version: "Integration v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "publicMetadata.role used as RBAC source of truth across all portals",
              "Dev role override via localStorage (ds360-dev-role) for testing",
              "Clerk webhook → API sync on user.created / user.updated",
            ],
          },
        ],
        upcoming: [
          {
            version: "Integration v2.2",
            eta: "May 2026",
            features: [
              "Dealer invite flow via Clerk-issued magic links",
              "MFA enforcement for operator_admin role",
              "Session activity audit log",
            ],
          },
        ],
      },
      {
        id: "storage",
        name: "File Storage",
        description: "Cloudflare R2 object storage — per-dealer isolation, signed URLs",
        status: "operational",
        version: "Managed Service",
        uptime30d: 99.95,
        lastDeploy: "Apr 10, 2026",
        managed: true,
        releases: [
          {
            version: "Config v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "Signed upload URLs with 15-minute expiry",
              "Per-dealer folder isolation: /dealers/{dealer_id}/",
              "Automatic thumbnail generation on claim photo upload",
            ],
          },
        ],
        upcoming: [
          {
            version: "Config v2.2",
            eta: "May 2026",
            features: [
              "AI quality score triggered on upload via Anthropic Vision",
              "CDN caching headers for approved claim photos",
            ],
          },
        ],
      },
      {
        id: "email",
        name: "Email Service",
        description: "Transactional email — invites, claim updates, notifications",
        status: "maintenance",
        version: "Pending Integration",
        uptime30d: null,
        lastDeploy: "—",
        releases: [],
        upcoming: [
          {
            version: "v1.0",
            eta: "May 2026",
            features: [
              "SendGrid / AWS SES integration replacing raw SMTP",
              "Dealer invite and staff onboarding emails",
              "Claim status change notifications",
              "Low wallet balance and invoice payment alerts",
              "Weekly digest for operator team",
            ],
          },
        ],
      },
      {
        id: "payments",
        name: "Payment Processing",
        description: "Stripe — subscriptions, invoices, wallet top-up, escrow, Interac",
        status: "maintenance",
        version: "Pending Integration",
        uptime30d: null,
        lastDeploy: "—",
        releases: [],
        upcoming: [
          {
            version: "v1.0",
            eta: "May 2026",
            features: [
              "Stripe Billing: Plan A subscription (monthly recurring)",
              "Plan B: pre-funded wallet with auto top-up",
              "Per-claim fee auto-deduction from wallet balance",
              "Interac e-Transfer reconciliation for Canadian dealers",
              "Stripe Identity for bidder verification",
              "Auction escrow holds and release on win/loss",
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Web & Portals",
    services: [
      {
        id: "website",
        name: "Marketing Website",
        description: "dealersuite360.com · rvclaims.ca — public marketing, lead capture, sign-up",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "Blog, news, webinars, industry reports content pages",
              "Dealer training, help center, documentation pages",
              "API access, system status, and partner pages",
              "Careers and legal pages (terms, privacy, PIPEDA, cookie policy)",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "16-section homepage covering all 5 service categories",
              "Dealer sign-up with operator approval flow",
              "Dual-brand support: Dealer Suite 360 + RVClaims.ca white-label",
              "EN/FR bilingual throughout with browser auto-detection",
            ],
          },
          {
            version: "v1.0.0",
            date: "November 2025",
            type: "major",
            changes: ["Original marketing website launch (rvclaims.xyz)"],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "operator-portal",
        name: "Operator Portal",
        description: "Internal platform — claims processing, dealer management, billing, FRC codes",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "Clerk JWT auth with operator_admin / operator_staff RBAC",
              "PostgreSQL-backed claims, dealers, FRC codes with live API",
              "Marketplace and live auction management (escrow admin, member approvals)",
              "Communications hub and blog management pages",
              "CRM dealer directory with map view",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "36-page portal (1,227 lines TSX) — full operator OS",
              "Processing queue, batch review, stale claims dashboard",
              "Dealer management with 9-tab detail view + inline unit edit",
              "FRC code database browser with per-manufacturer filtering",
              "Wave-style create invoice with service + parts line items",
              "Dark mode + EN/FR toggle — all 284 translation pairs",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "dealer-portal",
        name: "Dealer Portal",
        description: "Dealer-facing platform — claims, units, TechFlow, marketplace, billing",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "8 distinct role viewports: dealer_owner, dealer_staff, technician, service_manager, shop_manager, parts_dept, public_bidder, consignor",
              "Drag-and-drop Dispatch Scheduler (owner and shop manager only)",
              "Job notes system on work orders — role-gated editing, all can view",
              "Allocated time display on every dispatch job card",
              "Role label shown in sidebar badge and footer (e.g. Technician, Shop Mgr)",
              "Clerk JWT auth with localStorage dev role override for testing",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "25-page portal (874 lines TSX) — full dealer OS",
              "Photo upload with push-to-claim flow",
              "TechFlow work orders and dispatch scheduler",
              "Marketplace browsing, listings, live auctions, and public showcase",
              "Customer portal management, ticket inbox, invite flow",
              "Branding & domain customisation with live preview",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "customer-portal",
        name: "Customer Portal",
        description: "End-customer access — unit warranty, claims tracking, support tickets",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "Clerk JWT auth, dealer-linked client accounts",
              "Live API reads for unit, warranty, and claim data",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "14-page portal (522 lines TSX)",
              "Warranty countdown cards with coverage progress bars",
              "Visual claim status timeline",
              "Support tickets with 7 issue categories + quick chat",
              "Protection plan product cards with OWNED ribbon",
              "Roadside Assist (coming soon placeholder)",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "bidder-portal",
        name: "Bidder Portal",
        description: "Independent bidder access — live monthly auctions, bids, escrow",
        status: "operational",
        version: "v2.1.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 29, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "V6 schema-driven portal with BidderMainNav component",
              "independent_bidder role gate with Access Denied screen for wrong roles",
              "Auto-snap to first visible page if current page becomes inaccessible",
              "PAGE_META + ROLES schema for future no-code menu updates",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 17, 2026",
            type: "major",
            changes: [
              "Self-registration bidder accounts (no dealer sponsorship required)",
              "Live monthly auction browsing, calendar, and real-time bidding scaffold",
              "Stripe escrow hold on each bid, release on win/loss",
              "Stripe Identity verification required before first bid",
              "Auto-provision as dealer client on winning a unit",
            ],
          },
        ],
        upcoming: [
          {
            version: "v2.2.0",
            eta: "May 2026",
            features: [
              "Live real-time bidding via WebSocket",
              "Stripe escrow hold integration live",
              "Outbid push notifications",
            ],
          },
          ...PORTAL_UPCOMING.slice(1),
        ],
      },
    ],
  },
  {
    label: "Mobile Applications",
    services: [
      {
        id: "ios",
        name: "iOS App",
        description: "Native iOS app — portals, push notifications, offline claim sync",
        status: "coming_soon",
        version: null,
        uptime30d: null,
        lastDeploy: "—",
        releases: [],
        upcoming: [
          {
            version: "v1.0.0",
            eta: "Q3 2026",
            features: [
              "Dealer and customer portal in native iOS wrapper",
              "Push notifications for claim status, low wallet, new tickets",
              "Camera integration for claim photo uploads (per line)",
              "Offline-first claim draft with background sync",
              "Face ID / Touch ID authentication",
              "App Store distribution (iOS 16+)",
            ],
          },
          {
            version: "v1.1.0",
            eta: "Q4 2026",
            features: [
              "Auction live bidding with real-time price feed",
              "Roadside assistance one-tap request",
              "Apple Pay for wallet top-up and invoice payments",
            ],
          },
        ],
      },
      {
        id: "android",
        name: "Android App",
        description: "Native Android app — portals, push notifications, offline claim sync",
        status: "coming_soon",
        version: null,
        uptime30d: null,
        lastDeploy: "—",
        releases: [],
        upcoming: [
          {
            version: "v1.0.0",
            eta: "Q3 2026",
            features: [
              "Dealer and customer portal in native Android wrapper",
              "FCM push notifications for claim updates and alerts",
              "Camera integration for claim photo uploads",
              "Offline-first claim drafts with background sync",
              "Biometric authentication",
              "Google Play Store distribution (Android 10+)",
            ],
          },
          {
            version: "v1.1.0",
            eta: "Q4 2026",
            features: [
              "Auction live bidding with real-time price feed",
              "Roadside assistance one-tap request",
              "Google Pay for wallet top-up and invoice payments",
            ],
          },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  operational:  { label: "Operational",   dot: "#22c55e", text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  degraded:     { label: "Degraded",      dot: "#f59e0b", text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  outage:       { label: "Outage",        dot: "#ef4444", text: "#b91c1c", bg: "#fef2f2", border: "#fca5a5" },
  maintenance:  { label: "Pending",       dot: "#6366f1", text: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  coming_soon:  { label: "Coming Soon",   dot: "#8b5cf6", text: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
};

const RELEASE_TYPE_COLOR: Record<Release["type"], string> = {
  major: "#2563eb",
  minor: "#16a34a",
  patch: "#6b7280",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SystemStatus() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "history" | "upcoming">>({});

  const allServices = GROUPS.flatMap(g => g.services);
  const anyIssue = allServices.some(s => s.status === "outage" || s.status === "degraded");
  const overallLabel = anyIssue ? "Service Disruption" : "All Systems Operational";
  const overallDot = anyIssue ? "#ef4444" : "#22c55e";
  const overallBg = anyIssue ? "#fef2f2" : "#f0fdf4";
  const overallBorder = anyIssue ? "#fca5a5" : "#bbf7d0";
  const overallText = anyIssue ? "#b91c1c" : "#15803d";

  const operationalCount = allServices.filter(s => s.status === "operational").length;

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id);
    setActiveTab(prev => ({ ...prev, [id]: prev[id] || "history" }));
  }

  function setTab(id: string, tab: "history" | "upcoming") {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  }

  return (
    <PageLayout
      seoTitle="System Status | Dealer Suite 360"
      seoDescription="Real-time status, version history, and upcoming updates for all Dealer Suite 360 services."
      canonical="/system-status"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 96, paddingBottom: 64, background: "linear-gradient(to bottom, #f8fafc, white)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#0f172a", marginBottom: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
            System Status
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", marginBottom: 32, fontFamily: "Inter, system-ui, sans-serif" }}>
            Real-time health, version history, and upcoming updates for all Dealer Suite 360 services.
          </p>

          {/* Overall banner */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: overallBg, border: `1px solid ${overallBorder}`,
            borderRadius: 16, padding: "14px 28px",
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%", background: overallDot,
              display: "inline-block", boxShadow: `0 0 0 4px ${overallDot}33`,
              animation: anyIssue ? "none" : "pulse 2s infinite",
            }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: overallText, fontFamily: "Inter, system-ui, sans-serif" }}>
              {overallLabel}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>99.9%</div>
              <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>30-day uptime</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#e2e8f0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>99.97%</div>
              <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>90-day uptime</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#e2e8f0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{operationalCount}/{allServices.length}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>Services operational</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#e2e8f0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>&lt; 150ms</div>
              <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>Avg API response</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
            Last updated: April 29, 2026 at 3:14 PM EST · Auto-refreshes every 60 seconds
          </p>
        </div>
      </section>

      {/* ── Service groups ───────────────────────────────────────────────── */}
      <section style={{ paddingBottom: 80, background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

          {GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 48 }}>
              <h2 style={{
                fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16,
                paddingBottom: 10, borderBottom: "2px solid #f1f5f9",
                fontFamily: "Inter, system-ui, sans-serif",
              }}>
                {group.label}
              </h2>

              <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {group.services.map((svc, idx) => {
                  const sc = STATUS_CONFIG[svc.status];
                  const isExpanded = expanded === svc.id;
                  const tab = activeTab[svc.id] || "history";
                  const isLast = idx === group.services.length - 1;

                  return (
                    <div key={svc.id} style={{ borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}>
                      {/* Service row */}
                      <div style={{
                        display: "flex", alignItems: "center", padding: "14px 20px",
                        background: isExpanded ? "#fafbfc" : "white",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                        onClick={() => toggleExpand(svc.id)}
                      >
                        {/* Status dot */}
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: sc.dot, flexShrink: 0, marginRight: 14,
                        }} />

                        {/* Name + description */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
                              {svc.name}
                            </span>
                            {svc.managed && (
                              <span style={{ fontSize: 10, color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 6px", fontWeight: 500 }}>
                                Managed
                              </span>
                            )}
                            {svc.version && (
                              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 4, padding: "1px 7px" }}>
                                {svc.version}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: "Inter, system-ui, sans-serif" }}>
                            {svc.description}
                          </div>
                        </div>

                        {/* Right side: uptime + status + chevron */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16, flexShrink: 0 }}>
                          {svc.uptime30d !== null && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
                                {svc.uptime30d}%
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>30d uptime</div>
                            </div>
                          )}
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: sc.text,
                            background: sc.bg, border: `1px solid ${sc.border}`,
                            borderRadius: 20, padding: "3px 10px",
                            whiteSpace: "nowrap",
                          }}>
                            {sc.label}
                          </span>
                          <svg
                            width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="#94a3b8" strokeWidth="2"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc", padding: "0 20px 20px" }}>
                          {/* Metadata row */}
                          <div style={{ display: "flex", gap: 24, padding: "12px 0 16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                              <strong>Last deployed:</strong> {svc.lastDeploy}
                            </span>
                            {svc.version && (
                              <span style={{ fontSize: 12, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                                <strong>Current version:</strong> {svc.version}
                              </span>
                            )}
                          </div>

                          {/* Tabs */}
                          {(svc.releases.length > 0 || svc.upcoming.length > 0) && (
                            <>
                              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                                {svc.releases.length > 0 && (
                                  <button
                                    onClick={() => setTab(svc.id, "history")}
                                    style={{
                                      fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6,
                                      border: "1px solid",
                                      borderColor: tab === "history" ? "#2563eb" : "#e2e8f0",
                                      background: tab === "history" ? "#eff6ff" : "white",
                                      color: tab === "history" ? "#2563eb" : "#64748b",
                                      cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
                                    }}
                                  >
                                    Release History
                                  </button>
                                )}
                                {svc.upcoming.length > 0 && (
                                  <button
                                    onClick={() => setTab(svc.id, "upcoming")}
                                    style={{
                                      fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6,
                                      border: "1px solid",
                                      borderColor: tab === "upcoming" ? "#7c3aed" : "#e2e8f0",
                                      background: tab === "upcoming" ? "#f5f3ff" : "white",
                                      color: tab === "upcoming" ? "#7c3aed" : "#64748b",
                                      cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
                                    }}
                                  >
                                    Upcoming
                                  </button>
                                )}
                              </div>

                              {/* History tab */}
                              {tab === "history" && svc.releases.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                  {svc.releases.map(rel => (
                                    <div key={rel.version} style={{
                                      background: "white", borderRadius: 8,
                                      border: "1px solid #e2e8f0", padding: "12px 16px",
                                    }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
                                          {rel.version}
                                        </span>
                                        <span style={{
                                          fontSize: 10, fontWeight: 700, color: "white",
                                          background: RELEASE_TYPE_COLOR[rel.type],
                                          borderRadius: 4, padding: "1px 6px", textTransform: "uppercase",
                                        }}>
                                          {rel.type}
                                        </span>
                                        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>{rel.date}</span>
                                      </div>
                                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {rel.changes.map((c, i) => (
                                          <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif" }}>
                                            {c}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upcoming tab */}
                              {tab === "upcoming" && svc.upcoming.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                  {svc.upcoming.map(up => (
                                    <div key={up.version} style={{
                                      background: "white", borderRadius: 8,
                                      border: "1px solid #ddd6fe", padding: "12px 16px",
                                      borderLeft: "3px solid #7c3aed",
                                    }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
                                          {up.version}
                                        </span>
                                        <span style={{
                                          fontSize: 10, fontWeight: 700, color: "#7c3aed",
                                          background: "#f5f3ff", border: "1px solid #ddd6fe",
                                          borderRadius: 4, padding: "1px 7px",
                                        }}>
                                          ETA {up.eta}
                                        </span>
                                      </div>
                                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {up.features.map((f, i) => (
                                          <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif" }}>
                                            {f}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {svc.releases.length === 0 && svc.upcoming.length === 0 && (
                            <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", fontFamily: "Inter, system-ui, sans-serif" }}>
                              No release history available yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 90-day uptime bars */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16, paddingBottom: 10, borderBottom: "2px solid #f1f5f9", fontFamily: "Inter, system-ui, sans-serif" }}>
              90-Day Uptime History
            </h2>
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>90 days ago</span>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>Today</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 90 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 28, borderRadius: 3, background: "#22c55e" }} title="100% uptime" />
                ))}
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {[["#22c55e", "No incidents"], ["#f59e0b", "Degraded"], ["#ef4444", "Outage"], ["#c7d2fe", "Maintenance"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                    <span style={{ fontSize: 11, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subscribe ────────────────────────────────────────────────────── */}
      <SubscribeSection />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </PageLayout>
  );
}

function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section style={{ padding: "64px 24px", background: "#f8fafc", textAlign: "center" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 8, fontFamily: "Inter, system-ui, sans-serif" }}>
        Get Status Updates
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, fontFamily: "Inter, system-ui, sans-serif" }}>
        Get notified by email when any service is created, updated, or resolved.
      </p>
      {done ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#15803d", fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          You're subscribed to status updates!
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setDone(true); }}
          style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: "1 1 240px", padding: "10px 14px", borderRadius: 8,
              border: "1px solid #e2e8f0", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif",
              background: "white", color: "#0f172a", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px", borderRadius: 8, background: "#2563eb",
              color: "white", fontWeight: 600, fontSize: 14, border: "none",
              cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
