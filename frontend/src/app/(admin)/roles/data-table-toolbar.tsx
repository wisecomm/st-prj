"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableToolbarProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
    onSearch: (term: string) => void;
}

import { Card, CardContent } from "@/components/ui/card";

export function DataTableToolbar({
    onAdd,
    onEdit,
    onDelete,
    onSearch,
}: DataTableToolbarProps) {
    const [searchTerm, setSearchTerm] = React.useState("");

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                    <span className="text-sm font-medium whitespace-nowrap">권한 아이디</span>
                    <Input
                        placeholder="권한 아이디 입력"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-9 w-[150px] lg:w-[250px]"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSearch}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-4 py-2 h-9 rounded-md shadow-sm"
                    >
                        <Search className="mr-2 h-4 w-4" /> 조회
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAdd}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-4 py-2 h-9 rounded-md shadow-sm lg:flex"
                    >
                        <Pencil className="mr-2 h-4 w-4" /> 추가
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
