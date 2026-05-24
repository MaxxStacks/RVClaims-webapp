// client/src/components/assist/AssistLiveChat.tsx — Dealer-side live chat UI

import { useState, useEffect, useRef, useCallback } from "react";

interface LiveMessage {
  id: string;
  role: "user" | "operator" | "system";
  content: string;
  senderName?: string;
  sentAt?: string;
}

interface Props {
  conversationId: string;
  userName: string;
  wsToken: string | null;
  onEnd: () => void;
}

function useAssistWS(token: string | null, conversationId: string, onMessage: (msg: LiveMessage) => void, onOperatorJoined: (name: string) => void, onClose: () => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "assist:join-room", payload: { conversationId } }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "assist:message" && msg.payload?.conversationId === conversationId) {
          onMessage({
            id: crypto.randomUUID(),
            role: msg.payload.role,
            content: msg.payload.content,
            senderName: msg.payload.senderName,
            sentAt: msg.payload.sentAt,
          });
        }
        if (msg.type === "assist:operator-joined") {
          onOperatorJoined(msg.payload?.operatorName ?? "Support Agent");
        }
        if (msg.type === "assist:session-closed") {
          onClose();
        }
      } catch {}
    };

    ws.onclose = () => {};

    return () => {
      ws.send(JSON.stringify({ type: "assist:leave-room", payload: { conversationId } }));
      ws.close();
    };
  }, [token, conversationId]);

  const sendMessage = useCallback(
    (content: string, senderName: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "assist:message",
            payload: { conversationId, content, senderName, role: "user" },
          })
        );
      }
    },
    [conversationId]
  );

  const closeSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "assist:close", payload: { conversationId } }));
    }
  }, [conversationId]);

  return { sendMessage, closeSession };
}

export default function AssistLiveChat({ conversationId, userName, wsToken, onEnd }: Props) {
  const [messages, setMessages] = useState<LiveMessage[]>([
    {
      id: "init",
      role: "system",
      content: "Connecting you to live support. A support agent will join shortly.",
      sentAt: new Date().toISOString(),
    },
  ]);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleIncoming = useCallback((msg: LiveMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleOperatorJoined = useCallback((name: string) => {
    setOperatorName(name);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: `${name} has joined the chat.`,
        sentAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSessionClosed = useCallback(() => {
    setEnded(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: "The live chat session has ended.",
        sentAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const { sendMessage, closeSession } = useAssistWS(
    wsToken,
    conversationId,
    handleIncoming,
    handleOperatorJoined,
    handleSessionClosed
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || ended) return;
    // Optimistically add to local messages
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        senderName: userName,
        sentAt: new Date().toISOString(),
      },
    ]);
    sendMessage(text, userName);
    setInput("");
  };

  const handleEnd = () => {
    closeSession();
    setEnded(true);
    onEnd();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Live chat header */}
      <div
        style={{
          background: operatorName ? "#f0fdf4" : "#fffbeb",
          borderBottom: `1px solid ${operatorName ? "#bbf7d0" : "#fde68a"}`,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif" }}>
            {operatorName ? "🟢" : "🟡"}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: operatorName ? "#15803d" : "#92400e",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {operatorName ? `Connected with ${operatorName}` : "Waiting for support agent…"}
          </span>
        </div>
        {!ended && (
          <button
            onClick={handleEnd}
            style={{
              fontSize: 11,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 5,
              padding: "3px 8px",
              cursor: "pointer",
              color: "#6b7280",
              fontFamily: "Inter, sans-serif",
            }}
          >
            End Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((msg) =>
          msg.role === "system" ? (
            <div
              key={msg.id}
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "Inter, sans-serif",
                fontStyle: "italic",
              }}
            >
              {msg.content}
            </div>
          ) : msg.role === "user" ? (
            <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  background: "#f3f4f6",
                  color: "#111827",
                  borderRadius: "12px 12px 4px 12px",
                  padding: "9px 13px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  maxWidth: "80%",
                  wordBreak: "break-word",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", flexDirection: "column", maxWidth: "85%", gap: 3 }}>
              <span
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontFamily: "Inter, sans-serif",
                  marginLeft: 4,
                }}
              >
                {msg.senderName ?? "Support Agent"}
              </span>
              <div
                style={{
                  background: "#fff",
                  borderLeft: "3px solid #16a34a",
                  borderRadius: "0 8px 8px 0",
                  padding: "9px 13px",
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {msg.content}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!ended ? (
        <div
          style={{
            padding: "8px 10px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? "#033280" : "#e5e7eb",
              color: input.trim() ? "#fff" : "#9ca3af",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: input.trim() ? "pointer" : "default",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      ) : (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
          <button
            onClick={onEnd}
            style={{
              width: "100%",
              background: "#033280",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "9px 0",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            Back to Chat
          </button>
        </div>
      )}
    </div>
  );
}
