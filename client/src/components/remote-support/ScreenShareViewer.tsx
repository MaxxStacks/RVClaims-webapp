// client/src/components/remote-support/ScreenShareViewer.tsx
// Operator-side LiveKit subscriber — views dealer's screen, optional remote control

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";

// Rate limiting state
const MOUSE_INTERVAL = Math.floor(1000 / 60); // 60/sec → ~16ms
const KEY_INTERVAL = Math.floor(1000 / 30);   // 30/sec → ~33ms

// Dangerous key combos to block before sending
const BLOCKED_CTRL_KEYS = new Set(["w", "q", "r", "t", "n", "a", "f"]);
const BLOCKED_ALT_KEYS = new Set(["F4", "Tab"]);

interface Props {
  sessionId: string;
  dealerUserId: string;
  takeoverGranted: boolean;
  onRequestTakeover: () => void;
  onRevokeTakeover: () => void;
  onEndSession: () => void;
}

export default function ScreenShareViewer({
  sessionId,
  dealerUserId,
  takeoverGranted,
  onRequestTakeover,
  onRevokeTakeover,
  onEndSession,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<import("livekit-client").Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastMouseSend = useRef(0);
  const lastKeySend = useRef(0);

  // Connect to LiveKit and subscribe
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const tokenData = await apiFetch<{ success: boolean; token: string; url: string }>(
          `/api/remote/sessions/${sessionId}/token`
        );
        if (!tokenData.success || !mounted) return;

        const { Room, RoomEvent, Track } = await import("livekit-client");
        const room = new Room({ adaptiveStream: true, dynacast: false });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Video && videoRef.current) {
            track.attach(videoRef.current);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach();
        });

        room.on(RoomEvent.Disconnected, () => {
          if (mounted) onEndSession();
        });

        await room.connect(tokenData.url, tokenData.token);
        if (mounted) setConnected(true);
      } catch (err) {
        if (mounted) setErrorMsg("Failed to connect to the screen share session.");
      }
    })();

    return () => {
      mounted = false;
      roomRef.current?.disconnect().catch(() => {});
      roomRef.current = null;
    };
  }, [sessionId]);

  // Send mouse/keyboard events via DataChannel when takeover is granted
  const sendInputEvent = useCallback((payload: object) => {
    if (!roomRef.current) return;
    try {
      const data = new TextEncoder().encode(JSON.stringify(payload));
      roomRef.current.localParticipant.publishData(data, { reliable: false });
    } catch {}
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!takeoverGranted) return;
      const now = Date.now();
      if (now - lastMouseSend.current < MOUSE_INTERVAL) return;
      lastMouseSend.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      sendInputEvent({
        type: "mousemove",
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    },
    [takeoverGranted, sendInputEvent]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!takeoverGranted) return;
      const rect = e.currentTarget.getBoundingClientRect();
      sendInputEvent({
        type: "mousedown",
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        button: e.button,
      });
    },
    [takeoverGranted, sendInputEvent]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!takeoverGranted) return;
      const rect = e.currentTarget.getBoundingClientRect();
      sendInputEvent({
        type: "mouseup",
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        button: e.button,
      });
    },
    [takeoverGranted, sendInputEvent]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!takeoverGranted) return;
      const now = Date.now();
      if (now - lastKeySend.current < KEY_INTERVAL) return;
      lastKeySend.current = now;
      // Sanitize — block dangerous combos
      if (e.ctrlKey && BLOCKED_CTRL_KEYS.has(e.key.toLowerCase())) return;
      if (e.altKey && BLOCKED_ALT_KEYS.has(e.key)) return;
      if (e.metaKey) return;
      sendInputEvent({ type: "keydown", key: e.key, ctrlKey: e.ctrlKey, altKey: e.altKey });
    },
    [takeoverGranted, sendInputEvent]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!takeoverGranted) return;
      sendInputEvent({ type: "keyup", key: e.key, ctrlKey: e.ctrlKey, altKey: e.altKey });
    },
    [takeoverGranted, sendInputEvent]
  );

  if (errorMsg) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#b91c1c", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
        {errorMsg}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f172a" }}>
      {/* Toolbar */}
      <div
        style={{
          background: "#1e293b",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#16a34a" : "#f59e0b",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, color: "#cbd5e1", fontFamily: "Inter, sans-serif" }}>
            {connected ? (takeoverGranted ? "Remote Control Active" : "Screen Share Active") : "Connecting…"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!takeoverGranted ? (
            <button
              onClick={onRequestTakeover}
              disabled={!connected}
              style={{
                background: connected ? "#1d4ed8" : "#374151",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: connected ? "pointer" : "default",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Request Control
            </button>
          ) : (
            <button
              onClick={onRevokeTakeover}
              style={{
                background: "#92400e",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Release Control
            </button>
          )}
          <button
            onClick={onEndSession}
            style={{
              background: "#7f1d1d",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            End Session
          </button>
        </div>
      </div>

      {/* Screen video */}
      <div
        style={{ flex: 1, overflow: "hidden", position: "relative", cursor: takeoverGranted ? "crosshair" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex={takeoverGranted ? 0 : undefined}
      >
        {!connected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🖥️</span>
            Waiting for screen…
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: connected ? "block" : "none",
          }}
        />
      </div>
    </div>
  );
}
