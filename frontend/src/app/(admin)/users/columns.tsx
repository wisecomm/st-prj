"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserDetail } from "@/types";
import { TextCell, DateCell, UseYnCell } from "@/components/data-table/cells";
import { createColumn, createSelectColumn } from "@/components/data-table/column-helper";

export const getColumns = (): ColumnDef<UserDetail>[] => [
    createSelectColumn(),
    createColumn("userId", "아이디", {
        sort: true,
        size: 100,
        cell: ({ row }) => <TextCell value={row.getValue("userId")} />
    }),
    createColumn("userName", "이름", {
        sort: true,
        size: 150,
        cell: ({ row }) => <TextCell value={row.getValue("userName")} />
    }),
    createColumn("userEmail", "이메일", {
        sort: true,
        size: 200,
        cell: ({ row }) => <TextCell value={row.getValue("userEmail")} />
    }),
    createColumn("userNick", "닉네임", {
        size: 150,
        cell: ({ row }) => <TextCell value={row.getValue("userNick")} />
    }),
    createColumn("useYn", "사용", {
        size: 60,
        cell: ({ row }) => (
            <TextCell
                value={row.getValue("useYn") === "1" ? "사용" : "미사용"}
                align="center"
            />
        )
    }),
    createColumn("sysInsertDtm", "등록일", {
        sort: true,
        size: 180,
        cell: ({ row }) => <DateCell value={row.getValue("sysInsertDtm")} format="date" />
    }),
];
