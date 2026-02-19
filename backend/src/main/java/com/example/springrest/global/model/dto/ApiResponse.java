package com.example.springrest.global.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 표준 API 응답 포맷
 * 모든 API 응답에 사용되는 래퍼 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    /**
     * HTTP 상태 코드 문자열 (예: "200", "401")
     */
    private String code;

    /**
     * 응답 메시지 (예: "SUCCESS", "INVALID_CREDENTIALS")
     */
    private String message;

    /**
     * 실제 데이터 (제네릭)
     */
    private T data;

    /**
     * 성공 응답 생성 편의 메서드
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code("200")
                .message("SUCCESS")
                .data(data)
                .build();
    }

    /**
     * 성공 응답 생성 편의 메서드 (데이터 없음)
     */
    public static <T> ApiResponse<T> success() {
        return success(null);
    }

    /**
     * 에러 응답 생성 편의 메서드
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .data(null)
                .build();
    }
}
