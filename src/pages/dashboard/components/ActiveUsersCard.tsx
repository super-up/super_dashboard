import { Card, Progress, Statistic, Row, Col, Typography, Tooltip, theme } from "antd";
import { RiseOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ActiveUsersStats } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

const { Text } = Typography;

interface ActiveUsersCardProps {
  data?: ActiveUsersStats;
  isLoading?: boolean;
}

const formatPercent = (value: number | undefined): number => {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return Math.round(value * 100) / 100;
};

const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toLocaleString();
};

const MetricRow = ({
  label,
  value,
  percent,
  color,
  icon,
  secondaryColor,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
  icon?: React.ReactNode;
  secondaryColor: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <Text style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        {label}
      </Text>
      <Tooltip title={`${formatNumber(value)} users (${formatPercent(percent)}% of total)`}>
        <Text strong style={{ cursor: "help" }}>
          {formatNumber(value)} <span style={{ color: secondaryColor, fontWeight: 400 }}>({formatPercent(percent)}%)</span>
        </Text>
      </Tooltip>
    </div>
    <Progress
      percent={formatPercent(percent)}
      showInfo={false}
      strokeColor={color}
      size={["100%", 8]}
    />
  </div>
);

export const ActiveUsersCard = ({ data, isLoading }: ActiveUsersCardProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  if (isLoading || !data) {
    return <Card title={t("activeUsersCard.title")} loading style={{ height: "100%" }} />;
  }
  const safeData = {
    total: data.total || 0,
    activeToday: data.activeToday || 0,
    activeWeek: data.activeWeek || 0,
    activeMonth: data.activeMonth || 0,
    active90Days: data.active90Days || 0,
    inactive: data.inactive || 0,
    neverActive: data.neverActive || 0,
    activeTodayPercent: data.activeTodayPercent ?? (data.total > 0 ? (data.activeToday / data.total) * 100 : 0),
    activeWeekPercent: data.activeWeekPercent ?? (data.total > 0 ? (data.activeWeek / data.total) * 100 : 0),
    activeMonthPercent: data.activeMonthPercent ?? (data.total > 0 ? (data.activeMonth / data.total) * 100 : 0),
  };
  return (
    <Card
      title={t("activeUsersCard.title")}
      style={{ height: "100%" }}
      extra={
        <Tooltip title={t("activeUsersCard.tooltip")}>
          <ClockCircleOutlined style={{ color: token.colorTextTertiary }} />
        </Tooltip>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 20, textAlign: "center" }}>
        <Col xs={8} sm={8}>
          <Statistic
            title={<span style={{ fontSize: 12 }}>{t("activeUsersCard.dailyActive")}</span>}
            value={safeData.activeToday}
            valueStyle={{ color: CHART_COLORS.success, fontSize: 22, fontWeight: 600 }}
            prefix={<RiseOutlined />}
          />
        </Col>
        <Col xs={8} sm={8}>
          <Statistic
            title={<span style={{ fontSize: 12 }}>{t("activeUsersCard.weeklyActive")}</span>}
            value={safeData.activeWeek}
            valueStyle={{ color: CHART_COLORS.primary, fontSize: 22, fontWeight: 600 }}
          />
        </Col>
        <Col xs={8} sm={8}>
          <Statistic
            title={<span style={{ fontSize: 12 }}>{t("activeUsersCard.monthlyActive")}</span>}
            value={safeData.activeMonth}
            valueStyle={{ color: CHART_COLORS.purple, fontSize: 22, fontWeight: 600 }}
          />
        </Col>
      </Row>
      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 16 }}>
        <MetricRow
          label={t("activeUsersCard.dau")}
          value={safeData.activeToday}
          percent={safeData.activeTodayPercent}
          color={CHART_COLORS.success}
          icon={<UserOutlined style={{ fontSize: 12 }} />}
          secondaryColor={token.colorTextTertiary}
        />
        <MetricRow
          label={t("activeUsersCard.wau")}
          value={safeData.activeWeek}
          percent={safeData.activeWeekPercent}
          color={CHART_COLORS.primary}
          icon={<TeamOutlined style={{ fontSize: 12 }} />}
          secondaryColor={token.colorTextTertiary}
        />
        <MetricRow
          label={t("activeUsersCard.mau")}
          value={safeData.activeMonth}
          percent={safeData.activeMonthPercent}
          color={CHART_COLORS.purple}
          icon={<TeamOutlined style={{ fontSize: 12 }} />}
          secondaryColor={token.colorTextTertiary}
        />
      </div>
      <div style={{ marginTop: 16, padding: 12, background: token.colorFillSecondary, borderRadius: 8 }}>
        <Row gutter={[16, 8]}>
          <Col xs={8} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{t("activeUsersCard.inactive90d")}</Text>
            <div style={{ fontWeight: 600, fontSize: 16, color: CHART_COLORS.warning }}>
              {formatNumber(safeData.inactive)}
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{t("activeUsersCard.neverActive")}</Text>
            <div style={{ fontWeight: 600, fontSize: 16, color: CHART_COLORS.error }}>
              {formatNumber(safeData.neverActive)}
            </div>
          </Col>
          <Col xs={8} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{t("stats.totalUsers")}</Text>
            <div style={{ fontWeight: 600, fontSize: 16, color: CHART_COLORS.primary }}>
              {formatNumber(safeData.total)}
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};
