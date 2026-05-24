// client/src/components/assist/AssistPanel.tsx

import { useState, useCallback, useEffect, useRef } from "react";
import AssistMessageList, { type ChatMessage } from "./AssistMessageList";
import AssistInput from "./AssistInput";
import AssistQuickReplies from "./AssistQuickReplies";
import AssistWorkflow from "./AssistWorkflow";
import AssistPastChats from "./AssistPastChats";
import AssistEscalation, { type EscalationType } from "./AssistEscalation";
import TicketForm from "./TicketForm";
import AccountManagerCard from "./AccountManagerCard";
import AssistLiveChat from "./AssistLiveChat";
import ScreenShareGenerator from "@/components/remote-support/ScreenShareGenerator";
import ScreenShareActive from "@/components/remote-support/ScreenShareActive";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";

interface Props {
  onClose: () => void;
}

interface WorkflowStepDef {
  stepNumber: number;
  totalSteps: number;
  title: string;
  instruction: string;
  inputType: "text" | "select" | "multi-select" | "photo" | "confirm" | "none";
  inputLabel?: string;
  options?: string[];
  fieldKey: string;
}

interface MessageApiResponse {
  success: boolean;
  conversationId: string;
  response: string;
  quickReplies?: string[];
  escalate?: boolean;
  messageId?: string;
  workflowStep?: WorkflowStepDef;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AccountManager {
  name: string;
  email: string;
  phone?: string | null;
}

type Tab = "chat" | "past";
type EscalationView = "menu" | "ticket" | "am" | "live" | "screen_gen" | "screen_active" | null;

const THIRTY_MINUTES = 30 * 60 * 1000;

export default function AssistPanel({ onClose }: Props) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<WorkflowStepDef | null>(null);

  // Escalation state
  const [escalationView, setEscalationView] = useState<EscalationView>(null);
  const [accountManager, setAccountManager] = useState<AccountManager | null>(null);
  const [amLoading, setAmLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null); // ticket number
  const [liveSummary, setLiveSummary] = useState<string>("");
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [screenSessionId, setScreenSessionId] = useState<string | null>(null);
  const [proactiveSuggestion, setProactiveSuggestion] = useState<{ text: string; quickReplies: string[] } | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);
  const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch proactive suggestion on open (once per session)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("assist_proactive_dismissed");
    if (dismissed) return;
    const params = new URLSearchParams({
      page: window.location.pathname,
    });
    apiFetch<{ success: boolean; suggestion: { text: string; quickReplies: string[] } | null }>(
      `/api/assist/proactive?${params.toString()}`
    )
      .then((res) => {
        if (res.success && res.suggestion) {
          setProactiveSuggestion(res.suggestion);
        }
      })
      .catch(() => {});
  }, []);

  // Restore active conversation on open (< 30 min idle)
  useEffect(() => {
    const saved = sessionStorage.getItem("assist_convo_id");
    const savedAt = sessionStorage.getItem("assist_convo_at");
    if (saved && savedAt && Date.now() - parseInt(savedAt, 10) < THIRTY_MINUTES) {
      setConversationId(saved);
      apiFetch<{ success: boolean; conversation: unknown; messages: ConversationMessage[] }>(
        `/api/assist/conversations/${saved}`
      )
        .then((data) => {
          if (data.success && data.messages.length > 0) {
            setMessages(
              data.messages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                  id: m.id,
                  role: m.role as "user" | "assistant",
                  content: m.content,
                }))
            );
          }
        })
        .catch(() => {
          sessionStorage.removeItem("assist_convo_id");
          sessionStorage.removeItem("assist_convo_at");
          setConversationId(undefined);
        });
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      sessionStorage.setItem("assist_convo_id", conversationId);
      sessionStorage.setItem("assist_convo_at", String(Date.now()));
    }
  }, [conversationId]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setQuickReplies([]);
    setActiveWorkflowStep(null);
    setError(null);
    setEscalationView(null);
    setTicketSuccess(null);
    setLiveSummary("");
    setScreenSessionId(null);
    sessionStorage.removeItem("assist_convo_id");
    sessionStorage.removeItem("assist_convo_at");
    setTab("chat");
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (isTyping) return;

      // Clear escalation UI when user sends a new message
      setEscalationView(null);
      setTicketSuccess(null);
      setQuickReplies([]);

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
          body: JSON.stringify({
            message: text,
            conversationId,
            currentPage: window.location.pathname,
          }),
        });

        if (data.success) {
          if (!conversationId) setConversationId(data.conversationId);

          const assistMsg: ChatMessage = {
            id: data.messageId ?? crypto.randomUUID(),
            role: "assistant",
            content: data.response,
          };
          setMessages((prev) => [...prev, assistMsg]);
          setQuickReplies(data.quickReplies ?? []);
          setActiveWorkflowStep(data.workflowStep ?? null);

          if (data.escalate) {
            setEscalationView("menu");
          }
        } else {
          setError("Failed to get a response. Please try again.");
        }
      } catch (err: unknown) {
        const e = err as { message?: string; status?: number; retryAfter?: number };
        if (e?.status === 429) {
          const secs = e.retryAfter ?? 60;
          setRateLimitSeconds(secs);
          setError(e.message ?? "Too many messages. Please wait.");
          // Remove optimistic user message since it won't be processed
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
          rateLimitTimerRef.current = setInterval(() => {
            setRateLimitSeconds((s) => {
              if (s <= 1) {
                clearInterval(rateLimitTimerRef.current!);
                rateLimitTimerRef.current = null;
                setError(null);
                return 0;
              }
              return s - 1;
            });
          }, 1000);
        } else if (e?.message?.includes("401") || e?.message?.includes("Session expired")) {
          setError("Please log in to use DS360 Assist.");
        } else {
          setError("Connection error. Please check your network and try again.");
        }
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, conversationId]
  );

  const handleFeedback = useCallback(
    async (messageId: string, feedback: "up" | "down") => {
      if (!conversationId) return;
      try {
        await apiFetch(`/api/assist/conversations/${conversationId}/feedback`, {
          method: "POST",
          body: JSON.stringify({ messageId, feedback }),
        });
      } catch {
        // Non-critical
      }
    },
    [conversationId]
  );

  const handleContinuePastChat = useCallback((id: string) => {
    setConversationId(id);
    setMessages([]);
    setQuickReplies([]);
    setActiveWorkflowStep(null);
    setError(null);
    setEscalationView(null);
    setTicketSuccess(null);
    setTab("chat");

    apiFetch<{ success: boolean; messages: ConversationMessage[] }>(
      `/api/assist/conversations/${id}`
    )
      .then((data) => {
        if (data.success) {
          setMessages(
            data.messages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
          );
        }
      })
      .catch(() => setError("Failed to load conversation."));
  }, []);

  const handleCancelWorkflow = useCallback(() => {
    handleSend("cancel");
  }, [handleSend]);

  // Escalation handlers
  const handleEscalationSelect = useCallback(
    async (type: EscalationType) => {
      if (type === "ticket") {
        setEscalationView("ticket");
      } else if (type === "email_am") {
        setEscalationView("am");
        if (!accountManager) {
          setAmLoading(true);
          try {
            const data = await apiFetch<{ success: boolean; accountManager: AccountManager | null }>(
              "/api/assist/escalate/account-manager"
            );
            if (data.success) setAccountManager(data.accountManager);
          } catch {}
          setAmLoading(false);
        }
      } else if (type === "live_chat") {
        try {
          const token = await getToken();
          setWsToken(token);
          const data = await apiFetch<{ success: boolean; summary: string }>(
            "/api/assist/escalate/live-chat",
            {
              method: "POST",
              body: JSON.stringify({ conversationId }),
            }
          );
          if (data.success) {
            setLiveSummary(data.summary ?? "");
            setEscalationView("live");
          }
        } catch {
          setError("Failed to start live chat. Please try another option.");
        }
      } else if (type === "screen_share") {
        setEscalationView("screen_gen");
      } else if (type === "contact") {
        window.open("mailto:support@dealersuite360.com", "_blank");
        setEscalationView(null);
      }
    },
    [accountManager, conversationId, getToken]
  );

  const handleTicketSuccess = useCallback((ticketNumber: string) => {
    setTicketSuccess(ticketNumber);
    setEscalationView(null);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Your support ticket **${ticketNumber}** has been created. Our team will follow up within 2 hours. Is there anything else I can help you with?`,
      },
    ]);
  }, []);

  const isLiveChatMode = escalationView === "live";
  const isScreenMode = escalationView === "screen_active";

  return (
    <>
      <style>{`
        .assist-panel {
          position: fixed;
          bottom: 84px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(3,50,128,0.18), 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          animation: assistSlideUp 0.2s ease-out;
        }
        @media (max-width: 767px) {
          .assist-panel {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 90dvh;
            border-radius: 12px 12px 0 0;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .assist-panel {
            width: 380px;
            height: 70vh;
            max-height: 580px;
          }
        }
      `}</style>
    <div className="assist-panel">
      {/* Header */}
      <div
        style={{
          background: isLiveChatMode ? "#15803d" : "#033280",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          transition: "background 0.3s",
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
            {isLiveChatMode ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif" }}>
              {isLiveChatMode ? "Live Support" : "DS360 Assist"}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, fontFamily: "Inter, sans-serif" }}>
              {isLiveChatMode ? "Human Support Agent" : "AI Support Agent"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {tab === "chat" && conversationId && !isLiveChatMode && (
            <button
              onClick={startNewChat}
              title="New conversation"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
              }}
            >
              New Chat
            </button>
          )}
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

      {/* Tab bar (hidden in live chat mode) */}
      {!isLiveChatMode && (
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          {(["chat", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "8px 0",
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid #033280" : "2px solid transparent",
                color: tab === t ? "#033280" : "#6b7280",
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: tab === t ? 600 : 400,
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {t === "chat" ? "New Chat" : "Past Chats"}
            </button>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: rateLimitSeconds > 0 ? "#fff7ed" : "#fef2f2",
            color: rateLimitSeconds > 0 ? "#c2410c" : "#b91c1c",
            fontSize: 12,
            padding: "8px 14px",
            borderBottom: `1px solid ${rateLimitSeconds > 0 ? "#fed7aa" : "#fecaca"}`,
            flexShrink: 0,
          }}
        >
          {error}{rateLimitSeconds > 0 ? ` Retry in ${rateLimitSeconds}s.` : ""}
        </div>
      )}

      {/* Ticket success banner */}
      {ticketSuccess && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#15803d",
            fontSize: 12,
            padding: "8px 14px",
            borderBottom: "1px solid #bbf7d0",
            flexShrink: 0,
            fontFamily: "Inter, sans-serif",
          }}
        >
          ✅ Ticket <strong>{ticketSuccess}</strong> created. We'll follow up within 2 hours.
        </div>
      )}

      {/* Live chat mode */}
      {isLiveChatMode && conversationId ? (
        <AssistLiveChat
          conversationId={conversationId}
          userName="You"
          wsToken={wsToken}
          onEnd={() => {
            setEscalationView(null);
            setLiveSummary("");
          }}
        />
      ) : tab === "past" ? (
        <AssistPastChats onContinue={handleContinuePastChat} />
      ) : (
        <>
          {/* Proactive suggestion banner */}
          {proactiveSuggestion && messages.length === 0 && (
            <div style={{
              margin: "10px 14px 0",
              background: "#f0f4ff",
              border: "1px solid #c7d4f0",
              borderRadius: 8,
              padding: "10px 12px",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5, marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
                <span style={{ marginRight: 6 }}>💡</span>{proactiveSuggestion.text}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {proactiveSuggestion.quickReplies.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setProactiveSuggestion(null);
                      sessionStorage.setItem("assist_proactive_dismissed", "1");
                      if (r !== "Not now") handleSend(r);
                    }}
                    style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 12,
                      background: r === "Not now" ? "#f9fafb" : "#fff",
                      color: r === "Not now" ? "#9ca3af" : "#033280",
                      border: `1px solid ${r === "Not now" ? "#e5e7eb" : "#c7d4f0"}`,
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {r}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setProactiveSuggestion(null);
                    sessionStorage.setItem("assist_proactive_dismissed", "1");
                  }}
                  style={{ fontSize: 10, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <AssistMessageList
            messages={messages}
            isTyping={isTyping}
            conversationId={conversationId}
            onFeedback={handleFeedback}
          />

          {/* Quick replies */}
          {!isTyping && quickReplies.length > 0 && !escalationView && (
            <AssistQuickReplies
              replies={quickReplies}
              onSelect={(reply) => handleSend(reply)}
            />
          )}

          {/* Active workflow step */}
          {activeWorkflowStep && !isTyping && !escalationView && (
            <AssistWorkflow
              step={activeWorkflowStep}
              onSubmit={(value) => handleSend(value)}
              onCancel={handleCancelWorkflow}
              disabled={isTyping}
            />
          )}

          {/* Escalation menu */}
          {escalationView === "menu" && (
            <AssistEscalation
              onSelect={handleEscalationSelect}
              onDismiss={() => setEscalationView(null)}
            />
          )}

          {/* Ticket form */}
          {escalationView === "ticket" && (
            <TicketForm
              conversationId={conversationId}
              onSuccess={handleTicketSuccess}
              onCancel={() => setEscalationView("menu")}
            />
          )}

          {/* Account manager card */}
          {escalationView === "am" && (
            <AccountManagerCard
              manager={accountManager}
              loading={amLoading}
              onCancel={() => setEscalationView("menu")}
            />
          )}

          {/* Screen share — code generator */}
          {escalationView === "screen_gen" && (
            <ScreenShareGenerator
              onConnected={(sid) => {
                setScreenSessionId(sid);
                setEscalationView("screen_active");
              }}
              onCancel={() => setEscalationView("menu")}
            />
          )}

          {/* Screen share — active session */}
          {escalationView === "screen_active" && screenSessionId && (
            <ScreenShareActive
              sessionId={screenSessionId}
              onEnd={() => {
                setScreenSessionId(null);
                setEscalationView(null);
              }}
            />
          )}

          <AssistInput onSend={handleSend} disabled={isTyping || rateLimitSeconds > 0} />
        </>
      )}

      <style>{`
        @keyframes assistSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
    </>
  );
}
