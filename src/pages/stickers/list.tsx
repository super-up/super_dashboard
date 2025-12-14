import { useState, useEffect } from "react";
import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
    Table,
    Tag,
    Image,
    Space,
    Button,
    Tooltip,
    Input,
    Select,
    Card,
    Row,
    Col,
    DatePicker,
    Statistic,
    Divider,
    Popconfirm,
    theme,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    ClearOutlined,
    DeleteOutlined,
    EditOutlined,
    SmileOutlined,
    PictureOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { IStickerPack, IStickerStats, ICreatePackDto, IUpdatePackDto } from "../../types/sticker.types";
import { API_URL, getMediaUrl } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { PackModal } from "./components/PackModal";

const { RangePicker } = DatePicker;

interface FilterState {
    search: string;
    isAnimated: boolean | undefined;
    fromDate: string | undefined;
    toDate: string | undefined;
}

const initialFilters: FilterState = {
    search: "",
    isAnimated: undefined,
    fromDate: undefined,
    toDate: undefined,
};

export const StickerList = () => {
    const { t } = useTranslation("stickers");
    const { token } = theme.useToken();
    const { open: notify } = useNotification();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
    const [showFilters, setShowFilters] = useState(true);
    const [stats, setStats] = useState<IStickerStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [packModalOpen, setPackModalOpen] = useState(false);
    const [editPack, setEditPack] = useState<IStickerPack | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { tableProps, tableQuery, setFilters: setTableFilters } = useTable<IStickerPack>({
        resource: "admin/config/stickers/packs",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    useEffect(() => {
        fetchStats();
    }, []);
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/config/stickers/stats`);
            setStats(response.data.data || response.data);
        } catch {
            // stats load failed
        } finally {
            setStatsLoading(false);
        }
    };
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
    const handleCreatePack = async (data: ICreatePackDto) => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs`, {
                creates: [data],
            });
            notify?.({ type: "success", message: t("notifications.packCreated") });
            setPackModalOpen(false);
            tableQuery?.refetch();
            fetchStats();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.createFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleUpdatePack = async (data: IUpdatePackDto) => {
        if (!editPack) return;
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs`, {
                packIds: [editPack._id],
                updates: data,
            });
            notify?.({ type: "success", message: t("notifications.packUpdated") });
            setPackModalOpen(false);
            setEditPack(null);
            tableQuery?.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.updateFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeletePack = async (pack: IStickerPack) => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs`, {
                packIds: [pack._id],
                updates: { deleted: true },
            });
            notify?.({ type: "success", message: t("notifications.packDeleted") });
            tableQuery?.refetch();
            fetchStats();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.deleteFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const openEditModal = (pack: IStickerPack) => {
        setEditPack(pack);
        setPackModalOpen(true);
    };
    const closeModal = () => {
        setPackModalOpen(false);
        setEditPack(null);
    };
    return (
        <>
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={t("stats.totalPacks")}
                            value={stats?.totalPacks || 0}
                            loading={statsLoading}
                            prefix={<SmileOutlined style={{ color: token.colorPrimary }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={t("stats.animatedPacks")}
                            value={stats?.animatedPacks || 0}
                            loading={statsLoading}
                            prefix={<PlayCircleOutlined style={{ color: token.colorSuccess }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={t("stats.staticPacks")}
                            value={stats?.staticPacks || 0}
                            loading={statsLoading}
                            prefix={<PictureOutlined style={{ color: token.colorWarning }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title={t("stats.totalStickers")}
                            value={stats?.totalStickers || 0}
                            loading={statsLoading}
                            prefix={<SmileOutlined style={{ color: token.colorInfo }} />}
                        />
                    </Card>
                </Col>
            </Row>
            {/* Filters */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder={t("filters.searchPlaceholder")}
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
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                                {t("filters.search")}
                            </Button>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "default" : "dashed"}
                            >
                                {t("filters.filters")} {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Button>
                            <Tooltip title={t("actions.refresh")}>
                                <Button icon={<ReloadOutlined />} onClick={() => { tableQuery?.refetch(); fetchStats(); }} />
                            </Tooltip>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setPackModalOpen(true)}>
                                {t("actions.createPack")}
                            </Button>
                        </Space>
                    </Col>
                </Row>
                {showFilters && (
                    <>
                        <Divider style={{ margin: "12px 0" }} />
                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    placeholder={t("filters.packType")}
                                    value={filters.isAnimated}
                                    onChange={(value) => setFilters({ ...filters, isAnimated: value })}
                                    allowClear
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option value={true}>
                                        <Tag color="green" icon={<PlayCircleOutlined />}>{t("types.animated")}</Tag>
                                    </Select.Option>
                                    <Select.Option value={false}>
                                        <Tag color="blue" icon={<PictureOutlined />}>{t("types.static")}</Tag>
                                    </Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <RangePicker
                                    placeholder={[t("filters.createdFromTo").split("/")[0], t("filters.createdFromTo").split("/")[1]]}
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
                            <Col flex="auto" />
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                                        {t("filters.apply")}
                                    </Button>
                                    {activeFilterCount > 0 && (
                                        <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                                            {t("filters.clear")}
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </>
                )}
            </Card>
            {/* Table */}
            <List title="" headerButtons={<></>}>
                <Table {...tableProps} rowKey="_id" scroll={{ x: 900 }}>
                    <Table.Column
                        title={t("fields.thumbnail")}
                        dataIndex="thumbnailUrl"
                        width={80}
                        render={(value: string) => (
                            <Image
                                src={getMediaUrl(value)}
                                width={50}
                                height={50}
                                style={{ objectFit: "cover", borderRadius: 4 }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            />
                        )}
                    />
                    <Table.Column title={t("fields.name")} dataIndex="name" ellipsis />
                    <Table.Column title={t("fields.author")} dataIndex="author" ellipsis width={150} />
                    <Table.Column
                        title={t("fields.type")}
                        dataIndex="isAnimated"
                        width={100}
                        render={(value: boolean) => (
                            <Tag color={value ? "green" : "blue"} icon={value ? <PlayCircleOutlined /> : <PictureOutlined />}>
                                {value ? t("types.animated") : t("types.static")}
                            </Tag>
                        )}
                    />
                    <Table.Column
                        title={t("fields.stickersCount")}
                        dataIndex="stickers"
                        width={80}
                        render={(stickers: unknown[]) => stickers?.length || 0}
                    />
                    <Table.Column title={t("fields.version")} dataIndex="version" width={80} />
                    <Table.Column
                        title={t("fields.createdAt")}
                        dataIndex="createdAt"
                        width={120}
                        render={(value: string) => <DateField value={value} format="MMM DD, YYYY" />}
                    />
                    <Table.Column
                        title={t("actions.title")}
                        width={140}
                        render={(_, record: IStickerPack) => (
                            <Space>
                                <ShowButton hideText size="small" recordItemId={record._id} />
                                <Tooltip title={t("actions.edit")}>
                                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                                </Tooltip>
                                <Popconfirm
                                    title={t("confirmations.deletePack")}
                                    onConfirm={() => handleDeletePack(record)}
                                    okButtonProps={{ danger: true, loading: actionLoading }}
                                >
                                    <Tooltip title={t("actions.delete")}>
                                        <Button size="small" danger icon={<DeleteOutlined />} />
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        )}
                    />
                </Table>
            </List>
            {/* Pack Modal */}
            <PackModal
                open={packModalOpen}
                pack={editPack}
                loading={actionLoading}
                onClose={closeModal}
                onCreate={handleCreatePack}
                onUpdate={handleUpdatePack}
            />
        </>
    );
};
