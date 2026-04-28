// DealerPortalV6 — generated from v6 schema. Do not hand-edit menu structure;
// edit /schema/v6.json and regenerate.
// Preserves existing sidebar CSS classes (sidebar, sidebar-nav, nav-section, nav-label, nav-item, nb-* badges).

import { useState, useEffect } from "react";
import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useApiFetch } from "@/lib/api";
import PortalShell from "@/components/layout/PortalShell";
import DealerMainNav from "@/pages/nav/DealerMainNav";
import DealerClaimsPage from "@/components/dealer/DealerClaimsPage";
import DealerPartsOrdersPage from "@/components/dealer/DealerPartsOrdersPage";
import InventoryListPage from "@/components/units/InventoryListPage";
import DealerDashboard from "@/components/dealer/DealerDashboard";
import DispatchBoard from "@/components/service/DispatchBoard";

// ============================================================================
// V6 SCHEMA METADATA — role-scoping and RBAC rules baked in
// ============================================================================

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"dealer.ops.dashboard": {"menu_item": "Dashboard", "section": "Operations", "scoped_role": ""}, "dealer.ops.claims": {"menu_item": "Claims", "section": "Operations", "scoped_role": ""}, "dealer.ops.inventory": {"menu_item": "Units / Inventory", "section": "Operations", "scoped_role": ""}, "dealer.ops.clients": {"menu_item": "Clients", "section": "Operations", "scoped_role": ""}, "dealer.ops.sales_services": {"menu_item": "Sales & Services", "section": "Operations", "scoped_role": ""}, "dealer.ops.documents": {"menu_item": "Documents", "section": "Operations", "scoped_role": ""}, "dealer.ops.messages": {"menu_item": "Messages", "section": "Operations", "scoped_role": ""}, "dealer.account.my_subscription": {"menu_item": "My Subscription", "section": "Account", "scoped_role": ""}, "dealer.account.portal_settings": {"menu_item": "Portal Settings", "section": "Account", "scoped_role": ""}, "dealer.ops.financing": {"menu_item": "Financing", "section": "Operations", "scoped_role": ""}, "dealer.ops.parts_store": {"menu_item": "Parts Store", "section": "Operations", "scoped_role": ""}, "dealer.ops.consignment": {"menu_item": "Consignment", "section": "Operations", "scoped_role": ""}, "dealer.ops.techflow": {"menu_item": "TechFlow", "section": "Operations", "scoped_role": ""}, "dealer.ops.marketing": {"menu_item": "Marketing", "section": "Operations", "scoped_role": ""}, "dealer.marketplace.browse": {"menu_item": "Browse Listings", "section": "Marketplace", "scoped_role": ""}, "dealer.marketplace.my_bids": {"menu_item": "My Bids", "section": "Marketplace", "scoped_role": ""}, "dealer.marketplace.my_listings": {"menu_item": "My Listings (Sell)", "section": "Marketplace", "scoped_role": ""}, "dealer.marketplace.public_showcase": {"menu_item": "Public Showcase", "section": "Marketplace", "scoped_role": ""}, "dealer.marketplace.escrow_payments": {"menu_item": "Escrow & My Payments", "section": "Marketplace", "scoped_role": ""}, "dealer.consignor_guest.my_units": {"menu_item": "My Consigned Unit(s)", "section": "Consignor Guest", "scoped_role": "consignor"}, "dealer.consignor_guest.offers_bids": {"menu_item": "Offers & Bids on My Unit", "section": "Consignor Guest", "scoped_role": "consignor"}, "dealer.consignor_guest.payouts": {"menu_item": "My Payouts", "section": "Consignor Guest", "scoped_role": "consignor"}, "dealer.public_bidder_guest.my_bids": {"menu_item": "My Bids (Public Bidder)", "section": "Public Bidder Guest", "scoped_role": "public_bidder"}, "dealer.public_bidder_guest.verification": {"menu_item": "Verification & Payment", "section": "Public Bidder Guest", "scoped_role": "public_bidder"},
  // ── Service Manager ──
  "service.ops.dashboard":    {"menu_item": "Dashboard",          "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.work_orders":  {"menu_item": "Work Orders",        "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.scheduler":    {"menu_item": "Dispatch Scheduler", "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.technicians":  {"menu_item": "Technicians",        "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.parts":        {"menu_item": "Parts",              "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.units":        {"menu_item": "Unit Lookup",        "section": "Service",          "scoped_role": "service_manager"},
  "service.ops.messages":     {"menu_item": "Messages",           "section": "Service",          "scoped_role": "service_manager"},
  "service.account.settings": {"menu_item": "Settings",           "section": "Account",          "scoped_role": "service_manager"},
  // ── Shop Manager ──
  "shop.ops.dashboard":       {"menu_item": "Dashboard",          "section": "Shop",             "scoped_role": "shop_manager"},
  "shop.ops.work_orders":     {"menu_item": "Work Orders",        "section": "Shop",             "scoped_role": "shop_manager"},
  "shop.ops.scheduler":       {"menu_item": "Dispatch Scheduler", "section": "Shop",             "scoped_role": "shop_manager"},
  "shop.ops.parts":           {"menu_item": "Parts",              "section": "Shop",             "scoped_role": "shop_manager"},
  "shop.account.settings":    {"menu_item": "Settings",           "section": "Account",          "scoped_role": "shop_manager"},
  // ── Parts Department ──
  "parts.ops.dashboard":      {"menu_item": "Dashboard",          "section": "Parts Department", "scoped_role": "parts_dept"},
  "parts.account.settings":   {"menu_item": "Settings",           "section": "Account",          "scoped_role": "parts_dept"},
};

const ROLES: Record<string, any> = {"operator_admin": {"label": "Operator Admin", "login_portal": "ds360_master", "created_by": "system (first operator account)", "scope": "full_platform", "can_create": ["operator_staff", "dealer_owner"], "description": "Full access to every page on the Operator Portal including billing, commissions, Stripe admin, and platform settings."}, "operator_staff": {"label": "Operator Staff", "login_portal": "ds360_master", "created_by": "operator_admin (via Staff & Permissions)", "scope": "operations_claims_no_billing", "can_create": [], "blocked_pages": ["master.mgmt.revenue_billing", "master.mgmt.campaign_templates", "master.mgmt.communications", "master.mgmt.blog", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"], "scoped_pages": {"master.mgmt.dealer_accounts": "read_only_no_billing", "master.mgmt.financing_partners": "no_commission_visible", "master.mgmt.consignment_oversight": "no_payout_amounts", "master.ops.work_by_dealer": "no_invoice_section", "master.ops.reporting": "no_revenue_per_dealer"}, "description": "Claims processing, warranty verification, parts coordination. Cannot see billing, commissions, staff management, or platform settings."}, "dealer_owner": {"label": "Dealer Owner", "login_portal": "dealer", "created_by": "operator_admin (on new dealer creation)", "scope": "full_dealership_inc_billing", "can_create": ["dealer_staff", "technician", "public_bidder (scoped)", "consignor (scoped)", "client"], "description": "Full access to their Dealer Portal including billing, subscription, staff/tech management, marketplace bidding, and partner account creation."}, "dealer_staff": {"label": "Dealer Staff", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "operations_no_billing_no_admin", "can_create": [], "blocked_pages": ["dealer.account.my_subscription", "dealer.account.portal_settings", "dealer.marketplace.escrow_payments"], "scoped_pages": {"dealer.ops.dashboard": "no_revenue_snapshot", "dealer.ops.sales_services": "no_commission_tracker", "dealer.ops.consignment": "no_payout_amounts", "dealer.ops.documents": "no_ds360_invoices", "dealer.ops.parts_store": "no_revenue_tracker"}, "description": "Operational access \u2014 claims, units, clients, sales entry, parts fulfillment, techflow coordination. No billing, no staff management, no subscription, no escrow."}, "technician": {"label": "Technician", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Technicians tab)", "scope": "techflow_own_work_orders_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.ops.claims", "dealer.ops.techflow"], "scoped_pages": {"dealer.ops.dashboard": "tech_view_my_jobs_today", "dealer.ops.claims": "read_only_own_workorder_claims", "dealer.ops.techflow": "own_work_orders_schedule_timelog"}, "description": "Sees only their own work orders, schedule, time log, and read-only access to claims tied to their work. No access to inventory, clients, financials, or any admin functions."}, "public_bidder": {"label": "Public Bidder (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Partners tab)", "scope": "marketplace_public_showcase_own_bids_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.marketplace.browse", "dealer.marketplace.public_showcase", "dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"], "header_label": "[Dealer Name] \u2014 Marketplace Access", "description": "CC-verified bidder sponsored by a specific dealer. Sees only Public Showcase listings (not full dealer-to-dealer marketplace), own bids, own verification + payment methods. Scoped to sponsoring dealer."}, "independent_bidder": {"label": "Independent Bidder (Live Monthly Auctions)", "login_portal": "bidder", "created_by": "self-registration on Bidder Portal", "scope": "live_monthly_auctions_until_won", "can_create": [], "allowed_pages_only": ["bidder.main.dashboard", "bidder.main.live_auctions", "bidder.main.browse", "bidder.main.my_bids", "bidder.main.escrow", "bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"], "becomes_client_on_win": true, "description": "Standalone buyer account for Live Monthly public auctions. Not linked to any dealer until they win a unit, at which point they auto-provision as a client of the winning unit's selling dealer."}, "consignor": {"label": "Consignor (Dealer-sponsored)", "login_portal": "dealer", "created_by": "dealer_owner (via Consignment > Add Consignor)", "scope": "own_consigned_units_only", "can_create": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"], "header_label": "[Dealer Name] \u2014 Consignment Portal", "description": "Third party whose unit a dealer is selling on consignment. View-only of their own consigned unit(s), offers/bids on their unit, payout history, banking verification (Stripe Connect), and tax docs."}, "client": {"label": "Client", "login_portal": "client", "created_by": "dealer_owner (via Clients > Add Client) OR auto on bidder win (dealer_owner of winning unit)", "scope": "own_unit_warranty_services_only", "can_create": [], "description": "End customer of a dealer. Sees own vehicle, warranties, services, claims, documents, F&I offers, financing, parts store, service appointments. Linked to their dealer via invite link (or auto via winning a live auction)."},
  "service_manager": {"label": "Service Manager", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "service_portal_full", "can_create": [], "allowed_pages_only": ["service.ops.dashboard", "service.ops.work_orders", "service.ops.scheduler", "service.ops.technicians", "service.ops.parts", "service.ops.units", "service.ops.messages", "service.account.settings"], "description": "Full service department access — work orders, dispatch scheduler, technician management, parts, unit lookup with full bio. Cannot access billing or dealer admin."},
  "shop_manager": {"label": "Shop Manager", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "shop_portal", "can_create": [], "allowed_pages_only": ["shop.ops.dashboard", "shop.ops.work_orders", "shop.ops.scheduler", "shop.ops.parts", "shop.account.settings"], "description": "All shop work orders, dispatch board (gated by Dealer Admin schedule permission), and parts access."},
  "parts_dept": {"label": "Parts Department", "login_portal": "dealer", "created_by": "dealer_owner (via Portal Settings > Staff tab)", "scope": "parts_portal", "can_create": [], "allowed_pages_only": ["parts.ops.dashboard", "parts.account.settings"], "description": "Parts department portal — menu items configured by Dealer Admin."}};

const HOSTS_ROLES: string[] = ["dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor", "service_manager", "shop_manager", "parts_dept"];

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

export default function DealerPortalV6() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const devRole = localStorage.getItem("ds360-dev-role");
    if (devRole === "service_manager") return "service.ops.dashboard";
    if (devRole === "shop_manager")    return "shop.ops.dashboard";
    if (devRole === "parts_dept")      return "parts.ops.dashboard";
    return "dealer.ops.dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const apiFetch = useApiFetch();
  // Map Clerk user to local-shape user object expected by the rest of this component
  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: localStorage.getItem("ds360-dev-role") || (clerkUser.publicMetadata as any)?.role,
    roles: ((clerkUser.publicMetadata as any)?.roles || []) as string[],
  } : null;
  const logout = async () => { await signOut(); window.location.href = "/login"; };
  // Read dev role directly from localStorage so it applies even when not signed in
  const userRole: string = localStorage.getItem("ds360-dev-role") || user?.role || "dealer_owner";

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

  const userInitials = (user?.name || "Dealer").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Dealer";
  const roleLabel = ROLES[userRole]?.label || "Dealer";

  // Wait for Clerk to load before rendering portal
  if (!isLoaded) {
    return (
      <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666"}}>
        Loading portal...
      </div>
    );
  }

  return (
    <PortalShell context="dealer" mainNav={
      <nav className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`} style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <DealerMainNav currentPage={currentPage} onShowPage={setCurrentPage} />
      </nav>
    }>
      <main className="main" style={{ marginLeft: 0, flex: 1, overflowY: "auto" }}>
        <div className="content">
          {renderPage(currentPage, userRole, setCurrentPage)}
        </div>
      </main>
    </PortalShell>
  );
}

function renderPage(pageId: string, userRole: string, navigate: (page: string) => void) {
  switch (pageId) {
    case 'dealer.ops.dashboard': return <DealerDashboard onNavigate={navigate} />;
    case 'dealer.ops.claims': return <DealerClaimsPage />;
    case 'dealer.ops.inventory': return <InventoryListPage context="dealer" />;
    case 'dealer.ops.clients': return <PageScaffold
      pageId="dealer.ops.clients"
      title="Clients"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.clients.all_clients", "label": "All Clients"}, {"sub_id": "dealer.ops.clients.add_client", "label": "Add Client", "internal_out": ["client.* (provisions Client Portal)"], "ext_out": [{"sys": "email", "act": "client invite"}]}, {"sub_id": "dealer.ops.clients.cf_profile", "label": "Client File \u203a Profile & contact info", "internal_in": ["client.main.account"]}, {"sub_id": "dealer.ops.clients.cf_vehicles", "label": "Client File \u203a Vehicle(s) owned", "internal_in": ["dealer.ops.inventory"]}, {"sub_id": "dealer.ops.clients.cf_warranties", "label": "Client File \u203a Active warranties", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "dealer.ops.clients.cf_services", "label": "Client File \u203a Active services", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "dealer.ops.clients.cf_claim_history", "label": "Client File \u203a Claim history", "internal_in": ["dealer.ops.claims"]}, {"sub_id": "dealer.ops.clients.cf_fi_products", "label": "Client File \u203a F&I products sold", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "dealer.ops.clients.cf_fi_presenter_link", "label": "Client File \u203a AI F&I presenter link", "internal_out": ["client.main.fi_offers"], "ext_out": [{"sys": "tavus", "act": "initialize avatar session"}, {"sys": "anthropic", "act": "configure F&I AI brain context"}, {"sys": "email", "act": "F&I session invite"}]}]}
    />;
    case 'dealer.ops.sales_services': return <PageScaffold
      pageId="dealer.ops.sales_services"
      title="Sales & Services"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.sales_services.ns_select_client_unit", "label": "New Sale \u203a Select client & unit", "internal_in": ["dealer.ops.clients", "dealer.ops.inventory"]}, {"sub_id": "dealer.ops.sales_services.ns_choose_product", "label": "New Sale \u203a Choose product", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.ns_terms_pricing", "label": "New Sale \u203a Set terms & confirm pricing", "internal_in": ["master.mgmt.dealer_accounts (custom pricing)"]}, {"sub_id": "dealer.ops.sales_services.ns_generate_contract", "label": "New Sale \u203a Generate contract", "internal_out": ["client.main.warranties", "client.main.services", "client.main.documents", "master.mgmt.revenue_billing (commission)"], "ext_out": [{"sys": "email", "act": "deliver contract"}]}, {"sub_id": "dealer.ops.sales_services.warranty_plans", "label": "Warranty Plans", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.gap", "label": "GAP Coverage", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.roadside", "label": "Roadside Assistance", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.extended_warranty", "label": "Extended Warranty", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.wheel_tire", "label": "Wheel & Tire", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.other_services", "label": "Other Services", "internal_in": ["master.mgmt.catalog"]}, {"sub_id": "dealer.ops.sales_services.commission_tracker", "label": "Commission Tracker", "notes": "Hidden from Dealer Staff"}]}
    />;
    case 'dealer.ops.documents': return <PageScaffold
      pageId="dealer.ops.documents"
      title="Documents"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.documents.contracts", "label": "Contracts", "internal_in": ["dealer.ops.sales_services"]}, {"sub_id": "dealer.ops.documents.invoices_from_ds360", "label": "Invoices from DS360", "internal_in": ["master.mgmt.revenue_billing"], "notes": "Hidden from Dealer Staff"}, {"sub_id": "dealer.ops.documents.my_reports", "label": "My Reports"}]}
    />;
    case 'dealer.ops.messages': return <PageScaffold
      pageId="dealer.ops.messages"
      title="Messages"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.messages.inbox_from_ds360", "label": "Inbox (from DS360)", "internal_in": ["master.mgmt.communications"], "ext_in": [{"sys": "email", "act": "notif surface"}]}, {"sub_id": "dealer.ops.messages.claim_threads", "label": "Claim threads", "internal_in": ["master.ops.work_by_dealer"], "internal_out": ["master.ops.work_by_dealer (replies)"], "ext_out": [{"sys": "email", "act": "message notif"}]}, {"sub_id": "dealer.ops.messages.product_notifications", "label": "Product notifications", "internal_in": ["master.mgmt.catalog"]}]}
    />;
    case 'dealer.account.my_subscription': return <PageScaffold
      pageId="dealer.account.my_subscription"
      title="My Subscription"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "dealer.account.my_subscription.current_plan_billing", "label": "Current plan & billing", "internal_out": ["master.mgmt.revenue_billing"], "ext_in": [{"sys": "stripe", "act": "Customer Portal billing data"}], "ext_out": [{"sys": "stripe", "act": "update payment method / change subscription"}, {"sys": "email", "act": "billing + renewal reminders"}]}, {"sub_id": "dealer.account.my_subscription.invoices_from_ds360", "label": "Invoices from DS360", "ext_in": [{"sys": "stripe", "act": "invoice list"}]}]}
    />;
    case 'dealer.account.portal_settings': return <PageScaffold
      pageId="dealer.account.portal_settings"
      title="Portal Settings"
      section="Account"
      scopedRole=""
      subItems={[{"sub_id": "dealer.account.portal_settings.tab_branding", "label": "Branding tab (logo, colors, white-label)", "internal_out": ["client.* (branding)"]}, {"sub_id": "dealer.account.portal_settings.tab_domain", "label": "Domain tab (CNAME)", "ext_out": [{"sys": "cloudflare", "act": "create CNAME + auto SSL"}]}, {"sub_id": "dealer.account.portal_settings.tab_staff", "label": "Staff tab (manage dealer_staff accounts)", "internal_out": ["dealer.* (provisions Dealer Staff)"], "ext_out": [{"sys": "email", "act": "Dealer Staff invite"}]}, {"sub_id": "dealer.account.portal_settings.tab_technicians", "label": "Technicians tab (manage technician accounts)", "internal_out": ["dealer.ops.techflow (tech roster)"], "ext_out": [{"sys": "email", "act": "Technician invite"}]}, {"sub_id": "dealer.account.portal_settings.tab_partners", "label": "Partners tab (public_bidders + consignors scoped access)", "internal_out": ["dealer.ops.consignment (consignor link)", "dealer.marketplace.* (public_bidder scope)"], "ext_out": [{"sys": "email", "act": "partner access invite"}, {"sys": "stripe", "act": "Stripe Connect init (consignors)"}]}, {"sub_id": "dealer.account.portal_settings.tab_notifications", "label": "Notifications tab", "ext_out": [{"sys": "email", "act": "preference confirmation"}]}]}
    />;
    case 'dealer.ops.financing': return <PageScaffold
      pageId="dealer.ops.financing"
      title="Financing"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.financing.na_select_client_unit", "label": "New Application \u203a Select client & unit", "internal_in": ["dealer.ops.clients", "dealer.ops.inventory"]}, {"sub_id": "dealer.ops.financing.na_credit_info", "label": "New Application \u203a Credit info capture"}, {"sub_id": "dealer.ops.financing.na_select_lenders", "label": "New Application \u203a Select lenders to submit to", "internal_in": ["master.mgmt.financing_partners"]}, {"sub_id": "dealer.ops.financing.na_submit", "label": "New Application \u203a Submit", "internal_out": ["master.ops.financing_applications"], "ext_out": [{"sys": "lender_apis", "act": "submit application to selected lenders"}, {"sys": "email", "act": "application submission confirmation"}]}, {"sub_id": "dealer.ops.financing.as_timeline", "label": "Application Status \u203a Timeline", "internal_in": ["master.ops.financing_applications"]}, {"sub_id": "dealer.ops.financing.as_lender_responses", "label": "Application Status \u203a Lender responses", "ext_in": [{"sys": "lender_apis", "act": "approval/decline/counter responses"}]}, {"sub_id": "dealer.ops.financing.as_rate_comparison", "label": "Application Status \u203a Rate comparison"}, {"sub_id": "dealer.ops.financing.as_select_finalize", "label": "Application Status \u203a Select lender & finalize", "internal_out": ["client.main.financing (loan documents)", "client.main.documents"], "ext_out": [{"sys": "lender_apis", "act": "commit acceptance"}]}, {"sub_id": "dealer.ops.financing.funded_deals", "label": "Funded Deals", "internal_out": ["master.mgmt.revenue_billing (financing commission)"]}, {"sub_id": "dealer.ops.financing.payment_tracking", "label": "Client payment tracking (view)", "ext_in": [{"sys": "lender_apis", "act": "payment status"}]}]}
    />;
    case 'dealer.ops.parts_store': return <DealerPartsOrdersPage />;
    case 'dealer.ops.consignment': return <PageScaffold
      pageId="dealer.ops.consignment"
      title="Consignment"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.consignment.all_consignors", "label": "All Consignors"}, {"sub_id": "dealer.ops.consignment.add_consignor", "label": "Add Consignor", "ext_out": [{"sys": "stripe", "act": "create Stripe Connect account for payout"}, {"sys": "email", "act": "consignor welcome + onboarding"}]}, {"sub_id": "dealer.ops.consignment.cf_contact_info", "label": "Consignor File \u203a Contact info"}, {"sub_id": "dealer.ops.consignment.cf_agreement", "label": "Consignor File \u203a Agreement (% split, duration)"}, {"sub_id": "dealer.ops.consignment.cf_payout_history", "label": "Consignor File \u203a Payout history", "ext_in": [{"sys": "stripe", "act": "Connect transfer history"}]}, {"sub_id": "dealer.ops.consignment.cf_banking_info", "label": "Consignor File \u203a Banking info", "ext_in": [{"sys": "stripe", "act": "Connect onboarding status"}], "notes": "Sensitive; access-controlled"}, {"sub_id": "dealer.ops.consignment.consigned_units", "label": "Consigned Units (flagged inventory)", "internal_in": ["dealer.ops.inventory"]}, {"sub_id": "dealer.ops.consignment.active_listings", "label": "Active listings", "internal_out": ["marketplace.main.sell (if listed to marketplace)"]}, {"sub_id": "dealer.ops.consignment.sold_consignments", "label": "Sold consignments", "internal_out": ["master.mgmt.consignment_oversight"]}, {"sub_id": "dealer.ops.consignment.payouts_pending", "label": "Payouts pending", "ext_out": [{"sys": "stripe", "act": "Stripe Connect transfer to consignor"}, {"sys": "email", "act": "payout sent notification"}]}]}
    />;
    case 'dealer.ops.techflow': return <PageScaffold
      pageId="dealer.ops.techflow"
      title="TechFlow"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.techflow.technicians", "label": "Technicians (manage tech staff)", "ext_out": [{"sys": "email", "act": "tech invite email"}]}, {"sub_id": "dealer.ops.techflow.wo_incoming_from_claims", "label": "Work Orders \u203a Incoming from Claims", "internal_in": ["master.ops.claim_queue (approved warranty)"], "notes": "Auto-generated from approved warranty claim"}, {"sub_id": "dealer.ops.techflow.wo_scheduled", "label": "Work Orders \u203a Scheduled"}, {"sub_id": "dealer.ops.techflow.wo_in_progress", "label": "Work Orders \u203a In Progress"}, {"sub_id": "dealer.ops.techflow.wo_completed", "label": "Work Orders \u203a Completed", "internal_out": ["master.ops.work_by_dealer (labor hours \u2192 Claim Invoice)"]}, {"sub_id": "dealer.ops.techflow.wo_invoiced", "label": "Work Orders \u203a Invoiced", "ext_out": [{"sys": "stripe", "act": "labor invoice (if billable)"}]}, {"sub_id": "dealer.ops.techflow.dispatch_board", "label": "Dispatch board (map + route)", "ext_in": [{"sys": "maps_routing", "act": "tech locations + traffic"}], "ext_out": [{"sys": "maps_routing", "act": "calculate route to service location"}]}, {"sub_id": "dealer.ops.techflow.labor_hours_tracking", "label": "Labor Hours (syncs to claim invoice)", "internal_out": ["master.ops.work_by_dealer (labor sync)"]}, {"sub_id": "dealer.ops.techflow.mobile_service_scheduling", "label": "Mobile Service Scheduling", "ext_out": [{"sys": "maps_routing", "act": "route optimization + ETA"}, {"sys": "email", "act": "appointment confirmation to client"}]}, {"sub_id": "dealer.ops.techflow.client_service_requests", "label": "Client service requests (inbox)", "internal_in": ["client.main.service_appointments"]}]}
    />;
    case 'dealer.ops.marketing': return <PageScaffold
      pageId="dealer.ops.marketing"
      title="Marketing"
      section="Operations"
      scopedRole=""
      subItems={[{"sub_id": "dealer.ops.marketing.c_email_campaigns", "label": "Campaigns \u203a Email campaigns", "internal_in": ["master.mgmt.campaign_templates", "dealer.ops.clients (customer list)"], "ext_out": [{"sys": "email", "act": "send marketing email to client list"}]}, {"sub_id": "dealer.ops.marketing.c_campaign_library", "label": "Campaigns \u203a Library (saved)"}, {"sub_id": "dealer.ops.marketing.c_analytics", "label": "Campaigns \u203a Analytics (opens, clicks, conversions)", "ext_in": [{"sys": "email", "act": "delivery + engagement events"}]}, {"sub_id": "dealer.ops.marketing.lc_forms", "label": "Lead Capture \u203a Forms (create/manage)", "internal_in": ["master.mgmt.campaign_templates"]}, {"sub_id": "dealer.ops.marketing.lc_leads_inbox", "label": "Lead Capture \u203a Leads inbox", "internal_out": ["dealer.ops.clients (convert lead \u2192 client)"], "ext_in": [{"sys": "email", "act": "form submission via email webhook"}]}, {"sub_id": "dealer.ops.marketing.landing_pages", "label": "Landing Pages", "internal_in": ["master.mgmt.campaign_templates"]}, {"sub_id": "dealer.ops.marketing.seo_pages", "label": "SEO pages (dealer directory)", "internal_in": ["master.mgmt.campaign_templates"]}, {"sub_id": "dealer.ops.marketing.customer_segmentation", "label": "Customer segmentation", "internal_in": ["dealer.ops.clients"]}]}
    />;
    case 'dealer.marketplace.browse': return <PageScaffold
      pageId="dealer.marketplace.browse"
      title="Browse Listings"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "dealer.marketplace.browse.all_active", "label": "All Active Auctions", "internal_in": ["marketplace.main.sell (all listings)"]}, {"sub_id": "dealer.marketplace.browse.search_filter", "label": "Search & Filter (manufacturer, year, price)"}, {"sub_id": "dealer.marketplace.browse.listing_detail", "label": "Listing Detail (specs, photos, current bid, history)"}, {"sub_id": "dealer.marketplace.browse.place_bid", "label": "Place bid", "internal_out": ["dealer.marketplace.my_bids", "marketplace.main.my_bids"], "ext_out": [{"sys": "stripe", "act": "$500 escrow hold"}, {"sys": "email", "act": "bid confirmation"}]}, {"sub_id": "dealer.marketplace.browse.watch_listing", "label": "Watch listing"}]}
    />;
    case 'dealer.marketplace.my_bids': return <PageScaffold
      pageId="dealer.marketplace.my_bids"
      title="My Bids"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "dealer.marketplace.my_bids.active_bids", "label": "Active Bids"}, {"sub_id": "dealer.marketplace.my_bids.won_units", "label": "Won Units", "internal_out": ["master.mgmt.revenue_billing ($250 commission)", "dealer.ops.inventory (acquire into inventory)"], "ext_out": [{"sys": "stripe", "act": "escrow release to seller + commission capture"}, {"sys": "email", "act": "Won notification"}]}, {"sub_id": "dealer.marketplace.my_bids.lost_bids", "label": "Lost Bids"}, {"sub_id": "dealer.marketplace.my_bids.watchlist", "label": "Watchlist"}]}
    />;
    case 'dealer.marketplace.my_listings': return <PageScaffold
      pageId="dealer.marketplace.my_listings"
      title="My Listings (Sell)"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "dealer.marketplace.my_listings.create_listing", "label": "Create New Listing", "internal_in": ["dealer.ops.inventory", "dealer.ops.consignment (consigned units)"], "internal_out": ["marketplace.main.browse", "dealer.marketplace.browse"], "ext_out": [{"sys": "email", "act": "listing-created confirmation"}]}, {"sub_id": "dealer.marketplace.my_listings.active_listings", "label": "Active listings"}, {"sub_id": "dealer.marketplace.my_listings.sold", "label": "Sold", "internal_out": ["dealer.ops.consignment (payout trigger if consigned)"], "ext_out": [{"sys": "email", "act": "sold notification"}]}, {"sub_id": "dealer.marketplace.my_listings.expired", "label": "Expired"}]}
    />;
    case 'dealer.marketplace.public_showcase': return <PageScaffold
      pageId="dealer.marketplace.public_showcase"
      title="Public Showcase"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "dealer.marketplace.public_showcase.monthly_auctions", "label": "Monthly 24-hr public auctions"}, {"sub_id": "dealer.marketplace.public_showcase.my_showcase_listings", "label": "My Showcase listings"}, {"sub_id": "dealer.marketplace.public_showcase.buyer_inquiries", "label": "Buyer inquiries", "ext_out": [{"sys": "email", "act": "inquiry response"}]}]}
    />;
    case 'dealer.marketplace.escrow_payments': return <PageScaffold
      pageId="dealer.marketplace.escrow_payments"
      title="Escrow & My Payments"
      section="Marketplace"
      scopedRole=""
      subItems={[{"sub_id": "dealer.marketplace.escrow_payments.my_escrow_holds", "label": "My active escrow holds", "ext_in": [{"sys": "stripe", "act": "hold state for this dealer"}]}, {"sub_id": "dealer.marketplace.escrow_payments.payment_history", "label": "Payment history", "ext_in": [{"sys": "stripe", "act": "payment history"}]}, {"sub_id": "dealer.marketplace.escrow_payments.pending_releases", "label": "Pending releases"}, {"sub_id": "dealer.marketplace.escrow_payments.commission_paid", "label": "DS360 commission paid ($250 per win)"}]}
    />;
    case 'dealer.consignor_guest.my_units': return <PageScaffold
      pageId="dealer.consignor_guest.my_units"
      title="My Consigned Unit(s)"
      section="Consignor Guest"
      scopedRole="consignor"
      subItems={[{"sub_id": "dealer.consignor_guest.my_units.listing_status", "label": "Listing status (own units only)", "internal_in": ["dealer.ops.consignment", "dealer.marketplace.my_listings"]}, {"sub_id": "dealer.consignor_guest.my_units.photos_specs", "label": "Unit photos & specs (read-only)"}, {"sub_id": "dealer.consignor_guest.my_units.price_negotiation_log", "label": "Price negotiation log"}, {"sub_id": "dealer.consignor_guest.my_units.notes_from_dealer", "label": "Notes from dealer"}]}
    />;
    case 'dealer.consignor_guest.offers_bids': return <PageScaffold
      pageId="dealer.consignor_guest.offers_bids"
      title="Offers & Bids on My Unit"
      section="Consignor Guest"
      scopedRole="consignor"
      subItems={[{"sub_id": "dealer.consignor_guest.offers_bids.current_offers", "label": "Current offers", "internal_in": ["dealer.marketplace.my_bids"]}, {"sub_id": "dealer.consignor_guest.offers_bids.bid_history", "label": "Bid history"}, {"sub_id": "dealer.consignor_guest.offers_bids.accept_decline_override", "label": "Accept / decline (dealer-mediated)", "notes": "Consignor provides input; dealer executes"}]}
    />;
    case 'dealer.consignor_guest.payouts': return <PageScaffold
      pageId="dealer.consignor_guest.payouts"
      title="My Payouts"
      section="Consignor Guest"
      scopedRole="consignor"
      subItems={[{"sub_id": "dealer.consignor_guest.payouts.pending_payouts", "label": "Pending payouts", "internal_in": ["dealer.ops.consignment"]}, {"sub_id": "dealer.consignor_guest.payouts.completed_payouts", "label": "Completed payouts", "ext_in": [{"sys": "stripe", "act": "Stripe Connect transfer history"}]}, {"sub_id": "dealer.consignor_guest.payouts.banking_verification", "label": "Banking verification status", "ext_in": [{"sys": "stripe", "act": "Connect account status"}]}, {"sub_id": "dealer.consignor_guest.payouts.tax_documents", "label": "Tax documents (1099 if applicable)", "ext_in": [{"sys": "stripe", "act": "1099 form retrieval"}]}]}
    />;
    case 'dealer.public_bidder_guest.my_bids': return <PageScaffold
      pageId="dealer.public_bidder_guest.my_bids"
      title="My Bids (Public Bidder)"
      section="Public Bidder Guest"
      scopedRole="public_bidder"
      subItems={[{"sub_id": "dealer.public_bidder_guest.my_bids.active_bids", "label": "Active bids (own)"}, {"sub_id": "dealer.public_bidder_guest.my_bids.won_units", "label": "Won units (own)", "ext_out": [{"sys": "stripe", "act": "escrow release on won"}]}, {"sub_id": "dealer.public_bidder_guest.my_bids.lost_bids", "label": "Lost bids (own)"}, {"sub_id": "dealer.public_bidder_guest.my_bids.escrow_status", "label": "Escrow status", "ext_in": [{"sys": "stripe", "act": "own escrow state"}]}]}
    />;
    case 'dealer.public_bidder_guest.verification': return <PageScaffold
      pageId="dealer.public_bidder_guest.verification"
      title="Verification & Payment"
      section="Public Bidder Guest"
      scopedRole="public_bidder"
      subItems={[{"sub_id": "dealer.public_bidder_guest.verification.id_verification", "label": "Identity verification", "ext_out": [{"sys": "stripe", "act": "identity verification"}]}, {"sub_id": "dealer.public_bidder_guest.verification.payment_methods", "label": "Payment methods (for escrow)", "ext_in": [{"sys": "stripe", "act": "payment method list"}], "ext_out": [{"sys": "stripe", "act": "add/remove payment method"}]}, {"sub_id": "dealer.public_bidder_guest.verification.buyer_agreement", "label": "Buyer agreement (terms acceptance)"}]}
    />;
    // ── Service Manager pages ──
    case 'service.ops.dashboard': return <PageScaffold pageId="service.ops.dashboard" title="Service Dashboard" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.dashboard.my_shop_today",label:"Today's work orders & tech utilization"},{sub_id:"service.ops.dashboard.alerts",label:"Priority alerts & overdue WOs"},{sub_id:"service.ops.dashboard.quick_actions",label:"Quick actions (new WO, assign tech)"}]} />;
    case 'service.ops.work_orders': return <PageScaffold pageId="service.ops.work_orders" title="Work Orders" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.work_orders.all",label:"All work orders (create, edit, assign)"},{sub_id:"service.ops.work_orders.incoming",label:"Incoming from warranty claims"},{sub_id:"service.ops.work_orders.in_progress",label:"In progress"},{sub_id:"service.ops.work_orders.completed",label:"Completed"}]} />;
    case 'service.ops.scheduler': return <DispatchBoard />;
    case 'service.ops.technicians': return <PageScaffold pageId="service.ops.technicians" title="Technicians" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.technicians.roster",label:"Technician roster & specialties"},{sub_id:"service.ops.technicians.workload",label:"Current workload per tech"},{sub_id:"service.ops.technicians.timelog",label:"Time log & labor hours"}]} />;
    case 'service.ops.parts': return <PageScaffold pageId="service.ops.parts" title="Parts" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.parts.orders",label:"Parts orders linked to WOs"},{sub_id:"service.ops.parts.inventory",label:"Shop inventory"},{sub_id:"service.ops.parts.pending",label:"Pending arrivals"}]} />;
    case 'service.ops.units': return <PageScaffold pageId="service.ops.units" title="Unit Lookup" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.units.search",label:"Search by VIN or client"},{sub_id:"service.ops.units.bio",label:"Full unit bio — warranty, add-ons, client info"},{sub_id:"service.ops.units.service_history",label:"Service & claim history"}]} />;
    case 'service.ops.messages': return <PageScaffold pageId="service.ops.messages" title="Messages" section="Service" scopedRole="service_manager" subItems={[{sub_id:"service.ops.messages.inbox",label:"Inbox from dealer / DS360"},{sub_id:"service.ops.messages.wo_threads",label:"Work order threads"}]} />;
    case 'service.account.settings': return <PageScaffold pageId="service.account.settings" title="Settings" section="Account" scopedRole="service_manager" subItems={[{sub_id:"service.account.settings.profile",label:"Profile & contact info"},{sub_id:"service.account.settings.notifications",label:"Notification preferences"}]} />;
    // ── Shop Manager pages ──
    case 'shop.ops.dashboard': return <PageScaffold pageId="shop.ops.dashboard" title="Shop Dashboard" section="Shop" scopedRole="shop_manager" subItems={[{sub_id:"shop.ops.dashboard.today",label:"Today's shop work orders"},{sub_id:"shop.ops.dashboard.alerts",label:"Priority alerts"}]} />;
    case 'shop.ops.work_orders': return <PageScaffold pageId="shop.ops.work_orders" title="Work Orders" section="Shop" scopedRole="shop_manager" subItems={[{sub_id:"shop.ops.work_orders.all",label:"All shop WOs (read + assign techs)"},{sub_id:"shop.ops.work_orders.in_progress",label:"In progress"},{sub_id:"shop.ops.work_orders.completed",label:"Completed"}]} />;
    case 'shop.ops.scheduler': return <DispatchBoard />;
    case 'shop.ops.parts': return <PageScaffold pageId="shop.ops.parts" title="Parts" section="Shop" scopedRole="shop_manager" subItems={[{sub_id:"shop.ops.parts.orders",label:"Parts orders for shop WOs"},{sub_id:"shop.ops.parts.pending",label:"Pending arrivals"}]} />;
    case 'shop.account.settings': return <PageScaffold pageId="shop.account.settings" title="Settings" section="Account" scopedRole="shop_manager" subItems={[{sub_id:"shop.account.settings.profile",label:"Profile & contact info"},{sub_id:"shop.account.settings.notifications",label:"Notification preferences"}]} />;
    // ── Parts Department pages ──
    case 'parts.ops.dashboard': return <PageScaffold pageId="parts.ops.dashboard" title="Parts Department" section="Parts Department" scopedRole="parts_dept" subItems={[{sub_id:"parts.ops.dashboard.overview",label:"Parts department overview"},{sub_id:"parts.ops.dashboard.menu_note",label:"Additional menu items configured by Dealer Admin"}]} />;
    case 'parts.account.settings': return <PageScaffold pageId="parts.account.settings" title="Settings" section="Account" scopedRole="parts_dept" subItems={[{sub_id:"parts.account.settings.profile",label:"Profile & contact info"}]} />;
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
