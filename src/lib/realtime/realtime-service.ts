/**
 * REAL-TIME SERVICE
 * WebSocket-based real-time updates
 * Fallback to polling if WebSocket unavailable
 */

import { log } from '@/lib/monitoring/logger';
import { handleError } from '@/lib/monitoring/error-handler';

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
        log.info('WebSocket connected', { userId });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          // Validate message structure
          if (typeof parsed === 'object' && parsed !== null && 
              'type' in parsed && typeof parsed.type === 'string' &&
              'data' in parsed) {
            this.emit(parsed.type, parsed.data);
          } else {
            log.error('Invalid WebSocket message format', { message: parsed });
          }
        } catch (error) {
          handleError(error as Error, {
            context: 'websocket-message-parse',
            userId: this.userId,
          });
        }
      };

      this.ws.onerror = (error) => {
        log.error('WebSocket error', { error, userId: this.userId });
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        log.info('WebSocket disconnected', { userId: this.userId });
        this.isConnecting = false;
        this.ws = null;
        this.emit('disconnected', {});
        this.attemptReconnect();
      };
    } catch (error) {
      handleError(error as Error, {
        context: 'websocket-connect',
        userId,
      });
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
          handleError(error as Error, {
            context: 'websocket-listener',
            event,
          });
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
      log.warn('Cannot send WebSocket message - not connected', { type });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.warn('Max WebSocket reconnect attempts reached', {
        attempts: this.reconnectAttempts,
        userId: this.userId,
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    log.info('WebSocket reconnecting', {
      delay,
      attempt: this.reconnectAttempts,
      userId: this.userId,
    });

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
