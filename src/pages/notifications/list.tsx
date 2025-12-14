import { useState } from "react";
import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { useCreate } from "@refinedev/core";
import { Table, Tag, Button, Modal, Form, Input, message, Space } from "antd";
import { useTranslation } from "react-i18next";

export const NotificationList = () => {
    const { t } = useTranslation("notifications");
    const { tableProps } = useTable({
        resource: "admin/notifications",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { mutate, mutation } = useCreate();
    const handleSendAll = () => {
        form.validateFields().then((values) => {
            mutate(
                {
                    resource: "admin/notifications/send-all",
                    values,
                },
                {
                    onSuccess: () => {
                        message.success(t("list.messages.sendSuccess"));
                        setIsModalOpen(false);
                        form.resetFields();
                    },
                }
            );
        });
    };
    return (
        <List
            headerButtons={
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    {t("list.sendToAll")}
                </Button>
            }
        >
            <Table {...tableProps} rowKey="_id">
                <Table.Column title={t("list.columns.title")} dataIndex="title" ellipsis width={200} />
                <Table.Column title={t("list.columns.content")} dataIndex="content" ellipsis width={300} />
                <Table.Column
                    title={t("list.columns.image")}
                    dataIndex="imageUrl"
                    width={80}
                    render={(value) => value ? <Tag color="green">{t("list.hasImage.yes")}</Tag> : <Tag color="default">{t("list.hasImage.no")}</Tag>}
                />
                <Table.Column
                    title={t("list.columns.created")}
                    dataIndex="createdAt"
                    render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
                    width={150}
                />
                <Table.Column
                    title={t("list.columns.actions")}
                    render={(_, record: { _id: string }) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record._id} />
                        </Space>
                    )}
                    width={80}
                />
            </Table>
            <Modal
                title={t("list.modal.title")}
                open={isModalOpen}
                onOk={handleSendAll}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={mutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label={t("list.modal.form.title")} rules={[{ required: true }]}>
                        <Input placeholder={t("list.modal.form.titlePlaceholder")} />
                    </Form.Item>
                    <Form.Item name="content" label={t("list.modal.form.content")} rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder={t("list.modal.form.contentPlaceholder")} />
                    </Form.Item>
                    <Form.Item name="imageUrl" label={t("list.modal.form.imageUrl")}>
                        <Input placeholder={t("list.modal.form.imageUrlPlaceholder")} />
                    </Form.Item>
                </Form>
            </Modal>
        </List>
    );
};
