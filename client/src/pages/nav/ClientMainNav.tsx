import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"client.main.dashboard": {"menu_item": "Dashboard", "section": "Main", "scoped_role": ""}, "client.main.vehicle": {"menu_item": "My Vehicle", "section": "Main", "scoped_role": ""}, "client.main.warranties": {"menu_item": "My Warranties", "section": "Main", "scoped_role": ""}, "client.main.services": {"menu_item": "My Services", "section": "Main", "scoped_role": ""}, "client.main.claims": {"menu_item": "Claims", "section": "Main", "scoped_role": ""}, "client.main.documents": {"menu_item": "Documents", "section": "Main", "scoped_role": ""}, "client.main.fi_offers": {"menu_item": "F&I Offers", "section": "Main", "scoped_role": ""}, "client.main.messages": {"menu_item": "Messages", "section": "Main", "scoped_role": ""}, "client.main.account": {"menu_item": "Account", "section": "Main", "scoped_role": ""}, "client.main.financing": {"menu_item": "My Financing", "section": "Main", "scoped_role": ""}, "client.main.parts_store": {"menu_item": "Parts Store", "section": "Main", "scoped_role": ""}, "client.main.service_appointments": {"menu_item": "Service Appointments", "section": "Main", "scoped_role": ""}};

const ROLES: Record<string, any> = {
  "client": {"label": "Client", "blocked_pages": []},
};

const URL_MAP: Record<string, string> = {
  "client.main.vehicle": "/client-v6/units",
};

interface Props {
  currentPage?: string;
  onShowPage?: (id: string) => void;
}

export default function ClientMainNav({ currentPage, onShowPage }: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();

  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: ((clerkUser.unsafeMetadata as any)?.devRoleOverride as string) || (clerkUser.publicMetadata as any)?.role,
  } : null;

  const userRole: string = user?.role || "client";
  const userInitials = (user?.name || "Client").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Client";
  const roleLabel = ROLES[userRole]?.label || "Client";

  const logout = async () => { await signOut(); window.location.href = "/login"; };

  function canSeePage(pageId: string): boolean {
    const roleDef = ROLES[userRole];
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
      navigate(URL_MAP[pageId] || "/client-v6");
    }
  };

  if (!isLoaded) return null;

  return (
    <>
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
          {canSeePage("client.main.dashboard") && <div className={`nav-item ${isNavActive("client.main.dashboard") ? "active" : ""}`} onClick={() => go("client.main.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
        </div>}
        {anyVisible(["client.main.vehicle", "client.main.warranties", "client.main.services", "client.main.claims", "client.main.documents", "client.main.fi_offers", "client.main.messages", "client.main.account", "client.main.financing", "client.main.parts_store", "client.main.service_appointments"]) && <div className="nav-section">
          <div className="nav-label">Main</div>
          {canSeePage("client.main.vehicle") && <div className={`nav-item ${isNavActive("client.main.vehicle") ? "active" : ""}`} onClick={() => go("client.main.vehicle")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Vehicle</div>}
          {canSeePage("client.main.warranties") && <div className={`nav-item ${isNavActive("client.main.warranties") ? "active" : ""}`} onClick={() => go("client.main.warranties")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Warranties</div>}
          {canSeePage("client.main.services") && <div className={`nav-item ${isNavActive("client.main.services") ? "active" : ""}`} onClick={() => go("client.main.services")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Services</div>}
          {canSeePage("client.main.claims") && <div className={`nav-item ${isNavActive("client.main.claims") ? "active" : ""}`} onClick={() => go("client.main.claims")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Claims</div>}
          {canSeePage("client.main.documents") && <div className={`nav-item ${isNavActive("client.main.documents") ? "active" : ""}`} onClick={() => go("client.main.documents")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Documents</div>}
          {canSeePage("client.main.fi_offers") && <div className={`nav-item ${isNavActive("client.main.fi_offers") ? "active" : ""}`} onClick={() => go("client.main.fi_offers")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>F&amp;I Offers</div>}
          {canSeePage("client.main.messages") && <div className={`nav-item ${isNavActive("client.main.messages") ? "active" : ""}`} onClick={() => go("client.main.messages")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Messages</div>}
          {canSeePage("client.main.account") && <div className={`nav-item ${isNavActive("client.main.account") ? "active" : ""}`} onClick={() => go("client.main.account")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Account</div>}
          {canSeePage("client.main.financing") && <div className={`nav-item ${isNavActive("client.main.financing") ? "active" : ""}`} onClick={() => go("client.main.financing")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>My Financing</div>}
          {canSeePage("client.main.parts_store") && <div className={`nav-item ${isNavActive("client.main.parts_store") ? "active" : ""}`} onClick={() => go("client.main.parts_store")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Parts Store</div>}
          {canSeePage("client.main.service_appointments") && <div className={`nav-item ${isNavActive("client.main.service_appointments") ? "active" : ""}`} onClick={() => go("client.main.service_appointments")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Service Appointments</div>}
        </div>}
      </div>
      <div className="sidebar-footer">
        <div className="user-info" onClick={() => go("client.main.dashboard")} style={{cursor: "pointer"}}>
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
