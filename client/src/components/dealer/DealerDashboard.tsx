import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", submitted: "Submitted", in_review: "In Review",
  info_requested: "Info Requested", pre_authorized: "Pre-Authorized",
  approved: "Approved", denied: "Denied", parts_ordered: "Parts Ordered",
  parts_received: "Parts Received", completed: "Completed",
  invoiced: "Invoiced", paid: "Paid",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  submitted:      { bg: "#dbeafe", color: "#1d4ed8" },
  in_review:      { bg: "#fef3c7", color: "#92400e" },
  info_requested: { bg: "#fff7ed", color: "#9a3412" },
  pre_authorized: { bg: "#e0e7ff", color: "#3730a3" },
  approved:       { bg: "#dcfce7", color: "#166534" },
  denied:         { bg: "#fee2e2", color: "#991b1b" },
  parts_ordered:  { bg: "#faf5ff", color: "#6b21a8" },
  parts_received: { bg: "#ede9fe", color: "#5b21b6" },
  completed:      { bg: "#d1fae5", color: "#065f46" },
  invoiced:       { bg: "#ecfdf5", color: "#047857" },
  paid:           { bg: "#f0fdf4", color: "#15803d" },
  draft:          { bg: "#f3f4f6", color: "#6b7280" },
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function DealerDashboard({ onNavigate }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [claims, setClaims] = useState<any[]>([]);
  const [unitCount, setUnitCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/api/v6/claims").catch(() => []),
      apiFetch<any[]>("/api/v6/units").catch(() => []),
      apiFetch<any[]>("/api/v6/notifications").catch(() => []),
    ]).then(([c, u, n]) => {
      setClaims(Array.isArray(c) ? c : []);
      setUnitCount(Array.isArray(u) ? u.length : 0);
      setNotifications(Array.isArray(n) ? n.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const nonDraft = claims.filter(c => c.status !== "draft");
  const active = nonDraft.filter(c => !["completed", "paid", "denied"].includes(c.status));
  const pendingApproval = nonDraft.filter(c => ["submitted", "in_review", "info_requested", "pre_authorized"].includes(c.status));
  const now = new Date();
  const thisMonth = nonDraft.filter(c => {
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const recent = nonDraft.slice(0, 6);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard label="Active Claims" value={active.length} valueColor="#3b82f6" onClick={() => onNavigate("dealer.ops.claims")} />
        <KpiCard label="Units in Inventory" value={unitCount} valueColor="#8b5cf6" onClick={() => onNavigate("dealer.ops.inventory")} />
        <KpiCard label="Submitted This Month" value={thisMonth.length} valueColor="#22c55e" />
        <KpiCard label="Pending Approval" value={pendingApproval.length} valueColor="#f59e0b" onClick={() => onNavigate("dealer.ops.claims")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Recent Claims panel */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Recent Claims</span>
            <button onClick={() => onNavigate("dealer.ops.claims")}
              style={{ background: "none", border: 0, color: "#033280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>
              No claims submitted yet.
              <div style={{ marginTop: 12 }}>
                <button onClick={() => onNavigate("dealer.ops.inventory")}
                  style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Go to Inventory → Start a Claim
                </button>
              </div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  {["Claim #", "Type", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(c => {
                  const s = STATUS_STYLE[c.status] || { bg: "#f3f4f6", color: "#555" };
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#033280" }}>{c.claimNumber || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#333", textTransform: "capitalize" }}>{c.type?.replace(/_/g, " ") || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color }}>
                          {STATUS_LABEL[c.status] || c.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>
                        {c.submittedAt
                          ? new Date(c.submittedAt).toLocaleDateString()
                          : c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick Actions */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ActionBtn label="+ New Claim" onClick={() => onNavigate("dealer.ops.inventory")} primary />
              <ActionBtn label="Add Unit" onClick={() => navigate("/dealer-v6/units/new")} />
              <ActionBtn label="View All Claims" onClick={() => onNavigate("dealer.ops.claims")} />
              <ActionBtn label="View Inventory" onClick={() => onNavigate("dealer.ops.inventory")} />
            </div>
          </div>

          {/* Notifications from DS360 */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 13, fontWeight: 600, color: "#111" }}>
              From DS360
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 12 }}>No new messages</div>
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

function KpiCard({ label, value, valueColor, onClick }: { label: string; value: number; valueColor: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, cursor: onClick ? "pointer" : "default", transition: "border-color 150ms" }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = "#033280")}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb")}
    >
      <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  );
}

function ActionBtn({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "9px 14px", borderRadius: 8, textAlign: "left",
      background: primary ? "#033280" : "white",
      color: primary ? "white" : "#333",
      border: primary ? "none" : "1px solid #e0e0e0",
      fontSize: 13, fontWeight: primary ? 600 : 500, cursor: "pointer",
    }}>
      {label}
    </button>
  );
}
