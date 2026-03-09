import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, createRole, updateRole, deleteRole, getRoleMenus, assignRoleMenus } from "@/app/(admin)/roles/actions";
import { RoleInfo } from "@/types";

export const roleKeys = {
    all: ["roles"] as const,
    lists: () => [...roleKeys.all, "list"] as const,
    list: (page: number, size: number, searchId?: string) => [...roleKeys.lists(), { page, size, searchId }] as const,
    detail: (id: string) => [...roleKeys.all, "detail", id] as const,
    menus: (id: string) => [...roleKeys.detail(id), "menus"] as const,
};

export function useRoles(page: number, size: number, searchId?: string) {
    return useQuery({
        queryKey: roleKeys.list(page, size, searchId),
        queryFn: async () => {
            // If default pagination/search is needed, handle undefined searchId
            const res = await getRoles(page, size, searchId);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useRoleMenus(roleId: string | undefined) {
    return useQuery({
        queryKey: roleKeys.menus(roleId || ""),
        queryFn: async () => {
            const res = await getRoleMenus(roleId!);
            if (res.code !== "200") throw new Error(res.message);
            return res.data || [];
        },
        enabled: !!roleId,
    });
}

export function useCreateRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<RoleInfo>) => {
            const res = await createRole(data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
}

export function useUpdateRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<RoleInfo> }) => {
            const res = await updateRole(id, data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
}

export function useDeleteRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await deleteRole(id);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
}

export function useAssignRoleMenus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) => {
            const res = await assignRoleMenus(roleId, menuIds);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: roleKeys.menus(variables.roleId) });
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
}
