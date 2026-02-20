/**
 * Menu API + Query Hooks
 *
 * 메뉴 API 클라이언트와 React Query 훅 통합
 */

import { apiClient } from '@/lib/api-client';
import { ApiResponse, PageResponse } from '@/types';
import { MenuInfo } from '../types';
import { createQuery, createPaginatedQuery, createMutation } from '@/hooks/query/factory';

/**
 * 메뉴 검색 파라미터
 */
export interface MenuSearchParams {
    page: number;
    size: number;
    searchId?: string;
}

/**
 * API 함수들
 */
const BASE_URL = '/v1/mgmt/menus';

const menuApi = {
    search: (params: MenuSearchParams): Promise<ApiResponse<PageResponse<MenuInfo>>> => {
        const queryParams: Record<string, string | number> = {
            page: params.page + 1,
            size: params.size,
        };
        if (params.searchId) queryParams.searchId = params.searchId;

        return apiClient.get<PageResponse<MenuInfo>>(BASE_URL, queryParams);
    },

    getMyMenus: (): Promise<ApiResponse<MenuInfo[]>> => {
        return apiClient.get<MenuInfo[]>(`${BASE_URL}/me`);
    },

    create: (data: Partial<MenuInfo>): Promise<ApiResponse<MenuInfo>> => {
        return apiClient.post<MenuInfo>(BASE_URL, data);
    },

    update: (id: string, data: Partial<MenuInfo>): Promise<ApiResponse<MenuInfo>> => {
        return apiClient.put<MenuInfo>(`${BASE_URL}/${id}`, data);
    },

    delete: (id: string): Promise<ApiResponse<void>> => {
        return apiClient.delete<void>(`${BASE_URL}/${id}`);
    },
};

/**
 * Query Keys
 */
export const menuKeys = {
    all: ['menus'] as const,
    lists: () => [...menuKeys.all, 'list'] as const,
    list: (page: number, size: number, searchId?: string) =>
        [...menuKeys.lists(), { page, size, searchId }] as const,
    my: () => [...menuKeys.all, 'my'] as const,
    detail: (id: string) => [...menuKeys.all, 'detail', id] as const,
};

/**
 * Queries
 */

// 전체 메뉴 목록 조회 (페이지네이션)
export const useMenus = createPaginatedQuery<
    PageResponse<MenuInfo>,
    { page: number; size: number; searchId?: string }
>({
    queryKey: (params) => menuKeys.list(params.page, params.size, params.searchId),
    queryFn: (params) => menuApi.search(params),
});

// 내 메뉴 목록 조회
export const useMyMenus = createQuery<MenuInfo[], void>({
    queryKey: () => menuKeys.my(),
    queryFn: () => menuApi.getMyMenus(),
});

/**
 * Mutations
 */

// 메뉴 생성
export const useCreateMenu = createMutation<MenuInfo, Partial<MenuInfo>>({
    mutationFn: (data) => menuApi.create(data),
    invalidateKeys: [menuKeys.all],
});

// 메뉴 수정
export const useUpdateMenu = createMutation<MenuInfo, { id: string; data: Partial<MenuInfo> }>({
    mutationFn: ({ id, data }) => menuApi.update(id, data),
    invalidateKeys: [menuKeys.all],
});

// 메뉴 삭제
export const useDeleteMenu = createMutation<void, string>({
    mutationFn: (id) => menuApi.delete(id),
    invalidateKeys: [menuKeys.all],
});
