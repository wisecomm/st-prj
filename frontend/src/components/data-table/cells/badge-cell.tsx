"use client";

import { cn } from "@/lib/utils";
import { BaseCellProps, sizeStyles, alignStyles } from "./cell-types";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "outline";

interface BadgeCellProps extends BaseCellProps {
    value: string | null | undefined;
    /** 배지 스타일 변형 */
    variant?: BadgeVariant;
    /** 값-스타일 매핑 (동적 variant) */
    valueMap?: Record<string, { label?: string; variant: BadgeVariant }>;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-muted text-foreground ring-border",
    success: "bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400",
    outline: "bg-transparent text-foreground ring-border",
};

/**
 * 배지 셀 렌더러
 * 
 * @example
 * // 기본 사용
 * <BadgeCell value="활성" variant="success" />
 * 
 * // valueMap으로 동적 매핑
 * <BadgeCell 
 *   value={row.getValue("status")} 
 *   valueMap={{
 *     "ACTIVE": { label: "활성", variant: "success" },
 *     "INACTIVE": { label: "비활성", variant: "error" },
 *     "PENDING": { label: "대기중", variant: "warning" },
 *   }}
 * />
 */
export function BadgeCell({
    value,
    variant = "default",
    valueMap,
    align = "center",
    size = "xs",
    className,
    fallback = "-",
}: BadgeCellProps) {
    if (!value) {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    // valueMap이 있으면 매핑된 값 사용
    let displayLabel = value;
    let displayVariant = variant;

    if (valueMap && valueMap[value]) {
        const mapped = valueMap[value];
        displayLabel = mapped.label ?? value;
        displayVariant = mapped.variant;
    }

    return (
        <div className={cn(alignStyles[align], "flex justify-center")}>
            <span
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-inset",
                    sizeStyles[size],
                    variantStyles[displayVariant],
                    className
                )}
            >
                {displayLabel}
            </span>
        </div>
    );
}

// 프리셋
/** 상태 배지 (활성/비활성) */
export const StatusBadgeCell = ({ value, ...props }: Omit<BadgeCellProps, "valueMap">) => (
    <BadgeCell
        value={value}
        valueMap={{
            "Y": { label: "사용", variant: "success" },
            "N": { label: "미사용", variant: "error" },
            "1": { label: "사용", variant: "success" },
            "0": { label: "미사용", variant: "error" },
            "ACTIVE": { label: "활성", variant: "success" },
            "INACTIVE": { label: "비활성", variant: "error" },
        }}
        {...props}
    />
);
