import { IUser } from "./user.types";

export interface IStoryAttachment {
    url: string;
    thumbUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
}

export interface IStory {
    _id: string;
    userId: string | IUser;
    storyType: StoryType;
    content?: string;
    att?: IStoryAttachment;
    backgroundColor?: string;
    textColor?: string;
    textAlign?: string;
    fontType?: string;
    caption?: string;
    views: IStoryView[];
    createdAt: string;
    expireAt: string;
    deletedAt?: string | null;
}

export interface IStoryView {
    _id?: string;
    viewerId: string | IUser;
    viewedAt: string;
}

export interface IStoryStats {
    totalStories: number;
    activeStories: number;
    expiredStories: number;
    totalViews: number;
    storiesByType: {
        image: number;
        video: number;
        text: number;
    };
}

export interface IBulkUpdateStoriesDto {
    storyIds: string[];
    updates: IStoryUpdates;
}

export interface IStoryUpdates {
    deletedAt?: string | null;
}

export enum StoryType {
    Image = "image",
    Video = "video",
    Text = "text",
    Voice = "voice",
    File = "file",
}

export const getStoryTypeLabel = (type: StoryType): string => {
    switch (type) {
        case StoryType.Image: return "Image";
        case StoryType.Video: return "Video";
        case StoryType.Text: return "Text";
        case StoryType.Voice: return "Voice";
        case StoryType.File: return "File";
        default: return type;
    }
};

export const getStoryTypeColor = (type: StoryType): string => {
    switch (type) {
        case StoryType.Image: return "blue";
        case StoryType.Video: return "purple";
        case StoryType.Text: return "green";
        case StoryType.Voice: return "orange";
        case StoryType.File: return "cyan";
        default: return "default";
    }
};

export const isStoryExpired = (story: IStory): boolean => {
    return new Date(story.expireAt) < new Date();
};

export const isStoryDeleted = (story: IStory): boolean => {
    return !!story.deletedAt;
};

export const getStoryRemainingTime = (story: IStory): string => {
    const expireAt = new Date(story.expireAt);
    const now = new Date();
    const diff = expireAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};