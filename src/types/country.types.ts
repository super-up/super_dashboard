export interface ICountry {
    _id: string;
    name: string;
    code: string;
    emoji: string;
    unicode: string;
    image: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateCountryDto {
    _id: string;
    name?: string;
    code?: string;
    emoji?: string;
    unicode?: string;
    image?: string;
}

export interface BulkUpdateCountriesDto {
    updates?: UpdateCountryDto[];
}
