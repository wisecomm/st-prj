package com.example.springrest.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "Invalid input value"),

    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid username or password"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid token"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "Token has expired"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "Username already exists"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "Email already exists");

    private final HttpStatus httpStatus;
    private final String message;
}
