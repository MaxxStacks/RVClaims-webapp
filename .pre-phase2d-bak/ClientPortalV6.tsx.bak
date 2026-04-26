// ClientPortalV6 — generated from v6 schema. Do not hand-edit menu structure;
// edit /schema/v6.json and regenerate.
// Preserves existing sidebar CSS classes (sidebar, sidebar-nav, nav-section, nav-label, nav-item, nb-* badges).

import { useState, useEffect } from "react";
import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useApiFetch } from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";
import ClientClaimsPage from "@/components/client/ClientClaimsPage";
import InventoryListPage from "@/components/units/InventoryListPage";

// ============================================================================
// V6 SCHEMA METADATA — role-scoping and RBAC rules baked in
// ============================================================================

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"client.main.dashboard": {"menu_item": "Dashboard", "section": "Main", "scoped_role": ""}, "client.main.vehicle": {"menu_item": "My Vehicle", "section": "Main", "scoped_role": ""}, "client.main.warranties": {"menu_item": "My Warranties", "section": "Main", "scoped_role": ""}, "client.main.services": {"menu_item": "My Services", "section": "Main", "scoped_role": ""}, "client.main.claims": {"menu_item": "Claims", "section": "Main", "scoped_role": ""}, "client.main.documents": {"menu_item": "Documents", "section": "Main", "scoped_role": ""}, "client.main.fi_offers": {"menu_item": "F&I Offers", "section": "Main", "scoped_role": ""}, "client.main.messages": {"menu_item": "Messages", "section": "Main", "scoped_role": ""}, "client.main.account": {"menu_item": "Account", "section": "Main", "scoped_role": ""}, "client.main.financing": {"menu_item": "My Financing", "section": "Main", "scoped_role": ""}, "client.main.parts_store": {"menu_item": "Parts Store", "section": "Main", "scoped_role": ""}, "client.main.service_appointments": {"menu_item": "Service Appointments", "section": "Main", "scoped_role": ""}};

const ROLES: Record<string, any> = {"operator_admin": {"label": "Operator Admin", "login_portal": "ds360_master", "created_by": "system (first operator account)", "scope": "full_platform", "can_create": ["operator_staff", "dealer_owner"], "description": "Full access to every page on the Operator Portal including billing, commissions, Stripe admin, and platform settings."}, "operator_staff": {"label": "Operator Staff", "login_portal": "ds360_master", "created_by": "operator_admin (via Staff & Permissions)", "scope": "operations_claims_no_billing", "can_create": [], "blocked_pages": ["master.mgmt.revenue_billing", "master.mgmt.campaign_templates", "master.mgmt.communications", "master.mgmt.blog", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"], "scoped_pages": {"master.mgmt.dealer_accounts": "read_only_no_billing", "master.mgmt.financing_partners": "no_commission_visible", "master.mgmt.consignment_oversight": "no_payout_amounts", "master.ops.work_by_dealer": "no_invoice_section", "master.ops.reporting": "no_revenue_per_dealer"}, "description": "Claims processing, warranty verification, parts coordination. Cannot see billing, commissions, staff management, or platform settings."}, "dealer_owner": {"label": "Dealer Owner", "login_portal": "dealer", "created_by": "operator_admin (on new dealer creation)", "scope": "full_dealership_inc_billing", "can_create": ["dealer_staff", "technician", "public_bidder (scoped)", "consignor (scoped)", "client"], "description": "Full access to their Dealer Portal including billing, subscription, staff/tech management, marketplace bidding, and partner account creation."}, "dealer_staff": {"label": "Dealer Staff", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "operations_no_billing_no_admin", "can_create": [], "blocked_pages": ["dealer.account.my_subscription", "dealer.account.portal_settings", "dealer.marketplace.escrow_payments"], "scoped_pages": {"dealer.ops.dashboard": "no_revenue_snapshot", "dealer.ops.sales_services": "no_commission_tracker", "dealer.ops.consignment": "no_payout_amounts", "dealer.ops.documents": "no_ds360_invoices", "dealer.ops.parts_store": "no_revenue_tracker"}, "description": "Operational access \u2014 claims, units, clients, sales entry, parts fulfillment, techflow coordination. No billing, no staff management, no subscription, no escrow."}, "technician": {"label": "Technician", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Technicians tab)", "scope": "techflow_own_work_orders_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.ops.claims", "dealer.ops.techflow"], "scoped_pages": {"dealer.ops.dashboard": "tech_view_my_jobs_today", "dealer.ops.claims": "read_only_own_workorder_claims", "dealer.ops.techflow": "own_work_orders_schedule_timelog"}, "description": "Sees only their own work orders, schedule, time log, and read-only access to claims tied to their work. No access to inventory, clients, financials, or any admin functions."}, "public_bidder": {"label": "Public Bidder (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Partners tab)", "scope": "marketplace_public_showcase_own_bids_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.marketplace.browse", "dealer.marketplace.public_showcase", "dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"], "header_label": "[Dealer Name] \u2014 Marketplace Access", "description": "CC-verified bidder sponsored by a specific dealer. Sees only Public Showcase listings (not full dealer-to-dealer marketplace), own bids, own verification + payment methods. Scoped to sponsoring dealer."}, "independent_bidder": {"label": "Independent Bidder (Live Monthly Auctions)", "login_portal": "bidder", "created_by": "self-registration on Bidder Portal", "scope": "live_monthly_auctions_until_won", "can_create": [], "allowed_pages_only": ["bidder.main.dashboard", "bidder.main.live_auctions", "bidder.main.browse", "bidder.main.my_bids", "bidder.main.escrow", "bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"], "becomes_client_on_win": true, "description": "Standalone buyer account for Live Monthly public auctions. Not linked to any dealer until they win a unit, at which point they auto-provision as a client of the winning unit's selling dealer."}, "consignor": {"label": "Consignor (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Consignment > Add Consignor)", "scope": "own_consigned_units_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"], "header_label": "[Dealer Name] \u2014 Consignment Portal", "description": "Third party whose unit a dealer is selling on consignment. View-only of their own consigned unit(s), offers/bids on their unit, payout history, banking verification (Stripe Connect), and tax docs."}, "client": {"label": "Client", "login_portal": "client", "created_by": "dealer_owner (via Clients > Add Client) OR auto on bidder win (dealer_owner of winning unit)", "scope": "own_unit_warranty_services_only", "can_create": [], "description": "End customer of a dealer. Sees own vehicle, warranties, services, claims, documents, F&I offers, financing, parts store, service appointments. Linked to their dealer via invite link (or auto via winning a live auction)."}};

const HOSTS_ROLES: string[] = ["client"];

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

export default function ClientPortalV6() {
  const [currentPage, setCurrentPage] = useState<string>("client.main.dashboard");
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
  const userRole: string = user?.role || "client";

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

  const userInitials = (user?.name || "Client").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Client";
  const roleLabel = ROLES[userRole]?.label || "Client";

  // Wait for Clerk to load before rendering portal
  if (!isLoaded) {
    return (
      <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666"}}>
        Loading portal...
      </div>
    );
  }

  return (
    <div className="app">
      <nav className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width={36} height={36} style={{borderRadius: 8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize: 12, fontWeight: 600}}>Client Portal</div>
          </div>
          <span className="sidebar-badge">Client</span>
        </div>
        <div className="sidebar-nav">
    {anyVisible(["client.main.dashboard"]) && <div className="nav-section">
      <div className="nav-label">Overview</div>
      {canSeePage("client.main.dashboard") && <div className={`nav-item ${isNavActive("client.main.dashboard") ? "active" : ""}`} onClick={() => showPage("client.main.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
    </div>}
    {anyVisible(["client.main.vehicle", "client.main.warranties", "client.main.services", "client.main.claims", "client.main.documents", "client.main.fi_offers", "client.main.messages", "client.main.account", "client.main.financing", "client.main.parts_store", "client.main.service_appointments"]) && <div className="nav-section">
      <div className="nav-label">Main</div>
      {canSeePage("client.main.vehicle") && <div className={`nav-item ${isNavActive("client.main.vehicle") ? "active" : ""}`} onClick={() => showPage("client.main.vehicle")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Vehicle</div>}
      {canSeePage("client.main.warranties") && <div className={`nav-item ${isNavActive("client.main.warranties") ? "active" : ""}`} onClick={() => showPage("client.main.warranties")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Warranties</div>}
      {canSeePage("client.main.services") && <div className={`nav-item ${isNavActive("client.main.services") ? "active" : ""}`} onClick={() => showPage("client.main.services")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Services</div>}
      {canSeePage("client.main.claims") && <div className={`nav-item ${isNavActive("client.main.claims") ? "active" : ""}`} onClick={() => showPage("client.main.claims")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Claims</div>}
      {canSeePage("client.main.documents") && <div className={`nav-item ${isNavActive("client.main.documents") ? "active" : ""}`} onClick={() => showPage("client.main.documents")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Documents</div>}
      {canSeePage("client.main.fi_offers") && <div className={`nav-item ${isNavActive("client.main.fi_offers") ? "active" : ""}`} onClick={() => showPage("client.main.fi_offers")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>F&amp;I Offers</div>}
      {canSeePage("client.main.messages") && <div className={`nav-item ${isNavActive("client.main.messages") ? "active" : ""}`} onClick={() => showPage("client.main.messages")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Messages</div>}
      {canSeePage("client.main.account") && <div className={`nav-item ${isNavActive("client.main.account") ? "active" : ""}`} onClick={() => showPage("client.main.account")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Account</div>}
      {canSeePage("client.main.financing") && <div className={`nav-item ${isNavActive("client.main.financing") ? "active" : ""}`} onClick={() => showPage("client.main.financing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Financing</div>}
      {canSeePage("client.main.parts_store") && <div className={`nav-item ${isNavActive("client.main.parts_store") ? "active" : ""}`} onClick={() => showPage("client.main.parts_store")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Parts Store</div>}
      {canSeePage("client.main.service_appointments") && <div className={`nav-item ${isNavActive("client.main.service_appointments") ? "active" : ""}`} onClick={() => showPage("client.main.service_appointments")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Service Appointments</div>}
    </div>}
        </div>
        <div className="sidebar-footer">
          <div style={{padding: "8px 12px", borderTop: "1px solid #eee"}}>
            <NotificationBell />
          </div>
          <div className="user-info" onClick={() => showPage("client.main.dashboard")} style={{cursor: "pointer"}}>
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

      <main className="main">
        <div className="content">
          {renderPage(currentPage, userRole)}
        </div>
      </main>
    </div>
  );
}

function renderPage(pageId: string, userRole: string) {
  switch (pageId) {
    case 'client.main.dashboard': return <PageScaffold
      pageId="client.main.dashboard"
      title="Dashboard"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.dashboard.coverage_overview", "label": "Coverage overview", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.dashboard.open_claims", "label": "Open claims", "internal_in": ["dealer.ops.claims"]}, {"sub_id": "client.main.dashboard.quick_actions", "label": "Quick actions"}]}
    />;
    case 'client.main.vehicle': return <InventoryListPage context="client" />;
    case 'client.main.warranties': return <PageScaffold
      pageId="client.main.warranties"
      title="My Warranties"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.warranties.ac_coverage_details", "label": "Active Coverage \u203a Coverage details & terms", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.warranties.ac_expiry_date", "label": "Active Coverage \u203a Expiry date", "ext_out": [{"sys": "email", "act": "expiry reminders (scheduled)"}]}, {"sub_id": "client.main.warranties.expired_plans", "label": "Expired Plans"}]}
    />;
    case 'client.main.services': return <PageScaffold
      pageId="client.main.services"
      title="My Services"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.services.roadside", "label": "Roadside Assistance", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.services.gap", "label": "GAP Coverage", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.services.extended_warranty", "label": "Extended Warranty", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.services.other_active", "label": "Other active plans", "internal_in": ["dealer.ops.sales_services"]}]}
    />;
    case 'client.main.claims': return <ClientClaimsPage />;
    case 'client.main.documents': return <PageScaffold
      pageId="client.main.documents"
      title="Documents"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.documents.warranty_certificates", "label": "Warranty certificates", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.documents.service_contracts", "label": "Service contracts", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "client.main.documents.receipts_invoices", "label": "Receipts & invoices", "internal_in": ["dealer.ops.sales_services"]}]}
    />;
    case 'client.main.fi_offers': return <PageScaffold
      pageId="client.main.fi_offers"
      title="F&I Offers"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.fi_offers.ai_video_presenter", "label": "AI F&I video presenter", "ext_in": [{"sys": "tavus", "act": "stream avatar video"}, {"sys": "anthropic", "act": "real-time AI responses"}], "ext_out": [{"sys": "tavus", "act": "customer interactions"}, {"sys": "anthropic", "act": "session turns"}, {"sys": "email", "act": "session invite"}]}, {"sub_id": "client.main.fi_offers.review_accept_products", "label": "Review & accept products", "internal_out": ["dealer.ops.sales_services (new sale)", "master.mgmt.revenue_billing (commission)"], "ext_out": [{"sys": "email", "act": "sale confirmation"}]}]}
    />;
    case 'client.main.messages': return <PageScaffold
      pageId="client.main.messages"
      title="Messages"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.messages.from_dealer", "label": "From Dealer", "internal_in": ["dealer.ops.clients"], "ext_in": [{"sys": "email", "act": "notif surface"}]}]}
    />;
    case 'client.main.account': return <PageScaffold
      pageId="client.main.account"
      title="Account"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.account.profile", "label": "Profile", "internal_out": ["dealer.ops.clients (self-edits)"], "ext_out": [{"sys": "email", "act": "change confirmation"}]}, {"sub_id": "client.main.account.notifications", "label": "Notifications"}, {"sub_id": "client.main.account.settings", "label": "Settings"}]}
    />;
    case 'client.main.financing': return <PageScaffold
      pageId="client.main.financing"
      title="My Financing"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.financing.loan_details", "label": "Loan Details", "internal_in": ["dealer.ops.financing"], "ext_in": [{"sys": "lender_apis", "act": "current loan state"}]}, {"sub_id": "client.main.financing.payment_schedule", "label": "Payment Schedule", "ext_in": [{"sys": "lender_apis", "act": "amortization schedule"}]}, {"sub_id": "client.main.financing.current_balance_payoff", "label": "Current Balance & Payoff", "ext_in": [{"sys": "lender_apis", "act": "payoff quote"}]}, {"sub_id": "client.main.financing.financing_documents", "label": "Financing documents", "internal_in": ["dealer.ops.financing"]}, {"sub_id": "client.main.financing.make_payment", "label": "Make a Payment", "ext_out": [{"sys": "lender_apis", "act": "post payment (if supported) OR redirect"}, {"sys": "email", "act": "payment confirmation"}]}, {"sub_id": "client.main.financing.early_payoff_calc", "label": "Early payoff calculator"}]}
    />;
    case 'client.main.parts_store': return <PageScaffold
      pageId="client.main.parts_store"
      title="Parts Store"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.parts_store.browse_parts", "label": "Browse Parts (from my dealer)", "internal_in": ["dealer.ops.parts_store"]}, {"sub_id": "client.main.parts_store.search_by_vin", "label": "Search by my VIN (fitting parts)", "internal_in": ["dealer.ops.inventory"]}, {"sub_id": "client.main.parts_store.shopping_cart", "label": "Shopping Cart"}, {"sub_id": "client.main.parts_store.checkout", "label": "Checkout", "internal_out": ["dealer.ops.parts_store (new order)", "master.ops.parts_orders"], "ext_out": [{"sys": "stripe", "act": "one-time payment for parts"}, {"sys": "email", "act": "order confirmation"}]}, {"sub_id": "client.main.parts_store.order_history", "label": "Order History", "internal_in": ["master.ops.parts_orders"]}, {"sub_id": "client.main.parts_store.track_shipment", "label": "Track shipment", "ext_in": [{"sys": "parts_suppliers", "act": "tracking status"}]}, {"sub_id": "client.main.parts_store.returns", "label": "Returns", "ext_out": [{"sys": "stripe", "act": "refund"}, {"sys": "email", "act": "return confirmation"}]}]}
    />;
    case 'client.main.service_appointments': return <PageScaffold
      pageId="client.main.service_appointments"
      title="Service Appointments"
      section="Main"
      scopedRole=""
      subItems={[{"sub_id": "client.main.service_appointments.schedule_service", "label": "Schedule Service (on-site request)", "internal_out": ["dealer.ops.techflow (client request)"], "ext_out": [{"sys": "email", "act": "request acknowledgment"}]}, {"sub_id": "client.main.service_appointments.upcoming_appointments", "label": "Upcoming appointments", "internal_in": ["dealer.ops.techflow"]}, {"sub_id": "client.main.service_appointments.service_history", "label": "Service History", "internal_in": ["dealer.ops.techflow"]}, {"sub_id": "client.main.service_appointments.tech_assigned", "label": "Tech assigned", "internal_in": ["dealer.ops.techflow"]}, {"sub_id": "client.main.service_appointments.eta_map_tracking", "label": "ETA / map tracking", "ext_in": [{"sys": "maps_routing", "act": "tech position + ETA"}]}, {"sub_id": "client.main.service_appointments.rate_service", "label": "Rate service"}]}
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
