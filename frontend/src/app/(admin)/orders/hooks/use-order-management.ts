/**
 * useOrderManagement Hook
 * 
 * 주문 관리 페이지의 비즈니스 로직 캡슐화
 */

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Add import
import { PaginationState } from '@tanstack/react-table';
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from './use-order-query';
import { useToast } from '@/hooks/use-toast';
import { OrderDetail, OrderFilters } from '../types';
import { formatDate } from '@/components/common';
import { SortModel } from 'so-grid-core';

// export type OrderFilters = Omit<OrderSearchParams, keyof PaginationParams>; // Moved to types.ts

// ... imports

export function useOrderManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient(); // Correctly defined

    // 검색 상태
    const [searchParams, setSearchParams] = useState<OrderFilters>({
        custNm: '',
        startDate: '',
        //startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
    });

    const [sort, setSort] = useState<string[] | undefined>(undefined);

    // 페이지네이션 상태
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // 다이얼로그 상태
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

    // API 훅
    const { data: ordersData, isLoading, isError, error } = useOrders({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        sort,
        ...searchParams,
    }, {
        staleTime: 5000, // 5초 동안 캐시 유지
    });

    // Error handling effect
    useEffect(() => {
        if (isError) {
            toast({
                title: '목록 조회 실패',
                description: error?.message || '주문 목록을 불러오는 중 오류가 발생했습니다.',
                variant: 'destructive',
            });
        }
    }, [isError, error, toast]);

    const createMutation = useCreateOrder();
    const updateMutation = useUpdateOrder();
    const deleteMutation = useDeleteOrder();

    /**
     * 검색 핸들러
     */
    const onSearch = useCallback((params: Partial<OrderFilters>) => {
        setSearchParams((prev) => ({ ...prev, ...params }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));

        // 검색 조건 변경 시 stale 여부 체크하여 재조회
        // 1. 파라미터가 바뀌면 -> 키가 바뀌어서 자동 조회
        // 2. 파라미터가 안 바뀌면 -> stale 상태일 때만 재조회
        queryClient.refetchQueries({ queryKey: ['orders'], stale: true });
    }, [queryClient]);

    // ... (onSortChange, openDialog, closeDialog, handleSubmit, handleDelete same as before)
    const onSortChange = useCallback((sortModel: SortModel[]) => {
        const newSort = sortModel.map(s => `${s.colId},${s.sort}`);
        setSort(newSort.length > 0 ? newSort : undefined);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, []);

    const openDialog = useCallback((order?: OrderDetail) => {
        setSelectedOrder(order || null);
        setDialogOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedOrder(null);
    }, []);

    const handleSubmit = useCallback(async (data: Partial<OrderDetail>) => {
        try {
            if (selectedOrder) {
                await updateMutation.mutateAsync({
                    id: selectedOrder.orderId,
                    data,
                });
                toast({ title: '수정 완료', description: '주문이 수정되었습니다.', variant: 'success' });
            } else {
                await createMutation.mutateAsync(data);
                toast({ title: '등록 완료', description: '새 주문이 등록되었습니다.', variant: 'success' });
            }
            closeDialog();
        } catch (error) {
            const message = error instanceof Error ? error.message : '저장에 실패했습니다.';
            toast({ title: '저장 실패', description: message, variant: 'destructive' });
        }
    }, [selectedOrder, createMutation, updateMutation, toast, closeDialog]);

    const handleDelete = useCallback(async (orderIds: string[]) => {
        if (orderIds.length === 0) {
            toast({ title: '알림', description: '삭제할 주문을 선택해주세요.', variant: 'default' });
            return;
        }

        if (!confirm(`${orderIds.length}건의 주문을 삭제하시겠습니까?`)) return;

        const results = await Promise.allSettled(
            orderIds.map(id => deleteMutation.mutateAsync(id))
        );

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        if (succeeded === orderIds.length) {
            toast({ title: '삭제 완료', description: `${succeeded}개의 주문이 삭제되었습니다.`, variant: 'success' });
        } else {
            toast({ title: '일부 삭제 실패', description: `${succeeded}개 성공, ${orderIds.length - succeeded}개 실패`, variant: 'destructive' });
        }
    }, [deleteMutation, toast]);

    return {
        orders: ordersData?.list || [],
        totalRows: ordersData?.total || 0,
        isLoading,
        pagination,
        onPaginationChange: setPagination,
        searchParams,
        onSearch,
        onSortChange,
        dialogOpen,
        selectedOrder,
        openDialog,
        closeDialog,
        handleSubmit,
        handleDelete,
    };
}
