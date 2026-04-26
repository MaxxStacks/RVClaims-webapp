import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

interface Props {
  onNavigate: (page: string) => void;
}

export default function OperatorMgmtDashboard({ onNavigate }: Props) {
  const apiFetch = useApiFetch();
  const [dealers, setDealers] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [claims, setClaims] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/api/v6/dealerships").catch(() => []),
      apiFetch<{ count: number }>("/api/v6/dealerships/pending-count").catch(() => ({ count: 0 })),
      apiFetch<any[]>("/api/v6/claims").catch(() => []),
      apiFetch<any[]>("/api/v6/notifications").catch(() => []),
    ]).then(([d, p, c, n]) => {
      setDealers(Array.isArray(d) ? d : []);
      setPendingCount((p as any)?.count ?? 0);
      setClaims(Array.isArray(c) ? c : []);
      setNotifications(Array.isArray(n) ? n.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const activeDealers = dealers.filter(d => d.reviewStatus === "active");
  const now = new Date();
  const claimsThisMonth = claims.filter(c => {
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const openClaims = claims.filter(c => !["draft", "completed", "paid", "denied"].includes(c.status));

  const recentDealers = [...dealers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard label="Active Dealers" value={activeDealers.length} valueColor="#3b82f6"
          sub={`${dealers.length} total`} onClick={() => onNavigate("master.mgmt.dealer_accounts")} />
        <KpiCard label="Pending Approvals" value={pendingCount} valueColor={pendingCount > 0 ? "#f59e0b" : "#22c55e"}
          sub={pendingCount > 0 ? "Requires action" : "All clear"} onClick={() => onNavigate("master.mgmt.dealer_accounts")} />
        <KpiCard label="Open Claims" value={openClaims.length} valueColor="#8b5cf6"
          sub="Across all dealers" onClick={() => onNavigate("master.ops.claim_queue")} />
        <KpiCard label="Claims This Month" value={claimsThisMonth.length} valueColor="#22c55e"
          sub="New submissions" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Recent Dealers */}
        <div>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Recent Dealer Accounts</span>
              <button onClick={() => onNavigate("master.mgmt.dealer_accounts")}
                style={{ background: "none", border: 0, color: "#033280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                View all →
              </button>
            </div>
            {recentDealers.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#888", fontSize: 13 }}>No dealers yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    {["Dealership", "Status", "Plan", "Joined"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDealers.map(d => {
                    const rs = d.reviewStatus || "unknown";
                    const sty = rs === "active"
                      ? { bg: "#dcfce7", color: "#166534" }
                      : rs === "pending_review"
                      ? { bg: "#fef3c7", color: "#92400e" }
                      : rs === "suspended"
                      ? { bg: "#fee2e2", color: "#991b1b" }
                      : rs === "rejected"
                      ? { bg: "#f3f4f6", color: "#6b7280" }
                      : { bg: "#f3f4f6", color: "#9ca3af" };
                    return (
                      <tr key={d.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#111" }}>{d.name || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: sty.bg, color: sty.color }}>
                            {rs.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#555" }}>{d.subscriptionPlan ? `Plan ${d.subscriptionPlan}` : "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Revenue placeholder */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>Revenue & Billing</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Stripe integration — coming in Phase 3</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {["MRR", "YTD Revenue", "Outstanding Invoices"].map(label => (
                <div key={label} style={{ padding: 16, background: "#f5f6f8", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#ccc" }}>—</div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate("master.mgmt.revenue_billing")}
              style={{ marginTop: 14, padding: "8px 16px", background: "white", color: "#033280", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              View Revenue & Billing →
            </button>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick links */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>Quick Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ActionBtn label="Claim Queue" onClick={() => onNavigate("master.ops.claim_queue")} primary />
              <ActionBtn label="Dealer Accounts" onClick={() => onNavigate("master.mgmt.dealer_accounts")} />
              <ActionBtn label="Operations Dashboard" onClick={() => onNavigate("master.ops.dashboard")} />
              <ActionBtn label="Parts Management" onClick={() => onNavigate("master.ops.parts_management")} />
              <ActionBtn label="Staff & Permissions" onClick={() => onNavigate("master.mgmt.staff_permissions")} />
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 13, fontWeight: 600, color: "#111" }}>
              Alerts & Notifications
            </div>
            {pendingCount > 0 && (
              <div onClick={() => onNavigate("master.mgmt.dealer_accounts")}
                style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", background: "#fff7ed", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>{pendingCount} dealer{pendingCount > 1 ? "s" : ""} awaiting approval</div>
                  <div style={{ fontSize: 11, color: "#b45309" }}>Click to review →</div>
                </div>
              </div>
            )}
            {notifications.length === 0 && pendingCount === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 12 }}>All clear</div>
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

function KpiCard({ label, value, valueColor, sub, onClick }: { label: string; value: number; valueColor: string; sub?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, cursor: onClick ? "pointer" : "default", transition: "border-color 150ms" }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = "#033280")}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb")}
    >
      <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: valueColor, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa" }}>{sub}</div>}
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
