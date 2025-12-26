import { useState } from "react";
import { Show, DateField } from "@refinedev/antd";
import { useShow, useNotification, useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
    Card,
    Row,
    Col,
    Image,
    Typography,
    Tag,
    Space,
    Button,
    Popconfirm,
    Spin,
    Empty,
    Tooltip,
    theme,
} from "antd";
import {
    DeleteOutlined,
    PlusOutlined,
    PlayCircleOutlined,
    PictureOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { IStickerPack, ISticker, IAddStickerDto } from "../../types/sticker.types";
import { API_URL, getMediaUrl } from "../../config/api";
import { axiosInstance } from "../../providers/dataProvider";
import { StickerModal } from "./components/StickerModal";

const { Title, Text } = Typography;

export const StickerShow = () => {
    const { t } = useTranslation("stickers");
    const { token } = theme.useToken();
    const { open: notify } = useNotification();
    const { list } = useNavigation();
    const { query } = useShow<IStickerPack>({ resource: "admin/config/stickers/packs" });
    const { data, isLoading, refetch } = query;
    const pack = data?.data;
    const [stickerModalOpen, setStickerModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const handleAddSticker = async (stickersData: IAddStickerDto[]) => {
        if (!pack) return;
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs/${pack._id}/stickers`, {
                adds: stickersData,
            });
            notify?.({ type: "success", message: t("notifications.stickersAdded") });
            setStickerModalOpen(false);
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.uploadFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleRemoveSticker = async (stickerId: string) => {
        if (!pack) return;
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs/${pack._id}/stickers`, {
                removeIds: [stickerId],
            });
            notify?.({ type: "success", message: t("notifications.stickerRemoved") });
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.deleteFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeletePack = async () => {
        if (!pack) return;
        setActionLoading(true);
        try {
            await axiosInstance.patch(`${API_URL}/admin/config/stickers/packs`, {
                packIds: [pack._id],
                updates: { deleted: true },
            });
            notify?.({ type: "success", message: t("notifications.packDeleted") });
            list("admin/config/stickers/packs");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            notify?.({ type: "error", message: err.response?.data?.message || t("notifications.deleteFailed") });
        } finally {
            setActionLoading(false);
        }
    };
    if (isLoading) {
        return (
            <Show title={t("details")}>
                <div style={{ textAlign: "center", padding: 50 }}>
                    <Spin size="large" />
                </div>
            </Show>
        );
    }
    if (!pack) {
        return (
            <Show title={t("details")}>
                <Empty description={t("show.packNotFound")} />
            </Show>
        );
    }
    return (
        <Show
            title={t("details")}
            headerButtons={
                <Space>
                    <Popconfirm
                        title={t("confirmations.deletePack")}
                        onConfirm={handleDeletePack}
                        okButtonProps={{ danger: true, loading: actionLoading }}
                    >
                        <Button danger icon={<DeleteOutlined />} loading={actionLoading}>
                            {t("actions.deletePack")}
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            <Row gutter={[24, 24]}>
                {/* Pack Info */}
                <Col xs={24} lg={8}>
                    <Card title={t("show.packInformation")}>
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                            <Image
                                src={getMediaUrl(pack.thumbnailUrl)}
                                width="100%"
                                style={{ maxWidth: 120, aspectRatio: "1", objectFit: "cover", borderRadius: 8 }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            />
                        </div>
                        <Space direction="vertical" style={{ width: "100%" }} size="small">
                            <div>
                                <Text type="secondary">{t("fields.name")}</Text>
                                <Title level={5} style={{ margin: "4px 0" }}>{pack.name}</Title>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.author")}</Text>
                                <div><Text>{pack.author}</Text></div>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.type")}</Text>
                                <div>
                                    <Tag
                                        color={pack.isAnimated ? "green" : "blue"}
                                        icon={pack.isAnimated ? <PlayCircleOutlined /> : <PictureOutlined />}
                                    >
                                        {pack.isAnimated ? t("types.animated") : t("types.static")}
                                    </Tag>
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.version")}</Text>
                                <div><Text>{pack.version}</Text></div>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.stickersCount")}</Text>
                                <div><Text>{pack.stickers?.length || 0}</Text></div>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.createdAt")}</Text>
                                <div><DateField value={pack.createdAt} format="MMM DD, YYYY HH:mm" /></div>
                            </div>
                            <div>
                                <Text type="secondary">{t("fields.updatedAt")}</Text>
                                <div><DateField value={pack.updatedAt} format="MMM DD, YYYY HH:mm" /></div>
                            </div>
                        </Space>
                    </Card>
                </Col>
                {/* Stickers Grid */}
                <Col xs={24} lg={16}>
                    <Card
                        title={`${t("show.stickersTitle")} (${pack.stickers?.length || 0})`}
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setStickerModalOpen(true)}>
                                {t("actions.addSticker")}
                            </Button>
                        }
                    >
                        {!pack.stickers || pack.stickers.length === 0 ? (
                            <Empty description={t("show.noStickers")} />
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                    gap: 12,
                                }}
                            >
                                {pack.stickers.map((sticker: ISticker) => (
                                    <StickerCard
                                        key={sticker.id}
                                        sticker={sticker}
                                        token={token}
                                        onRemove={handleRemoveSticker}
                                        loading={actionLoading}
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
            {/* Add Sticker Modal */}
            <StickerModal
                open={stickerModalOpen}
                loading={actionLoading}
                onClose={() => setStickerModalOpen(false)}
                onAdd={handleAddSticker}
            />
        </Show>
    );
};

interface StickerCardProps {
    sticker: ISticker;
    token: ReturnType<typeof theme.useToken>["token"];
    onRemove: (id: string) => void;
    loading: boolean;
    t: (key: string) => string;
}

const StickerCard = ({ sticker, token, onRemove, loading, t }: StickerCardProps) => {
    return (
        <div
            style={{
                position: "relative",
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 8,
                padding: 8,
                textAlign: "center",
            }}
        >
            <Popconfirm
                title={t("confirmations.removeSticker")}
                onConfirm={() => onRemove(sticker.id)}
                okButtonProps={{ danger: true, loading }}
            >
                <Button
                    size="small"
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        zIndex: 1,
                    }}
                />
            </Popconfirm>
            <Image
                src={getMediaUrl(sticker.url)}
                width={70}
                height={70}
                style={{ objectFit: "contain" }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
            <Tooltip title={sticker.id}>
                <Text
                    ellipsis
                    style={{
                        display: "block",
                        fontSize: 10,
                        color: token.colorTextSecondary,
                        marginTop: 4,
                    }}
                >
                    {sticker.id}
                </Text>
            </Tooltip>
            {sticker.emojis && sticker.emojis.length > 0 && (
                <Text style={{ fontSize: 12 }}>
                    {sticker.emojis.slice(0, 3).join(" ")}
                    {sticker.emojis.length > 3 && "..."}
                </Text>
            )}
        </div>
    );
};
