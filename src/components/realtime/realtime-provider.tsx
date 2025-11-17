'use client';

/**
 * REALTIME PROVIDER
 * React context for real-time updates
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realtime, RealtimeEvents } from '@/lib/realtime/realtime-service';
import { toast } from 'sonner';

interface RealtimeContextType {
  isConnected: boolean;
  send: (type: string, data: any) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface RealtimeProviderProps {
  children: ReactNode;
  userId?: string;
  enabled?: boolean;
}

export function RealtimeProvider({ children, userId, enabled = true }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // Connect to real-time service
    realtime.connect(userId);

    // Subscribe to connection events
    const unsubConnected = realtime.on('connected', () => {
      setIsConnected(true);
      console.log('[Realtime] Connected');
    });

    const unsubDisconnected = realtime.on('disconnected', () => {
      setIsConnected(false);
      console.log('[Realtime] Disconnected');
    });

    // Subscribe to notifications
    const unsubNotification = realtime.on(RealtimeEvents.NOTIFICATION_NEW, (data) => {
      toast.info(data.title || 'New notification', {
        description: data.message,
      });
    });

    // Cleanup
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubNotification();
      realtime.disconnect();
    };
  }, [userId, enabled]);

  const send = (type: string, data: any) => {
    realtime.send(type, data);
  };

  return (
    <RealtimeContext.Provider value={{ isConnected, send }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to use real-time service
 */
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

/**
 * Hook to subscribe to real-time events
 */
export function useRealtimeEvent(event: string, callback: (data: any) => void) {
  useEffect(() => {
    const unsubscribe = realtime.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
}
