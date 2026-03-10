import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Schedule, ScheduleRequest } from "@/types";
import { getSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule, executeSchedule } from "../actions";

export const scheduleKeys = {
    all: ["schedules"] as const,
    lists: () => [...scheduleKeys.all, "list"] as const,
    list: () => [...scheduleKeys.lists()] as const,
    detail: (uid: number) => [...scheduleKeys.all, "detail", uid] as const,
};

export function useSchedules() {
    return useQuery({
        queryKey: scheduleKeys.list(),
        queryFn: async () => {
            const res = await getSchedules();
            if (res.code !== "200") throw new Error(res.message);
            // The backend for schedules returns a raw List natively instead of a Page model.
            return res.data || [];
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useScheduleDetail(uid: number | undefined) {
    return useQuery({
        queryKey: scheduleKeys.detail(uid!),
        queryFn: async () => {
            const res = await getSchedule(uid!);
            if (res.code !== "200") throw new Error(res.message);
            return res.data;
        },
        enabled: !!uid,
    });
}

export function useCreateSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ScheduleRequest) => {
            const res = await createSchedule(data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
        },
    });
}

export function useUpdateSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ uid, data }: { uid: number; data: ScheduleRequest }) => {
            const res = await updateSchedule(uid, data);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
        },
    });
}

export function useDeleteSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (uid: number) => {
            const res = await deleteSchedule(uid);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
        },
    });
}

export function useExecuteSchedule() {
    return useMutation({
        mutationFn: async (uid: number) => {
            const res = await executeSchedule(uid);
            if (res.code !== "200") throw new Error(res.message);
            return res;
        }
    });
}
