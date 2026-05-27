// client/src/pages/exclusive/superadmin/OperatorManagement.tsx
// All Operators table with filtering and onboard CTA

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PURPLE = "#7c3aed";

const TIER_COLORS: Record<string, string> = {
  enterprise:   PURPLE,
  professional: "#0891b2",
  starter:      "#059669",
};

const STATUS_COLORS: Record<string, string> = {
  active:    "#16a34a",
  pending:   "#d97706",
  suspended: "#dc2626",
  cancelled: "#6b7280",
};

interface OperatorRow {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  licenseTier: string;
  status: string;
  maxDealers: number;
  monthlyFee: string;
  revenueSharePercent: string;
  dealerCount: number;
  createdAt: string;
}

export default function OperatorManagement() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery<{ operators: OperatorRow[] }>({
    queryKey: ["superadmin-operators"],
    queryFn: () => apiFetch<{ operators: OperatorRow[] }>("/api/superadmin/operators"),
  });

  const operators = (data?.operators ?? []).filter(op =>
    statusFilter === "all" ? true : op.status === statusFilter
  );

  const counts = {
    all:       (data?.operators ?? []).length,
    active:    (data?.operators ?? []).filter(o => o.status === "active").length,
    pending:   (data?.operators ?? []).filter(o => o.status === "pending").length,
    suspended: (data?.operators ?? []).filter(o => o.status === "suspended").length,
  };

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {t('superadmin.operators') || 'Operators'}
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Manage licensed operators and their dealer networks.
          </p>
        </div>
        <Link href="/superadmin/operators/new">
          <a style={{
            background: GREEN,
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}>
            + {t('superadmin.onboard') || 'Onboard New Operator'}
          </a>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f8fafc", padding: 4, borderRadius: 8, width: "fit-content" }}>
        {(["all", "active", "pending", "suspended"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: statusFilter === s ? "#fff" : "transparent",
              color: statusFilter === s ? "#0f172a" : "#64748b",
              boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Operator", "Contact Email", "Tier", "Dealers", "Monthly Fee", "Rev Share", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>Loading operators…</td></tr>
              )}
              {!isLoading && operators.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>No operators found.</td></tr>
              )}
              {operators.map(op => (
                <tr key={op.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{op.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>/{op.slug}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                    {op.contactEmail ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: `${TIER_COLORS[op.licenseTier] ?? "#64748b"}22`,
                      color: TIER_COLORS[op.licenseTier] ?? "#64748b",
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      textTransform: "capitalize",
                    }}>
                      {op.licenseTier}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                    {op.dealerCount} / {op.maxDealers === 9999 ? "∞" : op.maxDealers}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                    ${Number(op.monthlyFee).toLocaleString()}/mo
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                    {op.revenueSharePercent}%
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: `${STATUS_COLORS[op.status] ?? "#64748b"}22`,
                      color: STATUS_COLORS[op.status] ?? "#64748b",
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      textTransform: "capitalize",
                    }}>
                      {op.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/superadmin/operators/${op.id}`}>
                      <a style={{ fontSize: 12, color: NAVY, fontWeight: 600, textDecoration: "none", marginRight: 12 }}>
                        View →
                      </a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
