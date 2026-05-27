// client/src/pages/exclusive/superadmin/PlatformRevenue.tsx
// Revenue dashboard: licensing + revenue share per operator

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PURPLE = "#7c3aed";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function PlatformRevenue() {
  const { t } = useLanguage();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery<any>({
    queryKey: ["superadmin-revenue", month, year],
    queryFn: () => apiFetch<any>(`/api/superadmin/revenue?month=${month}&year=${year}`),
  });

  const operators: any[] = data?.operators ?? [];
  const totalLicensing = Number(data?.totalLicensing ?? 0);
  const totalRevenueShare = Number(data?.totalRevenueShare ?? 0);
  const totalPlatform = Number(data?.totalPlatformRevenue ?? 0);

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {t('superadmin.revenue') || 'Platform Revenue'}
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Licensing fees + revenue share across all active operators.
          </p>
        </div>
        {/* Month/year selector */}
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, color: "#0f172a", background: "#fff" }}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, color: "#0f172a", background: "#fff" }}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Licensing Fees" value={`$${totalLicensing.toLocaleString()}`} sub="Monthly operator fees" color={NAVY} />
        <StatCard label="Total Revenue Share" value={`$${totalRevenueShare.toFixed(2)}`} sub="15% of dealer subscriptions" color={PURPLE} />
        <StatCard label="Total Platform Revenue" value={`$${totalPlatform.toFixed(2)}`} sub="Licensing + revenue share" color={GREEN} />
      </div>

      {/* Per-operator table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Revenue by Operator — {MONTHS[month - 1]} {year}
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Operator", "Dealers", "Licensing Fee", "Dealer Sub GMV", "DS360 Share", "Operator Payout"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              )}
              {!isLoading && operators.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>No revenue data for this period.</td></tr>
              )}
              {operators.map((op: any) => (
                <tr key={op.operatorId} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{op.operatorName}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{op.dealerCount}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                    ${Number(op.licensingFee).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                    ${Number(op.totalDealerSubscriptionRevenue).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: PURPLE }}>
                    ${Number(op.ds360ShareAmount).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: GREEN, fontWeight: 600 }}>
                    ${Number(op.operatorShareAmount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!isLoading && operators.length > 0 && (
                <tr style={{ borderTop: "2px solid #e2e8f0", background: "#f8fafc" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a", fontSize: 13 }}>Totals</td>
                  <td style={{ padding: "12px 16px" }} />
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: NAVY, fontSize: 13 }}>
                    ${totalLicensing.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#374151", fontSize: 13 }}>
                    ${operators.reduce((s: number, o: any) => s + Number(o.totalDealerSubscriptionRevenue), 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: PURPLE, fontSize: 13 }}>
                    ${totalRevenueShare.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: GREEN, fontSize: 13 }}>
                    ${operators.reduce((s: number, o: any) => s + Number(o.operatorShareAmount), 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
