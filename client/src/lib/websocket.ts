/**
 * websocket.ts — WebSocket client singleton.
 *
 * Connects to the backend WS server, automatically reconnects on drop,
 * and dispatches typed events to registered listeners.
 *
 * Usage:
 *   import { wsClient } from '@/lib/websocket';
 *   const unsub = wsClient.on('claim:updated', (data) => { ... });
 *   // In cleanup: unsub();
 */

export type WsEventType =
  | "claim:updated"
  | "batch:uploaded"
  | "ticket:message"
  | "auction:bid"
  | "connected"
  | "disconnected";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
}

type Listener<T = unknown> = (payload: T) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxDelay = 30_000;
  private url: string;
  private _connected = false;

  constructor() {
    // Derive WS URL from current host
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.url = `${proto}//${window.location.host}/ws`;
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this._connected = true;
        this.reconnectDelay = 1000; // reset back-off
        this.emit("connected", {});
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsEvent;
          this.emit(msg.type, msg.payload);
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this._connected = false;
        this.emit("disconnected", {});
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  /** Subscribe to an event type. Returns an unsubscribe function. */
  on<T = unknown>(type: WsEventType, listener: Listener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as Listener);
    return () => this.listeners.get(type)?.delete(listener as Listener);
  }

  get connected(): boolean {
    return this._connected;
  }

  private emit(type: string, payload: unknown): void {
    this.listeners.get(type)?.forEach((fn) => fn(payload));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
      this.connect();
    }, this.reconnectDelay);
  }
}

// Singleton — all portals share one connection
export const wsClient = new WebSocketClient();
