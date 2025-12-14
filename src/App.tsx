import { Suspense } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { RefineThemes, ThemedLayout, ThemedSider, useNotificationProvider } from "@refinedev/antd";
import routerProvider, {
    DocumentTitleHandler,
    NavigateToResource,
    CatchAllNavigate,
    UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme, Layout, Space, Spin } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
    WarningOutlined,
    PhoneOutlined,
    FileImageOutlined,
    AuditOutlined,
    BellOutlined,
    SettingOutlined,
    MobileOutlined,
    GlobalOutlined,
    SmileOutlined,
    CloudUploadOutlined,
    ThunderboltOutlined,
    ExportOutlined,
} from "@ant-design/icons";
import "@refinedev/antd/dist/reset.css";
import { useTranslation } from "react-i18next";
import "./i18n";
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { i18nProvider } from "./providers/i18nProvider";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { ThemeToggle, LogoutButton, LanguageSwitcher } from "./components";
import {
    Login,
    Dashboard,
    UserList,
    UserShow,
    MessageList,
    MessageShow,
    RoomList,
    RoomShow,
    ReportList,
    ReportShow,
    CallList,
    CallShow,
    StoryList,
    StoryShow,
    AuditList,
    NotificationList,
    NotificationShow,
    DeviceList,
    DeviceShow,
    AppConfig,
    CountryList,
    StickerList,
    StickerShow,
    RealtimeLogs,
    DataExport,
    VersionList,
} from "./pages";

const { Header } = Layout;

const CustomHeader = () => {
    const { token } = theme.useToken();
    return (
        <Header
            style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 24px",
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                height: 48,
            }}
        >
            <Space>
                <LanguageSwitcher />
                <ThemeToggle />
                <LogoutButton />
            </Space>
        </Header>
    );
};

const AppContent = () => {
    const { isDark } = useTheme();
    const { t, i18n } = useTranslation("navigation");
    const isRTL = i18n.language === "ar";
    return (
        <ConfigProvider
            direction={isRTL ? "rtl" : "ltr"}
            theme={{
                ...RefineThemes.Blue,
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            }}
        >
            <AntdApp>
                <Refine
                    routerProvider={routerProvider}
                    authProvider={authProvider}
                    dataProvider={dataProvider}
                    notificationProvider={useNotificationProvider}
                    i18nProvider={i18nProvider}
                    resources={[
                        {
                            name: "dashboard",
                            list: "/",
                            meta: {
                                label: t("dashboard"),
                                icon: <DashboardOutlined />,
                            },
                        },
                        {
                            name: "admin/users",
                            list: "/users",
                            show: "/users/show/:id",
                            meta: {
                                label: t("users"),
                                icon: <UserOutlined />,
                            },
                        },
                        {
                            name: "admin/messages",
                            list: "/messages",
                            show: "/messages/show/:id",
                            meta: {
                                label: t("messages"),
                                icon: <MessageOutlined />,
                            },
                        },
                        {
                            name: "admin/rooms/groups",
                            list: "/rooms",
                            show: "/rooms/show/:id",
                            meta: {
                                label: t("rooms"),
                                icon: <TeamOutlined />,
                            },
                        },
                        {
                            name: "admin/reports",
                            list: "/reports",
                            show: "/reports/show/:id",
                            meta: {
                                label: t("reports"),
                                icon: <WarningOutlined />,
                            },
                        },
                        {
                            name: "admin/calls",
                            list: "/calls",
                            show: "/calls/show/:id",
                            meta: {
                                label: t("calls"),
                                icon: <PhoneOutlined />,
                            },
                        },
                        {
                            name: "admin/stories",
                            list: "/stories",
                            show: "/stories/show/:id",
                            meta: {
                                label: t("stories"),
                                icon: <FileImageOutlined />,
                            },
                        },
                        {
                            name: "admin/audit",
                            list: "/audit",
                            meta: {
                                label: t("auditLogs"),
                                icon: <AuditOutlined />,
                            },
                        },
                        {
                            name: "realtime-logs",
                            list: "/realtime-logs",
                            meta: {
                                label: t("realtimeLogs"),
                                icon: <ThunderboltOutlined />,
                            },
                        },
                        {
                            name: "admin/notifications",
                            list: "/notifications",
                            show: "/notifications/show/:id",
                            meta: {
                                label: t("notifications"),
                                icon: <BellOutlined />,
                            },
                        },
                        {
                            name: "admin/devices",
                            list: "/devices",
                            show: "/devices/show/:id",
                            meta: {
                                label: t("devices"),
                                icon: <MobileOutlined />,
                            },
                        },
                        {
                            name: "admin/config/countries",
                            list: "/countries",
                            meta: {
                                label: t("countries"),
                                icon: <GlobalOutlined />,
                            },
                        },
                        {
                            name: "admin/config/stickers/packs",
                            list: "/stickers",
                            show: "/stickers/show/:id",
                            meta: {
                                label: t("stickers"),
                                icon: <SmileOutlined />,
                            },
                        },
                        {
                            name: "admin/config/app",
                            list: "/config",
                            meta: {
                                label: t("appConfig"),
                                icon: <SettingOutlined />,
                            },
                        },
                        {
                            name: "admin/export",
                            list: "/export",
                            meta: {
                                label: t("dataExport"),
                                icon: <ExportOutlined />,
                            },
                        },
                        {
                            name: "admin/config/versions",
                            list: "/versions",
                            meta: {
                                label: t("appVersions"),
                                icon: <CloudUploadOutlined />,
                            },
                        },
                    ]}
                    options={{
                        syncWithLocation: false,
                        warnWhenUnsavedChanges: true,
                        projectId: "super-up-admin",
                    }}
                >
                    <Routes>
                        <Route
                            element={
                                <Authenticated
                                    key="authenticated-routes"
                                    fallback={<CatchAllNavigate to="/login" />}
                                >
                                    <ThemedLayout
                                        Header={CustomHeader}
                                        Sider={() => (
                                            <ThemedSider
                                                Title={() => (
                                                    <div style={{ padding: "12px", fontWeight: "bold", fontSize: 16 }}>
                                                        Super Up Admin
                                                    </div>
                                                )}
                                                render={({ items, logout }) => items}
                                            />
                                        )}
                                    >
                                        <Outlet />
                                    </ThemedLayout>
                                </Authenticated>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="/users">
                                <Route index element={<UserList />} />
                                <Route path="show/:id" element={<UserShow />} />
                            </Route>
                            <Route path="/messages">
                                <Route index element={<MessageList />} />
                                <Route path="show/:id" element={<MessageShow />} />
                            </Route>
                            <Route path="/rooms">
                                <Route index element={<RoomList />} />
                                <Route path="show/:id" element={<RoomShow />} />
                            </Route>
                            <Route path="/reports">
                                <Route index element={<ReportList />} />
                                <Route path="show/:id" element={<ReportShow />} />
                            </Route>
                            <Route path="/calls">
                                <Route index element={<CallList />} />
                                <Route path="show/:id" element={<CallShow />} />
                            </Route>
                            <Route path="/stories">
                                <Route index element={<StoryList />} />
                                <Route path="show/:id" element={<StoryShow />} />
                            </Route>
                            <Route path="/audit" element={<AuditList />} />
                            <Route path="/realtime-logs" element={<RealtimeLogs />} />
                            <Route path="/notifications">
                                <Route index element={<NotificationList />} />
                                <Route path="show/:id" element={<NotificationShow />} />
                            </Route>
                            <Route path="/devices">
                                <Route index element={<DeviceList />} />
                                <Route path="show/:id" element={<DeviceShow />} />
                            </Route>
                            <Route path="/countries" element={<CountryList />} />
                            <Route path="/stickers">
                                <Route index element={<StickerList />} />
                                <Route path="show/:id" element={<StickerShow />} />
                            </Route>
                            <Route path="/config" element={<AppConfig />} />
                            <Route path="/export" element={<DataExport />} />
                            <Route path="/versions" element={<VersionList />} />
                            <Route path="*" element={<NavigateToResource resource="dashboard" />} />
                        </Route>
                        <Route
                            element={
                                <Authenticated key="auth-pages" fallback={<Outlet />}>
                                    <NavigateToResource resource="dashboard" />
                                </Authenticated>
                            }
                        >
                            <Route path="/login" element={<Login />} />
                        </Route>
                    </Routes>
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                </Refine>
            </AntdApp>
        </ConfigProvider>
    );
};

const LoadingFallback = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
    </div>
);

const App = () => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <Suspense fallback={<LoadingFallback />}>
                    <AppContent />
                </Suspense>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
