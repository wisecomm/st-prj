"use client";

import { cn } from "@/lib/utils";
import { BaseCellProps, sizeStyles, alignStyles } from "./cell-types";
import { Check, X } from "lucide-react";

interface BooleanCellProps extends BaseCellProps {
    value: boolean | string | number | null | undefined;
    /** true일 때 표시할 텍스트 */
    trueLabel?: string;
    /** false일 때 표시할 텍스트 */
    falseLabel?: string;
    /** 아이콘 표시 여부 */
    showIcon?: boolean;
    /** 아이콘만 표시 (라벨 숨김) */
    iconOnly?: boolean;
}

/**
 * 불리언 셀 렌더러
 * 
 * @example
 * // 기본 사용 (Y/N 텍스트)
 * <BooleanCell value={row.getValue("useYn")} />
 * 
 * // 커스텀 라벨
 * <BooleanCell value={true} trueLabel="활성" falseLabel="비활성" />
 * 
 * // 아이콘 표시
 * <BooleanCell value="Y" showIcon />
 * 
 * // 아이콘만 표시
 * <BooleanCell value={1} iconOnly />
 */
export function BooleanCell({
    value,
    trueLabel = "Y",
    falseLabel = "N",
    showIcon = false,
    iconOnly = false,
    align = "center",
    size = "sm",
    className,
    fallback = "-",
}: BooleanCellProps) {
    // null/undefined 처리
    if (value === null || value === undefined || value === "") {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    // boolean 값으로 변환
    let boolValue: boolean;
    if (typeof value === "boolean") {
        boolValue = value;
    } else if (typeof value === "string") {
        boolValue = value.toUpperCase() === "Y" || value === "1" || value.toLowerCase() === "true";
    } else {
        boolValue = value === 1;
    }

    const displayLabel = boolValue ? trueLabel : falseLabel;
    const colorClass = boolValue
        ? "text-green-600 dark:text-green-500"
        : "text-muted-foreground";

    const IconComponent = boolValue ? Check : X;

    return (
        <div
            className={cn(
                "flex items-center gap-1",
                alignStyles[align],
                align === "center" && "justify-center",
                align === "right" && "justify-end",
                sizeStyles[size],
                colorClass,
                className
            )}
        >
            {(showIcon || iconOnly) && (
                <IconComponent className="h-4 w-4" />
            )}
            {!iconOnly && (
                <span className="font-medium">{displayLabel}</span>
            )}
        </div>
    );
}

// 프리셋
/** 체크 아이콘만 표시 */
export const CheckIconCell = ({ value, ...props }: Omit<BooleanCellProps, "iconOnly" | "showIcon">) => (
    <BooleanCell value={value} iconOnly {...props} />
);

/** 사용 여부 셀 */
export const UseYnCell = ({ value, ...props }: Omit<BooleanCellProps, "trueLabel" | "falseLabel" | "showIcon">) => (
    <BooleanCell value={value} trueLabel="사용" falseLabel="미사용" showIcon {...props} />
);
