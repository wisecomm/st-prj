/**
 * API Client Layer
 * 
 * 중앙화된 API 호출 및 에러 처리를 제공합니다.
 * 모든 API 요청은 이 레이어를 통해 처리되어야 합니다.
 * 
 * [Refactor Note]: Server-Side Token Authentication (Cookies)으로 전환됨에 따라
 * 클라이언트 측에서의 토큰 주입 및 갱신 로직이 제거되었습니다.
 * 이제 Next.js Proxy (`app/api/[...path]/route.ts`)가 자동으로 쿠키에서 토큰을 읽어 주입합니다.
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from 'axios';
import { ApiResponse } from '@/types';
import { serverEnv } from '@/lib/env';
import { globalToast } from '@/hooks/use-toast';

/**
 * Axios 인스턴스 생성
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    // Next.js Proxy 사용 (app/api/[...path]/route.ts 참고)
    // 개발/운영 환경 모두 /api/backend 경로로 요청하면 Manual Proxy가 백엔드로 전달합니다.
    baseURL: typeof window === 'undefined' ? serverEnv.BACKEND_API_URL : '/api/backend',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(val => searchParams.append(key, String(val)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      return searchParams.toString();
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      // [Modified] 토큰 주입 로직 제거 (Proxy가 쿠키 기반으로 처리)

      // FormData인 경우 Content-Type 헤더 제거 (브라우저가 자동으로 multipart/form-data 및 boundary 설정)
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
      // [Modified] 토큰 갱신 로직 제거 (Proxy가 처리)
      // 401 에러가 여기까지 도달했다는 것은 Proxy에서의 갱신도 실패했다는 의미입니다.
      // (예: 리프레시 토큰 만료)
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          // 세션 만료 시 로그인 페이지로 이동
          console.warn('[ApiClient] 401 Unauthorized detected. Executing logout...');

          if (window.location.pathname !== '/login') {
            // 현재 페이지의 URL을 redirect_to 파라미터로 넘길 수도 있지만, 
            // 가장 간단하게 로그인 페이지로 바로 이동시킵니다.
            window.location.href = '/login?expired=true';
          }
        }
        return Promise.reject(error);
      }

      // 401 이외의 통신 에러/서버 에러가 발생한 경우 자동 Toast 알림 처리
      if (typeof window !== 'undefined') {
        const errorMessage = extractErrorMessage(error, "요청 처리 중 오류가 발생했습니다.");
        globalToast({
          title: "요청 실패",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

/**
 * API 에러 정보를 추출하는 헬퍼 함수
 */
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * API 응답을 표준화된 ApiResponse 형태로 변환
 */
function createErrorResponse<T>(error: unknown, defaultMessage: string): ApiResponse<T> {
  const message = extractErrorMessage(error, defaultMessage);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const code = status ? status.toString() : '500';
    return { code, message, data: null };
  }

  return { code: '500', message, data: null };
}

/**
 * API 요청을 래핑하여 일관된 에러 처리 제공
 */
async function handleRequest<T>(
  request: () => Promise<ApiResponse<T>>,
  errorMessage: string
): Promise<ApiResponse<T>> {
  try {
    return await request();
  } catch (error) {
    console.error(`[API Error]: ${errorMessage}`, error);
    return createErrorResponse<T>(error, errorMessage);
  }
}

/**
 * API Client 클래스
 */
class ApiClient {
  /**
   * GET 요청
   */
  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined | string[] | number[]>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return handleRequest(
      () => api.get(url, { ...config, params }),
      `Failed to GET ${url}`
    );
  }

  /**
   * POST 요청
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return handleRequest(
      () => api.post(url, data, config),
      `Failed to POST ${url}`
    );
  }

  /**
   * PUT 요청
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return handleRequest(
      () => api.put(url, data, config),
      `Failed to PUT ${url}`
    );
  }

  /**
   * PATCH 요청
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return handleRequest(
      () => api.patch(url, data, config),
      `Failed to PATCH ${url}`
    );
  }

  /**
   * DELETE 요청
   */
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return handleRequest(
      () => api.delete(url, config),
      `Failed to DELETE ${url}`
    );
  }

  /**
   * 파라미터를 URLSearchParams로 변환
   */
  buildParams(params: Record<string, string | number | boolean | undefined | string[] | number[]>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(val => searchParams.append(key, String(val)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams;
  }

  /**
   * URL에 쿼리 파라미터를 추가
   */
  buildUrl(baseUrl: string, params?: Record<string, string | number | boolean | undefined | string[] | number[]>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const searchParams = this.buildParams(params);
    const queryString = searchParams.toString();

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}

/**
 * 싱글톤 인스턴스 export
 */
export const apiClient = new ApiClient();

/**
 * Raw axios 인스턴스 (특수한 경우에만 사용)
 */
export { api };
