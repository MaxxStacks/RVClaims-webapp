// client/src/components/remote-support/ScreenShareRequestToast.tsx
// Slide-in toast shown when an operator requests a screen share.
// Listens on the shared wsClient singleton — no per-component WebSocket.

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useRemoteSupport } from "@/contexts/RemoteSupportContext";
import { wsClient } from "@/lib/websocket";

interface PendingRequest {
  sessionId: string;
  operatorName: string;
  message: string | null;
}

interface Props {
  request: PendingRequest;
  onDismiss: () => void;
}

function RequestToast({ request, onDismiss }: Props) {
  const { startSession } = useRemoteSupport();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          fetch(`/api/remote/sessions/${request.sessionId}/decline`, { method: "POST" }).catch(() => {});
          onDismiss();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [request.sessionId, onDismiss]);

  const handleAccept = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAccepting(true);
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string; accessCode: string; dealerToken: string | null; livekitUrl: string | null; roomName: string }>(
        `/api/remote/sessions/${request.sessionId}/accept`,
        { method: "POST" }
      );
      if (data.success && data.accessCode) {
        startSession(data.sessionId, data.accessCode, new Date(Date.now() + 10 * 60 * 1000).toISOString(), false);
      }
    } catch {
      // Session may have expired
    } finally {
      setAccepting(false);
      onDismiss();
    }
  }, [request.sessionId, startSession, onDismiss]);

  const handleDecline = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDeclining(true);
    try {
      await apiFetch(`/api/remote/sessions/${request.sessionId}/decline`, { method: "POST" });
    } catch {}
    setDeclining(false);
    onDismiss();
  }, [request.sessionId, onDismiss]);

  return (
    <div style={{
      position: "fixed",
      top: 72,
      right: 20,
      width: 320,
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      zIndex: 10001,
      padding: "16px",
      fontFamily: "Inter, sans-serif",
      animation: "toastSlideIn 0.25s ease-out",
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2}>
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>
            {request.operatorName} wants to view your screen
          </div>
          {request.message && (
            <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic", lineHeight: 1.4 }}>
              "{request.message}"
            </div>
          )}
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
            Auto-dismisses in {countdown}s
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAccept}
          disabled={accepting || declining}
          style={{
            flex: 1, background: accepting ? "#d1d5db" : "#15803d", color: "white",
            border: "none", borderRadius: 7, padding: "8px 0", fontSize: 12, fontWeight: 600,
            cursor: accepting || declining ? "default" : "pointer",
          }}
        >
          {accepting ? "Accepting…" : "Accept"}
        </button>
        <button
          onClick={handleDecline}
          disabled={accepting || declining}
          style={{
            flex: 1, background: "white", color: "#374151",
            border: "1px solid #d1d5db", borderRadius: 7, padding: "8px 0", fontSize: 12,
            cursor: accepting || declining ? "default" : "pointer",
          }}
        >
          {declining ? "Declining…" : "Decline"}
        </button>
      </div>
    </div>
  );
}

// No props needed — listens on the shared wsClient singleton
export default function ScreenShareRequestToast() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    return wsClient.on<{ sessionId?: string; operatorName?: string; message?: string | null }>(
      "remote:share-request",
      (payload) => {
        const { sessionId, operatorName, message } = payload ?? {};
        if (sessionId) {
          setPendingRequests((prev) => [
            ...prev.filter((r) => r.sessionId !== sessionId),
            { sessionId, operatorName: operatorName ?? "Support Agent", message: message ?? null },
          ]);
        }
      }
    );
  }, []);

  const dismiss = useCallback((sessionId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.sessionId !== sessionId));
  }, []);

  if (pendingRequests.length === 0) return null;

  return (
    <>
      {pendingRequests.map((req) => (
        <RequestToast key={req.sessionId} request={req} onDismiss={() => dismiss(req.sessionId)} />
      ))}
    </>
  );
}
