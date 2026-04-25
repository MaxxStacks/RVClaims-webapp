// OperatorPortalV6 — generated from v6 schema. Do not hand-edit menu structure;
// edit /schema/v6.json and regenerate.
// Preserves existing sidebar CSS classes (sidebar, sidebar-nav, nav-section, nav-label, nav-item, nb-* badges).

import { useState, useEffect } from "react";
import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useApiFetch } from "@/lib/api";

// ============================================================================
// V6 SCHEMA METADATA — role-scoping and RBAC rules baked in
// ============================================================================

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"master.mgmt.dashboard": {"menu_item": "Dashboard", "section": "Management", "scoped_role": ""}, "master.mgmt.dealer_accounts": {"menu_item": "Dealer Accounts", "section": "Management", "scoped_role": ""}, "master.mgmt.catalog": {"menu_item": "Product & Service Catalog", "section": "Management", "scoped_role": ""}, "master.mgmt.revenue_billing": {"menu_item": "Revenue & Billing", "section": "Management", "scoped_role": ""}, "master.mgmt.communications": {"menu_item": "Communications", "section": "Management", "scoped_role": ""}, "master.mgmt.staff_permissions": {"menu_item": "Staff & Permissions", "section": "Management", "scoped_role": ""}, "master.mgmt.platform_settings": {"menu_item": "Platform Settings", "section": "Management", "scoped_role": ""}, "master.mgmt.blog": {"menu_item": "Blog Management", "section": "Management", "scoped_role": ""}, "master.ops.dashboard": {"menu_item": "Operations Dashboard", "section": "Operations", "scoped_role": ""}, "master.ops.claim_queue": {"menu_item": "Claim Queue", "section": "Operations", "scoped_role": ""}, "master.ops.work_by_dealer": {"menu_item": "Work by Dealer", "section": "Operations", "scoped_role": ""}, "master.ops.parts_management": {"menu_item": "Parts Management", "section": "Operations", "scoped_role": ""}, "master.ops.manufacturer_portals": {"menu_item": "Manufacturer Portals", "section": "Operations", "scoped_role": ""}, "master.ops.reporting": {"menu_item": "Reporting", "section": "Operations", "scoped_role": ""}, "master.mgmt.financing_partners": {"menu_item": "Financing Partners", "section": "Management", "scoped_role": ""}, "master.mgmt.parts_catalog": {"menu_item": "Parts Catalog", "section": "Management", "scoped_role": ""}, "master.mgmt.campaign_templates": {"menu_item": "Campaign Templates", "section": "Management", "scoped_role": ""}, "master.mgmt.consignment_oversight": {"menu_item": "Consignment Oversight", "section": "Management", "scoped_role": ""}, "master.ops.financing_applications": {"menu_item": "Financing Applications", "section": "Operations", "scoped_role": ""}, "master.ops.techflow_oversight": {"menu_item": "TechFlow Oversight", "section": "Operations", "scoped_role": ""}, "master.ops.parts_orders": {"menu_item": "Parts Orders", "section": "Operations", "scoped_role": ""}, "master.marketplace.listings_oversight": {"menu_item": "Listings Oversight", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.active_auctions": {"menu_item": "Active Auctions", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.transactions": {"menu_item": "Transactions", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.escrow_admin": {"menu_item": "Escrow Admin", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.members": {"menu_item": "Members", "section": "Marketplace", "scoped_role": ""}};

const ROLES: Record<string, any> = {"operator_admin": {"label": "Operator Admin", "login_portal": "ds360_master", "created_by": "system (first operator account)", "scope": "full_platform", "can_create": ["operator_staff", "dealer_owner"], "description": "Full access to every page on the Operator Portal including billing, commissions, Stripe admin, and platform settings."}, "operator_staff": {"label": "Operator Staff", "login_portal": "ds360_master", "created_by": "operator_admin (via Staff & Permissions)", "scope": "operations_claims_no_billing", "can_create": [], "blocked_pages": ["master.mgmt.revenue_billing", "master.mgmt.campaign_templates", "master.mgmt.communications", "master.mgmt.blog", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"], "scoped_pages": {"master.mgmt.dealer_accounts": "read_only_no_billing", "master.mgmt.financing_partners": "no_commission_visible", "master.mgmt.consignment_oversight": "no_payout_amounts", "master.ops.work_by_dealer": "no_invoice_section", "master.ops.reporting": "no_revenue_per_dealer"}, "description": "Claims processing, warranty verification, parts coordination. Cannot see billing, commissions, staff management, or platform settings."}, "dealer_owner": {"label": "Dealer Owner", "login_portal": "dealer", "created_by": "operator_admin (on new dealer creation)", "scope": "full_dealership_inc_billing", "can_create": ["dealer_staff", "technician", "public_bidder (scoped)", "consignor (scoped)", "client"], "description": "Full access to their Dealer Portal including billing, subscription, staff/tech management, marketplace bidding, and partner account creation."}, "dealer_staff": {"label": "Dealer Staff", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "operations_no_billing_no_admin", "can_create": [], "blocked_pages": ["dealer.account.my_subscription", "dealer.account.portal_settings", "dealer.marketplace.escrow_payments"], "scoped_pages": {"dealer.ops.dashboard": "no_revenue_snapshot", "dealer.ops.sales_services": "no_commission_tracker", "dealer.ops.consignment": "no_payout_amounts", "dealer.ops.documents": "no_ds360_invoices", "dealer.ops.parts_store": "no_revenue_tracker"}, "description": "Operational access \u2014 claims, units, clients, sales entry, parts fulfillment, techflow coordination. No billing, no staff management, no subscription, no escrow."}, "technician": {"label": "Technician", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Technicians tab)", "scope": "techflow_own_work_orders_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.ops.claims", "dealer.ops.techflow"], "scoped_pages": {"dealer.ops.dashboard": "tech_view_my_jobs_today", "dealer.ops.claims": "read_only_own_workorder_claims", "dealer.ops.techflow": "own_work_orders_schedule_timelog"}, "description": "Sees only their own work orders, schedule, time log, and read-only access to claims tied to their work. No access to inventory, clients, financials, or any admin functions."}, "public_bidder": {"label": "Public Bidder (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Partners tab)", "scope": "marketplace_public_showcase_own_bids_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.marketplace.browse", "dealer.marketplace.public_showcase", "dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"], "header_label": "[Dealer Name] \u2014 Marketplace Access", "description": "CC-verified bidder sponsored by a specific dealer. Sees only Public Showcase listings (not full dealer-to-dealer marketplace), own bids, own verification + payment methods. Scoped to sponsoring dealer."}, "independent_bidder": {"label": "Independent Bidder (Live Monthly Auctions)", "login_portal": "bidder", "created_by": "self-registration on Bidder Portal", "scope": "live_monthly_auctions_until_won", "can_create": [], "allowed_pages_only": ["bidder.main.dashboard", "bidder.main.live_auctions", "bidder.main.browse", "bidder.main.my_bids", "bidder.main.escrow", "bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"], "becomes_client_on_win": true, "description": "Standalone buyer account for Live Monthly public auctions. Not linked to any dealer until they win a unit, at which point they auto-provision as a client of the winning unit's selling dealer."}, "consignor": {"label": "Consignor (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Consignment > Add Consignor)", "scope": "own_consigned_units_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"], "header_label": "[Dealer Name] \u2014 Consignment Portal", "description": "Third party whose unit a dealer is selling on consignment. View-only of their own consigned unit(s), offers/bids on their unit, payout history, banking verification (Stripe Connect), and tax docs."}, "client": {"label": "Client", "login_portal": "client", "created_by": "dealer_owner (via Clients > Add Client) OR auto on bidder win (dealer_owner of winning unit)", "scope": "own_unit_warranty_services_only", "can_create": [], "description": "End customer of a dealer. Sees own vehicle, warranties, services, claims, documents, F&I offers, financing, parts store, service appointments. Linked to their dealer via invite link (or auto via winning a live auction)."}};

const HOSTS_ROLES: string[] = ["operator_admin", "operator_staff"];

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

export default function OperatorPortalV6() {
  const [currentPage, setCurrentPage] = useState<string>("master.mgmt.dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const apiFetch = useApiFetch();
  // Map Clerk user to local-shape user object expected by the rest of this component
  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: (clerkUser.publicMetadata as any)?.role,
    roles: ((clerkUser.publicMetadata as any)?.roles || []) as string[],
  } : null;
  const logout = async () => { await signOut(); window.location.href = "/login"; };
  const userRole: string = user?.role || "operator_admin";

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

  const userInitials = (user?.name || "Operator").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Operator";
  const roleLabel = ROLES[userRole]?.label || "Operator";

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
            <div className="sidebar-logo-sub" style={{fontSize: 12, fontWeight: 600}}>Command Centre</div>
          </div>
          <span className="sidebar-badge">Operator</span>
        </div>
        <div className="sidebar-nav">
    {anyVisible(["master.mgmt.dashboard"]) && <div className="nav-section">
      <div className="nav-label">Overview</div>
      {canSeePage("master.mgmt.dashboard") && <div className={`nav-item ${isNavActive("master.mgmt.dashboard") ? "active" : ""}`} onClick={() => showPage("master.mgmt.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
    </div>}
    {anyVisible(["master.mgmt.dealer_accounts", "master.mgmt.catalog", "master.mgmt.revenue_billing", "master.mgmt.communications", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.mgmt.blog", "master.mgmt.financing_partners", "master.mgmt.parts_catalog", "master.mgmt.campaign_templates", "master.mgmt.consignment_oversight"]) && <div className="nav-section">
      <div className="nav-label">Management</div>
      {canSeePage("master.mgmt.dealer_accounts") && <div className={`nav-item ${isNavActive("master.mgmt.dealer_accounts") ? "active" : ""}`} onClick={() => showPage("master.mgmt.dealer_accounts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Dealer Accounts</div>}
      {canSeePage("master.mgmt.catalog") && <div className={`nav-item ${isNavActive("master.mgmt.catalog") ? "active" : ""}`} onClick={() => showPage("master.mgmt.catalog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Product &amp; Service Catalog</div>}
      {canSeePage("master.mgmt.revenue_billing") && <div className={`nav-item ${isNavActive("master.mgmt.revenue_billing") ? "active" : ""}`} onClick={() => showPage("master.mgmt.revenue_billing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Revenue &amp; Billing</div>}
      {canSeePage("master.mgmt.communications") && <div className={`nav-item ${isNavActive("master.mgmt.communications") ? "active" : ""}`} onClick={() => showPage("master.mgmt.communications")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>Communications</div>}
      {canSeePage("master.mgmt.staff_permissions") && <div className={`nav-item ${isNavActive("master.mgmt.staff_permissions") ? "active" : ""}`} onClick={() => showPage("master.mgmt.staff_permissions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>Staff &amp; Permissions</div>}
      {canSeePage("master.mgmt.platform_settings") && <div className={`nav-item ${isNavActive("master.mgmt.platform_settings") ? "active" : ""}`} onClick={() => showPage("master.mgmt.platform_settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Platform Settings</div>}
      {canSeePage("master.mgmt.blog") && <div className={`nav-item ${isNavActive("master.mgmt.blog") ? "active" : ""}`} onClick={() => showPage("master.mgmt.blog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Blog Management</div>}
      {canSeePage("master.mgmt.financing_partners") && <div className={`nav-item ${isNavActive("master.mgmt.financing_partners") ? "active" : ""}`} onClick={() => showPage("master.mgmt.financing_partners")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing Partners</div>}
      {canSeePage("master.mgmt.parts_catalog") && <div className={`nav-item ${isNavActive("master.mgmt.parts_catalog") ? "active" : ""}`} onClick={() => showPage("master.mgmt.parts_catalog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Parts Catalog</div>}
      {canSeePage("master.mgmt.campaign_templates") && <div className={`nav-item ${isNavActive("master.mgmt.campaign_templates") ? "active" : ""}`} onClick={() => showPage("master.mgmt.campaign_templates")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>Campaign Templates</div>}
      {canSeePage("master.mgmt.consignment_oversight") && <div className={`nav-item ${isNavActive("master.mgmt.consignment_oversight") ? "active" : ""}`} onClick={() => showPage("master.mgmt.consignment_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Consignment Oversight</div>}
    </div>}
    {anyVisible(["master.ops.dashboard", "master.ops.claim_queue", "master.ops.work_by_dealer", "master.ops.parts_management", "master.ops.manufacturer_portals", "master.ops.reporting", "master.ops.financing_applications", "master.ops.techflow_oversight", "master.ops.parts_orders"]) && <div className="nav-section">
      <div className="nav-label">Operations</div>
      {canSeePage("master.ops.dashboard") && <div className={`nav-item ${isNavActive("master.ops.dashboard") ? "active" : ""}`} onClick={() => showPage("master.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Operations Dashboard</div>}
      {canSeePage("master.ops.claim_queue") && <div className={`nav-item ${isNavActive("master.ops.claim_queue") ? "active" : ""}`} onClick={() => showPage("master.ops.claim_queue")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Claim Queue</div>}
      {canSeePage("master.ops.work_by_dealer") && <div className={`nav-item ${isNavActive("master.ops.work_by_dealer") ? "active" : ""}`} onClick={() => showPage("master.ops.work_by_dealer")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Work by Dealer</div>}
      {canSeePage("master.ops.parts_management") && <div className={`nav-item ${isNavActive("master.ops.parts_management") ? "active" : ""}`} onClick={() => showPage("master.ops.parts_management")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Management</div>}
      {canSeePage("master.ops.manufacturer_portals") && <div className={`nav-item ${isNavActive("master.ops.manufacturer_portals") ? "active" : ""}`} onClick={() => showPage("master.ops.manufacturer_portals")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>Manufacturer Portals</div>}
      {canSeePage("master.ops.reporting") && <div className={`nav-item ${isNavActive("master.ops.reporting") ? "active" : ""}`} onClick={() => showPage("master.ops.reporting")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Reporting</div>}
      {canSeePage("master.ops.financing_applications") && <div className={`nav-item ${isNavActive("master.ops.financing_applications") ? "active" : ""}`} onClick={() => showPage("master.ops.financing_applications")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing Applications</div>}
      {canSeePage("master.ops.techflow_oversight") && <div className={`nav-item ${isNavActive("master.ops.techflow_oversight") ? "active" : ""}`} onClick={() => showPage("master.ops.techflow_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>TechFlow Oversight</div>}
      {canSeePage("master.ops.parts_orders") && <div className={`nav-item ${isNavActive("master.ops.parts_orders") ? "active" : ""}`} onClick={() => showPage("master.ops.parts_orders")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders</div>}
    </div>}
    {anyVisible(["master.marketplace.listings_oversight", "master.marketplace.active_auctions", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"]) && <div className="nav-section">
      <div className="nav-label">Marketplace</div>
      {canSeePage("master.marketplace.listings_oversight") && <div className={`nav-item ${isNavActive("master.marketplace.listings_oversight") ? "active" : ""}`} onClick={() => showPage("master.marketplace.listings_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Listings Oversight</div>}
      {canSeePage("master.marketplace.active_auctions") && <div className={`nav-item ${isNavActive("master.marketplace.active_auctions") ? "active" : ""}`} onClick={() => showPage("master.marketplace.active_auctions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Active Auctions</div>}
      {canSeePage("master.marketplace.transactions") && <div className={`nav-item ${isNavActive("master.marketplace.transactions") ? "active" : ""}`} onClick={() => showPage("master.marketplace.transactions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Transactions</div>}
      {canSeePage("master.marketplace.escrow_admin") && <div className={`nav-item ${isNavActive("master.marketplace.escrow_admin") ? "active" : ""}`} onClick={() => showPage("master.marketplace.escrow_admin")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Escrow Admin</div>}
      {canSeePage("master.marketplace.members") && <div className={`nav-item ${isNavActive("master.marketplace.members") ? "active" : ""}`} onClick={() => showPage("master.marketplace.members")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Members</div>}
    </div>}
        </div>
        <div className="sidebar-footer">
          <div className="user-info" onClick={() => showPage("master.mgmt.dashboard")} style={{cursor: "pointer"}}>
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
    case 'master.mgmt.dashboard': return <PageScaffold
      pageId="master.mgmt.dashboard"
      title="Dashboard"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.dashboard.revenue_overview", "label": "Revenue overview", "internal_in": ["master.mgmt.revenue_billing"]}, {"sub_id": "master.mgmt.dashboard.active_dealers_growth", "label": "Active dealers & growth", "internal_in": ["master.mgmt.dealer_accounts"]}, {"sub_id": "master.mgmt.dashboard.subscription_mrr", "label": "Subscription MRR", "ext_in": [{"sys": "stripe", "act": "subscription metrics"}]}, {"sub_id": "master.mgmt.dashboard.alerts_notifications", "label": "Alerts & notifications", "internal_in": ["system.event_feed"]}]}
    />;
    case 'master.mgmt.dealer_accounts': return <PageScaffold
      pageId="master.mgmt.dealer_accounts"
      title="Dealer Accounts"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.dealer_accounts.all_dealers", "label": "All Dealers", "notes": "list view, no external"}, {"sub_id": "master.mgmt.dealer_accounts.add_new_dealer", "label": "Add New Dealer", "internal_out": ["dealer.* (provisions tenant)"], "ext_out": [{"sys": "stripe", "act": "create customer + subscription"}, {"sys": "email", "act": "welcome + invite"}]}, {"sub_id": "master.mgmt.dealer_accounts.df_account_overview", "label": "Dealer File \u203a Account overview"}, {"sub_id": "master.mgmt.dealer_accounts.df_subscription_plan", "label": "Dealer File \u203a Subscription & plan", "ext_in": [{"sys": "stripe", "act": "subscription data"}], "ext_out": [{"sys": "stripe", "act": "modify subscription"}]}, {"sub_id": "master.mgmt.dealer_accounts.df_services_enrolled", "label": "Dealer File \u203a Services enrolled"}, {"sub_id": "master.mgmt.dealer_accounts.df_custom_pricing", "label": "Dealer File \u203a Custom pricing & terms"}, {"sub_id": "master.mgmt.dealer_accounts.df_billing_history", "label": "Dealer File \u203a Billing history", "ext_in": [{"sys": "stripe", "act": "invoice history"}]}, {"sub_id": "master.mgmt.dealer_accounts.df_documents_contracts", "label": "Dealer File \u203a Documents & contracts"}, {"sub_id": "master.mgmt.dealer_accounts.df_activity_log", "label": "Dealer File \u203a Activity log"}]}
    />;
    case 'master.mgmt.catalog': return <PageScaffold
      pageId="master.mgmt.catalog"
      title="Product & Service Catalog"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.catalog.all_services", "label": "All Services"}, {"sub_id": "master.mgmt.catalog.gap", "label": "GAP Coverage"}, {"sub_id": "master.mgmt.catalog.roadside", "label": "Roadside Assistance"}, {"sub_id": "master.mgmt.catalog.warranty_plans", "label": "Warranty Plans"}, {"sub_id": "master.mgmt.catalog.extended_warranty", "label": "Extended Warranty"}, {"sub_id": "master.mgmt.catalog.wheel_tire", "label": "Wheel & Tire"}, {"sub_id": "master.mgmt.catalog.appearance", "label": "Appearance Protection"}, {"sub_id": "master.mgmt.catalog.key_replacement", "label": "Key Replacement"}, {"sub_id": "master.mgmt.catalog.plans_pricing", "label": "Plans & Pricing"}, {"sub_id": "master.mgmt.catalog.push_updates", "label": "Push Updates \u2192 Dealers", "internal_out": ["dealer.ops.sales_services (all)", "dealer.ops.messages (all)"], "ext_out": [{"sys": "email", "act": "broadcast catalog update"}]}]}
    />;
    case 'master.mgmt.revenue_billing': return <PageScaffold
      pageId="master.mgmt.revenue_billing"
      title="Revenue & Billing"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.revenue_billing.revenue_dashboard", "label": "Revenue dashboard", "ext_in": [{"sys": "stripe", "act": "aggregated revenue"}]}, {"sub_id": "master.mgmt.revenue_billing.subscription_billing", "label": "Subscription billing", "ext_in": [{"sys": "stripe", "act": "subscription webhooks"}], "ext_out": [{"sys": "stripe", "act": "manage subscriptions"}]}, {"sub_id": "master.mgmt.revenue_billing.invoice_management", "label": "Invoice management", "internal_out": ["dealer.ops.documents"], "ext_in": [{"sys": "stripe", "act": "invoice events"}], "ext_out": [{"sys": "stripe", "act": "create/modify invoice"}, {"sys": "email", "act": "deliver invoice + receipt"}]}, {"sub_id": "master.mgmt.revenue_billing.commission_reports", "label": "Commission reports", "internal_in": ["dealer.ops.sales_services", "marketplace.main.my_bids"]}]}
    />;
    case 'master.mgmt.communications': return <PageScaffold
      pageId="master.mgmt.communications"
      title="Communications"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.communications.push_notifications", "label": "Push notifications \u2192 Dealers", "internal_out": ["dealer.ops.dashboard (all)"], "ext_out": [{"sys": "email", "act": "deliver push"}]}, {"sub_id": "master.mgmt.communications.broadcast_messages", "label": "Broadcast messages", "internal_out": ["dealer.ops.messages (all)"], "ext_out": [{"sys": "email", "act": "deliver broadcast"}]}, {"sub_id": "master.mgmt.communications.message_history", "label": "Message history"}]}
    />;
    case 'master.mgmt.staff_permissions': return <PageScaffold
      pageId="master.mgmt.staff_permissions"
      title="Staff & Permissions"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.staff_permissions.staff_accounts", "label": "Staff accounts", "ext_out": [{"sys": "email", "act": "operator staff invite"}]}, {"sub_id": "master.mgmt.staff_permissions.roles_permissions", "label": "Roles & permissions"}]}
    />;
    case 'master.mgmt.platform_settings': return <PageScaffold
      pageId="master.mgmt.platform_settings"
      title="Platform Settings"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.platform_settings.general_settings", "label": "General settings"}, {"sub_id": "master.mgmt.platform_settings.email_templates", "label": "Email templates", "ext_out": [{"sys": "email", "act": "template config"}]}, {"sub_id": "master.mgmt.platform_settings.integrations", "label": "Integrations", "ext_out": [{"sys": "stripe", "act": "API key config"}, {"sys": "tavus", "act": "API key config"}, {"sys": "anthropic", "act": "API key config"}, {"sys": "cloudflare", "act": "API token config"}]}, {"sub_id": "master.mgmt.platform_settings.ds360_branding", "label": "DS360 branding"}]}
    />;
    case 'master.mgmt.blog': return <PageScaffold
      pageId="master.mgmt.blog"
      title="Blog Management"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.blog.queue", "label": "Queue (scheduled)"}, {"sub_id": "master.mgmt.blog.drafts", "label": "Drafts (AI-generated)", "ext_in": [{"sys": "anthropic", "act": "generated draft"}]}, {"sub_id": "master.mgmt.blog.published", "label": "Published", "internal_out": ["public_marketing_site.blog"]}, {"sub_id": "master.mgmt.blog.cron_scheduler", "label": "Cron scheduler config", "ext_out": [{"sys": "anthropic", "act": "trigger generation (cron)"}]}]}
    />;
    case 'master.ops.dashboard': return <PageScaffold
      pageId="master.ops.dashboard"
      title="Operations Dashboard"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.dashboard.claim_queue_overview", "label": "Claim queue overview", "internal_in": ["master.ops.claim_queue"]}, {"sub_id": "master.ops.dashboard.new_submissions", "label": "New submissions", "internal_in": ["dealer.ops.claims (all)"]}, {"sub_id": "master.ops.dashboard.notifications_feed", "label": "Notifications feed"}, {"sub_id": "master.ops.dashboard.parts_awaiting_receipt", "label": "Parts awaiting receipt", "internal_in": ["master.ops.parts_management"]}]}
    />;
    case 'master.ops.claim_queue': return <PageScaffold
      pageId="master.ops.claim_queue"
      title="Claim Queue"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.claim_queue.new_unassigned", "label": "New / Unassigned"}, {"sub_id": "master.ops.claim_queue.in_review", "label": "In Review"}, {"sub_id": "master.ops.claim_queue.submitted_to_mfr", "label": "Submitted to Manufacturer", "ext_out": [{"sys": "email", "act": "status notif \u2192 dealer + client"}]}, {"sub_id": "master.ops.claim_queue.awaiting_parts", "label": "Awaiting Parts", "ext_out": [{"sys": "email", "act": "status notif"}]}, {"sub_id": "master.ops.claim_queue.awaiting_payment", "label": "Awaiting Payment", "ext_out": [{"sys": "email", "act": "status notif"}]}, {"sub_id": "master.ops.claim_queue.completed", "label": "Completed", "ext_out": [{"sys": "email", "act": "completion notif"}]}]}
    />;
    case 'master.ops.work_by_dealer': return <PageScaffold
      pageId="master.ops.work_by_dealer"
      title="Work by Dealer"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.work_by_dealer.units_vins", "label": "Units / VINs", "internal_in": ["dealer.ops.inventory"]}, {"sub_id": "master.ops.work_by_dealer.active_claims", "label": "Active Claims", "internal_in": ["dealer.ops.claims"]}, {"sub_id": "master.ops.work_by_dealer.cd_submitted_photos", "label": "Claim Detail \u203a Submitted photos", "ext_out": [{"sys": "anthropic", "act": "AI Doc Scanner on photos"}]}, {"sub_id": "master.ops.work_by_dealer.cd_3c_documentation", "label": "Claim Detail \u203a 3C documentation"}, {"sub_id": "master.ops.work_by_dealer.cd_frc_lines", "label": "Claim Detail \u203a FRC lines"}, {"sub_id": "master.ops.work_by_dealer.cd_parts_ordering", "label": "Claim Detail \u203a Parts ordering", "internal_out": ["master.ops.parts_management"], "ext_out": [{"sys": "parts_suppliers", "act": "create order"}]}, {"sub_id": "master.ops.work_by_dealer.cd_mfr_submission", "label": "Claim Detail \u203a Manufacturer submission", "ext_out": [{"sys": "mfr_portals", "act": "submit (off-platform)"}]}, {"sub_id": "master.ops.work_by_dealer.cd_invoice_payment", "label": "Claim Detail \u203a Invoice & payment", "ext_out": [{"sys": "stripe", "act": "create invoice (Super Admin only)"}, {"sys": "email", "act": "invoice delivery"}], "notes": "Super Admin only"}, {"sub_id": "master.ops.work_by_dealer.cd_dealer_thread", "label": "Claim Detail \u203a Dealer message thread", "internal_out": ["dealer.ops.messages"], "ext_out": [{"sys": "email", "act": "message notif"}]}, {"sub_id": "master.ops.work_by_dealer.warranty_sales_verify", "label": "Warranty sales (verify)", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "master.ops.work_by_dealer.service_contracts", "label": "Service contracts", "internal_in": ["dealer.ops.documents"]}, {"sub_id": "master.ops.work_by_dealer.dealer_documents", "label": "Dealer documents", "internal_in": ["dealer.ops.documents"]}]}
    />;
    case 'master.ops.parts_management': return <PageScaffold
      pageId="master.ops.parts_management"
      title="Parts Management"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.parts_management.active_orders", "label": "Active orders", "ext_out": [{"sys": "parts_suppliers", "act": "place + track"}]}, {"sub_id": "master.ops.parts_management.received", "label": "Received", "internal_out": ["dealer.ops.claims (parts status)"], "ext_in": [{"sys": "parts_suppliers", "act": "receiving confirmation"}], "ext_out": [{"sys": "email", "act": "notify dealer"}]}, {"sub_id": "master.ops.parts_management.suppliers", "label": "Suppliers"}]}
    />;
    case 'master.ops.manufacturer_portals': return <PageScaffold
      pageId="master.ops.manufacturer_portals"
      title="Manufacturer Portals"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.manufacturer_portals.jayco", "label": "Jayco", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}, {"sub_id": "master.ops.manufacturer_portals.forest_river", "label": "Forest River", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}, {"sub_id": "master.ops.manufacturer_portals.heartland", "label": "Heartland", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}, {"sub_id": "master.ops.manufacturer_portals.keystone", "label": "Keystone", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}, {"sub_id": "master.ops.manufacturer_portals.columbia_nw", "label": "Columbia NW", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}, {"sub_id": "master.ops.manufacturer_portals.midwest_auto", "label": "Midwest Auto", "ext_out": [{"sys": "mfr_portals", "act": "launch link"}]}]}
    />;
    case 'master.ops.reporting': return <PageScaffold
      pageId="master.ops.reporting"
      title="Reporting"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.reporting.claims_by_dealer", "label": "Claims by dealer", "internal_in": ["dealer.ops.claims (aggregate)"]}, {"sub_id": "master.ops.reporting.revenue_per_dealer", "label": "Revenue per dealer", "ext_in": [{"sys": "stripe", "act": "revenue data"}]}, {"sub_id": "master.ops.reporting.processing_times", "label": "Processing times"}]}
    />;
    case 'master.mgmt.financing_partners': return <PageScaffold
      pageId="master.mgmt.financing_partners"
      title="Financing Partners"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.financing_partners.all_lenders", "label": "All Lenders"}, {"sub_id": "master.mgmt.financing_partners.add_lender", "label": "Add Lender", "internal_out": ["dealer.ops.financing (lender becomes available)"], "ext_out": [{"sys": "lender_apis", "act": "establish API connection"}]}, {"sub_id": "master.mgmt.financing_partners.lf_connection_api", "label": "Lender File \u203a Connection status & API", "ext_in": [{"sys": "lender_apis", "act": "connection health check"}]}, {"sub_id": "master.mgmt.financing_partners.lf_rate_sheets", "label": "Lender File \u203a Rate sheets", "ext_in": [{"sys": "lender_apis", "act": "pull current rate sheet"}]}, {"sub_id": "master.mgmt.financing_partners.lf_approval_rules", "label": "Lender File \u203a Approval rules engine"}, {"sub_id": "master.mgmt.financing_partners.lf_commission_structure", "label": "Lender File \u203a Commission structure", "notes": "Super Admin only"}, {"sub_id": "master.mgmt.financing_partners.integration_settings", "label": "Integration settings", "ext_out": [{"sys": "lender_apis", "act": "credential config"}]}, {"sub_id": "master.mgmt.financing_partners.push_lender_updates", "label": "Push lender updates \u2192 Dealers", "internal_out": ["dealer.ops.financing (all)", "dealer.ops.messages (all)"], "ext_out": [{"sys": "email", "act": "lender update notification"}]}]}
    />;
    case 'master.mgmt.parts_catalog': return <PageScaffold
      pageId="master.mgmt.parts_catalog"
      title="Parts Catalog"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.parts_catalog.master_parts_list", "label": "Master Parts List"}, {"sub_id": "master.mgmt.parts_catalog.add_part", "label": "Add Part", "internal_out": ["dealer.ops.parts_store (becomes available)"]}, {"sub_id": "master.mgmt.parts_catalog.pd_sku_description", "label": "Part Detail \u203a SKU & description"}, {"sub_id": "master.mgmt.parts_catalog.pd_category", "label": "Part Detail \u203a Category"}, {"sub_id": "master.mgmt.parts_catalog.pd_supplier_mapping", "label": "Part Detail \u203a Supplier mapping", "ext_out": [{"sys": "parts_suppliers", "act": "map to supplier SKU"}]}, {"sub_id": "master.mgmt.parts_catalog.pd_master_pricing", "label": "Part Detail \u203a Master pricing", "notes": "Super Admin only"}, {"sub_id": "master.mgmt.parts_catalog.pd_markup_rules", "label": "Part Detail \u203a Markup rules"}, {"sub_id": "master.mgmt.parts_catalog.supplier_relationships", "label": "Supplier relationships", "ext_out": [{"sys": "parts_suppliers", "act": "relationship config"}]}, {"sub_id": "master.mgmt.parts_catalog.push_catalog_to_dealers", "label": "Push Updates \u2192 Dealers", "internal_out": ["dealer.ops.parts_store (all)"], "ext_out": [{"sys": "email", "act": "parts catalog update notification"}]}]}
    />;
    case 'master.mgmt.campaign_templates': return <PageScaffold
      pageId="master.mgmt.campaign_templates"
      title="Campaign Templates"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.campaign_templates.email_template_library", "label": "Email template library"}, {"sub_id": "master.mgmt.campaign_templates.landing_page_templates", "label": "Landing page templates"}, {"sub_id": "master.mgmt.campaign_templates.lead_capture_templates", "label": "Lead capture form templates"}, {"sub_id": "master.mgmt.campaign_templates.seo_page_templates", "label": "SEO page templates"}, {"sub_id": "master.mgmt.campaign_templates.push_templates_to_dealers", "label": "Push templates \u2192 Dealers", "internal_out": ["dealer.ops.marketing (all)"], "ext_out": [{"sys": "email", "act": "new template available notification"}]}]}
    />;
    case 'master.mgmt.consignment_oversight': return <PageScaffold
      pageId="master.mgmt.consignment_oversight"
      title="Consignment Oversight"
      section="Management"
      scopedRole=""
      subItems={[{"sub_id": "master.mgmt.consignment_oversight.all_agreements", "label": "All consignment agreements (cross-dealer)", "internal_in": ["dealer.ops.consignment (all)"]}, {"sub_id": "master.mgmt.consignment_oversight.active_consignments", "label": "Active consignments"}, {"sub_id": "master.mgmt.consignment_oversight.payout_tracking", "label": "Payout tracking", "ext_in": [{"sys": "stripe", "act": "Stripe Connect payout state"}]}, {"sub_id": "master.mgmt.consignment_oversight.disputes", "label": "Disputes & issues"}]}
    />;
    case 'master.ops.financing_applications': return <PageScaffold
      pageId="master.ops.financing_applications"
      title="Financing Applications"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.financing_applications.new_submitted", "label": "New / Submitted", "internal_in": ["dealer.ops.financing"]}, {"sub_id": "master.ops.financing_applications.pending_lender_review", "label": "Pending Lender Review", "ext_in": [{"sys": "lender_apis", "act": "application status polling"}]}, {"sub_id": "master.ops.financing_applications.approved", "label": "Approved", "internal_out": ["dealer.ops.financing", "client.main.financing"], "ext_in": [{"sys": "lender_apis", "act": "approval decision + terms"}], "ext_out": [{"sys": "email", "act": "approval notification"}]}, {"sub_id": "master.ops.financing_applications.declined", "label": "Declined", "internal_out": ["dealer.ops.financing"], "ext_in": [{"sys": "lender_apis", "act": "decline reason"}], "ext_out": [{"sys": "email", "act": "decline notification"}]}, {"sub_id": "master.ops.financing_applications.funded", "label": "Funded", "internal_out": ["client.main.financing (loan active)", "master.mgmt.revenue_billing (commission)"], "ext_in": [{"sys": "lender_apis", "act": "funding confirmation"}]}, {"sub_id": "master.ops.financing_applications.stuck_followup", "label": "Stuck / Follow-up"}]}
    />;
    case 'master.ops.techflow_oversight': return <PageScaffold
      pageId="master.ops.techflow_oversight"
      title="TechFlow Oversight"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.techflow_oversight.all_technicians", "label": "All technicians (cross-dealer)", "internal_in": ["dealer.ops.techflow (all)"]}, {"sub_id": "master.ops.techflow_oversight.active_dispatches", "label": "Active dispatches (live map)", "ext_in": [{"sys": "maps_routing", "act": "live tech positions"}]}, {"sub_id": "master.ops.techflow_oversight.completed_jobs", "label": "Completed jobs"}, {"sub_id": "master.ops.techflow_oversight.labor_hours_reports", "label": "Labor hours reports", "internal_in": ["dealer.ops.techflow"], "internal_out": ["master.ops.work_by_dealer (Claim Detail labor sync)"]}, {"sub_id": "master.ops.techflow_oversight.claim_workorder_sync", "label": "Claim \u2192 work order sync status", "internal_in": ["master.ops.claim_queue", "dealer.ops.techflow"]}]}
    />;
    case 'master.ops.parts_orders': return <PageScaffold
      pageId="master.ops.parts_orders"
      title="Parts Orders"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "master.ops.parts_orders.new_client_orders", "label": "New client orders", "internal_in": ["client.main.parts_store"]}, {"sub_id": "master.ops.parts_orders.fulfillment_queue", "label": "Fulfillment queue", "internal_in": ["dealer.ops.parts_store"]}, {"sub_id": "master.ops.parts_orders.shipped", "label": "Shipped", "ext_out": [{"sys": "email", "act": "shipment notification to client"}]}, {"sub_id": "master.ops.parts_orders.delivered", "label": "Delivered", "ext_out": [{"sys": "email", "act": "delivery confirmation"}]}, {"sub_id": "master.ops.parts_orders.returns_issues", "label": "Returns / issues"}]}
    />;
    case 'master.marketplace.listings_oversight': return <PageScaffold
      pageId="master.marketplace.listings_oversight"
      title="Listings Oversight"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "master.marketplace.listings_oversight.all_listings", "label": "All active listings (read-only)", "internal_in": ["marketplace.main.sell", "dealer.ops.consignment"]}, {"sub_id": "master.marketplace.listings_oversight.flagged_listings", "label": "Flagged listings (review queue)"}, {"sub_id": "master.marketplace.listings_oversight.takedown_action", "label": "Takedown (admin action)", "internal_out": ["marketplace.main.sell (force expire)", "dealer.ops.consignment"], "ext_out": [{"sys": "email", "act": "takedown notice to seller"}], "notes": "Super Admin only"}, {"sub_id": "master.marketplace.listings_oversight.listing_history", "label": "Listing history (sold / expired / removed)"}]}
    />;
    case 'master.marketplace.active_auctions': return <PageScaffold
      pageId="master.marketplace.active_auctions"
      title="Active Auctions"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "master.marketplace.active_auctions.dealer_to_dealer_live", "label": "Dealer-to-dealer live auctions", "internal_in": ["marketplace.main.browse"]}, {"sub_id": "master.marketplace.active_auctions.public_showcase_live", "label": "Public Showcase live (24-hr windows)", "internal_in": ["marketplace.main.public_showcase"]}, {"sub_id": "master.marketplace.active_auctions.live_monthly_auctions", "label": "Live Monthly public auctions (Bidder Portal)", "internal_in": ["bidder.main.live_auctions"]}, {"sub_id": "master.marketplace.active_auctions.bid_activity_feed", "label": "Bid activity feed (all auctions)"}]}
    />;
    case 'master.marketplace.transactions': return <PageScaffold
      pageId="master.marketplace.transactions"
      title="Transactions"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "master.marketplace.transactions.completed_sales", "label": "Completed sales", "internal_in": ["marketplace.main.my_bids", "bidder.main.my_bids"]}, {"sub_id": "master.marketplace.transactions.refunds_disputes", "label": "Refunds & disputes", "ext_out": [{"sys": "stripe", "act": "process refund / dispute resolution"}]}, {"sub_id": "master.marketplace.transactions.commission_ledger", "label": "DS360 commission ledger ($250 flat)", "internal_in": ["marketplace.main.escrow", "bidder.main.escrow"], "internal_out": ["master.mgmt.revenue_billing"], "notes": "Super Admin only"}, {"sub_id": "master.marketplace.transactions.tax_reporting", "label": "Tax reporting (1099-K exports)", "ext_out": [{"sys": "stripe", "act": "pull 1099 data"}], "notes": "Super Admin only"}]}
    />;
    case 'master.marketplace.escrow_admin': return <PageScaffold
      pageId="master.marketplace.escrow_admin"
      title="Escrow Admin"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "master.marketplace.escrow_admin.all_escrow_holds", "label": "All active escrow holds ($500 \u00d7 N bids)", "ext_in": [{"sys": "stripe", "act": "aggregate hold state"}]}, {"sub_id": "master.marketplace.escrow_admin.release_queue", "label": "Release queue (pending winner confirmation)", "ext_out": [{"sys": "stripe", "act": "release escrow to seller"}]}, {"sub_id": "master.marketplace.escrow_admin.manual_override", "label": "Manual override / resolution", "ext_out": [{"sys": "stripe", "act": "force release / refund"}], "notes": "Super Admin only"}, {"sub_id": "master.marketplace.escrow_admin.escrow_audit_log", "label": "Escrow audit log"}]}
    />;
    case 'master.marketplace.members': return <PageScaffold
      pageId="master.marketplace.members"
      title="Members"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "master.marketplace.members.dealer_bidders", "label": "Dealer bidders ($499/yr members)", "internal_in": ["dealer.account.my_subscription", "marketplace.account.membership"]}, {"sub_id": "master.marketplace.members.public_bidders_dealer_scoped", "label": "Public bidders (dealer-scoped)", "internal_in": ["dealer.ops.portal_settings.partners"]}, {"sub_id": "master.marketplace.members.public_bidders_independent", "label": "Public bidders (independent via Bidder Portal)", "internal_in": ["bidder.account.verification"]}, {"sub_id": "master.marketplace.members.verification_queue", "label": "Verification queue (manual review)", "notes": "Super Admin only"}, {"sub_id": "master.marketplace.members.banned_restricted", "label": "Banned / restricted accounts", "notes": "Super Admin only"}]}
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
