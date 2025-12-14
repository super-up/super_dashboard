import { Card, Empty, Row, Col, Statistic, Table, Tag, Segmented, theme } from "antd";
import { Area } from "@ant-design/charts";
import { useState, useMemo } from "react";
import {
  UserAddOutlined,
  MessageOutlined,
  CameraOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { TimelineData, TimeSeriesData } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface ActivityTimelineChartProps {
  data?: TimelineData;
  isLoading?: boolean;
}

type ViewMode = "all" | "users" | "messages" | "stories";

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const calculateStats = (data: TimeSeriesData[]) => {
  if (!data || data.length === 0) return { total: 0, avg: 0, max: 0, min: 0, trend: 0 };
  const values = data.map((d) => d.count);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / values.length);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
  const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  return { total, avg, max, min, trend };
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const ActivityTimelineChart = ({ data, isLoading }: ActivityTimelineChartProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const chartData = useMemo(() => {
    const result: { date: string; value: number; category: string; formattedDate: string }[] = [];
    if (!data) return result;
    const addData = (items: TimeSeriesData[], category: string) => {
      items.forEach((item) => {
        result.push({
          date: item.date,
          value: item.count,
          category,
          formattedDate: formatDate(item.date),
        });
      });
    };
    if (viewMode === "all" || viewMode === "users") addData(data.users, t("timeline.users"));
    if (viewMode === "all" || viewMode === "messages") addData(data.messages, t("timeline.messages"));
    if (viewMode === "all" || viewMode === "stories") addData(data.stories, t("timeline.stories"));
    return result;
  }, [data, viewMode, t]);
  const stats = useMemo(() => {
    if (!data) return { users: null, messages: null, stories: null };
    return {
      users: calculateStats(data.users),
      messages: calculateStats(data.messages),
      stories: calculateStats(data.stories),
    };
  }, [data]);
  const tableData = useMemo(() => {
    if (!data) return [];
    const dateMap = new Map<string, { date: string; users: number; messages: number; stories: number }>();
    data.users.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, users: 0, messages: 0, stories: 0 });
      }
      dateMap.get(item.date)!.users = item.count;
    });
    data.messages.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, users: 0, messages: 0, stories: 0 });
      }
      dateMap.get(item.date)!.messages = item.count;
    });
    data.stories.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, users: 0, messages: 0, stories: 0 });
      }
      dateMap.get(item.date)!.stories = item.count;
    });
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [data]);
  const colorMap: Record<string, string> = {
    [t("timeline.users")]: CHART_COLORS.primary,
    [t("timeline.messages")]: CHART_COLORS.purple,
    [t("timeline.stories")]: CHART_COLORS.cyan,
  };
  const config = {
    data: chartData,
    xField: "formattedDate",
    yField: "value",
    seriesField: "category",
    colorField: "category",
    smooth: true,
    style: {
      fillOpacity: 0.3,
    },
    line: {
      style: {
        lineWidth: 2,
      },
    },
    scale: {
      color: {
        range: viewMode === "all"
          ? [CHART_COLORS.primary, CHART_COLORS.purple, CHART_COLORS.cyan]
          : [colorMap[t(`timeline.${viewMode}`)] || CHART_COLORS.primary],
      },
    },
    axis: {
      x: {
        label: {
          autoRotate: true,
          style: { fontSize: 11 },
        },
        tickCount: 10,
      },
      y: {
        label: {
          formatter: (v: number) => formatNumber(v),
          style: { fontSize: 11 },
        },
        grid: {
          line: {
            style: { stroke: token.colorBorderSecondary, lineDash: [4, 4] },
          },
        },
      },
    },
    legend: {
      position: "top-right" as const,
      itemName: {
        style: { fontSize: 12 },
      },
    },
    tooltip: {
      shared: true,
      showMarkers: true,
      title: (d: { formattedDate: string }) => d.formattedDate,
      items: [
        {
          channel: "y",
          valueFormatter: (v: number) => formatNumber(v),
        },
      ],
    },
    point: {
      shapeField: "circle",
      sizeField: 4,
    },
    animate: { enter: { type: "fadeIn" } },
  };
  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) return <Tag color="default">{t("timeline.stable")}</Tag>;
    return value > 0 ? (
      <span style={{ color: CHART_COLORS.success, fontSize: 12 }}>
        <RiseOutlined /> +{value.toFixed(1)}%
      </span>
    ) : (
      <span style={{ color: CHART_COLORS.error, fontSize: 12 }}>
        <FallOutlined /> {value.toFixed(1)}%
      </span>
    );
  };
  const tableColumns = [
    {
      title: t("timeline.date"),
      dataIndex: "date",
      key: "date",
      render: (date: string) => formatDate(date),
    },
    {
      title: (
        <span>
          <UserAddOutlined style={{ color: CHART_COLORS.primary, marginRight: 4 }} />
          {t("timeline.users")}
        </span>
      ),
      dataIndex: "users",
      key: "users",
      render: (v: number) => <span style={{ color: CHART_COLORS.primary, fontWeight: 500 }}>{formatNumber(v)}</span>,
      align: "right" as const,
    },
    {
      title: (
        <span>
          <MessageOutlined style={{ color: CHART_COLORS.purple, marginRight: 4 }} />
          {t("timeline.messages")}
        </span>
      ),
      dataIndex: "messages",
      key: "messages",
      render: (v: number) => <span style={{ color: CHART_COLORS.purple, fontWeight: 500 }}>{formatNumber(v)}</span>,
      align: "right" as const,
    },
    {
      title: (
        <span>
          <CameraOutlined style={{ color: CHART_COLORS.cyan, marginRight: 4 }} />
          {t("timeline.stories")}
        </span>
      ),
      dataIndex: "stories",
      key: "stories",
      render: (v: number) => <span style={{ color: CHART_COLORS.cyan, fontWeight: 500 }}>{formatNumber(v)}</span>,
      align: "right" as const,
    },
  ];
  return (
    <Card
      title={t("charts.activityTimeline")}
      loading={isLoading}
      extra={
        <Segmented
          size="small"
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          options={[
            { label: t("timeline.all"), value: "all" },
            { label: t("timeline.users"), value: "users" },
            { label: t("timeline.messages"), value: "messages" },
            { label: t("timeline.stories"), value: "stories" },
          ]}
        />
      }
    >
      {chartData.length > 0 ? (
        <>
          {/* Summary Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: `${CHART_COLORS.primary}08`, border: `1px solid ${CHART_COLORS.primary}30` }}>
                <Statistic
                  title={<span style={{ color: CHART_COLORS.primary }}><UserAddOutlined /> {t("timeline.newUsers")}</span>}
                  value={stats.users?.total || 0}
                  formatter={(v) => formatNumber(Number(v))}
                  suffix={<TrendIndicator value={stats.users?.trend || 0} />}
                />
                <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 4 }}>
                  {t("timeline.avg")}: {formatNumber(stats.users?.avg || 0)}{t("timeline.perDay")} · {t("timeline.max")}: {formatNumber(stats.users?.max || 0)}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: `${CHART_COLORS.purple}08`, border: `1px solid ${CHART_COLORS.purple}30` }}>
                <Statistic
                  title={<span style={{ color: CHART_COLORS.purple }}><MessageOutlined /> {t("timeline.messages")}</span>}
                  value={stats.messages?.total || 0}
                  formatter={(v) => formatNumber(Number(v))}
                  suffix={<TrendIndicator value={stats.messages?.trend || 0} />}
                />
                <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 4 }}>
                  {t("timeline.avg")}: {formatNumber(stats.messages?.avg || 0)}{t("timeline.perDay")} · {t("timeline.max")}: {formatNumber(stats.messages?.max || 0)}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: `${CHART_COLORS.cyan}08`, border: `1px solid ${CHART_COLORS.cyan}30` }}>
                <Statistic
                  title={<span style={{ color: CHART_COLORS.cyan }}><CameraOutlined /> {t("timeline.stories")}</span>}
                  value={stats.stories?.total || 0}
                  formatter={(v) => formatNumber(Number(v))}
                  suffix={<TrendIndicator value={stats.stories?.trend || 0} />}
                />
                <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 4 }}>
                  {t("timeline.avg")}: {formatNumber(stats.stories?.avg || 0)}{t("timeline.perDay")} · {t("timeline.max")}: {formatNumber(stats.stories?.max || 0)}
                </div>
              </Card>
            </Col>
          </Row>
          {/* Chart */}
          <Area {...config} height={280} />
          {/* Recent Data Table */}
          <div style={{ marginTop: 16 }}>
            <Table
              size="small"
              dataSource={tableData}
              columns={tableColumns}
              pagination={false}
              rowKey="date"
              title={() => <span style={{ fontWeight: 500, fontSize: 13 }}>{t("timeline.last7DaysBreakdown")}</span>}
            />
          </div>
        </>
      ) : (
        <Empty description={t("timeline.noData")} style={{ height: 300, display: "flex", flexDirection: "column", justifyContent: "center" }} />
      )}
    </Card>
  );
};