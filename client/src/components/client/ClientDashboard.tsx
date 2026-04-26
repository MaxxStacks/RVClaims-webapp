import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted", in_review: "In Review", info_requested: "Info Requested",
  pre_authorized: "Pre-Authorized", approved: "Approved", denied: "Denied",
  parts_ordered: "Parts Ordered", parts_received: "Parts Received",
  completed: "Completed", invoiced: "Invoiced", paid: "Paid",
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
};

const WARRANTY_COLORS: Record<string, { label: string; color: string }> = {
  active:   { label: "Active",        color: "#16a34a" },
  expiring: { label: "Expiring Soon", color: "#f48120" },
  expired:  { label: "Expired",       color: "#c0392b" },
  none:     { label: "Not set",       color: "#999"    },
};

interface Props {
  onNavigate: (page: string) => void;
}

export default function ClientDashboard({ onNavigate }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [units, setUnits] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/api/v6/units").catch(() => []),
      apiFetch<any[]>("/api/v6/claims").catch(() => []),
    ]).then(([u, c]) => {
      setUnits(Array.isArray(u) ? u : []);
      setClaims(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  }, []);

  const vehicle = units[0] || null;
  const openClaims = claims.filter(c => !["completed", "paid", "denied"].includes(c.status));
  const recentClaims = claims.slice(0, 4);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Vehicle card */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24 }}>
          {vehicle ? (
            <>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
                {vehicle.status?.replace(/_/g, " ") || "My Vehicle"}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>
                {vehicle.year} {vehicle.manufacturer} {vehicle.model}
              </h2>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 20, fontFamily: "monospace" }}>
                VIN {vehicle.vin}
                {vehicle.stockNumber && <span style={{ fontFamily: "inherit" }}> · Stock #{vehicle.stockNumber}</span>}
              </div>

              {/* Warranty badges */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                <WarrantyBadge label="Manufacturer Warranty" status={vehicle.mfrWarrantyStatus} until={vehicle.warrantyEnd} />
                <WarrantyBadge label="Extended Warranty" status={vehicle.extWarrantyStatus} until={vehicle.extWarrantyEnd} />
                <WarrantyBadge label="Service Contract" status={vehicle.serviceContractActive ? "active" : "none"} until={vehicle.serviceContractEnd} />
              </div>

              <button onClick={() => navigate(`/client-v6/units/${vehicle.id}`)}
                style={{ padding: "9px 18px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                View My Vehicle →
              </button>
            </>
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>No vehicle on file yet.</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>Your dealer will link your vehicle once it is registered in the system.</div>
            </div>
          )}
        </div>

        {/* Summary + Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6 }}>Open Claims</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: openClaims.length > 0 ? "#3b82f6" : "#22c55e" }}>{openClaims.length}</div>
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 6 }}>Total Claims</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>{claims.length}</div>
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {vehicle && (
                <ActionBtn label="My Vehicle" onClick={() => navigate(`/client-v6/units/${vehicle.id}`)} primary />
              )}
              <ActionBtn label="View Claims" onClick={() => onNavigate("client.main.claims")} />
              <ActionBtn label="My Warranties" onClick={() => onNavigate("client.main.warranties")} />
              <ActionBtn label="Documents" onClick={() => onNavigate("client.main.documents")} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      {recentClaims.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>My Claims</span>
            <button onClick={() => onNavigate("client.main.claims")}
              style={{ background: "none", border: 0, color: "#033280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              View all →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                {["Claim #", "Type", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentClaims.map(c => {
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
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WarrantyBadge({ label, status, until }: { label: string; status: string; until?: string }) {
  const { color, label: statusLabel } = WARRANTY_COLORS[status] || WARRANTY_COLORS.none;
  return (
    <div style={{ padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color }}>● {statusLabel}</div>
      {until && status !== "none" && (
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Until {new Date(until).toLocaleDateString()}</div>
      )}
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
