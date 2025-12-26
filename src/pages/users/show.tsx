import { useState, useEffect } from "react";
import { useShow, useNotification, useNavigation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Show, DateField } from "@refinedev/antd";
import {
    Typography,
    Descriptions,
    Avatar,
    Tag,
    Card,
    Row,
    Col,
    Table,
    Spin,
    Space,
    Button,
    Statistic,
    Divider,
    Popconfirm,
    Badge,
    Tooltip,
    Image,
    Modal,
    Tabs,
    Empty,
    Progress,
    theme,
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    DeleteOutlined,
    LogoutOutlined,
    MobileOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    GlobalOutlined,
    VideoCameraOutlined,
    FileImageOutlined,
    PlayCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import { IUser, IUserDevice, IUserRoom, isUserBanned, isUserDeleted, isUserVerified, isUserOnline, getRoomTypeLabel, getRoomTypeColor } from "../../types/user.types";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { EditUserModal } from "./components/EditUserModal";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography;

interface IStory {
    _id: string;
    userId: string | { _id: string; fullName: string; userImage?: string };
    storyType: string;
    content?: string;
    caption?: string;
    views?: { uId: string; viewAt: string }[];
    expireAt: string;
    createdAt: string;
}

interface ICall {
    _id: string;
    caller: { _id: string; fullName: string; fullPhone: string; userImage?: string } | string;
    callee: { _id: string; fullName: string; fullPhone: string; userImage?: string } | string;
    callStatus: string;
    withVideo?: boolean;
    duration?: number;
    createdAt: string;
    endAt?: string;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const UserShow = () => {
    const { t } = useTranslation("users");
    const { token } = theme.useToken();
    const { query } = useShow<{ user: IUser; devices: IUserDevice[]; roomCount: number }>({
        resource: "admin/users",
    });
    const { data, isLoading, refetch } = query;
    const responseData = data?.data as { user: IUser; devices: IUserDevice[]; roomCount: number } | undefined;
    const user = responseData?.user;
    const devices = responseData?.devices || [];
    const roomCount = responseData?.roomCount || 0;
    const { open: notify } = useNotification();
    const { show: goToDetail } = useNavigation();
    const navigate = useNavigate();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [rooms, setRooms] = useState<IUserRoom[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsPagination, setRoomsPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [stories, setStories] = useState<IStory[]>([]);
    const [storiesLoading, setStoriesLoading] = useState(false);
    const [storiesPagination, setStoriesPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [calls, setCalls] = useState<ICall[]>([]);
    const [callsLoading, setCallsLoading] = useState(false);
    const [callsPagination, setCallsPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    useEffect(() => {
        if (user?._id && activeTab === "rooms") {
            fetchRooms(roomsPagination.page);
        }
    }, [user?._id, activeTab]);
    useEffect(() => {
        if (user?._id && activeTab === "stories") {
            fetchStories(storiesPagination.page);
        }
    }, [user?._id, activeTab]);
    useEffect(() => {
        if (user?._id && activeTab === "calls") {
            fetchCalls(callsPagination.page);
        }
    }, [user?._id, activeTab]);
    const fetchRooms = async (page: number) => {
        if (!user?._id) return;
        setRoomsLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/users/${user._id}/rooms`, {
                params: { page, limit: roomsPagination.limit },
            });
            const data = response.data?.data || response.data;
            setRooms(data?.docs || []);
            setRoomsPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setRoomsLoading(false);
        }
    };
    const fetchStories = async (page: number) => {
        if (!user?._id) return;
        setStoriesLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/stories`, {
                params: { userId: user._id, page, limit: storiesPagination.limit },
            });
            const data = response.data?.data || response.data;
            setStories(data?.docs || []);
            setStoriesPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error) {
            console.error("Failed to fetch stories:", error);
        } finally {
            setStoriesLoading(false);
        }
    };
    const fetchCalls = async (page: number) => {
        if (!user?._id) return;
        setCallsLoading(true);
        try {
            const [callerRes, calleeRes] = await Promise.all([
                axiosInstance.get(`${API_URL}/admin/calls`, {
                    params: { callerId: user._id, page: 1, limit: 100 },
                }),
                axiosInstance.get(`${API_URL}/admin/calls`, {
                    params: { calleeId: user._id, page: 1, limit: 100 },
                }),
            ]);
            const callerData = callerRes.data?.data || callerRes.data;
            const calleeData = calleeRes.data?.data || calleeRes.data;
            const callerCalls = callerData?.docs || [];
            const calleeCalls = calleeData?.docs || [];
            const allCalls = [...callerCalls, ...calleeCalls];
            const uniqueCalls = allCalls.filter(
                (call, index, self) => index === self.findIndex((c) => c._id === call._id)
            );
            uniqueCalls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const start = (page - 1) * callsPagination.limit;
            const paginatedCalls = uniqueCalls.slice(start, start + callsPagination.limit);
            setCalls(paginatedCalls);
            setCallsPagination({
                page,
                limit: callsPagination.limit,
                total: uniqueCalls.length,
                totalPages: Math.ceil(uniqueCalls.length / callsPagination.limit),
            });
        } catch (error) {
            console.error("Failed to fetch calls:", error);
        } finally {
            setCallsLoading(false);
        }
    };
    if (isLoading || !user) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    const banned = isUserBanned(user);
    const deleted = isUserDeleted(user);
    const verified = isUserVerified(user);
    const online = isUserOnline(user);
    const imageUrl = getMediaUrl(user.userImage);
    const handleBanToggle = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { banTo: banned ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
            });
            notify?.({ type: "success", message: banned ? t("notifications.unbanned") : t("notifications.banned") });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.updateFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleVerifyToggle = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { hasBadge: !verified },
            });
            notify?.({ type: "success", message: verified ? t("notifications.badgeRemoved") : t("notifications.verified") });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.updateFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeleteToggle = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { deletedAt: deleted ? null : new Date().toISOString() },
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
    const handleLogoutAll = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post(`${API_URL}/admin/users/${user._id}/logout-all`);
            notify?.({ type: "success", message: t("notifications.loggedOut") });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.logoutFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const formatCallDuration = (seconds: number | undefined): string => {
        if (!seconds || seconds <= 0) return "0:00";
        const d = dayjs.duration(seconds, "seconds");
        const hours = Math.floor(d.asHours());
        const minutes = d.minutes();
        const secs = d.seconds();
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };
    const getCallStatusColor = (status: string | undefined): string => {
        if (!status) return "default";
        const colors: Record<string, string> = {
            Ring: "processing",
            Canceled: "orange",
            Timeout: "red",
            Offline: "default",
            Rejected: "orange",
            Finished: "green",
            Accepted: "blue",
        };
        return colors[status] || "default";
    };
    const isStoryExpired = (story: IStory): boolean => {
        return new Date(story.expireAt) < new Date();
    };
    const getStoryExpiryProgress = (story: IStory): number => {
        const created = new Date(story.createdAt).getTime();
        const expire = new Date(story.expireAt).getTime();
        const now = Date.now();
        const total = expire - created;
        const elapsed = now - created;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };
    const handleRoomClick = (record: IUserRoom) => {
        const roomId = record.rId || record._id;
        navigate(`/rooms/show/${roomId}?type=${record.rT}`);
    };
    const roomColumns = [
        {
            title: t("rooms.title"),
            key: "room",
            render: (_: unknown, record: IUserRoom) => (
                <Space>
                    <Avatar size={40} src={getMediaUrl(record.img)} icon={<TeamOutlined />} />
                    <div>
                        <Button
                            type="link"
                            style={{ padding: 0, height: "auto", fontWeight: 500 }}
                            onClick={() => handleRoomClick(record)}
                        >
                            {record.t || record.tEn || t("show.untitled")}
                        </Button>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {getRoomTypeLabel(record.rT)}
                            </Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: t("rooms.type"),
            dataIndex: "rT",
            key: "type",
            render: (value: string) => (
                <Tag color={getRoomTypeColor(value)}>
                    {getRoomTypeLabel(value)}
                </Tag>
            ),
        },
        {
            title: t("rooms.status"),
            key: "status",
            render: (_: unknown, record: IUserRoom) => (
                <Space direction="vertical" size={0}>
                    {record.isA && <Tag color="blue">{t("rooms.admin")}</Tag>}
                    {record.isM && <Tag color="green">{t("rooms.moderator")}</Tag>}
                    {record.isD && <Tag color="red">{t("show.deleted")}</Tag>}
                </Space>
            ),
        },
        {
            title: t("rooms.actions"),
            key: "actions",
            render: (_: unknown, record: IUserRoom) => (
                record.rT === "g" && record.rId ? (
                    <Button type="link" size="small" onClick={() => goToDetail("admin/rooms/groups", record.rId!)}>
                        {t("actions.viewGroup")}
                    </Button>
                ) : null
            ),
        },
    ];
    const storyColumns = [
        {
            title: t("stories.media"),
            key: "media",
            width: 100,
            render: (_: unknown, record: IStory) => {
                const type = record.storyType?.toLowerCase();
                return type === "image" ? (
                    <Image
                        src={getMediaUrl(record.content)}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    />
                ) : type === "video" ? (
                    <div style={{ width: 60, height: 60, background: token.colorFillSecondary, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PlayCircleOutlined style={{ fontSize: 24, color: token.colorTextTertiary }} />
                    </div>
                ) : (
                    <div style={{ width: 60, height: 60, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileImageOutlined style={{ fontSize: 24, color: "#fff" }} />
                    </div>
                );
            },
        },
        {
            title: t("stories.type"),
            dataIndex: "storyType",
            key: "type",
            render: (value: string) => {
                const type = value?.toLowerCase();
                return (
                    <Tag color={type === "image" ? "blue" : type === "video" ? "purple" : "green"}>
                        {value || t("show.unknown")}
                    </Tag>
                );
            },
        },
        {
            title: t("stories.caption"),
            dataIndex: "caption",
            key: "caption",
            ellipsis: true,
            width: 200,
            render: (value: string) => value || <Text type="secondary">-</Text>,
        },
        {
            title: t("stories.views"),
            key: "views",
            render: (_: unknown, record: IStory) => (
                <Space>
                    <EyeOutlined />
                    {record.views?.length || 0}
                </Space>
            ),
        },
        {
            title: t("stories.expiry"),
            key: "expiry",
            width: 150,
            render: (_: unknown, record: IStory) => {
                const expired = isStoryExpired(record);
                const progress = getStoryExpiryProgress(record);
                return (
                    <div style={{ width: 100 }}>
                        <Progress
                            percent={Math.round(progress)}
                            size="small"
                            status={expired ? "exception" : "active"}
                            showInfo={false}
                        />
                        <Text type={expired ? "danger" : "secondary"} style={{ fontSize: 11 }}>
                            {expired ? t("stories.expired") : dayjs(record.expireAt).fromNow()}
                        </Text>
                    </div>
                );
            },
        },
        {
            title: t("stories.created"),
            dataIndex: "createdAt",
            key: "created",
            render: (value: string) => dayjs(value).format("MMM DD, HH:mm"),
        },
        {
            title: t("rooms.actions"),
            key: "actions",
            render: (_: unknown, record: IStory) => (
                <Button type="link" size="small" onClick={() => goToDetail("admin/stories", record._id)}>
                    {t("actions.viewDetails")}
                </Button>
            ),
        },
    ];
    const callColumns = [
        {
            title: t("calls.type"),
            key: "type",
            width: 80,
            render: (_: unknown, record: ICall) => {
                return record.withVideo ? (
                    <Tag color="purple" icon={<VideoCameraOutlined />}>{t("calls.video")}</Tag>
                ) : (
                    <Tag color="blue" icon={<PhoneOutlined />}>{t("calls.voice")}</Tag>
                );
            },
        },
        {
            title: t("calls.direction"),
            key: "direction",
            render: (_: unknown, record: ICall) => {
                const callerId = typeof record.caller === "object" ? record.caller._id : record.caller;
                const isCaller = callerId === user._id;
                const otherParty = isCaller
                    ? (typeof record.callee === "object" ? record.callee : null)
                    : (typeof record.caller === "object" ? record.caller : null);
                return (
                    <Space>
                        <Tag color={isCaller ? "green" : "orange"}>
                            {isCaller ? t("calls.outgoing") : t("calls.incoming")}
                        </Tag>
                        {otherParty && (
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0 }}
                                onClick={() => goToDetail("users", otherParty._id)}
                            >
                                {otherParty.fullName}
                            </Button>
                        )}
                    </Space>
                );
            },
        },
        {
            title: t("calls.status"),
            key: "status",
            render: (_: unknown, record: ICall) => {
                const status = record.callStatus || t("show.unknown");
                return (
                    <Tag color={getCallStatusColor(record.callStatus)}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: t("calls.duration"),
            dataIndex: "duration",
            key: "duration",
            render: (value: number) => formatCallDuration(value),
        },
        {
            title: t("calls.date"),
            dataIndex: "createdAt",
            key: "date",
            render: (value: string) => (
                <Tooltip title={dayjs(value).format("YYYY-MM-DD HH:mm:ss")}>
                    {dayjs(value).format("MMM DD, HH:mm")}
                </Tooltip>
            ),
        },
        {
            title: t("rooms.actions"),
            key: "actions",
            render: (_: unknown, record: ICall) => (
                <Button type="link" size="small" onClick={() => goToDetail("admin/calls", record._id)}>
                    {t("actions.viewDetails")}
                </Button>
            ),
        },
    ];
    const tabItems = [
        {
            key: "overview",
            label: (
                <span>
                    <UserOutlined />
                    {t("tabs.overview")}
                </span>
            ),
            children: (
                <>
                    <Card title={t("show.userInformation")} style={{ marginBottom: 24 }}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={t("fields.id")}>
                                <Text copyable={{ text: user._id }}>{user._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.phone")}>{user.fullPhone}</Descriptions.Item>
                            <Descriptions.Item label={t("fields.email")}>{user.email || "-"}</Descriptions.Item>
                            <Descriptions.Item label={t("fields.platform")}>
                                <Tag color={user.platform === "android" ? "green" : "blue"}>
                                    {user.platform}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.registrationStatus")}>
                                <Tag color={user.registerStatus === "accepted" ? "green" : "orange"}>
                                    {user.registerStatus}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.verification")}>
                                {verified ? (
                                    <Tag color="blue" icon={<SafetyCertificateOutlined />}>{t("filters.verified")}</Tag>
                                ) : (
                                    <Tag>{t("show.notVerified")}</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.country")}>
                                {typeof user.countryId === "object" ? (
                                    <Space>
                                        <GlobalOutlined />
                                        {user.countryId?.name || "-"}
                                    </Space>
                                ) : (user.countryId || "-")}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.isOnline")}>
                                <Badge status={online ? "success" : "default"} text={online ? t("show.online") : t("show.offline")} />
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.lastSeen")}>
                                <Space>
                                    <ClockCircleOutlined />
                                    {user.lastSeenAt ? (
                                        <Tooltip title={dayjs(user.lastSeenAt).format("YYYY-MM-DD HH:mm:ss")}>
                                            {dayjs(user.lastSeenAt).fromNow()}
                                        </Tooltip>
                                    ) : "-"}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("fields.registered")}>
                                <Space>
                                    <CalendarOutlined />
                                    <DateField value={user.createdAt} format="MMM DD, YYYY HH:mm" />
                                </Space>
                            </Descriptions.Item>
                            {banned && (
                                <Descriptions.Item label={t("fields.banExpires")} span={2}>
                                    <Tag color="red" icon={<StopOutlined />}>
                                        {dayjs(user.banTo).format("MMM DD, YYYY HH:mm")}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            {deleted && (
                                <Descriptions.Item label={t("fields.deletedAt")} span={2}>
                                    <Tag color="default" icon={<DeleteOutlined />}>
                                        <DateField value={user.deletedAt!} format="MMM DD, YYYY HH:mm" />
                                    </Tag>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    <Card
                        title={<Space><MobileOutlined /> {t("devices.title")} ({devices.length})</Space>}
                        size="small"
                    >
                        <Table
                            dataSource={[...devices].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())}
                            rowKey="_id"
                            size="small"
                            pagination={{ pageSize: 20, showSizeChanger: true }}
                            scroll={{ x: 600 }}
                        >
                            <Table.Column
                                title={t("devices.platform")}
                                dataIndex="platform"
                                render={(value) => (
                                    <Tag color={value === "android" ? "green" : value === "ios" ? "blue" : "purple"}>{value || t("show.unknown")}</Tag>
                                )}
                            />
                            <Table.Column
                                title={t("devices.version")}
                                dataIndex="clintVersion"
                                render={(value) => value || "-"}
                            />
                            <Table.Column
                                title={t("devices.lastActive")}
                                dataIndex="lastSeenAt"
                                render={(value) => value ? (
                                    <Tooltip title={dayjs(value).format("YYYY-MM-DD HH:mm")}>
                                        {dayjs(value).fromNow()}
                                    </Tooltip>
                                ) : "-"}
                            />
                            <Table.Column
                                title={t("devices.push")}
                                dataIndex="pushKey"
                                render={(value) => (
                                    <Badge status={value ? "success" : "default"} text={value ? t("devices.enabled") : t("devices.disabled")} />
                                )}
                            />
                            <Table.Column
                                title={t("devices.actions")}
                                render={(_: unknown, record: IUserDevice) => (
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => goToDetail("admin/devices", record._id)}
                                    >
                                        {t("actions.view")}
                                    </Button>
                                )}
                            />
                        </Table>
                    </Card>
                </>
            ),
        },
        {
            key: "rooms",
            label: (
                <span>
                    <TeamOutlined />
                    {t("tabs.rooms")} ({roomCount})
                </span>
            ),
            children: (
                <Card>
                    <Table
                        dataSource={rooms}
                        columns={roomColumns}
                        rowKey="_id"
                        size="small"
                        loading={roomsLoading}
                        locale={{ emptyText: <Empty description={t("rooms.noRooms")} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        scroll={{ x: 600 }}
                        pagination={{
                            current: roomsPagination.page,
                            pageSize: roomsPagination.limit,
                            total: roomsPagination.total,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                            onChange: (page, pageSize) => {
                                setRoomsPagination((prev) => ({ ...prev, page, limit: pageSize }));
                                fetchRooms(page);
                            },
                        }}
                    />
                </Card>
            ),
        },
        {
            key: "stories",
            label: (
                <span>
                    <FileImageOutlined />
                    {t("tabs.stories")} ({storiesPagination.total || 0})
                </span>
            ),
            children: (
                <Card>
                    <Table
                        dataSource={stories}
                        columns={storyColumns}
                        rowKey="_id"
                        size="small"
                        loading={storiesLoading}
                        locale={{ emptyText: <Empty description={t("stories.noStories")} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        scroll={{ x: 800 }}
                        pagination={{
                            current: storiesPagination.page,
                            pageSize: storiesPagination.limit,
                            total: storiesPagination.total,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                            onChange: (page, pageSize) => {
                                setStoriesPagination((prev) => ({ ...prev, page, limit: pageSize }));
                                fetchStories(page);
                            },
                        }}
                    />
                </Card>
            ),
        },
        {
            key: "calls",
            label: (
                <span>
                    <PhoneOutlined />
                    {t("tabs.calls")} ({callsPagination.total || 0})
                </span>
            ),
            children: (
                <Card>
                    <Table
                        dataSource={calls}
                        columns={callColumns}
                        rowKey="_id"
                        size="small"
                        loading={callsLoading}
                        locale={{ emptyText: <Empty description={t("calls.noCalls")} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        scroll={{ x: 700 }}
                        pagination={{
                            current: callsPagination.page,
                            pageSize: callsPagination.limit,
                            total: callsPagination.total,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                            onChange: (page, pageSize) => {
                                setCallsPagination((prev) => ({ ...prev, page, limit: pageSize }));
                                fetchCalls(page);
                            },
                        }}
                    />
                </Card>
            ),
        },
    ];
    return (
        <Show
            headerButtons={
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
                        {t("actions.edit")}
                    </Button>
                    <Popconfirm
                        title={banned ? t("confirmations.unbanUser") : t("confirmations.banUser")}
                        onConfirm={handleBanToggle}
                    >
                        <Button
                            danger={!banned}
                            type={banned ? "primary" : "default"}
                            icon={<StopOutlined />}
                            loading={actionLoading}
                        >
                            {banned ? t("actions.unban") : t("actions.ban")}
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title={verified ? t("confirmations.unverifyUser") : t("confirmations.verifyUser")}
                        onConfirm={handleVerifyToggle}
                    >
                        <Button
                            type={verified ? "primary" : "default"}
                            icon={<SafetyCertificateOutlined />}
                            loading={actionLoading}
                        >
                            {verified ? t("actions.unverify") : t("actions.verify")}
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <div style={{ textAlign: "center" }}>
                            <Badge dot status={online ? "success" : "default"} offset={[-8, 110]}>
                                <Avatar
                                    size={120}
                                    src={imageUrl}
                                    icon={<UserOutlined />}
                                    style={{
                                        cursor: imageUrl ? "pointer" : "default",
                                        border: `4px solid ${token.colorBorderSecondary}`,
                                    }}
                                    onClick={() => imageUrl && setPreviewImage(imageUrl)}
                                />
                            </Badge>
                            <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                                {user.fullName}
                                {verified && (
                                    <Tooltip title={t("show.verifiedUser")}>
                                        <SafetyCertificateOutlined style={{ color: "#1890ff", marginLeft: 8, fontSize: 20 }} />
                                    </Tooltip>
                                )}
                            </Title>
                            <Space direction="vertical" size={8}>
                                <Text type="secondary">
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    {user.fullPhone}
                                </Text>
                                {user.email && (
                                    <Text type="secondary">
                                        <MailOutlined style={{ marginRight: 8 }} />
                                        {user.email}
                                    </Text>
                                )}
                            </Space>
                            <div style={{ marginTop: 16 }}>
                                <Space wrap>
                                    {deleted && <Tag color="default">{t("show.deleted")}</Tag>}
                                    {banned ? (
                                        <Tag color="red" icon={<StopOutlined />}>
                                            {t("show.bannedUntil", { date: dayjs(user.banTo).format("MMM DD, YYYY") })}
                                        </Tag>
                                    ) : (
                                        <Tag color="green">{t("show.active")}</Tag>
                                    )}
                                    <Tag color={user.platform === "android" ? "green" : "blue"}>
                                        {user.platform}
                                    </Tag>
                                </Space>
                            </div>
                            {user.userBio && (
                                <Paragraph type="secondary" style={{ marginTop: 16, fontStyle: "italic" }} ellipsis={{ rows: 3 }}>
                                    "{user.userBio}"
                                </Paragraph>
                            )}
                        </div>
                        <Divider />
                        <Row gutter={[16, 16]}>
                            <Col xs={8} sm={8}>
                                <Statistic title={t("stats.devices")} value={devices.length} prefix={<MobileOutlined />} />
                            </Col>
                            <Col xs={8} sm={8}>
                                <Statistic title={t("stats.rooms")} value={roomCount} prefix={<TeamOutlined />} />
                            </Col>
                            <Col xs={8} sm={8}>
                                <Statistic title={t("stats.stories")} value={storiesPagination.total || "-"} prefix={<FileImageOutlined />} />
                            </Col>
                        </Row>
                        <Divider />
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Popconfirm
                                title={deleted ? t("confirmations.restoreUser") : t("confirmations.deleteUser")}
                                onConfirm={handleDeleteToggle}
                            >
                                <Button
                                    danger={!deleted}
                                    type={deleted ? "primary" : "default"}
                                    icon={<DeleteOutlined />}
                                    block
                                    loading={actionLoading}
                                >
                                    {deleted ? t("actions.restore") : t("actions.delete")}
                                </Button>
                            </Popconfirm>
                            <Popconfirm title={t("confirmations.logoutAll")} onConfirm={handleLogoutAll}>
                                <Button icon={<LogoutOutlined />} block loading={actionLoading}>
                                    {t("actions.logoutAll")}
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card bodyStyle={{ padding: 0 }}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            style={{ padding: "0 24px" }}
                        />
                    </Card>
                </Col>
            </Row>
            <EditUserModal
                user={user}
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={() => refetch()}
            />
            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                centered
                width="90%"
                style={{ maxWidth: 500 }}
            >
                <Image src={previewImage || ""} alt="User avatar" style={{ width: "100%" }} preview={false} />
            </Modal>
        </Show>
    );
};