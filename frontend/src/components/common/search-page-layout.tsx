import * as React from "react";
import { cn } from "@/lib/utils";

interface SearchPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function SearchPageLayout({ children, className, ...props }: SearchPageLayoutProps) {
    return (
        // ▼ "mt-4" 등을 추가하여 상단 간격을 조정 (mt-0은 간격 없음)
        <div className={cn("w-full mt-0 space-y-4", className)} {...props}>
            {children}
        </div>
    );
}
