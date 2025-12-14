export interface IAppConfig {
    _id: string;
    configVersion: number;
    backendVersion?: string;
    enableAds: boolean;
    feedbackEmail: string;
    allowWebLogin: boolean;
    allowMobileLogin: boolean;
    allowDesktopLogin: boolean;
    allowCreateGroup: boolean;
    allowCreateBroadcast: boolean;
    allowMessaging: boolean;
    allowSendMedia: boolean;
    allowCall: boolean;
    privacyUrl: string;
    googlePayUrl: string | null;
    webChatUrl: string | null;
    windowsStoreUrl: string | null;
    macStoreUrl: string | null;
    appleStoreUrl: string | null;
    appName: string;
    maxExpireEmailTime: number;
    userRegisterStatus: RegisterStatus;
    callTimeout: number;
    maxGroupMembers: number;
    maxBroadcastMembers: number;
    maxChatMediaSize: number;
    maxForward: number;
    roomIcons: VRoomsIcon;
    groupIcon: string;
    supportIcon: string;
    broadcastIcon: string;
    userIcon: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface VRoomsIcon {
    group: string;
    order: string;
    broadcast: string;
}

export enum RegisterStatus {
    accepted = "accepted",
    pending = "pending",
    notAccepted = "notAccepted",
}

export interface UpdateAppConfigDto {
    enableAds?: boolean;
    feedbackEmail?: string;
    allowWebLogin?: boolean;
    allowMobileLogin?: boolean;
    allowDesktopLogin?: boolean;
    allowCreateGroup?: boolean;
    allowCreateBroadcast?: boolean;
    allowMessaging?: boolean;
    allowSendMedia?: boolean;
    allowCall?: boolean;
    privacyUrl?: string;
    googlePayUrl?: string | null;
    webChatUrl?: string | null;
    windowsStoreUrl?: string | null;
    macStoreUrl?: string | null;
    appleStoreUrl?: string | null;
    appName?: string;
    maxExpireEmailTime?: number;
    userRegisterStatus?: RegisterStatus;
    callTimeout?: number;
    maxGroupMembers?: number;
    maxBroadcastMembers?: number;
    maxChatMediaSize?: number;
    maxForward?: number;
    roomIcons?: VRoomsIcon;
    groupIcon?: string;
    supportIcon?: string;
    broadcastIcon?: string;
    userIcon?: string;
}

export const REGISTER_STATUS_OPTIONS = [
    { value: RegisterStatus.accepted, label: "Accepted", color: "green" },
    { value: RegisterStatus.pending, label: "Pending (Requires Approval)", color: "orange" },
    { value: RegisterStatus.notAccepted, label: "Not Accepted (Closed)", color: "red" },
];

export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatMilliseconds = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};
