import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * 재사용 가능한 스피너 컴포넌트
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
    />
  );
}

/**
 * 중앙 정렬된 로딩 스피너
 */
export function CenteredSpinner({
  size = "md",
  text,
  className,
}: SpinnerProps & { text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Spinner size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * 전체 화면 로딩 오버레이
 */
export function FullScreenSpinner({ text = "로딩 중..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <CenteredSpinner size="lg" text={text} />
    </div>
  );
}
