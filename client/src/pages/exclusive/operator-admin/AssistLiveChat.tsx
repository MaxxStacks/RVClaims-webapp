// client/src/pages/exclusive/operator-admin/AssistLiveChat.tsx
// Operator live chat dashboard — real-time assist sessions

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth, useUser } from "@clerk/clerk-react";

interface LiveSession {
  conversationId: string;
  dealerId: string;
  userName: string;
  summary: string;
  requestedAt: string;
  operatorUserId: string | null;
  operatorName: string | null;
}

interface LiveMessage {
  id: string;
  role: "user" | "operator" | "system";
  content: string;
  senderName?: string;
  sentAt?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AssistLiveChatPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [wsToken, setWsToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount + poll for new ones
  const loadSessions = useCallback(async () => {
    try {
      const data = await apiFetch<{ success: boolean; sessions: LiveSession[] }>(
        "/api/assist/escalate/live-sessions"
      );
      if (data.success) setSessions(data.sessions);
    } catch {}
  }, []);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  // Get WS token
  useEffect(() => {
    getToken().then(setWsToken).catch(() => {});
  }, [getToken]);

  // WS connection for real-time updates
  useEffect(() => {
    if (!wsToken) return;

    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws?token=${encodeURIComponent(wsToken)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "assist:live_chat_request") {
          setSessions((prev) => {
            const exists = prev.some((s) => s.conversationId === msg.payload.conversationId);
            if (exists) return prev;
            return [
              {
                conversationId: msg.payload.conversationId,
                dealerId: msg.payload.dealerId,
                userName: msg.payload.userName ?? "Dealer",
                summary: msg.payload.summary ?? "",
                requestedAt: msg.payload.requestedAt ?? new Date().toISOString(),
                operatorUserId: null,
                operatorName: null,
              },
              ...prev,
            ];
          });
        }

        if (msg.type === "assist:message" && activeSession && msg.payload?.conversationId === activeSession.conversationId) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: msg.payload.role,
              content: msg.payload.content,
              senderName: msg.payload.senderName,
              sentAt: msg.payload.sentAt,
            },
          ]);
        }

        if (msg.type === "assist:session-closed" && activeSession && msg.payload?.conversationId === activeSession.conversationId) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "system", content: "Session ended by dealer.", sentAt: new Date().toISOString() },
          ]);
          setSessions((prev) => prev.filter((s) => s.conversationId !== msg.payload.conversationId));
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [wsToken, activeSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinSession = useCallback(
    (session: LiveSession) => {
      setActiveSession(session);
      setMessages([
        { id: "info", role: "system", content: `You joined ${session.userName}'s live chat session.`, sentAt: new Date().toISOString() },
        ...(session.summary ? [{ id: "summary", role: "system" as const, content: `Context: ${session.summary}`, sentAt: new Date().toISOString() }] : []),
      ]);

      // Join the WS room and announce join
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "assist:operator-join",
            payload: {
              conversationId: session.conversationId,
              operatorName: user?.fullName ?? user?.firstName ?? "Support Agent",
            },
          })
        );
        wsRef.current.send(
          JSON.stringify({ type: "assist:join-room", payload: { conversationId: session.conversationId } })
        );
      }
    },
    [user]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !activeSession) return;

    const senderName = user?.fullName ?? user?.firstName ?? "Support Agent";
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "operator", content: text, senderName, sentAt: new Date().toISOString() },
    ]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "assist:message",
          payload: {
            conversationId: activeSession.conversationId,
            content: text,
            senderName,
            role: "operator",
          },
        })
      );
    }
    setInput("");
  }, [input, activeSession, user]);

  const handleClose = useCallback(() => {
    if (!activeSession) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "assist:close", payload: { conversationId: activeSession.conversationId } })
      );
    }
    setSessions((prev) => prev.filter((s) => s.conversationId !== activeSession.conversationId));
    setActiveSession(null);
    setMessages([]);
  }, [activeSession]);

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "Inter, sans-serif" }}>
      {/* Left panel — session list */}
      <div
        style={{
          width: 280,
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Live Chat Sessions
          </h2>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
            {sessions.length} active request{sessions.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {sessions.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
              No active live chat requests.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.conversationId}
                onClick={() => joinSession(session)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  background:
                    activeSession?.conversationId === session.conversationId ? "#f0f4ff" : "#fff",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (activeSession?.conversationId !== session.conversationId)
                    (e.currentTarget as HTMLDivElement).style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (activeSession?.conversationId !== session.conversationId)
                    (e.currentTarget as HTMLDivElement).style.background = "#fff";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {session.userName}
                    </div>
                    {session.summary && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.summary}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                      {timeAgo(session.requestedAt)}
                      {session.operatorName && (
                        <span style={{ marginLeft: 6, color: "#16a34a" }}>
                          · {session.operatorName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: session.operatorUserId ? "#16a34a" : "#f59e0b",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel — chat view */}
      {activeSession ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                {activeSession.userName}
              </div>
              {activeSession.summary && (
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1, maxWidth: 400 }}>
                  {activeSession.summary}
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close Session
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
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
                    fontStyle: "italic",
                  }}
                >
                  {msg.content}
                </div>
              ) : msg.role === "operator" ? (
                <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      background: "#033280",
                      color: "#fff",
                      borderRadius: "12px 12px 4px 12px",
                      padding: "9px 14px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      maxWidth: "75%",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    maxWidth: "75%",
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 4 }}>
                    {msg.senderName ?? activeSession.userName}
                  </span>
                  <div
                    style={{
                      background: "#f3f4f6",
                      color: "#111827",
                      borderRadius: "12px 12px 12px 4px",
                      padding: "9px 14px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
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
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Reply to dealer…"
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                fontFamily: "Inter, sans-serif",
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
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: input.trim() ? "pointer" : "default",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#9ca3af",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
            Select a session to join
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            New requests appear automatically
          </div>
        </div>
      )}
    </div>
  );
}
