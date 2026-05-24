// client/src/pages/exclusive/operator-admin/AssistAnalytics.tsx
// DS360 Assist — comprehensive analytics dashboard (operator only)

import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { useLocation } from "wouter";

// ── Types ──────────────────────────────────────────────────────────────────

interface StatValue { value: number | null; change?: number | null }

interface AnalyticsData {
  period: string;
  days: number;
  overview: {
    totalConversations: StatValue;
    totalMessages: StatValue;
    uniqueDealers: StatValue;
    resolutionRate: StatValue;
    escalationRate: StatValue;
    avgSatisfaction: StatValue;
    openTickets: StatValue;
  };
  escalationBreakdown: {
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  };
  dailyConversations: { date: string; count: number }[];
  knowledgeGaps: {
    id: string;
    question: string;
    frequency: number;
    status: string;
    kbArticleId: string | null;
    autoDetected: boolean;
  }[];
  dealerActivity: {
    dealerId: string;
    dealerName: string;
    conversations: number;
    escalations: number;
    avgSatisfaction: number | null;
  }[];
  heatmap: number[][];
  remoteSupport: {
    totalSessions: number;
    avgDurationMs: number | null;
    takeoverRate: number;
  };
}

// ── Constants ──────────────────────────────────────────────────────────────

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PIE_COLORS = [NAVY, GREEN, "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];
const DAYS_OPTS = [7, 30, 90] as const;
const DAYS_LABELS: Record<number, string> = { 7: "Last 7 days", 30: "Last 30 days", 90: "Last 90 days" };
const ESCALATION_LABELS: Record<string, string> = {
  ticket: "Support Ticket", live_chat: "Live Chat",
  email_am: "Email AM", screen_share: "Screen Share", contact: "Direct Contact",
};
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, change, color,
}: {
  label: string; value: string | number; sub?: string; change?: number | null; color?: string;
}) {
  const hasChange = change !== null && change !== undefined;
  const isPositive = (change ?? 0) >= 0;

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: color ?? "#111827", fontFamily: "Inter, sans-serif", lineHeight: 1.1 }}>
          {value}
        </span>
        {hasChange && (
          <span style={{ fontSize: 12, fontWeight: 600, color: isPositive ? "#16a34a" : "#b91c1c", fontFamily: "Inter, sans-serif" }}>
            {isPositive ? "↑" : "↓"}{Math.abs(change!)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", fontFamily: "Inter, sans-serif", marginBottom: 12, marginTop: 28 }}>
      {children}
    </div>
  );
}

// ── Heatmap ────────────────────────────────────────────────────────────────

function Heatmap({ matrix }: { matrix: number[][] }) {
  const maxVal = Math.max(1, ...matrix.flat());
  const [tooltip, setTooltip] = useState<{ dow: number; hour: number; count: number } | null>(null);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {/* DOW labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 20 }}>
          {DOW_LABELS.map((d) => (
            <div key={d} style={{ height: 16, fontSize: 10, color: "#9ca3af", fontFamily: "Inter, sans-serif", lineHeight: "16px", width: 28 }}>
              {d}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div>
          {/* Hour labels */}
          <div style={{ display: "flex", gap: 2, marginBottom: 2, paddingLeft: 2 }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ width: 16, fontSize: 8, color: "#9ca3af", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
                {h % 6 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {matrix.map((row, dow) => (
            <div key={dow} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              {row.map((count, hour) => {
                const intensity = count / maxVal;
                return (
                  <div
                    key={hour}
                    title={`${DOW_LABELS[dow]} ${String(hour).padStart(2, "0")}:00 — ${count} messages`}
                    onMouseEnter={() => setTooltip({ dow, hour, count })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: 16, height: 16, borderRadius: 2,
                      background: count === 0
                        ? "#f3f4f6"
                        : `rgba(3, 50, 128, ${0.1 + intensity * 0.9})`,
                      cursor: "default",
                      transition: "opacity 0.1s",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div style={{
          fontSize: 11, color: "#374151", marginTop: 6, fontFamily: "Inter, sans-serif",
          background: "#f9fafb", display: "inline-block", padding: "3px 8px", borderRadius: 5,
          border: "1px solid #e5e7eb",
        }}>
          {DOW_LABELS[tooltip.dow]} {String(tooltip.hour).padStart(2, "0")}:00 — <strong>{tooltip.count}</strong> messages
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AssistAnalyticsPage() {
  const [, navigate] = useLocation();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AnalyticsData & { success: boolean }>(`/api/assist/analytics?days=${d}`);
      if (res.success) setData(res);
      else setError("Failed to load analytics.");
    } catch {
      setError("Failed to load analytics.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const handleDismissGap = useCallback(async (id: string) => {
    setDismissingId(id);
    try {
      await apiFetch(`/api/assist/analytics/gaps/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "dismissed" }),
      });
      setData((prev) =>
        prev ? { ...prev, knowledgeGaps: prev.knowledgeGaps.filter((g) => g.id !== id) } : prev
      );
    } catch {}
    setDismissingId(null);
  }, []);

  const handleCreateArticle = useCallback((question: string) => {
    navigate(`/operator/admin/assist-kb/new?title=${encodeURIComponent(question)}`);
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#9ca3af", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#b91c1c", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
        {error ?? "No data available."}
      </div>
    );
  }

  const { overview, escalationBreakdown, dailyConversations, knowledgeGaps, dealerActivity, heatmap, remoteSupport } = data;

  const escalationPieData = Object.entries(escalationBreakdown.byType).map(([type, count]) => ({
    name: ESCALATION_LABELS[type] ?? type,
    value: count,
  }));

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A";
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>DS360 Assist Analytics</h1>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>AI agent performance and engagement metrics</div>
        </div>
        {/* Date range selector */}
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
          {DAYS_OPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "none",
                background: days === d ? "#fff" : "transparent",
                color: days === d ? "#111827" : "#6b7280",
                fontSize: 12, fontWeight: days === d ? 600 : 400,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: days === d ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {DAYS_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12, marginBottom: 4 }}>
        <StatCard
          label="Conversations"
          value={overview.totalConversations.value ?? 0}
          change={overview.totalConversations.change}
          sub="Total sessions"
        />
        <StatCard
          label="Resolution Rate"
          value={`${overview.resolutionRate.value ?? 0}%`}
          change={overview.resolutionRate.change}
          sub="Resolved by AI"
          color={GREEN}
        />
        <StatCard
          label="Avg Satisfaction"
          value={overview.avgSatisfaction.value ? `${overview.avgSatisfaction.value}/5` : "N/A"}
          sub={overview.avgSatisfaction.value ? "★".repeat(Math.round(overview.avgSatisfaction.value ?? 0)) : "No ratings"}
        />
        <StatCard
          label="Escalation Rate"
          value={`${overview.escalationRate.value ?? 0}%`}
          change={overview.escalationRate.change}
          sub="Needed human help"
        />
        <StatCard
          label="Total Messages"
          value={overview.totalMessages.value ?? 0}
          change={overview.totalMessages.change}
          sub="All roles"
        />
        <StatCard
          label="Open Tickets"
          value={overview.openTickets.value ?? 0}
          sub="Awaiting resolution"
        />
      </div>

      {/* Row 2: Charts */}
      <SectionTitle>Trends & Escalations</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
        {/* Escalation pie */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Escalation Breakdown</div>
          {escalationPieData.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No escalations in this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={escalationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {escalationPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip formatter={(v: number, n: string) => [v, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conversations over time */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Conversations per Day</div>
          {dailyConversations.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No data for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyConversations} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 9 }} width={28} />
                <RTooltip />
                <Line type="monotone" dataKey="count" stroke={NAVY} strokeWidth={2} dot={false} name="Conversations" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Heatmap */}
      <SectionTitle>Message Volume Heatmap (by Hour & Day)</SectionTitle>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 4, overflowX: "auto" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif", marginBottom: 12 }}>
          Color intensity = message volume. Hover for exact count.
        </div>
        <Heatmap matrix={heatmap} />
      </div>

      {/* Row 4: Knowledge Gaps + Dealer Activity */}
      <SectionTitle>Knowledge Gaps & Dealer Activity</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
        {/* Knowledge gaps */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Top Knowledge Gaps
          </div>
          {knowledgeGaps.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>No knowledge gaps detected.</div>
          ) : (
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {knowledgeGaps.map((gap) => (
                <div key={gap.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f9fafb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.4, marginBottom: 4 }}>
                        {gap.question.length > 90 ? gap.question.slice(0, 87) + "…" : gap.question}
                      </div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>
                        Asked {gap.frequency}× · {gap.status}
                        {gap.autoDetected && <span style={{ marginLeft: 4, color: "#6b7280" }}>· AI</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => handleCreateArticle(gap.question)}
                        style={{
                          fontSize: 10, padding: "3px 7px", borderRadius: 4,
                          background: "#eff6ff", color: "#1d4ed8",
                          border: "1px solid #bfdbfe", cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        + Article
                      </button>
                      <button
                        onClick={() => handleDismissGap(gap.id)}
                        disabled={dismissingId === gap.id}
                        style={{
                          fontSize: 10, padding: "3px 7px", borderRadius: 4,
                          background: "#f9fafb", color: "#6b7280",
                          border: "1px solid #e5e7eb", cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dealer activity */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Top Dealers by Activity
          </div>
          {dealerActivity.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>No dealer activity yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Dealer", "Convos", "Escalations", "Satisfaction"].map((h) => (
                    <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dealerActivity.map((d) => (
                  <tr key={d.dealerId} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#374151" }}>
                      {d.dealerName.length > 22 ? d.dealerName.slice(0, 19) + "…" : d.dealerName}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#374151" }}>{d.conversations}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: d.escalations > 0 ? "#f59e0b" : "#9ca3af" }}>
                      {d.escalations}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#374151" }}>
                      {d.avgSatisfaction ? `${d.avgSatisfaction}/5` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Row 5: Remote Support */}
      <SectionTitle>Remote Support</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Remote Sessions" value={remoteSupport.totalSessions} sub="Total screen share sessions" />
        <StatCard label="Avg Duration" value={formatDuration(remoteSupport.avgDurationMs)} sub="Connected time" />
        <StatCard label="Takeover Rate" value={`${remoteSupport.takeoverRate}%`} sub="Sessions with remote control" />
      </div>
    </div>
  );
}
