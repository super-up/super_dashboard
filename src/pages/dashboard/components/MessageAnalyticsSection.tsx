import { Card, Col, Row, Table, Tag, theme } from "antd";
import { Area, Pie } from "@ant-design/charts";
import { useTranslation } from "react-i18next";
import type { TimeSeriesData, MessageTypeData } from "../../../types/dashboard.types";
import { CHART_COLORS, MESSAGE_TYPE_LABELS } from "../../../types/dashboard.types";

interface MessageAnalyticsSectionProps {
  growthData?: TimeSeriesData[];
  typeData?: MessageTypeData[];
  isLoading?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  text: CHART_COLORS.primary,
  image: CHART_COLORS.success,
  video: CHART_COLORS.purple,
  voice: CHART_COLORS.orange,
  file: CHART_COLORS.cyan,
  location: CHART_COLORS.magenta,
  contact: CHART_COLORS.warning,
  sticker: "#8884d8",
  allDeleted: CHART_COLORS.error,
  info: "#6B7280",
  call: CHART_COLORS.magenta,
  reply: "#10B981",
};

export const MessageAnalyticsSection = ({
  growthData,
  typeData,
  isLoading,
}: MessageAnalyticsSectionProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  const chartGrowthData = growthData || [];
  const rawTypeData = typeData || [];
  const totalMessages = rawTypeData.reduce((sum, item) => sum + item.count, 0);
  const chartTypeData = rawTypeData
    .filter((item) => item.count > 0)
    .map((item) => ({
      type: MESSAGE_TYPE_LABELS[item.type] || item.type,
      value: item.count,
      percent: totalMessages > 0 ? ((item.count / totalMessages) * 100).toFixed(1) : "0",
    }))
    .sort((a, b) => b.value - a.value);
  const areaConfig = {
    data: chartGrowthData,
    xField: "date",
    yField: "count",
    smooth: true,
    style: {
      fill: `linear-gradient(90deg, ${CHART_COLORS.purple}22 0%, ${CHART_COLORS.purple}88 100%)`,
      fillOpacity: 0.6,
    },
    line: {
      style: {
        stroke: CHART_COLORS.purple,
        strokeWidth: 2,
      },
    },
    axis: {
      x: {
        label: {
          formatter: (v: string) => {
            const parts = v.split("-");
            return parts.length === 3 ? `${parts[1]}/${parts[2]}` : v;
          },
        },
      },
      y: {
        label: {
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)),
        },
      },
    },
    tooltip: {
      title: "date",
      items: [{ channel: "y", name: t("messages.messages") }],
    },
    animate: { enter: { type: "growInY" } },
  };
  const pieConfig = {
    data: chartTypeData,
    angleField: "value",
    colorField: "type",
    radius: 0.85,
    innerRadius: 0.55,
    color: (datum: { type: string }) => {
      const key = Object.keys(MESSAGE_TYPE_LABELS).find(
        (k) => MESSAGE_TYPE_LABELS[k] === datum.type
      );
      return TYPE_COLORS[key || ""] || CHART_COLORS.primary;
    },
    label: {
      text: (d: { type: string; value: number; percent: string }) =>
        d.value > totalMessages * 0.03 ? `${d.percent}%` : "",
      position: "outside",
      style: { fontSize: 11, fontWeight: 500 },
      connector: { style: { stroke: token.colorTextTertiary, strokeWidth: 1 } },
    },
    legend: false,
    tooltip: {
      title: "type",
      items: [
        {
          field: "value",
          name: t("messages.count"),
          valueFormatter: (v: number) => v.toLocaleString(),
        },
      ],
    },
    statistic: {
      title: {
        content: t("messages.total"),
        style: { fontSize: 12, color: token.colorTextSecondary },
      },
      content: {
        content: totalMessages >= 1000
          ? `${(totalMessages / 1000).toFixed(1)}k`
          : totalMessages.toLocaleString(),
        style: { fontSize: 18, fontWeight: 600, color: CHART_COLORS.purple },
      },
    },
    animate: { enter: { type: "waveIn" } },
  };
  const tableColumns = [
    {
      title: t("messages.type"),
      dataIndex: "type",
      key: "type",
      render: (text: string, record: { type: string }) => {
        const key = Object.keys(MESSAGE_TYPE_LABELS).find(
          (k) => MESSAGE_TYPE_LABELS[k] === record.type
        );
        return (
          <Tag color={TYPE_COLORS[key || ""] || CHART_COLORS.primary} style={{ margin: 0 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: t("messages.count"),
      dataIndex: "value",
      key: "value",
      align: "right" as const,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "%",
      dataIndex: "percent",
      key: "percent",
      align: "right" as const,
      render: (v: string) => `${v}%`,
    },
  ];
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title={t("charts.messageActivity")} loading={isLoading} style={{ height: "100%" }}>
          {chartGrowthData.length > 0 ? (
            <Area {...areaConfig} height={300} />
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}>
              {t("messages.noDataAvailable")}
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card
          title={t("charts.messagesByType")}
          loading={isLoading}
          style={{ height: "100%" }}
          bodyStyle={{ padding: "12px 16px" }}
        >
          {chartTypeData.length > 0 ? (
            <div>
              <Pie {...pieConfig} height={160} />
              <Table
                dataSource={chartTypeData}
                columns={tableColumns}
                rowKey="type"
                size="small"
                pagination={false}
                style={{ marginTop: 8 }}
                scroll={{ x: 300, y: 120 }}
              />
            </div>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}>
              {t("messages.noDataAvailable")}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};
