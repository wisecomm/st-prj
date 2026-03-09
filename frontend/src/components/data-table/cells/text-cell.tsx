"use client";

import { cn } from "@/lib/utils";
import { BaseCellProps, sizeStyles, alignStyles } from "./cell-types";

type TextVariant = "default" | "mono" | "muted" | "bold" | "link";

interface TextCellProps extends BaseCellProps {
    value: string | null | undefined;
    /** 최대 너비 (Tailwind class) */
    maxWidth?: string;
    /** 말줄임 적용 여부 */
    truncate?: boolean;
    /** 추가 스타일 변형 */
    variant?: TextVariant;
}

const variantStyles: Record<TextVariant, string> = {
    default: "text-foreground",
    mono: "font-mono font-medium text-foreground",
    muted: "text-muted-foreground",
    bold: "font-semibold text-foreground",
    link: "text-primary underline cursor-pointer hover:text-primary/80",
};

/**
 * 텍스트 셀 렌더러
 * 
 * @example
 * // 기본 사용 (좌측 정렬)
 * <TextCell value="안녕하세요" />
 * 
 * // 볼드 + 중앙 정렬
 * <TextCell value="제목" variant="bold" align="center" />
 * 
 * // 말줄임 처리
 * <TextCell value={longText} truncate maxWidth="max-w-[200px]" />
 */
export function TextCell({
    value,
    maxWidth = "max-w-[200px]",
    truncate = false,
    variant = "default",
    align = "left", // 기본: 좌측 정렬
    size = "sm",
    className,
    fallback = "-",
}: TextCellProps) {
    if (!value) {
        return <span className="text-muted-foreground">{fallback}</span>;
    }

    return (
        <div
            className={cn(
                variantStyles[variant],
                alignStyles[align],
                sizeStyles[size],
                truncate && maxWidth,
                truncate && "truncate",
                className
            )}
            title={truncate ? value : undefined}
        >
            {value}
        </div>
    );
}

// 프리셋

/** DescriptionCell: 설명용 셀 (Muted + 말줄임) */
export const DescriptionCell = ({ value, size }: { value: string | null; size?: string }) => (
    <TextCell value={value} variant="muted" truncate maxWidth="max-w-[300px]" size={size as BaseCellProps["size"]} />
);

/** LinkCell: 링크 스타일 셀 */
export const LinkCell = ({ value, onClick }: { value: string | null; onClick?: () => void }) => (
    <div onClick={onClick}>
        <TextCell value={value} variant="link" />
    </div>
);

/** MonoCell: 고정폭 폰트 셀 (코드, ID 등) */
export const MonoCell = ({ value }: { value: string | null }) => (
    <TextCell value={value} variant="mono" />
);
