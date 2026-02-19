package com.example.springrest.global.exception;

import com.example.springrest.global.model.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리기
 * 모든 컨트롤러에서 발생하는 예외를 중앙에서 처리
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * 인증 실패 예외 처리
         * 
         * @param ex 인증 예외
         * @return 401 Unauthorized 응답
         */
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
                log.warn("Authentication failed: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error(ErrorCode.UNAUTHORIZED.getCode(), ex.getMessage()));
        }

        /**
         * 잘못된 토큰 예외 처리
         * 
         * @param ex 잘못된 토큰 예외
         * @return 401 Unauthorized 응답
         */
        @ExceptionHandler(InvalidTokenException.class)
        public ResponseEntity<ApiResponse<Void>> handleInvalidTokenException(InvalidTokenException ex) {
                log.warn("Invalid token: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error(ErrorCode.INVALID_TOKEN.getCode(), ex.getMessage()));
        }

        /**
         * Jakarta Validation 검증 실패 처리
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {

                String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                                .map(FieldError::getDefaultMessage)
                                .collect(Collectors.joining(", "));

                log.warn("Validation error: {}", errorMessage);

                return ResponseEntity
                                .status(HttpStatus.OK)
                                .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR.getCode(), errorMessage));
        }

        /**
         * 리소스를 찾을 수 없음 (Spring Boot 3.2+ NoResourceFoundException)
         */
        @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(
                        org.springframework.web.servlet.resource.NoResourceFoundException ex) {
                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ErrorCode.NOT_FOUND.getCode(), ex.getMessage()));
        }

        /**
         * IllegalArgumentException 처리
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
                log.warn("Invalid argument: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.OK)
                                .body(ApiResponse.error(ErrorCode.INVALID_ARGUMENT.getCode(), ex.getMessage()));
        }

        /**
         * 일반 예외 처리 (500 Internal Server Error)
         * 
         * @param ex 예외
         * @return 500 응답
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
                log.error("Internal server error", ex);
                return ResponseEntity
                                .status(HttpStatus.OK)
                                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                                                // "Internal server error"));
                                                ex.toString())); // 디버깅용: 실제 에러 메시지 반환
        }
}
