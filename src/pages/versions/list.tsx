import { useState, useEffect } from "react";
import { List, DateField } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import {
    Table,
    Tag,
    Space,
    Typography,
    Button,
    Tabs,
    Card,
    Popconfirm,
    Tooltip,
    Modal,
    Form,
    Input,
    Switch,
    Select,
} from "antd";
import {
    AppleOutlined,
    AndroidOutlined,
    DesktopOutlined,
    WindowsOutlined,
    AppstoreOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    BellOutlined,
    CloudUploadOutlined,
} from "@ant-design/icons";
import { API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import type { IAppVersion, CreateVersionDto, UpdateVersionDto } from "../../types/version.types";
import { Platform, PLATFORM_OPTIONS, getPlatformConfig } from "../../types/version.types";

const { Text } = Typography;
const { TextArea } = Input;

type PlatformFilter = "all" | Platform;

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const getPlatformIcon = (platform?: string) => {
    const key = platform?.toLowerCase();
    switch (key) {
        case "ios":
            return <AppleOutlined />;
        case "android":
            return <AndroidOutlined />;
        case "windows":
            return <WindowsOutlined />;
        case "macos":
            return <DesktopOutlined />;
        default:
            return <AppstoreOutlined />;
    }
};

export const VersionList = () => {
    const [activeTab, setActiveTab] = useState<PlatformFilter>("all");
    const [versions, setVersions] = useState<IAppVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVersion, setEditingVersion] = useState<IAppVersion | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const { open: notify } = useNotification();
    const fetchData = async (platform: PlatformFilter, page: number = 1) => {
        setLoading(true);
        try {
            const endpoint = `${API_URL}/admin/config/versions`;
            const response = await axiosInstance.get(endpoint, {
                params: {
                    page,
                    limit: pagination.limit,
                    ...(platform !== "all" && { platform }),
                },
            });
            const data = response.data?.data || response.data;
            const docs = data?.docs || data || [];
            setVersions(Array.isArray(docs) ? docs : []);
            setPagination({
                page: data?.page || page,
                limit: data?.limit || 20,
                total: data?.totalDocs || docs?.length || 0,
                totalPages: data?.totalPages || 0,
            });
        } catch (error: unknown) {
            console.error("Failed to fetch versions:", error);
            const err = error as { response?: { data?: { message?: string }; status?: number } };
            notify?.({ type: "error", message: err.response?.data?.message || `Failed to fetch versions (${err.response?.status || "unknown"})` });
            setVersions([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData(activeTab, 1);
    }, [activeTab]);
    const handlePageChange = (page: number, pageSize: number) => {
        setPagination((prev) => ({ ...prev, page, limit: pageSize }));
        fetchData(activeTab, page);
    };
    const handleCreate = () => {
        setEditingVersion(null);
        form.resetFields();
        form.setFieldsValue({
            platform: Platform.android,
            critical: false,
            notify: false,
        });
        setModalOpen(true);
    };
    const handleEdit = (record: IAppVersion) => {
        setEditingVersion(record);
        form.setFieldsValue({
            semVer: record.semVer,
            platform: record.platform,
            critical: record.critical,
            notify: record.notify,
            notes: record.notes,
        });
        setModalOpen(true);
    };
    const handleDelete = async (id: string) => {
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/versions`, {
                versionIds: [id],
                updates: { deleted: true },
            });
            notify?.({ type: "success", message: "Version deleted successfully" });
            fetchData(activeTab, pagination.page);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to delete version" });
        }
    };
    const handleSubmit = async (values: CreateVersionDto | UpdateVersionDto) => {
        setSubmitting(true);
        try {
            if (editingVersion) {
                await axiosInstance.patch(`${API_URL}/admin/config/versions`, {
                    versionIds: [editingVersion._id],
                    updates: values,
                });
                notify?.({ type: "success", message: "Version updated successfully" });
            } else {
                await axiosInstance.patch(`${API_URL}/admin/config/versions`, {
                    creates: [values],
                });
                notify?.({ type: "success", message: "Version created successfully" });
            }
            setModalOpen(false);
            fetchData(activeTab, pagination.page);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to save version" });
        } finally {
            setSubmitting(false);
        }
    };
    const columns = [
        {
            title: "Version",
            dataIndex: "semVer",
            key: "semVer",
            width: 100,
            render: (value: string) => <Text strong style={{ fontFamily: "monospace" }}>{value}</Text>,
        },
        {
            title: "Platform",
            dataIndex: "platform",
            key: "platform",
            width: 120,
            render: (value: string) => {
                const config = getPlatformConfig(value);
                return (
                    <Tag color={config.color} icon={getPlatformIcon(value)}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: "Critical",
            dataIndex: "critical",
            key: "critical",
            width: 90,
            render: (value: boolean) =>
                value ? (
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>Yes</Tag>
                ) : (
                    <Tag color="default">No</Tag>
                ),
        },
        {
            title: "Notify",
            dataIndex: "notify",
            key: "notify",
            width: 90,
            render: (value: boolean) =>
                value ? (
                    <Tag color="blue" icon={<BellOutlined />}>Yes</Tag>
                ) : (
                    <Tag color="default">No</Tag>
                ),
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            ellipsis: true,
            render: (value: string) => (
                <Tooltip title={value}>
                    <Text style={{ maxWidth: 200 }} ellipsis>{value || "-"}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (value: string) => <DateField value={value} format="MMM DD, YYYY" />,
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_: unknown, record: IAppVersion) => (
                <Space size={4}>
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Delete this version?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(record._id)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const tabItems = [
        { key: "all", label: <span><AppstoreOutlined /> All</span> },
        { key: Platform.ios, label: <span><AppleOutlined /> iOS</span> },
        { key: Platform.android, label: <span><AndroidOutlined /> Android</span> },
        { key: Platform.windows, label: <span><WindowsOutlined /> Windows</span> },
        { key: Platform.macOs, label: <span><DesktopOutlined /> macOS</span> },
        { key: Platform.other, label: <span><AppstoreOutlined /> Other</span> },
    ];
    return (
        <List
            title="App Versions"
            headerButtons={
                <Space>
                    <Tooltip title="Refresh">
                        <Button icon={<ReloadOutlined />} onClick={() => fetchData(activeTab, pagination.page)} />
                    </Tooltip>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Version
                    </Button>
                </Space>
            }
        >
            <Card bodyStyle={{ padding: 0 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key as PlatformFilter);
                        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
                    }}
                    items={tabItems}
                    style={{ padding: "0 24px" }}
                />
                <Table
                    dataSource={versions}
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
                    scroll={{ x: 900 }}
                />
            </Card>
            <Modal
                title={editingVersion ? "Edit Version" : "Add Version"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="platform"
                        label="Platform"
                        rules={[{ required: true, message: "Platform is required" }]}
                    >
                        <Select options={PLATFORM_OPTIONS} placeholder="Select platform" />
                    </Form.Item>
                    <Form.Item
                        name="semVer"
                        label="Version"
                        rules={[
                            { required: true, message: "Version is required" },
                            { pattern: /^\d+\.\d+\.\d+$/, message: "Use format: x.x.x (e.g., 1.2.0)" },
                        ]}
                    >
                        <Input placeholder="1.0.0" />
                    </Form.Item>
                    <Form.Item
                        name="critical"
                        label="Critical (Force Update)"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item
                        name="notify"
                        label="Notify Users"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item
                        name="notes"
                        label="Release Notes"
                    >
                        <TextArea rows={3} placeholder="What's new in this version..." />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting} icon={<CloudUploadOutlined />}>
                                {editingVersion ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </List>
    );
};
