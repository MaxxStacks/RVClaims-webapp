// client/src/components/assist/AssistMessageList.tsx

import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: ChatMessage[];
  isTyping?: boolean;
  conversationId?: string;
  onFeedback?: (messageId: string, feedback: "up" | "down") => void;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<p style="font-weight:600;margin:8px 0 2px;font-size:13px">$1</p>')
    .replace(/^## (.+)$/gm, '<p style="font-weight:700;margin:8px 0 2px;font-size:14px">$1</p>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin:6px 0;padding-left:16px;list-style-type:disc">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:6px 0">')
    .replace(/\n/g, "<br/>");
}

function ThumbsButton({
  type,
  active,
  disabled,
  onClick,
}: {
  type: "up" | "down";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const isUp = type === "up";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isUp ? "Helpful" : "Not helpful"}
      style={{
        background: active ? (isUp ? "#dcfce7" : "#fee2e2") : "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "2px 4px",
        borderRadius: 4,
        opacity: disabled && !active ? 0.35 : 1,
        lineHeight: 1,
        fontSize: 13,
      }}
    >
      {isUp ? "👍" : "👎"}
    </button>
  );
}

export default function AssistMessageList({
  messages,
  isTyping = false,
  conversationId,
  onFeedback,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleFeedback = (messageId: string, vote: "up" | "down") => {
    if (feedbackState[messageId]) return; // already voted
    setFeedbackState((prev) => ({ ...prev, [messageId]: vote }));
    onFeedback?.(messageId, vote);
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            background: "#f0f4ff",
            borderLeft: "3px solid #033280",
            borderRadius: "0 8px 8px 0",
            padding: "12px 14px",
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.5,
            alignSelf: "flex-start",
            maxWidth: "88%",
          }}
        >
          <strong style={{ color: "#033280" }}>Hi, I'm DS360 Assist.</strong>
          <br />
          I can help you navigate the platform, answer questions about claims, units, billing, and more.
        </div>
      )}

      {messages.map((msg) =>
        msg.role === "user" ? (
          <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                background: "#f3f4f6",
                color: "#111827",
                borderRadius: "12px 12px 4px 12px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.5,
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
          </div>
        ) : (
          <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", flexDirection: "column", maxWidth: "88%", gap: 4 }}>
            <div
              style={{
                background: "#fff",
                borderLeft: "3px solid #033280",
                borderRadius: "0 8px 8px 0",
                padding: "10px 14px",
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.5,
                wordBreak: "break-word",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${renderMarkdown(msg.content)}</p>` }}
            />
            {/* Feedback buttons */}
            {conversationId && onFeedback && (
              <div style={{ display: "flex", gap: 2, paddingLeft: 6 }}>
                <ThumbsButton
                  type="up"
                  active={feedbackState[msg.id] === "up"}
                  disabled={!!feedbackState[msg.id]}
                  onClick={() => handleFeedback(msg.id, "up")}
                />
                <ThumbsButton
                  type="down"
                  active={feedbackState[msg.id] === "down"}
                  disabled={!!feedbackState[msg.id]}
                  onClick={() => handleFeedback(msg.id, "down")}
                />
              </div>
            )}
          </div>
        )
      )}

      {isTyping && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              background: "#fff",
              borderLeft: "3px solid #033280",
              borderRadius: "0 8px 8px 0",
              padding: "10px 14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 4, alignItems: "center", height: 16 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    background: "#033280",
                    borderRadius: "50%",
                    animation: `assistDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                    display: "inline-block",
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <style>{`
        @keyframes assistDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
