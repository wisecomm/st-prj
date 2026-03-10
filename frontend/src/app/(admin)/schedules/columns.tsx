"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Schedule } from "@/types";
import { TextCell, UseYnCell } from "@/components/data-table/cells";
import { createColumn, createSelectColumn } from "@/components/data-table/column-helper";

export const getColumns = (): ColumnDef<Schedule>[] => [
    createSelectColumn(),
    createColumn("uid", "ID", {
        sort: true,
        size: 60,
        cell: ({ row }) => <TextCell value={String(row.getValue("uid"))} />
    }),
    createColumn("beanName", "스케줄 빈 이름", {
        sort: true,
        cell: ({ row }) => <TextCell value={row.getValue("beanName")} />
    }),
    createColumn("cron", "크론식", {
        sort: true,
        cell: ({ row }) => <TextCell value={row.getValue("cron")} />
    }),
    createColumn("comment", "설명", {
        cell: ({ row }) => <TextCell value={row.getValue("comment")} variant="muted" />
    }),
    createColumn("used", "사용여부", {
        sort: true,
        size: 80,
        // Using UseYnCell but mapping true/false to '1'/'0' if requested, or passing raw. We map boolean to display manually if components expect string.
        cell: ({ row }) => <UseYnCell value={row.getValue("used") ? "1" : "0"} />
    }),
    createColumn("stop", "종료 대기", {
        sort: true,
        size: 80,
        cell: ({ row }) => <UseYnCell value={row.getValue("stop") ? "1" : "0"} />
    }),
];
