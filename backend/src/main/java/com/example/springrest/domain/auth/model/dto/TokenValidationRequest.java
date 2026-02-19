package com.example.springrest.domain.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 토큰 검증 요청 DTO
 * POST /api/v1/auth/validate 엔드포인트에서 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationRequest {

    @NotBlank(message = "Token is required")
    private String token;
}
