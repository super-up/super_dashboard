import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { List, DateField } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import {
    Table,
    Card,
    Space,
    Typography,
    Button,
    Input,
    Row,
    Col,
    Modal,
    Form,
    Avatar,
    Tooltip,
} from "antd";
import {
    GlobalOutlined,
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import type { ICountry, UpdateCountryDto } from "../../types/country.types";

const { Text } = Typography;

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const CountryList = () => {
    const { t } = useTranslation("countries");
    const [search, setSearch] = useState("");
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<ICountry | null>(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const { open: notify } = useNotification();

    const fetchData = async (page: number = 1, searchQuery: string = "") => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_URL}/admin/config/countries`, {
                params: {
                    page,
                    limit: pagination.limit,
                    ...(searchQuery && { search: searchQuery }),
                },
            });
            const data = response.data?.data || response.data;
            const docs = data?.docs || data || [];
            setCountries(Array.isArray(docs) ? docs : []);
            setPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || docs?.length || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error: unknown) {
            console.error("Failed to fetch countries:", error);
            const err = error as { response?: { data?: { message?: string }; status?: number } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.fetchFailed", { status: err.response?.status || 'unknown' }) });
            setCountries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, search);
    }, []);

    const handleSearch = () => {
        fetchData(1, search);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination((prev) => ({ ...prev, page, limit: pageSize }));
        fetchData(page, search);
    };

    const handleEdit = (country: ICountry) => {
        setEditingCountry(country);
        form.setFieldsValue({
            name: country.name,
            code: country.code,
            emoji: country.emoji,
            unicode: country.unicode,
            image: country.image,
        });
        setEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingCountry) return;
        try {
            const values = await form.validateFields();
            setSaving(true);
            const updateDto: UpdateCountryDto = {
                _id: editingCountry._id,
                name: values.name,
                code: values.code?.toUpperCase(),
                emoji: values.emoji,
                unicode: values.unicode,
                image: values.image,
            };
            await axiosInstance.patch(`${API_URL}/admin/config/countries`, {
                updates: [updateDto],
            });
            notify?.({ type: "success", message: t("messages.updateSuccess") });
            setEditModalOpen(false);
            setEditingCountry(null);
            form.resetFields();
            fetchData(pagination.page, search);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.updateFailed") });
        } finally {
            setSaving(false);
        }
    };

    const handleModalClose = () => {
        setEditModalOpen(false);
        setEditingCountry(null);
        form.resetFields();
    };

    const columns = [
        {
            title: t("table.flag"),
            key: "flag",
            width: 80,
            align: "center" as const,
            render: (_: unknown, record: ICountry) => (
                <Text style={{ fontSize: 28 }}>{record.emoji || "🏳️"}</Text>
            ),
        },
        {
            title: t("table.name"),
            dataIndex: "name",
            key: "name",
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: t("table.code"),
            dataIndex: "code",
            key: "code",
            width: 100,
            render: (value: string) => <Text code>{value}</Text>,
        },
        {
            title: t("table.image"),
            key: "image",
            width: 80,
            render: (_: unknown, record: ICountry) => (
                record.image ? (
                    <Avatar
                        size={40}
                        src={getMediaUrl(record.image)}
                        shape="square"
                        icon={<GlobalOutlined />}
                    />
                ) : (
                    <Text type="secondary">-</Text>
                )
            ),
        },
        {
            title: t("table.updated"),
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 140,
            render: (value: string) =>
                value ? <DateField value={value} format="MMM DD, YYYY" /> : <Text type="secondary">-</Text>,
        },
        {
            title: t("table.actions"),
            key: "actions",
            width: 80,
            render: (_: unknown, record: ICountry) => (
                <Tooltip title={t("tooltips.edit")}>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <List title="Countries" headerButtons={<></>}>
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder={t("form.searchPlaceholder")}
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
                                Search
                            </Button>
                            <Tooltip title={t("tooltips.refresh")}>
                                <Button
                                    icon={<ReloadOutlined spin={loading} />}
                                    onClick={() => fetchData(pagination.page, search)}
                                />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    dataSource={countries}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} countries`,
                        onChange: handlePageChange,
                    }}
                    scroll={{ x: 700 }}
                />
            </Card>
            <Modal
                title={`${t("modal.title")}: ${editingCountry?.name || ""}`}
                open={editModalOpen}
                onCancel={handleModalClose}
                onOk={handleSave}
                okText={t("buttons.saveChanges")}
                confirmLoading={saving}
                destroyOnClose
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: t("validation.nameRequired") }]}
                    >
                        <Input placeholder="Country name" />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="Code"
                        rules={[
                            { required: true, message: t("validation.codeRequired") },
                            { max: 3, message: t("validation.codeFormat") },
                        ]}
                    >
                        <Input placeholder="US, EG, etc." style={{ textTransform: "uppercase" }} />
                    </Form.Item>
                    <Form.Item
                        name="emoji"
                        label="Flag Emoji"
                        rules={[{ required: true, message: t("validation.emojiRequired") }]}
                    >
                        <Input placeholder="🇺🇸" style={{ fontSize: 20 }} />
                    </Form.Item>
                    <Form.Item
                        name="unicode"
                        label="Unicode"
                    >
                        <Input placeholder="U+1F1FA U+1F1F8" />
                    </Form.Item>
                    <Form.Item
                        name="image"
                        label="Image URL"
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>
                </Form>
            </Modal>
        </List>
    );
};
