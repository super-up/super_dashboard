import { Card, Col, Row, Statistic, theme } from "antd";
import { Pie } from "@ant-design/charts";
import { PhoneOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { CallStats, RoomStats } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

interface CommunicationStatsCardProps {
  callStats?: CallStats;
  roomStats?: RoomStats;
  isLoading?: boolean;
}

export const CommunicationStatsCard = ({
  callStats,
  roomStats,
  isLoading,
}: CommunicationStatsCardProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation("dashboard");
  const callData = callStats
    ? [
        { type: t("communication.finished"), value: callStats.finished, color: CHART_COLORS.success },
        { type: t("communication.missed"), value: callStats.missed, color: CHART_COLORS.error },
        { type: t("communication.other"), value: callStats.total - callStats.finished - callStats.missed, color: CHART_COLORS.warning },
      ].filter((d) => d.value > 0)
    : [];
  const roomData = roomStats
    ? [
        { type: t("communication.groups"), value: roomStats.groups, color: CHART_COLORS.orange },
        { type: t("stats.broadcasts"), value: roomStats.broadcasts, color: CHART_COLORS.purple },
        { type: t("communication.direct"), value: roomStats.singles, color: CHART_COLORS.primary },
      ].filter((d) => d.value > 0)
    : [];
  const miniPieConfig = {
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: false,
    legend: false,
    tooltip: {
      items: [{ channel: "y", name: t("messages.count") }],
    },
    animate: { enter: { type: "waveIn" } },
  };
  return (
    <Card title={t("charts.communicationStats")} loading={isLoading} style={{ height: "100%" }}>
      <Row gutter={24}>
        <Col span={12}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <PhoneOutlined style={{ fontSize: 24, color: CHART_COLORS.magenta }} />
            <div style={{ fontWeight: 600, marginTop: 8 }}>{t("communication.calls")}</div>
          </div>
          {callData.length > 0 ? (
            <Pie {...miniPieConfig} data={callData} height={120} />
          ) : (
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}>
              {t("communication.noCallData")}
            </div>
          )}
          {callStats && (
            <Row gutter={8} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title={t("communication.finished")}
                  value={callStats.finished}
                  valueStyle={{ fontSize: 16, color: CHART_COLORS.success }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t("communication.missed")}
                  value={callStats.missed}
                  valueStyle={{ fontSize: 16, color: CHART_COLORS.error }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>
          )}
        </Col>
        <Col span={12}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <TeamOutlined style={{ fontSize: 24, color: CHART_COLORS.orange }} />
            <div style={{ fontWeight: 600, marginTop: 8 }}>{t("communication.rooms")}</div>
          </div>
          {roomData.length > 0 ? (
            <Pie {...miniPieConfig} data={roomData} height={120} />
          ) : (
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: token.colorTextTertiary }}>
              {t("communication.noRoomData")}
            </div>
          )}
          {roomStats && (
            <Row gutter={8} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Statistic title={t("communication.groups")} value={roomStats.groups} valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={8}>
                <Statistic title={t("communication.broadcast")} value={roomStats.broadcasts} valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={8}>
                <Statistic title={t("communication.direct")} value={roomStats.singles} valueStyle={{ fontSize: 14 }} />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Card>
  );
};
