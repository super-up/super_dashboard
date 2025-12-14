import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { Table, Tag, Space, Button } from "antd";
import { useNotification } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../providers/dataProvider";
import { API_URL } from "../../config/api";

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

export const ReportList = () => {
    const { t } = useTranslation("reports");
    const { t: tc } = useTranslation("common");
    const { tableProps, tableQuery } = useTable({
        resource: "admin/reports",
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
    const handleStatusChange = async (id: string, status: string) => {
        try {
            await axiosInstance.patch(`${API_URL}/admin/reports`, {
                reportIds: [id],
                updates: { status },
            });
            notify?.({ type: "success", message: status === "approved" ? tc("messages.reportApproved") : tc("messages.reportRejected") });
            tableQuery.refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || tc("messages.failedToUpdate") });
        }
    };
    const getReasonLabel = (reason: string | undefined): string => {
        if (!reason) return "-";
        const key = `reasons.${reason.replace(/_/g, "")}` as const;
        const translated = t(key);
        return translated !== key ? translated : reason;
    };
    return (
        <List>
            <Table {...tableProps} rowKey="_id">
                <Table.Column title={tc("table.id")} dataIndex="_id" width={180} ellipsis />
                <Table.Column
                    title={tc("table.type")}
                    dataIndex="type"
                    render={(value) => {
                        const normalized = normalizeReportType(value);
                        const colors: Record<string, string> = {
                            user: "blue",
                            chat: "purple",
                            message: "cyan",
                        };
                        const key = `types.${normalized}` as const;
                        return <Tag color={colors[normalized] || "default"}>{t(key) || normalized}</Tag>;
                    }}
                />
                <Table.Column
                    title={tc("table.reason")}
                    dataIndex="reasonType"
                    ellipsis
                    width={200}
                    render={(value) => {
                        if (!value) return <Tag color="default">-</Tag>;
                        return <Tag color="volcano">{getReasonLabel(value)}</Tag>;
                    }}
                />
                <Table.Column
                    title={tc("table.status")}
                    dataIndex="status"
                    render={(value) => {
                        const colors: Record<string, string> = {
                            pending: "orange",
                            approved: "green",
                            rejected: "red",
                        };
                        return <Tag color={colors[value] || "default"}>{tc(`status.${value}`) || value}</Tag>;
                    }}
                />
                <Table.Column title={tc("table.reporter")} dataIndex={["uId", "fullName"]} />
                <Table.Column
                    title={tc("table.reportedUser")}
                    render={(_, record: any) => {
                        const user = record.userId || record.targetId;
                        return user?.fullName || "-";
                    }}
                />
                <Table.Column
                    title={tc("table.created")}
                    dataIndex="createdAt"
                    render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
                />
                <Table.Column
                    title={tc("table.actions")}
                    render={(_, record: any) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record._id} />
                            {record.status === "pending" && (
                                <>
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => handleStatusChange(record._id, "approved")}
                                    >
                                        {tc("actions.approve")}
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        onClick={() => handleStatusChange(record._id, "rejected")}
                                    >
                                        {tc("actions.reject")}
                                    </Button>
                                </>
                            )}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
