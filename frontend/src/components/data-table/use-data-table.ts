import * as React from "react";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Table,
    ColumnDef,
    SortingState,
    VisibilityState,
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
    OnChangeFn,
} from "@tanstack/react-table";

interface UseDataTableProps<TData, TValue> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    enableMultiRowSelection?: boolean;
}

export function useDataTable<TData, TValue>({
    data,
    columns,
    pageCount = -1,
    pagination,
    onPaginationChange,
    enableMultiRowSelection = false,
}: UseDataTableProps<TData, TValue>): Table<TData> {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    // If pagination is not provided, we could manage it internally, 
    // but for now we assume it's primarily used for server-side pagination contexts.
    // If we wanted client-side pagination default, we'd add useState here.

    return useReactTable({
        data,
        columns,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination: !!pagination, // Pagination state가 있으면 manual로 간주

        // Sorting Defaults - 이곳에 공통 설정을 포함합니다.
        defaultColumn: {
            enableSorting: false, // 기본적으로 정렬 비활성화 (Opt-in)
        },

        // Handlers
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: onPaginationChange,

        // Models
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(), // 정렬 모델 내장
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),

        // Options
        enableMultiRowSelection,
    });
}
