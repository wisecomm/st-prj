"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * 전역 세션 감시자 (Session Watcher)
 * - NextAuth는 서버 사이드(auth.ts)에서 토큰 갱신에 실패하더라도 자동으로 브라우저를 튕겨내지 않습니다.
 * - 대신 session 객체에 error 상태를 내려주는데, 이 컴포넌트가 최상단에서 이를 감시하다가
 * - 에러(RefreshTokenExpired)가 감지되면 클라이언트단에서 사용자 로그아웃 및 강제 리다이렉션을 수행합니다.
 */
export function SessionWatcher() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.error === "RefreshTokenExpired") {
            console.warn("[SessionWatcher] RefreshTokenExpired detected. Forcing logout...");
            // 콜백 URL을 지정하여 로그인 후 이전 페이지로 돌아오거나, 단순히 로그인 페이지로 이동
            signOut({ callbackUrl: "/login?expired=true" });
        }
    }, [session]);

    return null;
}
