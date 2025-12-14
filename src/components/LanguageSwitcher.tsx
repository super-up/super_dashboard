import { Dropdown, Button, Tooltip } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useSetLocale, useGetLocale } from "@refinedev/core";
import { languages } from "../i18n";

export const LanguageSwitcher = () => {
    const { t } = useTranslation("common");
    const changeLanguage = useSetLocale();
    const locale = useGetLocale();
    const currentLocale = locale();
    const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];
    const handleChange = (code: string) => {
        changeLanguage(code);
        document.documentElement.lang = code;
        document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    };
    const items = languages.map((lang) => ({
        key: lang.code,
        label: (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{lang.name}</span>
                {lang.code === currentLocale && <span>✓</span>}
            </span>
        ),
        onClick: () => handleChange(lang.code),
    }));
    return (
        <Tooltip title={t("language.title")}>
            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
                <Button type="text" icon={<GlobalOutlined />} style={{ marginRight: 8 }}>
                    {currentLang.name}
                </Button>
            </Dropdown>
        </Tooltip>
    );
};
