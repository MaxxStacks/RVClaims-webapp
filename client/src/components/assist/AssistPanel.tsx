// client/src/components/assist/AssistPanel.tsx

import { useState, useCallback, useEffect } from "react";
import AssistMessageList, { type ChatMessage } from "./AssistMessageList";
import AssistInput from "./AssistInput";
import AssistQuickReplies from "./AssistQuickReplies";
import AssistWorkflow from "./AssistWorkflow";
import AssistPastChats from "./AssistPastChats";
import { apiFetch } from "@/lib/api";

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
  messageId?: string;
  workflowStep?: WorkflowStepDef;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Tab = "chat" | "past";

const THIRTY_MINUTES = 30 * 60 * 1000;

export default function AssistPanel({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<WorkflowStepDef | null>(null);

  // Restore active conversation on open (< 30 min idle)
  useEffect(() => {
    const saved = sessionStorage.getItem("assist_convo_id");
    const savedAt = sessionStorage.getItem("assist_convo_at");
    if (saved && savedAt && Date.now() - parseInt(savedAt, 10) < THIRTY_MINUTES) {
      setConversationId(saved);
      // Load messages for this conversation
      apiFetch<{ success: boolean; conversation: unknown; messages: ConversationMessage[] }>(
        `/api/assist/conversations/${saved}`
      )
        .then((data) => {
          if (data.success && data.messages.length > 0) {
            setMessages(
              data.messages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))
            );
          }
        })
        .catch(() => {
          // Silently fail — start fresh
          sessionStorage.removeItem("assist_convo_id");
          sessionStorage.removeItem("assist_convo_at");
          setConversationId(undefined);
        });
    }
  }, []);

  // Persist conversationId to sessionStorage
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
    sessionStorage.removeItem("assist_convo_id");
    sessionStorage.removeItem("assist_convo_at");
    setTab("chat");
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (isTyping) return;

      setQuickReplies([]); // Clear quick replies on any new send

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
        // Non-critical — silently ignore
      }
    },
    [conversationId]
  );

  const handleContinuePastChat = useCallback(
    (id: string) => {
      setConversationId(id);
      setMessages([]);
      setQuickReplies([]);
      setActiveWorkflowStep(null);
      setError(null);
      setTab("chat");

      apiFetch<{ success: boolean; messages: ConversationMessage[] }>(
        `/api/assist/conversations/${id}`
      )
        .then((data) => {
          if (data.success) {
            setMessages(
              data.messages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))
            );
          }
        })
        .catch(() => setError("Failed to load conversation."));
    },
    []
  );

  const handleCancelWorkflow = useCallback(() => {
    handleSend("cancel");
  }, [handleSend]);

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
          background: "#033280",
          color: "#fff",
          padding: "12px 16px",
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
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {tab === "chat" && conversationId && (
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

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
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

      {/* Content */}
      {tab === "past" ? (
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
          {!isTyping && quickReplies.length > 0 && (
            <AssistQuickReplies
              replies={quickReplies}
              onSelect={(reply) => handleSend(reply)}
            />
          )}

          {/* Active workflow step UI */}
          {activeWorkflowStep && !isTyping && (
            <AssistWorkflow
              step={activeWorkflowStep}
              onSubmit={(value) => handleSend(value)}
              onCancel={handleCancelWorkflow}
              disabled={isTyping}
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
