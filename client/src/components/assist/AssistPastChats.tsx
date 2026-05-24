// client/src/components/assist/AssistPastChats.tsx — Past conversation history list

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ConversationSummary {
  id: string;
  status: string;
  messageCount: number;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  onContinue: (conversationId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#16a34a",
  resolved: "#6b7280",
  escalated: "#d97706",
  expired: "#9ca3af",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 30 * 60 * 1000;
}

export default function AssistPastChats({ onContinue }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ success: boolean; conversations: ConversationSummary[] }>(
      "/api/assist/conversations?limit=20"
    )
      .then((data) => {
        if (data.success) setConversations(data.conversations);
        else setError("Failed to load conversations.");
      })
      .catch(() => setError("Could not load conversation history."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
        Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#b91c1c", fontSize: 13, fontFamily: "Inter, sans-serif", padding: 24, textAlign: "center" }}>
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13, fontFamily: "Inter, sans-serif", gap: 8 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        No past conversations yet.
        <span>Start a new chat to get help.</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
      {conversations.map((convo) => {
        const canContinue = convo.status === "active" && isRecent(convo.updatedAt);
        const statusColor = STATUS_COLORS[convo.status] ?? "#6b7280";

        return (
          <div
            key={convo.id}
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#111827",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {convo.preview}
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>
                    {timeAgo(convo.updatedAt)} · {convo.messageCount} msg{convo.messageCount !== 1 ? "s" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: statusColor,
                      background: `${statusColor}18`,
                      padding: "1px 6px",
                      borderRadius: 10,
                      fontFamily: "Inter, sans-serif",
                      textTransform: "capitalize",
                    }}
                  >
                    {convo.status}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(convo.id);
                }}
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  background: canContinue ? "#033280" : "none",
                  color: canContinue ? "#fff" : "#6b7280",
                  border: canContinue ? "none" : "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {canContinue ? "Resume" : "View"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
