"use client";

import { api } from "@/lib/axiosClient";
import { ApiResponse, PageResponse } from "@/types";
import axios from "axios";

export interface BoardMaster {
    brdId: string;
    brdNm: string;
    brdDesc?: string;
    replyUseYn: string;
    fileUseYn: string;
    fileMaxCnt: number;
    useYn: string;
    sysInsertDtm?: string;
    sysInsertUserId?: string;
    sysUpdateDtm?: string;
    sysUpdateUserId?: string;
}

/**
 * 게시판 목록 조회 (페이징)
 */
export async function getBoards(page: number, size: number, brdNm?: string, startDate?: string, endDate?: string): Promise<ApiResponse<PageResponse<BoardMaster>>> {
    try {
        const params = new URLSearchParams({
            page: (page + 1).toString(),
            size: size.toString(),
        });

        if (brdNm) params.append("brdNm", brdNm);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get<PageResponse<BoardMaster>>(`/v1/mgmt/boards/master?${params.toString()}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시판 목록을 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시판 상세 조회
 */
export async function getBoardById(brdId: string): Promise<ApiResponse<BoardMaster>> {
    try {
        const response = await api.get<BoardMaster>(`/v1/mgmt/boards/master/${brdId}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시판 정보를 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시판 생성
 */
export async function createBoard(data: Partial<BoardMaster>): Promise<ApiResponse<void>> {
    try {
        const response = await api.post<void>("/v1/mgmt/boards/master", data);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시판 생성에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시판 수정
 */
export async function updateBoard(brdId: string, data: Partial<BoardMaster>): Promise<ApiResponse<void>> {
    try {
        const response = await api.put<void>(`/v1/mgmt/boards/master/${brdId}`, data);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시판 수정에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시판 삭제
 */
export async function deleteBoard(brdId: string): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`/v1/mgmt/boards/master/${brdId}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시판 삭제에 실패했습니다.",
            data: null,
        };
    }
}
