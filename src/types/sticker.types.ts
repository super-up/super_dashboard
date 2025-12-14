export interface ISticker {
    id: string;
    url: string;
    emojis: string[];
}

export interface IStickerPack {
    _id: string;
    name: string;
    thumbnailUrl: string;
    author: string;
    isAnimated: boolean;
    stickers: ISticker[];
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface IStickerStats {
    totalPacks: number;
    animatedPacks: number;
    staticPacks: number;
    totalStickers: number;
}

export interface ICreatePackDto {
    name: string;
    thumbnailUrl: string;
    author: string;
    isAnimated?: boolean;
    stickers?: ISticker[];
}

export interface IUpdatePackDto {
    name?: string;
    thumbnailUrl?: string;
    author?: string;
    isAnimated?: boolean;
}

export interface IAddStickerDto {
    id: string;
    url: string;
    emojis?: string[];
}
