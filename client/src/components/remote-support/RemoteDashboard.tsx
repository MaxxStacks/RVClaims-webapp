// client/src/components/remote-support/RemoteDashboard.tsx
// Operator-side remote support dashboard: code entry, active sessions, history

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import ScreenShareViewer from "./ScreenShareViewer";

interface RemoteSession {
  id: string;
  accessCode: string;
  dealerId: string;
  dealerUserId: string;
  operatorUserId: string | null;
  status: string;
  takeoverGranted: boolean;
  createdAt: string;
  connectedAt: string | null;
  endedAt: string | null;
  endedBy: string | null;
}

function formatDuration(start: string, end: string | null): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RemoteDashboard() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [activeSession, setActiveSession] = useState<RemoteSession | null>(null);
  const [history, setHistory] = useState<RemoteSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [takeoverGranted, setTakeoverGranted] = useState(false);
  const [sessionEvents, setSessionEvents] = useState<{ eventType: string; actor: string; createdAt: string }[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await apiFetch<{ success: boolean; sessions: RemoteSession[] }>("/api/remote/session-history");
      if (data.success) setHistory(data.sessions);
    } catch {}
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Poll active session status
  useEffect(() => {
    if (!activeSession) return;
    const iv = setInterval(async () => {
      try {
        const data = await apiFetch<{ success: boolean; status: string; takeoverGranted: boolean }>(
          `/api/remote/sessions/${activeSession.id}/status`
        );
        if (!data.success) return;
        if (data.status === "ended" || data.status === "expired") {
          setActiveSession(null);
          loadHistory();
        } else {
          setTakeoverGranted(data.takeoverGranted);
        }
      } catch {}
    }, 6000);
    return () => clearInterval(iv);
  }, [activeSession, loadHistory]);

  const handleConnect = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setCodeError(null);
    setConnecting(true);
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string; dealerUserId: string; message?: string }>(
        `/api/remote/sessions/${trimmed}/connect`,
        { method: "POST" }
      );
      if (!data.success) {
        setCodeError(data.message ?? "Invalid or expired code");
        return;
      }
      // Load the full session
      const status = await apiFetch<{ success: boolean; status: string; takeoverGranted: boolean }>(
        `/api/remote/sessions/${data.sessionId}/status`
      );
      setActiveSession({
        id: data.sessionId,
        accessCode: trimmed,
        dealerId: "",
        dealerUserId: data.dealerUserId,
        operatorUserId: null,
        status: status.status ?? "connected",
        takeoverGranted: false,
        createdAt: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
        endedAt: null,
        endedBy: null,
      });
      setCode("");
    } catch {
      setCodeError("Could not connect. Please check the code and try again.");
    } finally {
      setConnecting(false);
    }
  }, [code]);

  const handleRequestTakeover = useCallback(async () => {
    if (!activeSession) return;
    try {
      await apiFetch(`/api/remote/sessions/${activeSession.id}/takeover`, { method: "POST" });
    } catch {}
  }, [activeSession]);

  const handleRevokeTakeover = useCallback(async () => {
    if (!activeSession) return;
    try {
      await apiFetch(`/api/remote/sessions/${activeSession.id}/takeover/revoke`, { method: "POST" });
      setTakeoverGranted(false);
    } catch {}
  }, [activeSession]);

  const handleEndSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await apiFetch(`/api/remote/sessions/${activeSession.id}/end`, { method: "POST" });
    } catch {}
    setActiveSession(null);
    setTakeoverGranted(false);
    loadHistory();
  }, [activeSession, loadHistory]);

  const handleViewEvents = useCallback(async (sessionId: string) => {
    try {
      const data = await apiFetch<{ success: boolean; events: { eventType: string; actor: string; createdAt: string }[] }>(
        `/api/remote/sessions/${sessionId}/events`
      );
      if (data.success) setSessionEvents(data.events);
    } catch {}
  }, []);

  // Active viewer mode
  if (activeSession) {
    return (
      <ScreenShareViewer
        sessionId={activeSession.id}
        dealerUserId={activeSession.dealerUserId}
        takeoverGranted={takeoverGranted}
        onRequestTakeover={handleRequestTakeover}
        onRevokeTakeover={handleRevokeTakeover}
        onEndSession={handleEndSession}
      />
    );
  }

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Remote Support</h1>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Enter a dealer's access code to view their screen
        </div>
      </div>

      {/* Code entry */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 12 }}>
          Connect to Session
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="XXX-XXX"
            maxLength={7}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: `1px solid ${codeError ? "#fca5a5" : "#d1d5db"}`,
              borderRadius: 8,
              fontSize: 18,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              outline: "none",
              textAlign: "center",
            }}
          />
          <button
            onClick={handleConnect}
            disabled={connecting || !code.trim()}
            style={{
              background: connecting || !code.trim() ? "#e5e7eb" : "#033280",
              color: connecting || !code.trim() ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 600,
              cursor: connecting || !code.trim() ? "default" : "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {connecting ? "Connecting…" : "Connect"}
          </button>
        </div>
        {codeError && (
          <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 8, fontFamily: "Inter, sans-serif" }}>
            {codeError}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
          Codes expire 10 minutes after generation. Ask the dealer to share a fresh code.
        </div>
      </div>

      {/* Session history */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Recent Sessions
        </div>
        {historyLoading ? (
          <div style={{ padding: 20, color: "#9ca3af", fontSize: 13, textAlign: "center" }}>Loading…</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 24, color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
            No completed sessions yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Code", "Status", "Duration", "Ended By", "When", "Events"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: "#374151" }}>
                    {s.accessCode}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 10,
                        background: s.status === "ended" ? "#f0fdf4" : "#fef2f2",
                        color: s.status === "ended" ? "#15803d" : "#b91c1c",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "#374151" }}>
                    {s.connectedAt ? formatDuration(s.connectedAt, s.endedAt) : "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "#374151" }}>
                    {s.endedBy ?? "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "#9ca3af" }}>
                    {timeAgo(s.createdAt)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button
                      onClick={() => handleViewEvents(s.id)}
                      style={{
                        background: "none",
                        border: "1px solid #e5e7eb",
                        borderRadius: 5,
                        padding: "3px 8px",
                        fontSize: 11,
                        color: "#6b7280",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Event log modal */}
      {sessionEvents.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setSessionEvents([])}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              maxWidth: 480,
              width: "90%",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14, fontFamily: "Inter, sans-serif" }}>
              Session Event Log
            </div>
            {sessionEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 12, color: "#374151", fontFamily: "Inter, sans-serif" }}>
                  <strong>{ev.actor}</strong> · {ev.eventType.replace(/_/g, " ")}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>
                  {new Date(ev.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            <button
              onClick={() => setSessionEvents([])}
              style={{
                marginTop: 14,
                width: "100%",
                background: "#f3f4f6",
                border: "none",
                borderRadius: 7,
                padding: "8px 0",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
