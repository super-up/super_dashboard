import { Badge, Button, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ConnectionStatus as Status } from '../../../types/realtime-logs.types';

const { Text } = Typography;

interface ConnectionStatusProps {
  status: Status;
  error: string | null;
  onReconnect: () => void;
}

const STATUS_COLOR: Record<Status, string> = {
  connected: '#52c41a',
  connecting: '#faad14',
  disconnected: '#d9d9d9',
  error: '#ff4d4f',
};

export const ConnectionStatus = ({ status, error, onReconnect }: ConnectionStatusProps) => {
  const { t } = useTranslation('realtime-logs');
  const statusTextMap: Record<Status, string> = {
    connected: t('status.connected'),
    connecting: t('status.connecting'),
    disconnected: t('status.disconnected'),
    error: t('status.error'),
  };
  const showReconnect = status === 'disconnected' || status === 'error';
  return (
    <Space size="small">
      <Badge color={STATUS_COLOR[status]} />
      <Text type={status === 'error' ? 'danger' : undefined}>
        {error || statusTextMap[status]}
      </Text>
      {showReconnect && (
        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReconnect}
        >
          {t('actions.reconnect')}
        </Button>
      )}
    </Space>
  );
};
