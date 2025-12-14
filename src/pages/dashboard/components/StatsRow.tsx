import { Card, Col, Row, Statistic, Badge, theme } from "antd";
import {
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
  GlobalOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { DashboardData } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface StatsRowProps {
  data?: DashboardData;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  suffix,
  isOnline,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  isOnline?: boolean;
}) => (
  <Col xs={24} sm={12} lg={8} xl={4}>
    <Card
      hoverable
      style={{
        borderTop: `3px solid ${color}`,
        transition: "all 0.3s ease",
      }}
    >
      <Statistic
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {title}
            {isOnline && (
              <Badge
                status="processing"
                color={CHART_COLORS.success}
                style={{ marginLeft: 4 }}
              />
            )}
          </span>
        }
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color }}
      />
    </Card>
  </Col>
);

export const StatsRow = ({ data, isLoading }: StatsRowProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  if (isLoading || !data) {
    return (
      <Row gutter={[16, 16]}>
        {[...Array(6)].map((_, i) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={i}>
            <Card loading style={{ minHeight: 120 }} />
          </Col>
        ))}
      </Row>
    );
  }
  return (
    <>
      <Row gutter={[16, 16]}>
        <StatCard
          title={t("stats.totalUsers")}
          value={data.users.total}
          icon={<UserOutlined />}
          color={CHART_COLORS.primary}
        />
        <StatCard
          title={t("stats.onlineNow")}
          value={data.onlineCount}
          icon={<GlobalOutlined />}
          color={CHART_COLORS.success}
          isOnline
        />
        <StatCard
          title={t("stats.totalMessages")}
          value={data.messages.total}
          icon={<MessageOutlined />}
          color={CHART_COLORS.purple}
        />
        <StatCard
          title={t("stats.groups")}
          value={data.rooms.groups}
          icon={<TeamOutlined />}
          color={CHART_COLORS.orange}
        />
        <StatCard
          title={t("stats.totalCalls")}
          value={data.calls.total}
          icon={<VideoCameraOutlined />}
          color={CHART_COLORS.magenta}
        />
        <StatCard
          title={t("stats.stories")}
          value={data.stories.total}
          icon={<FileImageOutlined />}
          color={CHART_COLORS.cyan}
        />
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" hoverable>
            <Statistic
              title={t("stats.activeUsers")}
              value={data.users.active}
              valueStyle={{ color: CHART_COLORS.success }}
              suffix={
                <span style={{ fontSize: 14, color: token.colorTextTertiary }}>
                  / {data.users.total}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" hoverable>
            <Statistic
              title={t("stats.broadcasts")}
              value={data.rooms.broadcasts}
              valueStyle={{ color: CHART_COLORS.purple }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" hoverable>
            <Statistic
              title={t("stats.activeStories")}
              value={data.stories.active}
              valueStyle={{ color: CHART_COLORS.cyan }}
              suffix={
                <span style={{ fontSize: 14, color: token.colorTextTertiary }}>
                  / {data.stories.total}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" hoverable>
            <Statistic
              title={t("stats.bannedUsers")}
              value={data.users.banned}
              valueStyle={{
                color: data.users.banned > 0 ? CHART_COLORS.error : CHART_COLORS.success,
              }}
              prefix={data.users.banned > 0 ? <AlertOutlined /> : undefined}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
