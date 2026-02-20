/**
 * React Query Factory
 * 
 * 표준화된 React Query 훅을 생성하는 팩토리 함수들
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
    QueryKey,
} from '@tanstack/react-query';
import { ApiResponse } from '@/types';
import { isSuccessResponse } from '@/types/api-utils';

/**
 * 쿼리 설정 타입
 */
export interface QueryConfig<TData, TParams = void> {
    queryKey: (params: TParams) => QueryKey;
    queryFn: (params: TParams) => Promise<ApiResponse<TData>>;
    enabled?: (params: TParams) => boolean;
}

/**
 * 뮤테이션 설정 타입
 */
export interface MutationConfig<TData, TVariables> {
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
    invalidateKeys?: QueryKey[];
    onSuccessMessage?: string;
}

/**
 * API 응답을 처리하는 공통 쿼리 훅 팩토리
 */
export function createQuery<TData, TParams = void>(
    config: QueryConfig<TData, TParams>,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
    return (params: TParams, additionalOptions?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>) => {
        return useQuery<TData>({
            queryKey: config.queryKey(params),
            queryFn: async () => {
                const response = await config.queryFn(params);

                if (!isSuccessResponse(response)) {
                    throw new Error(response.message);
                }

                return response.data;
            },
            enabled: config.enabled ? config.enabled(params) : true,
            ...options,
            ...additionalOptions,
        });
    };
}

/**
 * API 뮤테이션을 처리하는 공통 훅 팩토리
 */
export function createMutation<TData, TVariables>(
    config: MutationConfig<TData, TVariables>,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return () => {
        const queryClient = useQueryClient();

        return useMutation<TData, Error, TVariables>({
            mutationFn: async (variables: TVariables) => {
                const response = await config.mutationFn(variables);

                if (!isSuccessResponse(response)) {
                    throw new Error(response.message);
                }

                return response.data;
            },
            onSuccess: (data, variables, context, mutationContext) => {
                // 지정된 쿼리 무효화
                if (config.invalidateKeys) {
                    config.invalidateKeys.forEach(queryKey => {
                        queryClient.invalidateQueries({ queryKey });
                    });
                }

                // 추가 onSuccess 콜백 실행
                options?.onSuccess?.(data, variables, context, mutationContext);
            },
            onError: options?.onError,
            ...options,
        });
    };
}

/**
 * 페이지네이션 쿼리 훅 팩토리
 */
export interface PaginatedQueryConfig<TData, TParams> extends QueryConfig<TData, TParams> {
    placeholderData?: boolean;
}

export function createPaginatedQuery<TData, TParams>(
    config: PaginatedQueryConfig<TData, TParams>,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
    return (params: TParams, additionalOptions?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>) => {
        return useQuery<TData>({
            queryKey: config.queryKey(params),
            queryFn: async () => {
                const response = await config.queryFn(params);

                if (!isSuccessResponse(response)) {
                    throw new Error(response.message);
                }

                return response.data;
            },
            enabled: config.enabled ? config.enabled(params) : true,
            placeholderData: config.placeholderData !== false
                ? (previousData) => previousData
                : undefined,
            ...options,
            ...additionalOptions,
        });
    };
}

/**
 * CRUD 뮤테이션 훅 세트를 생성하는 헬퍼
 */
export interface CrudMutationConfig<TEntity> {
    queryKeys: {
        all: QueryKey;
        detail?: (id: string) => QueryKey;
    };
    mutations: {
        create: (data: Partial<TEntity>) => Promise<ApiResponse<void>>;
        update: (id: string, data: Partial<TEntity>) => Promise<ApiResponse<void>>;
        delete: (id: string) => Promise<ApiResponse<void>>;
    };
}

export function createCrudMutations<TEntity>(config: CrudMutationConfig<TEntity>) {
    const useCreate = createMutation({
        mutationFn: config.mutations.create,
        invalidateKeys: [config.queryKeys.all],
    });

    const useUpdate = createMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TEntity> }) =>
            config.mutations.update(id, data),
        invalidateKeys: [config.queryKeys.all],
    });

    const useDelete = createMutation({
        mutationFn: config.mutations.delete,
        invalidateKeys: [config.queryKeys.all],
    });

    return {
        useCreate,
        useUpdate,
        useDelete,
    };
}
