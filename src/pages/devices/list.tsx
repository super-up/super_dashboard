import { useState, useEffect } from "react";
import { List, DateField } from "@refinedev/antd";
import { useNavigation, useNotification } from "@refinedev/core";
import {
    Table,
    Tag,
    Avatar,
    Space,
    Typography,
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
    MobileOutlined,
    AppleOutlined,
    AndroidOutlined,
    DesktopOutlined,
    GlobalOutlined,
    UserOutlined,
    EyeOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";

const { Text } = Typography;

type PlatformType = "all" | "android" | "ios" | "web" | "desktop";

interface IDevice {
    _id: string;
    userId?: {
        _id: string;
        fullName: string;
        userImage?: string;
        fullPhone?: string;
    };
    uId?: string;
    platform?: string;
    clintVersion?: string;
    pushKey?: string;
    lastSeenAt?: string;
    createdAt: string;
    visits?: number;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    android: { label: "Android", color: "green", icon: <AndroidOutlined /> },
    ios: { label: "iOS", color: "blue", icon: <AppleOutlined /> },
    web: { label: "Web", color: "purple", icon: <GlobalOutlined /> },
    macos: { label: "macOS", color: "geekblue", icon: <DesktopOutlined /> },
    windows: { label: "Windows", color: "cyan", icon: <DesktopOutlined /> },
    desktop: { label: "Desktop", color: "orange", icon: <DesktopOutlined /> },
};

export const DeviceList = () => {
    const { t } = useTranslation("devices");
    const { t: tc } = useTranslation("common");
    const [activeTab, setActiveTab] = useState<PlatformType>("all");
    const [search, setSearch] = useState("");
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const { show: goToDetail } = useNavigation();
    const { open: notify } = useNotification();
    const fetchData = async (platform: PlatformType, page: number = 1, searchQuery: string = "") => {
        setLoading(true);
        try {
            const endpoint = `${API_URL}/admin/devices`;
            const response = await axiosInstance.get(endpoint, {
                params: {
                    page,
                    limit: pagination.limit,
                    ...(platform !== "all" && { platform }),
                    ...(searchQuery && { search: searchQuery }),
                },
            });
            const data = response.data?.data || response.data;
            const docs = data?.docs || data || [];
            setDevices(Array.isArray(docs) ? docs : []);
            setPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || docs?.length || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error: unknown) {
            console.error("Failed to fetch devices:", error);
            const err = error as { response?: { data?: { message?: string }; status?: number } };
            notify?.({ type: "error", message: err.response?.data?.message || `Failed to fetch devices (${err.response?.status || 'unknown'})` });
            setDevices([]);
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
    const handleDeleteDevice = async (id: string) => {
        try {
            await axiosInstance.delete(`${API_URL}/admin/devices/${id}`);
            notify?.({ type: "success", message: t("messages.deviceDeleted") });
            fetchData(activeTab, pagination.page, search);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.failedToDelete") });
        }
    };
    const getPlatformConfig = (platform?: string) => {
        if (!platform) return { label: "Unknown", color: "default", icon: <MobileOutlined /> };
        const key = platform.toLowerCase();
        return PLATFORM_CONFIG[key] || { label: platform, color: "default", icon: <MobileOutlined /> };
    };
    const isDeviceActive = (lastSeenAt?: string) => {
        if (!lastSeenAt) return false;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
    };
    const columns = [
        {
            title: t("columns.user"),
            key: "user",
            render: (_: unknown, record: IDevice) =>
                record.userId ? (
                    <Space>
                        <Avatar size={40} src={getMediaUrl(record.userId.userImage)} icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 500 }}>{record.userId.fullName || tc("labels.unknown")}</div>
                            <Text type="secondary" style={{ fontSize: 11 }}>{record.userId.fullPhone || "-"}</Text>
                        </div>
                    </Space>
                ) : (
                    <Text type="secondary">{tc("labels.unknownUser")}</Text>
                ),
        },
        {
            title: t("columns.platform"),
            key: "platform",
            width: 120,
            render: (_: unknown, record: IDevice) => {
                const config = getPlatformConfig(record.platform);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: t("columns.appVersion"),
            dataIndex: "clintVersion",
            key: "clintVersion",
            width: 100,
            render: (value: string) => <Text>{value || "-"}</Text>,
        },
        {
            title: t("columns.pushToken"),
            key: "pushKey",
            width: 100,
            render: (_: unknown, record: IDevice) => (
                <Tooltip title={record.pushKey ? tc("status.enabled") : tc("status.disabled")}>
                    {record.pushKey ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>{tc("status.enabled")}</Tag>
                    ) : (
                        <Tag color="default" icon={<CloseCircleOutlined />}>{tc("status.disabled")}</Tag>
                    )}
                </Tooltip>
            ),
        },
        {
            title: t("columns.status"),
            key: "status",
            width: 100,
            render: (_: unknown, record: IDevice) => {
                const active = isDeviceActive(record.lastSeenAt);
                return active ? (
                    <Tag color="green">{tc("status.online")}</Tag>
                ) : (
                    <Tag color="default">{tc("status.offline")}</Tag>
                );
            },
        },
        {
            title: t("columns.lastActive"),
            dataIndex: "lastSeenAt",
            key: "lastSeenAt",
            width: 140,
            render: (value: string) =>
                value ? <DateField value={value} format="MMM DD, HH:mm" /> : <Text type="secondary">{t("labels.never")}</Text>,
        },
        {
            title: t("columns.created"),
            dataIndex: "createdAt",
            key: "created",
            width: 120,
            render: (value: string) => <DateField value={value} format="MMM DD, YYYY" />,
        },
        {
            title: tc("table.actions"),
            key: "actions",
            width: 100,
            render: (_: unknown, record: IDevice) => (
                <Space size={4}>
                    <Tooltip title={t("actions.viewDetails")}>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => goToDetail("admin/devices", record._id)}
                        />
                    </Tooltip>
                    <Tooltip title={t("actions.deleteDevice")}>
                        <Popconfirm
                            title={t("confirmations.deleteDevice")}
                            onConfirm={() => handleDeleteDevice(record._id)}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const tabItems = [
        {
            key: "all",
            label: (
                <span>
                    <MobileOutlined />
                    {t("tabs.all")}
                </span>
            ),
        },
        {
            key: "android",
            label: (
                <span>
                    <AndroidOutlined />
                    {t("tabs.android")}
                </span>
            ),
        },
        {
            key: "ios",
            label: (
                <span>
                    <AppleOutlined />
                    {t("tabs.ios")}
                </span>
            ),
        },
        {
            key: "web",
            label: (
                <span>
                    <GlobalOutlined />
                    {t("tabs.web")}
                </span>
            ),
        },
        {
            key: "desktop",
            label: (
                <span>
                    <DesktopOutlined />
                    {t("tabs.desktop")}
                </span>
            ),
        },
    ];
    return (
        <List title={t("title")} headerButtons={<></>}>
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder={t("placeholders.searchByUserOrPhone")}
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
                        setActiveTab(key as PlatformType);
                        setSearch("");
                        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
                    }}
                    items={tabItems}
                    style={{ padding: "0 24px" }}
                />
                <Table
                    dataSource={devices}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                        onChange: handlePageChange,
                    }}
                    scroll={{ x: 1000 }}
                    onRow={(record) => ({
                        onClick: (e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('.ant-checkbox-wrapper') || target.closest('.ant-popover') || target.closest('.ant-btn')) {
                                return;
                            }
                            goToDetail("admin/devices", record._id);
                        },
                        style: { cursor: 'pointer' },
                    })}
                />
            </Card>
        </List>
    );
};
