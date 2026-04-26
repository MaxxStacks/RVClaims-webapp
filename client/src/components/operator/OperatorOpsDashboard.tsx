import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_GROUPS: Array<{ label: string; statuses: string[]; bg: string; color: string }> = [
  { label: "New / Submitted", statuses: ["submitted"],                                      bg: "#dbeafe", color: "#1d4ed8" },
  { label: "In Review",       statuses: ["in_review", "info_requested"],                    bg: "#fef3c7", color: "#92400e" },
  { label: "Pre-Authorized",  statuses: ["pre_authorized"],                                  bg: "#e0e7ff", color: "#3730a3" },
  { label: "Approved",        statuses: ["approved", "parts_ordered", "parts_received"],    bg: "#dcfce7", color: "#166534" },
  { label: "Denied",          statuses: ["denied"],                                          bg: "#fee2e2", color: "#991b1b" },
  { label: "Completed",       statuses: ["completed", "invoiced", "paid"],                  bg: "#f0fdf4", color: "#065f46" },
];

interface Props {
  onNavigate: (page: string) => void;
}

export default function OperatorOpsDashboard({ onNavigate }: Props) {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [dealerCount, setDealerCount] = useState(0);
  const [pendingDealers, setPendingDealers] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/api/v6/claims").catch(() => []),
      apiFetch<any[]>("/api/v6/dealerships").catch(() => []),
      apiFetch<{ count: number }>("/api/v6/dealerships/pending-count").catch(() => ({ count: 0 })),
      apiFetch<any[]>("/api/v6/notifications").catch(() => []),
    ]).then(([c, d, p, n]) => {
      setClaims(Array.isArray(c) ? c : []);
      setDealerCount(Array.isArray(d) ? d.length : 0);
      setPendingDealers((p as any)?.count ?? 0);
      setNotifications(Array.isArray(n) ? n.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, []);

  const newToday = claims.filter(c => {
    const d = new Date(c.createdAt);
    return d.toDateString() === new Date().toDateString() && c.status === "submitted";
  }).length;

  const recentSubmissions = claims.filter(c => c.status === "submitted").slice(0, 8);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;

  return (
    <div>
      {/* Status KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 28 }}>
        {STATUS_GROUPS.map(g => {
          const count = claims.filter(c => g.statuses.includes(c.status)).length;
          return (
            <div key={g.label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: g.color }}>{count}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4, fontWeight: 500, lineHeight: 1.3 }}>{g.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* New Submissions table */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>New Submissions</span>
            <button onClick={() => onNavigate("master.ops.claim_queue")}
              style={{ background: "none", border: 0, color: "#033280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Open Claim Queue →
            </button>
          </div>
          {recentSubmissions.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>No pending submissions</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  {["Claim #", "Dealer", "Type", "Unit"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "#033280" }}>{c.claimNumber || "—"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#555" }}>{c.dealershipName || "—"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#555", textTransform: "capitalize" }}>{c.type?.replace(/_/g, " ") || "—"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#555" }}>
                      {[c.unitYear, c.unitMake, c.unitModel].filter(Boolean).join(" ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Platform stats */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 14 }}>Platform Overview</div>
            <StatRow label="Active Dealers" value={dealerCount} />
            <StatRow label="Pending Dealer Approvals" value={pendingDealers} warn={pendingDealers > 0} />
            <StatRow label="New Claims Today" value={newToday} />
            <StatRow label="Total Claims (Platform)" value={claims.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
              <button onClick={() => onNavigate("master.ops.claim_queue")}
                style={{ width: "100%", padding: "9px 14px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Open Claim Queue
              </button>
              {pendingDealers > 0 && (
                <button onClick={() => onNavigate("master.mgmt.dealer_accounts")}
                  style={{ width: "100%", padding: "9px 14px", background: "#f59e0b", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {pendingDealers} Dealer{pendingDealers > 1 ? "s" : ""} Awaiting Approval
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 13, fontWeight: 600, color: "#111" }}>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 12 }}>No new notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", background: n.isRead ? "white" : "#eff6ff" }}>
                <div style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 600, color: "#111" }}>{n.title || n.subject || "Notification"}</div>
                {n.body && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{n.body}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: 600, color: warn ? "#f59e0b" : "#111" }}>{value}</span>
    </div>
  );
}
