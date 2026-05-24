// client/src/pages/exclusive/operator-admin/AssistAnalytics.tsx
// DS360 Assist analytics dashboard (operator only)

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AnalyticsData {
  period: string;
  conversations: {
    total: number;
    avgMessagesPerConversation: number;
    escalated: number;
    resolved: number;
    resolutionRate: string;
    thumbsUp: number;
    thumbsDown: number;
  };
  tickets: { total: number; open: number };
  knowledgeGaps: {
    total: number;
    new: number;
    topGaps: { question: string; frequency: number; autoDetected: boolean }[];
  };
  escalationBreakdown: { type: string; count: number }[];
}

const ESCALATION_LABELS: Record<string, string> = {
  ticket: "Support Ticket",
  live_chat: "Live Chat",
  email_am: "Email Account Manager",
  screen_share: "Screen Share",
  contact: "Direct Contact",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", fontFamily: "Inter, sans-serif", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{sub}</div>}
    </div>
  );
}

export default function AssistAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ success: boolean } & AnalyticsData>("/api/assist/analytics")
      .then((res) => {
        if (res.success) setData(res);
        else setError("Failed to load analytics.");
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

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

  const satisfaction =
    data.conversations.thumbsUp + data.conversations.thumbsDown > 0
      ? Math.round(
          (data.conversations.thumbsUp /
            (data.conversations.thumbsUp + data.conversations.thumbsDown)) *
            100
        ) + "%"
      : "N/A";

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>DS360 Assist Analytics</h1>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Last 30 days</div>
      </div>

      {/* Top stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Conversations" value={data.conversations.total} sub="Total sessions" />
        <StatCard label="Avg Messages" value={data.conversations.avgMessagesPerConversation} sub="Per conversation" />
        <StatCard label="Resolution Rate" value={data.conversations.resolutionRate} sub={`${data.conversations.resolved} resolved`} />
        <StatCard label="Escalated" value={data.conversations.escalated} sub="Required human help" />
        <StatCard label="Satisfaction" value={satisfaction} sub={`👍 ${data.conversations.thumbsUp} / 👎 ${data.conversations.thumbsDown}`} />
        <StatCard label="Open Tickets" value={data.tickets.open} sub={`${data.tickets.total} total`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Knowledge Gaps */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
            Top Knowledge Gaps
            {data.knowledgeGaps.new > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, background: "#fee2e2", color: "#b91c1c", padding: "2px 7px", borderRadius: 10 }}>
                {data.knowledgeGaps.new} new
              </span>
            )}
          </div>
          {data.knowledgeGaps.topGaps.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>No knowledge gaps yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.knowledgeGaps.topGaps.map((gap, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, fontSize: 12, color: "#374151", lineHeight: 1.4 }}>
                    {gap.question.length > 80 ? gap.question.slice(0, 77) + "…" : gap.question}
                    {gap.autoDetected && (
                      <span style={{ marginLeft: 4, fontSize: 9, color: "#9ca3af", background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>AI</span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", flexShrink: 0 }}>×{gap.frequency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escalation Breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
            Escalation Breakdown
          </div>
          {data.escalationBreakdown.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>No escalations in this period.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.escalationBreakdown.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#374151" }}>
                    {ESCALATION_LABELS[item.type] ?? item.type}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: Math.min(item.count * 8, 80),
                        height: 6,
                        background: "#033280",
                        borderRadius: 3,
                        opacity: 0.7,
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", minWidth: 20, textAlign: "right" }}>
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
