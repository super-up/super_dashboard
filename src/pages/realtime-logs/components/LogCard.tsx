import { Card, Tag, Typography, Avatar, Space, Tooltip, theme } from 'antd';
import { UserOutlined, RobotOutlined, SettingOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { AdminLogEvent, ActorType, Severity } from '../../../types/realtime-logs.types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_KEYS } from './CategoryFilters';
import { getMediaUrl } from '../../../config/api';

const { Text } = Typography;

interface LogCardProps {
  log: AdminLogEvent;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  i: 'blue',
  w: 'orange',
  e: 'red',
  c: 'magenta',
};

const SEVERITY_KEYS: Record<Severity, string> = {
  i: 'info',
  w: 'warning',
  e: 'error',
  c: 'critical',
};

const ACTOR_TYPE_KEYS: Record<ActorType, string> = {
  u: 'user',
  a: 'admin',
  s: 'system',
};

const ACTOR_TYPE_ICONS: Record<ActorType, React.ReactNode> = {
  u: <UserOutlined />,
  a: <SettingOutlined />,
  s: <RobotOutlined />,
};

const formatEventName = (evt: string): string => {
  return evt
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatFullTime = (ts: number): string => {
  return new Date(ts).toLocaleString();
};

export const LogCard = ({ log }: LogCardProps) => {
  const { t } = useTranslation('realtime-logs');
  const { token } = theme.useToken();
  const categoryColor = CATEGORY_COLORS[log.cat];
  const categoryIcon = CATEGORY_ICONS[log.cat];
  const categoryLabel = CATEGORY_KEYS[log.cat] ? t(`categories.${CATEGORY_KEYS[log.cat]}`) : t('labels.unknown');
  const severityColor = SEVERITY_COLORS[log.sev];
  const severityLabel = t(`severity.${SEVERITY_KEYS[log.sev]}`);
  const actorLabel = t(`actorTypes.${ACTOR_TYPE_KEYS[log.actor.t]}`);
  const actorIcon = ACTOR_TYPE_ICONS[log.actor.t];
  const formatRelativeTime = (ts: number): string => {
    const diff = Date.now() - ts;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return t('time.secondsAgo', { count: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('time.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('time.hoursAgo', { count: hours });
    return new Date(ts).toLocaleDateString();
  };
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        borderLeft: `3px solid ${categoryColor || token.colorPrimary}`,
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Space size="small">
            <Tag color={categoryColor} icon={categoryIcon}>
              {categoryLabel}
            </Tag>
            <Tag color={severityColor}>{severityLabel}</Tag>
            <Text strong>{formatEventName(log.evt)}</Text>
          </Space>
          <Tooltip title={formatFullTime(log.ts)}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatRelativeTime(log.ts)}
            </Text>
          </Tooltip>
        </Space>
        <Space size="middle" style={{ marginTop: 4 }}>
          <Space size="small">
            <Avatar
              size="small"
              src={log.actor.img ? getMediaUrl(log.actor.img) : undefined}
              icon={!log.actor.img && actorIcon}
              style={{ backgroundColor: !log.actor.img ? token.colorPrimaryBg : undefined }}
            />
            <Text>{log.actor.n || log.actor.id}</Text>
            <Tag style={{ fontSize: 10 }}>{actorLabel}</Tag>
          </Space>
          {log.target && (
            <>
              <RightOutlined style={{ color: token.colorTextSecondary, fontSize: 10 }} />
              <Space size="small">
                <Text type="secondary">{log.target.t}:</Text>
                <Text>{log.target.n || log.target.id}</Text>
              </Space>
            </>
          )}
        </Space>
        {log.data && Object.keys(log.data).length > 0 && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {JSON.stringify(log.data)}
          </Text>
        )}
      </Space>
    </Card>
  );
};
