import { useShow, useNotification, useNavigation } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { useTranslation } from "react-i18next";
import {
    Typography,
    Descriptions,
    Avatar,
    Tag,
    Card,
    Row,
    Col,
    Spin,
    Space,
    Button,
    Divider,
    Popconfirm,
    Tooltip,
    Steps,
    Modal,
    Radio,
    DatePicker,
    InputNumber,
    Alert,
} from "antd";
import {
    UserOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    FlagOutlined,
    StopOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getMediaUrl, API_URL } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { useState } from "react";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface IReportUser {
    _id: string;
    fullName: string;
    email?: string;
    userImage?: string;
}
interface IReport {
    _id: string;
    type: string;
    reasonType?: "spam" | "harassment" | "inappropriate_content" | "hate_speech" | "violence";
    status: "pending" | "approved" | "rejected";
    content?: string;
    uId?: IReportUser;
    userId?: IReportUser;
    targetId?: IReportUser;
    chatId?: string;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt?: string;
    resolvedAt?: string;
}
const getReportedUser = (report: IReport): IReportUser | undefined => {
    return report.userId || report.targetId;
};
const normalizeReportType = (type: string): string => {
    const typeMap: Record<string, string> = {
        "1": "user",
        "2": "chat",
        "3": "message",
        "4": "user",
        "user": "user",
        "chat": "chat",
    };
    return typeMap[type] || type;
};

const REPORT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    user: { label: "User Report", color: "blue", icon: <UserOutlined /> },
    chat: { label: "Chat Report", color: "purple", icon: <MessageOutlined /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "orange", icon: <ClockCircleOutlined /> },
    approved: { label: "Approved", color: "green", icon: <CheckCircleOutlined /> },
    rejected: { label: "Rejected", color: "red", icon: <CloseCircleOutlined /> },
};

const REASON_LABELS: Record<string, string> = {
    spam: "Spam",
    harassment: "Harassment",
    inappropriate_content: "Inappropriate Content",
    hate_speech: "Hate Speech",
    violence: "Violence",
};

type BanDurationType = "1h" | "24h" | "7d" | "30d" | "permanent" | "custom";

export const ReportShow = () => {
    const { t } = useTranslation("reports");
    const { t: tc } = useTranslation("common");
    const { query } = useShow<IReport>({
        resource: "admin/reports",
    });
    const { data, isLoading, refetch } = query;
    const report = data?.data as IReport | undefined;
    const { open: notify } = useNotification();
    const { show: goToDetail } = useNavigation();
    const [actionLoading, setActionLoading] = useState(false);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"ban" | "delete" | null>(null);
    const [banDuration, setBanDuration] = useState<BanDurationType>("24h");
    const [customDays, setCustomDays] = useState<number>(7);
    const [customDate, setCustomDate] = useState<dayjs.Dayjs | null>(null);
    if (isLoading || !report) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    const normalizedType = normalizeReportType(report.type);
    const reportedUser = getReportedUser(report);
    const typeConfig = REPORT_TYPE_CONFIG[normalizedType] || { label: normalizedType, color: "default", icon: <WarningOutlined /> };
    const statusConfig = STATUS_CONFIG[report.status] || { label: report.status, color: "default", icon: <ClockCircleOutlined /> };
    const handleStatusChange = async (newStatus: string) => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/reports`, {
                reportIds: [report._id],
                updates: { status: newStatus },
            });
            notify?.({ type: "success", message: `Report ${newStatus}` });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to update report" });
        } finally {
            setActionLoading(false);
        }
    };
    const getBanEndDate = (): string => {
        const now = dayjs();
        switch (banDuration) {
            case "1h": return now.add(1, "hour").toISOString();
            case "24h": return now.add(24, "hour").toISOString();
            case "7d": return now.add(7, "day").toISOString();
            case "30d": return now.add(30, "day").toISOString();
            case "permanent": return "2099-12-31T23:59:59.000Z";
            case "custom":
                if (customDate) return customDate.toISOString();
                return now.add(customDays, "day").toISOString();
            default: return now.add(24, "hour").toISOString();
        }
    };
    const getBanDurationLabel = (): string => {
        switch (banDuration) {
            case "1h": return tc("banDurations.1h");
            case "24h": return tc("banDurations.24h");
            case "7d": return tc("banDurations.7d");
            case "30d": return tc("banDurations.30d");
            case "permanent": return tc("banDurations.permanent");
            case "custom":
                if (customDate) return `${tc("labels.until") || "until"} ${customDate.format("MMM DD, YYYY")}`;
                return `${customDays} ${tc("time.days")}`;
            default: return tc("banDurations.24h");
        }
    };
    const handleTakeAction = async () => {
        if (!reportedUser) {
            notify?.({ type: "error", message: "No reported user to take action on" });
            return;
        }
        setActionLoading(true);
        try {
            if (actionType === "ban") {
                const banTo = getBanEndDate();
                await axiosInstance.patch(`${API_URL}/admin/users`, {
                    userIds: [reportedUser._id],
                    updates: { banTo },
                });
                notify?.({ type: "success", message: `User banned ${getBanDurationLabel()}` });
            } else if (actionType === "delete") {
                await axiosInstance.patch(`${API_URL}/admin/users`, {
                    userIds: [reportedUser._id],
                    updates: { deletedAt: new Date().toISOString() },
                });
                notify?.({ type: "success", message: "User account deleted" });
            }
            await axiosInstance.patch(`${API_URL}/admin/reports`, {
                reportIds: [report._id],
                updates: { status: "approved" },
            });
            setActionModalOpen(false);
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to take action" });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeleteContent = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/reports`, {
                reportIds: [report._id],
                updates: { action: "delete_content" },
            });
            notify?.({ type: "success", message: "Content deleted" });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || "Failed to delete content" });
        } finally {
            setActionLoading(false);
        }
    };
    const openActionModal = (type: "ban" | "delete") => {
        setActionType(type);
        setBanDuration("24h");
        setCustomDays(7);
        setCustomDate(null);
        setActionModalOpen(true);
    };
    const getStatusStep = () => {
        switch (report.status) {
            case "pending": return 0;
            case "approved":
            case "rejected": return 1;
            default: return 0;
        }
    };
    const renderReportedContent = () => {
        if (normalizedType === "user" || reportedUser) {
            if (!reportedUser) return <Text type="secondary">{tc("labels.reportedUserDataNotAvailable")}</Text>;
            return (
                <Card size="small">
                    <Space>
                        <Avatar
                            size={64}
                            src={getMediaUrl(reportedUser.userImage)}
                            icon={<UserOutlined />}
                        />
                        <div>
                            <Text strong style={{ fontSize: 16, display: "block" }}>
                                {reportedUser.fullName || tc("labels.unknownUser")}
                            </Text>
                            {reportedUser.email && (
                                <Text type="secondary">{reportedUser.email}</Text>
                            )}
                            <br />
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0 }}
                                onClick={() => goToDetail("admin/users", reportedUser._id)}
                            >
                                {tc("actions.viewUserProfile")}
                            </Button>
                        </div>
                    </Space>
                </Card>
            );
        }
        if (normalizedType === "chat") {
            if (!report.chatId) return <Text type="secondary">{tc("labels.chatDataNotAvailable")}</Text>;
            return (
                <Card size="small">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Space>
                            <MessageOutlined style={{ fontSize: 24, color: "#722ed1" }} />
                            <div>
                                <Text strong>{tc("labels.chatId")}: {report.chatId}</Text>
                            </div>
                        </Space>
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0 }}
                            onClick={() => goToDetail("admin/rooms", report.chatId!)}
                        >
                            {tc("actions.viewChatDetails")}
                        </Button>
                    </Space>
                </Card>
            );
        }
        return <Text type="secondary">{tc("labels.noReportedContent")}</Text>;
    };
    return (
        <>
            <Show
                headerButtons={
                    <Space>
                        {report.status === "pending" && (
                            <>
                                <Popconfirm
                                    title={tc("confirmations.approveReport")}
                                    description={tc("confirmations.approveReportDesc")}
                                    onConfirm={() => handleStatusChange("approved")}
                                >
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        loading={actionLoading}
                                    >
                                        {tc("actions.approve")}
                                    </Button>
                                </Popconfirm>
                                <Popconfirm
                                    title={tc("confirmations.rejectReport")}
                                    description={tc("confirmations.rejectReportDesc")}
                                    onConfirm={() => handleStatusChange("rejected")}
                                >
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        loading={actionLoading}
                                    >
                                        {tc("actions.reject")}
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                }
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Card>
                            <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "#fff2e8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                    }}
                                >
                                    <FlagOutlined style={{ fontSize: 36, color: "#fa541c" }} />
                                </div>
                                <Tag color={typeConfig.color} icon={typeConfig.icon} style={{ fontSize: 14, padding: "4px 12px" }}>
                                    {t(`types.${normalizedType}`) || typeConfig.label}
                                </Tag>
                                <div style={{ marginTop: 16 }}>
                                    <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ fontSize: 14, padding: "4px 12px" }}>
                                        {tc(`status.${report.status}`) || statusConfig.label}
                                    </Tag>
                                </div>
                            </div>
                            <Divider />
                            <Card
                                size="small"
                                title={<Space><UserOutlined /> {tc("labels.reporter")}</Space>}
                            >
                                {report.uId ? (
                                    <Space style={{ width: "100%" }}>
                                        <Avatar
                                            size={48}
                                            src={getMediaUrl(report.uId.userImage)}
                                            icon={<UserOutlined />}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <Text strong style={{ display: "block" }}>
                                                {report.uId.fullName || "Unknown"}
                                            </Text>
                                            {report.uId.email && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {report.uId.email}
                                                </Text>
                                            )}
                                            <br />
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ padding: 0, height: "auto" }}
                                                onClick={() => goToDetail("admin/users", report.uId!._id)}
                                            >
                                                {tc("actions.viewProfile")}
                                            </Button>
                                        </div>
                                    </Space>
                                ) : (
                                    <Text type="secondary">{tc("labels.reporterDataNotAvailable")}</Text>
                                )}
                            </Card>
                            {reportedUser && (
                                <Card
                                    size="small"
                                    title={
                                        <Space>
                                            <WarningOutlined style={{ color: "#ff4d4f" }} />
                                            <span style={{ color: "#ff4d4f" }}>{tc("labels.reportedUser")}</span>
                                        </Space>
                                    }
                                    style={{ marginTop: 12, borderColor: "#ffccc7" }}
                                >
                                    <Space style={{ width: "100%" }}>
                                        <Avatar
                                            size={48}
                                            src={getMediaUrl(reportedUser.userImage)}
                                            icon={<UserOutlined />}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <Text strong style={{ display: "block" }}>
                                                {reportedUser.fullName || "Unknown"}
                                            </Text>
                                            {reportedUser.email && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {reportedUser.email}
                                                </Text>
                                            )}
                                            <br />
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ padding: 0, height: "auto" }}
                                                onClick={() => goToDetail("admin/users", reportedUser._id)}
                                            >
                                                {tc("actions.viewProfile")}
                                            </Button>
                                        </div>
                                    </Space>
                                </Card>
                            )}
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Card title={tc("labels.reportProgress")} style={{ marginBottom: 24 }}>
                            <Steps
                                current={getStatusStep()}
                                status={report.status === "rejected" ? "error" : undefined}
                                items={[
                                    {
                                        title: tc("labels.submitted"),
                                        description: dayjs(report.createdAt).format("MMM DD, HH:mm"),
                                        icon: <FlagOutlined />,
                                    },
                                    {
                                        title: report.status === "rejected" ? tc("status.rejected") : tc("status.approved"),
                                        description: report.resolvedAt ? dayjs(report.resolvedAt).format("MMM DD, HH:mm") : tc("status.pending"),
                                        icon: report.status === "rejected" ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                                    },
                                ]}
                            />
                        </Card>
                        <Card title={tc("labels.reportReason")} style={{ marginBottom: 24 }}>
                            {report.reasonType && (
                                <Tag color="volcano" style={{ marginBottom: 12 }}>
                                    {t(`reasons.${report.reasonType.replace(/_/g, "")}`) || report.reasonType}
                                </Tag>
                            )}
                            {report.content && (
                                <Paragraph style={{ fontSize: 16, marginBottom: 0, whiteSpace: "pre-wrap" }}>
                                    {report.content}
                                </Paragraph>
                            )}
                            {!report.content && !report.reasonType && (
                                <Text type="secondary">{tc("labels.noAdditionalDetails")}</Text>
                            )}
                        </Card>
                        <Card title={tc("labels.reportedContent")} style={{ marginBottom: 24 }}>
                            {renderReportedContent()}
                        </Card>
                        {report.status === "pending" && (reportedUser || report.chatId) && (
                            <Card
                                title={
                                    <Space>
                                        <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                                        <span>{tc("labels.takeAction")}</span>
                                    </Space>
                                }
                                style={{ marginBottom: 24, borderColor: "#ffccc7" }}
                            >
                                <Alert
                                    message={tc("labels.actionsAreIrreversible")}
                                    description={tc("labels.takeActionDescription")}
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Space wrap>
                                    {reportedUser && (
                                        <>
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                onClick={() => openActionModal("ban")}
                                                loading={actionLoading}
                                            >
                                                {tc("actions.banUser")}
                                            </Button>
                                            <Popconfirm
                                                title={tc("confirmations.deleteUserAccount")}
                                                description={tc("confirmations.deleteUserAccountDesc")}
                                                onConfirm={() => openActionModal("delete")}
                                                okText={tc("actions.delete")}
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button
                                                    danger
                                                    type="primary"
                                                    icon={<DeleteOutlined />}
                                                    loading={actionLoading}
                                                >
                                                    {tc("actions.deleteAccount")}
                                                </Button>
                                            </Popconfirm>
                                        </>
                                    )}
                                    {report.chatId && (
                                        <Popconfirm
                                            title={tc("confirmations.deleteReportedContent")}
                                            description={tc("confirmations.deleteReportedContentDesc")}
                                            onConfirm={handleDeleteContent}
                                            okText={tc("actions.delete")}
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={actionLoading}
                                            >
                                                {tc("actions.deleteContent")}
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            </Card>
                        )}
                        <Card title={tc("labels.reportDetails")}>
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                <Descriptions.Item label={tc("labels.reportId")}>
                                    <Text copyable={{ text: report._id }}>{report._id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.type")}>
                                    <Tag color={typeConfig.color} icon={typeConfig.icon}>
                                        {t(`types.${normalizedType}`) || typeConfig.label}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("table.reason")}>
                                    <Tag color="volcano">
                                        {report.reasonType ? (t(`reasons.${report.reasonType.replace(/_/g, "")}`) || report.reasonType) : "-"}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("table.status")}>
                                    <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                        {tc(`status.${report.status}`) || statusConfig.label}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={tc("labels.createdAt")}>
                                    <Tooltip title={dayjs(report.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                                        <DateField value={report.createdAt} format="MMM DD, YYYY HH:mm" />
                                    </Tooltip>
                                </Descriptions.Item>
                                {report.updatedAt && (
                                    <Descriptions.Item label={tc("labels.updatedAt")}>
                                        <Tooltip title={dayjs(report.updatedAt).format("YYYY-MM-DD HH:mm:ss")}>
                                            <DateField value={report.updatedAt} format="MMM DD, YYYY HH:mm" />
                                        </Tooltip>
                                    </Descriptions.Item>
                                )}
                                {report.resolvedAt && (
                                    <Descriptions.Item label={tc("labels.resolvedAt")}>
                                        <DateField value={report.resolvedAt} format="MMM DD, YYYY HH:mm" />
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            </Show>
            <Modal
                title={
                    <Space>
                        {actionType === "ban" ? <StopOutlined style={{ color: "#ff4d4f" }} /> : <DeleteOutlined style={{ color: "#ff4d4f" }} />}
                        <span>{actionType === "ban" ? tc("actions.banUser") : tc("actions.deleteAccount")}</span>
                    </Space>
                }
                open={actionModalOpen}
                onCancel={() => setActionModalOpen(false)}
                onOk={handleTakeAction}
                okText={actionType === "ban" ? tc("actions.banUser") : tc("actions.deleteAccount")}
                okButtonProps={{ danger: true, loading: actionLoading }}
                cancelButtonProps={{ disabled: actionLoading }}
            >
                {actionType === "ban" && (
                    <>
                        <Alert
                            message={`${tc("actions.ban")}: ${reportedUser?.fullName || tc("labels.unknownUser")}`}
                            type="info"
                            showIcon
                            icon={<UserOutlined />}
                            style={{ marginBottom: 16 }}
                        />
                        <Text strong style={{ display: "block", marginBottom: 8 }}>{tc("labels.selectBanDuration")}</Text>
                        <Radio.Group
                            value={banDuration}
                            onChange={(e) => setBanDuration(e.target.value)}
                            style={{ width: "100%" }}
                        >
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Radio value="1h">{tc("banDurations.1h")}</Radio>
                                <Radio value="24h">{tc("banDurations.24h")}</Radio>
                                <Radio value="7d">{tc("banDurations.7d")}</Radio>
                                <Radio value="30d">{tc("banDurations.30d")}</Radio>
                                <Radio value="permanent">{tc("banDurations.permanent")}</Radio>
                                <Radio value="custom">{tc("banDurations.custom")}</Radio>
                            </Space>
                        </Radio.Group>
                        {banDuration === "custom" && (
                            <div style={{ marginTop: 16, paddingLeft: 24 }}>
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <div>
                                        <Text type="secondary">{tc("labels.daysFromNow")}</Text>
                                        <InputNumber
                                            min={1}
                                            max={365}
                                            value={customDays}
                                            onChange={(v) => {
                                                setCustomDays(v || 7);
                                                setCustomDate(null);
                                            }}
                                            style={{ marginLeft: 8, width: 100 }}
                                        />
                                    </div>
                                    <Text type="secondary">{tc("labels.orSelectSpecificDate")}</Text>
                                    <DatePicker
                                        value={customDate}
                                        onChange={(date) => setCustomDate(date)}
                                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                                        style={{ width: "100%" }}
                                    />
                                </Space>
                            </div>
                        )}
                        <Alert
                            message={tc("labels.userWillBeBanned", { duration: getBanDurationLabel() })}
                            type="warning"
                            style={{ marginTop: 16 }}
                        />
                    </>
                )}
                {actionType === "delete" && (
                    <>
                        <Alert
                            message={tc("labels.warningDeleteAccount")}
                            description={
                                <>
                                    <p>{tc("labels.softDeletedAccount")}</p>
                                    <Space style={{ marginTop: 8 }}>
                                        <Avatar
                                            size={40}
                                            src={getMediaUrl(reportedUser?.userImage)}
                                            icon={<UserOutlined />}
                                        />
                                        <div>
                                            <Text strong>{reportedUser?.fullName || tc("labels.unknownUser")}</Text>
                                            <br />
                                            <Text type="secondary">{reportedUser?.email}</Text>
                                        </div>
                                    </Space>
                                </>
                            }
                            type="error"
                            showIcon
                        />
                    </>
                )}
            </Modal>
        </>
    );
};