import { useState } from "react";
import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { useCreate, useCustom } from "@refinedev/core";
import { Table, Tag, Button, Modal, Form, Input, message, Space, Select, Checkbox, Row, Col, Card, Statistic } from "antd";
import { MessageOutlined, ClockCircleOutlined, SendOutlined, PercentageOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const jobStatusColors: Record<string, string> = {
    pending: "default",
    processing: "processing",
    completed: "success",
    failed: "error",
};

const PLATFORMS = ["android", "ios", "web", "mac", "windows"];

export const NotificationList = () => {
    const { t } = useTranslation("notifications");
    const navigate = useNavigate();
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
    const { query: statsQuery } = useCustom({
        url: "admin/notifications/stats",
        method: "get",
    });
    const stats = (statsQuery?.data as any)?.data?.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTargetedModalOpen, setIsTargetedModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [targetedForm] = Form.useForm();
    const targetType = Form.useWatch("targetType", targetedForm);
    const { mutate, mutation } = useCreate();
    const { mutate: mutateTargeted, mutation: targetedMutation } = useCreate();
    const handleSendAll = () => {
        form.validateFields().then((values) => {
            mutate(
                {
                    resource: "admin/notifications/send-all",
                    values,
                },
                {
                    onSuccess: (data) => {
                        const count = (data as any)?.data?.estimatedUsers || 0;
                        message.success(t("list.messages.sendSuccess", { count }));
                        setIsModalOpen(false);
                        form.resetFields();
                    },
                }
            );
        });
    };
    const handleSendTargeted = () => {
        targetedForm.validateFields().then((values) => {
            const payload: any = {
                title: values.title,
                content: values.content,
                imageUrl: values.imageUrl,
                targetType: values.targetType,
            };
            if (values.targetType === "platform") {
                payload.platforms = values.platforms;
            } else if (values.targetType === "country") {
                payload.countryIds = values.countryIds?.split(",").map((s: string) => s.trim()).filter(Boolean);
            } else if (values.targetType === "users") {
                payload.userIds = values.userIds?.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
            mutateTargeted(
                {
                    resource: "admin/notifications/send-targeted",
                    values: payload,
                },
                {
                    onSuccess: (data) => {
                        const count = (data as any)?.data?.estimatedUsers || 0;
                        message.success(t("list.messages.targetedSuccess", { count }));
                        setIsTargetedModalOpen(false);
                        targetedForm.resetFields();
                    },
                }
            );
        });
    };
    return (
        <List
            headerButtons={
                <Space>
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        {t("list.sendToAll")}
                    </Button>
                    <Button onClick={() => setIsTargetedModalOpen(true)}>
                        {t("list.sendTargeted")}
                    </Button>
                </Space>
            }
        >
            {stats && (
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={12} sm={6}>
                        <Card size="small">
                            <Statistic title={t("stats.totalNotifications")} value={stats.totalNotifications || 0} prefix={<SendOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small">
                            <Statistic title={t("stats.chatMessages")} value={stats.chatMessages || 0} prefix={<MessageOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small">
                            <Statistic title={t("stats.last24h")} value={stats.last24h || 0} prefix={<ClockCircleOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card size="small">
                            <Statistic title={t("stats.averageDeliveryRate")} value={stats.averageDeliveryRate || 0} suffix="%" prefix={<PercentageOutlined />} />
                        </Card>
                    </Col>
                </Row>
            )}
            <Table
                {...tableProps}
                rowKey="_id"
                scroll={{ x: 1000 }}
                onRow={(record) => ({
                    onClick: (e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('.ant-checkbox-wrapper') || target.closest('.ant-popover') || target.closest('.ant-btn')) {
                            return;
                        }
                        navigate(`/notifications/show/${record._id}`);
                    },
                    style: { cursor: 'pointer' },
                })}
            >
                <Table.Column title={t("list.columns.title")} dataIndex="title" ellipsis width={200} />
                <Table.Column title={t("list.columns.content")} dataIndex="content" ellipsis width={250} />
                <Table.Column
                    title={t("list.columns.deliveryType")}
                    dataIndex="deliveryType"
                    width={80}
                    render={(value) => (
                        <Tag color={value === "chat" ? "blue" : "orange"}>
                            {t(`list.deliveryType.${value || "chat"}`)}
                        </Tag>
                    )}
                />
                <Table.Column
                    title={t("list.columns.jobStatus")}
                    dataIndex="jobStatus"
                    width={100}
                    render={(value) => (
                        <Tag color={jobStatusColors[value] || "default"}>
                            {t(`list.jobStatus.${value || "pending"}`)}
                        </Tag>
                    )}
                />
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
            {/* Send to All Modal */}
            <Modal
                title={t("list.modal.title")}
                open={isModalOpen}
                onOk={handleSendAll}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={mutation.isPending}
                width="90%"
                style={{ maxWidth: 500 }}
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
            {/* Send Targeted Modal */}
            <Modal
                title={t("list.targetedModal.title")}
                open={isTargetedModalOpen}
                onOk={handleSendTargeted}
                onCancel={() => { setIsTargetedModalOpen(false); targetedForm.resetFields(); }}
                confirmLoading={targetedMutation.isPending}
                width="90%"
                style={{ maxWidth: 550 }}
            >
                <Form form={targetedForm} layout="vertical" initialValues={{ targetType: "all" }}>
                    <Form.Item name="targetType" label={t("list.targetedModal.form.targetType")} rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="all">{t("list.targetedModal.targetTypes.all")}</Select.Option>
                            <Select.Option value="platform">{t("list.targetedModal.targetTypes.platform")}</Select.Option>
                            <Select.Option value="country">{t("list.targetedModal.targetTypes.country")}</Select.Option>
                            <Select.Option value="users">{t("list.targetedModal.targetTypes.users")}</Select.Option>
                        </Select>
                    </Form.Item>
                    {targetType === "platform" && (
                        <Form.Item name="platforms" label={t("list.targetedModal.form.platforms")} rules={[{ required: true }]}>
                            <Checkbox.Group>
                                {PLATFORMS.map((p) => (
                                    <Checkbox key={p} value={p}>
                                        {t(`list.targetedModal.platforms.${p}`)}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </Form.Item>
                    )}
                    {targetType === "country" && (
                        <Form.Item name="countryIds" label={t("list.targetedModal.form.countryIds")} rules={[{ required: true }]}>
                            <Input.TextArea rows={2} placeholder={t("list.targetedModal.form.countryIdsPlaceholder")} />
                        </Form.Item>
                    )}
                    {targetType === "users" && (
                        <Form.Item name="userIds" label={t("list.targetedModal.form.userIds")} rules={[{ required: true }]}>
                            <Input.TextArea rows={3} placeholder={t("list.targetedModal.form.userIdsPlaceholder")} />
                        </Form.Item>
                    )}
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
