import type { ReactNode } from 'react';

export type Severity = 'i' | 'w' | 'e' | 'c';
export type ActorType = 'u' | 'a' | 's';

export enum EventCategory {
  AUTH = 1,
  PRESENCE = 2,
  MESSAGE = 3,
  GROUP = 4,
  BROADCAST = 5,
  CHANNEL = 6,
  STORY = 7,
  CALL = 8,
  PROFILE = 9,
}

export interface CategoryConfig {
  label: string;
  color: string;
  icon: ReactNode;
}

export interface SeverityConfig {
  label: string;
  color: string;
  tagColor: string;
}

export interface EventActor {
  t: ActorType;
  id: string;
  n?: string;
  img?: string;
}

export interface EventTarget {
  t: string;
  id: string;
  n?: string;
}

export interface AdminLogEvent {
  id: string;
  ts: number;
  cat: EventCategory;
  evt: string;
  sev: Severity;
  actor: EventActor;
  target?: EventTarget;
  data?: Record<string, unknown>;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseRealtimeLogsOptions {
  maxLogs?: number;
  autoConnect?: boolean;
}

export interface UseRealtimeLogsReturn {
  logs: AdminLogEvent[];
  status: ConnectionStatus;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearLogs: () => void;
  isConnected: boolean;
}
