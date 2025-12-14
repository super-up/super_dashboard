import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, theme } from "antd";
import { LockOutlined, UserOutlined, DashboardOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

interface LoginFormValues {
    email: string;
    password: string;
}

export const Login = () => {
    const { token } = theme.useToken();
    const { t } = useTranslation("login");
    const { t: tc } = useTranslation("common");
    const { mutate: login, isPending } = useLogin<LoginFormValues>();
    const [form] = Form.useForm();
    const handleSubmit = (values: LoginFormValues) => {
        login(values);
    };
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorBgContainer} 50%, ${token.colorPrimary}10 100%)`,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: `${token.colorPrimary}08`,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: -150,
                    left: -150,
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `${token.colorPrimary}06`,
                    pointerEvents: "none",
                }}
            />
            <Card
                style={{
                    width: 400,
                    maxWidth: "90vw",
                    boxShadow: token.boxShadowSecondary,
                    borderRadius: token.borderRadiusLG,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    position: "relative",
                    zIndex: 1,
                }}
                styles={{
                    body: { padding: 40 },
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: token.borderRadiusLG,
                            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 8px 24px ${token.colorPrimary}40`,
                        }}
                    >
                        <DashboardOutlined style={{ fontSize: 36, color: "#fff" }} />
                    </div>
                </div>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            marginBottom: 8,
                            color: token.colorTextHeading,
                            fontWeight: 600,
                        }}
                    >
                        {t("title")}
                    </Title>
                    <Text
                        style={{
                            color: token.colorTextSecondary,
                            fontSize: 14,
                        }}
                    >
                        {t("subtitle")}
                    </Text>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        email: "admin@admin.com",
                        password: "",
                    }}
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label={
                            <Text strong style={{ color: token.colorTextSecondary }}>
                                {t("email")}
                            </Text>
                        }
                        rules={[
                            { required: true, message: t("emailRequired") },
                            { type: "email", message: t("emailInvalid") },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: token.colorTextPlaceholder }} />}
                            placeholder={t("emailPlaceholder")}
                            size="large"
                            style={{
                                borderRadius: token.borderRadius,
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={
                            <Text strong style={{ color: token.colorTextSecondary }}>
                                {t("password")}
                            </Text>
                        }
                        rules={[{ required: true, message: t("passwordRequired") }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: token.colorTextPlaceholder }} />}
                            placeholder={t("passwordPlaceholder")}
                            size="large"
                            style={{
                                borderRadius: token.borderRadius,
                            }}
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={isPending}
                            style={{
                                height: 48,
                                borderRadius: token.borderRadius,
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: `0 4px 12px ${token.colorPrimary}40`,
                            }}
                        >
                            {isPending ? t("signingIn") : t("signIn")}
                        </Button>
                    </Form.Item>
                </Form>
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 24,
                        paddingTop: 24,
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <Text style={{ color: token.colorTextTertiary, fontSize: 12 }}>
                        {tc("copyright", { year: new Date().getFullYear() })}
                    </Text>
                </div>
            </Card>
        </div>
    );
};
