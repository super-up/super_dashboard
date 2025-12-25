import { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Button, Upload, message, Image } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { IStickerPack, ICreatePackDto, IUpdatePackDto } from "../../../types/sticker.types";
import { axiosInstance } from "../../../providers/dataProvider";
import { API_URL, getMediaUrl } from "../../../config/api";

interface PackModalProps {
    open: boolean;
    pack: IStickerPack | null;
    loading: boolean;
    onClose: () => void;
    onCreate: (data: ICreatePackDto) => void;
    onUpdate: (data: IUpdatePackDto) => void;
}

export const PackModal = ({ open, pack, loading, onClose, onCreate, onUpdate }: PackModalProps) => {
    const { t } = useTranslation("stickers");
    const [form] = Form.useForm();
    const [thumbnailFile, setThumbnailFile] = useState<UploadFile | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const isEdit = !!pack;
    useEffect(() => {
        if (open && pack) {
            form.setFieldsValue({
                name: pack.name,
                author: pack.author,
                isAnimated: pack.isAnimated,
            });
            setThumbnailUrl(pack.thumbnailUrl);
            setThumbnailFile(null);
        } else if (open) {
            form.resetFields();
            setThumbnailUrl(null);
            setThumbnailFile(null);
        }
    }, [open, pack, form]);
    const handleBeforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error(t("validation.onlyImages"));
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error(t("validation.maxFileSize"));
            return Upload.LIST_IGNORE;
        }
        setThumbnailFile({
            uid: file.uid,
            name: file.name,
            originFileObj: file,
        });
        return false;
    };
    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailUrl(null);
    };
    const uploadThumbnail = async (): Promise<string | null> => {
        if (!thumbnailFile?.originFileObj) {
            return thumbnailUrl;
        }
        const formData = new FormData();
        formData.append("files", thumbnailFile.originFileObj);
        const response = await axiosInstance.post(
            `${API_URL}/admin/config/stickers/upload`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        const urls: string[] = response.data.data;
        return urls[0] || null;
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!thumbnailFile && !thumbnailUrl) {
                message.error(t("validation.thumbnailRequired"));
                return;
            }
            setUploading(true);
            const uploadedUrl = await uploadThumbnail();
            if (!uploadedUrl) {
                message.error(t("notifications.uploadFailed"));
                return;
            }
            if (isEdit) {
                onUpdate({
                    ...values,
                    thumbnailUrl: uploadedUrl,
                });
            } else {
                onCreate({
                    ...values,
                    thumbnailUrl: uploadedUrl,
                });
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || t("notifications.uploadFailed"));
        } finally {
            setUploading(false);
        }
    };
    const handleClose = () => {
        form.resetFields();
        setThumbnailFile(null);
        setThumbnailUrl(null);
        onClose();
    };
    return (
        <Modal
            title={isEdit ? t("modal.editTitle") : t("modal.createTitle")}
            open={open}
            onCancel={handleClose}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    {t("modal.cancel")}
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading || uploading}
                    onClick={handleSubmit}
                >
                    {isEdit ? t("modal.update") : t("modal.create")}
                </Button>,
            ]}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isAnimated: false }}
            >
                <Form.Item
                    name="name"
                    label={t("modal.packName")}
                    rules={[{ required: true, message: t("validation.nameRequired") }]}
                >
                    <Input placeholder={t("modal.packNamePlaceholder")} />
                </Form.Item>
                <Form.Item
                    label={t("modal.thumbnailUrl")}
                    required
                >
                    {thumbnailUrl && !thumbnailFile ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Image
                                src={getMediaUrl(thumbnailUrl)}
                                width={80}
                                height={80}
                                style={{ objectFit: "cover", borderRadius: 8 }}
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={handleRemoveThumbnail}
                            >
                                {t("actions.remove")}
                            </Button>
                        </div>
                    ) : thumbnailFile ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span>{thumbnailFile.name}</span>
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                                onClick={handleRemoveThumbnail}
                            />
                        </div>
                    ) : (
                        <Upload
                            beforeUpload={handleBeforeUpload}
                            showUploadList={false}
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        >
                            <Button icon={<UploadOutlined />}>
                                {t("modal.selectThumbnail")}
                            </Button>
                        </Upload>
                    )}
                </Form.Item>
                <Form.Item
                    name="author"
                    label={t("modal.authorLabel")}
                    rules={[{ required: true, message: t("validation.authorRequired") }]}
                >
                    <Input placeholder={t("modal.authorPlaceholder")} />
                </Form.Item>
                <Form.Item
                    name="isAnimated"
                    label={t("modal.animatedPack")}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};
