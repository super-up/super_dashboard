export interface IRoom {
    _id: string;
    roomType: RoomType;
    title?: string;
    thumbImage?: string;
    nickName?: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
    creatorId?: string | IUser;
    lastMessage?: ILastMessage;
    membersCount?: number;
    isArchived?: boolean;
    isMuted?: boolean;
    unReadCount?: number;
}

export interface IGroupRoom extends IRoom {
    roomType: RoomType.Group;
    title: string;
    thumbImage?: string;
    description?: string;
    creatorId: string | IUser;
    adminsIds?: string[];
    membersCount: number;
}

export interface IRoomMember {
    _id: string;
    uId: string | IUser;
    rId: string;
    role: RoomMemberRole;
    createdAt: string;
    updatedAt?: string;
    user?: IUser;
}

export interface ILastMessage {
    _id: string;
    content: string;
    sId: string;
    msgType: MessageType;
    createdAt: string;
}

export interface IRoomWithDetails extends IGroupRoom {
    members?: IRoomMember[];
    creator?: IUser;
}

export interface IBulkUpdateRoomsDto {
    roomIds: string[];
    updates: IRoomUpdates;
}

export interface IRoomUpdates {
    title?: string;
    description?: string;
    thumbImage?: string;
    deletedAt?: string | null;
}

export enum RoomType {
    Single = "s",
    Group = "g",
    Broadcast = "b",
    Order = "o",
}

export enum RoomMemberRole {
    Member = "member",
    Admin = "admin",
    SuperAdmin = "superAdmin",
}

export enum MessageType {
    Text = "text",
    Image = "image",
    Video = "video",
    Voice = "voice",
    File = "file",
    Location = "location",
    Call = "call",
    Info = "info",
    AllDeleted = "allDeleted",
}

export const getRoomTypeLabel = (type: RoomType): string => {
    switch (type) {
        case RoomType.Single: return "Direct";
        case RoomType.Group: return "Group";
        case RoomType.Broadcast: return "Broadcast";
        case RoomType.Order: return "Order";
        default: return type;
    }
};

export const getMemberRoleLabel = (role: RoomMemberRole): string => {
    switch (role) {
        case RoomMemberRole.SuperAdmin: return "Owner";
        case RoomMemberRole.Admin: return "Admin";
        case RoomMemberRole.Member: return "Member";
        default: return role;
    }
};

export const getMemberRoleColor = (role: RoomMemberRole): string => {
    switch (role) {
        case RoomMemberRole.SuperAdmin: return "gold";
        case RoomMemberRole.Admin: return "blue";
        case RoomMemberRole.Member: return "default";
        default: return "default";
    }
};

import { IUser } from "./user.types";
