// client/src/contexts/RemoteSupportContext.tsx — Shared state for active remote support sessions

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type RemoteSessionStatus = "pending" | "connected" | "takeover" | "ended" | null;

interface RemoteSupportState {
  sessionId: string | null;
  accessCode: string | null;
  status: RemoteSessionStatus;
  expiresAt: string | null;
  takeoverGranted: boolean;
  recordingEnabled: boolean;
}

interface RemoteSupportContextValue extends RemoteSupportState {
  startSession: (sessionId: string, accessCode: string, expiresAt: string, recordingEnabled?: boolean) => void;
  updateStatus: (status: RemoteSessionStatus, takeoverGranted?: boolean) => void;
  endSession: () => void;
}

const RemoteSupportContext = createContext<RemoteSupportContextValue | null>(null);

export function RemoteSupportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RemoteSupportState>({
    sessionId: null,
    accessCode: null,
    status: null,
    expiresAt: null,
    takeoverGranted: false,
    recordingEnabled: false,
  });

  const startSession = useCallback((sessionId: string, accessCode: string, expiresAt: string, recordingEnabled = false) => {
    setState({ sessionId, accessCode, status: "pending", expiresAt, takeoverGranted: false, recordingEnabled });
  }, []);

  const updateStatus = useCallback((status: RemoteSessionStatus, takeoverGranted?: boolean) => {
    setState((prev) => ({
      ...prev,
      status,
      takeoverGranted: takeoverGranted ?? prev.takeoverGranted,
    }));
  }, []);

  const endSession = useCallback(() => {
    setState({ sessionId: null, accessCode: null, status: null, expiresAt: null, takeoverGranted: false, recordingEnabled: false });
  }, []);

  return (
    <RemoteSupportContext.Provider value={{ ...state, startSession, updateStatus, endSession }}>
      {children}
    </RemoteSupportContext.Provider>
  );
}

export function useRemoteSupport(): RemoteSupportContextValue {
  const ctx = useContext(RemoteSupportContext);
  if (!ctx) throw new Error("useRemoteSupport must be used within RemoteSupportProvider");
  return ctx;
}
