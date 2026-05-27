import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";

const ScreenShareGenerator = lazy(() => import("@/components/remote-support/ScreenShareGenerator"));
const DocumentTransfer = lazy(() => import("@/components/remote-support/DocumentTransfer"));

interface AppBarProps {
  context: "operator" | "dealer" | "client" | "bidder";
  contextLabel?: string;
}

const PORTAL_LABELS: Record<string, string> = {
  operator: "Operator Portal",
  dealer: "Dealer Portal",
  client: "Customer Portal",
  bidder: "Bidder Portal",
};

const PORTAL_HOME: Record<string, string> = {
  operator: "/operator/admin/dashboard",
  dealer: "/dev-dealer-001/owner/dashboard",
  client: "/dev-dealer-001/client/dashboard",
  bidder: "/marketplace/bidder/dashboard",
};

export default function AppBar({ context, contextLabel }: AppBarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();
  const apiFetch = useApiFetch();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(false);
  const [remoteView, setRemoteView] = useState<"menu" | "share" | "transfer">("menu");
  const [shareSessionId, setShareSessionId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [resolvedLabel, setResolvedLabel] = useState<string | undefined>(contextLabel);
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const isDealerContext = context === "dealer";

  // Resolve dealership name for dealer/client context
  useEffect(() => {
    if (contextLabel) { setResolvedLabel(contextLabel); return; }
    if (context === "dealer" || context === "client") {
      apiFetch<any>("/api/dealerships/branding/me")
        .then(d => { if (d?.name) setResolvedLabel(d.name); })
        .catch(() => {});
    }
  }, [context, contextLabel]);

  // Poll notifications every 30s
  useEffect(() => {
    function fetchNotifs() {
      apiFetch<any[]>("/api/notification-deliveries")
        .then(rows => {
          setNotifications(rows || []);
          setUnreadCount((rows || []).filter((n: any) => !n.isRead).length);
        })
        .catch(() => {});
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click-outside closes dropdowns
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (remoteRef.current && !remoteRef.current.contains(e.target as Node)) setRemoteOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markAllRead() {
    await apiFetch("/api/notification-deliveries/mark-all-read", { method: "POST" }).catch(() => {});
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    setUnreadCount(0);
  }

  const initials = user
    ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "U")
        .split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "User"
    : "User";

  const portalLabel = resolvedLabel || PORTAL_LABELS[context] || "Portal";

  return (
    <div className="no-print" style={{
      height: 60,
      background: "white",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 32,
      paddingRight: 32,
      flexShrink: 0,
    }}>
      {/* Left: portal label */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "#033280" }}>{portalLabel}</div>

      {/* Right: remote support + bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Remote Support (dealer only) */}
        {isDealerContext && (
          <div ref={remoteRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setRemoteOpen(o => !o); setRemoteView("menu"); setBellOpen(false); setMenuOpen(false); }}
              title="Remote Support"
              style={{
                width: 36, height: 36, borderRadius: 8, border: "1px solid #e5e7eb",
                background: remoteOpen ? "#eff6ff" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: remoteOpen ? "#033280" : "#555",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </button>
            {remoteOpen && (
              <div style={{
                position: "absolute", right: 0, top: 44, width: 320,
                background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 300, overflow: "hidden",
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Remote Support</span>
                </div>

                {remoteView === "menu" && !shareSessionId && (
                  <div>
                    <button
                      onClick={() => setRemoteView("share")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", background: "white", border: 0, borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Share My Screen</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Let support see your screen</div>
                        </div>
                      </div>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                    <button
                      onClick={() => setRemoteView("transfer")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", background: "white", border: 0, cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Transfer Documents</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Send files to DS360 support</div>
                        </div>
                      </div>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                )}

                {remoteView === "share" && (
                  <Suspense fallback={<div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6b7280" }}>Loading…</div>}>
                    <ScreenShareGenerator
                      onConnected={(sid) => { setShareSessionId(sid); setRemoteView("menu"); }}
                      onCancel={() => setRemoteView("menu")}
                    />
                  </Suspense>
                )}

                {remoteView === "transfer" && (
                  <Suspense fallback={<div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6b7280" }}>Loading…</div>}>
                    <DocumentTransfer dealerId={null} />
                  </Suspense>
                )}

                {shareSessionId && remoteView === "menu" && (
                  <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Session Active</span>
                      </div>
                      <button
                        onClick={async () => {
                          try { await fetch(`/api/remote/sessions/${shareSessionId}/end`, { method: "POST" }); } catch {}
                          setShareSessionId(null);
                        }}
                        style={{ fontSize: 11, color: "#b91c1c", background: "none", border: "1px solid #fca5a5", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}
                      >
                        End
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setBellOpen(o => !o); setMenuOpen(false); }}
            style={{
              width: 36, height: 36, borderRadius: 8, border: "1px solid #e5e7eb",
              background: "white", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", color: "#555",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 8, height: 8, borderRadius: "50%",
                background: "#ef4444", border: "2px solid white",
              }} />
            )}
          </button>
          {bellOpen && (
            <div style={{
              position: "absolute", right: 0, top: 44, width: 320,
              background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 300,
              maxHeight: "70vh", display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: "none", border: 0, fontSize: 11, color: "#033280", cursor: "pointer", fontWeight: 500 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#888", fontSize: 12 }}>No notifications</div>
                ) : notifications.map((n: any) => (
                  <div key={n.id} style={{
                    padding: "12px 16px", borderBottom: "1px solid #f5f5f5",
                    background: n.isRead ? "white" : "#eff6ff",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 600, color: "#222", lineHeight: 1.4 }}>{n.title || n.subject || "Notification"}</div>
                    {n.body && <div style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setMenuOpen(o => !o); setBellOpen(false); }}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#033280", border: 0, color: "white",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {initials}
          </button>
          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: 44, width: 220,
              background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 300, overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{displayName}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{PORTAL_LABELS[context]}</div>
              </div>
              <button onClick={() => { navigate("/portal-select-v6"); setMenuOpen(false); }} style={menuItemStyle}>
                Switch portal
              </button>
              <button
                onClick={async () => { await signOut(); window.location.href = "/login"; }}
                style={{ ...menuItemStyle, color: "#dc2626", borderTop: "1px solid #f0f0f0" }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 16px",
  background: "white", border: 0, textAlign: "left",
  fontSize: 12, cursor: "pointer", color: "#222",
};
