import { useEffect, useState, useRef } from "react";
import { useApiFetch } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  isRead: boolean;
  createdAt: string;
  surface?: string;
}

export default function NotificationBell() {
  const apiFetch = useApiFetch();
  const { getToken } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  async function refresh() {
    try {
      const list = await apiFetch<Notification[]>("/api/v6/notifications");
      setNotifs(list);
      const { count } = await apiFetch<{ count: number }>("/api/v6/notifications/unread-count");
      setUnreadCount(count);
    } catch (err) {
      console.error("[NotificationBell] refresh failed", err);
    }
  }

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws?token=${token}`);
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "notification") refresh();
        } catch {}
      };
      ws.onerror = () => {};
    })();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, []);

  async function markAllRead() {
    await apiFetch("/api/v6/notifications/mark-all-read", { method: "POST" });
    await refresh();
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "transparent", border: 0, cursor: "pointer", padding: 8, position: "relative" }}
        aria-label="Notifications"
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: "#c0392b", color: "white",
            borderRadius: 10, fontSize: 10, fontWeight: 600,
            padding: "1px 6px", minWidth: 18, textAlign: "center",
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 38, right: 0,
          width: 360, maxHeight: 480, overflowY: "auto",
          background: "white", border: "1px solid #e5eaf2", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1000,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #eee" }}>
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: 0, color: "#033280", fontSize: 11, cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 12 }}>No notifications</div>
          ) : notifs.map(n => (
            <div
              key={n.id}
              onClick={() => { if (n.ctaRoute) window.location.href = n.ctaRoute; }}
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #f3f3f3",
                cursor: n.ctaRoute ? "pointer" : "default",
                background: n.isRead ? "white" : "#f0f5ff",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{n.body}</div>
              {n.ctaLabel && (
                <div style={{ fontSize: 11, color: "#033280", marginTop: 4, fontWeight: 500 }}>{n.ctaLabel} ›</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
