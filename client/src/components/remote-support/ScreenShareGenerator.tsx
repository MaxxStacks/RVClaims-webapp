// client/src/components/remote-support/ScreenShareGenerator.tsx
// Shown in AssistPanel when dealer selects "Share My Screen"
// Delegates logic to useScreenShare hook

import { useEffect } from "react";
import { useScreenShare } from "@/hooks/useScreenShare";

interface Props {
  onConnected: (sessionId: string) => void;
  onCancel: () => void;
}

export default function ScreenShareGenerator({ onConnected, onCancel }: Props) {
  const {
    phase,
    accessCode,
    secondsLeft,
    errorMsg,
    recordingEnabled,
    copied,
    setRecordingEnabled,
    generateCode,
    cancelSession,
    handleCopy,
    setOnConnected,
  } = useScreenShare();

  // Wire up the onConnected callback
  useEffect(() => {
    setOnConnected(onConnected);
  }, [onConnected, setOnConnected]);

  const handleCancel = () => {
    cancelSession();
    onCancel();
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  if (phase === "idle" || phase === "opt-in") {
    return (
      <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb", background: "#fafafa", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Share My Screen
          </span>
          <button onClick={handleCancel} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Cancel
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#374151", marginBottom: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
          This will generate a 6-digit code to share with your support agent, who can then view your screen.
        </div>
        <label
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer" }}
          onClick={() => setRecordingEnabled(!recordingEnabled)}
        >
          <div style={{ width: 36, height: 20, borderRadius: 10, background: recordingEnabled ? "#033280" : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 2, left: recordingEnabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 12, color: "#374151", fontFamily: "Inter, sans-serif", userSelect: "none" }}>Record this session (optional)</span>
        </label>
        {recordingEnabled && (
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
            The session recording will be stored securely and accessible to your support team only.
          </div>
        )}
        <button
          onClick={() => generateCode(recordingEnabled)}
          style={{ width: "100%", background: "#033280", color: "#fff", border: "none", borderRadius: 6, padding: "9px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          Generate Access Code
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div style={{ padding: "20px 16px", textAlign: "center", color: "#6b7280", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
        Generating access code…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb", background: "#fafafa", flexShrink: 0 }}>
        <div style={{ color: "#b91c1c", fontSize: 12, marginBottom: 10, fontFamily: "Inter, sans-serif" }}>{errorMsg}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => generateCode(recordingEnabled)} style={{ flex: 1, background: "#033280", color: "#fff", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Try Again
          </button>
          <button onClick={handleCancel} style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // phase === "ready"
  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb", background: "#fafafa", flexShrink: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>Share My Screen</span>
        <button onClick={handleCancel} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancel</button>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
        Give this code to your support agent. They'll enter it to view your screen.
      </div>
      <div style={{ background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#033280", letterSpacing: "0.12em" }}>{accessCode}</span>
        <button
          onClick={handleCopy}
          style={{ background: copied ? "#f0fdf4" : "#f3f4f6", color: copied ? "#15803d" : "#374151", border: `1px solid ${copied ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", flexShrink: 0 }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {recordingEnabled && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", display: "inline-block", animation: "remotePulse 1s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recording</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "remotePulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "Inter, sans-serif" }}>Waiting for support agent…</span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: secondsLeft < 60 ? "#b91c1c" : "#6b7280", fontWeight: secondsLeft < 60 ? 600 : 400 }}>
          {mins}:{secs}
        </span>
      </div>
      <style>{`
        @keyframes remotePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
