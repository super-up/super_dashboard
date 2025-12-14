import { useCustom } from "@refinedev/core";
import { useMemo } from "react";
import type {
  TimeRange,
  DateRange,
  DashboardData,
  TimeSeriesData,
  ActiveUsersStats,
  CountryData,
  PlatformData,
  TimelineData,
  AuditLog,
  AuditLogResponse,
} from "../types/dashboard.types";

const getDaysFromRange = (range: TimeRange, customRange?: DateRange): number => {
  if (range === "custom" && customRange) {
    const start = new Date(customRange.startDate);
    const end = new Date(customRange.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  switch (range) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    default: return 30;
  }
};

const buildRangeParam = (range: TimeRange, customRange?: DateRange): string => {
  if (range === "custom" && customRange) {
    return `startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
  }
  return `range=${range}`;
};

const buildDaysParam = (range: TimeRange, customRange?: DateRange): string => {
  const days = getDaysFromRange(range, customRange);
  if (range === "custom" && customRange) {
    return `days=${days}&startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
  }
  return `days=${days}`;
};

export const useDashboardData = (range: TimeRange, customRange?: DateRange) => {
  const days = getDaysFromRange(range, customRange);
  const rangeParam = buildRangeParam(range, customRange);
  const daysParam = buildDaysParam(range, customRange);
  const { query: dashboardQuery } = useCustom({
    url: "admin/analytics/dashboard",
    method: "get",
  });
  const { query: userGrowthQuery } = useCustom({
    url: `admin/analytics/users/growth?${rangeParam}`,
    method: "get",
  });
  const { query: dauQuery } = useCustom({
    url: `admin/analytics/users/dau?${daysParam}`,
    method: "get",
  });
  const { query: activeUsersQuery } = useCustom({
    url: "admin/analytics/users/active",
    method: "get",
  });
  const { query: countriesQuery } = useCustom({
    url: "admin/analytics/users/by-country",
    method: "get",
  });
  const { query: platformsQuery } = useCustom({
    url: "admin/analytics/users/by-platform",
    method: "get",
  });
  const { query: messageGrowthQuery } = useCustom({
    url: `admin/analytics/messages/growth?${rangeParam}`,
    method: "get",
  });
  const { query: timelineQuery } = useCustom({
    url: `admin/analytics/timeline?${rangeParam}`,
    method: "get",
  });
  const { query: auditQuery } = useCustom({
    url: "admin/audit?limit=15",
    method: "get",
  });
  const isLoading = useMemo(() => {
    return (
      dashboardQuery.isLoading ||
      userGrowthQuery.isLoading ||
      dauQuery.isLoading ||
      activeUsersQuery.isLoading ||
      countriesQuery.isLoading ||
      platformsQuery.isLoading ||
      messageGrowthQuery.isLoading ||
      timelineQuery.isLoading
    );
  }, [
    dashboardQuery.isLoading,
    userGrowthQuery.isLoading,
    dauQuery.isLoading,
    activeUsersQuery.isLoading,
    countriesQuery.isLoading,
    platformsQuery.isLoading,
    messageGrowthQuery.isLoading,
    timelineQuery.isLoading,
  ]);
  const refetchAll = () => {
    dashboardQuery.refetch();
    userGrowthQuery.refetch();
    dauQuery.refetch();
    activeUsersQuery.refetch();
    countriesQuery.refetch();
    platformsQuery.refetch();
    messageGrowthQuery.refetch();
    timelineQuery.refetch();
    auditQuery.refetch();
  };
  // Extract audit logs from paginated response
  const auditData = auditQuery.data?.data as AuditLogResponse | undefined;
  const auditLogs = auditData?.docs || (Array.isArray(auditQuery.data?.data) ? auditQuery.data?.data as AuditLog[] : []);
  return {
    isLoading,
    dashboard: dashboardQuery.data?.data as DashboardData | undefined,
    userGrowth: userGrowthQuery.data?.data as TimeSeriesData[] | undefined,
    dau: dauQuery.data?.data as { date: string; activeUsers: number }[] | undefined,
    activeUsers: activeUsersQuery.data?.data as ActiveUsersStats | undefined,
    countries: countriesQuery.data?.data as CountryData[] | undefined,
    platforms: platformsQuery.data?.data as PlatformData[] | undefined,
    messageGrowth: messageGrowthQuery.data?.data as TimeSeriesData[] | undefined,
    timeline: timelineQuery.data?.data as TimelineData | undefined,
    auditLogs,
    isAuditLoading: auditQuery.isLoading,
    refetchAll,
    days,
  };
};
