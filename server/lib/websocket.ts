// server/lib/websocket.ts — WebSocket real-time service
// Handles: ticket messages, quick chat, notifications, claim status updates

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verifyToken } from "./auth";
import { TOKEN_TYPES } from "@shared/constants";
import type { UserRole } from "@shared/constants";
import { initAuctionWebSocket as registerAuctionEvents } from '../websocket/auctions';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  role?: UserRole;
  dealershipId?: string | null;
  isAlive?: boolean;
}

interface WSMessage {
  type: string;
  channel?: string;
  payload?: any;
}

// Global connection registry
const connections = new Map<string, Set<AuthenticatedSocket>>();  // userId → sockets
const dealershipRooms = new Map<string, Set<AuthenticatedSocket>>();  // dealershipId → sockets

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: "/ws" });
  registerAuctionEvents(server);

  wss.on("connection", async (ws: AuthenticatedSocket, req) => {
    // Extract token from query string
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Authentication required");
      return;
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload || payload.type !== TOKEN_TYPES.ACCESS) {
      ws.close(4001, "Invalid token");
      return;
    }

    // Attach user info
    ws.userId = payload.userId;
    ws.role = payload.role as UserRole;
    ws.dealershipId = payload.dealershipId;
    ws.isAlive = true;

    // Register connection
    if (!connections.has(payload.userId)) {
      connections.set(payload.userId, new Set());
    }
    connections.get(payload.userId)!.add(ws);

    // Join dealership room
    if (payload.dealershipId) {
      if (!dealershipRooms.has(payload.dealershipId)) {
        dealershipRooms.set(payload.dealershipId, new Set());
      }
      dealershipRooms.get(payload.dealershipId)!.add(ws);
    }

    console.log(`[WS] Connected: ${payload.userId} (${payload.role})`);

    // Send welcome
    ws.send(JSON.stringify({ type: "connected", payload: { userId: payload.userId, role: payload.role } }));

    // Handle messages
    ws.on("message", (data) => {
      try {
        const msg: WSMessage = JSON.parse(data.toString());
        handleMessage(ws, msg);
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid message format" } }));
      }
    });

    // Heartbeat
    ws.on("pong", () => { ws.isAlive = true; });

    // Cleanup on disconnect
    ws.on("close", () => {
      if (ws.userId) {
        connections.get(ws.userId)?.delete(ws);
        if (connections.get(ws.userId)?.size === 0) connections.delete(ws.userId);
      }
      if (ws.dealershipId) {
        dealershipRooms.get(ws.dealershipId)?.delete(ws);
        if (dealershipRooms.get(ws.dealershipId)?.size === 0) dealershipRooms.delete(ws.dealershipId);
      }
      console.log(`[WS] Disconnected: ${ws.userId}`);
    });
  });

  // Heartbeat interval — ping every 30s, close dead connections
  const heartbeat = setInterval(() => {
    wss?.clients.forEach((ws: AuthenticatedSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  console.log("[WS] WebSocket server initialized at /ws");
  return wss;
}

function handleMessage(ws: AuthenticatedSocket, msg: WSMessage) {
  switch (msg.type) {
    case "ping":
      ws.send(JSON.stringify({ type: "pong" }));
      break;

    case "typing":
      // Broadcast typing indicator to ticket/chat participants
      if (msg.channel && ws.dealershipId) {
        broadcastToDealership(ws.dealershipId, {
          type: "typing",
          channel: msg.channel,
          payload: { userId: ws.userId, name: msg.payload?.name },
        }, ws.userId);
      }
      break;

    default:
      break;
  }
}

// ==================== BROADCAST FUNCTIONS ====================

/**
 * Send message to a specific user (all their connected devices).
 */
export function sendToUser(userId: string, message: WSMessage) {
  const sockets = connections.get(userId);
  if (!sockets) return;

  const data = JSON.stringify(message);
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  });
}

/**
 * Send message to all users in a dealership (dealers + customers).
 */
export function broadcastToDealership(dealershipId: string, message: WSMessage, excludeUserId?: string) {
  const sockets = dealershipRooms.get(dealershipId);
  if (!sockets) return;

  const data = JSON.stringify(message);
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.userId !== excludeUserId) {
      ws.send(data);
    }
  });
}

/**
 * Send message to all operator users.
 */
export function broadcastToOperators(message: WSMessage) {
  const data = JSON.stringify(message);
  connections.forEach((sockets, userId) => {
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN && (ws.role === "operator_admin" || ws.role === "operator_staff")) {
        ws.send(data);
      }
    });
  });
}

// ==================== EVENT EMITTERS ====================

/**
 * Notify when a new ticket message is added.
 */
export function emitTicketMessage(data: {
  ticketId: string;
  ticketNumber: string;
  dealershipId: string;
  customerId?: string;
  senderId: string;
  message: string;
  isInternal: boolean;
}) {
  // Send to dealer users in the dealership
  broadcastToDealership(data.dealershipId, {
    type: "ticket:message",
    payload: {
      ticketId: data.ticketId,
      ticketNumber: data.ticketNumber,
      message: data.message,
      senderId: data.senderId,
      isInternal: data.isInternal,
    },
  }, data.senderId);

  // If not internal, also send to customer
  if (!data.isInternal && data.customerId) {
    sendToUser(data.customerId, {
      type: "ticket:message",
      payload: {
        ticketId: data.ticketId,
        ticketNumber: data.ticketNumber,
        message: data.message,
        senderId: data.senderId,
      },
    });
  }
}

/**
 * Notify when a quick chat message is sent.
 */
export function emitQuickChat(data: {
  dealershipId: string;
  customerId: string;
  senderId: string;
  message: string;
}) {
  // Send to both customer and all dealer users
  if (data.senderId !== data.customerId) {
    sendToUser(data.customerId, {
      type: "chat:message",
      payload: { message: data.message, senderId: data.senderId },
    });
  }

  broadcastToDealership(data.dealershipId, {
    type: "chat:message",
    payload: {
      customerId: data.customerId,
      message: data.message,
      senderId: data.senderId,
    },
  }, data.senderId);
}

/**
 * Notify when a claim status changes.
 */
export function emitClaimUpdate(data: {
  claimId: string;
  claimNumber: string;
  dealershipId: string;
  status: string;
  updatedBy: string;
}) {
  broadcastToDealership(data.dealershipId, {
    type: "claim:updated",
    payload: {
      claimId: data.claimId,
      claimNumber: data.claimNumber,
      status: data.status,
    },
  });

  broadcastToOperators({
    type: "claim:updated",
    payload: {
      claimId: data.claimId,
      claimNumber: data.claimNumber,
      status: data.status,
      dealershipId: data.dealershipId,
    },
  });
}

/**
 * Notify when a new photo batch is uploaded.
 */
export function emitBatchUploaded(data: {
  batchId: string;
  batchNumber: string;
  dealershipId: string;
  photoCount: number;
}) {
  broadcastToOperators({
    type: "batch:uploaded",
    payload: {
      batchId: data.batchId,
      batchNumber: data.batchNumber,
      dealershipId: data.dealershipId,
      photoCount: data.photoCount,
    },
  });
}

/**
 * Send a real-time notification.
 */
export function emitNotification(userId: string, notification: {
  id: string;
  type: string;
  title: string;
  message?: string;
  linkTo?: string;
}) {
  sendToUser(userId, {
    type: "notification",
    payload: notification,
  });
}

// ==================== STATS ====================

export function getConnectionStats(): { totalConnections: number; uniqueUsers: number; dealershipRooms: number } {
  let totalConnections = 0;
  connections.forEach((sockets) => { totalConnections += sockets.size; });

  return {
    totalConnections,
    uniqueUsers: connections.size,
    dealershipRooms: dealershipRooms.size,
  };
}
