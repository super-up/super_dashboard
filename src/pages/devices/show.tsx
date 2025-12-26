import { useState } from "react";
import { useShow, useNavigation, useNotification } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import {
    Typography,
    Descriptions,
    Avatar,
    Tag,
    Card,
    Row,
    Col,
    Spin,
    Space,
    Button,
    Divider,
    Tooltip,
    Statistic,
    Popconfirm,
    theme,
} from "antd";
import {
    MobileOutlined,
    AppleOutlined,
    AndroidOutlined,
    DesktopOutlined,
    GlobalOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    KeyOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface IDevice {
    _id: string;
    userId?: {
        _id: string;
        fullName: string;
        userImage?: string;
        fullPhone?: string;
        email?: string;
    };
    uId?: string;
    platform?: string;
    clintVersion?: string;
    pushKey?: string;
    deviceModel?: string;
    osVersion?: string;
    lastSeenAt?: string;
    createdAt: string;
    updatedAt?: string;
    visits?: number;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    android: { label: "Android", color: "green", icon: <AndroidOutlined style={{ fontSize: 36 }} /> },
    ios: { label: "iOS", color: "blue", icon: <AppleOutlined style={{ fontSize: 36 }} /> },
    web: { label: "Web", color: "purple", icon: <GlobalOutlined style={{ fontSize: 36 }} /> },
    macos: { label: "macOS", color: "geekblue", icon: <DesktopOutlined style={{ fontSize: 36 }} /> },
    windows: { label: "Windows", color: "cyan", icon: <DesktopOutlined style={{ fontSize: 36 }} /> },
    desktop: { label: "Desktop", color: "orange", icon: <DesktopOutlined style={{ fontSize: 36 }} /> },
};

export const DeviceShow = () => {
    const { t } = useTranslation("devices");
    const { t: tc } = useTranslation("common");
    const { token } = theme.useToken();
    const { query } = useShow<IDevice>({
        resource: "admin/devices",
    });
    const { data, isLoading } = query;
    const device = data?.data as IDevice | undefined;
    const { show: goToDetail, list: goToList } = useNavigation();
    const { open: notify } = useNotification();
    const [revokeLoading, setRevokeLoading] = useState(false);
    const handleRevokeSession = async () => {
        if (!device?._id) return;
        setRevokeLoading(true);
        try {
            await axiosInstance.delete(`${API_URL}/admin/devices/${device._id}`);
            notify?.({ type: "success", message: t("messages.sessionRevoked") });
            goToList("admin/devices");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.failedToRevoke") });
        } finally {
            setRevokeLoading(false);
        }
    };
    if (isLoading || !device) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    const getPlatformConfig = (platform?: string) => {
        if (!platform) return { label: "Unknown", color: "default", icon: <MobileOutlined style={{ fontSize: 36 }} /> };
        const key = platform.toLowerCase();
        return PLATFORM_CONFIG[key] || { label: platform, color: "default", icon: <MobileOutlined style={{ fontSize: 36 }} /> };
    };
    const platformConfig = getPlatformConfig(device.platform);
    const isDeviceActive = (lastSeenAt?: string) => {
        if (!lastSeenAt) return false;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
    };
    const isActive = isDeviceActive(device.lastSeenAt);
    return (
        <Show
            headerButtons={
                <Popconfirm
                    title={t("confirmations.revokeSession")}
                    description={t("confirmations.revokeDescription")}
                    onConfirm={handleRevokeSession}
                    okText={tc("confirm")}
                    cancelText={tc("actions.cancel")}
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={revokeLoading}
                    >
                        {t("actions.revokeSession")}
                    </Button>
                </Popconfirm>
            }
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: token.colorPrimaryBg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    color: token.colorPrimary,
                                }}
                            >
                                {platformConfig.icon}
                            </div>
                            <Tag color={platformConfig.color} style={{ fontSize: 14, padding: "4px 12px" }}>
                                {platformConfig.label}
                            </Tag>
                            <div style={{ marginTop: 12 }}>
                                {isActive ? (
                                    <Tag color="green" icon={<CheckCircleOutlined />}>{tc("status.online")}</Tag>
                                ) : (
                                    <Tag color="default" icon={<ClockCircleOutlined />}>{tc("status.offline")}</Tag>
                                )}
                            </div>
                        </div>
                        <Divider />
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("table.lastActive")}
                                    value={device.lastSeenAt ? dayjs(device.lastSeenAt).fromNow() : t("labels.never")}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("table.registered")}
                                    value={dayjs(device.createdAt).fromNow()}
                                    prefix={<CalendarOutlined />}
                                />
                            </Col>
                        </Row>
                        <Divider />
                        {/* User Info */}
                        <Card
                            size="small"
                            title={<Space><UserOutlined /> {t("labels.deviceOwner")}</Space>}
                        >
                            {device.userId ? (
                                <Space style={{ width: "100%" }}>
                                    <Avatar
                                        size={48}
                                        src={getMediaUrl(device.userId.userImage)}
                                        icon={<UserOutlined />}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <Text strong style={{ display: "block" }}>
                                            {device.userId.fullName || tc("labels.unknown")}
                                        </Text>
                                        {device.userId.fullPhone && (
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {device.userId.fullPhone}
                                            </Text>
                                        )}
                                        <br />
                                        <Button
                                            type="link"
                                            size="small"
                                            style={{ padding: 0, height: "auto" }}
                                            onClick={() => goToDetail("admin/users", device.userId!._id)}
                                        >
                                            {tc("actions.viewProfile")}
                                        </Button>
                                    </div>
                                </Space>
                            ) : (
                                <Text type="secondary">{tc("labels.userDataNotAvailable")}</Text>
                            )}
                        </Card>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    {/* Device Information */}
                    <Card title={t("labels.deviceInformation")} style={{ marginBottom: 24 }}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={t("labels.deviceId")}>
                                <Text copyable={{ text: device._id }}>{device._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.platform")}>
                                <Tag color={platformConfig.color} icon={platformConfig.label === "Android" ? <AndroidOutlined /> : platformConfig.label === "iOS" ? <AppleOutlined /> : <MobileOutlined />}>
                                    {platformConfig.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("columns.appVersion")}>
                                <Tag color="blue">{device.clintVersion || tc("labels.unknown")}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.status")}>
                                {isActive ? (
                                    <Tag color="green" icon={<CheckCircleOutlined />}>{tc("status.online")}</Tag>
                                ) : (
                                    <Tag color="default">{tc("status.offline")}</Tag>
                                )}
                            </Descriptions.Item>
                            {device.deviceModel && (
                                <Descriptions.Item label={t("labels.deviceModel")}>
                                    <Text>{device.deviceModel}</Text>
                                </Descriptions.Item>
                            )}
                            {device.osVersion && (
                                <Descriptions.Item label={t("labels.osVersion")}>
                                    <Text>{device.osVersion}</Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    {/* Push Notification */}
                    <Card title={t("labels.pushNotification")} style={{ marginBottom: 24 }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ textAlign: "center", background: device.pushKey ? token.colorSuccessBg : token.colorErrorBg }}>
                                    <Statistic
                                        title={t("labels.pushStatus")}
                                        value={device.pushKey ? tc("status.enabled") : tc("status.disabled")}
                                        valueStyle={{ color: device.pushKey ? "#52c41a" : "#ff4d4f" }}
                                        prefix={device.pushKey ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={16}>
                                {device.pushKey ? (
                                    <Card size="small" title={<Space><KeyOutlined /> {t("labels.pushToken")}</Space>}>
                                        <Paragraph
                                            copyable={{ text: device.pushKey }}
                                            ellipsis={{ rows: 2 }}
                                            style={{ marginBottom: 0, fontFamily: "monospace", fontSize: 12 }}
                                        >
                                            {device.pushKey}
                                        </Paragraph>
                                    </Card>
                                ) : (
                                    <Card size="small" style={{ background: token.colorFillSecondary }}>
                                        <Text type="secondary">
                                            {t("labels.noPushToken")}
                                        </Text>
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Card>
                    {/* Activity Timeline */}
                    <Card title={t("labels.activityDetails")}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={tc("table.lastActive")}>
                                {device.lastSeenAt ? (
                                    <Tooltip title={dayjs(device.lastSeenAt).format("YYYY-MM-DD HH:mm:ss")}>
                                        <Space>
                                            <DateField value={device.lastSeenAt} format="MMM DD, YYYY HH:mm" />
                                            <Text type="secondary">({dayjs(device.lastSeenAt).fromNow()})</Text>
                                        </Space>
                                    </Tooltip>
                                ) : (
                                    <Text type="secondary">{t("labels.never")}</Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.registered")}>
                                <Tooltip title={dayjs(device.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                                    <Space>
                                        <DateField value={device.createdAt} format="MMM DD, YYYY HH:mm" />
                                        <Text type="secondary">({dayjs(device.createdAt).fromNow()})</Text>
                                    </Space>
                                </Tooltip>
                            </Descriptions.Item>
                            {device.updatedAt && (
                                <Descriptions.Item label={tc("table.updatedAt")}>
                                    <Tooltip title={dayjs(device.updatedAt).format("YYYY-MM-DD HH:mm:ss")}>
                                        <DateField value={device.updatedAt} format="MMM DD, YYYY HH:mm" />
                                    </Tooltip>
                                </Descriptions.Item>
                            )}
                            {device.visits !== undefined && (
                                <Descriptions.Item label={t("labels.totalVisits")}>
                                    <Tag color="blue">{device.visits}</Tag>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};