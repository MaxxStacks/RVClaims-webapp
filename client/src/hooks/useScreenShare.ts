// client/src/hooks/useScreenShare.ts — Extracted screen share session management

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useRemoteSupport } from "@/contexts/RemoteSupportContext";

export type ScreenSharePhase = "idle" | "opt-in" | "loading" | "ready" | "error";

const CODE_TTL = 10 * 60; // 10 minutes in seconds

export interface UseScreenShareReturn {
  phase: ScreenSharePhase;
  accessCode: string | null;
  sessionId: string | null;
  secondsLeft: number;
  errorMsg: string | null;
  recordingEnabled: boolean;
  copied: boolean;
  setRecordingEnabled: (v: boolean) => void;
  generateCode: (withRecording?: boolean) => Promise<void>;
  cancelSession: () => void;
  handleCopy: () => void;
  onConnected: ((sessionId: string) => void) | null;
  setOnConnected: (cb: (sessionId: string) => void) => void;
}

export function useScreenShare(): UseScreenShareReturn {
  const { startSession, endSession } = useRemoteSupport();

  const [phase, setPhase] = useState<ScreenSharePhase>("idle");
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const onConnectedRef = useRef<((sessionId: string) => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => clear(), [clear]);

  const generateCode = useCallback(async (withRecording = recordingEnabled) => {
    setPhase("loading");
    setErrorMsg(null);
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string; accessCode: string; expiresAt: string }>(
        "/api/remote/sessions",
        { method: "POST", body: JSON.stringify({ recording_enabled: withRecording }) }
      );
      if (!data.success) throw new Error("Failed to create session");
      setSessionId(data.sessionId);
      setAccessCode(data.accessCode);
      setSecondsLeft(CODE_TTL);
      startSession(data.sessionId, data.accessCode, data.expiresAt, withRecording);
      setPhase("ready");
    } catch {
      setPhase("error");
      setErrorMsg("Could not create a session. Please try again.");
    }
  }, [recordingEnabled, startSession]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "ready") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setPhase("error");
          setErrorMsg("Access code expired. Generate a new one.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Poll for operator connecting
  useEffect(() => {
    if (phase !== "ready" || !sessionId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiFetch<{ success: boolean; session: { status: string } }>(
          `/api/remote/sessions/${accessCode}`
        );
        if (data.success && data.session.status === "connected") {
          clear();
          if (onConnectedRef.current && sessionId) {
            onConnectedRef.current(sessionId);
          }
        }
      } catch {}
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, sessionId, accessCode, clear]);

  const cancelSession = useCallback(() => {
    clear();
    endSession();
    setPhase("idle");
    setAccessCode(null);
    setSessionId(null);
    setErrorMsg(null);
  }, [clear, endSession]);

  const handleCopy = useCallback(() => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [accessCode]);

  return {
    phase,
    accessCode,
    sessionId,
    secondsLeft,
    errorMsg,
    recordingEnabled,
    copied,
    setRecordingEnabled,
    generateCode,
    cancelSession,
    handleCopy,
    onConnected: onConnectedRef.current,
    setOnConnected: (cb) => { onConnectedRef.current = cb; },
  };
}
