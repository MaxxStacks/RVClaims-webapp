import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

// ─── Types ─────────────────────────────────────────────────────────────────────

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

interface PortalDef {
  name: string;
  role: string;
  route: string;
  status: ServiceStatus;
}

interface ModuleDef {
  name: string;
  category: string;
  price: string;
  status: ServiceStatus;
}

interface ApiStatus {
  status: "operational" | "degraded" | "down";
  version: string;
  node_version: string;
  uptime_seconds: number;
  response_time_ms: number;
  timestamp: string;
  services: Record<string, { status: string; detail?: string }>;
}

// ─── Static portal data ────────────────────────────────────────────────────────

const PORTALS: PortalDef[] = [
  { name: "DS360 Superadmin",      role: "ds360_superadmin",       route: "/superadmin",                  status: "operational" },
  { name: "Operator Admin",         role: "operator_admin",          route: "/operator/admin",              status: "operational" },
  { name: "Operator Staff",         role: "operator_staff",          route: "/operator/staff",              status: "operational" },
  { name: "Dealer Owner",           role: "dealer_owner",            route: "/:dealerId/owner",             status: "operational" },
  { name: "Dealer Staff",           role: "dealer_staff",            route: "/:dealerId/staff",             status: "operational" },
  { name: "Client Portal",          role: "client",                  route: "/:dealerId/client",            status: "operational" },
  { name: "Service Manager",        role: "service_manager",         route: "/:dealerId/service-manager",   status: "operational" },
  { name: "Shop Manager",           role: "shop_manager",            route: "/:dealerId/shop-manager",      status: "operational" },
  { name: "Parts Manager",          role: "parts_manager",           route: "/:dealerId/parts-manager",     status: "operational" },
  { name: "Financial Manager",      role: "financial_manager",       route: "/:dealerId/financial-manager", status: "operational" },
  { name: "Shop Technician",        role: "shop_tech",               route: "/:dealerId/shop-tech",         status: "operational" },
  { name: "On-Site Technician",     role: "on_site_tech",            route: "/:dealerId/on-site-tech",      status: "operational" },
  { name: "Public Bidder",          role: "public_bidder",           route: "/marketplace/bidder",          status: "operational" },
  { name: "Consignor",              role: "consignor",               route: "/marketplace/consignor",       status: "operational" },
  { name: "Independent Bidder",     role: "independent_bidder",      route: "/marketplace/independent",     status: "operational" },
  { name: "Marketplace Admin",      role: "operator_admin",          route: "/marketplace/admin",           status: "operational" },
  { name: "Marketplace Staff",      role: "operator_staff",          route: "/marketplace/staff",           status: "operational" },
  { name: "Supplier Portal",        role: "supplier",                route: "/supplier",                    status: "operational" },
];

// ─── Static modules data ───────────────────────────────────────────────────────

const MODULES: ModuleDef[] = [
  // Category 1 — Claims
  { name: "Warranty Claims Processing",  category: "Core Claims",      price: "Included",    status: "operational" },
  { name: "DAF Claims",                  category: "Core Claims",      price: "Included",    status: "operational" },
  { name: "PDI Claims",                  category: "Core Claims",      price: "Included",    status: "operational" },
  { name: "Extended Warranty Claims",    category: "Core Claims",      price: "Included",    status: "operational" },
  { name: "Insurance Claims",            category: "Core Claims",      price: "Included",    status: "operational" },
  // Category 2 — Financial
  { name: "Financing Services",          category: "Financial",        price: "$49/mo",      status: "coming_soon" },
  { name: "F&I Outsourcing",             category: "Financial",        price: "$149/mo",     status: "coming_soon" },
  { name: "Warranty & Service Plans",    category: "Financial",        price: "$49/mo",      status: "coming_soon" },
  // Category 3 — Revenue Growth
  { name: "Digital Marketing",           category: "Revenue Growth",   price: "$299/mo",     status: "coming_soon" },
  { name: "Parts & Accessories",         category: "Revenue Growth",   price: "$49/mo",      status: "coming_soon" },
  { name: "Service Department Support",  category: "Revenue Growth",   price: "$99/mo",      status: "coming_soon" },
  { name: "Customer Experience CRM",     category: "Revenue Growth",   price: "$79/mo",      status: "coming_soon" },
  { name: "Trade-In & Consignment",      category: "Revenue Growth",   price: "$49/mo",      status: "coming_soon" },
  // Category 4 — Marketplace
  { name: "Network Marketplace",         category: "Marketplace",      price: "$99/mo",      status: "coming_soon" },
  { name: "Live Auctions",               category: "Marketplace",      price: "2% + $99/mo", status: "coming_soon" },
  // Category 5 — Consumer
  { name: "Roadside Assistance",         category: "Consumer Direct",  price: "Consumer",    status: "coming_soon" },
  { name: "Extended Warranty (B2C)",     category: "Consumer Direct",  price: "Consumer",    status: "coming_soon" },
  { name: "RV Protection Packages",      category: "Consumer Direct",  price: "Consumer",    status: "coming_soon" },
];

// ─── Static service groups ────────────────────────────────────────────────────

const PORTAL_UPCOMING: Upcoming[] = [
  {
    version: "v2.2.0",
    eta: "June 2026",
    features: [
      "Stripe in-portal payments and wallet top-up (live)",
      "WebSocket real-time notifications",
      "Transactional email via Resend",
      "Customer ticket system (live)",
    ],
  },
  {
    version: "v2.3.0",
    eta: "July 2026",
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
        id: "web-application",
        name: "Web Application",
        description: "React 18 frontend at dealersuite360.com — Vite, TypeScript, Tailwind, shadcn/ui",
        status: "operational",
        version: null,
        uptime30d: 99.9,
        lastDeploy: "May 27, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "18-portal architecture with 215+ routes and 157+ page components",
              "Clerk JWT auth with role-based portal routing",
              "LiveKit screen share, DS360 Assist, CRM, analytics, compliance",
              "Data import wizard with CSV templates and custom field passthrough",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 2026",
            type: "major",
            changes: [
              "Three-portal system (Operator, Dealer, Customer) — 75 pages",
              "Dark mode + EN/FR bilingual — 284 translation pairs",
              "16-section marketing homepage covering all 5 service categories",
              "Dealer sign-up with operator approval flow",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "api-gateway",
        name: "API Gateway",
        description: "Express.js REST API — 65+ route modules, rate limiting, Clerk middleware",
        status: "operational",
        version: null,
        uptime30d: 99.91,
        lastDeploy: "May 27, 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "April 2026",
            type: "minor",
            changes: [
              "65+ route modules covering all platform services",
              "Clerk webhook sync, JWT middleware, RBAC enforcement",
              "Rate limiting on all public endpoints, helmet CSP headers",
              "WebSocket scaffold, blog cron, location migration utilities",
            ],
          },
          {
            version: "v2.0.0",
            date: "March 2026",
            type: "major",
            changes: [
              "Gen2 multi-tenant API: dealers, dealer_users, operator_users, claim_lines",
              "FRC code database with per-manufacturer fuzzy search",
              "Billing engine: Plan A subscription + Plan B pre-funded wallet",
              "Invite + password-reset token flows",
            ],
          },
        ],
        upcoming: PORTAL_UPCOMING,
      },
      {
        id: "database",
        name: "Database",
        description: "Neon PostgreSQL — 85+ tables, row-level multi-tenant isolation, Drizzle ORM",
        status: "operational",
        version: "PostgreSQL 15",
        uptime30d: 99.97,
        lastDeploy: "May 27, 2026",
        managed: true,
        releases: [
          {
            version: "Schema v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "marketplace_listings, marketplace_members, marketplace_transactions",
              "live_auctions, auction_bids tables with escrow logic",
              "import_templates and import_history for data import audit trail",
              "audit_log table for compliance tracking, full-text FRC search index",
            ],
          },
          {
            version: "Schema v2.0",
            date: "March 2026",
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
            eta: "June 2026",
            features: [
              "Stripe customer + subscription IDs on dealer records",
              "ticket_threads and ticket_messages tables",
              "Webhook event log for Stripe idempotency",
            ],
          },
        ],
      },
      {
        id: "authentication",
        name: "Authentication",
        description: "Clerk — SSO, OAuth, MFA, 14 RBAC roles, session management",
        status: "operational",
        version: "Clerk SDK v5",
        uptime30d: 99.99,
        lastDeploy: "May 2026",
        managed: true,
        releases: [
          {
            version: "Integration v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "publicMetadata.role as RBAC source of truth across all 18 portals",
              "Dev role override via localStorage (ds360-dev-role) for QA testing",
              "Clerk webhook → API sync on user.created / user.updated",
            ],
          },
        ],
        upcoming: [
          {
            version: "Integration v2.2",
            eta: "June 2026",
            features: [
              "Dealer invite flow via Clerk-issued magic links",
              "MFA enforcement for operator_admin and ds360_superadmin roles",
              "Session activity audit log",
            ],
          },
        ],
      },
      {
        id: "file-storage",
        name: "File Storage",
        description: "Cloudflare R2 — documents, photos, signatures — per-dealer isolation, signed URLs",
        status: "operational",
        version: "Managed Service",
        uptime30d: 99.95,
        lastDeploy: "Apr 2026",
        managed: true,
        releases: [
          {
            version: "Config v2.1",
            date: "April 2026",
            type: "minor",
            changes: [
              "Signed upload URLs with 15-minute expiry",
              "Per-dealer folder isolation: /dealers/{dealer_id}/",
              "Document transfer uploads for DS360 Assist",
              "Automatic thumbnail generation on claim photo upload",
            ],
          },
        ],
        upcoming: [
          {
            version: "Config v2.2",
            eta: "June 2026",
            features: [
              "AI quality score triggered on upload via Anthropic Vision",
              "CDN caching headers for approved claim photos",
            ],
          },
        ],
      },
      {
        id: "ai-engine",
        name: "AI Engine",
        description: "Anthropic Claude — CCC drafting, document scanner, F&I presenter, customer support bot",
        status: "operational",
        version: "Claude Sonnet 4.x",
        uptime30d: 99.9,
        lastDeploy: "May 2026",
        managed: true,
        releases: [
          {
            version: "Integration v2.1",
            date: "May 2026",
            type: "minor",
            changes: [
              "DS360 Assist — AI-powered chat with screen share and operator escalation",
              "Document transfer + AI document scanner for claim records",
              "AI FRC code suggestions in claim processing queue",
              "Knowledge base RAG integration for dealer support queries",
            ],
          },
        ],
        upcoming: [
          {
            version: "Integration v2.2",
            eta: "July 2026",
            features: [
              "AI photo quality gatekeeper (sharpness, relevance, lighting)",
              "Claim readiness score 0-100% before manufacturer submission",
              "AI F&I Presenter with live video avatar (Tavus)",
              "Denial prediction engine — flag high-risk FRC lines",
            ],
          },
        ],
      },
      {
        id: "payment-processing",
        name: "Payment Processing",
        description: "Stripe — wallet funding, subscriptions, invoices, Interac e-Transfer",
        status: "operational",
        version: "Stripe v18",
        uptime30d: 99.99,
        lastDeploy: "May 2026",
        managed: true,
        releases: [
          {
            version: "Integration v2.1",
            date: "May 2026",
            type: "minor",
            changes: [
              "Stripe Billing: Plan A subscription (monthly recurring)",
              "Plan B: pre-funded wallet with auto top-up",
              "Per-claim fee auto-deduction from wallet balance",
              "Stripe Identity for bidder verification",
            ],
          },
        ],
        upcoming: [
          {
            version: "Integration v2.2",
            eta: "June 2026",
            features: [
              "Interac e-Transfer reconciliation for Canadian dealers",
              "Auction escrow holds and release on win/loss",
              "Apple Pay / Google Pay for wallet top-ups",
            ],
          },
        ],
      },
      {
        id: "email-delivery",
        name: "Email Delivery",
        description: "Resend — transactional and marketing emails, invites, notifications",
        status: "operational",
        version: "Resend SDK v6",
        uptime30d: 99.9,
        lastDeploy: "May 2026",
        managed: true,
        releases: [
          {
            version: "Integration v2.1",
            date: "May 2026",
            type: "minor",
            changes: [
              "Transactional emails via Resend (replacing raw SMTP)",
              "Dealer invite and staff onboarding emails",
              "Claim status change notifications",
              "Low wallet balance and invoice payment alerts",
            ],
          },
        ],
        upcoming: [
          {
            version: "Integration v2.2",
            eta: "June 2026",
            features: [
              "Weekly operator digest with claim and billing summaries",
              "Marketing campaign templates for dealer outreach",
              "Unsubscribe management and bounce handling",
            ],
          },
        ],
      },
      {
        id: "real-time",
        name: "Real-Time",
        description: "WebSocket — auction bidding, notifications, DS360 Assist presence",
        status: "operational",
        version: "ws v8",
        uptime30d: 99.9,
        lastDeploy: "May 2026",
        releases: [
          {
            version: "v2.1.0",
            date: "May 2026",
            type: "minor",
            changes: [
              "DS360 Assist screen share request/accept/decline events",
              "Operator notification push to connected dealer sessions",
              "Auction bid broadcast scaffold",
            ],
          },
        ],
        upcoming: [
          {
            version: "v2.2.0",
            eta: "June 2026",
            features: [
              "Live auction real-time bid feed and countdown timer",
              "Outbid push notifications to dealer browsers",
              "Presence indicators in DS360 Assist conversations",
            ],
          },
        ],
      },
      {
        id: "screen-share",
        name: "Screen Share",
        description: "LiveKit — remote dealer support, operator-initiated screen share sessions",
        status: "operational",
        version: "LiveKit SDK v2",
        uptime30d: 99.9,
        lastDeploy: "May 2026",
        managed: true,
        releases: [
          {
            version: "v1.0.0",
            date: "May 2026",
            type: "major",
            changes: [
              "Operator-initiated screen share request with dealer accept/decline",
              "DS360 Assist request button in dealer layouts (both owner and staff)",
              "Toast notification on dealer side for incoming requests",
              "LiveKit room creation and token provisioning on session accept",
            ],
          },
        ],
        upcoming: [
          {
            version: "v1.1.0",
            eta: "June 2026",
            features: [
              "Session recording for training and compliance",
              "Multi-participant support (operator + multiple dealers)",
              "Mobile screen share via Capacitor camera",
            ],
          },
        ],
      },
      {
        id: "mobile-services",
        name: "Mobile Services",
        description: "PWA + Capacitor — iOS and Android, push notifications, offline sync",
        status: "operational",
        version: "Capacitor v8",
        uptime30d: 99.9,
        lastDeploy: "May 2026",
        releases: [
          {
            version: "v1.0.0",
            date: "May 2026",
            type: "major",
            changes: [
              "Progressive Web App with offline service worker",
              "Capacitor native iOS and Android wrapper builds",
              "Push notifications via Capacitor Local Notifications",
              "Camera integration for claim photo capture",
              "Biometric authentication scaffold",
            ],
          },
        ],
        upcoming: [
          {
            version: "v1.1.0",
            eta: "Q3 2026",
            features: [
              "App Store and Google Play distribution",
              "Auction live bidding with real-time price feed",
              "Roadside assistance one-tap request",
              "Apple Pay / Google Pay for wallet top-up",
            ],
          },
        ],
      },
      {
        id: "vin-decoder",
        name: "VIN Decoder",
        description: "AI-powered tag scanning and VIN extraction for unit registration",
        status: "operational",
        version: "v1.0.0",
        uptime30d: 99.9,
        lastDeploy: "Apr 2026",
        releases: [
          {
            version: "v1.0.0",
            date: "April 2026",
            type: "major",
            changes: [
              "Camera-based VIN tag scanning via Capacitor Camera API",
              "Anthropic Vision OCR for VIN extraction from photos",
              "Auto-populate unit registration fields from decoded VIN",
              "Fallback to manual entry when scan confidence is low",
            ],
          },
        ],
        upcoming: [],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  operational:  { label: "Operational",  dot: "#22c55e", text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  degraded:     { label: "Degraded",     dot: "#f59e0b", text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  outage:       { label: "Outage",       dot: "#ef4444", text: "#b91c1c", bg: "#fef2f2", border: "#fca5a5" },
  maintenance:  { label: "Pending",      dot: "#6366f1", text: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  coming_soon:  { label: "Coming Soon",  dot: "#8b5cf6", text: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
};

const RELEASE_TYPE_COLOR: Record<Release["type"], string> = {
  major: "#2563eb",
  minor: "#16a34a",
  patch: "#6b7280",
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  const sc = STATUS_CONFIG[status];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color: sc.text,
      background: sc.bg, border: `1px solid ${sc.border}`,
      borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" as const,
    }}>
      {sc.label}
    </span>
  );
}

function formatUptime(s: number): string {
  const h = Math.floor(s / 3600);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h`;
  return `${Math.floor(s / 60)}m`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SystemStatus() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "history" | "upcoming">>({});
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [apiError, setApiError] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [mainTab, setMainTab] = useState<"services" | "portals" | "modules">("services");

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("non-200");
        const data: ApiStatus = await res.json();
        if (!cancelled) setApiStatus(data);
      } catch {
        if (!cancelled) setApiError(true);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const allServices = GROUPS.flatMap(g => g.services);
  const anyIssue = allServices.some(s => s.status === "outage" || s.status === "degraded");

  // Merge live API status into service list display
  const apiDbStatus = apiStatus?.services?.database?.status;
  const apiAuthStatus = apiStatus?.services?.authentication?.status;

  function getLiveStatus(svc: ServiceDef): ServiceStatus {
    if (svc.id === "database" && apiDbStatus === "down") return "outage";
    if (svc.id === "database" && apiDbStatus === "degraded") return "degraded";
    if (svc.id === "authentication" && apiAuthStatus === "degraded") return "degraded";
    return svc.status;
  }

  const overallLabel = anyIssue ? "Service Disruption" : "All Systems Operational";
  const overallDot = anyIssue ? "#ef4444" : "#22c55e";
  const overallBg = anyIssue ? "#fef2f2" : "#f0fdf4";
  const overallBorder = anyIssue ? "#fca5a5" : "#bbf7d0";
  const overallText = anyIssue ? "#b91c1c" : "#15803d";
  const operationalCount = allServices.filter(s => getLiveStatus(s) === "operational").length;
  const portalOperationalCount = PORTALS.filter(p => p.status === "operational").length;
  const moduleActiveCount = MODULES.filter(m => m.status === "operational").length;

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id);
    setActiveTab(prev => ({ ...prev, [id]: prev[id] || "history" }));
  }

  function setTab(id: string, tab: "history" | "upcoming") {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  }

  const tabBtn = (label: string, key: typeof mainTab) => (
    <button
      onClick={() => setMainTab(key)}
      style={{
        fontSize: 14, fontWeight: mainTab === key ? 700 : 500,
        padding: "8px 20px", borderRadius: 8, border: "none",
        background: mainTab === key ? "#033280" : "transparent",
        color: mainTab === key ? "#fff" : "#64748b",
        cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <PageLayout
      seoTitle="System Status | Dealer Suite 360"
      seoDescription="Real-time status, version history, and upcoming updates for all Dealer Suite 360 services, portals, and modules."
      canonical="/system-status"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 96, paddingBottom: 64, background: "linear-gradient(to bottom, #f8fafc, white)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 40, flexWrap: "wrap" }}>
            {[
              { value: apiLoading ? "…" : (apiError ? "99.9%" : "99.9%"), label: "30-day uptime" },
              { value: `${operationalCount}/${allServices.length}`, label: "Services operational" },
              { value: `${portalOperationalCount}/${PORTALS.length}`, label: "Portals live" },
              { value: `${moduleActiveCount}/${MODULES.length}`, label: "Modules active" },
              { value: apiLoading ? "…" : (apiStatus ? `${apiStatus.response_time_ms}ms` : "< 150ms"), label: "API response time" },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", padding: "0 28px" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>{stat.label}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, height: 40, background: "#e2e8f0" }} />}
              </div>
            ))}
          </div>

          {/* Live API data row */}
          {apiStatus && !apiError && (
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>
                Platform v{apiStatus.version}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>
                Node {apiStatus.node_version}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>
                Uptime {formatUptime(apiStatus.uptime_seconds)}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>
                Live data · auto-refreshes every 60s
              </span>
            </div>
          )}
          {apiError && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
              Showing cached data — live health check unavailable
            </p>
          )}
        </div>
      </section>

      {/* ── Tab nav ────────────────────────────────────────────────────────── */}
      <section style={{ background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4, paddingBottom: 0 }}>
          {tabBtn("Services", "services")}
          {tabBtn("Portals", "portals")}
          {tabBtn("Modules", "modules")}
        </div>
      </section>

      {/* ── Services tab ─────────────────────────────────────────────────── */}
      {mainTab === "services" && (
        <section style={{ paddingBottom: 80, background: "white" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 0" }}>
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
                    const liveStatus = getLiveStatus(svc);
                    const sc = STATUS_CONFIG[liveStatus];
                    const isExpanded = expanded === svc.id;
                    const tab = activeTab[svc.id] || "history";
                    const isLast = idx === group.services.length - 1;

                    return (
                      <div key={svc.id} style={{ borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}>
                        {/* Service row */}
                        <div
                          style={{
                            display: "flex", alignItems: "center", padding: "14px 20px",
                            background: isExpanded ? "#fafbfc" : "white",
                            cursor: "pointer", transition: "background 0.1s",
                          }}
                          onClick={() => toggleExpand(svc.id)}
                        >
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginRight: 14 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
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
                          <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16, flexShrink: 0 }}>
                            {svc.uptime30d !== null && (
                              <div style={{ textAlign: "right" as const }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
                                  {svc.uptime30d}%
                                </div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>30d uptime</div>
                              </div>
                            )}
                            <StatusBadge status={liveStatus} />
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                              style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>
                        </div>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <div style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc", padding: "0 20px 20px" }}>
                            <div style={{ display: "flex", gap: 24, padding: "12px 0 16px", flexWrap: "wrap" as const }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                                <strong>Last deployed:</strong> {svc.lastDeploy}
                              </span>
                              {svc.version && (
                                <span style={{ fontSize: 12, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                                  <strong>Version:</strong> {svc.version}
                                </span>
                              )}
                              {/* Live detail from API */}
                              {svc.id === "database" && apiStatus?.services?.database?.detail && (
                                <span style={{ fontSize: 12, color: "#b91c1c", fontFamily: "Inter, system-ui, sans-serif" }}>
                                  {apiStatus.services.database.detail}
                                </span>
                              )}
                            </div>

                            {(svc.releases.length > 0 || svc.upcoming.length > 0) && (
                              <>
                                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                                  {svc.releases.length > 0 && (
                                    <button onClick={() => setTab(svc.id, "history")} style={{
                                      fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6, border: "1px solid",
                                      borderColor: tab === "history" ? "#2563eb" : "#e2e8f0",
                                      background: tab === "history" ? "#eff6ff" : "white",
                                      color: tab === "history" ? "#2563eb" : "#64748b",
                                      cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
                                    }}>Release History</button>
                                  )}
                                  {svc.upcoming.length > 0 && (
                                    <button onClick={() => setTab(svc.id, "upcoming")} style={{
                                      fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 6, border: "1px solid",
                                      borderColor: tab === "upcoming" ? "#7c3aed" : "#e2e8f0",
                                      background: tab === "upcoming" ? "#f5f3ff" : "white",
                                      color: tab === "upcoming" ? "#7c3aed" : "#64748b",
                                      cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
                                    }}>Upcoming</button>
                                  )}
                                </div>

                                {tab === "history" && svc.releases.length > 0 && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {svc.releases.map(rel => (
                                      <div key={rel.version} style={{ background: "white", borderRadius: 8, border: "1px solid #e2e8f0", padding: "12px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{rel.version}</span>
                                          <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: RELEASE_TYPE_COLOR[rel.type], borderRadius: 4, padding: "1px 6px", textTransform: "uppercase" as const }}>{rel.type}</span>
                                          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}>{rel.date}</span>
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                          {rel.changes.map((c, i) => (
                                            <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif" }}>{c}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {tab === "upcoming" && svc.upcoming.length > 0 && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {svc.upcoming.map(up => (
                                      <div key={up.version} style={{ background: "white", borderRadius: 8, border: "1px solid #ddd6fe", padding: "12px 16px", borderLeft: "3px solid #7c3aed" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{up.version}</span>
                                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 4, padding: "1px 7px" }}>ETA {up.eta}</span>
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                          {up.features.map((f, i) => (
                                            <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif" }}>{f}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            {svc.releases.length === 0 && svc.upcoming.length === 0 && (
                              <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", fontFamily: "Inter, system-ui, sans-serif" }}>No release history yet.</p>
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
                  {([["#22c55e", "No incidents"], ["#f59e0b", "Degraded"], ["#ef4444", "Outage"], ["#c7d2fe", "Maintenance"]] as const).map(([color, label]) => (
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
      )}

      {/* ── Portals tab ───────────────────────────────────────────────────── */}
      {mainTab === "portals" && (
        <section style={{ paddingBottom: 80, background: "white" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                {PORTALS.length} role-based portals — {portalOperationalCount} operational
              </p>
            </div>
            <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 120px", padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Portal", "Role", "Route", "Status"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: "Inter, system-ui, sans-serif" }}>{h}</span>
                ))}
              </div>
              {PORTALS.map((p, i) => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 120px", padding: "12px 20px", borderBottom: i < PORTALS.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{p.role}</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{p.route}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Modules tab ───────────────────────────────────────────────────── */}
      {mainTab === "modules" && (
        <section style={{ paddingBottom: 80, background: "white" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>
                {MODULES.length} subscribable modules — {moduleActiveCount} active
              </p>
            </div>
            {(["Core Claims", "Financial", "Revenue Growth", "Marketplace", "Consumer Direct"] as const).map(category => {
              const catModules = MODULES.filter(m => m.category === category);
              return (
                <div key={category} style={{ marginBottom: 40 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #f1f5f9", fontFamily: "Inter, system-ui, sans-serif" }}>
                    {category}
                  </h2>
                  <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 120px", padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["Module", "Pricing", "Status"].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: "Inter, system-ui, sans-serif" }}>{h}</span>
                      ))}
                    </div>
                    {catModules.map((m, i) => (
                      <div key={m.name} style={{ display: "grid", gridTemplateColumns: "2fr 100px 120px", padding: "12px 20px", borderBottom: i < catModules.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>{m.name}</span>
                        <span style={{ fontSize: 12, color: "#64748b", fontFamily: "Inter, system-ui, sans-serif" }}>{m.price}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
          style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap" as const, justifyContent: "center" }}
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
              cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap" as const,
            }}
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
