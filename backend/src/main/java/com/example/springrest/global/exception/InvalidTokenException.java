package com.example.springrest.global.exception;

/**
 * 잘못된 형식의 JWT 토큰 예외
 * 토큰이 손상되었거나 서명이 유효하지 않을 때 발생
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
