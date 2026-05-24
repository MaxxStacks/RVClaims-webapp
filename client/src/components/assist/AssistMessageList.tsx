// client/src/components/assist/AssistMessageList.tsx

import { useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: ChatMessage[];
  isTyping?: boolean;
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

export default function AssistMessageList({ messages, isTyping = false }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["How do I file a claim?", "What does PDI mean?", "Talk to support"].map((q) => (
              <span
                key={q}
                style={{
                  background: "#033280",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: 12,
                  fontSize: 11,
                  cursor: "pointer",
                  opacity: 0.85,
                }}
              >
                {q}
              </span>
            ))}
          </div>
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
          <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                background: "#fff",
                borderLeft: "3px solid #033280",
                borderRadius: "0 8px 8px 0",
                padding: "10px 14px",
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.5,
                maxWidth: "88%",
                wordBreak: "break-word",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${renderMarkdown(msg.content)}</p>` }}
            />
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
