package com.example.springrest.domain.auth.model.dto;

import com.example.springrest.domain.user.model.dto.UserInfoResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;           // JWT 액세스 토큰
    private String refreshToken;    // 리프래쉬 토큰
    private String tokenType;       // "Bearer"
    private Long expiresIn;         // 만료 시간 (밀리초)
    private UserInfoResponse user;  // 사용자 기본 정보 (DTO)
}
