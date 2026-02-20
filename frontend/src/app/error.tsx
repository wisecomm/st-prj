"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 전역 에러 바운더리
 * 
 * 라우트 세그먼트 내에서 발생하는 에러를 처리합니다.
 * layout.tsx나 template.tsx의 에러는 global-error.tsx에서 처리됩니다.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (Sentry, LogRocket 등 연동 가능)
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              오류가 발생했습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "예기치 않은 오류가 발생했습니다."}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => (window.location.href = "/")}
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
            <Button className="flex-1" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
