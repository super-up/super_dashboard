import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./resources";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en", "ar", "bn", "de", "es", "fr", "hi", "id", "ja", "ko", "ml", "pt", "ru", "tr", "vi", "zh"],
        defaultNS: "common",
        ns: [
            "common",
            "navigation",
            "dashboard",
            "users",
            "versions",
            "countries",
            "devices",
            "reports",
            "rooms",
            "stories",
            "messages",
            "validation",
            "login",
            "calls",
            "notifications",
            "export",
            "audit",
            "realtime-logs",
            "config",
            "stickers",
        ],
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: true,
        },
    });

export default i18n;

export const languages = [
    { code: "en", name: "English", dir: "ltr" },
    { code: "ar", name: "العربية", dir: "rtl" },
    { code: "bn", name: "বাংলা", dir: "ltr" },
    { code: "de", name: "Deutsch", dir: "ltr" },
    { code: "es", name: "Español", dir: "ltr" },
    { code: "fr", name: "Français", dir: "ltr" },
    { code: "hi", name: "हिन्दी", dir: "ltr" },
    { code: "id", name: "Indonesia", dir: "ltr" },
    { code: "ja", name: "日本語", dir: "ltr" },
    { code: "ko", name: "한국어", dir: "ltr" },
    { code: "ml", name: "മലയാളം", dir: "ltr" },
    { code: "pt", name: "Português", dir: "ltr" },
    { code: "ru", name: "Русский", dir: "ltr" },
    { code: "tr", name: "Türkçe", dir: "ltr" },
    { code: "vi", name: "Tiếng Việt", dir: "ltr" },
    { code: "zh", name: "中文", dir: "ltr" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const isRTL = (lng: string): boolean => {
    return lng === "ar";
};
