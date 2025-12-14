import { Card, theme } from "antd";
import { Area } from "@ant-design/charts";
import { useTranslation } from "react-i18next";
import type { TimeSeriesData } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface UserGrowthChartProps {
  data?: TimeSeriesData[];
  isLoading?: boolean;
}

export const UserGrowthChart = ({ data, isLoading }: UserGrowthChartProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  const chartData = data || [];
  const config = {
    data: chartData,
    xField: "date",
    yField: "count",
    smooth: true,
    style: {
      fill: `linear-gradient(90deg, ${CHART_COLORS.primary}22 0%, ${CHART_COLORS.primary}88 100%)`,
      fillOpacity: 0.6,
    },
    line: {
      style: {
        stroke: CHART_COLORS.primary,
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
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
        },
      },
    },
    tooltip: {
      title: "date",
      items: [{ channel: "y", name: t("messages.newUsers") }],
    },
    animate: { enter: { type: "growInY" } },
  };
  return (
    <Card
      title={t("charts.userRegistrations")}
      loading={isLoading}
      style={{ height: "100%" }}
    >
      {chartData.length > 0 ? (
        <Area {...config} height={250} />
      ) : (
        <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}>
          {t("messages.noDataAvailable")}
        </div>
      )}
    </Card>
  );
};
