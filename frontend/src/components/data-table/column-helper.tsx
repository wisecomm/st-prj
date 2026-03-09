"use client";

import React from "react";
import { ColumnDef, Row, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectCell } from "@/components/data-table/cells/select-cell";

interface HeaderCellProps<TData> {
    title: string;
    column?: Column<TData, unknown>;
    className?: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
}

function HeaderCell<TData>({
    title,
    column,
    className,
    sortable = false,
    align = "center"
}: HeaderCellProps<TData>) {

    // 정렬 기능이 없거나 column이 없으면 일반 텍스트 렌더링
    if (!sortable || !column) {
        return (
            <div className={cn(
                "font-semibold text-sm",
                align === "center" && "text-center",
                align === "left" && "text-left",
                align === "right" && "text-right",
                className
            )}>
                {title}
            </div>
        );
    }

    // 정렬 기능 활성화
    const sorted = column.getIsSorted();

    return (
        <Button
            variant="ghost"
            onClick={() => {
                if (sorted === "asc") {
                    column.toggleSorting(true); // asc -> desc
                } else if (sorted === "desc") {
                    column.clearSorting(); // desc -> none
                } else {
                    column.toggleSorting(false); // none -> asc
                }
            }}
            className={cn(
                "h-8 px-2 font-semibold text-sm hover:bg-muted w-full",
                align === "center" && "justify-center text-center",
                align === "left" && "justify-start text-left",
                align === "right" && "justify-end text-right",
                className
            )}
        >
            {title}
            {sorted === "asc" ? (
                <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
            ) : sorted === "desc" ? (
                <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
        </Button>
    );
}

interface ColumnOptions<TData> {
    cell?: (props: { row: Row<TData>; getValue: () => unknown }) => React.ReactNode;
    sort?: boolean;
    size?: number;
    align?: "left" | "center" | "right";
    enableHiding?: boolean;
    id?: string; // accessorKey 대신 id를 사용할 경우 (예: select, actions)
}

/**
 * 컬럼 정의 생성 헬퍼
 * 
 * @param accessorKey 데이터 접근 키 (또는 id)
 * @param title 헤더 제목 (옵션)
 * @param options 설정 객체 (cell, sort, size 등)
 */
export function createColumn<TData>(
    accessorKey: string,
    title: string | undefined, // title이 없으면(undefined) 헤더 렌더링 안 함 (혹은 빈 헤더)
    options: ColumnOptions<TData> = {}
): ColumnDef<TData> {
    const {
        cell,
        sort = false,
        size,
        align = "center", // 헤더 기본 정렬 (데이터 셀은 각 Cell 컴포넌트에서 처리)
        enableHiding = true
    } = options;

    return {
        accessorKey,
        id: options.id || accessorKey, // id가 명시되면 사용, 아니면 accessorKey
        header: title
            ? ({ column }) => (
                <HeaderCell
                    column={column}
                    title={title}
                    sortable={sort}
                    align={align}
                />
            )
            : undefined,
        cell: cell ? cell : ({ row }) => row.getValue(accessorKey), // cell 없으면 기본값 출력
        enableSorting: sort,
        enableHiding,
        size,
    };
}

/**
 * 선택 컬럼 생성 헬퍼
 */
export function createSelectColumn<TData>(): ColumnDef<TData> {
    return {
        id: "select",
        cell: ({ row }) => <SelectCell row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
    };
}
