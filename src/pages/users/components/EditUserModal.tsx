import { useState, useEffect } from "react";
import { useCustom, useNotification } from "@refinedev/core";
import {
    Modal,
    Form,
    Input,
    Select,
    Switch,
    DatePicker,
    Button,
    Avatar,
    Space,
    Typography,
    Divider,
    Popconfirm,
    Alert,
    Spin,
} from "antd";
import {
    UserOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    DeleteOutlined,
    LogoutOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { IUser, RegisterStatus, isUserBanned, isUserDeleted, isUserVerified } from "../../../types/user.types";
import { getMediaUrl } from "../../../config/api";
import { axiosInstance } from "../../../providers/dataProvider";
import { API_URL } from "../../../config/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EditUserModalProps {
    user: IUser | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const banDurationOptions = [
    { label: "1 Day", value: 1 },
    { label: "3 Days", value: 3 },
    { label: "1 Week", value: 7 },
    { label: "1 Month", value: 30 },
    { label: "3 Months", value: 90 },
    { label: "1 Year", value: 365 },
    { label: "Permanent", value: 36500 },
    { label: "Custom Date", value: -1 },
];

export const EditUserModal = ({ user, open, onClose, onSuccess }: EditUserModalProps) => {
    const [form] = Form.useForm();
    const { open: notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [banDuration, setBanDuration] = useState<number | null>(null);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    useEffect(() => {
        if (user && open) {
            const banned = isUserBanned(user);
            const verified = isUserVerified(user);
            setIsBanned(banned);
            setIsVerified(verified);
            form.setFieldsValue({
                fullName: user.fullName,
                bio: user.userBio || "",
                registerStatus: user.registerStatus,
            });
        }
    }, [user, open, form]);
    const handleUpdate = async (values: { fullName?: string; bio?: string; registerStatus?: RegisterStatus }) => {
        if (!user) return;
        setLoading(true);
        try {
            const updates: Record<string, unknown> = {};
            if (values.fullName && values.fullName !== user.fullName) {
                updates.fullName = values.fullName;
            }
            if (values.bio !== undefined && values.bio !== user.userBio) {
                updates.bio = values.bio;
            }
            if (values.registerStatus && values.registerStatus !== user.registerStatus) {
                updates.registerStatus = values.registerStatus;
            }
            if (Object.keys(updates).length > 0) {
                await axiosInstance.patch(`${API_URL}/admin/users`, {
                    userIds: [user._id],
                    updates,
                });
                notify?.({ type: "success", message: "User profile updated successfully" });
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to update user" });
        } finally {
            setLoading(false);
        }
    };
    const handleBanToggle = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let banTo: string | null = null;
            if (!isBanned) {
                const days = banDuration === -1 ? 365 : (banDuration || 7);
                banTo = dayjs().add(days, "day").toISOString();
            }
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { banTo },
            });
            notify?.({
                type: "success",
                message: isBanned ? "User unbanned successfully" : "User banned successfully",
            });
            setIsBanned(!isBanned);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to update ban status" });
        } finally {
            setLoading(false);
        }
    };
    const handleBanWithCustomDate = async (date: dayjs.Dayjs | null) => {
        if (!user || !date) return;
        setLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { banTo: date.toISOString() },
            });
            notify?.({ type: "success", message: "User banned successfully" });
            setIsBanned(true);
            setShowCustomDate(false);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to ban user" });
        } finally {
            setLoading(false);
        }
    };
    const handleVerifyToggle = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { hasBadge: !isVerified },
            });
            notify?.({
                type: "success",
                message: isVerified ? "Verification badge removed" : "User verified successfully",
            });
            setIsVerified(!isVerified);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to update verification" });
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const isDeleted = isUserDeleted(user);
            await axiosInstance.patch(`${API_URL}/admin/users`, {
                userIds: [user._id],
                updates: { deletedAt: isDeleted ? null : new Date().toISOString() },
            });
            notify?.({
                type: "success",
                message: isDeleted ? "User restored successfully" : "User deleted successfully",
            });
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to update user" });
        } finally {
            setLoading(false);
        }
    };
    const handleLogoutAll = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post(`${API_URL}/admin/users/${user._id}/logout-all`);
            const devicesRemoved = response.data?.data?.devicesRemoved || 0;
            notify?.({
                type: "success",
                message: `Logged out from ${devicesRemoved} device(s) successfully`,
            });
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to logout devices" });
        } finally {
            setLoading(false);
        }
    };
    if (!user) return null;
    const deleted = isUserDeleted(user);
    return (
        <Modal
            title={null}
            open={open}
            onCancel={onClose}
            footer={null}
            width={560}
            destroyOnClose
        >
            <Spin spinning={loading}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Avatar
                        size={80}
                        src={getMediaUrl(user.userImage)}
                        icon={<UserOutlined />}
                        style={{ marginBottom: 12 }}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        {user.fullName}
                        {isVerified && (
                            <SafetyCertificateOutlined
                                style={{ color: "#1890ff", marginLeft: 8, fontSize: 18 }}
                            />
                        )}
                    </Title>
                    <Text type="secondary">{user.fullPhone}</Text>
                    {deleted && (
                        <Alert
                            message="This user has been deleted"
                            type="warning"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                    {isBanned && (
                        <Alert
                            message={`User banned until ${user.banTo ? dayjs(user.banTo).format("MMM DD, YYYY") : "Unknown"}`}
                            type="error"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                </div>
                <Divider>Profile Information</Divider>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        name="fullName"
                        label="Full Name"
                        rules={[{ required: true, message: "Name is required" }]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>
                    <Form.Item name="bio" label="Bio">
                        <TextArea rows={3} placeholder="Enter bio" />
                    </Form.Item>
                    <Form.Item name="registerStatus" label="Registration Status">
                        <Select>
                            <Select.Option value={RegisterStatus.accepted}>Accepted</Select.Option>
                            <Select.Option value={RegisterStatus.pending}>Pending</Select.Option>
                            <Select.Option value={RegisterStatus.rejected}>Rejected</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Save Profile Changes
                    </Button>
                </Form>
                <Divider>Verification</Divider>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                        <SafetyCertificateOutlined style={{ fontSize: 20 }} />
                        <div>
                            <Text strong>Verification Badge</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {isVerified ? "User is verified" : "User is not verified"}
                            </Text>
                        </div>
                    </Space>
                    <Switch
                        checked={isVerified}
                        onChange={handleVerifyToggle}
                        checkedChildren="Verified"
                        unCheckedChildren="Not Verified"
                    />
                </Space>
                <Divider>Ban Management</Divider>
                {!isBanned ? (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Select
                            placeholder="Select ban duration"
                            style={{ width: "100%" }}
                            onChange={(value) => {
                                setBanDuration(value);
                                setShowCustomDate(value === -1);
                            }}
                            options={banDurationOptions}
                        />
                        {showCustomDate && (
                            <DatePicker
                                style={{ width: "100%" }}
                                showTime
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                                onChange={handleBanWithCustomDate}
                                placeholder="Select ban end date"
                            />
                        )}
                        {!showCustomDate && banDuration && banDuration !== -1 && (
                            <Popconfirm
                                title="Ban User"
                                description={`Are you sure you want to ban this user for ${banDurationOptions.find((o) => o.value === banDuration)?.label}?`}
                                onConfirm={handleBanToggle}
                                okText="Yes, Ban"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<StopOutlined />} block>
                                    Ban User
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                ) : (
                    <Popconfirm
                        title="Unban User"
                        description="Are you sure you want to unban this user?"
                        onConfirm={handleBanToggle}
                        okText="Yes, Unban"
                        cancelText="Cancel"
                    >
                        <Button type="primary" icon={<StopOutlined />} block>
                            Unban User
                        </Button>
                    </Popconfirm>
                )}
                <Divider>Danger Zone</Divider>
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Popconfirm
                        title={deleted ? "Restore User" : "Delete User"}
                        description={
                            deleted
                                ? "Are you sure you want to restore this user?"
                                : "This will soft-delete the user. Are you sure?"
                        }
                        onConfirm={handleDelete}
                        okText={deleted ? "Yes, Restore" : "Yes, Delete"}
                        cancelText="Cancel"
                        okButtonProps={{ danger: !deleted }}
                        icon={<ExclamationCircleOutlined style={{ color: deleted ? "#52c41a" : "#ff4d4f" }} />}
                    >
                        <Button
                            danger={!deleted}
                            type={deleted ? "primary" : "default"}
                            icon={<DeleteOutlined />}
                            block
                        >
                            {deleted ? "Restore User" : "Delete User"}
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Logout All Devices"
                        description="This will force logout the user from all devices. Are you sure?"
                        onConfirm={handleLogoutAll}
                        okText="Yes, Logout All"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<LogoutOutlined />} block>
                            Logout All Devices
                        </Button>
                    </Popconfirm>
                </Space>
            </Spin>
        </Modal>
    );
};
