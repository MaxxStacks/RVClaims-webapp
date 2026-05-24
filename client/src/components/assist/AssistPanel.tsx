// client/src/components/assist/AssistPanel.tsx

import { useState, useCallback, useEffect } from "react";
import AssistMessageList, { type ChatMessage } from "./AssistMessageList";
import AssistInput from "./AssistInput";
import AssistQuickReplies from "./AssistQuickReplies";
import AssistWorkflow from "./AssistWorkflow";
import AssistPastChats from "./AssistPastChats";
import AssistEscalation, { type EscalationType } from "./AssistEscalation";
import TicketForm from "./TicketForm";
import AccountManagerCard from "./AccountManagerCard";
import AssistLiveChat from "./AssistLiveChat";
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
type EscalationView = "menu" | "ticket" | "am" | "live" | null;

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
        const e = err as { message?: string };
        if (e?.message?.includes("401") || e?.message?.includes("Session expired")) {
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

  return (
    <div
      style={{
        position: "fixed",
        bottom: 84,
        right: 24,
        width: 400,
        height: 600,
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

          <AssistInput onSend={handleSend} disabled={isTyping} />
        </>
      )}

      <style>{`
        @keyframes assistSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
