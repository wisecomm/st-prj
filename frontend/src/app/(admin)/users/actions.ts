"use client";

import { apiClient as api } from "@/lib/api-client";
import { ApiResponse, PageResponse, UserDetail } from "@/types";
import axios from "axios";

/**
 * 사용자 목록 조회 (페이징)
 */
export async function getUsers(page: number, size: number, userName?: string, startDate?: string, endDate?: string): Promise<ApiResponse<PageResponse<UserDetail>>> {
    try {
        const params = new URLSearchParams({
            page: (page + 1).toString(),
            size: size.toString(),
        });

        if (userName) params.append("userName", userName);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get<PageResponse<UserDetail>>(`/v1/mgmt/users?${params.toString()}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 목록을 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 사용자 생성
 */
export async function createUser(data: Partial<UserDetail>): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>("/v1/mgmt/users", data);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 생성에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 사용자 수정
 */
export async function updateUser(userId: string, data: Partial<UserDetail>): Promise<ApiResponse<void>> {
    try {
        const response = await api.put<void>(`/v1/mgmt/users/${userId}`, data);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 수정에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 사용자 삭제
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`/v1/mgmt/users/${userId}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 삭제에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 사용자 역할 목록 조회
 */
export async function getUserRoles(userId: string): Promise<ApiResponse<string[]>> {
    try {
        const response = await api.get<string[]>(`/v1/mgmt/users/${userId}/roles`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 역할 목록을 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 사용자 역할 부여/수정
 */
export async function assignUserRoles(userId: string, roleIds: string[]): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>("/v1/mgmt/users/assign-roles", { userId, roleIds });
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "사용자 역할 부여에 실패했습니다.",
            data: null,
        };
    }
}

