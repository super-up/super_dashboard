import { useState, useEffect } from "react";
import { useCustom, useNotification } from "@refinedev/core";
import {
    Typography,
    Card,
    Form,
    Input,
    InputNumber,
    Switch,
    Select,
    Button,
    Row,
    Col,
    Spin,
    Divider,
    Space,
    Popconfirm,
    Collapse,
    Tag,
    Tooltip,
    Alert,
} from "antd";
import {
    SaveOutlined,
    ReloadOutlined,
    SettingOutlined,
    GlobalOutlined,
    MessageOutlined,
    PhoneOutlined,
    TeamOutlined,
    AppstoreOutlined,
    LinkOutlined,
    UserOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../providers/dataProvider";
import { API_URL } from "../../config/api";
import type { IAppConfig, UpdateAppConfigDto } from "../../types/config.types";
import { RegisterStatus, REGISTER_STATUS_OPTIONS, formatBytes, formatMilliseconds } from "../../types/config.types";

const { Title, Text } = Typography;

export const AppConfig = () => {
    const { t } = useTranslation("config");
    const { t: tc } = useTranslation("common");
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const { open } = useNotification();
    const { query: configQuery } = useCustom<IAppConfig>({
        url: "admin/config/app",
        method: "get",
    });
    const config = configQuery.data?.data;
    const isLoading = configQuery.isLoading;
    useEffect(() => {
        if (config) {
            form.setFieldsValue({
                ...config,
                maxChatMediaSizeMB: Math.round(config.maxChatMediaSize / (1024 * 1024)),
                callTimeoutSeconds: Math.round(config.callTimeout / 1000),
            });
        }
    }, [config, form]);
    const handleSave = async (values: Record<string, unknown>) => {
        setSaving(true);
        try {
            const payload: UpdateAppConfigDto = {
                appName: values.appName as string,
                enableAds: values.enableAds as boolean,
                feedbackEmail: values.feedbackEmail as string,
                allowWebLogin: values.allowWebLogin as boolean,
                allowMobileLogin: values.allowMobileLogin as boolean,
                allowDesktopLogin: values.allowDesktopLogin as boolean,
                allowCreateGroup: values.allowCreateGroup as boolean,
                allowCreateBroadcast: values.allowCreateBroadcast as boolean,
                allowMessaging: values.allowMessaging as boolean,
                allowSendMedia: values.allowSendMedia as boolean,
                allowCall: values.allowCall as boolean,
                privacyUrl: values.privacyUrl as string,
                googlePayUrl: values.googlePayUrl as string || null,
                webChatUrl: values.webChatUrl as string || null,
                windowsStoreUrl: values.windowsStoreUrl as string || null,
                macStoreUrl: values.macStoreUrl as string || null,
                appleStoreUrl: values.appleStoreUrl as string || null,
                maxExpireEmailTime: values.maxExpireEmailTime as number,
                userRegisterStatus: values.userRegisterStatus as RegisterStatus,
                callTimeout: (values.callTimeoutSeconds as number) * 1000,
                maxGroupMembers: values.maxGroupMembers as number,
                maxBroadcastMembers: values.maxBroadcastMembers as number,
                maxChatMediaSize: (values.maxChatMediaSizeMB as number) * 1024 * 1024,
                maxForward: values.maxForward as number,
                roomIcons: values.roomIcons as IAppConfig["roomIcons"],
                groupIcon: values.groupIcon as string,
                supportIcon: values.supportIcon as string,
                broadcastIcon: values.broadcastIcon as string,
                userIcon: values.userIcon as string,
            };
            await axiosInstance.patch(`${API_URL}/admin/config/app`, payload);
            open?.({
                type: "success",
                message: t("messages.configUpdated"),
                description: t("messages.configUpdatedDesc"),
            });
            configQuery.refetch();
        } catch (error) {
            open?.({
                type: "error",
                message: t("messages.updateFailed"),
                description: t("messages.updateFailedDesc"),
            });
        } finally {
            setSaving(false);
        }
    };
    const handleReset = async () => {
        setResetting(true);
        try {
            await axiosInstance.post(`${API_URL}/admin/config/app/reset`);
            open?.({
                type: "success",
                message: t("messages.configReset"),
                description: t("messages.configResetDesc"),
            });
            configQuery.refetch();
        } catch (error) {
            open?.({
                type: "error",
                message: t("messages.resetFailed"),
                description: t("messages.resetFailedDesc"),
            });
        } finally {
            setResetting(false);
        }
    };
    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }
    return (
        <div style={{ padding: "0 0 24px 0" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                    flexWrap: "wrap",
                    gap: 16,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        <SettingOutlined style={{ marginRight: 8 }} />
                        {t("title")}
                    </Title>
                    <Text type="secondary">
                        {t("subtitle")}
                        {config?.configVersion && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                v{config.configVersion}
                            </Tag>
                        )}
                    </Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined spin={configQuery.isRefetching} />}
                        onClick={() => configQuery.refetch()}
                        disabled={configQuery.isRefetching}
                    >
                        {t("actions.refresh")}
                    </Button>
                    <Popconfirm
                        title={t("confirmations.resetTitle")}
                        description={t("confirmations.resetDescription")}
                        onConfirm={handleReset}
                        okText={t("confirmations.reset")}
                        okButtonProps={{ danger: true }}
                        cancelText={tc("actions.cancel")}
                        icon={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                    >
                        <Button danger icon={<UndoOutlined />} loading={resetting}>
                            {t("actions.resetToDefaults")}
                        </Button>
                    </Popconfirm>
                </Space>
            </div>
            {config?.backendVersion && (
                <Alert
                    message={`${t("messages.backendVersion")}: ${config.backendVersion}`}
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 16 }}
                />
            )}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={config}
            >
                <Collapse
                    defaultActiveKey={["general", "features", "limits", "urls", "icons"]}
                    style={{ marginBottom: 24 }}
                    items={[
                        {
                            key: "general",
                            label: (
                                <span>
                                    <AppstoreOutlined style={{ marginRight: 8 }} />
                                    {t("sections.general")}
                                </span>
                            ),
                            children: (
                                <Row gutter={[24, 0]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="appName"
                                            label={t("fields.appName")}
                                            rules={[{ required: true, message: t("validation.appNameRequired") }]}
                                        >
                                            <Input placeholder="Super Up" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="feedbackEmail"
                                            label={t("fields.feedbackEmail")}
                                            rules={[
                                                { required: true, message: t("validation.emailRequired") },
                                                { type: "email", message: t("validation.invalidEmail") },
                                            ]}
                                        >
                                            <Input placeholder="support@example.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="userRegisterStatus"
                                            label={
                                                <span>
                                                    {t("fields.userRegisterStatus")}
                                                    <Tooltip title={t("fields.userRegisterStatusTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                        >
                                            <Select options={REGISTER_STATUS_OPTIONS} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="maxExpireEmailTime"
                                            label={
                                                <span>
                                                    {t("fields.emailCodeExpiry")}
                                                    <Tooltip title={t("fields.emailCodeExpiryTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber min={1} max={60} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="enableAds"
                                            label={t("fields.enableAds")}
                                            valuePropName="checked"
                                        >
                                            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "features",
                            label: (
                                <span>
                                    <MessageOutlined style={{ marginRight: 8 }} />
                                    {t("sections.features")}
                                </span>
                            ),
                            children: (
                                <>
                                    <Divider orientation="left" plain>
                                        <GlobalOutlined style={{ marginRight: 4 }} />
                                        {t("subsections.platformLogin")}
                                    </Divider>
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowMobileLogin"
                                                label={t("fields.mobileLogin")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowWebLogin"
                                                label={t("fields.webLogin")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowDesktopLogin"
                                                label={t("fields.desktopLogin")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider orientation="left" plain>
                                        <TeamOutlined style={{ marginRight: 4 }} />
                                        {t("subsections.chatFeatures")}
                                    </Divider>
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowMessaging"
                                                label={t("fields.messaging")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowSendMedia"
                                                label={t("fields.sendMedia")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name="allowCall"
                                                label={
                                                    <span>
                                                        <PhoneOutlined style={{ marginRight: 4 }} />
                                                        {t("fields.voiceVideoCalls")}
                                                    </span>
                                                }
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="allowCreateGroup"
                                                label={t("fields.createGroups")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="allowCreateBroadcast"
                                                label={t("fields.createBroadcasts")}
                                                valuePropName="checked"
                                            >
                                                <Switch checkedChildren={tc("status.enabled")} unCheckedChildren={tc("status.disabled")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                        {
                            key: "limits",
                            label: (
                                <span>
                                    <SettingOutlined style={{ marginRight: 8 }} />
                                    {t("sections.limits")}
                                </span>
                            ),
                            children: (
                                <Row gutter={[24, 0]}>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name="maxGroupMembers"
                                            label={
                                                <span>
                                                    {t("fields.maxGroupMembers")}
                                                    <Tooltip title={t("fields.maxGroupMembersTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber min={2} max={10000} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name="maxBroadcastMembers"
                                            label={
                                                <span>
                                                    {t("fields.maxBroadcastRecipients")}
                                                    <Tooltip title={t("fields.maxBroadcastRecipientsTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber min={1} max={10000} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name="maxForward"
                                            label={
                                                <span>
                                                    {t("fields.maxForwards")}
                                                    <Tooltip title={t("fields.maxForwardsTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber min={1} max={100} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name="maxChatMediaSizeMB"
                                            label={
                                                <span>
                                                    {t("fields.maxMediaSize")}
                                                    <Tooltip title={t("fields.maxMediaSizeTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                            extra={
                                                config?.maxChatMediaSize
                                                    ? `${t("current")}: ${formatBytes(config.maxChatMediaSize)}`
                                                    : undefined
                                            }
                                        >
                                            <InputNumber min={1} max={500} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name="callTimeoutSeconds"
                                            label={
                                                <span>
                                                    {t("fields.callTimeout")}
                                                    <Tooltip title={t("fields.callTimeoutTooltip")}>
                                                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            rules={[{ required: true }]}
                                            extra={
                                                config?.callTimeout
                                                    ? `${t("current")}: ${formatMilliseconds(config.callTimeout)}`
                                                    : undefined
                                            }
                                        >
                                            <InputNumber min={10} max={300} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "urls",
                            label: (
                                <span>
                                    <LinkOutlined style={{ marginRight: 8 }} />
                                    {t("sections.urls")}
                                </span>
                            ),
                            children: (
                                <Row gutter={[24, 0]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="privacyUrl"
                                            label={t("fields.privacyUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://example.com/privacy" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="webChatUrl"
                                            label={t("fields.webChatUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://chat.example.com" />
                                        </Form.Item>
                                    </Col>
                                    <Divider orientation="left" plain>
                                        {t("subsections.appStoreLinks")}
                                    </Divider>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="appleStoreUrl"
                                            label={t("fields.appleStoreUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://apps.apple.com/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="googlePayUrl"
                                            label={t("fields.googlePlayUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://play.google.com/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="macStoreUrl"
                                            label={t("fields.macStoreUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://apps.apple.com/..." />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="windowsStoreUrl"
                                            label={t("fields.windowsStoreUrl")}
                                            rules={[{ type: "url", message: t("validation.invalidUrl") }]}
                                        >
                                            <Input placeholder="https://microsoft.com/..." />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "icons",
                            label: (
                                <span>
                                    <UserOutlined style={{ marginRight: 8 }} />
                                    {t("sections.icons")}
                                </span>
                            ),
                            children: (
                                <>
                                    <Divider orientation="left" plain>
                                        {t("subsections.roomEmojis")}
                                    </Divider>
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["roomIcons", "group"]}
                                                label={t("fields.groupIcon")}
                                            >
                                                <Input placeholder="👥" style={{ fontSize: 20 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["roomIcons", "broadcast"]}
                                                label={t("fields.broadcastIcon")}
                                            >
                                                <Input placeholder="📢" style={{ fontSize: 20 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item
                                                name={["roomIcons", "order"]}
                                                label={t("fields.orderIcon")}
                                            >
                                                <Input placeholder="💬" style={{ fontSize: 20 }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider orientation="left" plain>
                                        {t("subsections.defaultImages")}
                                    </Divider>
                                    <Row gutter={[24, 0]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="userIcon" label={t("fields.defaultUserImage")}>
                                                <Input placeholder="default_user_image.png" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="groupIcon" label={t("fields.defaultGroupImage")}>
                                                <Input placeholder="default_group_image.png" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="broadcastIcon" label={t("fields.defaultBroadcastImage")}>
                                                <Input placeholder="default_broadcast_image.png" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="supportIcon" label={t("fields.defaultSupportImage")}>
                                                <Input placeholder="default_support_image.png" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                    ]}
                />
                <Card>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <Button
                            onClick={() => {
                                if (config) {
                                    form.setFieldsValue({
                                        ...config,
                                        maxChatMediaSizeMB: Math.round(config.maxChatMediaSize / (1024 * 1024)),
                                        callTimeoutSeconds: Math.round(config.callTimeout / 1000),
                                    });
                                }
                            }}
                        >
                            {t("actions.discardChanges")}
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={saving}
                        >
                            {t("actions.saveConfiguration")}
                        </Button>
                    </div>
                </Card>
            </Form>
        </div>
    );
};
