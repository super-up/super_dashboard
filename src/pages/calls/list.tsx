import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { useCustom } from "@refinedev/core";
import { Table, Tag, Space, Avatar, Typography, Tooltip, Card, Row, Col, Statistic } from "antd";
import { PhoneOutlined, VideoCameraOutlined, UserOutlined, ClockCircleOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getMediaUrl, API_URL } from "../../config/api";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const { Text } = Typography;

interface DurationStats {
    totalCalls: number;
    totalDuration: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
}

const formatMilliseconds = (ms: number | undefined): string => {
    if (!ms || ms <= 0) return "0s";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

export const CallList = () => {
    const { t } = useTranslation("calls");
    const { t: tc } = useTranslation("common");
    const { tableProps } = useTable({
        resource: "admin/calls",
        syncWithLocation: false,
        pagination: {
            mode: "server",
            pageSize: 20,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });
    const { query: statsQuery } = useCustom<{ data: DurationStats }>({
        url: "admin/calls/duration-stats",
        method: "get",
    });
    const statsLoading = statsQuery.isLoading;
    const durationStats = statsQuery.data?.data as DurationStats | undefined;
    const formatDuration = (seconds: number | undefined): string => {
        if (!seconds || seconds <= 0) return "-";
        const d = dayjs.duration(seconds, "seconds");
        const hours = Math.floor(d.asHours());
        const minutes = d.minutes();
        const secs = d.seconds();
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };
    const getStatusColor = (status: string | undefined): string => {
        if (!status) return "default";
        const colors: Record<string, string> = {
            ended: "green",
            completed: "green",
            missed: "red",
            rejected: "orange",
            cancelled: "orange",
            ongoing: "blue",
            ringing: "processing",
        };
        return colors[status?.toLowerCase()] || "default";
    };
    const getStatusLabel = (status: string | undefined): string => {
        if (!status) return tc("labels.unknown");
        const key = `status.${status.toLowerCase()}` as const;
        return t(key) || status.charAt(0).toUpperCase() + status.slice(1);
    };
    return (
        <List>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={statsLoading}>
                        <Statistic
                            title={t("stats.totalFinishedCalls")}
                            value={durationStats?.totalCalls || 0}
                            prefix={<PhoneOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={statsLoading}>
                        <Statistic
                            title={t("stats.averageDuration")}
                            value={formatMilliseconds(durationStats?.avgDuration)}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={statsLoading}>
                        <Statistic
                            title={t("stats.longestCall")}
                            value={formatMilliseconds(durationStats?.maxDuration)}
                            prefix={<FieldTimeOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={statsLoading}>
                        <Statistic
                            title={t("stats.shortestCall")}
                            value={formatMilliseconds(durationStats?.minDuration)}
                            prefix={<FieldTimeOutlined />}
                            valueStyle={{ color: "#cf1322" }}
                        />
                    </Card>
                </Col>
            </Row>
            <Table {...tableProps} rowKey="_id">
                <Table.Column
                    title={tc("table.type")}
                    render={(_, record: any) => {
                        const isVideo = record.withVideo || record.isVideo;
                        return isVideo ? (
                            <Tag color="purple" icon={<VideoCameraOutlined />}>{t("types.video")}</Tag>
                        ) : (
                            <Tag color="blue" icon={<PhoneOutlined />}>{t("types.voice")}</Tag>
                        );
                    }}
                    width={100}
                />
                <Table.Column
                    title={tc("table.caller")}
                    render={(_, record: any) => (
                        <Space>
                            <Avatar size="small" src={getMediaUrl(record.caller?.userImage)} icon={<UserOutlined />} />
                            <Text ellipsis style={{ maxWidth: 100 }}>{record.caller?.fullName || "-"}</Text>
                        </Space>
                    )}
                />
                <Table.Column
                    title={tc("table.callee")}
                    render={(_, record: any) => (
                        <Space>
                            <Avatar size="small" src={getMediaUrl(record.callee?.userImage)} icon={<UserOutlined />} />
                            <Text ellipsis style={{ maxWidth: 100 }}>{record.callee?.fullName || "-"}</Text>
                        </Space>
                    )}
                />
                <Table.Column
                    title={tc("table.status")}
                    render={(_, record: any) => {
                        const status = record.callStatus || record.status || "unknown";
                        return (
                            <Tag color={getStatusColor(status)}>
                                {getStatusLabel(status)}
                            </Tag>
                        );
                    }}
                    width={100}
                />
                <Table.Column
                    title={tc("table.duration")}
                    dataIndex="duration"
                    render={(value) => formatDuration(value)}
                    width={80}
                />
                <Table.Column
                    title={tc("table.date")}
                    dataIndex="createdAt"
                    render={(value) => (
                        <Tooltip title={dayjs(value).format("YYYY-MM-DD HH:mm:ss")}>
                            <DateField value={value} format="MMM DD, HH:mm" />
                        </Tooltip>
                    )}
                    width={100}
                />
                <Table.Column
                    title={tc("table.actions")}
                    render={(_, record: any) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record._id} />
                        </Space>
                    )}
                    width={80}
                />
            </Table>
        </List>
    );
};
