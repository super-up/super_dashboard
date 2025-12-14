import { I18nProvider } from "@refinedev/core";
import i18n from "../i18n";

export const i18nProvider: I18nProvider = {
    translate: (key: string, options?: Record<string, unknown>) => {
        return i18n.t(key, options as Record<string, string>) as string;
    },
    changeLocale: async (lang: string) => {
        await i18n.changeLanguage(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    },
    getLocale: () => i18n.language,
};
