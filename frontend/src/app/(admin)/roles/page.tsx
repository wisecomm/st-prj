"use client";

import * as React from "react";
import { PaginationState } from "@tanstack/react-table";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { RoleInfo } from "@/types";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, useAssignRoleMenus } from "@/app/(admin)/roles/hooks/useRoleQuery";
import { RoleDialog } from "./role-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDataTable } from "@/components/data-table/use-data-table";
import { SearchPageLayout } from "@/components/common/search-page-layout";

export default function RolesPage() {
    const { toast } = useToast();

    // Pagination state
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [searchId, setSearchId] = React.useState<string | undefined>(undefined);

    const { data: rolesData } = useRoles(pagination.pageIndex, pagination.pageSize, searchId);
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();
    const assignMenusMutation = useAssignRoleMenus();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState<RoleInfo | null>(null);

    const handleSearch = (term: string) => {
        setSearchId(term || undefined);
        setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
    };

    const handleAdd = () => {
        setSelectedRole(null);
        setDialogOpen(true);
    };

    // Row handlers (passed to columns) - These do NOT depend on 'table' instance
    const handleRowEdit = React.useCallback((role: RoleInfo) => {
        setSelectedRole(role);
        setDialogOpen(true);
    }, []);

    const columns = React.useMemo(() => getColumns(), []);

    // Selection mode: 'single' or 'multi' (defaults to 'single' if not specified)
    const selectionMode: 'single' | 'multi' | undefined = 'single';

    const table = useDataTable({
        data: rolesData?.list || [],
        columns,
        pageCount: rolesData?.pages || -1,
        pagination,
        onPaginationChange: setPagination,
        enableMultiRowSelection: (selectionMode as string) === 'multi',
    });

    // Toolbar handlers (using table instance)
    const handleToolbarEdit = async () => {
        // Since we are waiting for user interaction, this is synchronous from the button click perspective
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length !== 1) {
            toast({
                title: "알림",
                description: "수정할 권한을 하나만 선택해주세요.",
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
                description: "삭제할 권한을 선택해주세요.",
                variant: "default",
            });
            return;
        }

        const roleIds = selectedRows.map(row => row.original.roleId);
        if (confirm(`선택한 ${roleIds.length}개의 권한을 삭제하시겠습니까?`)) {
            try {
                for (const id of roleIds) {
                    await deleteRoleMutation.mutateAsync(id);
                }
                table.resetRowSelection();
                toast({ title: "삭제 완료", description: "권한이 삭제되었습니다.", variant: "success" });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                toast({ title: "삭제 실패", description: message || "Failed to delete role.", variant: "destructive" });
            }
        }
    };

    const handleFormSubmit = async (formData: Partial<RoleInfo>, menuIds: string[]) => {
        try {
            let roleId = selectedRole?.roleId;

            if (selectedRole) {
                await updateRoleMutation.mutateAsync({ id: selectedRole.roleId, data: formData });
                toast({ title: "수정 완료", description: "권한 정보가 수정되었습니다.", variant: "success" });
            } else {
                roleId = formData.roleId;
                await createRoleMutation.mutateAsync(formData);
                toast({ title: "등록 완료", description: "새 권한이 등록되었습니다.", variant: "success" });
            }

            if (roleId) {
                await assignMenusMutation.mutateAsync({ roleId, menuIds });
            }
            setDialogOpen(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast({ title: "오류 발생", description: message || "An error occurred.", variant: "destructive" });
        }
    };



    // ...

    return (
        <div className="w-full space-y-6">
            <SearchPageLayout>
                <DataTableToolbar
                    onAdd={handleAdd}
                    onEdit={handleToolbarEdit}
                    onDelete={handleToolbarDelete}
                    onSearch={handleSearch}
                />
                <DataTable table={table} showSeparators={true} />
            </SearchPageLayout>

            <RoleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                role={selectedRole}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
