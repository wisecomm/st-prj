import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/back-button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

/**
 * 404 Not Found 페이지
 * 
 * 존재하지 않는 경로 접근 시 표시됩니다.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-3">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">404</h1>
            <h2 className="text-xl font-semibold tracking-tight">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
            <BackButton variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로 가기
            </BackButton>
            <Button className="flex-1" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
