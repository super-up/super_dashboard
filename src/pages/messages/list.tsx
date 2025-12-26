import { useState, useRef, useEffect, useCallback } from "react";
import { List, useTable, DateField, getDefaultSortOrder } from "@refinedev/antd";
import { useNotification, useNavigation } from "@refinedev/core";
import {
    Table,
    Avatar,
    Tag,
    Input,
    Space,
    Button,
    Tooltip,
    Select,
    Popconfirm,
    Modal,
    Card,
    Row,
    Col,
    DatePicker,
    Divider,
    Image,
    Typography,
    Badge,
    theme,
    Slider,
} from "antd";
import {
    UserOutlined,
    MessageOutlined,
    AudioOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    FileOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    ClearOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    SmileOutlined,
    GifOutlined,
    InfoCircleOutlined,
    UndoOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    DownloadOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
    IMessage,
    MessageType,
    MESSAGE_TYPE_CONFIG,
    isMessageDeleted,
    hasAttachment,
} from "../../types/message.types";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";

const { RangePicker } = DatePicker;
const { Text, Paragraph } = Typography;

// Helper function to format duration from milliseconds
const formatDuration = (durationMs: number | undefined): string => {
    if (!durationMs) return "0:00";
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Mini Audio Player Component - FIXED to show total duration
const MiniAudioPlayer: React.FC<{ url: string; duration?: number }> = ({ url, duration }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration ? duration / 1000 : 0);
    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
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
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, "_blank");
    };
    const handleLoadedMetadata = () => {
        if (audioRef.current && audioRef.current.duration && !duration) {
            setAudioDuration(audioRef.current.duration);
        }
    };
    return (
        <Space direction="vertical" size={4} style={{ width: 200 }}>
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
            />
            <Space>
                <Button
                    type="text"
                    size="small"
                    icon={isPlaying ? <PauseCircleOutlined style={{ fontSize: 20, color: "#fa8c16" }} /> : <PlayCircleOutlined style={{ fontSize: 20, color: "#fa8c16" }} />}
                    onClick={handlePlayPause}
                />
                <Slider
                    min={0}
                    max={audioDuration || 1}
                    value={currentTime}
                    onChange={handleSliderChange}
                    tooltip={{ formatter: (v) => formatDuration((v || 0) * 1000) }}
                    style={{ width: 80, margin: 0 }}
                />
                <Text type="secondary" style={{ fontSize: 11, minWidth: 70 }}>
                    {formatDuration(currentTime * 1000)} / {formatDuration(audioDuration * 1000)}
                </Text>
                <Tooltip title="Download">
                    <Button type="text" size="small" icon={<DownloadOutlined />} onClick={handleDownload} />
                </Tooltip>
            </Space>
        </Space>
    );
};

// Mini Video Player Component
const MiniVideoPlayer: React.FC<{ url: string; thumbnailUrl?: string; duration?: number }> = ({ url, thumbnailUrl, duration }) => {
    const [showModal, setShowModal] = useState(false);
    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowModal(true);
    };
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, "_blank");
    };
    return (
        <>
            <Space>
                <div
                    style={{
                        width: 60,
                        height: 60,
                        background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover` : "#f0f0f0",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                    }}
                    onClick={handlePlay}
                >
                    {!thumbnailUrl && <VideoCameraOutlined style={{ fontSize: 24, color: "#722ed1" }} />}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PlayCircleOutlined style={{ fontSize: 24, color: "#fff" }} />
                    </div>
                </div>
                <div>
                    <Text style={{ display: "block" }}>Video</Text>
                    {duration && <Text type="secondary" style={{ fontSize: 11 }}>{formatDuration(duration)}</Text>}
                </div>
                <Tooltip title="Download">
                    <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload} />
                </Tooltip>
            </Space>
            <Modal
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: 640 }}
                centered
                destroyOnClose
            >
                <video src={url} controls autoPlay style={{ width: "100%", maxHeight: "70vh" }} />
            </Modal>
        </>
    );
};

interface FilterState {
    search: string;
    senderId: string;
    roomId: string;
    messageTypes: MessageType[];
    isDeleted: boolean | undefined;
    fromDate: string | undefined;
    toDate: string | undefined;
    sortField: string;
    sortOrder: "asc" | "desc";
}

const initialFilters: FilterState = {
    search: "",
    senderId: "",
    roomId: "",
    messageTypes: [],
    isDeleted: undefined,
    fromDate: undefined,
    toDate: undefined,
    sortField: "createdAt",
    sortOrder: "desc",
};

const getSortOptions = (tc: (key: string) => string) => [
    { label: tc("filters.newestFirst"), value: "createdAt_desc", field: "createdAt", order: "desc" as const },
    { label: tc("filters.oldestFirst"), value: "createdAt_asc", field: "createdAt", order: "asc" as const },
    { label: tc("filters.recentlyUpdated"), value: "updatedAt_desc", field: "updatedAt", order: "desc" as const },
];

const MessageTypeIcon: React.FC<{ type: MessageType }> = ({ type }) => {
    const iconMap: Record<MessageType, React.ReactNode> = {
        [MessageType.Text]: <MessageOutlined />,
        [MessageType.Voice]: <AudioOutlined />,
        [MessageType.Image]: <PictureOutlined />,
        [MessageType.Video]: <VideoCameraOutlined />,
        [MessageType.File]: <FileOutlined />,
        [MessageType.AllDeleted]: <DeleteOutlined />,
        [MessageType.Location]: <EnvironmentOutlined />,
        [MessageType.Custom]: <InfoCircleOutlined />,
        [MessageType.Call]: <PhoneOutlined />,
        [MessageType.Info]: <InfoCircleOutlined />,
        [MessageType.Reaction]: <SmileOutlined />,
        [MessageType.Sticker]: <SmileOutlined />,
        [MessageType.Gif]: <GifOutlined />,
        [MessageType.StoryReply]: <MessageOutlined />,
    };
    return <>{iconMap[type] || <MessageOutlined />}</>;
};

export const MessageList = () => {
    const { t } = useTranslation("messages");
    const { t: tc } = useTranslation("common");
    const { token } = theme.useToken();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [showFilters, setShowFilters] = useState(true);
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const { tableProps, sorters, tableQuery, setFilters: setTableFilters, setSorters, filters: tableFiltersState } = useTable<IMessage>({
        resource: "admin/messages",
        syncWithLocation: true,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    // Apply filters to table
    const applyFiltersToTable = useCallback((newFilters: FilterState) => {
        const filterParams: Array<{ field: string; operator: "eq" | "in"; value: unknown }> = [];
        if (newFilters.search) filterParams.push({ field: "search", operator: "eq", value: newFilters.search });
        if (newFilters.senderId) filterParams.push({ field: "senderId", operator: "eq", value: newFilters.senderId });
        if (newFilters.roomId) filterParams.push({ field: "roomId", operator: "eq", value: newFilters.roomId });
        if (newFilters.messageTypes.length > 0) filterParams.push({ field: "mT", operator: "in", value: newFilters.messageTypes });
        if (newFilters.isDeleted !== undefined) filterParams.push({ field: "isDeleted", operator: "eq", value: newFilters.isDeleted });
        if (newFilters.fromDate) filterParams.push({ field: "fromDate", operator: "eq", value: newFilters.fromDate });
        if (newFilters.toDate) filterParams.push({ field: "toDate", operator: "eq", value: newFilters.toDate });
        setTableFilters(filterParams, "replace");
        setSorters([{ field: newFilters.sortField, order: newFilters.sortOrder }]);
    }, [setTableFilters, setSorters]);
    // Initialize filters from URL on mount
    useEffect(() => {
        if (!filtersInitialized && tableFiltersState) {
            const urlFilters: FilterState = { ...initialFilters };
            tableFiltersState.forEach((f) => {
                if (!("field" in f)) return;
                if (f.field === "search" && f.value) urlFilters.search = f.value as string;
                if (f.field === "senderId" && f.value) urlFilters.senderId = f.value as string;
                if (f.field === "roomId" && f.value) urlFilters.roomId = f.value as string;
                if (f.field === "mT" && f.value) urlFilters.messageTypes = Array.isArray(f.value) ? f.value : [f.value];
                if (f.field === "isDeleted" && f.value !== undefined) urlFilters.isDeleted = f.value as boolean;
                if (f.field === "fromDate" && f.value) urlFilters.fromDate = f.value as string;
                if (f.field === "toDate" && f.value) urlFilters.toDate = f.value as string;
            });
            if (sorters && sorters.length > 0) {
                urlFilters.sortField = sorters[0].field;
                urlFilters.sortOrder = sorters[0].order;
            }
            setFilters(urlFilters);
            setFiltersInitialized(true);
        }
    }, [tableFiltersState, filtersInitialized, sorters]);
    const { open: notify } = useNotification();
    const { show: goToDetail } = useNavigation();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [detailMessage, setDetailMessage] = useState<IMessage | null>(null);
    // Auto-apply handlers for instant filters
    const handleMessageTypesChange = (value: MessageType[]) => {
        const newFilters = { ...filters, messageTypes: value };
        setFilters(newFilters);
        applyFiltersToTable(newFilters);
    };
    const handleDeletedStatusChange = (value: boolean | undefined) => {
        const newFilters = { ...filters, isDeleted: value };
        setFilters(newFilters);
        applyFiltersToTable(newFilters);
    };
    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        const newFilters = {
            ...filters,
            fromDate: dates?.[0]?.toISOString(),
            toDate: dates?.[1]?.toISOString(),
        };
        setFilters(newFilters);
        applyFiltersToTable(newFilters);
    };
    const sortOptions = getSortOptions(tc);
    const handleSortChange = (value: string) => {
        const option = sortOptions.find((o) => o.value === value);
        if (option) {
            const newFilters = { ...filters, sortField: option.field, sortOrder: option.order };
            setFilters(newFilters);
            applyFiltersToTable(newFilters);
        }
    };
    const handleApplyFilters = () => {
        applyFiltersToTable(filters);
    };
    const handleClearFilters = () => {
        setFilters(initialFilters);
        applyFiltersToTable(initialFilters);
    };
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            applyFiltersToTable(filters);
        }
    };
    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key === "messageTypes") return Array.isArray(value) && value.length > 0;
        if (key === "sortField" || key === "sortOrder") return false;
        return value !== undefined && value !== "";
    }).length;
    const handleBulkAction = async (action: "delete" | "restore") => {
        if (selectedRowKeys.length === 0) return;
        setBulkLoading(true);
        try {
            const updates = { deleted: action === "delete" };
            await axiosInstance.patch(`${API_URL}/admin/messages`, {
                messageIds: selectedRowKeys,
                updates,
            });
            notify?.({
                type: "success",
                message: tc("messages.messagesUpdated", { count: selectedRowKeys.length, action: action === "delete" ? tc("status.deleted").toLowerCase() : tc("actions.restore").toLowerCase() }),
            });
            setSelectedRowKeys([]);
            tableQuery?.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdateMessages") });
        } finally {
            setBulkLoading(false);
        }
    };
    const handleQuickDelete = async (message: IMessage) => {
        const deleted = isMessageDeleted(message);
        try {
            await axiosInstance.patch(`${API_URL}/admin/messages`, {
                messageIds: [message._id],
                updates: { deleted: !deleted },
            });
            notify?.({
                type: "success",
                message: deleted ? tc("messages.messageRestored") : tc("messages.messageDeleted"),
            });
            tableQuery?.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdate") });
        }
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };
    const getRowClassName = (record: IMessage) => {
        if (isMessageDeleted(record)) return "row-deleted";
        return "";
    };
    const totalMessages =
        tableProps.pagination && typeof tableProps.pagination === "object"
            ? tableProps.pagination.total || 0
            : 0;
    const renderMessageContent = (record: IMessage) => {
        const content = record.c || "";
        const type = record.mT;
        const attachment = record.msgAtt;
        const deleted = isMessageDeleted(record);
        if (deleted) {
            return (
                <Text type="secondary" italic>
                    <DeleteOutlined /> {tc("messages.thisMessageWasDeleted")}
                </Text>
            );
        }
        switch (type) {
            case MessageType.Image:
                return (
                    <Space direction="vertical" size={4}>
                        {attachment?.url && (
                            <Space>
                                <Image
                                    src={getMediaUrl(attachment.url)}
                                    alt="Message image"
                                    width={60}
                                    height={60}
                                    style={{ objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                                    preview={{
                                        src: getMediaUrl(attachment.url),
                                    }}
                                />
                                <Tooltip title="Download">
                                    <Button
                                        size="small"
                                        icon={<DownloadOutlined />}
                                        onClick={() => window.open(getMediaUrl(attachment.url), "_blank")}
                                    />
                                </Tooltip>
                            </Space>
                        )}
                        {content && <Text ellipsis style={{ maxWidth: 200 }}>{content}</Text>}
                    </Space>
                );
            case MessageType.Video:
                return attachment?.url ? (
                    <MiniVideoPlayer
                        url={getMediaUrl(attachment.url)!}
                        thumbnailUrl={attachment.thumbnailUrl ? getMediaUrl(attachment.thumbnailUrl) : undefined}
                        duration={attachment.duration}
                    />
                ) : (
                    <Space>
                        <VideoCameraOutlined style={{ fontSize: 20, color: "#722ed1" }} />
                        <Text>{tc("labels.videoNoUrl")}</Text>
                    </Space>
                );
            case MessageType.Voice:
                return attachment?.url ? (
                    <MiniAudioPlayer url={getMediaUrl(attachment.url)!} duration={attachment.duration} />
                ) : (
                    <Space>
                        <AudioOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
                        <Text>{tc("labels.voiceMessage")}</Text>
                        {attachment?.duration && (
                            <Text type="secondary">{formatDuration(attachment.duration)}</Text>
                        )}
                    </Space>
                );
            case MessageType.File:
                return (
                    <Space>
                        <FileOutlined style={{ fontSize: 20, color: "#13c2c2" }} />
                        <div>
                            <Text ellipsis style={{ maxWidth: 150 }}>{attachment?.fileName || tc("labels.file")}</Text>
                            {attachment?.fileSize && (
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                </Text>
                            )}
                        </div>
                        {attachment?.url && (
                            <Tooltip title={tc("actions.download")}>
                                <Button
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => window.open(getMediaUrl(attachment.url), "_blank")}
                                />
                            </Tooltip>
                        )}
                    </Space>
                );
            case MessageType.Location:
                return (
                    <Space>
                        <EnvironmentOutlined style={{ fontSize: 20, color: "#eb2f96" }} />
                        <Text>{tc("labels.locationShared")}</Text>
                    </Space>
                );
            case MessageType.Call:
                return (
                    <Space>
                        <PhoneOutlined style={{ fontSize: 20, color: "#fa541c" }} />
                        <Text>{content || tc("labels.call")}</Text>
                    </Space>
                );
            case MessageType.Sticker:
            case MessageType.Gif:
                return (
                    <Space>
                        {attachment?.url ? (
                            <Image
                                src={getMediaUrl(attachment.url)}
                                alt={type === MessageType.Sticker ? tc("labels.sticker") : tc("labels.gif")}
                                width={50}
                                height={50}
                                style={{ objectFit: "contain" }}
                                preview={{ src: getMediaUrl(attachment.url) }}
                            />
                        ) : (
                            <>
                                {type === MessageType.Sticker ? <SmileOutlined /> : <GifOutlined />}
                                <Text>{type === MessageType.Sticker ? tc("labels.sticker") : tc("labels.gif")}</Text>
                            </>
                        )}
                    </Space>
                );
            case MessageType.Reaction:
                return (
                    <Space>
                        <SmileOutlined style={{ fontSize: 20, color: "#faad14" }} />
                        <Text>{content || tc("labels.reaction")}</Text>
                    </Space>
                );
            case MessageType.Info:
                return (
                    <Text type="secondary" italic>
                        <InfoCircleOutlined /> {content || tc("labels.systemMessage")}
                    </Text>
                );
            default:
                return (
                    <Paragraph
                        ellipsis={{ rows: 2, tooltip: content }}
                        style={{ marginBottom: 0, maxWidth: 300 }}
                    >
                        {content || <Text type="secondary">{tc("labels.noContent")}</Text>}
                    </Paragraph>
                );
        }
    };
    return (
        <>
            <style>{`
                .row-deleted { background-color: ${token.colorFillSecondary} !important; opacity: 0.7; }
                .row-deleted:hover td { background-color: ${token.colorFillTertiary} !important; }
                .filter-card { margin-bottom: 16px; }
                .filter-card .ant-card-body { padding: 16px; }
                .message-content-cell { min-width: 250px; }
            `}</style>
            {/* Search & Filter Section */}
            <Card className="filter-card" size="small">
                <Row gutter={[16, 12]} align="middle">
                    <Col xs={24} md="auto" flex="auto">
                        <Space.Compact style={{ width: "100%" }}>
                            <Input
                                placeholder={tc("placeholders.searchInMessageContent")}
                                prefix={<SearchOutlined />}
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyPress={handleSearchKeyPress}
                                allowClear
                                onClear={() => {
                                    const newFilters = { ...filters, search: "" };
                                    setFilters(newFilters);
                                    applyFiltersToTable(newFilters);
                                }}
                            />
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                                {tc("actions.search")}
                            </Button>
                        </Space.Compact>
                    </Col>
                    <Col xs={24} md="auto">
                        <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Select
                                value={`${filters.sortField}_${filters.sortOrder}`}
                                onChange={handleSortChange}
                                style={{ minWidth: 160 }}
                                suffixIcon={filters.sortOrder === "desc" ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                            >
                                {sortOptions.map((opt) => (
                                    <Select.Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "default" : "dashed"}
                            >
                                {tc("actions.filters")} {activeFilterCount > 0 && <Badge count={activeFilterCount} size="small" style={{ marginLeft: 4 }} />}
                            </Button>
                            <Tooltip title={tc("actions.refresh")}>
                                <Button icon={<ReloadOutlined />} onClick={() => tableQuery?.refetch()} />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
                {showFilters && (
                    <>
                        <Divider style={{ margin: "12px 0" }} />
                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Input
                                    placeholder={tc("placeholders.senderUserId")}
                                    value={filters.senderId}
                                    onChange={(e) => setFilters({ ...filters, senderId: e.target.value })}
                                    onKeyPress={handleSearchKeyPress}
                                    allowClear
                                    onClear={() => {
                                        const newFilters = { ...filters, senderId: "" };
                                        setFilters(newFilters);
                                        applyFiltersToTable(newFilters);
                                    }}
                                    prefix={<UserOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Input
                                    placeholder={tc("placeholders.roomId")}
                                    value={filters.roomId}
                                    onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
                                    onKeyPress={handleSearchKeyPress}
                                    allowClear
                                    onClear={() => {
                                        const newFilters = { ...filters, roomId: "" };
                                        setFilters(newFilters);
                                        applyFiltersToTable(newFilters);
                                    }}
                                    prefix={<MessageOutlined />}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Select
                                    placeholder={tc("filters.messageTypes")}
                                    mode="multiple"
                                    value={filters.messageTypes}
                                    onChange={handleMessageTypesChange}
                                    allowClear
                                    maxTagCount={2}
                                    maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                                    style={{ width: "100%" }}
                                >
                                    {Object.entries(MESSAGE_TYPE_CONFIG).map(([type, config]) => (
                                        <Select.Option key={type} value={type}>
                                            <Tag color={config.color} style={{ margin: 0 }}>
                                                <MessageTypeIcon type={type as MessageType} /> {config.label}
                                            </Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    placeholder={tc("table.status")}
                                    value={filters.isDeleted}
                                    onChange={handleDeletedStatusChange}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value={false}>
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    </Select.Option>
                                    <Select.Option value={true}>
                                        <Tag color="red" icon={<DeleteOutlined />}>{tc("status.deleted")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={6}>
                                <RangePicker
                                    placeholder={[tc("placeholders.fromDate"), tc("placeholders.toDate")]}
                                    style={{ width: "100%" }}
                                    showTime={{ format: "HH:mm" }}
                                    format="YYYY-MM-DD HH:mm"
                                    value={[
                                        filters.fromDate ? dayjs(filters.fromDate) : null,
                                        filters.toDate ? dayjs(filters.toDate) : null,
                                    ]}
                                    onChange={handleDateRangeChange}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
                            <Col>
                                <Space>
                                    <Text type="secondary">
                                        {tc("table.messagesFound", { count: totalMessages })}
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                {activeFilterCount > 0 && (
                                    <Button icon={<ClearOutlined />} onClick={handleClearFilters} size="small">
                                        {tc("actions.clearAllFilters")}
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </>
                )}
            </Card>
            {/* Bulk Actions Bar */}
            {selectedRowKeys.length > 0 && (
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Space wrap>
                        <Tag color="blue" style={{ margin: 0 }}>
                            {tc("table.messagesSelected", { count: selectedRowKeys.length })}
                        </Tag>
                        <Divider type="vertical" />
                        <Popconfirm
                            title={tc("confirmations.deleteMessages", { count: selectedRowKeys.length })}
                            description={tc("confirmations.messagesWillBeSoftDeleted")}
                            onConfirm={() => handleBulkAction("delete")}
                        >
                            <Button danger size="small" loading={bulkLoading} icon={<DeleteOutlined />}>
                                {tc("actions.deleteSelected")}
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title={tc("confirmations.restoreMessages", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("restore")}
                        >
                            <Button size="small" loading={bulkLoading} icon={<UndoOutlined />}>
                                {tc("actions.restoreSelected")}
                            </Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" onClick={() => setSelectedRowKeys([])}>
                            {tc("actions.clearSelection")}
                        </Button>
                    </Space>
                </Card>
            )}
            {/* Messages Table */}
            <List title="" headerButtons={<></>}>
                <Table
                    {...tableProps}
                    rowKey="_id"
                    rowSelection={rowSelection}
                    rowClassName={getRowClassName}
                    scroll={{ x: 1200 }}
                    size="middle"
                    onRow={(record) => ({
                        onClick: (e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('.ant-checkbox-wrapper') || target.closest('.ant-popover') || target.closest('.ant-btn') || target.closest('.ant-image') || target.closest('.ant-slider') || target.closest('audio') || target.closest('video')) {
                                return;
                            }
                            goToDetail("admin/messages", record._id);
                        },
                        style: { cursor: 'pointer' },
                    })}
                >
                    <Table.Column
                        title={tc("table.sender")}
                        dataIndex="sName"
                        width={200}
                        render={(_, record: IMessage) => {
                            const imageUrl = getMediaUrl(record.sImg);
                            return (
                                <Space>
                                    <Avatar
                                        size={40}
                                        src={imageUrl}
                                        icon={<UserOutlined />}
                                        style={{
                                            cursor: "pointer",
                                            border: `2px solid ${token.colorBorderSecondary}`,
                                        }}
                                        onClick={() => goToDetail("admin/users", record.sId)}
                                    />
                                    <div>
                                        <Text
                                            strong
                                            ellipsis
                                            style={{
                                                maxWidth: 120,
                                                display: "block",
                                                cursor: "pointer",
                                                color: token.colorPrimary,
                                            }}
                                            onClick={() => goToDetail("admin/users", record.sId)}
                                        >
                                            {record.sName || tc("labels.unknown")}
                                        </Text>
                                        <Tooltip title={`${tc("labels.clickToViewUser")} • ID: ${record.sId}`}>
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 11, cursor: "pointer" }}
                                                onClick={() => goToDetail("admin/users", record.sId)}
                                            >
                                                {record.sId?.slice(-8)}
                                            </Text>
                                        </Tooltip>
                                    </div>
                                </Space>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.type")}
                        dataIndex="mT"
                        width={120}
                        render={(value: MessageType) => {
                            const config = MESSAGE_TYPE_CONFIG[value] || {
                                label: value,
                                color: "default",
                            };
                            return (
                                <Tag color={config.color} icon={<MessageTypeIcon type={value} />}>
                                    {config.label}
                                </Tag>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.content")}
                        dataIndex="c"
                        className="message-content-cell"
                        render={(_, record: IMessage) => renderMessageContent(record)}
                    />
                    <Table.Column
                        title={tc("table.room")}
                        dataIndex="rId"
                        width={140}
                        render={(value: string) => (
                            <Tooltip title={`${tc("table.room")} ID: ${value}`}>
                                <Text
                                    copyable={{ text: value, tooltips: [tc("actions.copy"), tc("messages.copied")] }}
                                    style={{ fontSize: 12 }}
                                >
                                    {value?.slice(-10)}
                                </Text>
                            </Tooltip>
                        )}
                    />
                    <Table.Column
                        title={tc("table.status")}
                        dataIndex="dltAt"
                        width={100}
                        render={(value, record: IMessage) => {
                            const deleted = isMessageDeleted(record);
                            const hasAtt = hasAttachment(record);
                            return (
                                <Space direction="vertical" size={2}>
                                    {deleted ? (
                                        <Tag color="red" icon={<DeleteOutlined />}>
                                            {tc("status.deleted")}
                                        </Tag>
                                    ) : (
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    )}
                                    {hasAtt && (
                                        <Tag color="blue" icon={<FileOutlined />}>
                                            {tc("labels.hasMedia")}
                                        </Tag>
                                    )}
                                    {record.forId && (
                                        <Tag color="purple">{tc("labels.forwarded")}</Tag>
                                    )}
                                </Space>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.reactions")}
                        dataIndex="reactionNumber"
                        width={100}
                        render={(value: number, record: IMessage) => {
                            if (!value || value === 0) return <Text type="secondary">-</Text>;
                            return (
                                <Tooltip
                                    title={
                                        record.reactionSample?.map((r) => `${r.emoji} ${r.count}`).join(", ") ||
                                        tc("table.reactions")
                                    }
                                >
                                    <Badge count={value} showZero={false} style={{ backgroundColor: "#faad14" }}>
                                        <SmileOutlined style={{ fontSize: 18 }} />
                                    </Badge>
                                </Tooltip>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.created")}
                        dataIndex="createdAt"
                        width={150}
                        render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
                    />
                    <Table.Column
                        title={tc("table.actions")}
                        fixed="right"
                        width={120}
                        render={(_, record: IMessage) => {
                            const deleted = isMessageDeleted(record);
                            return (
                                <Space size={4}>
                                    <Tooltip title={tc("actions.viewDetails")}>
                                        <Button
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => goToDetail("admin/messages", record._id)}
                                        />
                                    </Tooltip>
                                    <Tooltip title={deleted ? tc("actions.restore") : tc("actions.delete")}>
                                        <Popconfirm
                                            title={deleted ? tc("confirmations.restoreMessage") : tc("confirmations.deleteMessage")}
                                            onConfirm={() => handleQuickDelete(record)}
                                        >
                                            <Button
                                                size="small"
                                                danger={!deleted}
                                                type={deleted ? "primary" : "default"}
                                                icon={deleted ? <UndoOutlined /> : <DeleteOutlined />}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                </Space>
                            );
                        }}
                    />
                </Table>
            </List>
            {/* Image Preview Modal */}
            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                centered
                width="90%"
                style={{ maxWidth: 400 }}
            >
                <Image
                    src={previewImage || ""}
                    alt="Preview"
                    style={{ width: "100%" }}
                    preview={false}
                />
            </Modal>
            {/* Message Detail Modal */}
            <Modal
                open={!!detailMessage}
                title={t("details")}
                footer={null}
                onCancel={() => setDetailMessage(null)}
                width="90%"
                style={{ maxWidth: 600 }}
            >
                {detailMessage && (
                    <div style={{ padding: "16px 0" }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card size="small" title={tc("table.sender")}>
                                    <Space>
                                        <Avatar
                                            size={48}
                                            src={getMediaUrl(detailMessage.sImg)}
                                            icon={<UserOutlined />}
                                        />
                                        <div>
                                            <Text strong>{detailMessage.sName || tc("labels.unknown")}</Text>
                                            <br />
                                            <Text type="secondary" copyable>
                                                ID: {detailMessage.sId}
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title={t("fields.type")}>
                                    <Space direction="vertical" size={4}>
                                        <Text>
                                            <strong>{tc("table.type")}:</strong>{" "}
                                            <Tag color={MESSAGE_TYPE_CONFIG[detailMessage.mT]?.color}>
                                                {MESSAGE_TYPE_CONFIG[detailMessage.mT]?.label || detailMessage.mT}
                                            </Tag>
                                        </Text>
                                        <Text>
                                            <strong>Platform:</strong> {detailMessage.plm || tc("labels.unknown")}
                                        </Text>
                                        <Text>
                                            <strong>{tc("table.status")}:</strong>{" "}
                                            {isMessageDeleted(detailMessage) ? (
                                                <Tag color="red">{tc("status.deleted")}</Tag>
                                            ) : (
                                                <Tag color="green">{tc("status.active")}</Tag>
                                            )}
                                        </Text>
                                        {detailMessage.isEncrypted && (
                                            <Text>
                                                <strong>Encrypted:</strong> Yes
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title={tc("table.date")}>
                                    <Space direction="vertical" size={4}>
                                        <Text>
                                            <strong>{tc("table.created")}:</strong>{" "}
                                            <DateField value={detailMessage.createdAt} format="YYYY-MM-DD HH:mm:ss" />
                                        </Text>
                                        {detailMessage.dltAt && (
                                            <Text>
                                                <strong>{tc("status.deleted")}:</strong>{" "}
                                                <DateField value={detailMessage.dltAt} format="YYYY-MM-DD HH:mm:ss" />
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card size="small" title={tc("table.content")}>
                                    {renderMessageContent(detailMessage)}
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card size="small" title="IDs">
                                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                        <Text copyable={{ text: detailMessage._id }}>
                                            <strong>{t("fields.id")}:</strong> {detailMessage._id}
                                        </Text>
                                        <Text copyable={{ text: detailMessage.rId }}>
                                            <strong>{tc("table.room")} ID:</strong> {detailMessage.rId}
                                        </Text>
                                        {detailMessage.forId && (
                                            <Text copyable={{ text: detailMessage.forId }}>
                                                <strong>{tc("labels.forwarded")}:</strong> {detailMessage.forId}
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                            {(detailMessage.reactionNumber ?? 0) > 0 && (
                                <Col span={24}>
                                    <Card size="small" title={`${tc("table.reactions")} (${detailMessage.reactionNumber})`}>
                                        <Space wrap>
                                            {detailMessage.reactionSample?.map((r, i) => (
                                                <Tag key={i} style={{ fontSize: 16 }}>
                                                    {r.emoji} {r.count}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>
        </>
    );
};