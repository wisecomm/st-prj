export interface ApiResponse<T> {
    code: string;
    message: string;
    data: T | null;
}

export interface PageResponse<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
    pages: number;
}




