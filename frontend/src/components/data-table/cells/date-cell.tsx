"use client";

import { cn } from "@/lib/utils";
import { BaseCellProps, sizeStyles, alignStyles } from "./cell-types";

type DateFormat = "date" | "datetime" | "time" | "relative";

interface DateCellProps extends BaseCellProps {
    value: string | Date | null | undefined;
    /** 날짜 포맷 옵션 */
    format?: DateFormat;
    /** 로케일 */
    locale?: string;
}

/**
 * 날짜 포맷팅 셀 렌더러
 * 
 * @example
 * // 날짜만 표시
 * <DateCell value={row.getValue("createdAt")} format="date" />
 * 
 * // 날짜+시간 표시
 * <DateCell value={row.getValue("createdAt")} format="datetime" />
 * 
 * // 상대 시간 (3시간 전)
 * <DateCell value={row.getValue("createdAt")} format="relative" />
 */
export function DateCell({
    value,
    format = "datetime",
    locale = "ko-KR",
    align = "center",
    size = "sm",
    className,
    fallback = "-",
}: DateCellProps) {
    if (!value) {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    const date = typeof value === "string" ? new Date(value) : value;

    if (isNaN(date.getTime())) {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    let formatted: string;

    switch (format) {
        case "date":
            formatted = date.toLocaleDateString(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            break;
        case "time":
            formatted = date.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
            });
            break;
        case "relative":
            formatted = getRelativeTime(date, locale);
            break;
        case "datetime":
        default:
            formatted = date.toLocaleString(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
    }

    // ko-KR 로케일에서 날짜 사이의 마침표 제거 (예: 2025. 12. 30. -> 2025-12-30)
    if (locale === "ko-KR") {
        formatted = formatted.replace(/\./g, "-").replace(/- /g, " ").replace(/-$/g, "").trim();
    }

    return (
        <div
            className={cn(
                "text-muted-foreground tabular-nums",
                sizeStyles[size],
                alignStyles[align],
                className
            )}
        >
            {formatted}
        </div>
    );
}

/**
 * 상대 시간 계산 (예: "3시간 전", "2일 전")
 */
function getRelativeTime(date: Date, locale: string): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffDays > 30) {
        return date.toLocaleDateString(locale);
    } else if (diffDays > 0) {
        return rtf.format(-diffDays, "day");
    } else if (diffHours > 0) {
        return rtf.format(-diffHours, "hour");
    } else if (diffMins > 0) {
        return rtf.format(-diffMins, "minute");
    } else {
        return rtf.format(-diffSecs, "second");
    }
}

// 프리셋
/** 날짜만 표시 */
export const DateOnlyCell = ({ value, ...props }: Omit<DateCellProps, "format">) => (
    <DateCell value={value} format="date" {...props} />
);

/** 시간만 표시 */
export const TimeOnlyCell = ({ value, ...props }: Omit<DateCellProps, "format">) => (
    <DateCell value={value} format="time" {...props} />
);

/** 상대 시간 표시 */
export const RelativeTimeCell = ({ value, ...props }: Omit<DateCellProps, "format">) => (
    <DateCell value={value} format="relative" {...props} />
);
