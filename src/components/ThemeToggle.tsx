import { Switch, Tooltip } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";

export const ThemeToggle = () => {
    const { isDark, toggle } = useTheme();
    const { t } = useTranslation("common");
    return (
        <Tooltip title={isDark ? t("theme.light") : t("theme.dark")}>
            <Switch
                checked={isDark}
                onChange={toggle}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                style={{ marginRight: 8 }}
            />
        </Tooltip>
    );
};
