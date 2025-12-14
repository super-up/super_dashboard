import { useState, useMemo } from "react";
import { Typography, Segmented, Space, Button, Row, Col, Spin, DatePicker, Tag } from "antd";
import { ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useDashboardData } from "../../hooks/useDashboardData";
import type { TimeRange, DateRange } from "../../types/dashboard.types";
import {
  StatsRow,
  UserGrowthChart,
  ActiveUsersCard,
  MessageAnalyticsSection,
  PlatformDistributionChart,
  CommunicationStatsCard,
  ActivityTimelineChart,
  WorldMapChart,
  AdminActivitiesCard,
} from "./components";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const effectiveCustomRange = useMemo(() => {
    if (timeRange === "custom" && customRange) {
      return customRange;
    }
    return undefined;
  }, [timeRange, customRange]);
  const {
    isLoading,
    dashboard,
    userGrowth,
    activeUsers,
    messageGrowth,
    countries,
    platforms,
    timeline,
    auditLogs,
    isAuditLoading,
    refetchAll,
    days,
  } = useDashboardData(timeRange, effectiveCustomRange);
  const handleRangeChange = (value: string) => {
    if (value === "custom") {
      setShowDatePicker(true);
      setTimeRange("custom");
    } else {
      setShowDatePicker(false);
      setTimeRange(value as TimeRange);
      setCustomRange(undefined);
    }
  };
  const handleDatePickerChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setCustomRange({
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      });
      setTimeRange("custom");
    }
  };
  const formatCustomRangeLabel = () => {
    if (customRange) {
      const start = dayjs(customRange.startDate).format("MMM D");
      const end = dayjs(customRange.endDate).format("MMM D, YYYY");
      return `${start} - ${end}`;
    }
    return tc("time.selectDates");
  };
  return (
    <div style={{ padding: "0 0 24px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t("overview")}
          </Title>
          {timeRange === "custom" && customRange && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatCustomRangeLabel()} ({days} {tc("time.days")})
            </Text>
          )}
        </div>
        <Space size="middle" wrap>
          <Space.Compact>
            <Segmented
              value={timeRange}
              onChange={(value) => handleRangeChange(value as string)}
              options={[
                { label: tc("time.7days"), value: "7d" },
                { label: tc("time.30days"), value: "30d" },
                { label: tc("time.90days"), value: "90d" },
                { label: tc("time.custom"), value: "custom" },
              ]}
            />
          </Space.Compact>
          {(showDatePicker || timeRange === "custom") && (
            <RangePicker
              size="middle"
              value={
                customRange
                  ? [dayjs(customRange.startDate), dayjs(customRange.endDate)]
                  : null
              }
              onChange={handleDatePickerChange}
              disabledDate={(current) => current && current > dayjs().endOf("day")}
              presets={[
                { label: tc("time.last7Days"), value: [dayjs().subtract(7, "day"), dayjs()] },
                { label: tc("time.last14Days"), value: [dayjs().subtract(14, "day"), dayjs()] },
                { label: tc("time.last30Days"), value: [dayjs().subtract(30, "day"), dayjs()] },
                { label: tc("time.last60Days"), value: [dayjs().subtract(60, "day"), dayjs()] },
                { label: tc("time.last90Days"), value: [dayjs().subtract(90, "day"), dayjs()] },
                { label: tc("time.thisMonth"), value: [dayjs().startOf("month"), dayjs()] },
                { label: tc("time.lastMonth"), value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
                { label: tc("time.thisYear"), value: [dayjs().startOf("year"), dayjs()] },
              ]}
              style={{ width: 280 }}
            />
          )}
          <Button
            icon={<ReloadOutlined spin={isLoading} />}
            onClick={refetchAll}
            disabled={isLoading}
          >
            {tc("actions.refresh")}
          </Button>
        </Space>
      </div>
      {isLoading && !dashboard ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <StatsRow data={dashboard} isLoading={isLoading && !dashboard} />
          <Row gutter={[24, 24]}>
            <Col xs={24} xl={14}>
              <UserGrowthChart data={userGrowth} isLoading={isLoading && !userGrowth} />
            </Col>
            <Col xs={24} xl={10}>
              <ActiveUsersCard data={activeUsers} isLoading={isLoading && !activeUsers} />
            </Col>
          </Row>
          <MessageAnalyticsSection
            growthData={messageGrowth}
            typeData={dashboard?.messages?.byType}
            isLoading={isLoading && !messageGrowth}
          />
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <WorldMapChart data={countries} isLoading={isLoading && !countries} />
            </Col>
            <Col xs={24} lg={10}>
              <PlatformDistributionChart data={platforms} isLoading={isLoading && !platforms} />
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <CommunicationStatsCard
                callStats={dashboard?.calls}
                roomStats={dashboard?.rooms}
                isLoading={isLoading && !dashboard}
              />
            </Col>
            <Col xs={24} lg={12}>
              <AdminActivitiesCard data={auditLogs} isLoading={isAuditLoading} />
            </Col>
          </Row>
          <ActivityTimelineChart data={timeline} isLoading={isLoading && !timeline} />
        </div>
      )}
    </div>
  );
};
