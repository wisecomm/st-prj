"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableToolbarProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
    onExecute: () => Promise<void>;
}

export function DataTableToolbar({
    onAdd,
    onEdit,
    onDelete,
    onExecute,
}: DataTableToolbarProps) {
    return (
        <Card className="w-full">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                    {/* Add search inputs if needed internally, currently omitted for schedules */}
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">스케줄을 관리하고 수동으로 즉시 실행할 수 있습니다.</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={async () => await onExecute()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 h-9 rounded-md shadow-sm lg:flex"
                    >
                        <Play className="mr-2 h-4 w-4" /> 강제 실행
                    </Button>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAdd}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-4 py-2 h-9 rounded-md shadow-sm lg:flex"
                    >
                        <Plus className="mr-2 h-4 w-4" /> 추가
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-4 py-2 h-9 rounded-md shadow-sm lg:flex"
                    >
                        <Pencil className="mr-2 h-4 w-4" /> 수정
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => await onDelete()}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-4 py-2 h-9 rounded-md shadow-sm lg:flex"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> 삭제
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
