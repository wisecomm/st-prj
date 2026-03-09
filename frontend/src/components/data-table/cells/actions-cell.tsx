"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { ReactNode } from "react";

export interface ActionItem<T> {
    label: string;
    icon?: ReactNode;
    onClick: (item: T) => void;
    variant?: "default" | "destructive";
    /** 표시 조건 (선택적) */
    show?: (item: T) => boolean;
}

interface ActionsCellProps<T> {
    item: T;
    actions: ActionItem<T>[];
    /** 메뉴 라벨 */
    menuLabel?: string;
}

/**
 * 액션 메뉴 셀 렌더러
 * 
 * @example
 * // 컬럼 정의에서 사용
 * cell: ({ row }) => (
 *   <ActionsCell
 *     item={row.original}
 *     actions={[
 *       { label: "Edit", icon: <Pencil />, onClick: (item) => onEdit(item) },
 *       { label: "Delete", icon: <Trash2 />, onClick: (item) => onDelete(item), variant: "destructive" },
 *     ]}
 *   />
 * )
 */
export function ActionsCell<T>({
    item,
    actions,
    menuLabel = "Actions",
}: ActionsCellProps<T>) {
    const visibleActions = actions.filter(
        (action) => !action.show || action.show(item)
    );

    if (visibleActions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleActions.map((action, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => action.onClick(item)}
                        className={
                            action.variant === "destructive"
                                ? "text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                : ""
                        }
                    >
                        {action.icon && (
                            <span className="mr-2 h-3.5 w-3.5">{action.icon}</span>
                        )}
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// 자주 쓰이는 액션 프리셋
export const createEditAction = <T,>(onEdit: (item: T) => void): ActionItem<T> => ({
    label: "Edit",
    icon: <Pencil className="h-3.5 w-3.5" />,
    onClick: onEdit,
});

export const createDeleteAction = <T,>(onDelete: (item: T) => void): ActionItem<T> => ({
    label: "Delete",
    icon: <Trash2 className="h-3.5 w-3.5" />,
    onClick: onDelete,
    variant: "destructive",
});

export const createViewAction = <T,>(onView: (item: T) => void): ActionItem<T> => ({
    label: "View",
    icon: <Eye className="h-3.5 w-3.5" />,
    onClick: onView,
});

export const createCopyAction = <T,>(
    onCopy: (item: T) => void,
    label = "Copy ID"
): ActionItem<T> => ({
    label,
    icon: <Copy className="h-3.5 w-3.5" />,
    onClick: onCopy,
});
