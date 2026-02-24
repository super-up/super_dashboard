import { useShow } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import {
    Typography,
    Descriptions,
    Tag,
    Card,
    Row,
    Col,
    Spin,
    Divider,
    Statistic,
    Image,
    Tooltip,
    Space,
    Progress,
} from "antd";
import {
    BellOutlined,
    MessageOutlined,
    PictureOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl } from "../../config/api";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const jobStatusColors: Record<string, string> = {
    pending: "default",
    processing: "processing",
    completed: "success",
    failed: "error",
};

interface INotification {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
    deliveryType?: string;
    deliveryCount?: number;
    targetUserCount?: number;
    targetType?: string;
    jobStatus?: string;
    createdAt: string;
    updatedAt?: string;
}

export const NotificationShow = () => {
    const { t } = useTranslation("notifications");
    const { query } = useShow<INotification>({
        resource: "admin/notifications",
    });
    const { data, isLoading } = query;
    const notification = data?.data as INotification | undefined;
    if (isLoading || !notification) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    const deliveryPercent = notification.targetUserCount && notification.targetUserCount > 0
        ? Math.round((notification.deliveryCount || 0) / notification.targetUserCount * 100)
        : 0;
    const isChat = notification.deliveryType === "chat";
    return (
        <Show>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: isChat ? "#f0f5ff" : "#e6f7ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}
                            >
                                {isChat
                                    ? <MessageOutlined style={{ fontSize: 36, color: "#2f54eb" }} />
                                    : <BellOutlined style={{ fontSize: 36, color: "#1890ff" }} />
                                }
                            </div>
                            <Space>
                                <Tag color={isChat ? "blue" : "orange"} style={{ fontSize: 14, padding: "4px 12px" }}>
                                    {notification.deliveryType === "chat" ? "Chat Message" : "Push Notification"}
                                </Tag>
                                {notification.jobStatus && (
                                    <Tag color={jobStatusColors[notification.jobStatus]} style={{ fontSize: 14, padding: "4px 12px" }}>
                                        {t(`list.jobStatus.${notification.jobStatus}`)}
                                    </Tag>
                                )}
                            </Space>
                        </div>
                        <Divider />
                        <Statistic
                            title={t("show.created")}
                            value={dayjs(notification.createdAt).fromNow()}
                            prefix={<CalendarOutlined />}
                        />
                        {notification.targetUserCount != null && notification.targetUserCount > 0 && (
                            <>
                                <Divider />
                                <Statistic
                                    title={t("show.deliveryProgress")}
                                    value={notification.deliveryCount || 0}
                                    suffix={`/ ${notification.targetUserCount}`}
                                />
                                <Progress
                                    percent={deliveryPercent}
                                    status={notification.jobStatus === "failed" ? "exception" : notification.jobStatus === "completed" ? "success" : "active"}
                                    style={{ marginTop: 8 }}
                                />
                            </>
                        )}
                        {notification.imageUrl && (
                            <>
                                <Divider />
                                <Card
                                    size="small"
                                    title={<Space><PictureOutlined /> {t("show.notificationImage")}</Space>}
                                >
                                    <Image
                                        src={notification.imageUrl.startsWith("http") ? notification.imageUrl : getMediaUrl(notification.imageUrl)}
                                        alt="Notification image"
                                        style={{ width: "100%", borderRadius: 8 }}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                                    />
                                </Card>
                            </>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title={t("show.notificationContent")} style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 8 }}>
                            {notification.title}
                        </Title>
                        <Divider style={{ margin: "16px 0" }} />
                        <Paragraph style={{ fontSize: 16, whiteSpace: "pre-wrap" }}>
                            {notification.content}
                        </Paragraph>
                    </Card>
                    <Card title={t("show.notificationDetails")}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={t("show.notificationId")}>
                                <Text copyable={{ text: notification._id }}>{notification._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("show.deliveryType")}>
                                <Tag color={isChat ? "blue" : "orange"}>
                                    {notification.deliveryType === "chat" ? "Chat" : "Push"}
                                </Tag>
                            </Descriptions.Item>
                            {notification.targetType && (
                                <Descriptions.Item label={t("show.targetType")}>
                                    <Tag>{notification.targetType}</Tag>
                                </Descriptions.Item>
                            )}
                            {notification.jobStatus && (
                                <Descriptions.Item label={t("show.jobStatus")}>
                                    <Tag color={jobStatusColors[notification.jobStatus]}>
                                        {t(`list.jobStatus.${notification.jobStatus}`)}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label={t("show.created")}>
                                <Tooltip title={dayjs(notification.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                                    <DateField value={notification.createdAt} format="MMM DD, YYYY HH:mm" />
                                </Tooltip>
                            </Descriptions.Item>
                            {notification.updatedAt && (
                                <Descriptions.Item label={t("show.updated")}>
                                    <Tooltip title={dayjs(notification.updatedAt).format("YYYY-MM-DD HH:mm:ss")}>
                                        <DateField value={notification.updatedAt} format="MMM DD, YYYY HH:mm" />
                                    </Tooltip>
                                </Descriptions.Item>
                            )}
                            {notification.imageUrl && (
                                <Descriptions.Item label={t("show.imageUrl")} span={2}>
                                    <Text copyable={{ text: notification.imageUrl }} ellipsis style={{ maxWidth: "100%" }}>
                                        {notification.imageUrl}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    <Card title={t("show.deliveryInfo")} style={{ marginTop: 24 }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ textAlign: "center", background: "#e6f7ff" }}>
                                    <Statistic
                                        title={t("show.sentAt")}
                                        value={dayjs(notification.createdAt).format("HH:mm")}
                                        valueStyle={{ color: "#1890ff" }}
                                        suffix={<Text type="secondary" style={{ fontSize: 12 }}>{dayjs(notification.createdAt).format("MMM DD")}</Text>}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ textAlign: "center", background: "#f6ffed" }}>
                                    <Statistic
                                        title={t("show.deliveryCount")}
                                        value={notification.deliveryCount || 0}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card size="small" style={{ textAlign: "center", background: "#fff7e6" }}>
                                    <Statistic
                                        title={t("show.targetUserCount")}
                                        value={notification.targetUserCount || 0}
                                        valueStyle={{ color: "#fa8c16" }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};
