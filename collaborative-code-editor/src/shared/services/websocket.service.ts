import { io, type Socket } from 'socket.io-client';
import { WEBSOCKET_CONFIG } from '../config/constants';
import { WebSocketEventType, type WebSocketMessage } from '../types';

/**
 * WebSocket service for real-time collaboration
 * Handles connection management, reconnection logic, and event subscriptions
 * Target latency: <100ms as per requirements
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private eventHandlers = new Map<string, Set<(data: unknown) => void>>();
  private isConnected = false;
  private sessionId: string | null = null;
  private userId: string | null = null;

  /**
   * Initialize WebSocket connection
   */
  connect(userId: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.userId = userId;
      this.sessionId = sessionId;

      this.socket = io(WEBSOCKET_CONFIG.URL, {
        transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
        reconnection: false, // We'll handle reconnection manually
        query: {
          userId,
          sessionId,
        },
      });

      this.setupEventListeners();

      // Connection timeout
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.eventHandlers.clear();
  }

  /**
   * Set up core WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('error', this.handleError.bind(this));
    this.socket.on('pong', this.handlePong.bind(this));

    // Application-specific events
    Object.values(WebSocketEventType).forEach((eventType) => {
      this.socket?.on(eventType, (message: WebSocketMessage) => {
        this.handleMessage(eventType, message);
      });
    });
  }

  /**
   * Handle successful connection
   */
  private handleConnect(): void {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.emit('connection:established', { connected: true });
  }

  /**
   * Handle disconnection with automatic reconnection
   */
  private handleDisconnect(reason: string): void {
    this.isConnected = false;
    this.emit('connection:lost', { reason });

    // Attempt automatic reconnection if not manually disconnected
    if (reason === 'io server disconnect') {
      // Server disconnected the client, don't reconnect automatically
      return;
    }

    this.attemptReconnection();
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Error): void {
    this.emit('connection:error', { error: error.message });
  }

  /**
   * Handle heartbeat pong response
   */
  private handlePong(): void {
    // Connection is alive
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection(): void {
    if (
      this.reconnectAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS ||
      !this.userId ||
      !this.sessionId
    ) {
      this.emit('connection:failed', {
        message: 'Max reconnection attempts reached',
      });
      return;
    }

    this.reconnectAttempts++;

    const delay =
      WEBSOCKET_CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1);

    this.emit('connection:reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userId!, this.sessionId!).catch((error) => {
        this.emit('connection:error', { error: error.message });
        this.attemptReconnection();
      });
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Handle incoming messages and route to subscribers
   */
  private handleMessage(eventType: string, message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(eventType);

    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.payload);
        } catch (error) {
          // Silent error - don't crash other handlers
        }
      });
    }
  }

  /**
   * Subscribe to specific event
   */
  on<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler as (data: unknown) => void);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as (data: unknown) => void);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  /**
   * Emit event to server
   */
  emit<T>(event: string, data: T): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket is not connected');
    }

    const message: WebSocketMessage<T> = {
      type: event as WebSocketEventType,
      payload: data,
      sessionId: this.sessionId || '',
      userId: this.userId || '',
      timestamp: Date.now(),
    };

    this.socket.emit(event, message);
  }

  /**
   * Send cursor position update (throttled on client side)
   */
  sendCursorUpdate(position: { lineNumber: number; column: number }): void {
    this.emit(WebSocketEventType.CURSOR_MOVE, position);
  }

  /**
   * Send content change operation
   */
  sendContentChange(change: {
    type: 'insert' | 'delete' | 'replace';
    position: { lineNumber: number; column: number };
    content: string;
    version: number;
  }): void {
    this.emit(WebSocketEventType.CONTENT_CHANGE, change);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(isTyping: boolean): void {
    this.emit(WebSocketEventType.USER_TYPING, { isTyping });
  }

  /**
   * Send presence update
   */
  sendPresenceUpdate(presence: { isActive: boolean; lastSeen: Date }): void {
    this.emit(WebSocketEventType.PRESENCE_UPDATE, presence);
  }

  /**
   * Join collaboration session
   */
  joinSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.emit(WebSocketEventType.JOIN_SESSION, { sessionId });
  }

  /**
   * Leave collaboration session
   */
  leaveSession(): void {
    if (this.sessionId) {
      this.emit(WebSocketEventType.LEAVE_SESSION, { sessionId: this.sessionId });
      this.sessionId = null;
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && Boolean(this.socket?.connected);
  }

  /**
   * Get current session ID
   */
  get currentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get current user ID
   */
  get currentUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
