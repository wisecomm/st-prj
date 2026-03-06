import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBoards, createBoard, updateBoard, deleteBoard, BoardMaster } from "@/app/(admin)/(with-header)/boards/master/actions";

export const boardKeys = {
    all: ["boards"] as const,
    lists: () => [...boardKeys.all, "list"] as const,
    list: (page: number, size: number, brdNm?: string, startDate?: string, endDate?: string) => [...boardKeys.lists(), { page, size, brdNm, startDate, endDate }] as const,
    detail: (id: string) => [...boardKeys.all, "detail", id] as const,
};

export function useBoards(page: number, size: number, brdNm?: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: boardKeys.list(page, size, brdNm, startDate, endDate),
        queryFn: async () => {
            const res = await getBoards(page, size, brdNm, startDate, endDate);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useCreateBoard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<BoardMaster>) => {
            const res = await createBoard(data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useUpdateBoard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<BoardMaster> }) => {
            const res = await updateBoard(id, data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useDeleteBoard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await deleteBoard(id);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}
