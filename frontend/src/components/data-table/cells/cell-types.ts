"use client";

/**
 * 공통 셀 Props 인터페이스
 */
export interface BaseCellProps {
    /** 정렬 */
    align?: "left" | "center" | "right";
    /** 글자 크기 */
    size?: "xs" | "sm" | "md" | "lg";
    /** 추가 클래스 */
    className?: string;
    /** 빈 값일 때 표시할 텍스트 */
    fallback?: string;
}

/**
 * 사이즈별 텍스트 클래스
 */
export const sizeStyles = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
} as const;

/**
 * 정렬별 클래스
 */
export const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
} as const;
