import { useState, useEffect } from "react";
import { List, DateField } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import {
    Table,
    Tag,
    Avatar,
    Space,
    Typography,
    Badge,
    Button,
    Tabs,
    Card,
    Popconfirm,
    Tooltip,
    Input,
    Row,
    Col,
} from "antd";
import {
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    DeleteOutlined,
    UndoOutlined,
    SearchOutlined,
    ReloadOutlined,
    SoundOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";

const { Text } = Typography;

type RoomType = "groups" | "broadcasts" | "singles";

interface IGroupRoom {
    _id: string;
    gTitle?: string;
    gDescription?: string;
    gImg?: string;
    gType?: "public" | "private";
    gMembersCount?: number;
    creatorId?: {
        _id: string;
        fullName: string;
        userImage?: string;
    };
    createdAt: string;
    deletedAt?: string;
}

interface IBroadcastRoom {
    _id: string;
    bTitle?: string;
    bImg?: string;
    bMembersCount?: number;
    creatorId?: {
        _id: string;
        fullName: string;
        userImage?: string;
    };
    createdAt: string;
    deletedAt?: string;
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
    deletedAt?: string;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const RoomList = () => {
    const { t } = useTranslation("rooms");
    const { t: tc } = useTranslation("common");
    const { t: tn } = useTranslation("navigation");
    const [activeTab, setActiveTab] = useState<RoomType>("groups");
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState<IGroupRoom[]>([]);
    const [broadcasts, setBroadcasts] = useState<IBroadcastRoom[]>([]);
    const [singles, setSingles] = useState<ISingleRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const navigate = useNavigate();
    const { open: notify } = useNotification();
    const goToRoomDetail = (type: RoomType, id: string) => {
        const typeCode = type === "groups" ? "g" : type === "broadcasts" ? "b" : "s";
        navigate(`/rooms/show/${id}?type=${typeCode}`);
    };
    const fetchData = async (type: RoomType, page: number = 1, searchQuery: string = "") => {
        setLoading(true);
        try {
            const endpoint = `${API_URL}/admin/rooms/${type}`;
            const response = await axiosInstance.get(endpoint, {
                params: {
                    page,
                    limit: pagination.limit,
                    ...(searchQuery && { search: searchQuery }),
                },
            });
            const data = response.data?.data || response.data;
            const docs = data?.docs || [];
            switch (type) {
                case "groups":
                    setGroups(docs);
                    break;
                case "broadcasts":
                    setBroadcasts(docs);
                    break;
                case "singles":
                    setSingles(docs);
                    break;
            }
            setPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData(activeTab, 1, search);
    }, [activeTab]);
    const handleSearch = () => {
        fetchData(activeTab, 1, search);
    };
    const handlePageChange = (page: number, pageSize: number) => {
        setPagination((prev) => ({ ...prev, page, limit: pageSize }));
        fetchData(activeTab, page, search);
    };
    const handleDeleteToggle = async (type: RoomType, id: string, isDeleted: boolean) => {
        try {
            const idFieldMap: Record<RoomType, string> = {
                groups: "groupIds",
                broadcasts: "broadcastIds",
                singles: "singleIds",
            };
            const idField = idFieldMap[type];
            await axiosInstance.patch(`${API_URL}/admin/rooms/${type}`, {
                [idField]: [id],
                updates: { deleted: !isDeleted },
            });
            notify?.({ type: "success", message: isDeleted ? tc("messages.roomRestored") : tc("messages.roomDeleted") });
            fetchData(activeTab, pagination.page, search);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdate") });
        }
    };
    const groupColumns = [
        {
            title: tc("table.group"),
            key: "group",
            render: (_: unknown, record: IGroupRoom) => (
                <Space>
                    <Avatar size={40} src={getMediaUrl(record.gImg)} icon={<TeamOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.gTitle || tc("labels.untitled")}</div>
                        <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                            {record.gDescription || "-"}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: tc("table.members"),
            dataIndex: "gMembersCount",
            key: "members",
            width: 100,
            render: (value: number) => (
                <Badge count={value || 0} showZero color="#1890ff" overflowCount={9999} />
            ),
        },
        {
            title: tc("table.type"),
            dataIndex: "gType",
            key: "type",
            width: 100,
            render: (value: string) => (
                <Tag color={value === "public" ? "green" : "orange"}>{value === "public" ? tc("labels.public") : tc("labels.private")}</Tag>
            ),
        },
        {
            title: tc("table.creator"),
            key: "creator",
            render: (_: unknown, record: IGroupRoom) =>
                record.creatorId ? (
                    <Space>
                        <Avatar size="small" src={getMediaUrl(record.creatorId.userImage)} icon={<UserOutlined />} />
                        <Text ellipsis style={{ maxWidth: 100 }}>{record.creatorId.fullName || "-"}</Text>
                    </Space>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
        {
            title: tc("table.status"),
            key: "status",
            width: 80,
            render: (_: unknown, record: IGroupRoom) =>
                record.deletedAt ? (
                    <Tag color="red">{tc("status.deleted")}</Tag>
                ) : (
                    <Tag color="green">{tc("status.active")}</Tag>
                ),
        },
        {
            title: tc("table.created"),
            dataIndex: "createdAt",
            key: "created",
            width: 120,
            render: (value: string) => <DateField value={value} format="MMM DD, YYYY" />,
        },
        {
            title: tc("table.actions"),
            key: "actions",
            width: 100,
            render: (_: unknown, record: IGroupRoom) => (
                <Space size={4}>
                    <Tooltip title={tc("actions.viewDetails")}>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => goToRoomDetail("groups", record._id)}
                        />
                    </Tooltip>
                    <Tooltip title={record.deletedAt ? tc("actions.restore") : tc("actions.delete")}>
                        <Popconfirm
                            title={record.deletedAt ? tc("confirmations.restoreGroup") : tc("confirmations.deleteGroup")}
                            onConfirm={() => handleDeleteToggle("groups", record._id, !!record.deletedAt)}
                        >
                            <Button
                                size="small"
                                danger={!record.deletedAt}
                                type={record.deletedAt ? "primary" : "default"}
                                icon={record.deletedAt ? <UndoOutlined /> : <DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const broadcastColumns = [
        {
            title: tc("table.broadcast"),
            key: "broadcast",
            render: (_: unknown, record: IBroadcastRoom) => (
                <Space>
                    <Avatar size={40} src={getMediaUrl(record.bImg)} icon={<SoundOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.bTitle || tc("labels.untitled")}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: tc("table.recipients"),
            dataIndex: "bMembersCount",
            key: "members",
            width: 100,
            render: (value: number) => (
                <Badge count={value || 0} showZero color="#722ed1" overflowCount={9999} />
            ),
        },
        {
            title: tc("table.creator"),
            key: "creator",
            render: (_: unknown, record: IBroadcastRoom) =>
                record.creatorId ? (
                    <Space>
                        <Avatar size="small" src={getMediaUrl(record.creatorId.userImage)} icon={<UserOutlined />} />
                        <Text ellipsis style={{ maxWidth: 100 }}>{record.creatorId.fullName || "-"}</Text>
                    </Space>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
        {
            title: tc("table.status"),
            key: "status",
            width: 80,
            render: (_: unknown, record: IBroadcastRoom) =>
                record.deletedAt ? (
                    <Tag color="red">{tc("status.deleted")}</Tag>
                ) : (
                    <Tag color="green">{tc("status.active")}</Tag>
                ),
        },
        {
            title: tc("table.created"),
            dataIndex: "createdAt",
            key: "created",
            width: 120,
            render: (value: string) => <DateField value={value} format="MMM DD, YYYY" />,
        },
        {
            title: tc("table.actions"),
            key: "actions",
            width: 100,
            render: (_: unknown, record: IBroadcastRoom) => (
                <Space size={4}>
                    <Tooltip title={tc("actions.viewDetails")}>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => goToRoomDetail("broadcasts", record._id)}
                        />
                    </Tooltip>
                    <Tooltip title={record.deletedAt ? tc("actions.restore") : tc("actions.delete")}>
                        <Popconfirm
                            title={record.deletedAt ? tc("confirmations.restoreBroadcast") : tc("confirmations.deleteBroadcast")}
                            onConfirm={() => handleDeleteToggle("broadcasts", record._id, !!record.deletedAt)}
                        >
                            <Button
                                size="small"
                                danger={!record.deletedAt}
                                type={record.deletedAt ? "primary" : "default"}
                                icon={record.deletedAt ? <UndoOutlined /> : <DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const singleColumns = [
        {
            title: tc("table.participant1"),
            key: "peer1",
            render: (_: unknown, record: ISingleRoom) =>
                record.peerUser1 ? (
                    <Space>
                        <Avatar size={40} src={getMediaUrl(record.peerUser1.userImage)} icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 500 }}>{record.peerUser1.fullName || tc("labels.unknown")}</div>
                            <Text type="secondary" style={{ fontSize: 11 }}>{record.peerUser1.fullPhone || "-"}</Text>
                        </div>
                    </Space>
                ) : (
                    <Text type="secondary">{tc("labels.unknown")}</Text>
                ),
        },
        {
            title: tc("table.participant2"),
            key: "peer2",
            render: (_: unknown, record: ISingleRoom) =>
                record.peerUser2 ? (
                    <Space>
                        <Avatar size={40} src={getMediaUrl(record.peerUser2.userImage)} icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 500 }}>{record.peerUser2.fullName || tc("labels.unknown")}</div>
                            <Text type="secondary" style={{ fontSize: 11 }}>{record.peerUser2.fullPhone || "-"}</Text>
                        </div>
                    </Space>
                ) : (
                    <Text type="secondary">{tc("labels.unknown")}</Text>
                ),
        },
        {
            title: tc("table.messages"),
            dataIndex: "msgCount",
            key: "msgCount",
            width: 100,
            render: (value: number) => (
                <Space>
                    <MessageOutlined />
                    <Text>{value || 0}</Text>
                </Space>
            ),
        },
        {
            title: tc("table.lastMessage"),
            dataIndex: "lastMsgAt",
            key: "lastMsg",
            width: 130,
            render: (value: string) =>
                value ? <DateField value={value} format="MMM DD, HH:mm" /> : <Text type="secondary">-</Text>,
        },
        {
            title: tc("table.status"),
            key: "status",
            width: 80,
            render: (_: unknown, record: ISingleRoom) =>
                record.deletedAt ? (
                    <Tag color="red">{tc("status.deleted")}</Tag>
                ) : (
                    <Tag color="green">{tc("status.active")}</Tag>
                ),
        },
        {
            title: tc("table.created"),
            dataIndex: "createdAt",
            key: "created",
            width: 120,
            render: (value: string) => <DateField value={value} format="MMM DD, YYYY" />,
        },
        {
            title: tc("table.actions"),
            key: "actions",
            width: 100,
            render: (_: unknown, record: ISingleRoom) => (
                <Space size={4}>
                    <Tooltip title={tc("actions.viewDetails")}>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => goToRoomDetail("singles", record._id)}
                        />
                    </Tooltip>
                    <Tooltip title={record.deletedAt ? tc("actions.restore") : tc("actions.delete")}>
                        <Popconfirm
                            title={record.deletedAt ? tc("confirmations.restoreChat") : tc("confirmations.deleteChat")}
                            onConfirm={() => handleDeleteToggle("singles", record._id, !!record.deletedAt)}
                        >
                            <Button
                                size="small"
                                danger={!record.deletedAt}
                                type={record.deletedAt ? "primary" : "default"}
                                icon={record.deletedAt ? <UndoOutlined /> : <DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const getDataSource = () => {
        switch (activeTab) {
            case "groups":
                return groups;
            case "broadcasts":
                return broadcasts;
            case "singles":
                return singles;
            default:
                return [];
        }
    };
    const getColumns = () => {
        switch (activeTab) {
            case "groups":
                return groupColumns;
            case "broadcasts":
                return broadcastColumns;
            case "singles":
                return singleColumns;
            default:
                return groupColumns;
        }
    };
    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case "groups":
                return tc("placeholders.searchGroups");
            case "broadcasts":
                return tc("placeholders.searchBroadcasts");
            case "singles":
                return tc("placeholders.searchSingles");
            default:
                return tc("actions.search");
        }
    };
    const tabItems = [
        {
            key: "groups",
            label: (
                <span>
                    <TeamOutlined />
                    {t("types.group")}
                </span>
            ),
        },
        {
            key: "broadcasts",
            label: (
                <span>
                    <SoundOutlined />
                    {t("types.broadcast")}
                </span>
            ),
        },
        {
            key: "singles",
            label: (
                <span>
                    <MessageOutlined />
                    {t("types.single")}
                </span>
            ),
        },
    ];
    return (
        <List title={tn("rooms")} headerButtons={<></>}>
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder={getSearchPlaceholder()}
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                            style={{ maxWidth: 400 }}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                {tc("actions.search")}
                            </Button>
                            <Tooltip title={tc("actions.refresh")}>
                                <Button icon={<ReloadOutlined />} onClick={() => fetchData(activeTab, pagination.page, search)} />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key as RoomType);
                        setSearch("");
                        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
                    }}
                    items={tabItems}
                    style={{ padding: "0 24px" }}
                />
                <Table
                    dataSource={getDataSource()}
                    columns={getColumns()}
                    rowKey="_id"
                    loading={loading}
                    onRow={(record) => ({
                        onClick: (e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('.ant-checkbox-wrapper') || target.closest('.ant-popover') || target.closest('.ant-btn')) {
                                return;
                            }
                            goToRoomDetail(activeTab, record._id);
                        },
                        style: { cursor: 'pointer' },
                    })}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => tc("table.showing", { from: range[0], to: range[1], total }),
                        onChange: handlePageChange,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </List>
    );
};
