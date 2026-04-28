import ds360Icon from "@assets/ds360_favicon.png";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";

const PAGE_META: Record<string, { menu_item: string; section: string; scoped_role: string }> = {"bidder.main.dashboard": {"menu_item": "Dashboard", "section": "Main", "scoped_role": ""}, "bidder.main.live_auctions": {"menu_item": "Live Monthly Auctions", "section": "Main", "scoped_role": ""}, "bidder.main.browse": {"menu_item": "Browse Units", "section": "Main", "scoped_role": ""}, "bidder.main.my_bids": {"menu_item": "My Bids", "section": "Main", "scoped_role": ""}, "bidder.main.escrow": {"menu_item": "Escrow & Payments", "section": "Main", "scoped_role": ""}, "bidder.account.profile": {"menu_item": "Profile", "section": "Account", "scoped_role": ""}, "bidder.account.verification": {"menu_item": "Verification", "section": "Account", "scoped_role": ""}, "bidder.account.payment_methods": {"menu_item": "Payment Methods", "section": "Account", "scoped_role": ""}, "bidder.account.settings": {"menu_item": "Settings", "section": "Account", "scoped_role": ""}};

const ROLES: Record<string, any> = {
  "independent_bidder": {"label": "Independent Bidder", "blocked_pages": []},
};

interface Props {
  currentPage?: string;
  onShowPage?: (id: string) => void;
}

export default function BidderMainNav({ currentPage, onShowPage }: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();

  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: localStorage.getItem("ds360-dev-role") || (clerkUser.publicMetadata as any)?.role,
  } : null;

  const userRole: string = user?.role || "independent_bidder";
  const userInitials = (user?.name || "Bidder").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const userDisplayName = user?.name || "Bidder";
  const roleLabel = ROLES[userRole]?.label || "Bidder";

  const logout = async () => { await signOut(); window.location.href = "/login"; };

  function canSeePage(pageId: string): boolean {
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
      navigate("/bidder-v6");
    }
  };

  if (!isLoaded) return null;

  return (
    <>
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
          {canSeePage("bidder.main.live_auctions") && <div className={`nav-item ${isNavActive("bidder.main.live_auctions") ? "active" : ""}`} onClick={() => go("bidder.main.live_auctions")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Live Monthly Auctions</div>}
          {canSeePage("bidder.main.browse") && <div className={`nav-item ${isNavActive("bidder.main.browse") ? "active" : ""}`} onClick={() => go("bidder.main.browse")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Browse Units</div>}
          {canSeePage("bidder.main.my_bids") && <div className={`nav-item ${isNavActive("bidder.main.my_bids") ? "active" : ""}`} onClick={() => go("bidder.main.my_bids")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>My Bids</div>}
          {canSeePage("bidder.main.escrow") && <div className={`nav-item ${isNavActive("bidder.main.escrow") ? "active" : ""}`} onClick={() => go("bidder.main.escrow")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Escrow &amp; Payments</div>}
        </div>}
        {anyVisible(["bidder.account.profile", "bidder.account.verification", "bidder.account.payment_methods", "bidder.account.settings"]) && <div className="nav-section">
          <div className="nav-label">Account</div>
          {canSeePage("bidder.account.profile") && <div className={`nav-item ${isNavActive("bidder.account.profile") ? "active" : ""}`} onClick={() => go("bidder.account.profile")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Profile</div>}
          {canSeePage("bidder.account.verification") && <div className={`nav-item ${isNavActive("bidder.account.verification") ? "active" : ""}`} onClick={() => go("bidder.account.verification")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Verification</div>}
          {canSeePage("bidder.account.payment_methods") && <div className={`nav-item ${isNavActive("bidder.account.payment_methods") ? "active" : ""}`} onClick={() => go("bidder.account.payment_methods")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Payment Methods</div>}
          {canSeePage("bidder.account.settings") && <div className={`nav-item ${isNavActive("bidder.account.settings") ? "active" : ""}`} onClick={() => go("bidder.account.settings")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Settings</div>}
        </div>}
        {anyVisible(["bidder.main.dashboard"]) && <div className="nav-section">
          <div className="nav-label">Overview</div>
          {canSeePage("bidder.main.dashboard") && <div className={`nav-item ${isNavActive("bidder.main.dashboard") ? "active" : ""}`} onClick={() => go("bidder.main.dashboard")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>}
        </div>}
      </div>
      <div className="sidebar-footer">
        <div className="user-info" onClick={() => go("bidder.main.dashboard")} style={{cursor: "pointer"}}>
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
