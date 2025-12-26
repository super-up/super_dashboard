import { useState } from "react";
import { useShow, useNavigation, useNotification } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { useTranslation } from "react-i18next";
import {
    Card,
    Descriptions,
    Avatar,
    Tag,
    Table,
    Space,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Divider,
    Popconfirm,
    Spin,
    Image,
    Progress,
    Empty,
    Alert,
    theme,
} from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    PlayCircleOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    FileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { IStory, IStoryView, StoryType, getStoryTypeColor } from "../../types/story.types";
import { IUser } from "../../types/user.types";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

export const StoryShow = () => {
    const { t } = useTranslation("stories");
    const { t: tc } = useTranslation("common");
    const { token } = theme.useToken();
    const { query } = useShow<IStory>({ resource: "admin/stories" });
    const { data, isLoading, refetch } = query;
    const story = data?.data;
    const { show: goToUser } = useNavigation();
    const { open: notify } = useNotification();
    const [actionLoading, setActionLoading] = useState(false);
    const handleDelete = async () => {
        if (!story?._id) return;
        setActionLoading(true);
        try {
            await axiosInstance.delete(`${API_URL}/admin/stories/${story._id}`);
            notify?.({
                type: "success",
                message: "Story deleted successfully",
            });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Operation failed" });
        } finally {
            setActionLoading(false);
        }
    };
    const isDeleted = !!story?.deletedAt;
    const isExpired = story?.expireAt ? new Date(story.expireAt) < new Date() : false;
    const getUser = (): IUser | undefined => {
        if (typeof story?.userId === 'object') return story.userId as IUser;
        return undefined;
    };
    const user = getUser();
    const getExpiryProgress = () => {
        if (!story?.createdAt || !story?.expireAt) return 0;
        const created = new Date(story.createdAt).getTime();
        const expire = new Date(story.expireAt).getTime();
        const now = Date.now();
        const total = expire - created;
        const elapsed = now - created;
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return Math.round(progress);
    };
    const getRemainingTime = () => {
        if (!story?.expireAt) return "Unknown";
        const expireAt = new Date(story.expireAt);
        const now = new Date();
        if (expireAt < now) return "Expired";
        const diff = expireAt.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };
    const views = story?.views || [];
    const viewColumns = [
        {
            title: tc("table.viewer"),
            key: "viewer",
            render: (_: unknown, record: IStoryView) => {
                const viewer = typeof record.viewerId === 'object' ? record.viewerId as IUser : null;
                return (
                    <Space>
                        <Avatar
                            src={viewer ? getMediaUrl(viewer.userImage) : undefined}
                            icon={<UserOutlined />}
                            size={36}
                        />
                        <div>
                            <div style={{ fontWeight: 500 }}>
                                {viewer?.fullName || tc("labels.unknownUser")}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {viewer?.fullPhone}
                            </Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: tc("table.viewedAt"),
            dataIndex: "viewedAt",
            key: "viewedAt",
            render: (value: string) => (
                <Space direction="vertical" size={0}>
                    <Text>{dayjs(value).format("MMM DD, YYYY")}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(value).format("HH:mm:ss")}
                    </Text>
                </Space>
            ),
        },
        {
            title: tc("table.actions"),
            key: "actions",
            render: (_: unknown, record: IStoryView) => {
                const viewer = typeof record.viewerId === 'object' ? record.viewerId as IUser : null;
                return viewer ? (
                    <Button
                        type="link"
                        size="small"
                        onClick={() => goToUser("users", viewer._id)}
                    >
                        {tc("actions.viewUser")}
                    </Button>
                ) : null;
            },
        },
    ];
    const renderMediaPreview = () => {
        if (!story) return null;
        const storyType = story.storyType;
        const mediaUrl = story.att?.url;
        const thumbUrl = story.att?.thumbUrl;
        if (storyType === StoryType.Image) {
            return (
                <Image
                    src={getMediaUrl(mediaUrl)}
                    alt="Story"
                    style={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        borderRadius: 8,
                        objectFit: "contain",
                    }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesANlYYMAAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xMkMEa+wAAAB5SURBVHic7cEBAQAAAIIg/69uSEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN4GqYoAAa37xQsAAAAASUVORK5CYII="
                />
            );
        }
        if (storyType === StoryType.Video) {
            return (
                <div style={{ position: "relative" }}>
                    {thumbUrl ? (
                        <Image
                            src={getMediaUrl(thumbUrl)}
                            alt="Video Thumbnail"
                            style={{
                                maxWidth: "100%",
                                maxHeight: 400,
                                borderRadius: 8,
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <div style={{
                            width: "100%",
                            height: 300,
                            background: token.colorFillSecondary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 8,
                        }}>
                            <VideoCameraOutlined style={{ fontSize: 64, color: token.colorTextTertiary }} />
                        </div>
                    )}
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlayCircleOutlined />}
                        size="large"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => window.open(getMediaUrl(mediaUrl), "_blank")}
                    />
                </div>
            );
        }
        if (storyType === StoryType.Voice) {
            return (
                <div style={{
                    width: "100%",
                    height: 200,
                    background: token.colorWarningBg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    gap: 16,
                }}>
                    <AudioOutlined style={{ fontSize: 64, color: token.colorWarning }} />
                    {mediaUrl && (
                        <audio controls src={getMediaUrl(mediaUrl)} style={{ width: "80%" }} />
                    )}
                </div>
            );
        }
        if (storyType === StoryType.File) {
            return (
                <div style={{
                    width: "100%",
                    height: 200,
                    background: token.colorInfoBg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    gap: 16,
                }}>
                    <FileOutlined style={{ fontSize: 64, color: token.colorInfo }} />
                    {mediaUrl && (
                        <Button type="primary" onClick={() => window.open(getMediaUrl(mediaUrl), "_blank")}>
                            Download File
                        </Button>
                    )}
                </div>
            );
        }
        // Text story
        return (
            <div style={{
                width: "100%",
                height: 200,
                background: story.backgroundColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                padding: 24,
            }}>
                <Text style={{ 
                    color: story.textColor || "#fff", 
                    fontSize: 18, 
                    textAlign: "center",
                    fontStyle: story.fontType === "italic" ? "italic" : "normal",
                    fontWeight: story.fontType === "bold" ? "bold" : "normal",
                }}>
                    {story.content || story.caption || "Text Story"}
                </Text>
            </div>
        );
    };
    const getTypeIcon = () => {
        const type = story?.storyType;
        if (type === StoryType.Image) return <FileImageOutlined />;
        if (type === StoryType.Video) return <VideoCameraOutlined />;
        if (type === StoryType.Voice) return <AudioOutlined />;
        if (type === StoryType.File) return <FileOutlined />;
        return <FileImageOutlined />;
    };
    if (isLoading || !story) {
        return (
            <Show title={tc("labels.storyDetails")}>
                <div style={{ textAlign: "center", padding: 48 }}>
                    <Spin size="large" />
                </div>
            </Show>
        );
    }
    return (
        <Show
            title={tc("labels.storyDetails")}
            headerButtons={
                <Space>
                    {!isDeleted && (
                        <Popconfirm
                            title={tc("actions.deleteStory")}
                            description={tc("confirmations.deleteStory") || "Are you sure you want to delete this story?"}
                            onConfirm={handleDelete}
                            okText={tc("actions.delete")}
                            cancelText={tc("actions.cancel")}
                            okButtonProps={{ danger: true, loading: actionLoading }}
                        >
                            <Button danger icon={<DeleteOutlined />} loading={actionLoading}>
                                {tc("actions.deleteStory")}
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            }
        >
            {isDeleted && (
                <Alert
                    type="warning"
                    showIcon
                    icon={<DeleteOutlined />}
                    message={tc("labels.thisStoryDeletedOn", { date: dayjs(story.deletedAt).format("MMM DD, YYYY HH:mm") })}
                    style={{ marginBottom: 16 }}
                />
            )}
            {isExpired && !isDeleted && (
                <Alert
                    type="success"
                    showIcon
                    icon={<ClockCircleOutlined />}
                    message={tc("labels.thisStoryExpiredOn", { date: dayjs(story.expireAt).format("MMM DD, YYYY HH:mm") })}
                    style={{ marginBottom: 16 }}
                />
            )}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                    <Card>
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            {renderMediaPreview()}
                        </div>
                        {story.caption && story.storyType !== StoryType.Text && (
                            <Paragraph style={{ textAlign: "center", marginBottom: 16 }}>
                                {story.caption}
                            </Paragraph>
                        )}
                        <Divider />
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text type="secondary">{tc("labels.expiryProgress")}</Text>
                                <Text type={isExpired ? "danger" : "secondary"}>
                                    {getRemainingTime()}
                                </Text>
                            </div>
                            <Progress
                                percent={getExpiryProgress()}
                                status={isExpired ? "exception" : "active"}
                                showInfo={false}
                            />
                        </div>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("table.views")}
                                    value={views.length}
                                    prefix={<EyeOutlined />}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("labels.type")}
                                    value={t(`types.${story.storyType.toLowerCase()}`) || story.storyType}
                                    prefix={getTypeIcon()}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                    <Card title={tc("labels.storyInformation")} style={{ marginBottom: 24 }}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={tc("labels.storyId")}>
                                <Text copyable code>{story._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("labels.type")}>
                                <Tag color={getStoryTypeColor(story.storyType as StoryType)}>
                                    {t(`types.${story.storyType.toLowerCase()}`) || story.storyType}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("labels.postedBy")} span={2}>
                                {user ? (
                                    <Space>
                                        <Avatar
                                            size="small"
                                            src={getMediaUrl(user.userImage)}
                                            icon={<UserOutlined />}
                                        />
                                        <Button
                                            type="link"
                                            size="small"
                                            style={{ padding: 0 }}
                                            onClick={() => goToUser("users", user._id)}
                                        >
                                            {user.fullName}
                                        </Button>
                                        <Text type="secondary">{user.fullPhone}</Text>
                                    </Space>
                                ) : (
                                    <Text type="secondary">{tc("labels.unknownUser")}</Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("labels.createdAt")}>
                                <Space>
                                    <CalendarOutlined />
                                    {dayjs(story.createdAt).format("MMM DD, YYYY HH:mm")}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("labels.expiresAt")}>
                                <Space>
                                    <ClockCircleOutlined style={{ color: isExpired ? "#ff4d4f" : undefined }} />
                                    <Text type={isExpired ? "danger" : undefined}>
                                        {dayjs(story.expireAt).format("MMM DD, YYYY HH:mm")}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.status")} span={2}>
                                <Space>
                                    {isDeleted ? (
                                        <Tag color="red">{tc("status.deleted")}</Tag>
                                    ) : isExpired ? (
                                        <Tag color="orange">{tc("status.expired")}</Tag>
                                    ) : (
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    )}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                    <Card title={`${tc("table.views")} (${views.length})`}>
                        {views.length > 0 ? (
                            <Table
                                dataSource={views}
                                columns={viewColumns}
                                rowKey={(record, index) => record._id || `view-${index}`}
                                pagination={{ pageSize: 20 }}
                                size="small"
                                scroll={{ x: 400 }}
                            />
                        ) : (
                            <Empty
                                description={tc("labels.noViewsYet")}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};