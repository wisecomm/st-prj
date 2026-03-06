"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Calendar } from "lucide-react";

interface DataTableToolbarProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSearch: (params: { brdNm: string; startDate: string; endDate: string }) => void;
    isLoading?: boolean;
    initialStartDate?: string;
    initialEndDate?: string;
}



export function DataTableToolbar({
    onAdd,
    onEdit,
    onDelete,
    onSearch,
    isLoading,
    initialStartDate = "",
    initialEndDate = ""
}: DataTableToolbarProps) {
    const [brdNm, setBrdNm] = React.useState("");
    const [startDate, setStartDate] = React.useState(initialStartDate);
    const [endDate, setEndDate] = React.useState(initialEndDate);

    const startDateRef = React.useRef<HTMLInputElement>(null);
    const endDateRef = React.useRef<HTMLInputElement>(null);

    const handleSearch = () => {
        onSearch({ brdNm, startDate, endDate });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleDateIconClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
                console.error("showPicker failed:", error);
                ref.current.focus();
                ref.current.click();
            }
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">게시판명</span>
                        <Input
                            placeholder="게시판명 입력"
                            value={brdNm}
                            onChange={(event) => setBrdNm(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-[150px] lg:w-[200px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">등록일</span>
                        <div className="relative w-[140px]">
                            <Input
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pr-8"
                            />
                            <input
                                type="date"
                                ref={startDateRef}
                                className="absolute opacity-0 pointer-events-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ right: 0, bottom: 0, width: 1, height: 1 }}
                                tabIndex={-1}
                            />
                            <button
                                className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                type="button"
                                onClick={() => handleDateIconClick(startDateRef)}
                            >
                                <Calendar className="h-4 w-4" />
                            </button>
                        </div>
                        <span>-</span>
                        <div className="relative w-[140px]">
                            <Input
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pr-8"
                            />
                            <input
                                type="date"
                                ref={endDateRef}
                                className="absolute opacity-0 pointer-events-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ right: 0, bottom: 0, width: 1, height: 1 }}
                                tabIndex={-1}
                            />
                            <button
                                className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                type="button"
                                onClick={() => handleDateIconClick(endDateRef)}
                            >
                                <Calendar className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleSearch}
                        className="border-border text-foreground hover:bg-muted font-bold px-4 py-2 h-9 rounded-md shadow-sm"
                        disabled={isLoading}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        조회
                    </Button>
                </div>

                <div className="flex items-center space-x-2">

                    <Button
                        variant="outline"
                        onClick={onAdd}
                        className="border-border text-foreground hover:bg-muted font-bold px-4 py-2 h-9 rounded-md shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        추가
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="border-border text-foreground hover:bg-muted font-bold px-4 py-2 h-9 rounded-md shadow-sm"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onDelete}
                        className="border-border text-foreground hover:bg-muted font-bold px-4 py-2 h-9 rounded-md shadow-sm"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
