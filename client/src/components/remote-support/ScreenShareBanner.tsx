// client/src/components/remote-support/ScreenShareBanner.tsx
// Fixed banner at app shell level — visible across all pages during a remote session

import { useRemoteSupport } from "@/contexts/RemoteSupportContext";
import { apiFetch } from "@/lib/api";

export default function ScreenShareBanner() {
  const { sessionId, accessCode, status, takeoverGranted, recordingEnabled, endSession } = useRemoteSupport();

  if (!status || status === "ended") return null;

  const handleEnd = async () => {
    if (sessionId) {
      apiFetch(`/api/remote/sessions/${sessionId}/end`, { method: "POST" }).catch(() => {});
    }
    endSession();
  };

  const isPending = status === "pending";
  const isConnected = status === "connected" || status === "takeover";
  const isTakeover = status === "takeover" && takeoverGranted;

  const bg = isPending ? "#fffbeb" : isTakeover ? "#fef3c7" : "#f0fdf4";
  const border = isPending ? "#fde68a" : isTakeover ? "#fcd34d" : "#bbf7d0";
  const dotColor = isPending ? "#f59e0b" : isTakeover ? "#d97706" : "#16a34a";
  const textColor = isPending ? "#92400e" : isTakeover ? "#92400e" : "#15803d";

  const label = isPending
    ? `Code: ${accessCode} — Waiting for support agent…`
    : isTakeover
    ? "Remote Control Active — agent controls your screen"
    : "Screen Sharing Active";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 36,
        background: bg,
        borderBottom: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        zIndex: 9998,
        fontFamily: "Inter, sans-serif",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: dotColor,
            display: "inline-block",
            flexShrink: 0,
            animation: "bannerPulse 1.5s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          🖥️ {label}
        </span>
        {recordingEnabled && isConnected && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626", display: "inline-block", animation: "bannerPulse 1s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>REC</span>
          </span>
        )}
      </div>
      <button
        onClick={handleEnd}
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#b91c1c",
          borderRadius: 5,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
          minWidth: 80,
        }}
      >
        End Session
      </button>

      <style>{`
        @keyframes bannerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
