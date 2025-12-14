import { useEffect } from "react";
import { Modal, Form, Input, Switch, Button } from "antd";
import { useTranslation } from "react-i18next";
import { IStickerPack, ICreatePackDto, IUpdatePackDto } from "../../../types/sticker.types";

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
    const isEdit = !!pack;
    useEffect(() => {
        if (open && pack) {
            form.setFieldsValue({
                name: pack.name,
                thumbnailUrl: pack.thumbnailUrl,
                author: pack.author,
                isAnimated: pack.isAnimated,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, pack, form]);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (isEdit) {
                onUpdate(values);
            } else {
                onCreate(values);
            }
        } catch {
            // validation failed
        }
    };
    return (
        <Modal
            title={isEdit ? t("modal.editTitle") : t("modal.createTitle")}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t("modal.cancel")}
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
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
                    name="thumbnailUrl"
                    label={t("modal.thumbnailUrl")}
                    rules={[{ required: true, message: t("validation.thumbnailRequired") }]}
                >
                    <Input placeholder={t("modal.thumbnailUrlPlaceholder")} />
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
