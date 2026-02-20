/**
 * Order Types
 */

export interface OrderDetail {
    orderId: string;
    custNm: string;
    orderNm: string;
    orderStatus: 'ORDERED' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | string;
    orderAmt: number;
    orderDate: string;
    useYn: string;
    sysInsertDtm?: string;
    sysUpdateDtm?: string;
}

export const OrderStatusLabels: Record<string, string> = {
    ORDERED: '주문 완료',
    PAID: '결제 완료',
    SHIPPED: '배송 중',
    COMPLETED: '배송 완료',
    CANCELLED: '주문 취소',
};

import { PaginationParams } from '@/lib/base-resource-client';

export interface OrderSearchParams extends PaginationParams {
    custNm?: string;
    startDate?: string;
    endDate?: string;
}

export type OrderFilters = Omit<OrderSearchParams, keyof PaginationParams>;
