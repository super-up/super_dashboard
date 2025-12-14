import { useState, useMemo } from 'react';
import { Card, Space, Button, Empty, Typography, Row, Col, Divider } from 'antd';
import { ClearOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRealtimeLogs } from '../../hooks/useRealtimeLogs';
import { EventCategory } from '../../types/realtime-logs.types';
import {
  ConnectionStatus,
  SeverityFilter,
  CategoryFilters,
  LogCard,
  type SeverityOption,
} from './components';

const { Title } = Typography;

export const RealtimeLogs = () => {
  const { t } = useTranslation('realtime-logs');
  const [categoryFilters, setCategoryFilters] = useState<EventCategory[]>([]);
  const [severityFilter, setSeverityFilter] = useState<SeverityOption>('all');
  const [isPaused, setIsPaused] = useState(false);
  const { logs, status, error, connect, clearLogs, isConnected } = useRealtimeLogs({
    maxLogs: 500,
    autoConnect: true,
  });
  const filteredLogs = useMemo(() => {
    if (isPaused) return [];
    return logs.filter((log) => {
      if (categoryFilters.length > 0 && !categoryFilters.includes(log.cat)) {
        return false;
      }
      if (severityFilter !== 'all' && log.sev !== severityFilter) {
        return false;
      }
      return true;
    });
  }, [logs, categoryFilters, severityFilter, isPaused]);
  const logCount = filteredLogs.length;
  const totalCount = logs.length;
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Title level={4} style={{ margin: 0 }}>{t('title')}</Title>
              <Typography.Text type="secondary">
                {logCount === totalCount
                  ? t('logsCount', { count: totalCount })
                  : t('logsCountFiltered', { filtered: logCount, total: totalCount })}
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <ConnectionStatus
                status={status}
                error={error}
                onReconnect={connect}
              />
              <Divider type="vertical" />
              <Button
                icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? t('actions.resume') : t('actions.pause')}
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={clearLogs}
                disabled={logs.length === 0}
              >
                {t('actions.clear')}
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <CategoryFilters
              selected={categoryFilters}
              onChange={setCategoryFilters}
            />
          </Col>
          <Col>
            <SeverityFilter
              value={severityFilter}
              onChange={setSeverityFilter}
            />
          </Col>
        </Row>
        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          {isPaused ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('empty.paused')}
            />
          ) : filteredLogs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                isConnected
                  ? logs.length === 0
                    ? t('empty.waiting')
                    : t('empty.noMatch')
                  : t('empty.notConnected')
              }
            />
          ) : (
            filteredLogs.map((log) => <LogCard key={log.id} log={log} />)
          )}
        </div>
      </Card>
    </div>
  );
};
