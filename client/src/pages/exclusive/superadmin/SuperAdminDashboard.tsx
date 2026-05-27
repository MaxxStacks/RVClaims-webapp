// client/src/pages/exclusive/superadmin/SuperAdminDashboard.tsx
// DS360 Platform — Superadmin Dashboard

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PURPLE = "#7c3aed";

interface PlatformStats {
  totalOperators: number;
  totalDealers: number;
  totalUnits: number;
  totalClaims: number;
  totalRevenue: number;
}

interface OperatorRow {
  id: string;
  name: string;
  licenseTier: string;
  status: string;
  maxDealers: number;
  monthlyFee: string;
  revenueSharePercent: string;
  dealerCount: number;
  slug: string;
}

const TIER_COLORS: Record<string, string> = {
  enterprise:   "#7c3aed",
  professional: "#0891b2",
  starter:      "#059669",
};

const STATUS_COLORS: Record<string, string> = {
  active:    "#16a34a",
  pending:   "#d97706",
  suspended: "#dc2626",
  cancelled: "#6b7280",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { t } = useLanguage();

  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ["superadmin-stats"],
    queryFn: () => apiFetch<PlatformStats>("/api/superadmin/stats").then(r => r as PlatformStats),
  });

  const { data: opsData, isLoading: opsLoading } = useQuery<{ operators: OperatorRow[] }>({
    queryKey: ["superadmin-operators"],
    queryFn: () => apiFetch<{ operators: OperatorRow[] }>("/api/superadmin/operators"),
  });

  const operators = opsData?.operators ?? [];

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#ede9fe",
          border: "1px solid #c4b5fd",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: PURPLE,
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: 12,
        }}>
          DS360 Platform Superadmin
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {t('superadmin.platformStats') || 'Platform Overview'}
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Cross-operator visibility — all operators, all dealers, all revenue.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 40 }}>
        <StatCard
          label={t('superadmin.totalOperators') || 'Total Operators'}
          value={statsLoading ? "—" : (stats?.totalOperators ?? 0)}
        />
        <StatCard
          label="Total Dealers"
          value={statsLoading ? "—" : (stats?.totalDealers ?? 0)}
        />
        <StatCard
          label="Total Units"
          value={statsLoading ? "—" : (stats?.totalUnits ?? 0)}
        />
        <StatCard
          label="Total Claims"
          value={statsLoading ? "—" : (stats?.totalClaims ?? 0)}
        />
        <StatCard
          label="Monthly Platform Revenue"
          value={statsLoading ? "—" : `$${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
          sub="Licensing fees (active operators)"
        />
      </div>

      {/* Operators summary table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {t('superadmin.operators') || 'Operators'}
          </h2>
          <Link href="/superadmin/operators">
            <a style={{ fontSize: 13, color: NAVY, fontWeight: 600, textDecoration: "none" }}>
              View All →
            </a>
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Operator", "Tier", "Dealers", "Monthly Fee", "Rev Share", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opsLoading && (
                <tr><td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              )}
              {!opsLoading && operators.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>No operators yet.</td></tr>
              )}
              {operators.map(op => (
                <tr key={op.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{op.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{op.slug}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: `${TIER_COLORS[op.licenseTier] ?? "#64748b"}22`,
                      color: TIER_COLORS[op.licenseTier] ?? "#64748b",
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      textTransform: "capitalize",
                    }}>
                      {op.licenseTier}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {op.dealerCount} / {op.maxDealers === 9999 ? "∞" : op.maxDealers}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    ${Number(op.monthlyFee).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {op.revenueSharePercent}%
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: `${STATUS_COLORS[op.status] ?? "#64748b"}22`,
                      color: STATUS_COLORS[op.status] ?? "#64748b",
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      textTransform: "capitalize",
                    }}>
                      {op.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/superadmin/operators/${op.id}`}>
                      <a style={{ fontSize: 12, color: NAVY, fontWeight: 600, textDecoration: "none" }}>View →</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }}>
        {[
          { label: t('superadmin.onboard') || 'Onboard New Operator', href: "/superadmin/operators/new", color: GREEN },
          { label: t('superadmin.revenue') || 'Platform Revenue', href: "/superadmin/revenue", color: NAVY },
          { label: t('superadmin.globalSettings') || 'Global Settings', href: "/superadmin/settings", color: PURPLE },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <a style={{
              display: "block",
              background: "#fff",
              border: `2px solid ${item.color}`,
              borderRadius: 10,
              padding: "18px 24px",
              textAlign: "center",
              color: item.color,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.15s",
            }}>
              {item.label} →
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
