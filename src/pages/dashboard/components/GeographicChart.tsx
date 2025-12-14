import { Card, Empty } from "antd";
import { Bar } from "@ant-design/charts";
import type { CountryData } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface GeographicChartProps {
  data?: CountryData[];
  isLoading?: boolean;
}

export const GeographicChart = ({ data, isLoading }: GeographicChartProps) => {
  const chartData = (data || []).slice(0, 10).map((item) => ({
    country: `${item.countryEmoji || ""} ${item.countryName || "Unknown"}`.trim(),
    users: item.count,
  }));
  const config = {
    data: chartData,
    xField: "users",
    yField: "country",
    sort: { reverse: true, by: "x" },
    style: {
      fill: CHART_COLORS.primary,
      fillOpacity: 0.8,
      radius: 4,
    },
    axis: {
      x: {
        label: {
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
        },
      },
    },
    label: {
      text: "users",
      position: "right",
      style: { fill: "#666", fontSize: 12 },
      formatter: (v: number) => v.toLocaleString(),
    },
    tooltip: {
      items: [{ channel: "x", name: "Users" }],
    },
    animate: { enter: { type: "growInX" } },
  };
  return (
    <Card title="Top Countries" loading={isLoading} style={{ height: "100%" }}>
      {chartData.length > 0 ? (
        <Bar {...config} height={300} />
      ) : (
        <Empty description="No geographic data available" style={{ height: 300, display: "flex", flexDirection: "column", justifyContent: "center" }} />
      )}
    </Card>
  );
};
