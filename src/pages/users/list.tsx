import { useState } from "react";
import { List, useTable, DateField, ShowButton, getDefaultSortOrder } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import {
    Table,
    Avatar,
    Tag,
    Input,
    Space,
    Button,
    Tooltip,
    Badge,
    Select,
    Popconfirm,
    Image,
    Modal,
    Card,
    Row,
    Col,
    DatePicker,
    Statistic,
    Divider,
    theme,
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    ClearOutlined,
    DownloadOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { IUser, RegisterStatus, isUserBanned, isUserDeleted, isUserVerified, isUserOnline } from "../../types/user.types";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { EditUserModal } from "./components/EditUserModal";

const { RangePicker } = DatePicker;

interface FilterState {
    search: string;
    status: RegisterStatus | undefined;
    isBanned: boolean | undefined;
    isVerified: boolean | undefined;
    isDeleted: boolean | undefined;
    fromDate: string | undefined;
    toDate: string | undefined;
}

const initialFilters: FilterState = {
    search: "",
    status: undefined,
    isBanned: undefined,
    isVerified: undefined,
    isDeleted: undefined,
    fromDate: undefined,
    toDate: undefined,
};

export const UserList = () => {
    const { t } = useTranslation("users");
    const { t: tc } = useTranslation("common");
    const { token } = theme.useToken();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
    const [showFilters, setShowFilters] = useState(true);
    const { tableProps, sorters, tableQuery, setFilters: setTableFilters } = useTable<IUser>({
        resource: "admin/users",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    const { open: notify } = useNotification();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [editUser, setEditUser] = useState<IUser | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setTableFilters(
            Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== "")
                .map(([field, value]) => ({
                    field,
                    operator: "eq" as const,
                    value,
                })),
            "replace"
        );
    };
    const handleClearFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setTableFilters([], "replace");
    };
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleApplyFilters();
        }
    };
    const activeFilterCount = Object.entries(appliedFilters).filter(
        ([_, value]) => value !== undefined && value !== ""
    ).length;
    const handleBulkAction = async (action: "ban" | "unban" | "verify" | "unverify" | "delete" | "restore") => {
        if (selectedRowKeys.length === 0) return;
        setBulkLoading(true);
        try {
            let updates: Record<string, unknown> = {};
            switch (action) {
                case "ban":
                    updates = { banTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() };
                    break;
                case "unban":
                    updates = { banTo: null };
                    break;
                case "verify":
                    updates = { hasBadge: true };
                    break;
                case "unverify":
                    updates = { hasBadge: false };
                    break;
                case "delete":
                    updates = { deletedAt: new Date().toISOString() };
                    break;
                case "restore":
                    updates = { deletedAt: null };
                    break;
            }
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: selectedRowKeys,
                updates,
            });
            notify?.({ type: "success", message: tc("messages.usersUpdated", { count: selectedRowKeys.length }) });
            setSelectedRowKeys([]);
            tableQuery?.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdateUsers") });
        } finally {
            setBulkLoading(false);
        }
    };
    const handleQuickBan = async (user: IUser) => {
        const banned = isUserBanned(user);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { banTo: banned ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
            });
            notify?.({ type: "success", message: banned ? tc("messages.userUnbanned") : tc("messages.userBanned") });
            tableQuery?.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdate") });
        }
    };
    const handleQuickVerify = async (user: IUser) => {
        const verified = isUserVerified(user);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { hasBadge: !verified },
            });
            notify?.({ type: "success", message: verified ? tc("messages.badgeRemoved") : tc("messages.userVerified") });
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
    const getRowClassName = (record: IUser) => {
        if (isUserDeleted(record)) return "row-deleted";
        if (isUserBanned(record)) return "row-banned";
        return "";
    };
    const totalUsers = tableProps.pagination && typeof tableProps.pagination === "object"
        ? tableProps.pagination.total || 0
        : 0;
    return (
        <>
            <style>{`
                .row-banned { background-color: ${token.colorErrorBg} !important; }
                .row-banned:hover td { background-color: ${token.colorErrorBgHover} !important; }
                .row-deleted { background-color: ${token.colorFillSecondary} !important; opacity: 0.7; }
                .row-deleted:hover td { background-color: ${token.colorFillTertiary} !important; }
                .filter-card { margin-bottom: 16px; }
                .filter-card .ant-card-body { padding: 16px; }
            `}</style>
            {/* Search & Filter Section */}
            <Card className="filter-card" size="small">
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder={tc("placeholders.searchByNameEmailPhone")}
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyPress={handleSearchKeyPress}
                            allowClear
                            style={{ maxWidth: 400 }}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleApplyFilters}
                            >
                                {tc("actions.search")}
                            </Button>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "default" : "dashed"}
                            >
                                {tc("actions.filters")} {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Button>
                            <Tooltip title={tc("actions.refresh")}>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => tableQuery?.refetch()}
                                />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
                {showFilters && (
                    <>
                        <Divider style={{ margin: "12px 0" }} />
                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    placeholder={tc("filters.registrationStatus")}
                                    value={filters.status}
                                    onChange={(value) => setFilters({ ...filters, status: value })}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value="accepted">
                                        <Tag color="green">{tc("labels.accepted")}</Tag>
                                    </Select.Option>
                                    <Select.Option value="pending">
                                        <Tag color="orange">{tc("status.pending")}</Tag>
                                    </Select.Option>
                                    <Select.Option value="rejected">
                                        <Tag color="red">{tc("status.rejected")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    placeholder={tc("filters.banStatus")}
                                    value={filters.isBanned}
                                    onChange={(value) => setFilters({ ...filters, isBanned: value })}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value={true}>
                                        <Tag color="red" icon={<StopOutlined />}>{tc("status.banned")}</Tag>
                                    </Select.Option>
                                    <Select.Option value={false}>
                                        <Tag color="green">{tc("status.notBanned")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    placeholder={tc("filters.verification")}
                                    value={filters.isVerified}
                                    onChange={(value) => setFilters({ ...filters, isVerified: value })}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value={true}>
                                        <Tag color="blue" icon={<SafetyCertificateOutlined />}>{tc("status.verified")}</Tag>
                                    </Select.Option>
                                    <Select.Option value={false}>
                                        <Tag>{tc("status.notVerified")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    placeholder={tc("filters.accountStatus")}
                                    value={filters.isDeleted}
                                    onChange={(value) => setFilters({ ...filters, isDeleted: value })}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value={false}>
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    </Select.Option>
                                    <Select.Option value={true}>
                                        <Tag color="default" icon={<DeleteOutlined />}>{tc("status.deleted")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={8}>
                                <RangePicker
                                    placeholder={[tc("placeholders.registeredFrom"), tc("placeholders.registeredTo")]}
                                    style={{ width: "100%" }}
                                    value={[
                                        filters.fromDate ? dayjs(filters.fromDate) : null,
                                        filters.toDate ? dayjs(filters.toDate) : null,
                                    ]}
                                    onChange={(dates) => {
                                        setFilters({
                                            ...filters,
                                            fromDate: dates?.[0]?.startOf("day").toISOString(),
                                            toDate: dates?.[1]?.endOf("day").toISOString(),
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
                            <Col>
                                <Space>
                                    <Statistic
                                        title={tc("table.totalResults")}
                                        value={totalUsers}
                                        valueStyle={{ fontSize: 16 }}
                                    />
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleApplyFilters}
                                    >
                                        {tc("actions.applyFilters")}
                                    </Button>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            icon={<ClearOutlined />}
                                            onClick={handleClearFilters}
                                        >
                                            {tc("actions.clearAll")}
                                        </Button>
                                    )}
                                </Space>
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
                            {tc("table.usersSelected", { count: selectedRowKeys.length })}
                        </Tag>
                        <Divider type="vertical" />
                        <Popconfirm
                            title={tc("confirmations.banUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("ban")}
                        >
                            <Button danger size="small" loading={bulkLoading} icon={<StopOutlined />}>
                                {tc("actions.banSelected")}
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title={tc("confirmations.unbanUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("unban")}
                        >
                            <Button size="small" loading={bulkLoading} icon={<CheckCircleOutlined />}>
                                {tc("actions.unbanSelected")}
                            </Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Popconfirm
                            title={tc("confirmations.verifyUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("verify")}
                        >
                            <Button type="primary" size="small" loading={bulkLoading} icon={<SafetyCertificateOutlined />}>
                                {tc("actions.verifySelected")}
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title={tc("confirmations.unverifyUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("unverify")}
                        >
                            <Button size="small" loading={bulkLoading} icon={<CloseCircleOutlined />}>
                                {tc("actions.unverifySelected")}
                            </Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Popconfirm
                            title={tc("confirmations.deleteUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("delete")}
                        >
                            <Button danger size="small" loading={bulkLoading} icon={<DeleteOutlined />}>
                                {tc("actions.deleteSelected")}
                            </Button>
                        </Popconfirm>
                        <Popconfirm
                            title={tc("confirmations.restoreUsers", { count: selectedRowKeys.length })}
                            onConfirm={() => handleBulkAction("restore")}
                        >
                            <Button size="small" loading={bulkLoading} icon={<CheckCircleOutlined />}>
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
            {/* Users Table */}
            <List
                title=""
                headerButtons={<></>}
            >
                <Table
                    {...tableProps}
                    rowKey="_id"
                    rowSelection={rowSelection}
                    rowClassName={getRowClassName}
                    scroll={{ x: 1200 }}
                    size="middle"
                >
                    <Table.Column
                        title={tc("table.user")}
                        dataIndex="userImage"
                        width={300}
                        render={(value, record: IUser) => {
                            const online = isUserOnline(record);
                            const verified = isUserVerified(record);
                            const imageUrl = getMediaUrl(value);
                            return (
                                <Space>
                                    <Badge
                                        dot
                                        status={online ? "success" : "default"}
                                        offset={[-4, 36]}
                                    >
                                        <Avatar
                                            size={44}
                                            src={imageUrl}
                                            icon={<UserOutlined />}
                                            style={{ cursor: imageUrl ? "pointer" : "default", border: `2px solid ${token.colorBorderSecondary}` }}
                                            onClick={() => imageUrl && setPreviewImage(imageUrl)}
                                        />
                                    </Badge>
                                    <div>
                                        <Space size={4}>
                                            <span style={{ fontWeight: 500 }}>{record.fullName}</span>
                                            {verified && (
                                                <Tooltip title={tc("status.verified")}>
                                                    <SafetyCertificateOutlined style={{ color: token.colorPrimary }} />
                                                </Tooltip>
                                            )}
                                        </Space>
                                        <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>{record.fullPhone}</div>
                                        <div style={{ fontSize: 11 }}>
                                            <Tooltip title={tc("labels.clickToCopyId")}>
                                                <span
                                                    style={{ color: token.colorTextTertiary, cursor: "pointer" }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(record._id);
                                                        notify?.({ type: "success", message: tc("messages.userIdCopied") });
                                                    }}
                                                >
                                                    <CopyOutlined style={{ marginRight: 4 }} />
                                                    {record._id}
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Space>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.status")}
                        dataIndex="registerStatus"
                        width={100}
                        render={(value) => (
                            <Tag color={value === "accepted" ? "green" : value === "pending" ? "orange" : "red"}>
                                {value === "accepted" ? tc("labels.accepted") : value === "pending" ? tc("status.pending") : tc("status.rejected")}
                            </Tag>
                        )}
                    />
                    <Table.Column
                        title={tc("table.account")}
                        dataIndex="banTo"
                        width={140}
                        render={(_, record: IUser) => {
                            const banned = isUserBanned(record);
                            const deleted = isUserDeleted(record);
                            const verified = isUserVerified(record);
                            return (
                                <Space direction="vertical" size={2}>
                                    {deleted && <Tag color="default" icon={<DeleteOutlined />}>{tc("status.deleted")}</Tag>}
                                    {banned ? (
                                        <Tag color="red" icon={<StopOutlined />}>{tc("status.banned")}</Tag>
                                    ) : (
                                        <Tag color="green">{tc("status.active")}</Tag>
                                    )}
                                    {verified && (
                                        <Tag color="blue" icon={<SafetyCertificateOutlined />}>{tc("status.verified")}</Tag>
                                    )}
                                </Space>
                            );
                        }}
                    />
                    <Table.Column
                        title={tc("table.lastSeen")}
                        dataIndex="lastSeenAt"
                        width={140}
                        render={(value) => (value ? <DateField value={value} format="MMM DD, HH:mm" /> : "-")}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("lastSeenAt", sorters)}
                    />
                    <Table.Column
                        title={tc("table.registered")}
                        dataIndex="createdAt"
                        width={120}
                        render={(value) => <DateField value={value} format="MMM DD, YYYY" />}
                        sorter
                        defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
                    />
                    <Table.Column
                        title={tc("table.actions")}
                        fixed="right"
                        width={180}
                        render={(_, record: IUser) => {
                            const banned = isUserBanned(record);
                            const verified = isUserVerified(record);
                            return (
                                <Space size={4}>
                                    <ShowButton hideText size="small" recordItemId={record._id} />
                                    <Tooltip title={tc("actions.edit")}>
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => {
                                                setEditUser(record);
                                                setEditModalOpen(true);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title={banned ? tc("actions.unban") : tc("actions.ban")}>
                                        <Popconfirm
                                            title={banned ? tc("confirmations.unbanUser") : tc("confirmations.banUser")}
                                            onConfirm={() => handleQuickBan(record)}
                                        >
                                            <Button
                                                size="small"
                                                danger={!banned}
                                                type={banned ? "primary" : "default"}
                                                icon={<StopOutlined />}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                    <Tooltip title={verified ? tc("labels.removeBadge") : tc("actions.verify")}>
                                        <Popconfirm
                                            title={verified ? tc("confirmations.removeVerificationBadge") : tc("confirmations.addVerificationBadge")}
                                            onConfirm={() => handleQuickVerify(record)}
                                        >
                                            <Button
                                                size="small"
                                                type={verified ? "primary" : "default"}
                                                icon={<SafetyCertificateOutlined />}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                </Space>
                            );
                        }}
                    />
                </Table>
            </List>
            <EditUserModal
                user={editUser}
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditUser(null);
                }}
                onSuccess={() => tableQuery?.refetch()}
            />
            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                centered
                width={400}
            >
                <Image
                    src={previewImage || ""}
                    alt="User avatar"
                    style={{ width: "100%" }}
                    preview={false}
                />
            </Modal>
        </>
    );
};