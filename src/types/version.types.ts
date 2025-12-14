export interface IAppVersion {
    _id: string;
    semVer: string;
    critical: boolean;
    notes: string;
    notify: boolean;
    platform: Platform;
    createdAt: string;
    updatedAt: string;
}

export enum Platform {
    ios = "ios",
    android = "android",
    windows = "windows",
    macOs = "macOs",
    other = "other",
}

export interface CreateVersionDto {
    semVer: string;
    platform: Platform;
    critical?: boolean;
    notify?: boolean;
    notes?: string;
}

export interface UpdateVersionDto {
    semVer?: string;
    platform?: Platform;
    critical?: boolean;
    notify?: boolean;
    notes?: string;
}

export const PLATFORM_OPTIONS = [
    { value: Platform.ios, label: "iOS", color: "blue" },
    { value: Platform.android, label: "Android", color: "green" },
    { value: Platform.windows, label: "Windows", color: "cyan" },
    { value: Platform.macOs, label: "macOS", color: "geekblue" },
    { value: Platform.other, label: "Other", color: "default" },
];

export const getPlatformConfig = (platform?: string) => {
    const config: Record<string, { label: string; color: string }> = {
        ios: { label: "iOS", color: "blue" },
        android: { label: "Android", color: "green" },
        windows: { label: "Windows", color: "cyan" },
        macOs: { label: "macOS", color: "geekblue" },
        macos: { label: "macOS", color: "geekblue" },
        other: { label: "Other", color: "default" },
    };
    if (!platform) return { label: "Unknown", color: "default" };
    return config[platform.toLowerCase()] || config[platform] || { label: platform, color: "default" };
};
