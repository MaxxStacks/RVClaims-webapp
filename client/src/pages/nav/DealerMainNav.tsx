import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {
  // ── Dealer roles ──
  "dealer.ops.dashboard":                  { menu_item: "Dashboard",            section: "Operations",       scoped_role: "" },
  "dealer.ops.claims":                     { menu_item: "Claims",               section: "Operations",       scoped_role: "" },
  "dealer.ops.inventory":                  { menu_item: "Units / Inventory",    section: "Operations",       scoped_role: "" },
  "dealer.ops.clients":                    { menu_item: "Clients",              section: "Operations",       scoped_role: "" },
  "dealer.ops.sales_services":             { menu_item: "Sales & Services",     section: "Operations",       scoped_role: "" },
  "dealer.ops.documents":                  { menu_item: "Documents",            section: "Operations",       scoped_role: "" },
  "dealer.ops.messages":                   { menu_item: "Messages",             section: "Operations",       scoped_role: "" },
  "dealer.account.my_subscription":        { menu_item: "My Subscription",      section: "Account",          scoped_role: "" },
  "dealer.account.portal_settings":        { menu_item: "Portal Settings",      section: "Account",          scoped_role: "" },
  "dealer.ops.financing":                  { menu_item: "Financing",            section: "Operations",       scoped_role: "" },
  "dealer.ops.parts_store":                { menu_item: "Parts Store",          section: "Operations",       scoped_role: "" },
  "dealer.ops.consignment":                { menu_item: "Consignment",          section: "Operations",       scoped_role: "" },
  "dealer.ops.techflow":                   { menu_item: "TechFlow",             section: "Operations",       scoped_role: "" },
  "dealer.ops.marketing":                  { menu_item: "Marketing",            section: "Operations",       scoped_role: "" },
  "dealer.marketplace.browse":             { menu_item: "Browse Listings",      section: "Marketplace",      scoped_role: "" },
  "dealer.marketplace.my_bids":            { menu_item: "My Bids",              section: "Marketplace",      scoped_role: "" },
  "dealer.marketplace.my_listings":        { menu_item: "My Listings (Sell)",   section: "Marketplace",      scoped_role: "" },
  "dealer.marketplace.public_showcase":    { menu_item: "Public Showcase",      section: "Marketplace",      scoped_role: "" },
  "dealer.marketplace.escrow_payments":    { menu_item: "Escrow & My Payments", section: "Marketplace",      scoped_role: "" },
  "dealer.consignor_guest.my_units":       { menu_item: "My Consigned Unit(s)", section: "Consignor Guest",  scoped_role: "consignor" },
  "dealer.consignor_guest.offers_bids":    { menu_item: "Offers & Bids on My Unit", section: "Consignor Guest", scoped_role: "consignor" },
  "dealer.consignor_guest.payouts":        { menu_item: "My Payouts",           section: "Consignor Guest",  scoped_role: "consignor" },
  "dealer.public_bidder_guest.my_bids":    { menu_item: "My Bids (Public Bidder)", section: "Public Bidder Guest", scoped_role: "public_bidder" },
  "dealer.public_bidder_guest.verification": { menu_item: "Verification & Payment", section: "Public Bidder Guest", scoped_role: "public_bidder" },
  // ── Service Manager ──
  "service.ops.dashboard":    { menu_item: "Dashboard",            section: "Service",  scoped_role: "service_manager" },
  "service.ops.work_orders":  { menu_item: "Work Orders",          section: "Service",  scoped_role: "service_manager" },
  "service.ops.scheduler":    { menu_item: "Dispatch Scheduler",   section: "Service",  scoped_role: "service_manager" },
  "service.ops.technicians":  { menu_item: "Technicians",          section: "Service",  scoped_role: "service_manager" },
  "service.ops.parts":        { menu_item: "Parts",                section: "Service",  scoped_role: "service_manager" },
  "service.ops.units":        { menu_item: "Unit Lookup",          section: "Service",  scoped_role: "service_manager" },
  "service.ops.messages":     { menu_item: "Messages",             section: "Service",  scoped_role: "service_manager" },
  "service.account.settings": { menu_item: "Settings",             section: "Account",  scoped_role: "service_manager" },
  // ── Shop Manager ──
  "shop.ops.dashboard":   { menu_item: "Dashboard",          section: "Shop",    scoped_role: "shop_manager" },
  "shop.ops.work_orders": { menu_item: "Work Orders",        section: "Shop",    scoped_role: "shop_manager" },
  "shop.ops.scheduler":   { menu_item: "Dispatch Scheduler", section: "Shop",    scoped_role: "shop_manager" },
  "shop.ops.parts":       { menu_item: "Parts",              section: "Shop",    scoped_role: "shop_manager" },
  "shop.account.settings": { menu_item: "Settings",          section: "Account", scoped_role: "shop_manager" },
  // ── Parts Department ──
  "parts.ops.dashboard":    { menu_item: "Dashboard", section: "Parts Department", scoped_role: "parts_dept" },
  "parts.account.settings": { menu_item: "Settings",  section: "Account",          scoped_role: "parts_dept" },
};

const ROLES: Record<string, any> = {
  "dealer_owner":    { "label": "Dealer Owner",     "blocked_pages": [] },
  "dealer_staff":    { "label": "Dealer Staff",     "blocked_pages": ["dealer.account.my_subscription", "dealer.account.portal_settings", "dealer.marketplace.escrow_payments"] },
  "service_manager": { "label": "Service Manager",  "blocked_pages": [], "allowed_pages_only": ["service.ops.dashboard", "service.ops.work_orders", "service.ops.scheduler", "service.ops.technicians", "service.ops.parts", "service.ops.units", "service.ops.messages", "service.account.settings"] },
  "shop_manager":    { "label": "Shop Manager",     "blocked_pages": [], "allowed_pages_only": ["shop.ops.dashboard", "shop.ops.work_orders", "shop.ops.scheduler", "shop.ops.parts", "shop.account.settings"] },
  "parts_dept":      { "label": "Parts Department", "blocked_pages": [], "allowed_pages_only": ["parts.ops.dashboard", "parts.account.settings"] },
  "technician":      { "label": "Technician",       "blocked_pages": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.ops.claims", "dealer.ops.techflow"] },
  "public_bidder":   { "label": "Public Bidder",    "blocked_pages": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.marketplace.browse", "dealer.marketplace.public_showcase", "dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"] },
  "consignor":       { "label": "Consignor",        "blocked_pages": [], "allowed_pages_only": ["dealer.ops.dashboard", "dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"] },
};

const URL_MAP: Record<string, string> = {
  "dealer.ops.inventory": "/dealer-v6/units",
};

interface Props {
  currentPage?: string;
  onShowPage?: (id: string) => void;
}

export default function DealerMainNav({ currentPage, onShowPage }: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();

  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: localStorage.getItem("ds360-dev-role") || (clerkUser.publicMetadata as any)?.role,
  } : null;

  const userRole: string = localStorage.getItem("ds360-dev-role") || user?.role || "dealer_owner";
  const userInitials = (user?.name || "Dealer").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Dealer";
  const roleLabel = ROLES[userRole]?.label || "Dealer";

  const logout = async () => { await signOut(); window.location.href = "/login"; };

  function canSeePage(pageId: string): boolean {
    const roleDef = ROLES[userRole];
    const allowedOnly = roleDef?.allowed_pages_only;
    if (allowedOnly && !allowedOnly.includes(pageId)) return false;
    const blocked = roleDef?.blocked_pages || [];
    if (blocked.includes(pageId)) return false;
    const meta = PAGE_META[pageId];
    if (meta?.scoped_role && meta.scoped_role !== userRole) return false;
    return true;
  }

  function anyVisible(pageIds: string[]): boolean {
    return pageIds.some(id => canSeePage(id));
  }

  const isNavActive = (id: string) => currentPage === id;

  const go = (pageId: string) => {
    if (onShowPage) {
      onShowPage(pageId);
    } else {
      navigate(URL_MAP[pageId] || "/dealer-v6");
    }
  };

  if (!isLoaded) return null;

  return (
    <>
      <div className="sidebar-logo">
        <img src={ds360Icon} width={36} height={36} style={{borderRadius: 8}} alt="DS360" />
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-sub" style={{fontSize: 12, fontWeight: 600}}>
            {userRole === "service_manager" ? "Service Portal"
              : userRole === "shop_manager"  ? "Shop Portal"
              : userRole === "parts_dept"    ? "Parts Department"
              : "Dealership Portal"}
          </div>
        </div>
        <span className="sidebar-badge">
          {userRole === "service_manager" ? "Svc Mgr"
            : userRole === "shop_manager"  ? "Shop"
            : userRole === "parts_dept"    ? "Parts"
            : "Dealer"}
        </span>
      </div>
      <div className="sidebar-nav">
        {anyVisible(["dealer.ops.dashboard"]) && <div className="nav-section">
          <div className="nav-label">Overview</div>
          {canSeePage("dealer.ops.dashboard") && <div className={`nav-item ${isNavActive("dealer.ops.dashboard") ? "active" : ""}`} onClick={() => go("dealer.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
        </div>}
        {anyVisible(["dealer.ops.claims", "dealer.ops.inventory", "dealer.ops.clients", "dealer.ops.sales_services", "dealer.ops.documents", "dealer.ops.messages", "dealer.ops.financing", "dealer.ops.parts_store", "dealer.ops.consignment", "dealer.ops.techflow", "dealer.ops.marketing"]) && <div className="nav-section">
          <div className="nav-label">Operations</div>
          {canSeePage("dealer.ops.claims") && <div className={`nav-item ${isNavActive("dealer.ops.claims") ? "active" : ""}`} onClick={() => go("dealer.ops.claims")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Claims</div>}
          {canSeePage("dealer.ops.inventory") && <div className={`nav-item ${isNavActive("dealer.ops.inventory") ? "active" : ""}`} onClick={() => go("dealer.ops.inventory")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Units / Inventory</div>}
          {canSeePage("dealer.ops.clients") && <div className={`nav-item ${isNavActive("dealer.ops.clients") ? "active" : ""}`} onClick={() => go("dealer.ops.clients")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Clients</div>}
          {canSeePage("dealer.ops.sales_services") && <div className={`nav-item ${isNavActive("dealer.ops.sales_services") ? "active" : ""}`} onClick={() => go("dealer.ops.sales_services")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>Sales &amp; Services</div>}
          {canSeePage("dealer.ops.documents") && <div className={`nav-item ${isNavActive("dealer.ops.documents") ? "active" : ""}`} onClick={() => go("dealer.ops.documents")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Documents</div>}
          {canSeePage("dealer.ops.messages") && <div className={`nav-item ${isNavActive("dealer.ops.messages") ? "active" : ""}`} onClick={() => go("dealer.ops.messages")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Messages</div>}
          {canSeePage("dealer.ops.financing") && <div className={`nav-item ${isNavActive("dealer.ops.financing") ? "active" : ""}`} onClick={() => go("dealer.ops.financing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing</div>}
          {canSeePage("dealer.ops.parts_store") && <div className={`nav-item ${isNavActive("dealer.ops.parts_store") ? "active" : ""}`} onClick={() => go("dealer.ops.parts_store")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Store</div>}
          {canSeePage("dealer.ops.consignment") && <div className={`nav-item ${isNavActive("dealer.ops.consignment") ? "active" : ""}`} onClick={() => go("dealer.ops.consignment")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Consignment</div>}
          {canSeePage("dealer.ops.techflow") && <div className={`nav-item ${isNavActive("dealer.ops.techflow") ? "active" : ""}`} onClick={() => go("dealer.ops.techflow")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>TechFlow</div>}
          {canSeePage("dealer.ops.marketing") && <div className={`nav-item ${isNavActive("dealer.ops.marketing") ? "active" : ""}`} onClick={() => go("dealer.ops.marketing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>Marketing</div>}
        </div>}
        {anyVisible(["dealer.marketplace.browse", "dealer.marketplace.my_bids", "dealer.marketplace.my_listings", "dealer.marketplace.public_showcase", "dealer.marketplace.escrow_payments"]) && <div className="nav-section">
          <div className="nav-label">Marketplace</div>
          {canSeePage("dealer.marketplace.browse") && <div className={`nav-item ${isNavActive("dealer.marketplace.browse") ? "active" : ""}`} onClick={() => go("dealer.marketplace.browse")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Browse Listings</div>}
          {canSeePage("dealer.marketplace.my_bids") && <div className={`nav-item ${isNavActive("dealer.marketplace.my_bids") ? "active" : ""}`} onClick={() => go("dealer.marketplace.my_bids")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>My Bids</div>}
          {canSeePage("dealer.marketplace.my_listings") && <div className={`nav-item ${isNavActive("dealer.marketplace.my_listings") ? "active" : ""}`} onClick={() => go("dealer.marketplace.my_listings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>My Listings (Sell)</div>}
          {canSeePage("dealer.marketplace.public_showcase") && <div className={`nav-item ${isNavActive("dealer.marketplace.public_showcase") ? "active" : ""}`} onClick={() => go("dealer.marketplace.public_showcase")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Public Showcase</div>}
          {canSeePage("dealer.marketplace.escrow_payments") && <div className={`nav-item ${isNavActive("dealer.marketplace.escrow_payments") ? "active" : ""}`} onClick={() => go("dealer.marketplace.escrow_payments")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Escrow &amp; My Payments</div>}
        </div>}
        {anyVisible(["dealer.consignor_guest.my_units", "dealer.consignor_guest.offers_bids", "dealer.consignor_guest.payouts"]) && <div className="nav-section">
          <div className="nav-label">Consignor Guest</div>
          {canSeePage("dealer.consignor_guest.my_units") && (!PAGE_META["dealer.consignor_guest.my_units"].scoped_role || PAGE_META["dealer.consignor_guest.my_units"].scoped_role === userRole) && <div className={`nav-item ${isNavActive("dealer.consignor_guest.my_units") ? "active" : ""}`} onClick={() => go("dealer.consignor_guest.my_units")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Consigned Unit(s)</div>}
          {canSeePage("dealer.consignor_guest.offers_bids") && (!PAGE_META["dealer.consignor_guest.offers_bids"].scoped_role || PAGE_META["dealer.consignor_guest.offers_bids"].scoped_role === userRole) && <div className={`nav-item ${isNavActive("dealer.consignor_guest.offers_bids") ? "active" : ""}`} onClick={() => go("dealer.consignor_guest.offers_bids")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Offers &amp; Bids on My Unit</div>}
          {canSeePage("dealer.consignor_guest.payouts") && (!PAGE_META["dealer.consignor_guest.payouts"].scoped_role || PAGE_META["dealer.consignor_guest.payouts"].scoped_role === userRole) && <div className={`nav-item ${isNavActive("dealer.consignor_guest.payouts") ? "active" : ""}`} onClick={() => go("dealer.consignor_guest.payouts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>My Payouts</div>}
        </div>}
        {anyVisible(["dealer.public_bidder_guest.my_bids", "dealer.public_bidder_guest.verification"]) && <div className="nav-section">
          <div className="nav-label">Public Bidder Guest</div>
          {canSeePage("dealer.public_bidder_guest.my_bids") && (!PAGE_META["dealer.public_bidder_guest.my_bids"].scoped_role || PAGE_META["dealer.public_bidder_guest.my_bids"].scoped_role === userRole) && <div className={`nav-item ${isNavActive("dealer.public_bidder_guest.my_bids") ? "active" : ""}`} onClick={() => go("dealer.public_bidder_guest.my_bids")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>My Bids (Public Bidder)</div>}
          {canSeePage("dealer.public_bidder_guest.verification") && (!PAGE_META["dealer.public_bidder_guest.verification"].scoped_role || PAGE_META["dealer.public_bidder_guest.verification"].scoped_role === userRole) && <div className={`nav-item ${isNavActive("dealer.public_bidder_guest.verification") ? "active" : ""}`} onClick={() => go("dealer.public_bidder_guest.verification")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Verification &amp; Payment</div>}
        </div>}
        {/* ── Service Manager nav ── */}
        {anyVisible(["service.ops.dashboard","service.ops.work_orders","service.ops.scheduler","service.ops.technicians","service.ops.parts","service.ops.units","service.ops.messages"]) && <div className="nav-section">
          <div className="nav-label">Service</div>
          {canSeePage("service.ops.dashboard")   && <div className={`nav-item ${isNavActive("service.ops.dashboard")   ? "active" : ""}`} onClick={() => go("service.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
          {canSeePage("service.ops.work_orders") && <div className={`nav-item ${isNavActive("service.ops.work_orders") ? "active" : ""}`} onClick={() => go("service.ops.work_orders")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>Work Orders</div>}
          {canSeePage("service.ops.scheduler")   && <div className={`nav-item ${isNavActive("service.ops.scheduler")   ? "active" : ""}`} onClick={() => go("service.ops.scheduler")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Dispatch Scheduler</div>}
          {canSeePage("service.ops.technicians") && <div className={`nav-item ${isNavActive("service.ops.technicians") ? "active" : ""}`} onClick={() => go("service.ops.technicians")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Technicians</div>}
          {canSeePage("service.ops.parts")       && <div className={`nav-item ${isNavActive("service.ops.parts")       ? "active" : ""}`} onClick={() => go("service.ops.parts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts</div>}
          {canSeePage("service.ops.units")       && <div className={`nav-item ${isNavActive("service.ops.units")       ? "active" : ""}`} onClick={() => go("service.ops.units")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Unit Lookup</div>}
          {canSeePage("service.ops.messages")    && <div className={`nav-item ${isNavActive("service.ops.messages")    ? "active" : ""}`} onClick={() => go("service.ops.messages")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Messages</div>}
        </div>}

        {/* ── Shop Manager nav ── */}
        {anyVisible(["shop.ops.dashboard","shop.ops.work_orders","shop.ops.scheduler","shop.ops.parts"]) && <div className="nav-section">
          <div className="nav-label">Shop</div>
          {canSeePage("shop.ops.dashboard")   && <div className={`nav-item ${isNavActive("shop.ops.dashboard")   ? "active" : ""}`} onClick={() => go("shop.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
          {canSeePage("shop.ops.work_orders") && <div className={`nav-item ${isNavActive("shop.ops.work_orders") ? "active" : ""}`} onClick={() => go("shop.ops.work_orders")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>Work Orders</div>}
          {canSeePage("shop.ops.scheduler")   && <div className={`nav-item ${isNavActive("shop.ops.scheduler")   ? "active" : ""}`} onClick={() => go("shop.ops.scheduler")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Dispatch Scheduler</div>}
          {canSeePage("shop.ops.parts")       && <div className={`nav-item ${isNavActive("shop.ops.parts")       ? "active" : ""}`} onClick={() => go("shop.ops.parts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts</div>}
        </div>}

        {/* ── Parts Department nav ── */}
        {anyVisible(["parts.ops.dashboard"]) && <div className="nav-section">
          <div className="nav-label">Parts Department</div>
          {canSeePage("parts.ops.dashboard") && <div className={`nav-item ${isNavActive("parts.ops.dashboard") ? "active" : ""}`} onClick={() => go("parts.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
        </div>}

        {anyVisible(["dealer.account.my_subscription", "dealer.account.portal_settings"]) && <div className="nav-section">
          <div className="nav-label">Account</div>
          {canSeePage("dealer.account.my_subscription") && <div className={`nav-item ${isNavActive("dealer.account.my_subscription") ? "active" : ""}`} onClick={() => go("dealer.account.my_subscription")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Subscription</div>}
          {canSeePage("dealer.account.portal_settings") && <div className={`nav-item ${isNavActive("dealer.account.portal_settings") ? "active" : ""}`} onClick={() => go("dealer.account.portal_settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Portal Settings</div>}
        </div>}
        {/* Settings for new roles */}
        {anyVisible(["service.account.settings","shop.account.settings","parts.account.settings"]) && <div className="nav-section">
          <div className="nav-label">Account</div>
          {canSeePage("service.account.settings") && <div className={`nav-item ${isNavActive("service.account.settings") ? "active" : ""}`} onClick={() => go("service.account.settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</div>}
          {canSeePage("shop.account.settings")    && <div className={`nav-item ${isNavActive("shop.account.settings")    ? "active" : ""}`} onClick={() => go("shop.account.settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</div>}
          {canSeePage("parts.account.settings")   && <div className={`nav-item ${isNavActive("parts.account.settings")   ? "active" : ""}`} onClick={() => go("parts.account.settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</div>}
        </div>}
      </div>
      <div className="sidebar-footer">
        <div className="user-info" onClick={() => go("dealer.ops.dashboard")} style={{cursor: "pointer"}}>
          <div className="user-avatar">{userInitials}</div>
          <div>
            <div className="user-name">{userDisplayName}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); }}
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
    </>
  );
}
