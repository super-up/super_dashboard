import type { DataProvider, Pagination } from "@refinedev/core";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "../config/api";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const dataProvider: DataProvider = {
    getList: async ({ resource, pagination, filters, sorters }) => {
        const current = pagination?.currentPage ?? 1;
        const pageSize = pagination?.pageSize ?? 20;
        const params: Record<string, unknown> = {
            page: current,
            limit: pageSize,
        };
        if (filters) {
            filters.forEach((filter) => {
                if ("field" in filter && filter.value !== undefined) {
                    // Handle array values - convert to comma-separated string for API
                    if (Array.isArray(filter.value)) {
                        if (filter.value.length > 0) {
                            params[filter.field] = filter.value.join(",");
                        }
                    } else {
                        params[filter.field] = filter.value;
                    }
                }
            });
        }
        if (sorters && sorters.length > 0) {
            const { field, order } = sorters[0];
            params.sort = JSON.stringify({ [field]: order === "desc" ? -1 : 1 });
        }
        const url = `${API_URL}/${resource}`;
        const { data } = await axiosInstance.get(url, { params });
        const responseData = data.data;
        if (responseData?.docs) {
            return {
                data: responseData.docs,
                total: responseData.totalDocs || 0,
            };
        }
        if (Array.isArray(responseData)) {
            return {
                data: responseData,
                total: responseData.length,
            };
        }
        return {
            data: [responseData],
            total: 1,
        };
    },
    getOne: async ({ resource, id }) => {
        const url = `${API_URL}/${resource}/${id}`;
        const { data } = await axiosInstance.get(url);
        return {
            data: data.data,
        };
    },
    create: async ({ resource, variables }) => {
        const url = `${API_URL}/${resource}`;
        const { data } = await axiosInstance.post(url, variables);
        return {
            data: data.data,
        };
    },
    update: async ({ resource, id, variables }) => {
        const url = id ? `${API_URL}/${resource}/${id}` : `${API_URL}/${resource}`;
        const { data } = await axiosInstance.patch(url, variables);
        return {
            data: data.data,
        };
    },
    deleteOne: async ({ resource, id }) => {
        const url = `${API_URL}/${resource}/${id}`;
        const { data } = await axiosInstance.delete(url);
        return {
            data: data.data,
        };
    },
    getApiUrl: () => API_URL,
    custom: async ({ url, method, payload, query, headers }) => {
        let requestUrl = `${API_URL}/${url}`;
        if (query) {
            const queryString = new URLSearchParams(query as Record<string, string>).toString();
            requestUrl = `${requestUrl}?${queryString}`;
        }
        const { data } = await axiosInstance({
            method: method || "get",
            url: requestUrl,
            data: payload,
            headers,
        });
        return { data: data.data };
    },
};

export { axiosInstance };