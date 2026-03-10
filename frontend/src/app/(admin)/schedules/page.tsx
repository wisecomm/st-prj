"use client";

import * as React from "react";
import { PaginationState } from "@tanstack/react-table";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { Schedule, ScheduleRequest } from "@/types";
import {
    useSchedules,
    useCreateSchedule,
    useUpdateSchedule,
    useDeleteSchedule,
    useExecuteSchedule
} from "@/app/(admin)/schedules/hooks/use-schedules";
import { ScheduleDialog } from "./schedule-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDataTable } from "@/components/data-table/use-data-table";
import { SearchPageLayout } from "@/components/common/search-page-layout";

export default function SchedulesPage() {
    const { toast } = useToast();

    // Pagination state (Client side since backend returns flat list)
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: schedulesData } = useSchedules();
    const createScheduleMutation = useCreateSchedule();
    const updateScheduleMutation = useUpdateSchedule();
    const deleteScheduleMutation = useDeleteSchedule();
    const executeScheduleMutation = useExecuteSchedule();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null);

    const handleAdd = () => {
        setSelectedSchedule(null);
        setDialogOpen(true);
    };

    const handleRowEdit = React.useCallback((schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setDialogOpen(true);
    }, []);

    const columns = React.useMemo(() => getColumns(), []);

    // We have a flat list, so we calculate total pages for client pagination manually
    const tableData = schedulesData || [];
    const totalItems = tableData.length;
    const pageCount = Math.ceil(totalItems / pagination.pageSize);

    // Provide the slice of data the table wants for this page
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

    // Toolbar handlers (using table instance)
    const handleToolbarEdit = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length !== 1) {
            toast({
                title: "알림",
                description: "수정할 스케줄을 정상적으로 하나만 선택해주세요.",
                variant: "default",
            });
            return;
        }
        handleRowEdit(selectedRows[0].original);
    };

    const handleToolbarDelete = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
            toast({
                title: "알림",
                description: "삭제할 스케줄을 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const uids = selectedRows.map(row => row.original.uid);
        if (confirm(`선택한 ${uids.length}개의 스케줄을 삭제하시겠습니까?`)) {
            try {
                for (const id of uids) {
                    await deleteScheduleMutation.mutateAsync(id);
                }
                table.resetRowSelection();
                toast({ title: "삭제 완료", description: "스케줄이 삭제되었습니다.", variant: "success" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                toast({ title: "삭제 실패", description: message || "Failed to delete schedule.", variant: "destructive" });
            }
        }
    };

    const handleToolbarExecute = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length !== 1) {
            toast({
                title: "알림",
                description: "강제 실행할 스케줄을 하나만 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const selectedUid = selectedRows[0].original.uid;
        if (confirm("선택한 스케줄을 즉시 백그라운드에서 강제 실행하시겠습니까? (이전 스케줄 트리거와 무관하게 즉시 동작합니다)")) {
            try {
                const response = await executeScheduleMutation.mutateAsync(selectedUid);
                toast({ title: "실행 성공", description: response.data || "스케줄이 성공적으로 실행되었습니다.", variant: "success" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                toast({ title: "실행 실패", description: message, variant: "destructive" });
            }
        }
    };

    const handleFormSubmit = async (formData: ScheduleRequest) => {
        try {
            if (selectedSchedule) {
                await updateScheduleMutation.mutateAsync({ uid: selectedSchedule.uid, data: formData });
                toast({ title: "수정 완료", description: "스케줄 정보가 변경되어 즉시 재등록 되었습니다.", variant: "success" });
            } else {
                await createScheduleMutation.mutateAsync(formData);
                toast({ title: "등록 완료", description: "새 스케줄이 등록되었고 활성화됩니다.", variant: "success" });
            }
            setDialogOpen(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast({ title: "오류 발생", description: message || "An error occurred.", variant: "destructive" });
        }
    };

    return (
        <div className="w-full space-y-6">
            <SearchPageLayout>
                <DataTableToolbar
                    onAdd={handleAdd}
                    onEdit={handleToolbarEdit}
                    onDelete={handleToolbarDelete}
                    onExecute={handleToolbarExecute}
                />
                <DataTable table={table} showSeparators={true} />
            </SearchPageLayout>

            <ScheduleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                schedule={selectedSchedule}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
