// BidderPortalV6 — generated from v6 schema. Do not hand-edit menu structure;
// edit /schema/v6.json and regenerate.
// Preserves existing sidebar CSS classes (sidebar, sidebar-nav, nav-section, nav-label, nav-item, nb-* badges).

import { useState, useEffect } from "react";
import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useApiFetch } from "@/lib/api";
import AppBar from "@/components/AppBar";

// ============================================================================
// V6 SCHEMA METADATA — role-scoping and RBAC rules baked in
// ============================================================================

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"bidder.main.dashboard": {"menu_item": "Dashboard", "section": "Main", "scoped_role": ""}, "bidder.main.live_auctions": {"menu_item": "Live Monthly Auctions", "section": "Main", "scoped_role": ""}, "bidder.main.browse": {"menu_item": "Browse Units", "section": "Main", "scoped_role": ""}, "bidder.main.my_bids": {"menu_item": "My Bids", "section": "Main", "scoped_role": ""}, "bidder.main.escrow": {"menu_item": "Escrow & Payments", "section": "Main", "scoped_role": ""}, "bidder.account.profile": {"menu_item": "Profile", "section": "Account", "scoped_role": ""}, "bidder.account.verification": {"menu_item": "Verification", "section": "Account", "scoped_role": ""}, "bidder.account.payment_methods": {"menu_item": "Payment Methods", "section": "Account", "scoped_role": ""}, "bidder.account.settings": {"menu_item": "Settings", "section": "Account", "scoped_role": ""}};

const ROLES: Record<string, any> = {"operator_admin": {"label": "Operator Admin", "login_portal": "ds360_master", "created_by": "system (first operator account)", "scope": "full_platform", "can_create": ["operator_staff", "dealer_owner"], "description": "Full access to every page on the Operator Portal including billing, commissions, Stripe admin, and platform settings."}, "operator_staff": {"label": "Operator Staff", "login_portal": "ds360_master", "created_by": "operator_admin (via Staff & Permissions)", "scope": "operations_claims_no_billing", "can_create": [], "blocked_pages": ["master.mgmt.revenue_billing", "master.mgmt.campaign_templates", "master.mgmt.communications", "master.mgmt.blog", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"], "scoped_pages": {"master.mgmt.dealer_accounts": "read_only_no_billing", "master.mgmt.financing_partners": "no_commission_visible", "master.mgmt.consignment_oversight": "no_payout_amounts", "master.ops.work_by_dealer": "no_invoice_section", "master.ops.reporting": "no_revenue_per_dealer"}, "description": "Claims processing, warranty verification, parts coordination. Cannot see billing, commissions, staff management, or platform settings."}, "dealer_owner": {"label": "Dealer Owner", "login_portal": "dealer", "created_by": "operator_admin (on new dealer creation)", "scope": "full_dealership_inc_billing", "can_create": ["dealer_staff", "technician", "public_bidder (scoped)", "consignor (scoped)", "client"], "description": "Full access to their Dealer Portal including billing, subscription, staff/tech management, marketplace bidding, and partner account creation."}, "dealer_staff": {"label": "Dealer Staff", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "operations_no_billing_no_admin", "can_create": [], "blocked_pages": ["dealer.account.my_subscription", "dealer.account.portal_settings", "dealer.marketplace.escrow_payments"], "scoped_pages": {"dealer.ops.dashboard": "no_revenue_snapshot", "dealer.ops.sales_services": "no_commission_tracker", "dealer.ops.consignment": "no_payout_amounts", "dealer.ops.documents": "no_ds360_invoices", "dealer.ops.parts_store": "no_revenue_tracker"}, "description": "Operational access \u2014 claims, units, clients, sales entry, parts fulfillment, techflow coordination. No billing, no staff management, no subscription, no escrow."}, "technician": {"label": "Technician", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Technicians tab)", "scope": "techflow_own_work_orders_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.ops.claims", "dealer.ops.techflow"], "scoped_pages": {"dealer.ops.dashboard": "tech_view_my_jobs_today", "dealer.ops.claims": "read_only_own_workorder_claims", "dealer.ops.techflow": "own_work_orders_schedule_timelog"}, "description": "Sees only their own work orders, schedule, time log, and read-only access to claims tied to their work. No access to inventory, clients, financials, or any admin functions."}, "public_bidder": {"label": "Public Bidder (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Partners tab)", "scope": "marketplace_public_showcase_own_bids_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.marketplace.browse", "dealer.marketplace.public_showcase", "dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"], "header_label": "[Dealer Name] \u2014 Marketplace Access", "description": "CC-verified bidder sponsored by a specific dealer. Sees only Public Showcase listings (not full dealer-to-dealer marketplace), own bids, own verification + payment methods. Scoped to sponsoring dealer."}, "independent_bidder": {"label": "Independent Bidder (Live Monthly Auctions)", "login_portal": "bidder", "created_by": "self-registration on Bidder Portal", "scope": "live_monthly_auctions_until_won", "can_create": [], "allowed_pages_only": ["bidder.main.dashboard", "bidder.main.live_auctions", "bidder.main.browse", "bidder.main.my_bids", "bidder.main.escrow", "bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"], "becomes_client_on_win": true, "description": "Standalone buyer account for Live Monthly public auctions. Not linked to any dealer until they win a unit, at which point they auto-provision as a client of the winning unit's selling dealer."}, "consignor": {"label": "Consignor (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Consignment > Add Consignor)", "scope": "own_consigned_units_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"], "header_label": "[Dealer Name] \u2014 Consignment Portal", "description": "Third party whose unit a dealer is selling on consignment. View-only of their own consigned unit(s), offers/bids on their unit, payout history, banking verification (Stripe Connect), and tax docs."}, "client": {"label": "Client", "login_portal": "client", "created_by": "dealer_owner (via Clients > Add Client) OR auto on bidder win (dealer_owner of winning unit)", "scope": "own_unit_warranty_services_only", "can_create": [], "description": "End customer of a dealer. Sees own vehicle, warranties, services, claims, documents, F&I offers, financing, parts store, service appointments. Linked to their dealer via invite link (or auto via winning a live auction)."}};

const HOSTS_ROLES: string[] = ["independent_bidder"];

// Subset of page_ids each role may see on this portal. Empty list = all pages allowed
// except those in blocked_pages or scoped_pages restrictions.
function getAllowedPagesForRole(role: string): string[] | null {
  const def = ROLES[role];
  if (!def) return null;
  return def.allowed_pages_only || null;
}

function getBlockedPagesForRole(role: string): string[] {
  const def = ROLES[role];
  return def?.blocked_pages || [];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BidderPortalV6() {
  const [currentPage, setCurrentPage] = useState<string>("bidder.main.dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const apiFetch = useApiFetch();
  // Map Clerk user to local-shape user object expected by the rest of this component
  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: ((clerkUser.unsafeMetadata as any)?.devRoleOverride as string) || (clerkUser.publicMetadata as any)?.role,
    roles: ((clerkUser.publicMetadata as any)?.roles || []) as string[],
  } : null;
  const logout = async () => { await signOut(); window.location.href = "/login"; };
  const userRole: string = user?.role || "independent_bidder";

  // If user role is not hosted by this portal, redirect or show message
  const roleAllowedOnPortal = HOSTS_ROLES.includes(userRole);

  const isNavActive = (id: string) => currentPage === id;
  const showPage = (id: string) => setCurrentPage(id);

  function canSeePage(pageId: string): boolean {
    const allowedOnly = getAllowedPagesForRole(userRole);
    if (allowedOnly && !allowedOnly.includes(pageId)) return false;
    const blocked = getBlockedPagesForRole(userRole);
    if (blocked.includes(pageId)) return false;
    const meta = PAGE_META[pageId];
    if (meta?.scoped_role && meta.scoped_role !== userRole) return false;
    return true;
  }

  function anyVisible(pageIds: string[]): boolean {
    return pageIds.some(id => canSeePage(id));
  }

  // If user role not hosted here, show access denied
  if (!roleAllowedOnPortal) {
    return (
      <div className="app">
        <main className="main" style={{marginLeft: 0}}>
          <div className="content" style={{padding: 40}}>
            <h2>Access Denied</h2>
            <p>Your role <code>{userRole}</code> is not permitted on this portal.</p>
            <p>Expected role types for this portal: <code>{HOSTS_ROLES.join(", ")}</code></p>
            <button className="btn btn-p" onClick={async () => { await logout(); window.location.href = "/"; }}>Sign Out</button>
          </div>
        </main>
      </div>
    );
  }

  // If current page is not visible to this user, snap to first visible page
  useEffect(() => {
    if (!canSeePage(currentPage)) {
      const firstVisible = Object.keys(PAGE_META).find(canSeePage);
      if (firstVisible) setCurrentPage(firstVisible);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const userInitials = (user?.name || "Bidder").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Bidder";
  const roleLabel = ROLES[userRole]?.label || "Bidder";

  // Wait for Clerk to load before rendering portal
  if (!isLoaded) {
    return (
      <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666"}}>
        Loading portal...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar context="bidder" />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <nav className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`} style={{ position: "relative", flexShrink: 0, height: "100%" }}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width={36} height={36} style={{borderRadius: 8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize: 12, fontWeight: 600}}>Bidder Portal</div>
          </div>
          <span className="sidebar-badge">Bidder</span>
        </div>
        <div className="sidebar-nav">
    {anyVisible(["bidder.main.live_auctions", "bidder.main.browse", "bidder.main.my_bids", "bidder.main.escrow"]) && <div className="nav-section">
      <div className="nav-label">Main</div>
      {canSeePage("bidder.main.live_auctions") && <div className={`nav-item ${isNavActive("bidder.main.live_auctions") ? "active" : ""}`} onClick={() => showPage("bidder.main.live_auctions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Live Monthly Auctions</div>}
      {canSeePage("bidder.main.browse") && <div className={`nav-item ${isNavActive("bidder.main.browse") ? "active" : ""}`} onClick={() => showPage("bidder.main.browse")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Browse Units</div>}
      {canSeePage("bidder.main.my_bids") && <div className={`nav-item ${isNavActive("bidder.main.my_bids") ? "active" : ""}`} onClick={() => showPage("bidder.main.my_bids")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>My Bids</div>}
      {canSeePage("bidder.main.escrow") && <div className={`nav-item ${isNavActive("bidder.main.escrow") ? "active" : ""}`} onClick={() => showPage("bidder.main.escrow")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Escrow &amp; Payments</div>}
    </div>}
    {anyVisible(["bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"]) && <div className="nav-section">
      <div className="nav-label">Account</div>
      {canSeePage("bidder.account.profile") && <div className={`nav-item ${isNavActive("bidder.account.profile") ? "active" : ""}`} onClick={() => showPage("bidder.account.profile")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Profile</div>}
      {canSeePage("bidder.account.verification") && <div className={`nav-item ${isNavActive("bidder.account.verification") ? "active" : ""}`} onClick={() => showPage("bidder.account.verification")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Verification</div>}
      {canSeePage("bidder.account.payment_methods") && <div className={`nav-item ${isNavActive("bidder.account.payment_methods") ? "active" : ""}`} onClick={() => showPage("bidder.account.payment_methods")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Payment Methods</div>}
      {canSeePage("bidder.account.settings") && <div className={`nav-item ${isNavActive("bidder.account.settings") ? "active" : ""}`} onClick={() => showPage("bidder.account.settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Settings</div>}
    </div>}
    {anyVisible(["bidder.main.dashboard"]) && <div className="nav-section">
      <div className="nav-label">Overview</div>
      {canSeePage("bidder.main.dashboard") && <div className={`nav-item ${isNavActive("bidder.main.dashboard") ? "active" : ""}`} onClick={() => showPage("bidder.main.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
    </div>}
        </div>
        <div className="sidebar-footer">
          <div className="user-info" onClick={() => showPage("bidder.main.dashboard")} style={{cursor: "pointer"}}>
            <div className="user-avatar">{userInitials}</div>
            <div>
              <div className="user-name">{userDisplayName}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); window.location.href = "/"; }}
            style={{width: "100%", marginTop: 8, padding: "7px 12px", background: "none", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 12, color: "#888", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 6}}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      <main className="main" style={{ marginLeft: 0, flex: 1, overflowY: "auto" }}>
        <div className="content">
          {renderPage(currentPage, userRole)}
        </div>
      </main>
      </div>
    </div>
  );
}

function renderPage(pageId: string, userRole: string) {
  switch (pageId) {
    case 'bidder.main.dashboard': return <PageScaffold
      pageId="bidder.main.dashboard"
      title="Dashboard"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "bidder.main.dashboard.active_bids_summary", "label": "My active bids summary"}, {"sub_id": "bidder.main.dashboard.won_units_summary", "label": "My won units"}, {"sub_id": "bidder.main.dashboard.upcoming_auctions_summary", "label": "Upcoming monthly auctions"}, {"sub_id": "bidder.main.dashboard.verification_status", "label": "Verification status"}]}
    />;
    case 'bidder.main.live_auctions': return <PageScaffold
      pageId="bidder.main.live_auctions"
      title="Live Monthly Auctions"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "bidder.main.live_auctions.upcoming_calendar", "label": "Upcoming auction calendar", "internal_in": ["master.marketplace.active_auctions"]}, {"sub_id": "bidder.main.live_auctions.active_live_auction", "label": "Active live auction (real-time bidding)", "ext_in": [{"sys": "stripe", "act": "real-time escrow hold capability"}]}, {"sub_id": "bidder.main.live_auctions.place_bid_live", "label": "Place bid (live, real-time)", "internal_out": ["bidder.main.my_bids"], "ext_out": [{"sys": "stripe", "act": "$500 escrow hold per bid"}, {"sys": "email", "act": "bid confirmation"}]}, {"sub_id": "bidder.main.live_auctions.auction_catalog", "label": "Pre-auction catalog (units going up)"}, {"sub_id": "bidder.main.live_auctions.auction_history", "label": "Past auction results (public)"}]}
    />;
    case 'bidder.main.browse': return <PageScaffold
      pageId="bidder.main.browse"
      title="Browse Units"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "bidder.main.browse.all_upcoming", "label": "All upcoming auction units"}, {"sub_id": "bidder.main.browse.search_filter", "label": "Search & filter"}, {"sub_id": "bidder.main.browse.watch_listing", "label": "Watch listing (notify me)", "ext_out": [{"sys": "email", "act": "watch alert when auction begins"}]}, {"sub_id": "bidder.main.browse.unit_detail", "label": "Unit detail (specs, photos, condition report)"}]}
    />;
    case 'bidder.main.my_bids': return <PageScaffold
      pageId="bidder.main.my_bids"
      title="My Bids"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "bidder.main.my_bids.active_bids", "label": "Active bids"}, {"sub_id": "bidder.main.my_bids.won_units", "label": "Won units", "internal_out": ["dealer.ops.clients (buyer becomes client of selling dealer)", "master.mgmt.revenue_billing ($250 commission)"], "ext_out": [{"sys": "stripe", "act": "escrow release + commission capture"}, {"sys": "email", "act": "won notification + dealer intro"}], "notes": "On win: buyer auto-linked to winning unit's selling dealer"}, {"sub_id": "bidder.main.my_bids.lost_bids", "label": "Lost bids", "ext_out": [{"sys": "stripe", "act": "escrow refund"}]}, {"sub_id": "bidder.main.my_bids.watchlist", "label": "Watchlist"}]}
    />;
    case 'bidder.main.escrow': return <PageScaffold
      pageId="bidder.main.escrow"
      title="Escrow & Payments"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "bidder.main.escrow.my_active_holds", "label": "My active escrow holds", "ext_in": [{"sys": "stripe", "act": "hold state"}]}, {"sub_id": "bidder.main.escrow.payment_history", "label": "Payment history", "ext_in": [{"sys": "stripe", "act": "payment history"}]}, {"sub_id": "bidder.main.escrow.pending_releases", "label": "Pending releases"}, {"sub_id": "bidder.main.escrow.refunds", "label": "Refunds (lost bids / cancellations)"}]}
    />;
    case 'bidder.account.profile': return <PageScaffold
      pageId="bidder.account.profile"
      title="Profile"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "bidder.account.profile.personal_info", "label": "Personal info (name, email, phone, address)"}, {"sub_id": "bidder.account.profile.communication_prefs", "label": "Communication preferences", "ext_out": [{"sys": "email", "act": "preference confirmation"}]}]}
    />;
    case 'bidder.account.verification': return <PageScaffold
      pageId="bidder.account.verification"
      title="Verification"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "bidder.account.verification.id_verification", "label": "Identity verification (required before bidding)", "ext_out": [{"sys": "stripe", "act": "Stripe Identity verification"}]}, {"sub_id": "bidder.account.verification.address_verification", "label": "Address verification"}, {"sub_id": "bidder.account.verification.verification_status", "label": "Verification status"}]}
    />;
    case 'bidder.account.payment_methods': return <PageScaffold
      pageId="bidder.account.payment_methods"
      title="Payment Methods"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "bidder.account.payment_methods.cards_on_file", "label": "Cards on file (for escrow)", "ext_in": [{"sys": "stripe", "act": "saved payment methods"}]}, {"sub_id": "bidder.account.payment_methods.add_card", "label": "Add card", "ext_out": [{"sys": "stripe", "act": "attach payment method"}]}, {"sub_id": "bidder.account.payment_methods.default_payment", "label": "Default payment method"}]}
    />;
    case 'bidder.account.settings': return <PageScaffold
      pageId="bidder.account.settings"
      title="Settings"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "bidder.account.settings.notification_prefs", "label": "Notification preferences"}, {"sub_id": "bidder.account.settings.close_account", "label": "Close account"}]}
    />;
    default: return <div className="pn"><p style={{padding: 24}}>Page not found: <code>{pageId}</code></p></div>;
  }
}

// ============================================================================
// PageScaffold — generic page renderer showing schema metadata.
// This is the v6 development scaffolding. Real page components will replace
// these as they're built; each scaffold shows exactly what the page should
// read from, write to, and integrate with externally.
// ============================================================================

interface SubItem {
  sub_id: string;
  label: string;
  internal_in?: string[];
  internal_out?: string[];
  ext_in?: Array<{ sys: string; act: string }>;
  ext_out?: Array<{ sys: string; act: string }>;
  notes?: string;
}

interface PageScaffoldProps {
  pageId: string;
  title: string;
  section: string;
  scopedRole: string;
  subItems: SubItem[];
}

const EXT_SYS_COLORS: Record<string, string> = {
  stripe: "#635bff", email: "#1e88e5", anthropic: "#cc785c", tavus: "#9b59b6",
  cloudflare: "#f48120", mfr_portals: "#16a34a", parts_suppliers: "#8b5a2b",
  lender_apis: "#0891b2", maps_routing: "#dc2626",
};

function PageScaffold({ pageId, title, section, scopedRole, subItems }: PageScaffoldProps) {
  return (
    <div className="page-scaffold">
      <div className="ph">
        <div>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600}}>{section}</div>
          <h1 style={{margin: "4px 0 0", fontSize: 22, fontWeight: 600}}>{title}</h1>
          {scopedRole && <div style={{fontSize: 11, color: "#b8860b", marginTop: 4}}>Scoped to role: <code>{scopedRole}</code></div>}
        </div>
        <div style={{fontSize: 10, color: "#aaa", fontFamily: "monospace"}}>{pageId}</div>
      </div>

      <div className="pn" style={{marginTop: 16, padding: 16, background: "#fff9e6", borderLeft: "3px solid #b8860b", fontSize: 12, color: "#8b6914"}}>
        <strong>Development scaffold.</strong> This page is rendered from the v6 schema. Sub-items below show the intended contents + data connections.
        Real page content will replace this scaffold as each module is built.
      </div>

      <div style={{marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12}}>
        {subItems.map((si, idx) => (
          <div key={si.sub_id} className="pn" style={{padding: 14}}>
            <div style={{fontSize: 13, fontWeight: 600, color: "#1a1f2e", marginBottom: 8}}>{si.label}</div>
            <div style={{fontSize: 10, color: "#999", fontFamily: "monospace", marginBottom: 10}}>{si.sub_id}</div>

            {si.internal_in && si.internal_in.length > 0 && (
              <div style={{marginBottom: 8}}>
                <div style={{fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: "#777", fontWeight: 600, marginBottom: 2}}>Internal reads</div>
                {si.internal_in.map((r, i) => <div key={i} style={{fontSize: 11, color: "#555"}}>← {r}</div>)}
              </div>
            )}
            {si.internal_out && si.internal_out.length > 0 && (
              <div style={{marginBottom: 8}}>
                <div style={{fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: "#777", fontWeight: 600, marginBottom: 2}}>Internal writes</div>
                {si.internal_out.map((w, i) => <div key={i} style={{fontSize: 11, color: "#555"}}>→ {w}</div>)}
              </div>
            )}
            {si.ext_in && si.ext_in.length > 0 && (
              <div style={{marginBottom: 8}}>
                <div style={{fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: "#b8860b", fontWeight: 600, marginBottom: 2}}>External inbound</div>
                {si.ext_in.map((e, i) => (
                  <div key={i} style={{fontSize: 11}}>
                    <span style={{display: "inline-block", padding: "1px 8px", borderRadius: 10, background: EXT_SYS_COLORS[e.sys] || "#888", color: "white", fontSize: 9, fontWeight: 600, marginRight: 4}}>{e.sys}</span>
                    <span style={{color: "#8b6914"}}>{e.act}</span>
                  </div>
                ))}
              </div>
            )}
            {si.ext_out && si.ext_out.length > 0 && (
              <div style={{marginBottom: 8}}>
                <div style={{fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: "#b8860b", fontWeight: 600, marginBottom: 2}}>External outbound</div>
                {si.ext_out.map((e, i) => (
                  <div key={i} style={{fontSize: 11}}>
                    <span style={{display: "inline-block", padding: "1px 8px", borderRadius: 10, background: EXT_SYS_COLORS[e.sys] || "#888", color: "white", fontSize: 9, fontWeight: 600, marginRight: 4}}>{e.sys}</span>
                    <span style={{color: "#8b6914"}}>{e.act}</span>
                  </div>
                ))}
              </div>
            )}
            {si.notes && (
              <div style={{marginTop: 8, padding: 6, background: "#f5f6f8", borderRadius: 4, fontSize: 10, color: "#666", fontStyle: "italic"}}>{si.notes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
