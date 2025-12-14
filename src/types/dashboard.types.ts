export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface DauData {
  date: string;
  activeUsers: number;
}

export interface CountryData {
  countryId: string;
  countryName: string;
  countryCode: string;
  countryEmoji: string;
  count: number;
}

export interface PlatformData {
  platform: string;
  deviceCount: number;
  userCount: number;
}

export interface MessageTypeData {
  type: string;
  count: number;
}

export interface UserStats {
  total: number;
  banned: number;
  verified: number;
  deleted: number;
  active: number;
}

export interface ActiveUsersStats {
  total: number;
  activeToday: number;
  activeWeek: number;
  activeMonth: number;
  active90Days: number;
  inactive: number;
  neverActive: number;
  activeTodayPercent: number;
  activeWeekPercent: number;
  activeMonthPercent: number;
}

export interface MessageStats {
  total: number;
  deleted: number;
  byType: MessageTypeData[];
}

export interface CallStats {
  total: number;
  finished: number;
  missed: number;
  byStatus: { status: string; count: number }[];
}

export interface RoomStats {
  groups: number;
  broadcasts: number;
  singles: number;
  total: number;
}

export interface StoryStats {
  total: number;
  active: number;
  expired: number;
  byType: { type: string; count: number }[];
}

export interface DeviceStats {
  total: number;
  byPlatform: { platform: string; count: number }[];
}

export interface DashboardData {
  users: UserStats;
  messages: MessageStats;
  rooms: RoomStats;
  stories: StoryStats;
  calls: CallStats;
  devices: DeviceStats;
  onlineCount: number;
}

export interface TimelineData {
  users: TimeSeriesData[];
  messages: TimeSeriesData[];
  stories: TimeSeriesData[];
}

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetIds?: string[];
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  ip: string;
  userAgent: string;
  adminEmail: string;
  createdAt: string;
}

export interface AuditLogResponse {
  docs: AuditLog[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CHART_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
  orange: '#fa8c16',
  ios: '#007AFF',
  android: '#3DDC84',
  web: '#FF6B00',
  desktop: '#6B7280',
} as const;

export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  voice: 'Voice',
  file: 'File',
  location: 'Location',
  contact: 'Contact',
  sticker: 'Sticker',
  allDeleted: 'Deleted',
  info: 'System Info',
  call: 'Call',
  reply: 'Reply',
  forward: 'Forward',
  audio: 'Audio',
  document: 'Document',
  gif: 'GIF',
  poll: 'Poll',
};

export const PLATFORM_COLORS: Record<string, string> = {
  ios: CHART_COLORS.ios,
  android: CHART_COLORS.android,
  web: CHART_COLORS.web,
  macos: CHART_COLORS.desktop,
  windows: '#0078D4',
  linux: '#FCC624',
};
