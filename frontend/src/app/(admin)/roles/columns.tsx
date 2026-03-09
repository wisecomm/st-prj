"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RoleInfo } from "@/types";
import { TextCell, UseYnCell } from "@/components/data-table/cells";
import { createColumn, createSelectColumn } from "@/components/data-table/column-helper";

export const getColumns = (): ColumnDef<RoleInfo>[] => [
    createSelectColumn(),
    createColumn("roleId", "권한 아이디", {
        sort: true,
        cell: ({ row }) => <TextCell value={row.getValue("roleId")} />
    }),
    createColumn("roleName", "권한 이름", {
        sort: true,
        cell: ({ row }) => <TextCell value={row.getValue("roleName")} />
    }),
    createColumn("roleDesc", "비고", {
        cell: ({ row }) => <TextCell value={row.getValue("roleDesc")} variant="muted" />
    }),
    createColumn("useYn", "상태", {
        sort: true,
        size: 80,
        cell: ({ row }) => <UseYnCell value={row.getValue("useYn")} />
    }),
];
