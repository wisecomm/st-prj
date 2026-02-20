"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

/**
 * 공통 툴바 버튼 스타일
 */
export const toolbarButtonClass =
    "border-border text-foreground hover:bg-muted font-bold px-4 py-2 h-9 rounded-md shadow-sm";

/**
 * CRUD 액션 버튼 Props
 */
export interface ActionButtonsProps {
    onAdd?: () => void;
    onEdit?: () => void;
    onDelete?: () => void | Promise<void>;
    disabled?: boolean;
}

/**
 * CRUD 액션 버튼 그룹
 */
export function ActionButtons({
    onAdd,
    onEdit,
    onDelete,
    disabled,
}: ActionButtonsProps) {
    return (
        <>
            {onAdd && (
                <Button
                    variant="outline"
                    onClick={onAdd}
                    disabled={disabled}
                    className={toolbarButtonClass}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    추가
                </Button>
            )}
            {onEdit && (
                <Button
                    variant="outline"
                    onClick={onEdit}
                    disabled={disabled}
                    className={toolbarButtonClass}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    수정
                </Button>
            )}
            {onDelete && (
                <Button
                    variant="outline"
                    onClick={onDelete}
                    disabled={disabled}
                    className={toolbarButtonClass}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                </Button>
            )}
        </>
    );
}
