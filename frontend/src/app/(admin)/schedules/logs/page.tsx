"use client";

import * as React from "react";
import { PaginationState } from "@tanstack/react-table";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { useScheduleLogs } from "./hooks/use-schedule-logs";
import { useDataTable } from "@/components/data-table/use-data-table";
import { SearchPageLayout } from "@/components/common/search-page-layout";

export default function ScheduleLogsPage() {
    // Pagination state (Client side since backend returns flat list)
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    });

    const { data: logsData, isLoading } = useScheduleLogs();

    const columns = React.useMemo(() => getColumns(), []);

    // Manual client-side pagination
    const tableData = logsData || [];
    const totalItems = tableData.length;
    const pageCount = Math.ceil(totalItems / pagination.pageSize);

    const pagedData = React.useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return tableData.slice(start, end);
    }, [tableData, pagination]);

    const table = useDataTable({
        data: pagedData,
        columns,
        pageCount: pageCount,
        pagination,
        onPaginationChange: setPagination,
        enableMultiRowSelection: false,
    });

    return (
        <div className="w-full space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">스케줄 실행 로그</h2>
            <SearchPageLayout>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <span className="text-muted-foreground">로딩 중...</span>
                    </div>
                ) : (
                    <DataTable table={table} showSeparators={true} />
                )}
            </SearchPageLayout>
        </div>
    );
}
