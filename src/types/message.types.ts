// Message type enum matching backend
export enum MessageType {
    Text = "text",
    Voice = "voice",
    Image = "image",
    Video = "video",
    File = "file",
    AllDeleted = "allDeleted",
    Location = "location",
    Custom = "custom",
    Call = "call",
    Info = "info",
    Reaction = "reaction",
    Sticker = "sticker",
    Gif = "gif",
    StoryReply = "storyReply",
}

export interface MessageAttachment {
    url?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
    mimeType?: string;
    fileName?: string;
    thumbnailUrl?: string;
}

export interface IMessage {
    _id: string;
    // senderId
    sId: string;
    // senderName
    sName: string;
    // senderImageThumb
    sImg: string;
    // platform
    plm: string;
    // roomId
    rId: string;
    // content
    c: string;
    // messageType
    mT: MessageType;
    // messageAttachment
    msgAtt?: MessageAttachment;
    // deletedAt
    dltAt?: string;
    // createdAt
    createdAt: string;
    // updatedAt
    updatedAt?: string;
    // isEncrypted
    isEncrypted?: boolean;
    // forward from message id
    forId?: string;
    // reply to message
    rTo?: object;
    // reactions
    reactionNumber?: number;
    reactionSample?: Array<{ emoji: string; count: number }>;
}

export const MESSAGE_TYPE_CONFIG: Record<MessageType, { label: string; color: string; icon: string }> = {
    [MessageType.Text]: { label: "Text", color: "blue", icon: "message" },
    [MessageType.Voice]: { label: "Voice", color: "orange", icon: "audio" },
    [MessageType.Image]: { label: "Image", color: "green", icon: "picture" },
    [MessageType.Video]: { label: "Video", color: "purple", icon: "video-camera" },
    [MessageType.File]: { label: "File", color: "cyan", icon: "file" },
    [MessageType.AllDeleted]: { label: "Deleted", color: "default", icon: "delete" },
    [MessageType.Location]: { label: "Location", color: "magenta", icon: "environment" },
    [MessageType.Custom]: { label: "Custom", color: "default", icon: "block" },
    [MessageType.Call]: { label: "Call", color: "volcano", icon: "phone" },
    [MessageType.Info]: { label: "Info", color: "default", icon: "info-circle" },
    [MessageType.Reaction]: { label: "Reaction", color: "gold", icon: "smile" },
    [MessageType.Sticker]: { label: "Sticker", color: "lime", icon: "smile" },
    [MessageType.Gif]: { label: "GIF", color: "geekblue", icon: "gif" },
    [MessageType.StoryReply]: { label: "Story Reply", color: "pink", icon: "message" },
};

export const isMessageDeleted = (message: IMessage): boolean => {
    return !!message.dltAt;
};

export const hasAttachment = (message: IMessage): boolean => {
    return !!message.msgAtt?.url;
};
