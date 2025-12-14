import { Card, Empty, Row, Col, Progress, Tag, Statistic, theme } from "antd";
import { Pie } from "@ant-design/charts";
import {
  AppleOutlined,
  AndroidOutlined,
  GlobalOutlined,
  DesktopOutlined,
  WindowsOutlined,
  LaptopOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { PlatformData } from "../../../types/dashboard.types";
import { PLATFORM_COLORS, CHART_COLORS } from "../../../types/dashboard.types";

interface PlatformDistributionChartProps {
  data?: PlatformData[];
  isLoading?: boolean;
}

const PLATFORM_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ios: { label: "iOS", icon: <AppleOutlined />, color: PLATFORM_COLORS.ios },
  android: { label: "Android", icon: <AndroidOutlined />, color: PLATFORM_COLORS.android },
  web: { label: "Web", icon: <GlobalOutlined />, color: PLATFORM_COLORS.web },
  macos: { label: "macOS", icon: <LaptopOutlined />, color: PLATFORM_COLORS.macos },
  windows: { label: "Windows", icon: <WindowsOutlined />, color: PLATFORM_COLORS.windows },
  linux: { label: "Linux", icon: <DesktopOutlined />, color: PLATFORM_COLORS.linux },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const PlatformDistributionChart = ({ data, isLoading }: PlatformDistributionChartProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  const platforms = data || [];
  const totalUsers = platforms.reduce((sum, p) => sum + p.userCount, 0);
  const totalDevices = platforms.reduce((sum, p) => sum + p.deviceCount, 0);
  const chartData = platforms.map((item) => {
    const key = item.platform?.toLowerCase() || "unknown";
    const config = PLATFORM_CONFIG[key] || { label: item.platform || "Unknown", icon: <MobileOutlined />, color: CHART_COLORS.primary };
    return {
      platform: config.label,
      value: item.userCount,
      devices: item.deviceCount,
      color: config.color,
      percent: totalUsers > 0 ? ((item.userCount / totalUsers) * 100).toFixed(1) : "0",
    };
  }).sort((a, b) => b.value - a.value);
  const colorRange = chartData.map((d) => d.color);
  const config = {
    data: chartData,
    angleField: "value",
    colorField: "platform",
    radius: 0.85,
    innerRadius: 0.65,
    scale: {
      color: { range: colorRange },
    },
    label: {
      text: (d: { platform: string; percent: string }) => `${d.percent}%`,
      position: "outside",
      style: { fontSize: 12, fontWeight: 500 },
      connector: { stroke: "#ccc" },
    },
    legend: false,
    tooltip: {
      title: (d: { platform: string }) => d.platform,
      items: [
        { channel: "y", name: t("platform.users"), valueFormatter: (v: number) => v.toLocaleString() },
      ],
    },
    annotations: [
      {
        type: "text",
        style: {
          text: formatNumber(totalUsers),
          x: "50%",
          y: "45%",
          textAlign: "center",
          fontSize: 24,
          fontWeight: 600,
          fill: CHART_COLORS.primary,
        },
      },
      {
        type: "text",
        style: {
          text: t("platform.users"),
          x: "50%",
          y: "55%",
          textAlign: "center",
          fontSize: 12,
          fill: token.colorTextSecondary,
        },
      },
    ],
    animate: { enter: { type: "waveIn" } },
  };
  const PlatformCard = ({ item }: { item: typeof chartData[0] }) => {
    const key = item.platform.toLowerCase();
    const platformConfig = PLATFORM_CONFIG[key] || { icon: <MobileOutlined />, color: CHART_COLORS.primary };
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: 8,
          background: `${item.color}08`,
          border: `1px solid ${item.color}25`,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: item.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 18,
            marginRight: 12,
          }}
        >
          {platformConfig.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{item.platform}</span>
            <span style={{ fontWeight: 600, color: item.color }}>{formatNumber(item.value)}</span>
          </div>
          <Progress
            percent={parseFloat(item.percent)}
            size="small"
            showInfo={false}
            strokeColor={item.color}
            trailColor={`${item.color}20`}
            style={{ margin: 0 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: token.colorTextSecondary }}>
            <span>{item.percent}% {t("platform.ofUsers")}</span>
            <span>{formatNumber(item.devices)} {t("platform.devices")}</span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Card
      title={
        <span>
          <MobileOutlined style={{ marginRight: 8 }} />
          {t("charts.platformDistribution")}
        </span>
      }
      extra={
        <Tag color="purple">{platforms.length} {t("platform.platforms")}</Tag>
      }
      loading={isLoading}
      style={{ height: "100%" }}
      bodyStyle={{ padding: "16px 20px" }}
    >
      {chartData.length === 0 ? (
        <Empty description={t("platform.noData")} style={{ height: 300, display: "flex", flexDirection: "column", justifyContent: "center" }} />
      ) : (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card size="small" style={{ textAlign: "center", background: token.colorFillQuaternary }}>
                <Statistic
                  title={<span style={{ fontSize: 12 }}>{t("stats.totalUsers")}</span>}
                  value={totalUsers}
                  formatter={(v) => formatNumber(Number(v))}
                  valueStyle={{ fontSize: 18, color: CHART_COLORS.primary }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ textAlign: "center", background: token.colorFillQuaternary }}>
                <Statistic
                  title={<span style={{ fontSize: 12 }}>{t("stats.totalDevices")}</span>}
                  value={totalDevices}
                  formatter={(v) => formatNumber(Number(v))}
                  valueStyle={{ fontSize: 18, color: CHART_COLORS.purple }}
                />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Pie {...config} height={200} />
          </div>
          <div>
            {chartData.map((item, index) => (
              <PlatformCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
