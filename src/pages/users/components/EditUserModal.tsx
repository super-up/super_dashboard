import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export const EditUserModal = ({ user, open, onClose, onSuccess }: EditUserModalProps) => {
    const { t } = useTranslation("users");
    const [form] = Form.useForm();
    const { open: notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [banDuration, setBanDuration] = useState<number | null>(null);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const banDurationOptions = [
        { label: t("banDurations.1h"), value: 1 },
        { label: t("banDurations.3d"), value: 3 },
        { label: t("banDurations.7d"), value: 7 },
        { label: t("banDurations.1m"), value: 30 },
        { label: t("banDurations.3m"), value: 90 },
        { label: t("banDurations.1y"), value: 365 },
        { label: t("banDurations.permanent"), value: 36500 },
        { label: t("banDurations.customDate"), value: -1 },
    ];

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
                notify?.({ type: "success", message: t("messages.profileUpdatedSuccess") });
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.profileUpdateFailed") });
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
                message: isBanned ? t("messages.userUnbannedSuccess") : t("messages.userBannedSuccess"),
            });
            setIsBanned(!isBanned);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.banStatusFailed") });
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
            notify?.({ type: "success", message: t("messages.banUserSuccess") });
            setIsBanned(true);
            setShowCustomDate(false);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.banUserFailed") });
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
                message: isVerified ? t("messages.verificationBadgeRemoved") : t("messages.verificationBadgeAdded"),
            });
            setIsVerified(!isVerified);
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.verificationFailed") });
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
                message: isDeleted ? t("messages.userRestoredSuccess") : t("messages.userDeletedSuccess"),
            });
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.updateUserFailed") });
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
                message: t("messages.logoutDevicesSuccess", { count: devicesRemoved }),
            });
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("messages.logoutDevicesFailed") });
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
            width="90%"
            style={{ maxWidth: 560 }}
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
                            message={t("form.deleted")}
                            type="warning"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                    {isBanned && (
                        <Alert
                            message={t("messages.bannedUntil", {
                                date: user.banTo ? dayjs(user.banTo).format("MMM DD, YYYY") : "Unknown",
                            })}
                            type="error"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                </div>
                <Divider>{t("modal.profileSection")}</Divider>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        name="fullName"
                        label={t("form.fullName")}
                        rules={[{ required: true, message: t("validation.fullNameRequired") }]}
                    >
                        <Input placeholder={t("placeholders.enterFullName")} />
                    </Form.Item>
                    <Form.Item name="bio" label={t("form.bio")}>
                        <TextArea rows={3} placeholder={t("placeholders.enterBio")} />
                    </Form.Item>
                    <Form.Item name="registerStatus" label={t("form.registrationStatus")}>
                        <Select>
                            <Select.Option value={RegisterStatus.accepted}>{t("options.accepted")}</Select.Option>
                            <Select.Option value={RegisterStatus.pending}>{t("options.pending")}</Select.Option>
                            <Select.Option value={RegisterStatus.rejected}>{t("options.rejected")}</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {t("form.saveProfileChanges")}
                    </Button>
                </Form>
                <Divider>{t("modal.verificationSection")}</Divider>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                        <SafetyCertificateOutlined style={{ fontSize: 20 }} />
                        <div>
                            <Text strong>{t("form.verificationBadge")}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {isVerified ? t("badges.isVerified") : t("badges.isNotVerified")}
                            </Text>
                        </div>
                    </Space>
                    <Switch
                        checked={isVerified}
                        onChange={handleVerifyToggle}
                        checkedChildren={t("badges.verified")}
                        unCheckedChildren={t("badges.notVerified")}
                    />
                </Space>
                <Divider>{t("modal.banSection")}</Divider>
                {!isBanned ? (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Select
                            placeholder={t("form.banDuration")}
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
                                placeholder={t("form.banEndDate")}
                            />
                        )}
                        {!showCustomDate && banDuration && banDuration !== -1 && (
                            <Popconfirm
                                title={t("confirmations.banUserTitle")}
                                description={`Are you sure you want to ban this user for ${banDurationOptions.find((o) => o.value === banDuration)?.label}?`}
                                onConfirm={handleBanToggle}
                                okText={t("confirmations.banButton")}
                                cancelText={t("common:actions.cancel")}
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<StopOutlined />} block>
                                    {t("buttons.banUser")}
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                ) : (
                    <Popconfirm
                        title={t("confirmations.unbannedTitle")}
                        description={t("confirmations.unbannedDesc")}
                        onConfirm={handleBanToggle}
                        okText={t("confirmations.unbannedButton")}
                        cancelText={t("common:actions.cancel")}
                    >
                        <Button type="primary" icon={<StopOutlined />} block>
                            {t("buttons.unbanUser")}
                        </Button>
                    </Popconfirm>
                )}
                <Divider>{t("modal.dangerZone")}</Divider>
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Popconfirm
                        title={deleted ? t("confirmations.restoreTitle") : t("confirmations.deleteTitle")}
                        description={
                            deleted
                                ? t("confirmations.restoreDesc")
                                : t("confirmations.deleteDesc")
                        }
                        onConfirm={handleDelete}
                        okText={deleted ? t("confirmations.restoreButton") : t("confirmations.deleteButton")}
                        cancelText={t("common:actions.cancel")}
                        okButtonProps={{ danger: !deleted }}
                        icon={<ExclamationCircleOutlined style={{ color: deleted ? "#52c41a" : "#ff4d4f" }} />}
                    >
                        <Button
                            danger={!deleted}
                            type={deleted ? "primary" : "default"}
                            icon={<DeleteOutlined />}
                            block
                        >
                            {deleted ? t("buttons.restoreUser") : t("buttons.deleteUser")}
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title={t("confirmations.logoutAllTitle")}
                        description={t("confirmations.logoutAllDesc")}
                        onConfirm={handleLogoutAll}
                        okText={t("confirmations.logoutAllButton")}
                        cancelText={t("common:actions.cancel")}
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<LogoutOutlined />} block>
                            {t("buttons.logoutAllDevices")}
                        </Button>
                    </Popconfirm>
                </Space>
            </Spin>
        </Modal>
    );
};
