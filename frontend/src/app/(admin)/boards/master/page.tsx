"use client";

import * as React from "react";
import { PaginationState } from "@tanstack/react-table";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { BoardMaster } from "./actions";
import { useBoards, useUpdateBoard, useCreateBoard, useDeleteBoard } from "@/hooks/useBoardQuery";
import { BoardDialog } from "./board-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDataTable } from "@/components/data-table/use-data-table";
import { SearchPageLayout } from "@/components/common/search-page-layout";

export default function BoardsPage() {
    const { toast } = useToast();

    // Search state
    const today = new Date();
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [searchParams, setSearchParams] = React.useState({
        brdNm: "",
        startDate: "",
        endDate: formatDate(today)
    });

    // Pagination state
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: boardsData, isLoading } = useBoards(pagination.pageIndex, pagination.pageSize, searchParams.brdNm, searchParams.startDate, searchParams.endDate);
    const createBoardMutation = useCreateBoard();
    const updateBoardMutation = useUpdateBoard();
    const deleteBoardMutation = useDeleteBoard();

    // Dialog state
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedBoard, setSelectedBoard] = React.useState<BoardMaster | null>(null);

    const handleAdd = () => {
        setSelectedBoard(null);
        setDialogOpen(true);
    };

    const handleFormSubmit = async (formData: Partial<BoardMaster>) => {
        try {
            if (selectedBoard) {
                await updateBoardMutation.mutateAsync({ id: selectedBoard.brdId, data: formData });
                toast({ title: "수정 완료", description: "게시판 정보가 수정되었습니다.", variant: "success" });
            } else {
                await createBoardMutation.mutateAsync(formData);
                toast({ title: "등록 완료", description: "새 게시판이 등록되었습니다.", variant: "success" });
            }
            setDialogOpen(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast({ title: "오류 발생", description: message || "An error occurred.", variant: "destructive" });
        }
    };

    const columns = React.useMemo(() => getColumns(), []);

    // Selection mode
    const selectionMode: 'single' | 'multi' | undefined = 'single';

    const table = useDataTable({
        data: boardsData?.list || [],
        columns,
        pageCount: boardsData?.pages || -1,
        pagination,
        onPaginationChange: setPagination,
        enableMultiRowSelection: (selectionMode as string) === 'multi',
    });

    const handleEdit = React.useCallback(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length !== 1) {
            toast({
                title: "알림",
                description: "수정할 게시판을 하나만 선택해주세요.",
                variant: "default",
            });
            return;
        }
        const board = selectedRows[0].original;
        setSelectedBoard(board);
        setDialogOpen(true);
    }, [table, toast]);

    const handleDelete = React.useCallback(async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
            toast({
                title: "알림",
                description: "삭제할 게시판을 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const boardIds = selectedRows.map(row => row.original.brdId);
        if (confirm(`선택한 ${boardIds.length}개의 게시판을 삭제하시겠습니까?`)) {
            try {
                for (const id of boardIds) {
                    await deleteBoardMutation.mutateAsync(id);
                }
                table.resetRowSelection();
                toast({ title: "삭제 완료", description: "게시판이 삭제되었습니다.", variant: "success" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                toast({ title: "삭제 실패", description: message || "Failed to delete board.", variant: "destructive" });
            }
        }
    }, [table, deleteBoardMutation, toast]);

    const handleSearch = (params: { brdNm: string; startDate: string; endDate: string }) => {
        setSearchParams(params);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };



    // ... existing code

    return (
        <div className="w-full space-y-6">
            <SearchPageLayout>
                <DataTableToolbar
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    initialStartDate={searchParams.startDate}
                    initialEndDate={searchParams.endDate}
                />
                <DataTable table={table} showSeparators={true} />
            </SearchPageLayout>

            <BoardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                board={selectedBoard}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
