import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBoards, getBoardById, createBoard, updateBoard, deleteBoard, Board, BoardSearchDto } from "@/app/(admin)/(with-header)/boards/board/actions";

export const boardPostKeys = {
    all: ["boardPosts"] as const,
    lists: () => [...boardPostKeys.all, "list"] as const,
    list: (params: BoardSearchDto) => [...boardPostKeys.lists(), params] as const,
    detail: (id: number) => [...boardPostKeys.all, "detail", id] as const,
};

export function useBoardPosts(params: BoardSearchDto) {
    return useQuery({
        queryKey: boardPostKeys.list(params),
        queryFn: async () => {
            const res = await getBoards(params);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        enabled: !!params.brdId, // Only fetch if board ID is selected (or handle in backend)
    });
}

export function useBoardPost(boardId?: number) {
    return useQuery({
        queryKey: boardPostKeys.detail(boardId!),
        queryFn: async () => {
            if (!boardId) throw new Error("Board ID is required");
            const res = await getBoardById(boardId);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        enabled: !!boardId,
    });
}

export function useCreateBoardPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: FormData | Partial<Board>) => {
            const res = await createBoard(data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardPostKeys.all });
        },
    });
}

export function useUpdateBoardPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData | Partial<Board> }) => {
            const res = await updateBoard(id, data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardPostKeys.all });
        },
    });
}

export function useDeleteBoardPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await deleteBoard(id);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardPostKeys.all });
        },
    });
}
