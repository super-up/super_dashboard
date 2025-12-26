import { useShow, useNavigation } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { useTranslation } from "react-i18next";
import {
    Card,
    Descriptions,
    Avatar,
    Tag,
    Space,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Divider,
    Spin,
    Timeline,
    Badge,
    theme,
} from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
    ClockCircleOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { getMediaUrl } from "../../config/api";

dayjs.extend(duration);

const { Title, Text } = Typography;

interface ICallUser {
    _id: string;
    fullName: string;
    email?: string;
    userImage?: string;
}

interface ICall {
    _id: string;
    caller: string | ICallUser;
    callee: string | ICallUser;
    roomId?: string;
    callType?: string;
    callStatus?: string;
    status?: string;
    withVideo?: boolean;
    isVideo?: boolean;
    startedAt?: string;
    endAt?: string;
    duration?: number;
    createdAt: string;
}

export const CallShow = () => {
    const { t } = useTranslation("calls");
    const { t: tc } = useTranslation("common");
    const { token } = theme.useToken();
    const { query } = useShow<ICall>({ resource: "admin/calls" });
    const { data, isLoading } = query;
    const call = data?.data;
    const { show: goToUser } = useNavigation();
    const getCaller = (): ICallUser | undefined => {
        if (!call) return undefined;
        if (typeof call.caller === 'object') return call.caller as ICallUser;
        return undefined;
    };
    const getCallee = (): ICallUser | undefined => {
        if (!call) return undefined;
        if (typeof call.callee === 'object') return call.callee as ICallUser;
        return undefined;
    };
    const caller = getCaller();
    const callee = getCallee();
    const getStatusColor = (status: string | undefined) => {
        if (!status) return "default";
        const colors: Record<string, string> = {
            ended: "green",
            completed: "green",
            missed: "red",
            rejected: "orange",
            cancelled: "orange",
            ongoing: "blue",
            ringing: "processing",
            busy: "default",
            noAnswer: "warning",
        };
        return colors[status.toLowerCase()] || "default";
    };
    const getStatusIcon = (status: string | undefined) => {
        if (!status) return <PhoneOutlined />;
        const statusLower = status.toLowerCase();
        if (statusLower === "ended" || statusLower === "completed") {
            return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
        }
        if (statusLower === "missed" || statusLower === "rejected" || statusLower === "cancelled") {
            return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
        }
        if (statusLower === "ongoing" || statusLower === "ringing") {
            return <PhoneOutlined style={{ color: "#1890ff" }} />;
        }
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
    };
    const formatDuration = (seconds: number | undefined): string => {
        if (!seconds || seconds <= 0) return "0:00";
        const d = dayjs.duration(seconds, "seconds");
        const hours = Math.floor(d.asHours());
        const minutes = d.minutes();
        const secs = d.seconds();
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };
    const isVideoCall = call?.withVideo || call?.isVideo;
    const callStatus = call?.callStatus || call?.status || "unknown";
    if (isLoading || !call) {
        return (
            <Show title={tc("labels.callDetails")}>
                <div style={{ textAlign: "center", padding: 48 }}>
                    <Spin size="large" />
                </div>
            </Show>
        );
    }
    return (
        <Show title={tc("labels.callDetails")}>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                margin: "0 auto 16px",
                                borderRadius: "50%",
                                background: isVideoCall ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                {isVideoCall ? (
                                    <VideoCameraOutlined style={{ fontSize: 32, color: "#fff" }} />
                                ) : (
                                    <PhoneOutlined style={{ fontSize: 32, color: "#fff" }} />
                                )}
                            </div>
                            <Title level={4} style={{ margin: 0 }}>
                                {isVideoCall ? tc("labels.videoCall") : tc("labels.voiceCall")}
                            </Title>
                            <Space style={{ marginTop: 12 }}>
                                <Tag color={getStatusColor(callStatus)} icon={getStatusIcon(callStatus)}>
                                    {t(`status.${callStatus.toLowerCase()}`) || callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                                </Tag>
                            </Space>
                        </div>
                        <Divider />
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("table.duration")}
                                    value={formatDuration(call.duration)}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col xs={12} sm={12}>
                                <Statistic
                                    title={tc("labels.type")}
                                    value={call.callType || (isVideoCall ? t("types.video") : t("types.voice"))}
                                    prefix={isVideoCall ? <VideoCameraOutlined /> : <PhoneOutlined />}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title={tc("labels.participants")} style={{ marginBottom: 24 }}>
                        <Row gutter={24} align="middle" justify="center">
                            <Col xs={24} sm={10}>
                                <Card
                                    hoverable
                                    style={{ textAlign: "center" }}
                                    onClick={() => caller && goToUser("users", caller._id)}
                                >
                                    <Avatar
                                        size={80}
                                        src={caller ? getMediaUrl(caller.userImage) : undefined}
                                        icon={<UserOutlined />}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Title level={5} style={{ margin: 0 }}>
                                        {caller?.fullName || tc("labels.unknownCaller")}
                                    </Title>
                                    <Text type="secondary">{caller?.email || "-"}</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color="blue">{tc("labels.caller")}</Tag>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={4} style={{ textAlign: "center" }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "16px 0",
                                }}>
                                    <SwapOutlined style={{ fontSize: 24, color: token.colorTextTertiary }} />
                                    <ArrowRightOutlined style={{ fontSize: 24, color: "#1890ff", marginTop: 8 }} />
                                </div>
                            </Col>
                            <Col xs={24} sm={10}>
                                <Card
                                    hoverable
                                    style={{ textAlign: "center" }}
                                    onClick={() => callee && goToUser("users", callee._id)}
                                >
                                    <Avatar
                                        size={80}
                                        src={callee ? getMediaUrl(callee.userImage) : undefined}
                                        icon={<UserOutlined />}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Title level={5} style={{ margin: 0 }}>
                                        {callee?.fullName || tc("labels.unknownCallee")}
                                    </Title>
                                    <Text type="secondary">{callee?.email || "-"}</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color="green">{tc("labels.callee")}</Tag>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                    <Card title={tc("labels.callInformation")} style={{ marginBottom: 24 }}>
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label={tc("labels.callId")}>
                                <Text copyable code>{call._id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.status")}>
                                <Tag color={getStatusColor(callStatus)}>
                                    {t(`status.${callStatus.toLowerCase()}`) || callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("labels.callType")}>
                                <Space>
                                    {isVideoCall ? <VideoCameraOutlined /> : <PhoneOutlined />}
                                    {isVideoCall ? t("types.video") : t("types.voice")}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={tc("table.duration")}>
                                {call.duration ? formatDuration(call.duration) : "-"}
                            </Descriptions.Item>
                            {call.roomId && (
                                <Descriptions.Item label={tc("labels.roomId")}>
                                    <Text copyable code>{call.roomId}</Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    <Card title={tc("labels.timeline")}>
                        <Timeline
                            items={[
                                {
                                    color: "blue",
                                    dot: <PhoneOutlined />,
                                    children: (
                                        <div>
                                            <Text strong>{tc("labels.callInitiated")}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {dayjs(call.createdAt).format("MMM DD, YYYY HH:mm:ss")}
                                            </Text>
                                        </div>
                                    ),
                                },
                                ...(call.startedAt ? [{
                                    color: "green" as const,
                                    dot: <CheckCircleOutlined />,
                                    children: (
                                        <div>
                                            <Text strong>{tc("labels.callStarted")}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {dayjs(call.startedAt).format("MMM DD, YYYY HH:mm:ss")}
                                            </Text>
                                        </div>
                                    ),
                                }] : []),
                                ...(call.endAt ? [{
                                    color: (callStatus === "ended" || callStatus === "completed") ? "green" as const : "red" as const,
                                    dot: getStatusIcon(callStatus),
                                    children: (
                                        <div>
                                            <Text strong>
                                                {t(`status.${callStatus.toLowerCase()}`) || callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                                            </Text>
                                            <br />
                                            <Text type="secondary">
                                                {dayjs(call.endAt).format("MMM DD, YYYY HH:mm:ss")}
                                            </Text>
                                            {call.duration && (
                                                <>
                                                    <br />
                                                    <Text type="secondary">
                                                        {tc("table.duration")}: {formatDuration(call.duration)}
                                                    </Text>
                                                </>
                                            )}
                                        </div>
                                    ),
                                }] : []),
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Show>
    );
};