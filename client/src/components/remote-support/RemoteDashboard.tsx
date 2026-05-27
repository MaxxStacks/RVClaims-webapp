// client/src/components/remote-support/RemoteDashboard.tsx
// Operator-side remote support dashboard: request/code entry, active sessions, history, transfers

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import ScreenShareViewer from "./ScreenShareViewer";
import DocumentTransfer from "./DocumentTransfer";

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

interface Dealer {
  id: string;
  name: string;
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
  const [activeTab, setActiveTab] = useState<"sessions" | "transfers">("sessions");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [activeSession, setActiveSession] = useState<RemoteSession | null>(null);
  const [history, setHistory] = useState<RemoteSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [takeoverGranted, setTakeoverGranted] = useState(false);
  const [sessionEvents, setSessionEvents] = useState<{ eventType: string; actor: string; createdAt: string }[]>([]);

  // Request section
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [requestDealerId, setRequestDealerId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "waiting" | "declined">("idle");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await apiFetch<{ success: boolean; sessions: RemoteSession[] }>("/api/remote/session-history");
      if (data.success) setHistory(data.sessions);
    } catch {}
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
    // Load dealer list for request section
    apiFetch<any>("/api/dealerships?limit=100")
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.dealerships ?? [];
        setDealers(list.map((d: any) => ({ id: d.id, name: d.name })));
      })
      .catch(() => {});
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

  const handleSendRequest = useCallback(async () => {
    if (!requestDealerId) return;
    setRequesting(true);
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string }>(
        "/api/remote/sessions/request",
        { method: "POST", body: JSON.stringify({ dealerId: requestDealerId, message: requestMessage.trim() || undefined }) }
      );
      if (data.success) {
        setPendingRequestId(data.sessionId);
        setRequestStatus("waiting");
      }
    } catch {
      setRequestStatus("idle");
    } finally {
      setRequesting(false);
    }
  }, [requestDealerId, requestMessage]);

  // Listen for accept/decline WS events
  useEffect(() => {
    if (!pendingRequestId) return;

    const connectWS = async () => {
      const token = await window.Clerk?.session?.getToken();
      if (!token) return;
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${window.location.host}/ws?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "remote:share-accepted" && msg.payload?.sessionId === pendingRequestId) {
            // Auto-connect: load session
            const { sessionId, operatorToken, livekitUrl, roomName } = msg.payload;
            setActiveSession({
              id: sessionId, accessCode: "", dealerId: requestDealerId,
              dealerUserId: "", operatorUserId: null, status: "connected",
              takeoverGranted: false, createdAt: new Date().toISOString(),
              connectedAt: new Date().toISOString(), endedAt: null, endedBy: null,
            });
            setRequestStatus("idle");
            setPendingRequestId(null);
          }
          if (msg.type === "remote:share-declined" && msg.payload?.sessionId === pendingRequestId) {
            setRequestStatus("declined");
            setPendingRequestId(null);
          }
        } catch {}
      };
      ws.onerror = () => ws.close();
    };

    connectWS();
    return () => { wsRef.current?.close(); wsRef.current = null; };
  }, [pendingRequestId, requestDealerId]);

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
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Remote Support</h1>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Manage screen share sessions and document transfers</div>
      </div>

      {/* Main tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
        {(["sessions", "transfers"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "10px 20px", background: "none", border: 0, cursor: "pointer",
            borderBottom: activeTab === t ? "2px solid #033280" : "2px solid transparent",
            color: activeTab === t ? "#033280" : "#6b7280", fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "sessions" ? "Screen Share" : "Document Transfers"}
          </button>
        ))}
      </div>

      {activeTab === "transfers" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", maxWidth: 520 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", fontSize: 13, fontWeight: 600, color: "#374151" }}>Document Transfers</div>
          <DocumentTransfer operatorMode={true} />
        </div>
      )}

      {activeTab === "sessions" && (
        <>
      {/* Request Screen Share section */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Request Screen Share</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Send a request to a dealer — they'll receive a notification to accept or decline.</div>

        {requestStatus === "waiting" && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#1e40af", fontWeight: 500 }}>Request sent — waiting for dealer to accept…</span>
            </div>
            <button
              onClick={() => { setRequestStatus("idle"); setPendingRequestId(null); wsRef.current?.close(); }}
              style={{ fontSize: 11, color: "#6b7280", background: "none", border: "1px solid #d1d5db", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        )}

        {requestStatus === "declined" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#b91c1c" }}>Request declined by dealer.</span>
            <button onClick={() => setRequestStatus("idle")} style={{ fontSize: 11, color: "#b91c1c", background: "none", border: "1px solid #fca5a5", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>Try Again</button>
          </div>
        )}

        {requestStatus === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              value={requestDealerId}
              onChange={(e) => setRequestDealerId(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 13, color: "#374151", outline: "none" }}
            >
              <option value="">Select a dealer…</option>
              {dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input
              type="text"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value.slice(0, 200))}
              placeholder="Describe what you need help with… (optional)"
              maxLength={200}
              style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 12, outline: "none" }}
            />
            <button
              onClick={handleSendRequest}
              disabled={requesting || !requestDealerId}
              style={{
                background: requesting || !requestDealerId ? "#e5e7eb" : "#033280",
                color: requesting || !requestDealerId ? "#9ca3af" : "#fff",
                border: "none", borderRadius: 7, padding: "10px 0", fontSize: 13, fontWeight: 600,
                cursor: requesting || !requestDealerId ? "default" : "pointer",
              }}
            >
              {requesting ? "Sending…" : "Send Request"}
            </button>
          </div>
        )}
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
          Enter Access Code
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
        </>
      )}
    </div>
  );
}
