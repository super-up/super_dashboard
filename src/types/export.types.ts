import type { ReactNode } from "react";
import {
    UserOutlined,
    MessageOutlined,
    WarningOutlined,
    AuditOutlined,
    FileImageOutlined,
    PhoneOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import { createElement } from "react";

export type ExportFormat = "json" | "csv";

export type ExportType =
    | "users"
    | "messages"
    | "reports"
    | "audit-logs"
    | "stories"
    | "calls"
    | "analytics";

export interface ExportConfig {
    key: ExportType;
    label: string;
    endpoint: string;
    icon: ReactNode;
    defaultLimit: number;
    maxLimit: number;
    description: string;
    hasLimit: boolean;
}

export const EXPORT_CONFIGS: ExportConfig[] = [
    {
        key: "users",
        label: "Users",
        endpoint: "admin/export/users",
        icon: createElement(UserOutlined),
        defaultLimit: 10000,
        maxLimit: 50000,
        description: "Export user profiles and account data",
        hasLimit: true,
    },
    {
        key: "messages",
        label: "Messages",
        endpoint: "admin/export/messages",
        icon: createElement(MessageOutlined),
        defaultLimit: 10000,
        maxLimit: 50000,
        description: "Export chat messages and content",
        hasLimit: true,
    },
    {
        key: "reports",
        label: "Reports",
        endpoint: "admin/export/reports",
        icon: createElement(WarningOutlined),
        defaultLimit: 5000,
        maxLimit: 20000,
        description: "Export user reports and complaints",
        hasLimit: true,
    },
    {
        key: "audit-logs",
        label: "Audit Logs",
        endpoint: "admin/export/audit-logs",
        icon: createElement(AuditOutlined),
        defaultLimit: 10000,
        maxLimit: 50000,
        description: "Export admin activity logs",
        hasLimit: true,
    },
    {
        key: "stories",
        label: "Stories",
        endpoint: "admin/export/stories",
        icon: createElement(FileImageOutlined),
        defaultLimit: 5000,
        maxLimit: 20000,
        description: "Export user stories metadata",
        hasLimit: true,
    },
    {
        key: "calls",
        label: "Calls",
        endpoint: "admin/export/calls",
        icon: createElement(PhoneOutlined),
        defaultLimit: 5000,
        maxLimit: 20000,
        description: "Export call history and metadata",
        hasLimit: true,
    },
    {
        key: "analytics",
        label: "Analytics",
        endpoint: "admin/export/analytics",
        icon: createElement(BarChartOutlined),
        defaultLimit: 0,
        maxLimit: 0,
        description: "Export aggregated analytics report",
        hasLimit: false,
    },
];

export const FORMAT_OPTIONS = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
];

export const formatNumber = (num: number): string => {
    return num.toLocaleString();
};
