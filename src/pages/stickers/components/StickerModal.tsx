import { useState } from "react";
import { Modal, Form, Input, Upload, Button, message, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { IAddStickerDto } from "../../../types/sticker.types";
import { axiosInstance } from "../../../providers/dataProvider";
import { API_URL } from "../../../config/api";

const { Text } = Typography;
const { Dragger } = Upload;

interface StickerModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onAdd: (data: IAddStickerDto[]) => void;
}

export const StickerModal = ({ open, loading, onClose, onAdd }: StickerModalProps) => {
    const { t } = useTranslation("stickers");
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const handleSubmit = async () => {
        if (fileList.length === 0) {
            message.error(t("validation.selectFiles"));
            return;
        }
        try {
            const values = await form.validateFields();
            const emojis = values.emojis
                ? values.emojis.split(",").map((e: string) => e.trim()).filter(Boolean)
                : [];
            setUploading(true);
            // Upload files to backend
            const formData = new FormData();
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("files", file.originFileObj);
                }
            });
            const response = await axiosInstance.post(
                `${API_URL}/admin/config/stickers/upload`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            const urls: string[] = response.data.data;
            // Create sticker objects with generated IDs
            const stickers: IAddStickerDto[] = urls.map((url) => ({
                id: crypto.randomUUID(),
                url,
                emojis,
            }));
            onAdd(stickers);
            form.resetFields();
            setFileList([]);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || t("notifications.uploadFailed"));
        } finally {
            setUploading(false);
        }
    };
    const handleBeforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error(t("validation.onlyImages"));
            return Upload.LIST_IGNORE;
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error(t("validation.maxFileSize"));
            return Upload.LIST_IGNORE;
        }
        return false; // Prevent auto upload
    };
    const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        if (newFileList.length > 50) {
            message.warning(t("validation.maxImagesAllowed"));
            setFileList(newFileList.slice(0, 50));
        } else {
            setFileList(newFileList);
        }
    };
    const handleClose = () => {
        form.resetFields();
        setFileList([]);
        onClose();
    };
    return (
        <Modal
            title={t("modal.addStickersTitle")}
            open={open}
            onCancel={handleClose}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    {t("modal.cancel")}
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading || uploading}
                    onClick={handleSubmit}
                    disabled={fileList.length === 0}
                >
                    {t("modal.upload")} {fileList.length > 0 ? `(${fileList.length})` : ""}
                </Button>,
            ]}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item label={<Text strong>{t("modal.selectImages")}</Text>}>
                    <Dragger
                        multiple
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={handleBeforeUpload}
                        onChange={handleChange}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">{t("modal.uploadHint")}</p>
                        <p className="ant-upload-hint">
                            {t("validation.uploadHint")}
                        </p>
                    </Dragger>
                </Form.Item>
                <Form.Item
                    name="emojis"
                    label={t("modal.emojis")}
                >
                    <Input placeholder={t("modal.emojisPlaceholder")} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
