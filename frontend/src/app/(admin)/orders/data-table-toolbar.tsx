"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { DateInput, ActionButtons, toolbarButtonClass } from "@/components/common";
import { useToast } from "@/hooks/use-toast";
import { OrderFilters } from "./types";

interface DataTableToolbarProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSearch: (params: OrderFilters) => void;
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
    initialEndDate = "",
}: DataTableToolbarProps) {
    const [custNm, setCustNm] = React.useState("");
    const [startDate, setStartDate] = React.useState(initialStartDate);
    const [endDate, setEndDate] = React.useState(initialEndDate);

    const { toast } = useToast();

    const handleSearch = () => {
        if (startDate && endDate && startDate > endDate) {
            toast({
                title: "입력 오류",
                description: "종료일은 시작일보다 빠를 수 없습니다.",
                variant: "destructive",
            });
            return;
        }
        onSearch({ custNm, startDate, endDate });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-1 items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">고객명</span>
                        <Input
                            placeholder="고객명 입력"
                            value={custNm}
                            onChange={(event) => setCustNm(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-[150px] lg:w-[200px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">주문일</span>
                        <DateInput
                            value={startDate}
                            onChange={setStartDate}
                            onKeyDown={handleKeyDown}
                        />
                        <span>-</span>
                        <DateInput
                            value={endDate}
                            onChange={setEndDate}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleSearch}
                        className={toolbarButtonClass}
                        disabled={isLoading}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        조회
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <ActionButtons
                        onAdd={onAdd}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        disabled={isLoading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
