// client/src/pages/exclusive/operator-admin/OperatorAnalytics.tsx
// Advanced Analytics & BI Dashboard — Operator view

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency } from "@/lib/locale";
import PrintButton from "@/components/PrintButton";

// ── Design tokens ────────────────────────────────────────────────────────────
const NAVY = "#033280";
const GREEN = "#0cb22c";
const PIE_COLORS = [NAVY, GREEN, "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

// ── Types ────────────────────────────────────────────────────────────────────
interface OperatorAnalyticsData {
  claimTurnaround: { average: number; trend: { month: string; avgDays: number }[] };
  claimsByManufacturer: { manufacturer: string; count: number; avgTurnaround: number }[];
  dealerActivity: {
    dealerName: string; dealershipId: string; claimCount: number;
    unitCount: number; revenue: number; lastActive: string | null;
  }[];
  revenueByModule: { module: string; revenue: number; subscriptionCount: number }[];
  platformGrowth: {
    totalDealers: number; totalUnits: number; totalClaims: number;
    trend: { month: string; claims: number; units: number }[];
  };
  staffEfficiency: { staffName: string; claimsProcessed: number }[];
}

type DatePreset = "this_week" | "this_month" | "last30" | "last90" | "this_year" | "custom";

function getPresetDates(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const d = (days: number) => {
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - days);
    return d2.toISOString().slice(0, 10);
  };
  const startOf = (part: "week" | "month" | "year") => {
    const d2 = new Date(now);
    if (part === "week") { d2.setDate(d2.getDate() - d2.getDay()); }
    else if (part === "month") { d2.setDate(1); }
    else { d2.setMonth(0, 1); }
    return d2.toISOString().slice(0, 10);
  };
  switch (preset) {
    case "this_week": return { from: startOf("week"), to };
    case "this_month": return { from: startOf("month"), to };
    case "last30": return { from: d(30), to };
    case "last90": return { from: d(90), to };
    case "this_year": return { from: startOf("year"), to };
    default: return { from: d(30), to };
  }
}

export default function OperatorAnalytics() {
  const { t } = useLanguage();

  const [preset, setPreset] = useState<DatePreset>("last90");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [mfrSort, setMfrSort] = useState<"count" | "avgTurnaround">("count");
  const [dealerSort, setDealerSort] = useState<"claimCount" | "revenue" | "unitCount">("claimCount");

  const { from, to } = preset === "custom"
    ? { from: customFrom, to: customTo }
    : getPresetDates(preset);

  const { data, isLoading, error } = useQuery<OperatorAnalyticsData>({
    queryKey: ["operator-analytics", from, to],
    queryFn: () =>
      apiFetch<OperatorAnalyticsData>("/api/analytics/operator", {
        method: "POST",
        body: JSON.stringify({ dateFrom: from, dateTo: to }),
      }),
    enabled: !!(from && to),
    staleTime: 5 * 60 * 1000,
  });

  const handleExport = useCallback(() => {
    const params = new URLSearchParams({ reportType: "operator", dateFrom: from, dateTo: to, format: "csv" });
    window.open(`/api/analytics/export?${params.toString()}`, "_blank");
  }, [from, to]);

  const PRESETS: { key: DatePreset; label: string }[] = [
    { key: "this_week", label: t("analytics.thisWeek") },
    { key: "this_month", label: t("analytics.thisMonth") },
    { key: "last30", label: t("analytics.last30") },
    { key: "last90", label: t("analytics.last90") },
    { key: "this_year", label: t("analytics.thisYear") },
    { key: "custom", label: t("analytics.custom") },
  ];

  // ── Sorted data ─────────────────────────────────────────────────────────
  const sortedMfr = [...(data?.claimsByManufacturer ?? [])].sort((a, b) =>
    mfrSort === "count" ? b.count - a.count : b.avgTurnaround - a.avgTurnaround
  );
  const sortedDealers = [...(data?.dealerActivity ?? [])].sort((a, b) =>
    b[dealerSort] - a[dealerSort]
  );
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  // ── Overview stats ───────────────────────────────────────────────────────
  const totalClaims = data?.platformGrowth.totalClaims ?? 0;
  const avgTurnaround = data?.claimTurnaround.average ?? 0;
  const activeDealers = data?.dealerActivity.filter(d => d.claimCount > 0).length ?? 0;
  const totalRevenue = (data?.dealerActivity ?? []).reduce((s, d) => s + d.revenue, 0);

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card, #fff)",
    border: "1px solid var(--border, #e8e8e8)",
    borderRadius: 10,
    padding: "16px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  };
  const sectionStyle: React.CSSProperties = {
    ...cardStyle,
    marginBottom: 20,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "var(--text-muted, #888)",
    fontWeight: 500,
    marginBottom: 2,
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text, #111)",
  };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "Inter,sans-serif", maxWidth: 1200 }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>
            {t("analytics.title")}
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted, #888)", margin: "4px 0 0" }}>
            Platform-wide analytics across all dealerships
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="no-print">
          <button
            onClick={handleExport}
            style={{ padding: "7px 14px", background: NAVY, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t("analytics.export")}
          </button>
          <PrintButton title="Operator Analytics Report" />
        </div>
      </div>

      {/* ── Date range bar ───────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }} className="no-print">
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)", marginRight: 4 }}>{t("analytics.dateRange")}:</span>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `1px solid ${preset === p.key ? NAVY : "var(--border, #e8e8e8)"}`,
              background: preset === p.key ? NAVY : "transparent",
              color: preset === p.key ? "#fff" : "var(--text, #555)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
        {preset === "custom" && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid var(--border, #e8e8e8)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "var(--bg-card, #fff)", color: "var(--text, #333)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              style={{ padding: "5px 8px", border: "1px solid var(--border, #e8e8e8)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "var(--bg-card, #fff)", color: "var(--text, #333)" }} />
          </>
        )}
      </div>

      {/* ── Loading / Error states ────────────────────────────────────────── */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted, #888)", fontSize: 13 }}>
          Loading analytics…
        </div>
      )}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>
          Failed to load analytics data.
        </div>
      )}

      {data && (
        <>
          {/* ── Overview cards ──────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Total Claims Processed", value: totalClaims.toLocaleString() },
              { label: "Avg Turnaround (days)", value: avgTurnaround.toFixed(1) },
              { label: "Active Dealers", value: activeDealers.toLocaleString() },
              { label: "Total Revenue", value: formatCurrency(totalRevenue, "CAD") },
            ].map((stat) => (
              <div key={stat.label} style={cardStyle}>
                <div style={labelStyle}>{stat.label}</div>
                <div style={valueStyle}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* ── Claim Turnaround Trend ────────────────────────────────── */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 16px" }}>
              {t("analytics.claimTurnaround")}
            </h3>
            {data.claimTurnaround.trend.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.claimTurnaround.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f0f0f0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} days`, "Avg Turnaround"]} />
                  <Line type="monotone" dataKey="avgDays" stroke={NAVY} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Claims by Manufacturer ────────────────────────────────── */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: 0 }}>
                {t("analytics.manufacturer")}
              </h3>
              <div style={{ display: "flex", gap: 6 }} className="no-print">
                {(["count", "avgTurnaround"] as const).map((s) => (
                  <button key={s} onClick={() => setMfrSort(s)} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${mfrSort === s ? NAVY : "var(--border, #e8e8e8)"}`, background: mfrSort === s ? NAVY : "transparent", color: mfrSort === s ? "#fff" : "var(--text, #555)", fontSize: 11, cursor: "pointer" }}>
                    {s === "count" ? "By Claims" : "By Turnaround"}
                  </button>
                ))}
              </div>
            </div>
            {sortedMfr.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sortedMfr.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f0f0f0)" />
                  <XAxis dataKey="manufacturer" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey={mfrSort === "count" ? "count" : "avgTurnaround"} fill={NAVY} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Dealer Activity ───────────────────────────────────────── */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: 0 }}>
                {t("analytics.dealerActivity")}
              </h3>
              <div style={{ display: "flex", gap: 6 }} className="no-print">
                {(["claimCount", "revenue", "unitCount"] as const).map((s) => (
                  <button key={s} onClick={() => setDealerSort(s)} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${dealerSort === s ? NAVY : "var(--border, #e8e8e8)"}`, background: dealerSort === s ? NAVY : "transparent", color: dealerSort === s ? "#fff" : "var(--text, #555)", fontSize: 11, cursor: "pointer" }}>
                    {s === "claimCount" ? "Claims" : s === "revenue" ? "Revenue" : "Units"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border, #e8e8e8)" }}>
                    {["Dealer Name", "Claims", "Units", "Revenue", "Last Active"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)", whiteSpace: "nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDealers.slice(0, 20).map((d) => {
                    const dormant = d.lastActive && (Date.now() - new Date(d.lastActive).getTime() > 30 * 86400000);
                    return (
                      <tr key={d.dealershipId} style={{ borderBottom: "1px solid var(--border, #f0f0f0)", background: dormant ? "#fffbeb" : "transparent" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "var(--text, #333)" }}>
                          {d.dealerName}
                          {dormant && <span style={{ marginLeft: 6, fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>Dormant</span>}
                        </td>
                        <td style={{ padding: "8px 10px" }}>{d.claimCount.toLocaleString()}</td>
                        <td style={{ padding: "8px 10px" }}>{d.unitCount.toLocaleString()}</td>
                        <td style={{ padding: "8px 10px" }}>{formatCurrency(d.revenue, "CAD")}</td>
                        <td style={{ padding: "8px 10px", color: "var(--text-muted, #888)", fontSize: 11 }}>
                          {d.lastActive ? new Date(d.lastActive).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Revenue by Module ─────────────────────────────────────── */}
          <div style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 16px" }}>
                Revenue by Module
              </h3>
              {data.revenueByModule.filter(m => m.revenue > 0).length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.revenueByModule.filter(m => m.revenue > 0)}
                      dataKey="revenue"
                      nameKey="module"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {data.revenueByModule.filter(m => m.revenue > 0).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v, "CAD")} />
                    <Legend formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                Module Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {data.revenueByModule.slice(0, 8).map((m, i) => (
                  <div key={m.module} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border, #f5f5f5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text, #333)" }}>{m.module}</span>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text, #111)" }}>{formatCurrency(m.revenue, "CAD")}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted, #888)" }}>{m.subscriptionCount} subs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Staff Efficiency ──────────────────────────────────────── */}
          <div style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.techEfficiency")} — Staff
              </h3>
              {data.staffEfficiency.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border, #e8e8e8)" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)" }}>Staff Member</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)" }}>Claims Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staffEfficiency.slice(0, 10).map((s) => (
                      <tr key={s.staffName} style={{ borderBottom: "1px solid var(--border, #f5f5f5)" }}>
                        <td style={{ padding: "7px 8px", color: "var(--text, #333)" }}>{s.staffName}</td>
                        <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: NAVY }}>{s.claimsProcessed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Platform Growth ──────────────────────────────────────── */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.platformGrowth")}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Dealers", value: data.platformGrowth.totalDealers },
                  { label: "Units", value: data.platformGrowth.totalUnits },
                  { label: "Claims (period)", value: data.platformGrowth.totalClaims },
                ].map((s) => (
                  <div key={s.label} style={{ background: "var(--bg-secondary, #f9fafb)", borderRadius: 8, padding: "10px 12px", textAlign: "center" as const }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>{s.value.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted, #888)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {data.platformGrowth.trend.length > 0 && (
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={data.platformGrowth.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f0f0f0)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="claims" stroke={NAVY} fill={`${NAVY}20`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
