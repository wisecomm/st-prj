"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ScheduleLog } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function getColumns(): ColumnDef<ScheduleLog>[] {
    return [
        {
            accessorKey: "uid",
            header: "No",
            cell: ({ row }) => <div className="text-center">{row.getValue("uid")}</div>,
            size: 60,
        },
        {
            accessorKey: "beanName",
            header: "스케줄 빈",
            cell: ({ row }) => <div className="font-semibold">{row.getValue("beanName")}</div>,
            size: 200,
        },
        {
            accessorKey: "method",
            header: "구분",
            cell: ({ row }) => {
                const method = row.getValue("method") as string;
                return (
                    <div className="text-center">
                        {method === "S" ? (
                            <Badge variant="outline">스케줄</Badge>
                        ) : method === "D" ? (
                            <Badge variant="secondary">수동실행</Badge>
                        ) : (
                            method
                        )}
                    </div>
                );
            },
            size: 100,
        },
        {
            accessorKey: "result",
            header: "결과",
            cell: ({ row }) => {
                const result = row.getValue("result") as string;
                let badgeVariant: "secondary" | "destructive" | "default" | "outline" = "secondary";
                let label = result;

                if (result === "S") {
                    badgeVariant = "default"; // "success" isn't in standard shadcn unless added, so using default/primary
                    label = "성공";
                } else if (result === "F") {
                    badgeVariant = "destructive";
                    label = "실패";
                } else if (result === "I") {
                    badgeVariant = "outline";
                    label = "진행중";
                }

                return (
                    <div className="text-center">
                        <Badge variant={badgeVariant}>{label}</Badge>
                    </div>
                );
            },
            size: 100,
        },
        {
            accessorKey: "message",
            header: "메시지",
            cell: ({ row }) => {
                const msg = row.getValue("message") as string;
                return (
                    <div className="max-w-[300px] truncate" title={msg}>
                        {msg || "-"}
                    </div>
                );
            },
            size: 300,
        },
        {
            accessorKey: "startTime",
            header: "시작 시간",
            cell: ({ row }) => {
                const dateRaw = row.getValue("startTime");
                if (!dateRaw) return <div className="text-center text-muted-foreground">-</div>;
                const d = new Date(dateRaw as string);
                return <div className="text-center">{format(d, "yyyy-MM-dd HH:mm:ss")}</div>;
            },
            size: 160,
        },
        {
            accessorKey: "endTime",
            header: "종료 시간",
            cell: ({ row }) => {
                const dateRaw = row.getValue("endTime");
                if (!dateRaw) return <div className="text-center text-muted-foreground">-</div>;
                const d = new Date(dateRaw as string);
                return <div className="text-center">{format(d, "yyyy-MM-dd HH:mm:ss")}</div>;
            },
            size: 160,
        },
        {
            accessorKey: "worker",
            header: "작업자",
            cell: ({ row }) => <div className="text-center">{row.getValue("worker") || "-"}</div>,
            size: 100,
        },
    ];
}
