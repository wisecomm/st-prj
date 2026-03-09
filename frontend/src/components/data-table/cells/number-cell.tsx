"use client";

import { cn } from "@/lib/utils";
import { BaseCellProps, sizeStyles, alignStyles } from "./cell-types";

interface NumberCellProps extends BaseCellProps {
    value: number | string | null | undefined;
    /** 숫자 포맷 옵션 */
    format?: "number" | "currency" | "percent" | "compact";
    /** 통화 코드 (currency 포맷 시 사용) */
    currency?: string;
    /** 소수점 자릿수 */
    decimals?: number;
    /** 음수일 때 빨간색 표시 */
    colorize?: boolean;
    /** 부호 표시 (+/-) */
    showSign?: boolean;
    /** 로케일 */
    locale?: string;
}

/**
 * 숫자 셀 렌더러
 * 
 * @example
 * // 기본 숫자
 * <NumberCell value={12345} />
 * 
 * // 통화 형식
 * <NumberCell value={50000} format="currency" currency="KRW" />
 * 
 * // 백분율
 * <NumberCell value={0.156} format="percent" decimals={1} />
 * 
 * // 축약형 (1.2만, 3.5억)
 * <NumberCell value={12500} format="compact" />
 */
export function NumberCell({
    value,
    format = "number",
    currency = "KRW",
    decimals,
    colorize = false,
    showSign = false,
    locale = "ko-KR",
    align = "right",
    size = "sm",
    className,
    fallback = "-",
}: NumberCellProps) {
    // Null/undefined 처리
    if (value === null || value === undefined || value === "") {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    // 문자열이면 숫자로 변환
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    let formatted: string;
    const options: Intl.NumberFormatOptions = {};

    switch (format) {
        case "currency":
            options.style = "currency";
            options.currency = currency;
            if (currency === "KRW" || currency === "JPY") {
                options.minimumFractionDigits = 0;
                options.maximumFractionDigits = 0;
            } else {
                options.minimumFractionDigits = decimals ?? 2;
                options.maximumFractionDigits = decimals ?? 2;
            }
            formatted = new Intl.NumberFormat(locale, options).format(numValue);
            break;

        case "percent":
            options.style = "percent";
            options.minimumFractionDigits = decimals ?? 0;
            options.maximumFractionDigits = decimals ?? 0;
            formatted = new Intl.NumberFormat(locale, options).format(numValue);
            break;

        case "compact":
            options.notation = "compact";
            options.compactDisplay = "short";
            formatted = new Intl.NumberFormat(locale, options).format(numValue);
            break;

        case "number":
        default:
            if (decimals !== undefined) {
                options.minimumFractionDigits = decimals;
                options.maximumFractionDigits = decimals;
            }
            formatted = new Intl.NumberFormat(locale, options).format(numValue);
    }

    // 부호 추가
    if (showSign && numValue > 0) {
        formatted = `+${formatted}`;
    }

    // 색상 결정
    const isNegative = numValue < 0;
    const colorClass = colorize
        ? isNegative
            ? "text-destructive"
            : numValue > 0
                ? "text-green-600 dark:text-green-500"
                : "text-foreground"
        : "text-foreground";

    return (
        <div
            className={cn(
                "tabular-nums font-medium",
                sizeStyles[size],
                alignStyles[align],
                colorClass,
                className
            )}
        >
            {formatted}
        </div>
    );
}

// 프리셋
/** 통화 셀 (KRW) */
export const CurrencyCell = ({ value, ...props }: Omit<NumberCellProps, "format">) => (
    <NumberCell value={value} format="currency" currency="KRW" {...props} />
);

/** 백분율 셀 */
export const PercentCell = ({ value, decimals = 1, ...props }: Omit<NumberCellProps, "format">) => (
    <NumberCell value={value} format="percent" decimals={decimals} {...props} />
);

/** 수량 셀 (정수, 중앙 정렬) */
export const QuantityCell = ({ value, ...props }: Omit<NumberCellProps, "format" | "align" | "decimals">) => (
    <NumberCell value={value} format="number" align="center" decimals={0} {...props} />
);
