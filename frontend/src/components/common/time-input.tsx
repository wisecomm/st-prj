"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TimeInputProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    /** 시간 포맷: "HH:mm:ss" (초 포함) 또는 "HH:mm" (시:분만) */
    format?: "HH:mm:ss" | "HH:mm";
    /** 24시간 형식 사용 여부 (기본값: true). false면 네이티브 시간 선택기 사용 */
    use24Hour?: boolean;
}

export function TimeInput({
    value = "",
    onChange,
    className,
    disabled = false,
    format = "HH:mm",
    use24Hour = true,
}: TimeInputProps) {
    const includeSeconds = format === "HH:mm:ss";
    const placeholder = includeSeconds ? "HH:mm:ss" : "HH:mm";

    // HH:mm:ss 형식 값을 HH:mm으로 변환 (format이 HH:mm인 경우)
    const displayValue = !includeSeconds && value.length > 5 ? value.slice(0, 5) : value;

    // 24시간 형식: 커스텀 텍스트 입력 사용
    if (use24Hour) {
        const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value;

            // 숫자만 추출
            const digits = val.replace(/\D/g, "");

            // 자동 콜론 삽입
            if (includeSeconds) {
                // HH:mm:ss 형식 (최대 6자리 숫자)
                const limitedDigits = digits.slice(0, 6);
                if (limitedDigits.length <= 2) {
                    val = limitedDigits;
                } else if (limitedDigits.length <= 4) {
                    val = limitedDigits.slice(0, 2) + ":" + limitedDigits.slice(2);
                } else {
                    val = limitedDigits.slice(0, 2) + ":" + limitedDigits.slice(2, 4) + ":" + limitedDigits.slice(4);
                }
            } else {
                // HH:mm 형식 (최대 4자리 숫자)
                const limitedDigits = digits.slice(0, 4);
                if (limitedDigits.length <= 2) {
                    val = limitedDigits;
                } else {
                    val = limitedDigits.slice(0, 2) + ":" + limitedDigits.slice(2);
                }
            }

            onChange?.(val);
        };

        return (
            <div className={cn("flex items-center gap-1", className)}>
                <Input
                    type="text"
                    value={displayValue}
                    onChange={handleTextChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "bg-background font-mono",
                        includeSeconds ? "w-[90px]" : "w-[70px]"
                    )}
                />
            </div>
        );
    }

    // AM/PM 형식: 네이티브 시간 입력 사용
    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (includeSeconds) {
            if (val.length === 5) {
                onChange?.(val + ":00");
            } else {
                onChange?.(val);
            }
        } else {
            onChange?.(val);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <Input
                type="time"
                step={includeSeconds ? "1" : undefined}
                value={displayValue}
                onChange={handleNativeChange}
                disabled={disabled}
                className={cn(
                    "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                    includeSeconds ? "w-[120px]" : "w-[100px]"
                )}
            />
        </div>
    );
}

/**
 * 시간 포맷 (HH:mm:ss)
 */
export function formatTimeHHmmss(date: Date): string {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${hour}:${minute}:${second}`;
}
/**
 * 시간 포맷 (HH:mm)
 */
export function formatTimeHHmm(date: Date): string {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
}
