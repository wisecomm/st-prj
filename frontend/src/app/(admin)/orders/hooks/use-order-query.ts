/**
 * Order Query Hooks
 * 
 * Resource Factory를 사용하여 자동으로 생성된 CRUD 훅
 */

import { BaseResourceClient } from '@/lib/base-resource-client';
import { createResourceHooks } from '@/hooks/query/resource-factory';
import { OrderDetail, OrderSearchParams } from '../types';

// 리소스 클라이언트 생성
const client = new BaseResourceClient<OrderDetail>({
    baseUrl: '/v1/mgmt/orders',
    resourceName: 'orders',
});

// 팩토리를 통해 표준 훅 생성
export const {
    keys: orderKeys,
    useList: useOrders,
    useDetail: useOrder,
    useCreate: useCreateOrder,
    useUpdate: useUpdateOrder,
    useDelete: useDeleteOrder,
} = createResourceHooks<OrderDetail, OrderSearchParams>(client);
