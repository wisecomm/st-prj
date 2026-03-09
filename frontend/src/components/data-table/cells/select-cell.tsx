"use client";

import { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectCellProps<TData> {
    row: Row<TData>;
}

export function SelectCell<TData>({ row }: SelectCellProps<TData>) {
    return (
        <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
        >
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        </div>
    );
}
