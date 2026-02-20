/**
 * Base Resource Client
 * 
 * REST API CRUD 작업을 위한 기본 클라이언트
 */

import { ApiResponse, PageResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
    page: number;
    size: number;
    sort?: string | string[];
}

/**
 * 리소스 클라이언트 설정
 */
export interface ResourceClientConfig {
    baseUrl: string;
    resourceName: string;
}

/**
 * 클라이언트 사이드 페이지네이션 헬퍼
 */
export function paginateClientSide<T>(
    items: T[],
    page: number,
    size: number
): PageResponse<T> {
    const total = items.length;
    const pages = Math.ceil(total / size);
    const start = page * size;
    const end = start + size;
    const list = items.slice(start, end);

    return {
        list,
        pageNum: page,
        pageSize: size,
        total,
        pages,
    };
}

/**
 * 필터링 헬퍼
 */
export function filterItems<T>(
    items: T[],
    filters: Partial<Record<keyof T, string | number | boolean>>,
    searchFields?: (keyof T)[]
): T[] {
    return items.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                return true;
            }

            const itemValue = item[key as keyof T];

            // 검색 필드인 경우 부분 일치
            if (searchFields?.includes(key as keyof T)) {
                return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
            }

            // 그 외 정확히 일치
            return itemValue === value;
        });
    });
}

/**
 * Base Resource Client 클래스
 */
export class BaseResourceClient<T> {
    protected baseUrl: string;
    public readonly resourceName: string;

    constructor(config: ResourceClientConfig) {
        this.baseUrl = config.baseUrl;
        this.resourceName = config.resourceName;
    }

    /**
     * 전체 목록 조회
     */
    async getList(): Promise<ApiResponse<T[]>> {
        return apiClient.get<T[]>(this.baseUrl);
    }

    /**
     * 페이지네이션 목록 조회
     */
    async getPagedList(params: PaginationParams & Record<string, unknown>): Promise<ApiResponse<PageResponse<T>>> {
        return apiClient.get<PageResponse<T>>(this.baseUrl, params as Record<string, string | number | boolean | undefined>);
    }

    /**
     * ID로 단건 조회
     */
    async getById(id: string): Promise<ApiResponse<T>> {
        return apiClient.get<T>(`${this.baseUrl}/${id}`);
    }

    /**
     * 숫자 ID로 단건 조회
     */
    async getByIdNumber(id: number): Promise<ApiResponse<T>> {
        return apiClient.get<T>(`${this.baseUrl}/${id}`);
    }

    /**
     * 생성
     */
    async create(data: Partial<T>): Promise<ApiResponse<T>> {
        return apiClient.post<T>(this.baseUrl, data);
    }

    /**
     * 수정
     */
    async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
        return apiClient.put<T>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * 숫자 ID로 수정
     */
    async updateByIdNumber(id: number, data: Partial<T>): Promise<ApiResponse<T>> {
        return apiClient.put<T>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * 삭제
     */
    async delete(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`${this.baseUrl}/${id}`);
    }

    /**
     * 숫자 ID로 삭제
     */
    async deleteById(id: number): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
