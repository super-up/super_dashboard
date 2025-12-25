export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:3000";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

export const TOKEN_KEY = "admin_token";

export const getAuthHeader = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMediaUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${MEDIA_BASE_URL}${cleanPath}`;
};
