import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL, TOKEN_KEY } from '../config/api';
import type {
  AdminLogEvent,
  ConnectionStatus,
  UseRealtimeLogsOptions,
  UseRealtimeLogsReturn,
} from '../types/realtime-logs.types';

const MAX_LOGS_DEFAULT = 500;
const ADMIN_LOG_EVENTS = {
  LOG: 'log',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export const useRealtimeLogs = (
  options: UseRealtimeLogsOptions = {}
): UseRealtimeLogsReturn => {
  const { maxLogs = MAX_LOGS_DEFAULT, autoConnect = true } = options;
  const [logs, setLogs] = useState<AdminLogEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('No authentication token');
      setStatus('error');
      return;
    }
    setStatus('connecting');
    setError(null);
    const socket = io(`${WS_URL}/admin-logs`, {
      transports: ['websocket'],
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socket.on('connect', () => {
      setStatus('connected');
      setError(null);
    });
    socket.on(ADMIN_LOG_EVENTS.CONNECTED, (data) => {
      console.log('Admin logs connected:', data);
    });
    socket.on(ADMIN_LOG_EVENTS.LOG, (payload: AdminLogEvent) => {
      setLogs((prev) => {
        const newLogs = [payload, ...prev];
        if (newLogs.length > maxLogs) {
          return newLogs.slice(0, maxLogs);
        }
        return newLogs;
      });
    });
    socket.on(ADMIN_LOG_EVENTS.ERROR, (err: { message: string }) => {
      setError(err.message);
    });
    socket.on('disconnect', (reason) => {
      setStatus('disconnected');
      if (reason === 'io server disconnect') {
        setError('Disconnected by server');
      }
    });
    socket.on('connect_error', (err) => {
      setStatus('error');
      setError(err.message);
    });
    socketRef.current = socket;
  }, [maxLogs]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    logs,
    status,
    error,
    connect,
    disconnect,
    clearLogs,
    isConnected: status === 'connected',
  };
};
