import { List, useTable, DateField } from "@refinedev/antd";
import { Table, Tag } from "antd";
import { useTranslation } from "react-i18next";

export const AuditList = () => {
    const { t } = useTranslation("audit");
    const { tableProps } = useTable({
        resource: "admin/audit",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });

    return (
        <List title={t("title")}>
            <Table {...tableProps} rowKey="_id">
                <Table.Column title={t("columns.id")} dataIndex="_id" width={180} ellipsis />
                <Table.Column
                    title={t("columns.action")}
                    dataIndex="action"
                    render={(value) => {
                        const colors: Record<string, string> = {
                            CREATE: "green",
                            UPDATE: "blue",
                            DELETE: "red",
                            LOGIN: "purple",
                            LOGOUT: "orange",
                        };
                        return <Tag color={colors[value?.split("_")[0]] || "default"}>{value}</Tag>;
                    }}
                />
                <Table.Column
                    title={t("columns.targetType")}
                    dataIndex="targetType"
                    render={(value) => <Tag>{value}</Tag>}
                />
                <Table.Column title={t("columns.targetId")} dataIndex="targetId" ellipsis width={180} />
                <Table.Column title={t("columns.admin")} dataIndex="adminEmail" />
                <Table.Column title={t("columns.ipAddress")} dataIndex="ipAddress" />
                <Table.Column
                    title={t("columns.timestamp")}
                    dataIndex="createdAt"
                    render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm:ss" />}
                />
            </Table>
        </List>
    );
};
