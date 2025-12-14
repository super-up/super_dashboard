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
} from "antd";
import {
    BellOutlined,
    PictureOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl } from "../../config/api";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface INotification {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
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
                                    background: "#e6f7ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}
                            >
                                <BellOutlined style={{ fontSize: 36, color: "#1890ff" }} />
                            </div>
                            <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                                {t("show.adminNotification")}
                            </Tag>
                        </div>
                        <Divider />
                        <Statistic
                            title={t("show.created")}
                            value={dayjs(notification.createdAt).fromNow()}
                            prefix={<CalendarOutlined />}
                        />
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
                    {/* Notification Content */}
                    <Card title={t("show.notificationContent")} style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 8 }}>
                            {notification.title}
                        </Title>
                        <Divider style={{ margin: "16px 0" }} />
                        <Paragraph style={{ fontSize: 16, whiteSpace: "pre-wrap" }}>
                            {notification.content}
                        </Paragraph>
                    </Card>
                    {/* Notification Details */}
                    <Card title={t("show.notificationDetails")}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={t("show.notificationId")}>
                                <Text copyable={{ text: notification._id }}>{notification._id}</Text>
                            </Descriptions.Item>
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
                                    <Text copyable={{ text: notification.imageUrl }} ellipsis style={{ maxWidth: 400 }}>
                                        {notification.imageUrl}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    {/* Delivery Info */}
                    <Card title={t("show.deliveryInfo")} style={{ marginTop: 24 }}>
                        <Row gutter={[24, 24]}>
                            <Col span={12}>
                                <Card size="small" style={{ textAlign: "center", background: "#e6f7ff" }}>
                                    <Statistic
                                        title={t("show.sentAt")}
                                        value={dayjs(notification.createdAt).format("HH:mm")}
                                        valueStyle={{ color: "#1890ff" }}
                                        suffix={<Text type="secondary" style={{ fontSize: 12 }}>{dayjs(notification.createdAt).format("MMM DD")}</Text>}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" style={{ textAlign: "center", background: "#fff7e6" }}>
                                    <Statistic
                                        title={t("show.timeAgo")}
                                        value={dayjs(notification.createdAt).fromNow()}
                                        valueStyle={{ color: "#fa8c16", fontSize: 16 }}
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
