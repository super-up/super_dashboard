import { List, useTable, DateField, DeleteButton, ShowButton } from "@refinedev/antd";
import { Table, Tag, Image, Space, Avatar, Progress, Typography, theme } from "antd";
import { EyeOutlined, PlayCircleOutlined, FileImageOutlined, UserOutlined, AudioOutlined, FileOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getMediaUrl } from "../../config/api";
import { IStory, StoryType, getStoryTypeColor } from "../../types/story.types";
import dayjs from "dayjs";

const { Text } = Typography;

export const StoryList = () => {
    const { token } = theme.useToken();
    const { t } = useTranslation("stories");
    const { t: tc } = useTranslation("common");
    const { tableProps } = useTable<IStory>({
        resource: "admin/stories",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    const isExpired = (expireAt: string) => new Date(expireAt) < new Date();
    const getExpiryProgress = (createdAt: string, expireAt: string) => {
        const created = new Date(createdAt).getTime();
        const expire = new Date(expireAt).getTime();
        const now = Date.now();
        const total = expire - created;
        const elapsed = now - created;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };
    const getTypeLabel = (type: StoryType): string => {
        const key = `types.${type.toLowerCase()}` as const;
        return t(key) || type;
    };
    const renderMediaPreview = (record: IStory) => {
        const storyType = record.storyType;
        const mediaUrl = record.att?.url;
        const thumbUrl = record.att?.thumbUrl;
        if (storyType === StoryType.Image) {
            return (
                <Image
                    src={getMediaUrl(mediaUrl)}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />
            );
        }
        if (storyType === StoryType.Video) {
            return thumbUrl ? (
                <div style={{ position: "relative", width: 60, height: 60 }}>
                    <Image
                        src={getMediaUrl(thumbUrl)}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        preview={false}
                    />
                    <PlayCircleOutlined style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 20, color: "#fff" }} />
                </div>
            ) : (
                <div style={{ width: 60, height: 60, background: token.colorFillSecondary, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayCircleOutlined style={{ fontSize: 24, color: token.colorTextTertiary }} />
                </div>
            );
        }
        if (storyType === StoryType.Voice) {
            return (
                <div style={{ width: 60, height: 60, background: token.colorWarningBg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AudioOutlined style={{ fontSize: 24, color: token.colorWarning }} />
                </div>
            );
        }
        if (storyType === StoryType.File) {
            return (
                <div style={{ width: 60, height: 60, background: token.colorInfoBg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileOutlined style={{ fontSize: 24, color: token.colorInfo }} />
                </div>
            );
        }
        return (
            <div style={{
                width: 60,
                height: 60,
                background: record.backgroundColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                overflow: "hidden"
            }}>
                <Text style={{ color: record.textColor || "#fff", fontSize: 10, textAlign: "center" }} ellipsis>
                    {record.content || tc("labels.text")}
                </Text>
            </div>
        );
    };
    return (
        <List>
            <Table {...tableProps} rowKey="_id">
                <Table.Column
                    title={tc("table.media")}
                    render={(_, record: IStory) => renderMediaPreview(record)}
                    width={80}
                />
                <Table.Column
                    title={tc("table.type")}
                    dataIndex="storyType"
                    render={(value: StoryType) => (
                        <Tag color={getStoryTypeColor(value)}>{getTypeLabel(value)}</Tag>
                    )}
                    width={80}
                />
                <Table.Column
                    title={tc("table.user")}
                    render={(_, record: IStory) => {
                        const user = typeof record.userId === 'object' ? record.userId : null;
                        return (
                            <Space>
                                <Avatar size="small" src={user ? getMediaUrl(user.userImage) : undefined} icon={<UserOutlined />} />
                                <Text ellipsis style={{ maxWidth: 120 }}>{user?.fullName || "-"}</Text>
                            </Space>
                        );
                    }}
                />
                <Table.Column title={tc("table.caption")} dataIndex="caption" ellipsis width={150} />
                <Table.Column
                    title={tc("table.views")}
                    render={(_, record: IStory) => (
                        <Space>
                            <EyeOutlined />
                            {record.views?.length || 0}
                        </Space>
                    )}
                    width={80}
                />
                <Table.Column
                    title={tc("table.expiry")}
                    render={(_, record: IStory) => {
                        const expired = isExpired(record.expireAt);
                        const progress = getExpiryProgress(record.createdAt, record.expireAt);
                        return (
                            <div style={{ width: 80 }}>
                                <Progress
                                    percent={Math.round(progress)}
                                    size="small"
                                    status={expired ? "exception" : "active"}
                                    showInfo={false}
                                />
                                <Text type={expired ? "danger" : "secondary"} style={{ fontSize: 11 }}>
                                    {expired ? tc("status.expired") : dayjs(record.expireAt).fromNow()}
                                </Text>
                            </div>
                        );
                    }}
                    width={100}
                />
                <Table.Column
                    title={tc("table.created")}
                    dataIndex="createdAt"
                    render={(value) => <DateField value={value} format="MMM DD, HH:mm" />}
                    width={100}
                />
                <Table.Column
                    title={tc("table.actions")}
                    render={(_, record: IStory) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record._id} />
                            <DeleteButton hideText size="small" recordItemId={record._id} />
                        </Space>
                    )}
                    width={100}
                />
            </Table>
        </List>
    );
};
