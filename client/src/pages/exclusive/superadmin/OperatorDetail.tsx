// client/src/pages/exclusive/superadmin/OperatorDetail.tsx
// Single operator detail: profile, branding, dealers, revenue

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PURPLE = "#7c3aed";

const TIER_COLORS: Record<string, string> = {
  enterprise: PURPLE, professional: "#0891b2", starter: "#059669",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#16a34a", pending: "#d97706", suspended: "#dc2626", cancelled: "#6b7280",
};

export default function OperatorDetail() {
  const { operatorId } = useParams<{ operatorId: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  const { data, isLoading } = useQuery<{ operator: any; dealers: any[] }>({
    queryKey: ["superadmin-operator", operatorId],
    queryFn: () => apiFetch<{ operator: any; dealers: any[] }>(`/api/superadmin/operators/${operatorId}`),
    enabled: !!operatorId,
  });

  const { data: revenueData } = useQuery<any>({
    queryKey: ["superadmin-revenue-op", operatorId],
    queryFn: async () => {
      const now = new Date();
      const r = await apiFetch<any>(`/api/superadmin/revenue?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      return r?.operators?.find((o: any) => o.operatorId === operatorId) ?? null;
    },
    enabled: !!operatorId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiFetch<any>(`/api/superadmin/operators/${operatorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-operator", operatorId] });
      qc.invalidateQueries({ queryKey: ["superadmin-operators"] });
      toast({ title: "Operator status updated", variant: "default" });
      setShowSuspendConfirm(false);
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const op = data?.operator;
  const dealers = data?.dealers ?? [];

  if (isLoading) {
    return <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading…</div>;
  }

  if (!op) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <p style={{ color: "#ef4444", marginBottom: 16 }}>Operator not found.</p>
        <Link href="/superadmin/operators">
          <a style={{ color: NAVY }}>← Back to Operators</a>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Back */}
      <Link href="/superadmin/operators">
        <a style={{ fontSize: 13, color: "#64748b", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
          ← All Operators
        </a>
      </Link>

      {/* Header card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "24px 28px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>{op.name}</h1>
              <span style={{
                background: `${TIER_COLORS[op.licenseTier] ?? "#64748b"}22`,
                color: TIER_COLORS[op.licenseTier] ?? "#64748b",
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                textTransform: "capitalize",
              }}>
                {op.licenseTier}
              </span>
              <span style={{
                background: `${STATUS_COLORS[op.status] ?? "#64748b"}22`,
                color: STATUS_COLORS[op.status] ?? "#64748b",
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                textTransform: "capitalize",
              }}>
                {op.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>slug: {op.slug}</div>
            {op.contactName && <div style={{ fontSize: 13, color: "#374151", marginTop: 8 }}>Contact: {op.contactName} {op.contactEmail ? `— ${op.contactEmail}` : ""}</div>}
            {op.contactPhone && <div style={{ fontSize: 13, color: "#374151" }}>Phone: {op.contactPhone}</div>}
            {op.country && <div style={{ fontSize: 13, color: "#374151" }}>Country: {op.country}</div>}
            {op.customDomain && <div style={{ fontSize: 13, color: "#374151" }}>Custom domain: {op.customDomain}</div>}
          </div>
          {/* Branding preview */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: op.primaryColor ?? NAVY, marginBottom: 4 }} />
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Primary</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: op.secondaryColor ?? GREEN, marginBottom: 4 }} />
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Secondary</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* License */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>License & Billing</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Monthly Fee", `$${Number(op.monthlyFee).toLocaleString()}/mo`],
              ["Max Dealers", op.maxDealers === 9999 ? "Unlimited" : op.maxDealers],
              ["Current Dealers", dealers.length],
              ["Revenue Share", `${op.revenueSharePercent}% to DS360`],
            ].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b" }}>{label}</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue this month */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Revenue — This Month</h2>
          {revenueData ? (
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Dealer Subscription GMV", `$${Number(revenueData.totalDealerSubscriptionRevenue).toLocaleString()}`],
                ["DS360 Share", `$${Number(revenueData.ds360ShareAmount).toFixed(2)}`],
                ["Operator Payout", `$${Number(revenueData.operatorShareAmount).toFixed(2)}`],
                ["Licensing Fee", `$${Number(revenueData.licensingFee).toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Revenue data unavailable.</p>
          )}
        </div>
      </div>

      {/* Dealers table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Dealers ({dealers.length})
          </h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Dealer", "City", "Status", "Plan"].map(h => (
                <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>No dealers yet.</td></tr>
            )}
            {dealers.map((d: any) => (
              <tr key={d.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{d.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{d.city ?? "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.status === "active" ? "#16a34a" : "#d97706", textTransform: "capitalize" }}>{d.status}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", textTransform: "capitalize" }}>{d.plan ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link href={`/superadmin/operators/${op.id}/edit`}>
          <a style={{
            background: NAVY, color: "#fff", padding: "10px 20px",
            borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}>
            Edit Branding / Tier
          </a>
        </Link>
        {op.status === "active" && (
          <button
            onClick={() => setShowSuspendConfirm(true)}
            style={{
              background: "#fff", color: "#dc2626", border: "1px solid #dc2626",
              padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            {t('superadmin.suspend') || 'Suspend Operator'}
          </button>
        )}
        {op.status === "suspended" && (
          <button
            onClick={() => statusMutation.mutate("active")}
            disabled={statusMutation.isPending}
            style={{
              background: GREEN, color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            {t('superadmin.activate') || 'Reactivate Operator'}
          </button>
        )}
      </div>

      {/* Suspend confirm */}
      {showSuspendConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
              Suspend {op.name}?
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              This will prevent all users under this operator from accessing the platform.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => statusMutation.mutate("suspended")}
                disabled={statusMutation.isPending}
                style={{ background: "#dc2626", color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none" }}
              >
                {statusMutation.isPending ? "Suspending…" : "Confirm Suspend"}
              </button>
              <button
                onClick={() => setShowSuspendConfirm(false)}
                style={{ background: "#f8fafc", color: "#374151", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "1px solid #e2e8f0" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
