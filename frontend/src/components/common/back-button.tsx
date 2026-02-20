"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps extends React.ComponentProps<typeof Button> {
    children?: React.ReactNode;
}

export function BackButton({ children, onClick, ...props }: BackButtonProps) {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        router.back();
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <Button onClick={handleBack} {...props}>
            {children || "뒤로 가기"}
        </Button>
    );
}
