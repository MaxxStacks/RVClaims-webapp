// server/lib/livekit-server.ts — LiveKit server-side token + room helpers

import { AccessToken, RoomServiceClient, EgressClient } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";

function isConfigured(): boolean {
  return !!(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}

export interface LiveKitToken {
  token: string;
  url: string;
}

export async function generateAccessToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  canPublish: boolean,
  canSubscribe: boolean
): Promise<LiveKitToken | null> {
  if (!isConfigured()) return null;

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: "1h",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe,
    canPublishData: true,
  });

  return { token: await at.toJwt(), url: LIVEKIT_URL };
}

export async function createRoom(roomName: string): Promise<void> {
  if (!isConfigured()) return;
  const svc = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  try {
    await svc.createRoom({ name: roomName, emptyTimeout: 300, maxParticipants: 2 });
  } catch {
    // room may already exist — that's fine
  }
}

export async function closeRoom(roomName: string): Promise<void> {
  if (!isConfigured()) return;
  const svc = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  try {
    await svc.deleteRoom(roomName);
  } catch {
    // room may not exist
  }
}

// ── LiveKit Egress (recording) ───────────────────────────────────────────────
// Only available when LIVEKIT_EGRESS_OUTPUT_URL is set.
// Gracefully degrades — never throws, returns null if unavailable.

const LIVEKIT_EGRESS_OUTPUT_URL = process.env.LIVEKIT_EGRESS_OUTPUT_URL ?? "";

function isEgressConfigured(): boolean {
  return isConfigured() && !!LIVEKIT_EGRESS_OUTPUT_URL;
}

export async function startRoomRecording(roomName: string): Promise<string | null> {
  if (!isEgressConfigured()) return null;
  try {
    const egress = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    const info = await egress.startRoomCompositeEgress(roomName, {
      file: {
        filepath: `recordings/${roomName}-${Date.now()}.mp4`,
        output: { case: "s3", value: { bucket: LIVEKIT_EGRESS_OUTPUT_URL } },
      },
    } as any);
    return (info as any).egressId ?? null;
  } catch (err) {
    console.warn("[livekit-server] Recording start failed (non-fatal):", (err as Error).message);
    return null;
  }
}

export async function stopRoomRecording(egressId: string): Promise<string | null> {
  if (!isEgressConfigured()) return null;
  try {
    const egress = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    const info = await egress.stopEgress(egressId);
    const fileResults = (info as any).fileResults as Array<{ filename: string }> | undefined;
    return fileResults?.[0]?.filename ?? null;
  } catch (err) {
    console.warn("[livekit-server] Recording stop failed (non-fatal):", (err as Error).message);
    return null;
  }
}
