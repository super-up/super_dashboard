import { useState } from "react";
import { useNotification } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
    Typography,
    Card,
    Row,
    Col,
    Select,
    InputNumber,
    Button,
    DatePicker,
    Space,
    Tooltip,
    theme,
} from "antd";
import { ExportOutlined, DownloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../providers/dataProvider";
import { API_URL } from "../../config/api";
import {
    EXPORT_CONFIGS,
    FORMAT_OPTIONS,
    formatNumber,
    type ExportFormat,
    type ExportType,
    type ExportConfig,
} from "../../types/export.types";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ExportState {
    format: ExportFormat;
    limit: number;
    dateRange: [Dayjs | null, Dayjs | null] | null;
    loading: boolean;
}

type ExportStates = Record<ExportType, ExportState>;

const createInitialState = (): ExportStates => {
    const states: Partial<ExportStates> = {};
    EXPORT_CONFIGS.forEach((config) => {
        states[config.key] = {
            format: "json",
            limit: config.defaultLimit,
            dateRange: null,
            loading: false,
        };
    });
    return states as ExportStates;
};

export const DataExport = () => {
    const { t } = useTranslation("export");
    const { token } = theme.useToken();
    const { open } = useNotification();
    const [exportStates, setExportStates] = useState<ExportStates>(createInitialState);
    const updateState = (key: ExportType, updates: Partial<ExportState>) => {
        setExportStates((prev) => ({
            ...prev,
            [key]: { ...prev[key], ...updates },
        }));
    };
    const getLabel = (key: ExportType): string => t(`types.${key}.label`);
    const getDescription = (key: ExportType): string => t(`types.${key}.description`);
    const handleExport = async (config: ExportConfig) => {
        const state = exportStates[config.key];
        const label = getLabel(config.key);
        updateState(config.key, { loading: true });
        try {
            const params = new URLSearchParams();
            params.append("format", state.format);
            if (config.hasLimit && state.limit > 0) {
                params.append("limit", state.limit.toString());
            }
            if (state.dateRange?.[0]) {
                params.append("fromDate", state.dateRange[0].toISOString());
            }
            if (state.dateRange?.[1]) {
                params.append("toDate", state.dateRange[1].toISOString());
            }
            const response = await axiosInstance.get(
                `${API_URL}/${config.endpoint}?${params.toString()}`,
                { responseType: "blob" }
            );
            const contentType = state.format === "json" ? "application/json" : "text/csv";
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${config.key}_export_${Date.now()}.${state.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            open?.({
                type: "success",
                message: t("messages.exportSuccess"),
                description: t("messages.exportSuccessDesc", { label, format: state.format.toUpperCase() }),
            });
        } catch (error) {
            open?.({
                type: "error",
                message: t("messages.exportFailed"),
                description: t("messages.exportFailedDesc", { label: label.toLowerCase() }),
            });
        } finally {
            updateState(config.key, { loading: false });
        }
    };
    const renderExportCard = (config: ExportConfig) => {
        const state = exportStates[config.key];
        const label = getLabel(config.key);
        const description = getDescription(config.key);
        return (
            <Col xs={24} lg={12} key={config.key}>
                <Card
                    title={
                        <Space>
                            {config.icon}
                            <span>{label}</span>
                        </Space>
                    }
                    style={{ height: "100%" }}
                    styles={{
                        body: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        },
                    }}
                >
                    <Text type="secondary">{description}</Text>
                    <div>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            {t("fields.dateRange")}
                        </Text>
                        <RangePicker
                            style={{ width: "100%" }}
                            value={state.dateRange}
                            onChange={(dates) => updateState(config.key, { dateRange: dates })}
                            allowClear
                        />
                    </div>
                    <Row gutter={16}>
                        <Col span={config.hasLimit ? 12 : 24}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                {t("fields.format")}
                            </Text>
                            <Select
                                style={{ width: "100%" }}
                                value={state.format}
                                onChange={(value) => updateState(config.key, { format: value })}
                                options={FORMAT_OPTIONS}
                            />
                        </Col>
                        {config.hasLimit && (
                            <Col span={12}>
                                <Text strong style={{ display: "block", marginBottom: 8 }}>
                                    {t("fields.limit")}{" "}
                                    <Tooltip title={t("fields.maxLimit", { max: formatNumber(config.maxLimit) })}>
                                        <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                                    </Tooltip>
                                </Text>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    value={state.limit}
                                    onChange={(value) => updateState(config.key, { limit: value || config.defaultLimit })}
                                    min={1}
                                    max={config.maxLimit}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                                />
                            </Col>
                        )}
                    </Row>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={state.loading}
                        onClick={() => handleExport(config)}
                        style={{ marginTop: "auto" }}
                    >
                        {t("actions.export", { label })}
                    </Button>
                </Card>
            </Col>
        );
    };
    const regularExports = EXPORT_CONFIGS.filter((c) => c.key !== "analytics");
    const analyticsConfig = EXPORT_CONFIGS.find((c) => c.key === "analytics")!;
    const analyticsState = exportStates["analytics"];
    const analyticsLabel = getLabel("analytics");
    const analyticsDescription = getDescription("analytics");
    return (
        <div style={{ padding: "0 0 24px 0" }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <ExportOutlined style={{ marginRight: 8 }} />
                    {t("title")}
                </Title>
                <Text type="secondary">
                    {t("subtitle")}
                </Text>
            </div>
            <Row gutter={[16, 16]}>
                {regularExports.map(renderExportCard)}
            </Row>
            <Card
                title={
                    <Space>
                        {analyticsConfig.icon}
                        <span>{analyticsLabel}</span>
                    </Space>
                }
                style={{ marginTop: 16 }}
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    {analyticsDescription}
                </Text>
                <Row gutter={16} align="bottom">
                    <Col xs={24} sm={10}>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            {t("fields.dateRange")}
                        </Text>
                        <RangePicker
                            style={{ width: "100%" }}
                            value={analyticsState.dateRange}
                            onChange={(dates) => updateState("analytics", { dateRange: dates })}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            {t("fields.format")}
                        </Text>
                        <Select
                            style={{ width: "100%" }}
                            value={analyticsState.format}
                            onChange={(value) => updateState("analytics", { format: value })}
                            options={FORMAT_OPTIONS}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            loading={analyticsState.loading}
                            onClick={() => handleExport(analyticsConfig)}
                            style={{ width: "100%" }}
                        >
                            {t("actions.export", { label: analyticsLabel })}
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};
