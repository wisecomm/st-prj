"use client";
import axios from "axios";

import { apiClient as api } from "@/lib/api-client";
import { ApiResponse, PageResponse, RoleInfo } from "@/types";

const API_BASE_URL = "/v1/mgmt/roles";

export async function getRoles(page: number, size: number, searchId?: string): Promise<ApiResponse<PageResponse<RoleInfo>>> {
    try {
        const response = await api.get<RoleInfo[]>(API_BASE_URL);

        // Backend returns a flat list for roles. We adapt it to a PageResponse structure
        // to stay consistent with the DataTable's expectation of paginated data.
        let allRoles = response.data || [];

        if (searchId) {
            const lowerSearch = searchId.toLowerCase();
            allRoles = allRoles.filter((role: RoleInfo) =>
                role.roleId.toLowerCase().includes(lowerSearch)
            );
        }

        const total = allRoles.length;
        const start = page * size;
        const end = start + size;
        const pagedList = allRoles.slice(start, end);

        return {
            code: "200",
            message: "Success",
            data: {
                list: pagedList,
                total: total,
                pageNum: page + 1,
                pageSize: size,
                pages: Math.ceil(total / size)
            }
        };
    } catch (error: unknown) {
        console.error("getRoles error:", error);
        let message = "Internal Server Error";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}

export async function createRole(data: Partial<RoleInfo>): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>(API_BASE_URL, data);
        return response;
    } catch (error: unknown) {
        let message = "Failed to create role";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}

export async function updateRole(roleId: string, data: Partial<RoleInfo>): Promise<ApiResponse<void>> {
    try {
        const response = await api.put<void>(`${API_BASE_URL}/${roleId}`, data);
        return response;
    } catch (error: unknown) {
        let message = "Failed to update role";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}

export async function deleteRole(roleId: string): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`${API_BASE_URL}/${roleId}`);
        return response;
    } catch (error: unknown) {
        let message = "Failed to delete role";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}

export async function getRoleMenus(roleId: string): Promise<ApiResponse<string[]>> {
    try {
        const response = await api.get<string[]>(`${API_BASE_URL}/${roleId}/menus`);
        return response;
    } catch (error: unknown) {
        let message = "Failed to fetch role menus";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}

export async function assignRoleMenus(roleId: string, menuIds: string[]): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>(`${API_BASE_URL}/assign-menus`, { roleId, menuIds });
        return response;
    } catch (error: unknown) {
        let message = "Failed to assign menus to role";
        if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || error.message;
        }
        return {
            code: "500",
            message: message,
            data: null
        };
    }
}
