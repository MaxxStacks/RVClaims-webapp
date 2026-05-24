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
  onStarterSelect?: (text: string) => void;
}

// Inline SVGs for starter cards
const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconHelp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// DS360 avatar for assistant messages
const AssistAvatar = () => (
  <div style={{
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#033280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  </div>
);

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code style="background:#F3F5F8;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>'
    )
    .replace(/^### (.+)$/gm, '<p style="font-weight:600;margin:10px 0 3px;font-size:13px;color:#033280">$1</p>')
    .replace(/^## (.+)$/gm, '<p style="font-weight:700;margin:10px 0 4px;font-size:14px;color:#033280">$1</p>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px;color:#374151">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, '<ul style="margin:6px 0;padding-left:18px;list-style-type:disc">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:8px 0">')
    .replace(/\n/g, "<br/>");
}

const STARTERS = [
  { icon: <IconBox />, text: "Create a new unit" },
  { icon: <IconFile />, text: "File a warranty claim" },
  { icon: <IconHelp />, text: "Talk to support" },
];

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
  const activeColor = isUp ? "#dcfce7" : "#fee2e2";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isUp ? "Helpful" : "Not helpful"}
      style={{
        background: active ? activeColor : "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "2px 5px",
        borderRadius: 4,
        opacity: disabled && !active ? 0.3 : 1,
        lineHeight: 1,
        fontSize: 12,
        transition: "opacity 150ms, background 150ms",
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
  onStarterSelect,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleFeedback = (messageId: string, vote: "up" | "down") => {
    if (feedbackState[messageId]) return;
    setFeedbackState((prev) => ({ ...prev, [messageId]: vote }));
    onFeedback?.(messageId, vote);
  };

  return (
    <div
      className="assist-messages"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "#F8F9FB",
      }}
    >
      <style>{`
        /* Custom scrollbar */
        .assist-messages::-webkit-scrollbar { width: 6px; }
        .assist-messages::-webkit-scrollbar-track { background: transparent; }
        .assist-messages::-webkit-scrollbar-thumb {
          background: #C5D0E8;
          border-radius: 3px;
        }
        .assist-messages::-webkit-scrollbar-thumb:hover { background: #9BB0D4; }
        .assist-messages { scrollbar-width: thin; scrollbar-color: #C5D0E8 transparent; }

        /* Starter cards */
        .assist-starter-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid #E8ECF1;
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: border-color 150ms ease, background 150ms ease, transform 100ms ease;
          font-family: Inter, sans-serif;
        }
        .assist-starter-card:hover {
          border-color: #033280;
          background: #F0F4FF;
          transform: translateY(-1px);
        }
        .assist-starter-card:active {
          transform: translateY(0);
        }

        /* Message slide-in */
        .assist-msg-in {
          animation: assistMsgSlideIn 200ms ease-out both;
        }
        @keyframes assistMsgSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Typing dots */
        @keyframes assistDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .assist-starter-card { transition: none; }
          .assist-starter-card:hover { transform: none; }
          .assist-msg-in { animation: none; }
        }
      `}</style>

      {/* Welcome state */}
      {messages.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 4px 8px", gap: 16 }}>
          {/* DS360 icon */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#1F2937", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
              How can I help you today?
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
              Ask me anything about the platform.
            </div>
          </div>

          {/* Starter cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {STARTERS.map(({ icon, text }) => (
              <button
                key={text}
                className="assist-starter-card"
                onClick={() => onStarterSelect?.(text)}
              >
                <span style={{ flexShrink: 0, color: "#033280" }}>{icon}</span>
                <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) =>
        msg.role === "user" ? (
          <div key={msg.id} className="assist-msg-in" style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              background: "#033280",
              color: "#FFFFFF",
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 16px",
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: "80%",
              wordBreak: "break-word",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 8px rgba(3, 50, 128, 0.15)",
            }}>
              {msg.content}
            </div>
          </div>
        ) : (
          <div key={msg.id} className="assist-msg-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, maxWidth: "85%" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              {/* Avatar only on first assistant message in a sequence */}
              {(i === 0 || messages[i - 1]?.role !== "assistant") ? (
                <AssistAvatar />
              ) : (
                <div style={{ width: 24, flexShrink: 0 }} />
              )}
              <div style={{
                background: "#FFFFFF",
                color: "#1F2937",
                borderRadius: "16px 16px 16px 4px",
                padding: "12px 16px",
                fontSize: 14,
                lineHeight: 1.6,
                wordBreak: "break-word",
                border: "1px solid #E8ECF1",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                fontFamily: "Inter, sans-serif",
              }}
                dangerouslySetInnerHTML={{ __html: `<span>${renderMarkdown(msg.content)}</span>` }}
              />
            </div>

            {/* Feedback buttons */}
            {conversationId && onFeedback && (
              <div style={{ display: "flex", gap: 2, paddingLeft: 32 }}>
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

      {/* Typing indicator */}
      {isTyping && (
        <div className="assist-msg-in" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <AssistAvatar />
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF1",
            borderRadius: "16px 16px 16px 4px",
            padding: "12px 16px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 44,
          }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  background: "#033280",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: `assistDotBounce 600ms ${i * 150}ms infinite ease-in-out`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
