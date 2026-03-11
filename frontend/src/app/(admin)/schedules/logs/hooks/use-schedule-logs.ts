import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ScheduleLog, ApiResponse } from '@/types';

// Query Keys
const queryKeys = {
    all: ['scheduleLogs'] as const,
    lists: () => [...queryKeys.all, 'list'] as const,
};

// --- API Calls ---

const getScheduleLogs = async (): Promise<ScheduleLog[]> => {
    const response = await api.get<ApiResponse<ScheduleLog[]>>('/v1/mgmt/schedules/logs');
    // response interceptor already unwraps response.data, so response IS the ApiResponse
    const result = response as unknown as ApiResponse<ScheduleLog[]>;
    if (result.code !== '200') {
        throw new Error(result.message || 'Failed to fetch schedule logs');
    }
    return result.data || [];
};


// --- Hooks ---

export function useScheduleLogs() {
    return useQuery({
        queryKey: queryKeys.lists(),
        queryFn: getScheduleLogs,
    });
}
