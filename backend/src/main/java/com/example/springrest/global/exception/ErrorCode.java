package com.example.springrest.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 표준 에러 코드 정의
 * 모든 API 에러 응답에서 사용되는 에러 코드를 중앙 집중 관리
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 성공
    SUCCESS("200", "SUCCESS"),

    // 400 Bad Request - 클라이언트 요청 오류
    BAD_REQUEST("400", "BAD_REQUEST"),
    VALIDATION_ERROR("400", "VALIDATION_ERROR"),
    INVALID_ARGUMENT("400", "INVALID_ARGUMENT"),

    // 401 Unauthorized - 인증 실패
    UNAUTHORIZED("401", "UNAUTHORIZED"),
    INVALID_CREDENTIALS("401", "INVALID_CREDENTIALS"),
    INVALID_TOKEN("401", "INVALID_TOKEN"),
    TOKEN_EXPIRED("401", "TOKEN_EXPIRED"),

    // 403 Forbidden - 권한 없음
    FORBIDDEN("403", "FORBIDDEN"),
    ACCESS_DENIED("403", "ACCESS_DENIED"),

    // 404 Not Found - 리소스 없음
    NOT_FOUND("404", "NOT_FOUND"),
    USER_NOT_FOUND("404", "USER_NOT_FOUND"),
    RESOURCE_NOT_FOUND("404", "RESOURCE_NOT_FOUND"),

    // 409 Conflict - 충돌
    CONFLICT("409", "CONFLICT"),
    DUPLICATE_ENTRY("409", "DUPLICATE_ENTRY"),

    // 500 Internal Server Error - 서버 오류
    INTERNAL_SERVER_ERROR("500", "INTERNAL_SERVER_ERROR"),
    DATABASE_ERROR("500", "DATABASE_ERROR");

    private final String code;
    private final String message;

    /**
     * 커스텀 메시지로 에러 응답 생성
     */
    public String getCodeWithMessage(String customMessage) {
        return customMessage != null ? customMessage : this.message;
    }
}
