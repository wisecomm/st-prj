"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

/**
 * 날짜 입력 컴포넌트 Props
 */
export interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    className?: string;
    /**
     * 입력 방식
     * - button: 버튼 클릭하여 달력 선택 (기본값)
     * - input: 텍스트 입력 + 달력 아이콘
     */
    variant?: "button" | "input";
}

/**
 * 날짜 유효성 검사 (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

/**
 * 통합 날짜 입력 컴포넌트
 */
export function DateInput({
    value,
    onChange,
    onKeyDown,
    placeholder = "yyyy-MM-dd",
    className,
    variant = "button", // 기본값 변경: button
}: DateInputProps) {
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const lastValidValue = React.useRef(value);
    const { toast } = useToast();

    // 초기값 또는 외부에서 값이 변경될 때가 유효하다면 lastValidValue 업데이트
    React.useEffect(() => {
        if (!value || isValidDate(value)) {
            lastValidValue.current = value;
            setIsError(false);
        } else {
            setIsError(true);
        }
    }, [value]);

    // 문자열 날짜를 Date 객체로 변환 for Calendar
    const dateObj = React.useMemo(() => {
        if (!value) return undefined;
        if (!isValidDate(value)) return undefined;

        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }, [value]);


    const handleSelect = (newDate: Date | undefined) => {
        if (newDate) {
            onChange(format(newDate, "yyyy-MM-dd"));
            setIsCalendarOpen(false); // 날짜 선택 시 팝오버 닫기
        } else {
            // Button variant might want to clear, but Input variant usually doesn't clear on deselect unless explicit
            // Keeping behavior consistent: selection updates value.
        }
    };

    // --- Input Variant Logic ---
    const handleChange = (newValue: string) => {
        const filteredValue = newValue.replace(/[^0-9-]/g, '');
        onChange(filteredValue);
    };

    const handleBlur = () => {
        if (!value) return;
        if (!isValidDate(value)) {
            toast({
                title: "입력 오류",
                description: "유효하지 않은 날짜입니다. 이전 값으로 복원됩니다.",
                variant: "destructive",
            });
            onChange(lastValidValue.current);
        }
    };

    // --- Render ---

    if (variant === "button") {
        return (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[140px] justify-start text-left font-normal px-2 gap-2",
                            !value && "text-muted-foreground",
                            className
                        )}
                        onKeyDown={onKeyDown}
                    >
                        <span className="truncate text-left tabular-nums shrink-0">
                            {dateObj ? format(dateObj, "yyyy-MM-dd") : placeholder}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={dateObj}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        locale={ko}
                        defaultMonth={dateObj || new Date()}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    // Variant: "input"
    return (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverAnchor asChild>
                <div className={cn("relative w-[140px]", className)}>
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDown}
                        className="pl-2 pr-8 w-full"
                        aria-invalid={isError}
                    />
                    <PopoverTrigger asChild>
                        <button
                            className="absolute right-0 top-0 h-full w-8 flex items-center justify-center bg-transparent border-0 p-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            type="button"
                        >
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                        </button>
                    </PopoverTrigger>
                </div>
            </PopoverAnchor>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateObj}
                    onSelect={handleSelect}
                    captionLayout="dropdown"
                    locale={ko}
                    defaultMonth={dateObj || new Date()}
                />
            </PopoverContent>
        </Popover>
    );
}

/**
 * 오늘 날짜 포맷 (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * 오늘 날짜 문자열
 */
export function getTodayString(): string {
    return formatDate(new Date());
}

