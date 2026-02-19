package com.example.springrest.domain.auth.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @Schema(description = "사용자 아이디", example = "admin")
    @NotBlank(message = "User ID is required")
    @Size(min = 3, max = 50, message = "User ID must be 3-50 characters")
    private String userId;

    @Schema(description = "비밀번호", example = "12345678")
    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 100, message = "Password must be 4-100 characters")
    private String userPwd;
}
