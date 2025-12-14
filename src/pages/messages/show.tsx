import { useShow, useNotification, useNavigation } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { useTranslation } from "react-i18next";
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
    Popconfirm,
    Tooltip,
    Image,
    Modal,
    Slider,
    theme,
} from "antd";
import {
    UserOutlined,
    DeleteOutlined,
    UndoOutlined,
    MessageOutlined,
    AudioOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    FileOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    SmileOutlined,
    GifOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    LockOutlined,
    SendOutlined,
    TeamOutlined,
    EyeOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    IMessage,
    MessageType,
    MESSAGE_TYPE_CONFIG,
    isMessageDeleted,
    hasAttachment,
} from "../../types/message.types";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { useState, useRef } from "react";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

// Helper function to format duration from milliseconds
const formatDuration = (durationMs: number | undefined): string => {
    if (!durationMs) return "0:00";
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Audio Player Component
const AudioPlayer: React.FC<{ url: string; duration?: number; t: (key: string) => string }> = ({ url, duration, t }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration ? duration / 1000 : 0);
    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };
    const handleLoadedMetadata = () => {
        if (audioRef.current && audioRef.current.duration && !duration) {
            setAudioDuration(audioRef.current.duration);
        }
    };
    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };
    const handleSliderChange = (value: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value;
            setCurrentTime(value);
        }
    };
    return (
        <div style={{ background: "#fff7e6", padding: 24, borderRadius: 8, textAlign: "center" }}>
            <AudioOutlined style={{ fontSize: 48, color: "#fa8c16", marginBottom: 16 }} />
            <Title level={4} style={{ margin: "0 0 16px" }}>{t("show.voiceMessage")}</Title>
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={handlePlayPause}
                        style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
                    />
                    <Text style={{ minWidth: 80 }}>
                        {formatDuration(currentTime * 1000)} / {formatDuration(audioDuration * 1000)}
                    </Text>
                </Space>
                <Slider
                    min={0}
                    max={audioDuration || 1}
                    value={currentTime}
                    onChange={handleSliderChange}
                    tooltip={{ formatter: (v) => formatDuration((v || 0) * 1000) }}
                    style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}
                />
                <Button icon={<DownloadOutlined />} onClick={() => window.open(url, "_blank")}>
                    {t("actions.downloadAudio")}
                </Button>
            </Space>
        </div>
    );
};

// Video Player Component  
const VideoPlayer: React.FC<{ url: string; duration?: number; thumbnailUrl?: string; t: (key: string) => string }> = ({ url, duration, thumbnailUrl, t }) => {
    const [showPlayer, setShowPlayer] = useState(false);
    return (
        <div style={{ textAlign: "center" }}>
            {!showPlayer ? (
                <div style={{ background: "#f5f5f5", padding: 40, borderRadius: 8 }}>
                    <div
                        style={{
                            width: 200,
                            height: 150,
                            margin: "0 auto 16px",
                            background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover` : "#e0e0e0",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                        }}
                        onClick={() => setShowPlayer(true)}
                    >
                        {!thumbnailUrl && <VideoCameraOutlined style={{ fontSize: 48, color: "#722ed1" }} />}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.4)",
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <PlayCircleOutlined style={{ fontSize: 48, color: "#fff" }} />
                        </div>
                    </div>
                    <Title level={4}>{t("show.videoMessage")}</Title>
                    {duration && <Text type="secondary">{t("fields.duration")}: {formatDuration(duration)}</Text>}
                    <div style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setShowPlayer(true)}>
                                {t("actions.playVideo")}
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={() => window.open(url, "_blank")}>
                                {t("actions.download")}
                            </Button>
                        </Space>
                    </div>
                </div>
            ) : (
                <div>
                    <video
                        src={url}
                        controls
                        autoPlay
                        style={{ width: "100%", maxHeight: 400, borderRadius: 8 }}
                    />
                    <div style={{ marginTop: 12 }}>
                        <Space>
                            <Button onClick={() => setShowPlayer(false)}>{t("actions.hidePlayer")}</Button>
                            <Button icon={<DownloadOutlined />} onClick={() => window.open(url, "_blank")}>
                                {t("actions.download")}
                            </Button>
                        </Space>
                    </div>
                </div>
            )}
        </div>
    );
};

const MessageTypeIcon: React.FC<{ type: MessageType; style?: React.CSSProperties }> = ({ type, style }) => {
    const iconMap: Record<MessageType, React.ReactNode> = {
        [MessageType.Text]: <MessageOutlined style={style} />,
        [MessageType.Voice]: <AudioOutlined style={style} />,
        [MessageType.Image]: <PictureOutlined style={style} />,
        [MessageType.Video]: <VideoCameraOutlined style={style} />,
        [MessageType.File]: <FileOutlined style={style} />,
        [MessageType.AllDeleted]: <DeleteOutlined style={style} />,
        [MessageType.Location]: <EnvironmentOutlined style={style} />,
        [MessageType.Custom]: <InfoCircleOutlined style={style} />,
        [MessageType.Call]: <PhoneOutlined style={style} />,
        [MessageType.Info]: <InfoCircleOutlined style={style} />,
        [MessageType.Reaction]: <SmileOutlined style={style} />,
        [MessageType.Sticker]: <SmileOutlined style={style} />,
        [MessageType.Gif]: <GifOutlined style={style} />,
        [MessageType.StoryReply]: <MessageOutlined style={style} />,
    };
    return <>{iconMap[type] || <MessageOutlined style={style} />}</>;
};

export const MessageShow = () => {
    const { t } = useTranslation("messages");
    const { token } = theme.useToken();
    const { query } = useShow<IMessage>({
        resource: "admin/messages",
    });
    const { data, isLoading, refetch } = query;
    const message = data?.data as IMessage | undefined;
    const { open: notify } = useNotification();
    const { show: goToDetail, list: goToList } = useNavigation();
    const [actionLoading, setActionLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    if (isLoading || !message) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    const deleted = isMessageDeleted(message);
    const hasAtt = hasAttachment(message);
    const config = MESSAGE_TYPE_CONFIG[message.mT] || { label: message.mT, color: "default" };
    const senderImageUrl = getMediaUrl(message.sImg);
    const handleDeleteToggle = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/messages`, {
                messageIds: [message._id],
                updates: { deleted: !deleted },
            });
            notify?.({ type: "success", message: deleted ? t("notifications.restored") : t("notifications.deleted") });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.updateFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const renderMessageContent = () => {
        const content = message.c || "";
        const attachment = message.msgAtt;
        if (deleted) {
            return (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <DeleteOutlined style={{ fontSize: 48, color: token.colorTextQuaternary }} />
                    <Title level={4} type="secondary" style={{ marginTop: 16 }}>
                        {t("show.messageDeleted")}
                    </Title>
                </div>
            );
        }
        switch (message.mT) {
            case MessageType.Image:
                return (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        {attachment?.url && (
                            <div style={{ textAlign: "center" }}>
                                <Image
                                    src={getMediaUrl(attachment.url)}
                                    alt="Message image"
                                    style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8 }}
                                    preview={{ src: getMediaUrl(attachment.url) }}
                                />
                            </div>
                        )}
                        {content && <Paragraph style={{ marginTop: 8 }}>{content}</Paragraph>}
                        {attachment && (
                            <Space>
                                {attachment.width && attachment.height && (
                                    <Text type="secondary">
                                        {attachment.width} x {attachment.height}
                                    </Text>
                                )}
                                {attachment.fileSize && (
                                    <Text type="secondary">
                                        ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                    </Text>
                                )}
                            </Space>
                        )}
                    </Space>
                );
            case MessageType.Video:
                return (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        {attachment?.url ? (
                            <VideoPlayer
                                url={getMediaUrl(attachment.url)!}
                                duration={attachment.duration}
                                thumbnailUrl={attachment.thumbnailUrl ? getMediaUrl(attachment.thumbnailUrl) : undefined}
                                t={t}
                            />
                        ) : (
                            <div style={{ textAlign: "center", background: token.colorFillSecondary, padding: 40, borderRadius: 8 }}>
                                <VideoCameraOutlined style={{ fontSize: 64, color: "#722ed1" }} />
                                <Title level={4} style={{ marginTop: 16 }}>{t("show.videoMessage")}</Title>
                                <Text type="secondary">{t("show.noVideoUrl")}</Text>
                            </div>
                        )}
                        {attachment && (
                            <Space>
                                {attachment.width && attachment.height && (
                                    <Text type="secondary">{attachment.width} x {attachment.height}</Text>
                                )}
                                {attachment.fileSize && (
                                    <Text type="secondary">({(attachment.fileSize / 1024 / 1024).toFixed(2)} MB)</Text>
                                )}
                            </Space>
                        )}
                    </Space>
                );
            case MessageType.Voice:
                return attachment?.url ? (
                    <AudioPlayer url={getMediaUrl(attachment.url)!} duration={attachment.duration} t={t} />
                ) : (
                    <div style={{ textAlign: "center", background: token.colorWarningBg, padding: 40, borderRadius: 8 }}>
                        <AudioOutlined style={{ fontSize: 64, color: token.colorWarning }} />
                        <Title level={4} style={{ marginTop: 16 }}>{t("show.voiceMessage")}</Title>
                        {attachment?.duration && (
                            <Text type="secondary" style={{ display: "block" }}>
                                {t("fields.duration")}: {formatDuration(attachment.duration)}
                            </Text>
                        )}
                        <Text type="secondary">{t("show.noAudioUrl")}</Text>
                    </div>
                );
            case MessageType.File:
                return (
                    <div style={{ textAlign: "center", background: token.colorInfoBg, padding: 40, borderRadius: 8 }}>
                        <FileOutlined style={{ fontSize: 64, color: token.colorInfo }} />
                        <Title level={4} style={{ marginTop: 16 }}>{attachment?.fileName || t("types.file")}</Title>
                        {attachment?.fileSize && (
                            <Text type="secondary" style={{ display: "block" }}>
                                {t("show.size")}: {(attachment.fileSize / 1024).toFixed(1)} KB
                            </Text>
                        )}
                        {attachment?.mimeType && (
                            <Text type="secondary" style={{ display: "block" }}>
                                {t("show.type")}: {attachment.mimeType}
                            </Text>
                        )}
                        {attachment?.url && (
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                style={{ marginTop: 16 }}
                                onClick={() => window.open(getMediaUrl(attachment.url), "_blank")}
                            >
                                {t("actions.downloadFile")}
                            </Button>
                        )}
                    </div>
                );
            case MessageType.Location:
                return (
                    <div style={{ textAlign: "center", background: token.colorErrorBg, padding: 40, borderRadius: 8 }}>
                        <EnvironmentOutlined style={{ fontSize: 64, color: "#eb2f96" }} />
                        <Title level={4} style={{ marginTop: 16 }}>{t("show.locationShared")}</Title>
                        {content && <Text>{content}</Text>}
                    </div>
                );
            case MessageType.Call:
                return (
                    <div style={{ textAlign: "center", background: token.colorWarningBg, padding: 40, borderRadius: 8 }}>
                        <PhoneOutlined style={{ fontSize: 64, color: "#fa541c" }} />
                        <Title level={4} style={{ marginTop: 16 }}>{t("types.call")}</Title>
                        {content && <Text>{content}</Text>}
                    </div>
                );
            case MessageType.Sticker:
            case MessageType.Gif:
                return (
                    <div style={{ textAlign: "center" }}>
                        {attachment?.url ? (
                            <Image
                                src={getMediaUrl(attachment.url)}
                                alt={message.mT === MessageType.Sticker ? t("types.sticker") : t("types.gif")}
                                style={{ maxWidth: 200, maxHeight: 200 }}
                                preview={{ src: getMediaUrl(attachment.url) }}
                            />
                        ) : (
                            <>
                                {message.mT === MessageType.Sticker ? (
                                    <SmileOutlined style={{ fontSize: 64, color: "#a0d911" }} />
                                ) : (
                                    <GifOutlined style={{ fontSize: 64, color: "#2f54eb" }} />
                                )}
                                <Title level={4} style={{ marginTop: 16 }}>
                                    {message.mT === MessageType.Sticker ? t("types.sticker") : t("types.gif")}
                                </Title>
                            </>
                        )}
                    </div>
                );
            case MessageType.Reaction:
                return (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <div style={{ fontSize: 64 }}>{content || "😀"}</div>
                        <Title level={4} style={{ marginTop: 16 }}>{t("types.reaction")}</Title>
                    </div>
                );
            case MessageType.Info:
                return (
                    <div style={{ textAlign: "center", background: token.colorFillSecondary, padding: 40, borderRadius: 8 }}>
                        <InfoCircleOutlined style={{ fontSize: 48, color: token.colorTextSecondary }} />
                        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 16, fontStyle: "italic" }}>
                            {content || t("show.systemMessage")}
                        </Paragraph>
                    </div>
                );
            default:
                return (
                    <div style={{ background: token.colorFillSecondary, padding: 24, borderRadius: 8, minHeight: 100 }}>
                        <Paragraph style={{ fontSize: 16, whiteSpace: "pre-wrap" }}>
                            {content || <Text type="secondary">{t("show.noContent")}</Text>}
                        </Paragraph>
                    </div>
                );
        }
    };
    return (
        <Show
            headerButtons={
                <Space>
                    <Popconfirm
                        title={deleted ? t("confirmations.restoreMessage") : t("confirmations.deleteMessage")}
                        onConfirm={handleDeleteToggle}
                    >
                        <Button
                            danger={!deleted}
                            type={deleted ? "primary" : "default"}
                            icon={deleted ? <UndoOutlined /> : <DeleteOutlined />}
                            loading={actionLoading}
                        >
                            {deleted ? t("actions.restore") : t("actions.delete")}
                        </Button>
                    </Popconfirm>
                </Space>
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
                                    background: config.color === "default" ? token.colorFillSecondary : `var(--ant-${config.color}-1, ${token.colorPrimaryBg})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}
                            >
                                <MessageTypeIcon type={message.mT} style={{ fontSize: 36, color: config.color === "default" ? token.colorTextSecondary : undefined }} />
                            </div>
                            <Tag color={config.color} style={{ fontSize: 14, padding: "4px 12px" }}>
                                {config.label}
                            </Tag>
                            <div style={{ marginTop: 16 }}>
                                <Space wrap>
                                    {deleted && <Tag color="red" icon={<DeleteOutlined />}>{t("tags.deleted")}</Tag>}
                                    {hasAtt && <Tag color="blue" icon={<FileOutlined />}>{t("tags.hasMedia")}</Tag>}
                                    {message.forId && <Tag color="purple" icon={<SendOutlined />}>{t("tags.forwarded")}</Tag>}
                                    {message.rTo && <Tag color="cyan" icon={<MessageOutlined />}>{t("tags.reply")}</Tag>}
                                    {message.isEncrypted && <Tag color="gold" icon={<LockOutlined />}>{t("tags.encrypted")}</Tag>}
                                </Space>
                            </div>
                        </div>
                        <Divider />
                        {/* Sender Info */}
                        <Card
                            size="small"
                            title={<Space><UserOutlined /> {t("fields.sender")}</Space>}
                            style={{ marginBottom: 16 }}
                        >
                            <Space style={{ width: "100%" }}>
                                <Avatar
                                    size={48}
                                    src={senderImageUrl}
                                    icon={<UserOutlined />}
                                    style={{ cursor: senderImageUrl ? "pointer" : "default" }}
                                    onClick={() => senderImageUrl && setPreviewImage(senderImageUrl)}
                                />
                                <div style={{ flex: 1 }}>
                                    <Text strong style={{ display: "block" }}>
                                        {message.sName || t("show.unknown")}
                                    </Text>
                                    <Button
                                        type="link"
                                        size="small"
                                        style={{ padding: 0, height: "auto" }}
                                        onClick={() => goToDetail("admin/users", message.sId)}
                                    >
                                        {t("actions.viewProfile")}
                                    </Button>
                                </div>
                            </Space>
                        </Card>
                        {/* Room Info */}
                        <Card
                            size="small"
                            title={<Space><TeamOutlined /> {t("fields.room")}</Space>}
                        >
                            <Text type="secondary" style={{ fontSize: 12 }}>{t("fields.roomId")}</Text>
                            <br />
                            <Text copyable={{ text: message.rId }} style={{ wordBreak: "break-all" }}>
                                {message.rId}
                            </Text>
                            <Button
                                type="link"
                                size="small"
                                icon={<LinkOutlined />}
                                style={{ marginTop: 8, padding: 0 }}
                                onClick={() => goToDetail("admin/rooms/groups", message.rId)}
                            >
                                {t("actions.viewRoom")}
                            </Button>
                        </Card>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title={t("show.messageContent")} style={{ marginBottom: 24 }}>
                        {renderMessageContent()}
                    </Card>
                    <Card title={t("show.messageDetails")}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={t("fields.id")}>
                                <Text copyable={{ text: message._id }}>{message._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.type")}>
                                <Tag color={config.color}>
                                    <MessageTypeIcon type={message.mT} /> {config.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.platform")}>
                                <Tag>{message.plm || t("show.unknown")}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.status")}>
                                {deleted ? (
                                    <Tag color="red" icon={<DeleteOutlined />}>{t("tags.deleted")}</Tag>
                                ) : (
                                    <Tag color="green">{t("tags.active")}</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.created")}>
                                <Tooltip title={dayjs(message.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                                    <DateField value={message.createdAt} format="MMM DD, YYYY HH:mm" />
                                </Tooltip>
                            </Descriptions.Item>
                            {message.updatedAt && (
                                <Descriptions.Item label={t("fields.updated")}>
                                    <Tooltip title={dayjs(message.updatedAt).format("YYYY-MM-DD HH:mm:ss")}>
                                        <DateField value={message.updatedAt} format="MMM DD, YYYY HH:mm" />
                                    </Tooltip>
                                </Descriptions.Item>
                            )}
                            {message.dltAt && (
                                <Descriptions.Item label={t("fields.deletedAt")} span={2}>
                                    <Tag color="red">
                                        <DateField value={message.dltAt} format="MMM DD, YYYY HH:mm" />
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            {message.isEncrypted && (
                                <Descriptions.Item label={t("fields.encryption")}>
                                    <Tag color="gold" icon={<LockOutlined />}>{t("tags.encrypted")}</Tag>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    {/* Reactions */}
                    {(message.reactionNumber ?? 0) > 0 && (
                        <Card title={`${t("show.reactions")} (${message.reactionNumber})`} style={{ marginTop: 24 }}>
                            <Space wrap size={[8, 8]}>
                                {message.reactionSample?.map((r, i) => (
                                    <Tag key={i} style={{ fontSize: 18, padding: "8px 12px" }}>
                                        {r.emoji} <Text type="secondary" style={{ marginLeft: 4 }}>{r.count}</Text>
                                    </Tag>
                                ))}
                            </Space>
                        </Card>
                    )}
                    {/* Forwarded Info */}
                    {message.forId && (
                        <Card title={t("show.forwardedFrom")} style={{ marginTop: 24 }}>
                            <Space>
                                <SendOutlined style={{ color: "#722ed1" }} />
                                <Text copyable={{ text: message.forId }}>
                                    {t("fields.id")}: {message.forId}
                                </Text>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => goToDetail("admin/messages", message.forId!)}
                                >
                                    {t("actions.viewOriginal")}
                                </Button>
                            </Space>
                        </Card>
                    )}
                    {/* Reply To Info */}
                    {message.rTo && (
                        <Card title={t("show.replyTo")} style={{ marginTop: 24 }}>
                            <Space>
                                <MessageOutlined style={{ color: "#13c2c2" }} />
                                <Text type="secondary">{t("show.replyInfo")}</Text>
                            </Space>
                        </Card>
                    )}
                    {/* Attachment Info */}
                    {message.msgAtt && (
                        <Card title={t("show.attachmentDetails")} style={{ marginTop: 24 }}>
                            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                {message.msgAtt.fileName && (
                                    <Descriptions.Item label={t("fields.fileName")}>{message.msgAtt.fileName}</Descriptions.Item>
                                )}
                                {message.msgAtt.mimeType && (
                                    <Descriptions.Item label={t("fields.mimeType")}>{message.msgAtt.mimeType}</Descriptions.Item>
                                )}
                                {message.msgAtt.fileSize && (
                                    <Descriptions.Item label={t("fields.fileSize")}>
                                        {message.msgAtt.fileSize > 1024 * 1024
                                            ? `${(message.msgAtt.fileSize / 1024 / 1024).toFixed(2)} MB`
                                            : `${(message.msgAtt.fileSize / 1024).toFixed(1)} KB`}
                                    </Descriptions.Item>
                                )}
                                {message.msgAtt.width && message.msgAtt.height && (
                                    <Descriptions.Item label={t("fields.dimensions")}>
                                        {message.msgAtt.width} x {message.msgAtt.height}
                                    </Descriptions.Item>
                                )}
                                {message.msgAtt.duration && (
                                    <Descriptions.Item label={t("fields.duration")}>
                                        {formatDuration(message.msgAtt.duration)}
                                    </Descriptions.Item>
                                )}
                                {message.msgAtt.url && (
                                    <Descriptions.Item label={t("fields.url")} span={2}>
                                        <Text copyable={{ text: getMediaUrl(message.msgAtt.url) }} ellipsis style={{ maxWidth: 300 }}>
                                            {message.msgAtt.url}
                                        </Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    )}
                </Col>
            </Row>
            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                centered
                width={400}
            >
                <Image src={previewImage || ""} alt="Preview" style={{ width: "100%" }} preview={false} />
            </Modal>
        </Show>
    );
};