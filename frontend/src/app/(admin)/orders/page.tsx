"use client";

/**
 * Orders Page
 * 
 * Resource Factory 기반 주문 관리 페이지
 */

import * as React from "react";
import 'so-grid-react/styles.css';
import { getColumns } from "./columns";
import { DataTableToolbar } from "./data-table-toolbar";
import { SearchPageLayout } from "@/components/common/search-page-layout";
import { InputDialog } from "./input-dialog";
import { useOrderManagement } from "./hooks/use-order-management";
import { useToast } from "@/hooks/use-toast";
import { PaginationState, SOGrid, SOGridApi, SortModel } from "so-grid-react";
import { OrderDetail } from "./types";
import { CustomPagination } from "@/components/utils/CustomPagination";

export default function OrdersPage() {
    const { toast } = useToast();

    // 주문 관리 비즈니스 로직 훅
    const {
        orders,
        totalRows,
        isLoading,
        pagination,
        onPaginationChange,
        searchParams,
        onSearch,
        dialogOpen,
        selectedOrder,
        openDialog,
        closeDialog,
        handleSubmit,
        handleDelete,
        onSortChange,
    } = useOrderManagement();

    // 테이블 컬럼 설정
    const columns = React.useMemo(() => getColumns(), []);

    const DEFAULT_COL_DEF = {
        headerStyle: { textAlign: 'center' as const },
        resizable: true,
    };

    // 그리드 API 참조
    const gridApiRef = React.useRef<SOGridApi<OrderDetail> | null>(null);
    const onGridReady = React.useCallback((api: SOGridApi<OrderDetail>) => {
        gridApiRef.current = api;
    }, []);

    /**
     * 추가 버튼 핸들러
     */
    const handleAdd = React.useCallback(() => {
        openDialog();
    }, [openDialog]);

    /**
     * 페이지네이션 변경 핸들러
     */
    const handlePaginationChange = React.useCallback((pagination: PaginationState) => {
        onPaginationChange(pagination);
    }, [onPaginationChange]);

    /**
     * 정렬 변경 핸들러
     */
    const handleSortChange = React.useCallback((sort: SortModel[]) => {
        onSortChange(sort);
    }, [onSortChange]);

    /**
     * 수정 버튼 핸들러
     */
    const handleEdit = React.useCallback(() => {
        const selectedRows = gridApiRef.current?.getSelectedRows();

        if (!selectedRows || selectedRows.length === 0) {
            toast({
                title: "알림",
                description: "수정할 주문을 하나만 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const selectedData = selectedRows[0];
        openDialog(selectedData);
    }, [toast, openDialog]);

    /**
     * 삭제 버튼 핸들러
     */
    const handleDeleteClick = React.useCallback(async () => {
        const selectedRows = gridApiRef.current?.getSelectedRows();

        if (!selectedRows || selectedRows.length === 0) {
            toast({
                title: "알림",
                description: "삭제할 주문을 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const ids = selectedRows.map(row => row.orderId);
        await handleDelete(ids);
    }, [handleDelete, toast]);

    return (
        <div className="w-full space-y-6">
            <SearchPageLayout>
                <DataTableToolbar
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onSearch={onSearch}
                    isLoading={isLoading}
                    initialStartDate={searchParams.startDate}
                    initialEndDate={searchParams.endDate}
                />
            </SearchPageLayout>
            <SOGrid
                rowData={orders}
                columnDefs={columns}
                defaultColDef={DEFAULT_COL_DEF}
                pagination={true}
                PaginationComponent={CustomPagination}
                serverSide={true}
                totalRows={totalRows}
                paginationPageSize={pagination.pageSize}
                onPaginationChange={handlePaginationChange}
                loading={isLoading}
                onSortChange={handleSortChange}
                onGridReady={onGridReady}
                pageIndex={pagination.pageIndex}
            />

            <InputDialog
                open={dialogOpen}
                onOpenChange={closeDialog}
                order={selectedOrder}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
