import { Card, Table, Tag, Empty, Progress, Row, Col, Statistic, theme } from "antd";
import { Bar } from "@ant-design/charts";
import { GlobalOutlined, TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { CountryData } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface WorldMapChartProps {
  data?: CountryData[];
  isLoading?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const WorldMapChart = ({ data, isLoading }: WorldMapChartProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  if (isLoading) {
    return <Card title={t("charts.usersbyCountry")} loading style={{ height: "100%" }} />;
  }
  const countryData = data || [];
  const totalUsers = countryData.reduce((sum, c) => sum + c.count, 0);
  const top10 = countryData.slice(0, 10);
  const topCountry = countryData[0];
  const chartData = top10.map((c) => ({
    country: `${c.countryEmoji} ${c.countryName}`,
    users: c.count,
    percent: ((c.count / totalUsers) * 100).toFixed(1),
  })).reverse();
  const config = {
    data: chartData,
    xField: "users",
    yField: "country",
    colorField: "country",
    label: {
      text: (d: { users: number; percent: string }) => `${formatNumber(d.users)} (${d.percent}%)`,
      position: "right" as const,
      style: { fontSize: 11, fill: token.colorTextSecondary },
    },
    scale: {
      color: {
        range: [
          "#bae0ff", "#91caff", "#69b1ff", "#4096ff", "#1890ff",
          "#096dd9", "#0958d9", "#003eb3", "#002c8c", "#001d66",
        ].reverse(),
      },
    },
    axis: {
      y: {
        label: {
          style: { fontSize: 12 },
        },
        grid: null,
      },
      x: {
        label: {
          formatter: (v: number) => formatNumber(v),
          style: { fontSize: 10 },
        },
        grid: {
          line: { style: { stroke: token.colorBorderSecondary, lineDash: [4, 4] } },
        },
      },
    },
    legend: false,
    tooltip: {
      items: [
        {
          channel: "x",
          name: t("country.users"),
          valueFormatter: (v: number) => v.toLocaleString(),
        },
      ],
    },
    style: {
      radiusTopRight: 4,
      radiusBottomRight: 4,
    },
    animate: { enter: { type: "growInX" } },
  };
  const tableColumns = [
    {
      title: "#",
      key: "rank",
      width: 40,
      render: (_: unknown, __: CountryData, index: number) => (
        <span style={{ color: index < 3 ? CHART_COLORS.warning : token.colorTextTertiary, fontWeight: index < 3 ? 600 : 400 }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: t("country.country"),
      dataIndex: "countryName",
      key: "countryName",
      render: (text: string, record: CountryData) => (
        <span style={{ fontWeight: 500 }}>
          <span style={{ marginRight: 6 }}>{record.countryEmoji}</span>
          {text || "Unknown"}
        </span>
      ),
    },
    {
      title: t("country.users"),
      dataIndex: "count",
      key: "count",
      width: 100,
      align: "right" as const,
      render: (v: number) => (
        <span style={{ fontWeight: 500, color: CHART_COLORS.primary }}>
          {formatNumber(v)}
        </span>
      ),
    },
    {
      title: t("country.share"),
      key: "share",
      width: 120,
      render: (_: unknown, record: CountryData) => {
        const percent = (record.count / totalUsers) * 100;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={CHART_COLORS.primary}
              style={{ width: 60, margin: 0 }}
            />
            <span style={{ fontSize: 12, color: token.colorTextSecondary, minWidth: 40 }}>
              {percent.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];
  return (
    <Card
      title={
        <span>
          <GlobalOutlined style={{ marginRight: 8 }} />
          {t("charts.usersbyCountry")}
        </span>
      }
      extra={<Tag color="blue">{countryData.length} {t("country.countries")}</Tag>}
      style={{ height: "100%" }}
      bodyStyle={{ padding: "16px" }}
    >
      {countryData.length === 0 ? (
        <Empty description={t("country.noData")} />
      ) : (
        <div>
          {/* Top Country Highlight */}
          {topCountry && (
            <div
              style={{
                background: `linear-gradient(135deg, ${CHART_COLORS.primary}10 0%, ${CHART_COLORS.primary}05 100%)`,
                border: `1px solid ${CHART_COLORS.primary}30`,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Row gutter={[16, 12]} align="middle">
                <Col xs={4} sm="auto">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: CHART_COLORS.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    <TrophyOutlined style={{ color: "#fff" }} />
                  </div>
                </Col>
                <Col xs={20} sm="auto" flex={1}>
                  <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{t("country.topCountry")}</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {topCountry.countryEmoji} {topCountry.countryName}
                  </div>
                </Col>
                <Col xs={12} sm="auto">
                  <Statistic
                    value={topCountry.count}
                    formatter={(v) => formatNumber(Number(v))}
                    suffix={<span style={{ fontSize: 12, color: token.colorTextSecondary }}>{t("country.users")}</span>}
                    valueStyle={{ fontSize: 20, color: CHART_COLORS.primary }}
                  />
                </Col>
                <Col xs={12} sm="auto">
                  <Statistic
                    value={((topCountry.count / totalUsers) * 100).toFixed(1)}
                    suffix="%"
                    valueStyle={{ fontSize: 20, color: CHART_COLORS.success }}
                  />
                </Col>
              </Row>
            </div>
          )}
          {/* Bar Chart */}
          <div style={{ marginBottom: 16 }}>
            <Bar {...config} height={280} />
          </div>
          {/* Full Country Table */}
          <Table
            dataSource={countryData}
            columns={tableColumns}
            rowKey="countryId"
            size="small"
            pagination={{ pageSize: 5, size: "small", showSizeChanger: false }}
            scroll={{ x: 400, y: 200 }}
            style={{ marginTop: 8 }}
          />
        </div>
      )}
    </Card>
  );
};