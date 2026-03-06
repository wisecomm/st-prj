"use client";

import * as React from "react";
import { PaginationState } from "@tanstack/react-table";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { Board } from "./actions";
import { useBoardPosts, useUpdateBoardPost, useCreateBoardPost, useDeleteBoardPost } from "@/hooks/use-board-posts";
import { BoardDialog } from "./board-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDataTable } from "@/components/data-table/use-data-table";
import { useSearchParams } from "next/navigation";
import { SearchPageLayout } from "@/components/common/search-page-layout";

export default function BoardsPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <BoardsContent />
        </React.Suspense>
    );
}

function BoardsContent() {
    const { toast } = useToast();
    const searchParamsHook = useSearchParams();
    const brdIdParam = searchParamsHook.get("brdId") || "";

    // Search state
    const today = new Date();
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [searchParams, setSearchParams] = React.useState({
        brdId: brdIdParam,
        searchType: "title",
        keyword: "",
        startDate: "",
        endDate: formatDate(today)
    });

    React.useEffect(() => {
        if (brdIdParam && searchParams.brdId !== brdIdParam) {
            setSearchParams(prev => ({ ...prev, brdId: brdIdParam }));
        }
    }, [brdIdParam, searchParams.brdId]);

    // Pagination state
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: boardsData, isLoading } = useBoardPosts({
        ...searchParams,
        page: pagination.pageIndex,
        size: pagination.pageSize
    });

    const createBoardMutation = useCreateBoardPost();
    const updateBoardMutation = useUpdateBoardPost();
    const deleteBoardMutation = useDeleteBoardPost();

    // Dialog state
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedBoard, setSelectedBoard] = React.useState<Board | null>(null);

    const handleAdd = () => {
        setSelectedBoard(null);
        setDialogOpen(true);
    };

    const handleFormSubmit = async (data: Partial<Board> & { deleteFileIds?: number[] }, files: File[] | null) => {
        try {
            const formData = new FormData();

            // Append request data as JSON
            const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
            formData.append("request", jsonBlob);

            // Append files
            if (files) {
                files.forEach((file) => {
                    formData.append("files", file);
                });
            }

            if (selectedBoard) {
                await updateBoardMutation.mutateAsync({ id: selectedBoard.boardId, data: formData });
                toast({ title: "수정 완료", description: "게시물이 수정되었습니다.", variant: "success" });
            } else {
                await createBoardMutation.mutateAsync(formData);
                toast({ title: "등록 완료", description: "새 게시물이 등록되었습니다.", variant: "success" });
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
                description: "수정할 게시물을 하나만 선택해주세요.",
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
                description: "삭제할 게시물을 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const boardIds = selectedRows.map(row => row.original.boardId);
        if (confirm(`선택한 ${boardIds.length}개의 게시물을 삭제하시겠습니까?`)) {
            try {
                for (const id of boardIds) {
                    await deleteBoardMutation.mutateAsync(id);
                }
                table.resetRowSelection();
                toast({ title: "삭제 완료", description: "게시물이 삭제되었습니다.", variant: "success" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                toast({ title: "삭제 실패", description: message || "Failed to delete board.", variant: "destructive" });
            }
        }
    }, [table, deleteBoardMutation, toast]);

    const handleSearch = (params: {
        brdId: string;
        searchType: string;
        keyword: string;
        startDate: string;
        endDate: string
    }) => {
        setSearchParams(prev => ({
            ...prev,
            ...params,
            brdId: prev.brdId // Preserve the brdId from URL/state, ignore empty one from toolbar
        }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

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
                defaultBrdId={searchParams.brdId}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
