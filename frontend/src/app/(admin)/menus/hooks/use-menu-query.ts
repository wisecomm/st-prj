/**
 * Menu API + Query Hooks
 *
 * 메뉴 API 클라이언트와 React Query 훅 통합 (Resource Factory 사용)
 */

import { BaseResourceClient, PaginationParams } from '@/lib/base-resource-client';
import { createResourceHooks } from '@/hooks/query/resource-factory';
import { MenuInfo } from '../types';

/**
 * 메뉴 검색 파라미터
 */
export interface MenuSearchParams extends PaginationParams {
    searchId?: string;
}

// 리소스 클라이언트 생성
const client = new BaseResourceClient<MenuInfo>({
    baseUrl: '/v1/mgmt/menus',
    resourceName: 'menus',
});

// 팩토리를 통해 표준 훅 생성
export const {
    keys: menuKeys,
    useList: useMenus,
    useDetail: useMenu,
    useCreate: useCreateMenu,
    useUpdate: useUpdateMenu,
    useDelete: useDeleteMenu,
} = createResourceHooks<MenuInfo, MenuSearchParams>(client);
