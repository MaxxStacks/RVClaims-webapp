// client/src/components/remote-support/ScreenShareActive.tsx
// Shown in AssistPanel once operator has connected — captures + publishes screen via LiveKit

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useRemoteSupport } from "@/contexts/RemoteSupportContext";
import TakeoverModal from "./TakeoverModal";

// Blocked keyboard combos (operator remote input sanitization)
const BLOCKED_KEYS = new Set(["w", "q", "r", "t", "n", "F4", "F5", "F6", "Escape"]);
const BLOCKED_CTRL = new Set(["w", "q", "r", "t", "n", "a", "f"]);
const BLOCKED_ALT = new Set(["F4", "Tab", "F4"]);

interface Props {
  sessionId: string;
  onEnd: () => void;
}

export default function ScreenShareActive({ sessionId, onEnd }: Props) {
  const { status, takeoverGranted, updateStatus, endSession } = useRemoteSupport();

  const [sharing, setSharing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTakeoverModal, setShowTakeoverModal] = useState(false);

  const roomRef = useRef<import("livekit-client").Room | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll session status to detect takeover requests and session end
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const json = await apiFetch<{ success: boolean; status: string; takeoverGranted: boolean }>(
          `/api/remote/sessions/${sessionId}/status`
        );
        if (!json.success) return;
        if (json.status === "ended" || json.status === "expired") {
          clearInterval(pollRef.current!);
          handleEnd(false);
        } else if (json.status === "takeover" && !json.takeoverGranted) {
          setShowTakeoverModal(true);
          updateStatus("takeover", false);
        } else if (json.takeoverGranted) {
          updateStatus("takeover", true);
          setShowTakeoverModal(false);
        }
      } catch {}
    }, 8000);
    return () => clearInterval(pollRef.current!);
  }, [sessionId]);

  // Start screen share once component mounts
  useEffect(() => {
    startSharing();
    return () => {
      stopSharing();
    };
  }, []);

  // Show takeover modal when status flips to takeover
  useEffect(() => {
    if (status === "takeover" && !takeoverGranted) {
      setShowTakeoverModal(true);
    }
  }, [status, takeoverGranted]);

  // Relay remote input events from operator DataChannel
  useEffect(() => {
    if (!takeoverGranted || !roomRef.current) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const evt = JSON.parse(new TextDecoder().decode(payload)) as {
          type: "mousemove" | "mousedown" | "mouseup" | "keydown" | "keyup";
          x?: number;
          y?: number;
          button?: number;
          key?: string;
          ctrlKey?: boolean;
          altKey?: boolean;
          metaKey?: boolean;
        };

        if (evt.type === "mousemove" && evt.x !== undefined && evt.y !== undefined) {
          // Convert relative coords to absolute screen position
          const absX = Math.round(evt.x * window.screen.width);
          const absY = Math.round(evt.y * window.screen.height);
          // Synthetic pointer event on element at coords
          const el = document.elementFromPoint(
            Math.round(evt.x * window.innerWidth),
            Math.round(evt.y * window.innerHeight)
          );
          el?.dispatchEvent(new MouseEvent("mousemove", { clientX: Math.round(evt.x * window.innerWidth), clientY: Math.round(evt.y * window.innerHeight), bubbles: true }));
        } else if ((evt.type === "mousedown" || evt.type === "mouseup") && evt.x !== undefined && evt.y !== undefined) {
          const el = document.elementFromPoint(
            Math.round(evt.x * window.innerWidth),
            Math.round(evt.y * window.innerHeight)
          );
          el?.dispatchEvent(new MouseEvent(evt.type, { clientX: Math.round(evt.x * window.innerWidth), clientY: Math.round(evt.y * window.innerHeight), button: evt.button ?? 0, bubbles: true }));
        } else if (evt.type === "keydown" || evt.type === "keyup") {
          // Sanitize: block dangerous combos
          const key = evt.key ?? "";
          if (evt.ctrlKey && BLOCKED_CTRL.has(key.toLowerCase())) return;
          if (evt.altKey && BLOCKED_ALT.has(key)) return;
          if (evt.metaKey) return;
          if (evt.ctrlKey && BLOCKED_KEYS.has(key)) return;
          document.activeElement?.dispatchEvent(new KeyboardEvent(evt.type, { key, ctrlKey: evt.ctrlKey, altKey: evt.altKey, bubbles: true }));
        }
      } catch {}
    };

    // Use string event name to avoid static import of livekit-client at module level
    roomRef.current.on("dataReceived" as any, handleData);
    return () => {
      roomRef.current?.off("dataReceived" as any, handleData);
    };
  }, [takeoverGranted]);

  const startSharing = useCallback(async () => {
    try {
      const { Room, createLocalScreenTracks } = await import("livekit-client");

      // Get LiveKit token
      const tokenData = await apiFetch<{ success: boolean; token: string; url: string }>(
        `/api/remote/sessions/${sessionId}/token`
      );
      if (!tokenData.success) {
        setErrorMsg("Could not get session token. Please try again.");
        return;
      }

      // Capture screen
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: false,
        // @ts-ignore — preferCurrentTab is non-standard but supported in Chrome
        preferCurrentTab: true,
      }).catch(() => null);

      if (!displayStream) {
        setErrorMsg("Screen access was denied. Please allow screen sharing and try again.");
        return;
      }

      streamRef.current = displayStream;

      // Connect to LiveKit room
      const room = new Room({ adaptiveStream: false, dynacast: false });
      roomRef.current = room;

      await room.connect(tokenData.url, tokenData.token);

      const screenTracks = await createLocalScreenTracks({ audio: false });
      for (const track of screenTracks) {
        await room.localParticipant.publishTrack(track);
      }

      updateStatus("connected");
      setSharing(true);

      // When stream ends (user stops sharing via browser UI)
      displayStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        handleEnd(true);
      });
    } catch (err) {
      console.error("[ScreenShareActive] startSharing error:", err);
      setErrorMsg("Failed to start screen sharing. Please try again.");
    }
  }, [sessionId, updateStatus]);

  const stopSharing = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (roomRef.current) {
      roomRef.current.disconnect().catch(() => {});
      roomRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, []);

  const handleEnd = useCallback(
    async (callApi = true) => {
      stopSharing();
      if (callApi) {
        apiFetch(`/api/remote/sessions/${sessionId}/end`, { method: "POST" }).catch(() => {});
      }
      endSession();
      onEnd();
    },
    [sessionId, stopSharing, endSession, onEnd]
  );

  const handleGrantTakeover = useCallback(async () => {
    try {
      await apiFetch(`/api/remote/sessions/${sessionId}/takeover/grant`, { method: "POST" });
      updateStatus("takeover", true);
      setShowTakeoverModal(false);
    } catch {}
  }, [sessionId, updateStatus]);

  const handleDenyTakeover = useCallback(async () => {
    try {
      await apiFetch(`/api/remote/sessions/${sessionId}/takeover/revoke`, { method: "POST" });
      updateStatus("connected", false);
      setShowTakeoverModal(false);
    } catch {}
  }, [sessionId, updateStatus]);

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb", background: "#f0fdf4", flexShrink: 0 }}>
      {showTakeoverModal && (
        <TakeoverModal onGrant={handleGrantTakeover} onDeny={handleDenyTakeover} />
      )}

      {errorMsg ? (
        <div style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
          {errorMsg}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: takeoverGranted ? "#f59e0b" : "#16a34a",
                display: "inline-block",
                animation: "remotePulse 1.5s ease-in-out infinite",
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d", fontFamily: "Inter, sans-serif" }}>
                {takeoverGranted ? "Remote Control Active" : sharing ? "Screen Sharing Active" : "Starting…"}
              </div>
              {takeoverGranted && (
                <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "Inter, sans-serif" }}>
                  Support agent has control of your screen
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => handleEnd(true)}
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
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
      )}

      <style>{`
        @keyframes remotePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
