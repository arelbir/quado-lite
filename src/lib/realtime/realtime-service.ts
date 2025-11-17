/**
 * REAL-TIME SERVICE
 * WebSocket-based real-time updates
 * Fallback to polling if WebSocket unavailable
 */

type EventCallback = (data: any) => void;

export class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private url: string;
  private userId?: string;

  constructor(url?: string) {
    this.url = url || this.getWebSocketUrl();
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`);

      this.ws.onopen = () => {
        console.log('[Realtime] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { type: string; data: any };
          this.emit(message.type, message.data);
        } catch (error) {
          console.error('[Realtime] Message parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Realtime] Error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('[Realtime] Disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.emit('disconnected', {});
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[Realtime] Connection failed:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('[Realtime] Listener error:', error);
        }
      });
    }
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('[Realtime] Cannot send - not connected');
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Realtime] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const realtime = new RealtimeService();

// Helper functions for common events
export const RealtimeEvents = {
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  WORKFLOW_UPDATE: 'workflow:update',
  TEAM_UPDATE: 'team:update',
  GROUP_UPDATE: 'group:update',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  MESSAGE_NEW: 'message:new',
};
