import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"master.mgmt.dashboard": {"menu_item": "Dashboard", "section": "Management", "scoped_role": ""}, "master.mgmt.dealer_accounts": {"menu_item": "Dealer Accounts", "section": "Management", "scoped_role": ""}, "master.mgmt.catalog": {"menu_item": "Product & Service Catalog", "section": "Management", "scoped_role": ""}, "master.mgmt.revenue_billing": {"menu_item": "Revenue & Billing", "section": "Management", "scoped_role": ""}, "master.mgmt.communications": {"menu_item": "Communications", "section": "Management", "scoped_role": ""}, "master.mgmt.staff_permissions": {"menu_item": "Staff & Permissions", "section": "Management", "scoped_role": ""}, "master.mgmt.platform_settings": {"menu_item": "Platform Settings", "section": "Management", "scoped_role": ""}, "master.mgmt.blog": {"menu_item": "Blog Management", "section": "Management", "scoped_role": ""}, "master.ops.dashboard": {"menu_item": "Operations Dashboard", "section": "Operations", "scoped_role": ""}, "master.ops.claim_queue": {"menu_item": "Claim Queue", "section": "Operations", "scoped_role": ""}, "master.ops.work_by_dealer": {"menu_item": "Work by Dealer", "section": "Operations", "scoped_role": ""}, "master.ops.parts_management": {"menu_item": "Parts Management", "section": "Operations", "scoped_role": ""}, "master.ops.manufacturer_portals": {"menu_item": "Manufacturer Portals", "section": "Operations", "scoped_role": ""}, "master.ops.reporting": {"menu_item": "Reporting", "section": "Operations", "scoped_role": ""}, "master.mgmt.financing_partners": {"menu_item": "Financing Partners", "section": "Management", "scoped_role": ""}, "master.mgmt.parts_catalog": {"menu_item": "Parts Catalog", "section": "Management", "scoped_role": ""}, "master.mgmt.campaign_templates": {"menu_item": "Campaign Templates", "section": "Management", "scoped_role": ""}, "master.mgmt.consignment_oversight": {"menu_item": "Consignment Oversight", "section": "Management", "scoped_role": ""}, "master.ops.financing_applications": {"menu_item": "Financing Applications", "section": "Operations", "scoped_role": ""}, "master.ops.techflow_oversight": {"menu_item": "TechFlow Oversight", "section": "Operations", "scoped_role": ""}, "master.ops.parts_orders": {"menu_item": "Parts Orders", "section": "Operations", "scoped_role": ""}, "master.marketplace.listings_oversight": {"menu_item": "Listings Oversight", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.active_auctions": {"menu_item": "Active Auctions", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.transactions": {"menu_item": "Transactions", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.escrow_admin": {"menu_item": "Escrow Admin", "section": "Marketplace", "scoped_role": ""}, "master.marketplace.members": {"menu_item": "Members", "section": "Marketplace", "scoped_role": ""}};

const ROLES: Record<string, any> = {"operator_admin": {"label": "Operator Admin", "blocked_pages": []}, "operator_staff": {"label": "Operator Staff", "blocked_pages": ["master.mgmt.revenue_billing", "master.mgmt.campaign_templates", "master.mgmt.communications", "master.mgmt.blog", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"]}};

const URL_MAP: Record<string, string> = {};

interface Props {
  currentPage?: string;
  onShowPage?: (id: string) => void;
}

export default function OperatorMainNav({ currentPage, onShowPage }: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();

  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: localStorage.getItem("ds360-dev-role") || (clerkUser.publicMetadata as any)?.role,
  } : null;

  const userRole: string = localStorage.getItem("ds360-dev-role") || user?.role || "operator_admin";
  const userInitials = (user?.name || "Operator").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Operator";
  const roleLabel = ROLES[userRole]?.label || "Operator";

  const logout = async () => { await signOut(); window.location.href = "/login"; };

  function canSeePage(pageId: string): boolean {
    const blocked = ROLES[userRole]?.blocked_pages || [];
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
      navigate(URL_MAP[pageId] || "/operator-v6");
    }
  };

  if (!isLoaded) return null;

  return (
    <>
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
          {canSeePage("master.mgmt.dashboard") && <div className={`nav-item ${isNavActive("master.mgmt.dashboard") ? "active" : ""}`} onClick={() => go("master.mgmt.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
        </div>}
        {anyVisible(["master.mgmt.dealer_accounts", "master.mgmt.catalog", "master.mgmt.revenue_billing", "master.mgmt.communications", "master.mgmt.staff_permissions", "master.mgmt.platform_settings", "master.mgmt.blog", "master.mgmt.financing_partners", "master.mgmt.parts_catalog", "master.mgmt.campaign_templates", "master.mgmt.consignment_oversight"]) && <div className="nav-section">
          <div className="nav-label">Management</div>
          {canSeePage("master.mgmt.dealer_accounts") && <div className={`nav-item ${isNavActive("master.mgmt.dealer_accounts") ? "active" : ""}`} onClick={() => go("master.mgmt.dealer_accounts")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Dealer Accounts</div>}
          {canSeePage("master.mgmt.catalog") && <div className={`nav-item ${isNavActive("master.mgmt.catalog") ? "active" : ""}`} onClick={() => go("master.mgmt.catalog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Product &amp; Service Catalog</div>}
          {canSeePage("master.mgmt.revenue_billing") && <div className={`nav-item ${isNavActive("master.mgmt.revenue_billing") ? "active" : ""}`} onClick={() => go("master.mgmt.revenue_billing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Revenue &amp; Billing</div>}
          {canSeePage("master.mgmt.communications") && <div className={`nav-item ${isNavActive("master.mgmt.communications") ? "active" : ""}`} onClick={() => go("master.mgmt.communications")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>Communications</div>}
          {canSeePage("master.mgmt.staff_permissions") && <div className={`nav-item ${isNavActive("master.mgmt.staff_permissions") ? "active" : ""}`} onClick={() => go("master.mgmt.staff_permissions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>Staff &amp; Permissions</div>}
          {canSeePage("master.mgmt.platform_settings") && <div className={`nav-item ${isNavActive("master.mgmt.platform_settings") ? "active" : ""}`} onClick={() => go("master.mgmt.platform_settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Platform Settings</div>}
          {canSeePage("master.mgmt.blog") && <div className={`nav-item ${isNavActive("master.mgmt.blog") ? "active" : ""}`} onClick={() => go("master.mgmt.blog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Blog Management</div>}
          {canSeePage("master.mgmt.financing_partners") && <div className={`nav-item ${isNavActive("master.mgmt.financing_partners") ? "active" : ""}`} onClick={() => go("master.mgmt.financing_partners")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing Partners</div>}
          {canSeePage("master.mgmt.parts_catalog") && <div className={`nav-item ${isNavActive("master.mgmt.parts_catalog") ? "active" : ""}`} onClick={() => go("master.mgmt.parts_catalog")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Parts Catalog</div>}
          {canSeePage("master.mgmt.campaign_templates") && <div className={`nav-item ${isNavActive("master.mgmt.campaign_templates") ? "active" : ""}`} onClick={() => go("master.mgmt.campaign_templates")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>Campaign Templates</div>}
          {canSeePage("master.mgmt.consignment_oversight") && <div className={`nav-item ${isNavActive("master.mgmt.consignment_oversight") ? "active" : ""}`} onClick={() => go("master.mgmt.consignment_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Consignment Oversight</div>}
        </div>}
        {anyVisible(["master.ops.dashboard", "master.ops.claim_queue", "master.ops.work_by_dealer", "master.ops.parts_management", "master.ops.manufacturer_portals", "master.ops.reporting", "master.ops.financing_applications", "master.ops.techflow_oversight", "master.ops.parts_orders"]) && <div className="nav-section">
          <div className="nav-label">Operations</div>
          {canSeePage("master.ops.dashboard") && <div className={`nav-item ${isNavActive("master.ops.dashboard") ? "active" : ""}`} onClick={() => go("master.ops.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Operations Dashboard</div>}
          {canSeePage("master.ops.claim_queue") && <div className={`nav-item ${isNavActive("master.ops.claim_queue") ? "active" : ""}`} onClick={() => go("master.ops.claim_queue")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Claim Queue</div>}
          {canSeePage("master.ops.work_by_dealer") && <div className={`nav-item ${isNavActive("master.ops.work_by_dealer") ? "active" : ""}`} onClick={() => go("master.ops.work_by_dealer")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Work by Dealer</div>}
          {canSeePage("master.ops.parts_management") && <div className={`nav-item ${isNavActive("master.ops.parts_management") ? "active" : ""}`} onClick={() => go("master.ops.parts_management")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Management</div>}
          {canSeePage("master.ops.manufacturer_portals") && <div className={`nav-item ${isNavActive("master.ops.manufacturer_portals") ? "active" : ""}`} onClick={() => go("master.ops.manufacturer_portals")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>Manufacturer Portals</div>}
          {canSeePage("master.ops.reporting") && <div className={`nav-item ${isNavActive("master.ops.reporting") ? "active" : ""}`} onClick={() => go("master.ops.reporting")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Reporting</div>}
          {canSeePage("master.ops.financing_applications") && <div className={`nav-item ${isNavActive("master.ops.financing_applications") ? "active" : ""}`} onClick={() => go("master.ops.financing_applications")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing Applications</div>}
          {canSeePage("master.ops.techflow_oversight") && <div className={`nav-item ${isNavActive("master.ops.techflow_oversight") ? "active" : ""}`} onClick={() => go("master.ops.techflow_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>TechFlow Oversight</div>}
          {canSeePage("master.ops.parts_orders") && <div className={`nav-item ${isNavActive("master.ops.parts_orders") ? "active" : ""}`} onClick={() => go("master.ops.parts_orders")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders</div>}
        </div>}
        {anyVisible(["master.marketplace.listings_oversight", "master.marketplace.active_auctions", "master.marketplace.transactions", "master.marketplace.escrow_admin", "master.marketplace.members"]) && <div className="nav-section">
          <div className="nav-label">Marketplace</div>
          {canSeePage("master.marketplace.listings_oversight") && <div className={`nav-item ${isNavActive("master.marketplace.listings_oversight") ? "active" : ""}`} onClick={() => go("master.marketplace.listings_oversight")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Listings Oversight</div>}
          {canSeePage("master.marketplace.active_auctions") && <div className={`nav-item ${isNavActive("master.marketplace.active_auctions") ? "active" : ""}`} onClick={() => go("master.marketplace.active_auctions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Active Auctions</div>}
          {canSeePage("master.marketplace.transactions") && <div className={`nav-item ${isNavActive("master.marketplace.transactions") ? "active" : ""}`} onClick={() => go("master.marketplace.transactions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Transactions</div>}
          {canSeePage("master.marketplace.escrow_admin") && <div className={`nav-item ${isNavActive("master.marketplace.escrow_admin") ? "active" : ""}`} onClick={() => go("master.marketplace.escrow_admin")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Escrow Admin</div>}
          {canSeePage("master.marketplace.members") && <div className={`nav-item ${isNavActive("master.marketplace.members") ? "active" : ""}`} onClick={() => go("master.marketplace.members")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Members</div>}
        </div>}
      </div>
      <div className="sidebar-footer">
        <div className="user-info" onClick={() => go("master.mgmt.dashboard")} style={{cursor: "pointer"}}>
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
