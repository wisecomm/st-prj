/**
 * Resource Query Factory
 * 
 * BaseResourceClient를 기반으로 표준 CRUD React Query 훅을 자동 생성하는 팩토리
 */

import { BaseResourceClient, PaginationParams } from '@/lib/base-resource-client';
import { PageResponse } from '@/types';
import { createPaginatedQuery, createMutation } from './factory';

/**
 * 리소스 훅 설정 옵션
 */
export interface ResourceHookOptions<TSearchParams = PaginationParams> {
    /**
     * 쿼리 키 오버라이드 (기본값: [resourceName])
     */
    queryKeys?: {
        all?: readonly string[];
        list?: (params: TSearchParams) => readonly unknown[];
        detail?: (id: string) => readonly unknown[];
    };
}

/**
 * 표준 리소스 훅 생성 함수
 * 
 * @param client BaseResourceClient 인스턴스
 * @param options 추가 설정 옵션
 */
export function createResourceHooks<
    T extends object,
    TSearchParams extends PaginationParams = PaginationParams
>(
    client: BaseResourceClient<T>,
    options: ResourceHookOptions<TSearchParams> = {}
) {
    const resourceName = client.resourceName || 'resource';

    // 기본 쿼리 키 정의
    const baseKeys = {
        all: options.queryKeys?.all || [resourceName] as const,
        lists: () => [...(options.queryKeys?.all || [resourceName]), 'list'] as const,
        list: (params: TSearchParams) => {
            if (options.queryKeys?.list) return options.queryKeys.list(params);
            return [...baseKeys.lists(), params] as const;
        },
        details: () => [...(options.queryKeys?.all || [resourceName]), 'detail'] as const,
        detail: (id: string) => {
            if (options.queryKeys?.detail) return options.queryKeys.detail(id);
            return [...baseKeys.details(), id] as const;
        }
    };

    /**
     * 목록 조회 훅 (페이지네이션 지원)
     */
    const useList = createPaginatedQuery<PageResponse<T>, TSearchParams>({
        queryKey: (params) => baseKeys.list(params),
        queryFn: (params) => client.getPagedList(params as PaginationParams & Record<string, unknown>),
    });

    /**
     * 상세 조회 훅
     */
    const useDetail = createPaginatedQuery<T, string>({
        queryKey: (id) => baseKeys.detail(id),
        queryFn: (id) => client.getById(id),
        enabled: (id) => !!id,
    });

    /**
     * 생성 훅
     */
    const useCreate = createMutation<T, Partial<T>>({
        mutationFn: (data) => client.create(data),
        invalidateKeys: [baseKeys.all],
    });

    /**
     * 수정 훅
     */
    const useUpdate = createMutation<T, { id: string; data: Partial<T> }>({
        mutationFn: ({ id, data }) => client.update(id, data),
        invalidateKeys: [baseKeys.all],
    });

    /**
     * 삭제 훅
     */
    const useDelete = createMutation<void, string>({
        mutationFn: (id) => client.delete(id),
        invalidateKeys: [baseKeys.all],
    });

    return {
        keys: baseKeys,
        useList,
        useDetail,
        useCreate,
        useUpdate,
        useDelete,
    };
}
