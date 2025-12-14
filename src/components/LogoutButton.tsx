import { useLogout } from "@refinedev/core";
import { Button, App, theme } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export const LogoutButton = () => {
    const { token } = theme.useToken();
    const { modal } = App.useApp();
    const { mutate: logout } = useLogout();
    const { t } = useTranslation("common");
    const handleLogout = () => {
        modal.confirm({
            title: t("logout.confirmTitle"),
            content: t("logout.confirmMessage"),
            okText: t("logout.confirm"),
            cancelText: t("actions.cancel"),
            okButtonProps: {
                danger: true,
            },
            centered: true,
            onOk: () => {
                logout();
            },
        });
    };
    return (
        <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: token.colorTextSecondary }}
        >
            {t("actions.logout")}
        </Button>
    );
};
