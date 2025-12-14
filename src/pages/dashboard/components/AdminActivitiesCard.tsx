import { Card, Timeline, Tag, Typography, Empty, Tooltip, Avatar } from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
  BellOutlined,
  ExportOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  PictureOutlined,
  SafetyOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { AuditLog } from "../../../types/dashboard.types";
import { CHART_COLORS } from "../../../types/dashboard.types";

const { Text } = Typography;

interface AdminActivitiesCardProps {
  data?: AuditLog[];
  isLoading?: boolean;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  BAN_USER: { icon: <StopOutlined />, color: CHART_COLORS.error },
  UNBAN_USER: { icon: <CheckCircleOutlined />, color: CHART_COLORS.success },
  DELETE_USER: { icon: <DeleteOutlined />, color: CHART_COLORS.error },
  UPDATE_USER: { icon: <EditOutlined />, color: CHART_COLORS.primary },
  VERIFY_USER: { icon: <SafetyOutlined />, color: CHART_COLORS.success },
  UNVERIFY_USER: { icon: <SafetyOutlined />, color: CHART_COLORS.warning },
  LOGOUT_USER: { icon: <LogoutOutlined />, color: CHART_COLORS.warning },
  BULK_UPDATE_USERS: { icon: <TeamOutlined />, color: CHART_COLORS.purple },
  BULK_UPDATE_MESSAGES: { icon: <FileTextOutlined />, color: CHART_COLORS.purple },
  BULK_UPDATE_ROOMS: { icon: <TeamOutlined />, color: CHART_COLORS.purple },
  BULK_REMOVE_ROOM_MEMBERS: { icon: <TeamOutlined />, color: CHART_COLORS.warning },
  BULK_UPDATE_STORIES: { icon: <PictureOutlined />, color: CHART_COLORS.purple },
  BULK_UPDATE_REPORTS: { icon: <FileTextOutlined />, color: CHART_COLORS.purple },
  BULK_REMOVE_BANS: { icon: <CheckCircleOutlined />, color: CHART_COLORS.success },
  UPDATE_APP_CONFIG: { icon: <SettingOutlined />, color: CHART_COLORS.primary },
  RESET_APP_CONFIG: { icon: <SettingOutlined />, color: CHART_COLORS.warning },
  BULK_UPDATE_VERSIONS: { icon: <SettingOutlined />, color: CHART_COLORS.primary },
  BULK_UPDATE_COUNTRIES: { icon: <SettingOutlined />, color: CHART_COLORS.primary },
  BULK_UPDATE_STICKER_PACKS: { icon: <PictureOutlined />, color: CHART_COLORS.primary },
  BULK_UPDATE_STICKERS: { icon: <PictureOutlined />, color: CHART_COLORS.primary },
  CREATE_NOTIFICATION: { icon: <BellOutlined />, color: CHART_COLORS.cyan },
  SEND_NOTIFICATION_ALL: { icon: <BellOutlined />, color: CHART_COLORS.cyan },
  SEND_NOTIFICATION_TARGETED: { icon: <BellOutlined />, color: CHART_COLORS.cyan },
  DELETE_NOTIFICATION: { icon: <DeleteOutlined />, color: CHART_COLORS.error },
  EXPORT_USERS: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_MESSAGES: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_REPORTS: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_AUDIT_LOGS: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_STORIES: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_CALLS: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  EXPORT_ANALYTICS: { icon: <ExportOutlined />, color: CHART_COLORS.orange },
  ADMIN_LOGIN: { icon: <LoginOutlined />, color: CHART_COLORS.success },
  ADMIN_LOGOUT: { icon: <LogoutOutlined />, color: CHART_COLORS.warning },
  CHANGE_PASSWORD: { icon: <SafetyOutlined />, color: CHART_COLORS.primary },
};

const TARGET_TYPE_ICONS: Record<string, React.ReactNode> = {
  user: <UserOutlined />,
  message: <FileTextOutlined />,
  room: <TeamOutlined />,
  story: <PictureOutlined />,
  report: <FileTextOutlined />,
  ban: <StopOutlined />,
  config: <SettingOutlined />,
  version: <SettingOutlined />,
  country: <SettingOutlined />,
  sticker_pack: <PictureOutlined />,
  notification: <BellOutlined />,
  export: <ExportOutlined />,
  auth: <SafetyOutlined />,
};

const formatTimeAgo = (dateStr: string, t: (key: string) => string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return t("adminActivities.justNow");
  if (diffMins < 60) return `${diffMins}${t("adminActivities.mAgo")}`;
  if (diffHours < 24) return `${diffHours}${t("adminActivities.hAgo")}`;
  if (diffDays < 7) return `${diffDays}${t("adminActivities.dAgo")}`;
  return date.toLocaleDateString();
};

const getAdminInitials = (email: string): string => {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

const getAdminColor = (email: string): string => {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.purple,
    CHART_COLORS.cyan,
    CHART_COLORS.orange,
    CHART_COLORS.magenta,
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const AdminActivitiesCard = ({ data, isLoading }: AdminActivitiesCardProps) => {
  const { t } = useTranslation("dashboard");
  if (isLoading) {
    return (
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8 }} />
            {t("adminActivities.title")}
          </span>
        }
        loading
        style={{ height: "100%" }}
      />
    );
  }
  const activities = data || [];
  return (
    <Card
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          {t("adminActivities.title")}
        </span>
      }
      extra={<Tag color="blue">{activities.length} {t("adminActivities.recent")}</Tag>}
      style={{ height: "100%" }}
      bodyStyle={{ maxHeight: 500, overflow: "auto", padding: "12px 24px" }}
    >
      {activities.length === 0 ? (
        <Empty description={t("adminActivities.noActivities")} />
      ) : (
        <Timeline
          items={activities.map((activity) => {
            const config = ACTION_CONFIG[activity.action] || {
              icon: <SettingOutlined />,
              color: CHART_COLORS.primary,
            };
            const actionLabel = t(`adminActivities.actions.${activity.action}`, {
              defaultValue: activity.action.replace(/_/g, " ").toLowerCase(),
            });
            const targetIcon = TARGET_TYPE_ICONS[activity.targetType] || <SettingOutlined />;
            return {
              color: config.color,
              dot: (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `${config.color}15`,
                    border: `2px solid ${config.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: config.color,
                  }}
                >
                  {config.icon}
                </div>
              ),
              children: (
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ flex: 1 }}>
                      {actionLabel}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {formatTimeAgo(activity.createdAt, t)}
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Tooltip title={activity.adminEmail}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Avatar
                          size={20}
                          style={{
                            background: getAdminColor(activity.adminEmail),
                            fontSize: 10,
                          }}
                        >
                          {getAdminInitials(activity.adminEmail)}
                        </Avatar>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {activity.adminEmail.split("@")[0]}
                        </Text>
                      </div>
                    </Tooltip>
                    {activity.targetType && (
                      <Tag
                        icon={targetIcon}
                        style={{ margin: 0, fontSize: 11 }}
                      >
                        {t(`adminActivities.targetTypes.${activity.targetType}`, { defaultValue: activity.targetType })}
                      </Tag>
                    )}
                    {activity.targetId && (
                      <Tooltip title={`${t("adminActivities.targetId")}: ${activity.targetId}`}>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, fontFamily: "monospace" }}
                          copyable={{ text: activity.targetId }}
                        >
                          {activity.targetId.substring(0, 8)}...
                        </Text>
                      </Tooltip>
                    )}
                    {activity.targetIds && activity.targetIds.length > 0 && (
                      <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                        {activity.targetIds.length} {t("adminActivities.items")}
                      </Tag>
                    )}
                  </div>
                  {activity.ip && (
                    <Text type="secondary" style={{ fontSize: 10, display: "block", marginTop: 4 }}>
                      {t("adminActivities.ip")}: {activity.ip}
                    </Text>
                  )}
                </div>
              ),
            };
          })}
        />
      )}
    </Card>
  );
};
