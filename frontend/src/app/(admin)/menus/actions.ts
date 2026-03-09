"use client";

import { ApiResponse, MenuInfo } from "@/types";
import { apiClient as api } from "@/lib/api-client";

export async function getMenus(): Promise<ApiResponse<MenuInfo[]>> {
    try {
        const response = await api.get<MenuInfo[]>("/v1/mgmt/menus");
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to fetch menus",
            data: null,
        };
    }
}

export async function getMyMenus(): Promise<ApiResponse<MenuInfo[]>> {
    try {
        const response = await api.get<MenuInfo[]>("/v1/mgmt/menus/me");
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to fetch your menus",
            data: null,
        };
    }
}

export async function getMenu(menuId: string): Promise<ApiResponse<MenuInfo>> {
    try {
        const response = await api.get<MenuInfo>(`/v1/mgmt/menus/${menuId}`);
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to fetch menu",
            data: null,
        };
    }
}

export async function createMenu(data: Partial<MenuInfo>): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>("/v1/mgmt/menus", data);
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to create menu",
            data: null,
        };
    }
}

export async function updateMenu(menuId: string, data: Partial<MenuInfo>): Promise<ApiResponse<void>> {
    try {
        const response = await api.put<void>(`/v1/mgmt/menus/${menuId}`, data);
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to update menu",
            data: null,
        };
    }
}

export async function deleteMenu(menuId: string): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`/v1/mgmt/menus/${menuId}`);
        return response;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { code?: string; message?: string } } };
        return {
            code: err.response?.data?.code || "500",
            message: err.response?.data?.message || "Failed to delete menu",
            data: null,
        };
    }
}
