/**
 * API 타입 정의 및 유틸리티
 */

import { ApiResponse } from './index';

/**
 * API 응답 코드 타입
 */
export type ApiCode = '200' | '400' | '401' | '403' | '404' | '500';

/**
 * API 성공 응답 타입
 */
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
    code: '200';
    data: T;
}

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse extends ApiResponse<null> {
    code: Exclude<ApiCode, '200'>;
    data: null;
}

/**
 * API 응답 타입 가드: 성공 응답인지 확인
 */
export function isSuccessResponse<T>(
    response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
    return response.code === '200';
}

/**
 * API 응답 타입 가드: 에러 응답인지 확인
 */
export function isErrorResponse<T>(
    response: ApiResponse<T>
): response is ApiErrorResponse {
    return response.code !== '200';
}

/**
 * API 응답에서 데이터를 안전하게 추출
 * 에러인 경우 예외를 발생시킴
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
    if (isSuccessResponse(response)) {
        return response.data;
    }
    throw new Error(response.message);
}

/**
 * API 응답에서 데이터를 안전하게 추출
 * 에러인 경우 기본값 반환
 */
export function unwrapResponseOr<T>(response: ApiResponse<T>, defaultValue: T): T {
    if (isSuccessResponse(response)) {
        return response.data;
    }
    return defaultValue;
}

/**
 * API 결과 타입 (Result 패턴)
 */
export type ApiResult<T, E = string> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * ApiResponse를 ApiResult로 변환
 */
export function toResult<T>(response: ApiResponse<T>): ApiResult<T> {
    if (isSuccessResponse(response)) {
        return { success: true, data: response.data };
    }
    return { success: false, error: response.message };
}

/**
 * 여러 API 응답을 결합
 */
export async function combineResponses<T extends unknown[]>(
    ...responses: { [K in keyof T]: Promise<ApiResponse<T[K]>> }
): Promise<ApiResult<T>> {
    try {
        const results = await Promise.all(responses);
        const hasError = results.some(isErrorResponse);

        if (hasError) {
            const errorResponse = results.find(isErrorResponse);
            return { success: false, error: errorResponse?.message || 'Unknown error' };
        }

        const data = results.map(r => r.data) as T;
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to combine responses';
        return { success: false, error: message };
    }
}
