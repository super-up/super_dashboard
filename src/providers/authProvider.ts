import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "../config/api";

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const response = await axios.post(`${API_URL}/admin/auth/login`, {
                email,
                password,
            });
            if (response.data?.data?.accessToken) {
                localStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
                localStorage.setItem("admin_email", email);
                return {
                    success: true,
                    redirectTo: "/",
                };
            }
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: "Invalid credentials",
                },
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: error.response?.data?.data || "Login failed",
                },
            };
        }
    },
    logout: async () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("admin_email");
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            try {
                await axios.get(`${API_URL}/admin/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return { authenticated: true };
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                return {
                    authenticated: false,
                    redirectTo: "/login",
                };
            }
        }
        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        return ["admin"];
    },
    getIdentity: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        const email = localStorage.getItem("admin_email");
        if (token && email) {
            return {
                id: 1,
                name: "Admin",
                email: email,
                avatar: "https://ui-avatars.com/api/?name=Admin&background=1890ff&color=fff",
            };
        }
        return null;
    },
    onError: async (error) => {
        if (error.response?.status === 401) {
            return {
                logout: true,
                redirectTo: "/login",
            };
        }
        return { error };
    },
};
