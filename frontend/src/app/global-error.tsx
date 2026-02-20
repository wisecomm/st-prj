"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 전역 에러 바운더리 (Root Layout 포함)
 * 
 * root layout.tsx나 최상위 레벨에서 발생하는 에러를 처리합니다.
 * 이 컴포넌트는 자체 <html>과 <body> 태그를 정의해야 합니다.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅 (Sentry, LogRocket 등 연동 가능)
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              backgroundColor: "#fff",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                textAlign: "center",
              }}
            >
              {/* Error Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#111",
                    marginBottom: "8px",
                  }}
                >
                  심각한 오류가 발생했습니다
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  {error.message || "애플리케이션에 문제가 발생했습니다."}
                </p>
                {error.digest && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#999",
                    }}
                  >
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  width: "100%",
                  paddingTop: "8px",
                }}
              >
                <button
                  onClick={() => (window.location.href = "/")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    borderRadius: "6px",
                    border: "1px solid #e5e5e5",
                    backgroundColor: "#fff",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  홈으로
                </button>
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#111",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
