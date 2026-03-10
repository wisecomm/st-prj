"use client";
import axios from "axios";

import { apiClient as api } from "@/lib/api-client";
import { ApiResponse, Schedule, ScheduleRequest } from "@/types";

const API_BASE_URL = "/v1/mgmt/schedules";

export async function getSchedules(): Promise<ApiResponse<Schedule[]>> {
    try {
        const response = await api.get<Schedule[]>(API_BASE_URL);
        return response;
    } catch (error: unknown) {
        console.error("getSchedules error:", error);
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

export async function getSchedule(uid: number): Promise<ApiResponse<Schedule>> {
    try {
        const response = await api.get<Schedule>(`${API_BASE_URL}/${uid}`);
        return response;
    } catch (error: unknown) {
        console.error("getSchedule error:", error);
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

export async function createSchedule(data: ScheduleRequest): Promise<ApiResponse<Schedule>> {
    try {
        const response = await api.post<Schedule>(API_BASE_URL, data);
        return response;
    } catch (error: unknown) {
        let message = "Failed to create schedule";
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

export async function updateSchedule(uid: number, data: ScheduleRequest): Promise<ApiResponse<Schedule>> {
    try {
        const response = await api.put<Schedule>(`${API_BASE_URL}/${uid}`, data);
        return response;
    } catch (error: unknown) {
        let message = "Failed to update schedule";
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

export async function deleteSchedule(uid: number): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`${API_BASE_URL}/${uid}`);
        return response;
    } catch (error: unknown) {
        let message = "Failed to delete schedule";
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

export async function executeSchedule(uid: number): Promise<ApiResponse<string>> {
    try {
        const response = await api.post<string>(`${API_BASE_URL}/execute/${uid}`);
        return response;
    } catch (error: unknown) {
        let message = "Failed to execute schedule";
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
