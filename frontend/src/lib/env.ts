import { z } from 'zod';

/**
 * 클라이언트 사이드 환경 변수 스키마 (NEXT_PUBLIC_)
 * 브라우저에서 접근 가능한 환경 변수만 정의
 */
const clientEnvSchema = z.object({
  NEXTAUTH_URL: z.string().default('http://localhost:3000'),
  /** 앱 환경 */
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'local']).optional(),
});

/**
 * 서버 사이드 전용 환경 변수 스키마
 * 브라우저에서 접근 불가 (undefined)
 */
const serverEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().default('KcYj15hzCstphnoPFlM6fav8QJ+pRj7WL3F4Zw+gu/I='),
  /** 백엔드 API URL (서버에서만 사용) */
  BACKEND_API_URL: z.string().optional(),
});

/**
 * 클라이언트 환경 변수 (브라우저 + 서버)
 */
export const env = clientEnvSchema.parse({
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

/**
 * 서버 전용 환경 변수 (API Routes, Server Actions에서만 사용)
 * 클라이언트에서 import하면 undefined 값들
 */
export const serverEnv = serverEnvSchema.parse({
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
});


/** 개발 환경 여부 */
export const isDev = env.NEXT_PUBLIC_APP_ENV === 'development' || env.NEXT_PUBLIC_APP_ENV === 'local';

/** 프로덕션 환경 여부 */
export const isProd = env.NEXT_PUBLIC_APP_ENV === 'production';
