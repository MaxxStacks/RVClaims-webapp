// client/src/components/assist/AssistPanel.tsx

import { useState, useCallback } from "react";
import AssistMessageList, { type ChatMessage } from "./AssistMessageList";
import AssistInput from "./AssistInput";
import { apiFetch } from "@/lib/api";

interface Props {
  onClose: () => void;
}

interface MessageApiResponse {
  success: boolean;
  conversationId: string;
  response: string;
  sources: unknown[];
}

export default function AssistPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(async (text: string) => {
    if (isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const data = await apiFetch<MessageApiResponse>("/api/assist/message", {
        method: "POST",
        body: JSON.stringify({ message: text, conversationId }),
      });

      if (data.success) {
        if (!conversationId) setConversationId(data.conversationId);
        const assistMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
        };
        setMessages((prev) => [...prev, assistMsg]);
      } else {
        setError("Failed to get a response. Please try again.");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      if (e?.message?.includes("401") || e?.message?.includes("Session expired")) {
        setError("Please log in to use DS360 Assist.");
      } else {
        setError("Connection error. Please check your network and try again.");
      }
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, conversationId]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 84,
        right: 24,
        width: 400,
        height: 580,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(3,50,128,0.18), 0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        overflow: "hidden",
        animation: "assistSlideUp 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#033280",
          color: "#fff",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif" }}>DS360 Assist</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontFamily: "Inter, sans-serif" }}>AI Support Agent</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 12,
            padding: "8px 14px",
            borderBottom: "1px solid #fecaca",
            flexShrink: 0,
          }}
        >
          {error}
        </div>
      )}

      {/* Message list */}
      <AssistMessageList messages={messages} isTyping={isTyping} />

      {/* Input */}
      <AssistInput onSend={handleSend} disabled={isTyping} />

      <style>{`
        @keyframes assistSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
