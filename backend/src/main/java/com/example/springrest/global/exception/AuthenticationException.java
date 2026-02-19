package com.example.springrest.global.exception;

/**
 * 인증 실패 예외
 * 로그인 실패, 토큰 검증 실패 등 인증 관련 오류 발생 시
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
