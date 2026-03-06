"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BoardMaster } from "./actions";
import { TextCell, DateCell, UseYnCell, NumberCell } from "@/components/data-table/cells";
import { createColumn, createSelectColumn } from "@/components/data-table/column-helper";

export const getColumns = (): ColumnDef<BoardMaster>[] => [
    createSelectColumn(),
    createColumn("brdId", "게시판 코드", {
        sort: true,
        size: 120,
        cell: ({ row }) => <TextCell value={row.getValue("brdId")} />
    }),
    createColumn("brdNm", "게시판 명", {
        sort: true,
        size: 200,
        cell: ({ row }) => <TextCell value={row.getValue("brdNm")} />
    }),
    createColumn("replyUseYn", "댓글", {
        sort: true,
        size: 80,
        cell: ({ row }) => <UseYnCell value={row.getValue("replyUseYn")} />
    }),
    createColumn("fileUseYn", "파일첨부", {
        sort: true,
        size: 80,
        cell: ({ row }) => <UseYnCell value={row.getValue("fileUseYn")} />
    }),
    createColumn("fileMaxCnt", "파일 수", {
        sort: true,
        size: 80,
        cell: ({ row }) => <NumberCell value={row.getValue("fileMaxCnt")} />
    }),
    createColumn("useYn", "사용", {
        sort: true,
        size: 80,
        cell: ({ row }) => <UseYnCell value={row.getValue("useYn")} />
    }),
    createColumn("sysInsertDtm", "등록일", {
        sort: true,
        size: 180,
        cell: ({ row }) => <DateCell value={row.getValue("sysInsertDtm")} format="datetime" />
    }),
];
