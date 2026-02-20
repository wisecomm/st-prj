import { Loader2 } from "lucide-react";

/**
 * 글로벌 로딩 컴포넌트
 * 
 * 페이지 전환 시 자동으로 표시됩니다.
 * Next.js가 React Suspense를 사용하여 자동 래핑합니다.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
