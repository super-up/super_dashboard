import { useState, useEffect } from "react";
import { useNavigation, useNotification } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { useParams, useSearchParams } from "react-router-dom";
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
    Badge,
    Input,
    Tooltip,
} from "antd";
import {
    TeamOutlined,
    UserOutlined,
    CalendarOutlined,
    DeleteOutlined,
    RollbackOutlined,
    CrownOutlined,
    SearchOutlined,
    MessageOutlined,
    SoundOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

type RoomType = "groups" | "broadcasts" | "singles";

interface IRoomMember {
    _id: string;
    uId: {
        _id: string;
        fullName: string;
        fullPhone: string;
        userImage?: string;
    };
    rId: string;
    lastSeenAt?: string;
    createdAt: string;
}

interface IGroupRoom {
    _id: string;
    gTitle: string;
    gDescription?: string;
    gImg?: string;
    gMembersCount: number;
    gType: string;
    creatorId?: {
        _id: string;
        fullName: string;
        fullPhone: string;
        userImage?: string;
    };
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

interface IBroadcastRoom {
    _id: string;
    bTitle?: string;
    bImg?: string;
    bMembersCount?: number;
    creatorId?: {
        _id: string;
        fullName: string;
        fullPhone?: string;
        userImage?: string;
    };
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

interface ISingleRoom {
    _id: string;
    peerUser1?: {
        _id: string;
        fullName: string;
        userImage?: string;
        fullPhone?: string;
    };
    peerUser2?: {
        _id: string;
        fullName: string;
        userImage?: string;
        fullPhone?: string;
    };
    msgCount?: number;
    lastMsgAt?: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export const RoomShow = () => {
    const { t } = useTranslation("rooms");
    const { t: tc } = useTranslation("common");
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const roomType = (searchParams.get("type") || "g") as "g" | "b" | "s";
    const typeMap: Record<string, RoomType> = { g: "groups", b: "broadcasts", s: "singles" };
    const type = typeMap[roomType] || "groups";
    const [room, setRoom] = useState<IGroupRoom | IBroadcastRoom | ISingleRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<IRoomMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedMemberKeys, setSelectedMemberKeys] = useState<React.Key[]>([]);
    const [removeLoading, setRemoveLoading] = useState(false);
    const { show: goToUser } = useNavigation();
    const { open: notify } = useNotification();
    useEffect(() => {
        if (id) {
            fetchRoom();
        }
    }, [id, type]);
    useEffect(() => {
        if (room?._id && type === "broadcasts") {
            fetchMembers();
        }
    }, [room?._id, type]);
    const fetchRoom = async () => {
        setLoading(true);
        setMembersLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/rooms/${type}/${id}`);
            const data = response.data?.data || response.data;
            if (type === "groups") {
                // Backend returns {group, members, messageCount} for groups
                const groupData = data.group || data;
                setRoom({
                    ...groupData,
                    gTitle: groupData.gName || groupData.gTitle,
                    gDescription: groupData.desc || groupData.gDescription,
                    gMembersCount: data.members?.length || groupData.gMembersCount || 0,
                    messageCount: data.messageCount || 0,
                });
                // Members are included in the group response
                const membersList = data.members || [];
                setMembers(membersList.map((m: any) => ({
                    _id: m._id,
                    uId: m.uId || m.userData || m,
                    rId: m.rId,
                    gR: m.gR,
                    createdAt: m.createdAt,
                })));
            } else {
                // Broadcasts and singles return the object directly
                setRoom(data);
            }
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
        } finally {
            setLoading(false);
            if (type === "groups") {
                setMembersLoading(false);
            }
        }
    };
    const fetchMembers = async () => {
        if (!room?._id) return;
        setMembersLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/rooms/${type}/${room._id}/members`);
            const data = response.data?.data || response.data;
            setMembers(data?.docs || data || []);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setMembersLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!room?._id) return;
        setActionLoading(true);
        try {
            const idFieldMap: Record<RoomType, string> = {
                groups: "groupIds",
                broadcasts: "broadcastIds",
                singles: "singleIds",
            };
            const idField = idFieldMap[type];
            await axiosInstance.patch(`${API_URL}/admin/rooms/${type}`, {
                [idField]: [room._id],
                updates: { deleted: !room.deletedAt },
            });
            notify?.({
                type: "success",
                message: room.deletedAt ? "Room restored" : "Room deleted",
            });
            fetchRoom();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Operation failed" });
        } finally {
            setActionLoading(false);
        }
    };
    const handleRemoveMembers = async () => {
        if (!room?._id || selectedMemberKeys.length === 0) return;
        setRemoveLoading(true);
        try {
            const userIds = selectedMemberKeys
                .map((key) => {
                    const member = members.find((m) => m._id === key);
                    return member?.uId?._id;
                })
                .filter(Boolean);
            const response = await axiosInstance.patch(`${API_URL}/admin/rooms/groups/members`, {
                groupId: room._id,
                userIds,
            });
            const removedCount = response.data?.data?.removedCount || 0;
            notify?.({
                type: "success",
                message: `Removed ${removedCount} member(s) from group`,
            });
            setSelectedMemberKeys([]);
            fetchRoom();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to remove members" });
        } finally {
            setRemoveLoading(false);
        }
    };
    const isDeleted = !!room?.deletedAt;
    const rowSelection = {
        selectedRowKeys: selectedMemberKeys,
        onChange: (keys: React.Key[]) => setSelectedMemberKeys(keys),
        getCheckboxProps: (record: IRoomMember) => {
            const groupRoom = room as IGroupRoom;
            const isCreator = record.uId?._id === groupRoom?.creatorId?._id;
            return { disabled: isCreator };
        },
    };
    const filteredMembers = members.filter((member) => {
        if (!memberSearch) return true;
        const search = memberSearch.toLowerCase();
        return (
            member.uId?.fullName?.toLowerCase().includes(search) ||
            member.uId?.fullPhone?.toLowerCase().includes(search)
        );
    });
    const memberColumns = [
        {
            title: tc("table.user"),
            key: "user",
            render: (_: unknown, record: IRoomMember) => (
                <Space>
                    <Avatar
                        src={getMediaUrl(record.uId?.userImage)}
                        icon={<UserOutlined />}
                        size={40}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.uId?.fullName || "Unknown"}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.uId?.fullPhone}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: tc("table.role"),
            key: "role",
            render: (_: unknown, record: IRoomMember) => {
                const groupRoom = room as IGroupRoom;
                const broadcastRoom = room as IBroadcastRoom;
                const creatorId = groupRoom?.creatorId?._id || broadcastRoom?.creatorId?._id;
                const isCreator = creatorId && record.uId?._id === creatorId;
                return isCreator ? (
                    <Tag color="gold" icon={<CrownOutlined />}>{tc("labels.owner")}</Tag>
                ) : (
                    <Tag color="default">{type === "broadcasts" ? tc("labels.recipient") : tc("labels.member")}</Tag>
                );
            },
        },
        {
            title: tc("table.joined"),
            dataIndex: "createdAt",
            key: "joined",
            render: (value: string) => dayjs(value).format("MMM DD, YYYY"),
        },
        {
            title: tc("table.lastSeen"),
            dataIndex: "lastSeenAt",
            key: "lastSeen",
            render: (value: string) => value ? dayjs(value).format("MMM DD, YYYY HH:mm") : "-",
        },
        {
            title: tc("table.actions"),
            key: "actions",
            render: (_: unknown, record: IRoomMember) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => goToUser("admin/users", record.uId?._id)}
                >
                    {tc("actions.viewUser")}
                </Button>
            ),
        },
    ];
    if (loading || !room) {
        return (
            <Show title={tc("labels.roomDetails")}>
                <div style={{ textAlign: "center", padding: 48 }}>
                    <Spin size="large" />
                </div>
            </Show>
        );
    }
    // Render based on room type
    const renderGroupRoom = () => {
        const groupRoom = room as IGroupRoom;
        return (
            <>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Card>
                            <div style={{ textAlign: "center", marginBottom: 24 }}>
                                <Avatar
                                    size={120}
                                    src={getMediaUrl(groupRoom.gImg)}
                                    icon={<TeamOutlined />}
                                    style={{ marginBottom: 16 }}
                                />
                                <Title level={3} style={{ margin: 0 }}>{groupRoom.gTitle || tc("labels.untitled")}</Title>
                                <Space style={{ marginTop: 8 }}>
                                    <Tag color={groupRoom.gType === "public" ? "green" : "orange"}>
                                        {groupRoom.gType || tc("labels.private")}
                                    </Tag>
                                    {isDeleted && <Tag color="red">{tc("status.deleted")}</Tag>}
                                </Space>
                            </div>
                            {groupRoom.gDescription && (
                                <>
                                    <Divider />
                                    <div>
                                        <Text type="secondary">{tc("labels.description")}</Text>
                                        <Paragraph style={{ marginTop: 8 }}>
                                            {groupRoom.gDescription}
                                        </Paragraph>
                                    </div>
                                </>
                            )}
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={12} sm={12}>
                                    <Statistic
                                        title={tc("table.members")}
                                        value={groupRoom.gMembersCount || 0}
                                        prefix={<TeamOutlined />}
                                    />
                                </Col>
                                <Col xs={12} sm={12}>
                                    <Statistic
                                        title={tc("table.messages")}
                                        value="-"
                                        prefix={<MessageOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Card title={tc("labels.roomInformation")} style={{ marginBottom: 24 }}>
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                <Descriptions.Item label={tc("labels.roomId")}>
                                    <Text copyable={{ text: groupRoom._id }}>{groupRoom._id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.type")}>
                                    <Tag color={groupRoom.gType === "public" ? "green" : "orange"}>
                                        {groupRoom.gType || tc("labels.private")}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdBy")}>
                                    {groupRoom.creatorId ? (
                                        <Space>
                                            <Avatar
                                                size="small"
                                                src={getMediaUrl(groupRoom.creatorId.userImage)}
                                                icon={<UserOutlined />}
                                            />
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ padding: 0 }}
                                                onClick={() => goToUser("admin/users", groupRoom.creatorId!._id)}
                                            >
                                                {groupRoom.creatorId.fullName}
                                            </Button>
                                        </Space>
                                    ) : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.membersCount")}>
                                    <Badge count={groupRoom.gMembersCount || 0} showZero color="#1890ff" />
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdAt")}>
                                    <Space>
                                        <CalendarOutlined />
                                        {dayjs(groupRoom.createdAt).format("MMM DD, YYYY HH:mm")}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.updatedAt")}>
                                    {groupRoom.updatedAt ? dayjs(groupRoom.updatedAt).format("MMM DD, YYYY HH:mm") : "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                        <Card
                            title={`${tc("table.members")} (${filteredMembers.length})`}
                            extra={
                                <Space>
                                    {selectedMemberKeys.length > 0 && (
                                        <Popconfirm
                                            title={tc("actions.removeMembers")}
                                            description={tc("confirmations.removeFromGroup", { count: selectedMemberKeys.length })}
                                            onConfirm={handleRemoveMembers}
                                            okText={tc("confirm")}
                                            cancelText={tc("actions.cancel")}
                                            okButtonProps={{ danger: true, loading: removeLoading }}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={removeLoading}
                                            >
                                                {tc("actions.removeMembers")} ({selectedMemberKeys.length})
                                            </Button>
                                        </Popconfirm>
                                    )}
                                    <Input
                                        placeholder={tc("placeholders.searchMembers") || "Search members..."}
                                        prefix={<SearchOutlined />}
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        style={{ width: "100%", maxWidth: 200 }}
                                        allowClear
                                    />
                                </Space>
                            }
                        >
                            <Table
                                dataSource={filteredMembers}
                                columns={memberColumns}
                                rowKey="_id"
                                loading={membersLoading}
                                pagination={{ pageSize: 20 }}
                                size="small"
                                rowSelection={rowSelection}
                                scroll={{ x: 600 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };
    const renderBroadcastRoom = () => {
        const broadcastRoom = room as IBroadcastRoom;
        return (
            <>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Card>
                            <div style={{ textAlign: "center", marginBottom: 24 }}>
                                <Avatar
                                    size={120}
                                    src={getMediaUrl(broadcastRoom.bImg)}
                                    icon={<SoundOutlined />}
                                    style={{ marginBottom: 16, background: "#722ed1" }}
                                />
                                <Title level={3} style={{ margin: 0 }}>{broadcastRoom.bTitle || tc("labels.untitled")}</Title>
                                <Space style={{ marginTop: 8 }}>
                                    <Tag color="purple" icon={<SoundOutlined />}>{t("types.broadcast")}</Tag>
                                    {isDeleted && <Tag color="red">{tc("status.deleted")}</Tag>}
                                </Space>
                            </div>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={24}>
                                    <Statistic
                                        title={tc("table.recipients")}
                                        value={broadcastRoom.bMembersCount || 0}
                                        prefix={<UserOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Card title={tc("labels.broadcastInformation")} style={{ marginBottom: 24 }}>
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                <Descriptions.Item label={tc("labels.broadcastId")}>
                                    <Text copyable={{ text: broadcastRoom._id }}>{broadcastRoom._id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.type")}>
                                    <Tag color="purple" icon={<SoundOutlined />}>{t("types.broadcast")}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdBy")}>
                                    {broadcastRoom.creatorId ? (
                                        <Space>
                                            <Avatar
                                                size="small"
                                                src={getMediaUrl(broadcastRoom.creatorId.userImage)}
                                                icon={<UserOutlined />}
                                            />
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ padding: 0 }}
                                                onClick={() => goToUser("admin/users", broadcastRoom.creatorId!._id)}
                                            >
                                                {broadcastRoom.creatorId.fullName}
                                            </Button>
                                        </Space>
                                    ) : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.recipientsCount")}>
                                    <Badge count={broadcastRoom.bMembersCount || 0} showZero color="#722ed1" />
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdAt")}>
                                    <Space>
                                        <CalendarOutlined />
                                        {dayjs(broadcastRoom.createdAt).format("MMM DD, YYYY HH:mm")}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.updatedAt")}>
                                    {broadcastRoom.updatedAt ? dayjs(broadcastRoom.updatedAt).format("MMM DD, YYYY HH:mm") : "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                        <Card
                            title={`${tc("table.recipients")} (${filteredMembers.length})`}
                            extra={
                                <Input
                                    placeholder={tc("placeholders.searchRecipients") || "Search recipients..."}
                                    prefix={<SearchOutlined />}
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    style={{ width: "100%", maxWidth: 200 }}
                                    allowClear
                                />
                            }
                        >
                            <Table
                                dataSource={filteredMembers}
                                columns={memberColumns}
                                rowKey="_id"
                                loading={membersLoading}
                                pagination={{ pageSize: 20 }}
                                size="small"
                                scroll={{ x: 600 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };
    const renderSingleRoom = () => {
        const singleRoom = room as ISingleRoom;
        return (
            <>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Card>
                            <div style={{ textAlign: "center", marginBottom: 24 }}>
                                <Space size={16}>
                                    <Avatar
                                        size={80}
                                        src={getMediaUrl(singleRoom.peerUser1?.userImage)}
                                        icon={<UserOutlined />}
                                    />
                                    <MessageOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                                    <Avatar
                                        size={80}
                                        src={getMediaUrl(singleRoom.peerUser2?.userImage)}
                                        icon={<UserOutlined />}
                                    />
                                </Space>
                                <div style={{ marginTop: 16 }}>
                                    <Tag color="blue" icon={<MessageOutlined />}>{tc("labels.directChat")}</Tag>
                                    {isDeleted && <Tag color="red">{tc("status.deleted")}</Tag>}
                                </div>
                            </div>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={12} sm={12}>
                                    <Statistic
                                        title={tc("table.messages")}
                                        value={singleRoom.msgCount || 0}
                                        prefix={<MessageOutlined />}
                                    />
                                </Col>
                                <Col xs={12} sm={12}>
                                    <Statistic
                                        title={tc("table.lastActive")}
                                        value={singleRoom.lastMsgAt ? dayjs(singleRoom.lastMsgAt).fromNow() : "-"}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ fontSize: 14 }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        {/* Participant 1 */}
                        <Card title={`${tc("table.participant1")}`} style={{ marginBottom: 16 }}>
                            {singleRoom.peerUser1 ? (
                                <Space size={16}>
                                    <Avatar
                                        size={64}
                                        src={getMediaUrl(singleRoom.peerUser1.userImage)}
                                        icon={<UserOutlined />}
                                    />
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {singleRoom.peerUser1.fullName || tc("labels.unknownUser")}
                                        </Title>
                                        {singleRoom.peerUser1.fullPhone && (
                                            <Text type="secondary">{singleRoom.peerUser1.fullPhone}</Text>
                                        )}
                                        <br />
                                        <Button
                                            type="link"
                                            style={{ padding: 0, marginTop: 8 }}
                                            onClick={() => goToUser("admin/users", singleRoom.peerUser1!._id)}
                                        >
                                            {tc("actions.viewProfile")}
                                        </Button>
                                    </div>
                                </Space>
                            ) : (
                                <Text type="secondary">{tc("labels.userDataNotAvailable")}</Text>
                            )}
                        </Card>
                        {/* Participant 2 */}
                        <Card title={`${tc("table.participant2")}`} style={{ marginBottom: 16 }}>
                            {singleRoom.peerUser2 ? (
                                <Space size={16}>
                                    <Avatar
                                        size={64}
                                        src={getMediaUrl(singleRoom.peerUser2.userImage)}
                                        icon={<UserOutlined />}
                                    />
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {singleRoom.peerUser2.fullName || tc("labels.unknownUser")}
                                        </Title>
                                        {singleRoom.peerUser2.fullPhone && (
                                            <Text type="secondary">{singleRoom.peerUser2.fullPhone}</Text>
                                        )}
                                        <br />
                                        <Button
                                            type="link"
                                            style={{ padding: 0, marginTop: 8 }}
                                            onClick={() => goToUser("admin/users", singleRoom.peerUser2!._id)}
                                        >
                                            {tc("actions.viewProfile")}
                                        </Button>
                                    </div>
                                </Space>
                            ) : (
                                <Text type="secondary">{tc("labels.userDataNotAvailable")}</Text>
                            )}
                        </Card>
                        {/* Chat Information */}
                        <Card title={tc("labels.chatInformation")}>
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                <Descriptions.Item label={tc("labels.chatId")}>
                                    <Text copyable={{ text: singleRoom._id }}>{singleRoom._id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.type")}>
                                    <Tag color="blue" icon={<MessageOutlined />}>{tc("labels.directChat")}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("table.messages")}>
                                    <Badge count={singleRoom.msgCount || 0} showZero color="#1890ff" />
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("table.lastMessage")}>
                                    {singleRoom.lastMsgAt ? (
                                        <Tooltip title={dayjs(singleRoom.lastMsgAt).format("YYYY-MM-DD HH:mm:ss")}>
                                            {dayjs(singleRoom.lastMsgAt).fromNow()}
                                        </Tooltip>
                                    ) : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdAt")}>
                                    <Space>
                                        <CalendarOutlined />
                                        {dayjs(singleRoom.createdAt).format("MMM DD, YYYY HH:mm")}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("table.status")}>
                                    {isDeleted ? (
                                        <Tag color="red">{tc("status.deleted")}</Tag>
                                    ) : (
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    };
    const getTitle = () => {
        switch (type) {
            case "groups": return tc("labels.groupDetails");
            case "broadcasts": return tc("labels.broadcastDetails");
            case "singles": return tc("labels.chatDetails");
            default: return tc("labels.roomDetails");
        }
    };
    return (
        <Show
            title={getTitle()}
            headerButtons={
                <Space>
                    <Popconfirm
                        title={isDeleted ? tc("confirmations.restoreRoom") : tc("confirmations.deleteRoom")}
                        description={isDeleted ? tc("confirmations.restoreRoomConfirm") : tc("confirmations.softDeleteRoom")}
                        onConfirm={handleDelete}
                        okText={isDeleted ? tc("actions.restore") : tc("actions.delete")}
                        cancelText={tc("actions.cancel")}
                        okButtonProps={{ danger: !isDeleted, loading: actionLoading }}
                    >
                        <Button
                            danger={!isDeleted}
                            icon={isDeleted ? <RollbackOutlined /> : <DeleteOutlined />}
                            loading={actionLoading}
                        >
                            {isDeleted ? tc("actions.restore") : tc("actions.delete")}
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            {isDeleted && (
                <Card style={{ marginBottom: 16, background: "#fff7e6", borderColor: "#ffd591" }}>
                    <Space>
                        <DeleteOutlined style={{ color: "#fa8c16" }} />
                        <Text strong style={{ color: "#d46b08" }}>
                            {tc("labels.thisRoomDeletedOn", { date: dayjs(room.deletedAt).format("MMM DD, YYYY HH:mm") })}
                        </Text>
                    </Space>
                </Card>
            )}
            {type === "groups" && renderGroupRoom()}
            {type === "broadcasts" && renderBroadcastRoom()}
            {type === "singles" && renderSingleRoom()}
        </Show>
    );
};