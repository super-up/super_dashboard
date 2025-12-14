export interface IUser {
    _id: string;
    fullName: string;
    fullPhone: string;
    userImage?: string;
    userBio?: string;
    email?: string;
    registerStatus: RegisterStatus;
    platform: Platform;
    banTo?: string | null;
    deletedAt?: string | null;
    roles?: UserRole[];
    lastSeenAt?: string;
    createdAt: string;
    updatedAt?: string;
    countryId?: string | ICountry;
}

export interface ICountry {
    _id: string;
    name: string;
    code: string;
    flag?: string;
}

export interface IUserDevice {
    _id: string;
    uId: string;
    platform: Platform;
    pushKey?: string;
    clintVersion?: string;
    lastSeenAt?: string;
    createdAt: string;
    visits?: number;
}

export interface IUserRoom {
    _id: string;
    rT: RoomType;
    t?: string;
    tEn?: string;
    img?: string;
    rId?: string;
    uId?: string;
    isD?: boolean;
    isA?: boolean;
    isM?: boolean;
}

export enum RoomType {
    Single = "s",
    GroupChat = "g",
    Broadcast = "b",
    Order = "o",
}

export const getRoomTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        s: "Direct",
        g: "Group",
        b: "Broadcast",
        o: "Order",
    };
    return labels[type] || type;
};

export const getRoomTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        s: "blue",
        g: "green",
        b: "purple",
        o: "orange",
    };
    return colors[type] || "default";
};

export interface IBulkUpdateUsersDto {
    userIds: string[];
    updates: IUserUpdates;
}

export interface IUserUpdates {
    banTo?: string | null;
    deletedAt?: string | null;
    hasBadge?: boolean;
    fullName?: string;
    bio?: string;
    registerStatus?: RegisterStatus;
    countryId?: string;
}

export enum RegisterStatus {
    accepted = "accepted",
    pending = "pending",
    rejected = "rejected",
}

export enum Platform {
    android = "android",
    ios = "ios",
    web = "web",
    macos = "macos",
    windows = "windows",
}

export enum UserRole {
    User = "user",
    Admin = "admin",
    HasBadge = "hasBadge",
}

export const isUserBanned = (user: IUser): boolean => {
    if (!user.banTo) return false;
    return new Date(user.banTo) > new Date();
};

export const isUserDeleted = (user: IUser): boolean => {
    return !!user.deletedAt;
};

export const isUserVerified = (user: IUser): boolean => {
    return user.roles?.includes(UserRole.HasBadge) ?? false;
};

export const isUserOnline = (user: IUser): boolean => {
    if (!user.lastSeenAt) return false;
    const lastSeen = new Date(user.lastSeenAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
};
