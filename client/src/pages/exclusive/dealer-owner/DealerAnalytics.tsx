// client/src/pages/exclusive/dealer-owner/DealerAnalytics.tsx
// Advanced Analytics & BI Dashboard — Dealer view (gated by advanced_analytics module)

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ComposedChart, Bar, Line, AreaChart, Area,
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, getDealerCurrency } from "@/lib/locale";
import { exportToCSV } from "@/lib/csvExport";
import PrintButton from "@/components/PrintButton";

// ── Design tokens ────────────────────────────────────────────────────────────
const NAVY = "#033280";
const GREEN = "#0cb22c";
const AMBER = "#f59e0b";

// ── Types ────────────────────────────────────────────────────────────────────
interface DealerAnalyticsData {
  revenuePerUnit: {
    unitId: string; vin: string; unitDesc: string;
    totalRevenue: number; claimCount: number; woCount: number;
  }[];
  techEfficiency: {
    techId: string; techName: string; wosCompleted: number; avgRepairHours: number;
  }[];
  claimStatusBreakdown: { status: string; count: number }[];
  monthlyOverview: { month: string; claims: number; workOrders: number; revenue: number }[];
  warrantyClaimRates: { make: string; model: string; year: number; claimsPerUnit: number }[];
  partsVelocity: { avgDaysToReceive: number; trend: { month: string; avgDays: number }[] };
  customerSatisfaction: { avgRating: number; totalReviews: number };
}

interface ScheduleData {
  frequency: "daily" | "weekly" | "monthly";
  recipientEmails: string[];
  reportSections: string[];
  isActive: boolean;
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

const REPORT_SECTIONS = [
  { key: "monthly_overview", label: "Monthly Overview" },
  { key: "revenue_per_unit", label: "Revenue Per Unit" },
  { key: "tech_efficiency", label: "Technician Efficiency" },
  { key: "claim_status", label: "Claim Status Breakdown" },
  { key: "warranty_rates", label: "Warranty Claim Rates" },
  { key: "parts_velocity", label: "Parts Velocity" },
];

export default function DealerAnalytics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const role = user?.role ?? "dealer_owner";

  const [preset, setPreset] = useState<DatePreset>("last90");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Schedule form state
  const [schedFreq, setSchedFreq] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [schedEmails, setSchedEmails] = useState<string[]>([]);
  const [schedEmailInput, setSchedEmailInput] = useState("");
  const [schedSections, setSchedSections] = useState<string[]>(["monthly_overview", "revenue_per_unit"]);
  const [schedActive, setSchedActive] = useState(true);
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedMsg, setSchedMsg] = useState("");

  const { from, to } = preset === "custom"
    ? { from: customFrom, to: customTo }
    : getPresetDates(preset);

  const currency = getDealerCurrency(user ? { country: null, stateProvince: null } : null);

  const { data, isLoading, error } = useQuery<DealerAnalyticsData>({
    queryKey: ["dealer-analytics", from, to],
    queryFn: () =>
      apiFetch<DealerAnalyticsData>("/api/analytics/dealer", {
        method: "POST",
        body: JSON.stringify({ dateFrom: from, dateTo: to }),
      }),
    enabled: !!(from && to),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing schedule
  const { data: schedData } = useQuery<{ schedule: ScheduleData | null }>({
    queryKey: ["analytics-schedule"],
    queryFn: () => apiFetch<{ schedule: ScheduleData | null }>("/api/analytics/schedule"),
    staleTime: 5 * 60 * 1000,
  });

  // Populate form when schedule exists
  const populateSchedule = useCallback(() => {
    if (schedData?.schedule) {
      const s = schedData.schedule;
      setSchedFreq(s.frequency);
      setSchedEmails(s.recipientEmails);
      setSchedSections(s.reportSections);
      setSchedActive(s.isActive);
    }
  }, [schedData]);

  const openSchedule = () => {
    populateSchedule();
    setScheduleOpen(true);
    setSchedMsg("");
  };

  const saveSchedule = async () => {
    if (schedEmails.length === 0) { setSchedMsg("Add at least one email address."); return; }
    setSchedSaving(true);
    setSchedMsg("");
    try {
      await apiFetch("/api/analytics/schedule", {
        method: "POST",
        body: JSON.stringify({
          frequency: schedFreq,
          recipientEmails: schedEmails,
          reportSections: schedSections,
          isActive: schedActive,
        }),
      });
      qc.invalidateQueries({ queryKey: ["analytics-schedule"] });
      setSchedMsg("Schedule saved.");
    } catch {
      setSchedMsg("Failed to save. Please try again.");
    } finally {
      setSchedSaving(false);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && schedEmailInput.trim()) {
      e.preventDefault();
      const email = schedEmailInput.trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !schedEmails.includes(email)) {
        setSchedEmails(prev => [...prev, email]);
      }
      setSchedEmailInput("");
    }
  };

  const handleExport = useCallback(() => {
    if (!data) return;
    exportToCSV(
      data.revenuePerUnit.map(r => ({
        vin: r.vin,
        description: r.unitDesc,
        revenue: r.totalRevenue,
        claims: r.claimCount,
        workOrders: r.woCount,
      })),
      `dealer-analytics-${from}-${to}`,
      [
        { key: "vin", label: "VIN" },
        { key: "description", label: "Description" },
        { key: "revenue", label: "Revenue" },
        { key: "claims", label: "Claims" },
        { key: "workOrders", label: "Work Orders" },
      ]
    );
  }, [data, from, to]);

  // ── Role-based section visibility ────────────────────────────────────────
  const canSee = {
    revenuePerUnit: ["dealer_owner"].includes(role),
    techEfficiency: ["dealer_owner", "service_manager", "shop_manager"].includes(role),
    claimStatus: ["dealer_owner", "service_manager"].includes(role),
    monthlyOverview: true,
    warrantyRates: ["dealer_owner", "service_manager"].includes(role),
    partsVelocity: ["dealer_owner", "service_manager"].includes(role),
  };

  // ── Overview cards ───────────────────────────────────────────────────────
  const totalClaims = (data?.claimStatusBreakdown ?? []).reduce((s, c) => s + c.count, 0);
  const totalRevenue = (data?.revenuePerUnit ?? []).reduce((s, u) => s + u.totalRevenue, 0);
  const avgRating = data?.customerSatisfaction.avgRating ?? 0;
  const openWOs = (data?.monthlyOverview ?? []).reduce((s, m) => s + m.workOrders, 0);

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card, #fff)",
    border: "1px solid var(--border, #e8e8e8)",
    borderRadius: 10,
    padding: "16px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  };
  const sectionStyle: React.CSSProperties = { ...cardStyle, marginBottom: 20 };

  const PRESETS: { key: DatePreset; label: string }[] = [
    { key: "this_week", label: t("analytics.thisWeek") },
    { key: "this_month", label: t("analytics.thisMonth") },
    { key: "last30", label: t("analytics.last30") },
    { key: "last90", label: t("analytics.last90") },
    { key: "this_year", label: t("analytics.thisYear") },
    { key: "custom", label: t("analytics.custom") },
  ];

  // ── Total status count for % calc ────────────────────────────────────────
  const totalStatusCount = (data?.claimStatusBreakdown ?? []).reduce((s, c) => s + c.count, 0);

  return (
    <div style={{ padding: "24px 28px", fontFamily: "Inter,sans-serif", maxWidth: 1200 }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>
            {t("analytics.title")}
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted, #888)", margin: "4px 0 0" }}>
            Deep analytics for your dealership
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="no-print">
          {role === "dealer_owner" && (
            <button
              onClick={openSchedule}
              style={{ padding: "7px 14px", background: "transparent", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              {t("analytics.schedule")}
            </button>
          )}
          <button
            onClick={handleExport}
            style={{ padding: "7px 14px", background: NAVY, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t("analytics.export")}
          </button>
          <PrintButton title="Dealer Analytics Report" />
        </div>
      </div>

      {/* ── Date range bar ───────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }} className="no-print">
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)", marginRight: 4 }}>{t("analytics.dateRange")}:</span>
        {PRESETS.map((p) => (
          <button key={p.key} onClick={() => setPreset(p.key)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${preset === p.key ? NAVY : "var(--border, #e8e8e8)"}`, background: preset === p.key ? NAVY : "transparent", color: preset === p.key ? "#fff" : "var(--text, #555)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            {p.label}
          </button>
        ))}
        {preset === "custom" && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ padding: "5px 8px", border: "1px solid var(--border, #e8e8e8)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "var(--bg-card, #fff)", color: "var(--text, #333)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ padding: "5px 8px", border: "1px solid var(--border, #e8e8e8)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "var(--bg-card, #fff)", color: "var(--text, #333)" }} />
          </>
        )}
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted, #888)", fontSize: 13 }}>Loading analytics…</div>}
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>Failed to load analytics data.</div>}

      {data && (
        <>
          {/* ── Overview cards ──────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "var(--text-muted, #888)", fontWeight: 500 }}>Total Claims</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text, #111)", marginTop: 2 }}>{totalClaims.toLocaleString()}</div>
            </div>
            {canSee.revenuePerUnit && (
              <div style={cardStyle}>
                <div style={{ fontSize: 11, color: "var(--text-muted, #888)", fontWeight: 500 }}>Revenue</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text, #111)", marginTop: 2 }}>{formatCurrency(totalRevenue, currency)}</div>
              </div>
            )}
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "var(--text-muted, #888)", fontWeight: 500 }}>Avg Customer Rating</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text, #111)", marginTop: 2 }}>
                {avgRating > 0 ? avgRating.toFixed(1) + " ⭐" : "N/A"}
              </div>
              {data.customerSatisfaction.totalReviews > 0 && <div style={{ fontSize: 10, color: "var(--text-muted, #888)" }}>{data.customerSatisfaction.totalReviews} reviews</div>}
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "var(--text-muted, #888)", fontWeight: 500 }}>Work Orders (period)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text, #111)", marginTop: 2 }}>{openWOs.toLocaleString()}</div>
            </div>
          </div>

          {/* ── Monthly Overview ─────────────────────────────────────────── */}
          {canSee.monthlyOverview && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 16px" }}>
                Monthly Overview
              </h3>
              {data.monthlyOverview.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={data.monthlyOverview}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f0f0f0)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, name: string) => name === "revenue" ? formatCurrency(v, currency) : v} />
                    {["dealer_owner", "service_manager"].includes(role) && <Bar yAxisId="left" dataKey="claims" fill={NAVY} radius={[3, 3, 0, 0]} name="Claims" />}
                    {["dealer_owner", "service_manager", "shop_manager"].includes(role) && <Bar yAxisId="left" dataKey="workOrders" fill={GREEN} radius={[3, 3, 0, 0]} name="Work Orders" />}
                    {canSee.revenuePerUnit && <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={AMBER} strokeWidth={2} name="Revenue" dot={{ r: 3 }} />}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* ── Revenue Per Unit ─────────────────────────────────────────── */}
          {canSee.revenuePerUnit && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.revenuePerUnit")}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border, #e8e8e8)" }}>
                      {["VIN", "Description", "Revenue", "Claims", "Work Orders"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)", whiteSpace: "nowrap" as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenuePerUnit.slice(0, 20).map((u) => (
                      <tr key={u.unitId} style={{ borderBottom: "1px solid var(--border, #f0f0f0)" }}>
                        <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted, #666)" }}>{u.vin}</td>
                        <td style={{ padding: "8px 10px", color: "var(--text, #333)" }}>{u.unitDesc || "—"}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: NAVY }}>{formatCurrency(u.totalRevenue, currency)}</td>
                        <td style={{ padding: "8px 10px" }}>{u.claimCount}</td>
                        <td style={{ padding: "8px 10px" }}>{u.woCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Technician Efficiency ────────────────────────────────────── */}
          {canSee.techEfficiency && data.techEfficiency.length > 0 && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.techEfficiency")}
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border, #e8e8e8)" }}>
                    {["Technician", "WOs Completed", "Avg Repair Hours", ""].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.techEfficiency.map((tech) => {
                    const maxWOs = Math.max(...data.techEfficiency.map(t => t.wosCompleted), 1);
                    return (
                      <tr key={tech.techId} style={{ borderBottom: "1px solid var(--border, #f0f0f0)" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "var(--text, #333)" }}>{tech.techName}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: NAVY }}>{tech.wosCompleted}</td>
                        <td style={{ padding: "8px 10px" }}>{tech.avgRepairHours.toFixed(1)}h</td>
                        <td style={{ padding: "8px 10px", width: 120 }}>
                          <div style={{ height: 6, borderRadius: 3, background: "var(--border, #e8e8e8)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(tech.wosCompleted / maxWOs) * 100}%`, background: NAVY, borderRadius: 3, transition: "width 0.3s" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Claim Status Breakdown ───────────────────────────────────── */}
          {canSee.claimStatus && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                Claim Status Breakdown
              </h3>
              {data.claimStatusBreakdown.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {data.claimStatusBreakdown.map((s) => {
                    const pct = totalStatusCount > 0 ? (s.count / totalStatusCount) * 100 : 0;
                    return (
                      <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 140, fontSize: 12, color: "var(--text, #555)", textTransform: "capitalize" as const, flexShrink: 0 }}>{s.status.replace(/_/g, " ")}</div>
                        <div style={{ flex: 1, height: 8, background: "var(--border, #f0f0f0)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: NAVY, borderRadius: 4 }} />
                        </div>
                        <div style={{ width: 60, textAlign: "right" as const, fontSize: 12, fontWeight: 600, color: "var(--text, #333)" }}>{s.count}</div>
                        <div style={{ width: 40, textAlign: "right" as const, fontSize: 11, color: "var(--text-muted, #888)" }}>{pct.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Warranty Claim Rates ─────────────────────────────────────── */}
          {canSee.warrantyRates && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.warrantyRates")}
              </h3>
              {data.warrantyClaimRates.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>{t("analytics.noData")}</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border, #e8e8e8)" }}>
                      {["Make", "Model", "Year", "Claims Per Unit"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #888)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.warrantyClaimRates.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border, #f0f0f0)", background: r.claimsPerUnit > 2 ? "#fffbeb" : "transparent" }}>
                        <td style={{ padding: "8px 10px" }}>{r.make || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.model || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.year || "—"}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                          {r.claimsPerUnit.toFixed(2)}
                          {r.claimsPerUnit > 2 && <span style={{ marginLeft: 6, fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px" }}>High</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Parts Velocity ───────────────────────────────────────────── */}
          {canSee.partsVelocity && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: "0 0 12px" }}>
                {t("analytics.partsVelocity")}
              </h3>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const }}>
                <div style={{ background: "var(--bg-secondary, #f9fafb)", borderRadius: 8, padding: "14px 20px", textAlign: "center" as const }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: NAVY }}>{data.partsVelocity.avgDaysToReceive.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted, #888)", marginTop: 4 }}>Avg days to receive</div>
                </div>
                {data.partsVelocity.trend.length > 0 && (
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={data.partsVelocity.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f0f0f0)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(1)} days`, "Avg days"]} />
                        <Area type="monotone" dataKey="avgDays" stroke={GREEN} fill={`${GREEN}20`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Schedule Modal ────────────────────────────────────────────────── */}
      {scheduleOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setScheduleOpen(false); }}>
          <div style={{ background: "var(--bg-card, #fff)", borderRadius: 12, padding: "24px 28px", width: 480, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>{t("analytics.schedule")}</h2>
              <button onClick={() => setScheduleOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted, #888)" }}>×</button>
            </div>

            {/* Frequency */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text, #333)", display: "block", marginBottom: 8 }}>{t("analytics.frequency")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["daily", "weekly", "monthly"] as const).map((f) => (
                  <button key={f} onClick={() => setSchedFreq(f)} style={{ flex: 1, padding: "8px", borderRadius: 7, border: `1px solid ${schedFreq === f ? NAVY : "var(--border, #e8e8e8)"}`, background: schedFreq === f ? NAVY : "transparent", color: schedFreq === f ? "#fff" : "var(--text, #555)", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" as const }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Email recipients */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text, #333)", display: "block", marginBottom: 8 }}>{t("analytics.recipients")}</label>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 8 }}>
                {schedEmails.map((email) => (
                  <span key={email} style={{ background: "#e0e8ff", color: NAVY, borderRadius: 20, padding: "3px 10px 3px 12px", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    {email}
                    <button onClick={() => setSchedEmails(prev => prev.filter(e => e !== email))} style={{ background: "none", border: "none", cursor: "pointer", color: NAVY, fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
              <input
                type="email"
                value={schedEmailInput}
                onChange={e => setSchedEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="Enter email + press Enter"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border, #e8e8e8)", borderRadius: 7, fontSize: 12, fontFamily: "inherit", background: "var(--bg-card, #fff)", color: "var(--text, #333)", boxSizing: "border-box" as const, outline: "none" }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted, #999)", marginTop: 4 }}>Press Enter to add each email address</div>
            </div>

            {/* Sections */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text, #333)", display: "block", marginBottom: 8 }}>{t("analytics.sections")}</label>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {REPORT_SECTIONS.map((sec) => (
                  <label key={sec.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "var(--text, #333)" }}>
                    <input
                      type="checkbox"
                      checked={schedSections.includes(sec.key)}
                      onChange={() => setSchedSections(prev =>
                        prev.includes(sec.key) ? prev.filter(s => s !== sec.key) : [...prev, sec.key]
                      )}
                      style={{ accentColor: NAVY }}
                    />
                    {sec.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="sched-active" checked={schedActive} onChange={e => setSchedActive(e.target.checked)} style={{ accentColor: NAVY }} />
              <label htmlFor="sched-active" style={{ fontSize: 12, color: "var(--text, #333)", cursor: "pointer" }}>Schedule is active</label>
            </div>

            {schedMsg && (
              <div style={{ marginBottom: 12, padding: "8px 12px", background: schedMsg.includes("Failed") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${schedMsg.includes("Failed") ? "#fecaca" : "#bbf7d0"}`, borderRadius: 6, fontSize: 12, color: schedMsg.includes("Failed") ? "#b91c1c" : "#15803d" }}>
                {schedMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={saveSchedule}
                disabled={schedSaving}
                style={{ flex: 1, padding: "10px", background: schedSaving ? "#e5e7eb" : NAVY, color: schedSaving ? "#9ca3af" : "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: schedSaving ? "default" : "pointer", fontFamily: "inherit" }}
              >
                {schedSaving ? "Saving…" : "Save Schedule"}
              </button>
              <button onClick={() => setScheduleOpen(false)} style={{ padding: "10px 16px", background: "none", border: "1px solid var(--border, #e8e8e8)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "var(--text, #555)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
