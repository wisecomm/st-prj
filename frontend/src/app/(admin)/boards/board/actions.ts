"use client";

import { api } from "@/lib/axiosClient";
import { ApiResponse, PageResponse } from "@/types";
import axios from "axios";

export interface BoardFile {
    fileId: number;
    boardId: number;
    filePath: string;
    orgFileNm: string;
    fileSize: number;
    fileExt: string;
}

export interface Board {
    boardId: number;
    brdId: string;
    userId: string;
    title: string;
    contents?: string;
    hitCnt: number;
    secretYn: string;
    useYn: string;
    sysInsertDtm?: string;
    sysInsertUserId?: string;
    sysUpdateDtm?: string;
    sysUpdateUserId?: string;
    fileList?: BoardFile[];
}

export interface BoardSearchDto {
    brdId: string;
    searchType?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    size: number;
}

/**
 * 게시물 목록 조회
 */
export async function getBoards(params: BoardSearchDto): Promise<ApiResponse<PageResponse<Board>>> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("brdId", params.brdId);
        queryParams.append("page", (params.page + 1).toString());
        queryParams.append("size", params.size.toString());

        if (params.searchType) queryParams.append("searchType", params.searchType);
        if (params.keyword) queryParams.append("keyword", params.keyword);
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);

        const response = await api.get<PageResponse<Board>>(`/v1/boards/board?${queryParams.toString()}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시물 목록을 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시물 상세 조회
 */
export async function getBoardById(boardId: number): Promise<ApiResponse<Board>> {
    try {
        const response = await api.get<Board>(`/v1/boards/board/${boardId}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시물 정보를 가져오는 데 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시물 생성
 */
export async function createBoard(data: FormData | Partial<Board>): Promise<ApiResponse<void>> {
    try {
        const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
        const response = await api.post<void>("/v1/boards/board", data, config);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시물 생성에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시물 수정
 */
export async function updateBoard(boardId: number, data: FormData | Partial<Board>): Promise<ApiResponse<void>> {
    try {
        const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
        const response = await api.put<void>(`/v1/boards/board/${boardId}`, data, config);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시물 수정에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시물 삭제
 */
export async function deleteBoard(boardId: number): Promise<ApiResponse<void>> {
    try {
        const response = await api.delete<void>(`/v1/boards/board/${boardId}`);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return error.response?.data || { code: "500", message: error.message, data: null };
        }
        return {
            code: "500",
            message: "게시물 삭제에 실패했습니다.",
            data: null,
        };
    }
}

/**
 * 게시물 첨부파일 다운로드
 */
export async function downloadBoardFile(fileId: number, fileName: string): Promise<void> {
    try {
        const response = await api.get(`/v1/boards/board/files/${fileId}/download`, {
            responseType: "blob",
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response as unknown as Blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName); // Set the file name
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
        console.error("File download failed:", error);
        alert("파일 다운로드에 실패했습니다.");
    }
}

