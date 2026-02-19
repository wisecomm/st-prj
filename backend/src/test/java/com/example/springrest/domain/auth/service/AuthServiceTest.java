package com.example.springrest.domain.auth.service;

import com.example.springrest.domain.auth.model.dto.LoginRequest;
import com.example.springrest.domain.auth.model.dto.LoginResponse;
import com.example.springrest.domain.auth.model.dto.TokenValidationResponse;
import com.example.springrest.domain.auth.model.entity.AuthUser;
import com.example.springrest.domain.user.model.enums.UserRole;
import com.example.springrest.global.exception.AuthenticationException;
import com.example.springrest.global.security.JwtTokenProvider;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserDetailsProvider userDetailsProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("로그인 성공")
    void login_Success() {
        // given
        LoginRequest request = new LoginRequest("testUser", "password");
        AuthUser user = AuthUser.builder()
                .userId("testUser")
                .userPwd("encodedPassword")
                .userName("Test User")
                .roles(java.util.List.of(UserRole.ROLE_USER))
                .build();

        given(userDetailsProvider.findByUserId("testUser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password", "encodedPassword")).willReturn(true);
        given(jwtTokenProvider.generateToken(anyString(), any())).willReturn("accessToken");
        given(jwtTokenProvider.generateRefreshToken(anyString())).willReturn("refreshToken");
        given(jwtTokenProvider.getExpirationMs()).willReturn(3600000L);

        // when
        LoginResponse response = authService.login(request, "127.0.0.1", "UserAgent");

        // then
        assertThat(response.getToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        assertThat(response.getUser().getUserId()).isEqualTo("testUser");
    }

    @Test
    @DisplayName("로그인 실패 - 사용자 없음")
    void login_Failure_UserNotFound() {
        // given
        LoginRequest request = new LoginRequest("unknown", "password");
        given(userDetailsProvider.findByUserId("unknown")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "UserAgent"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessage("Invalid User ID or password");
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_Failure_WrongPassword() {
        // given
        LoginRequest request = new LoginRequest("testUser", "wrong");
        AuthUser user = AuthUser.builder()
                .userId("testUser")
                .userPwd("encodedPassword")
                .build();

        given(userDetailsProvider.findByUserId("testUser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong", "encodedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "UserAgent"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessage("Invalid User ID or password");
    }

    @Test
    @DisplayName("토큰 갱신 성공")
    void refreshToken_Success() {
        // given
        String refreshToken = "validRefreshToken";
        AuthUser user = AuthUser.builder().userId("testUser").roles(java.util.List.of(UserRole.ROLE_USER)).build();

        given(jwtTokenProvider.validateToken(refreshToken)).willReturn(true);
        given(jwtTokenProvider.extractUserId(refreshToken)).willReturn("testUser");
        given(userDetailsProvider.findByUserId("testUser")).willReturn(Optional.of(user));
        given(jwtTokenProvider.generateToken(anyString(), any())).willReturn("newAccessToken");
        given(jwtTokenProvider.generateRefreshToken(anyString())).willReturn("newRefreshToken");

        // when
        LoginResponse response = authService.refreshToken(refreshToken);

        // then
        assertThat(response.getToken()).isEqualTo("newAccessToken");
        assertThat(response.getRefreshToken()).isEqualTo("newRefreshToken");
    }

    @Test
    @DisplayName("토큰 갱신 실패 - 유효하지 않은 토큰")
    void refreshToken_Failure_InvalidToken() {
        // given
        String refreshToken = "invalidRefreshToken";
        given(jwtTokenProvider.validateToken(refreshToken)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(JwtException.class)
                .hasMessage("Invalid refresh token");
    }

    @Test
    @DisplayName("토큰 검증 성공")
    void validateToken_Success() {
        // given
        String token = "validToken";
        given(jwtTokenProvider.validateToken(token)).willReturn(true);
        given(jwtTokenProvider.extractUserId(token)).willReturn("testUser");
        given(jwtTokenProvider.extractRoles(token)).willReturn(java.util.List.of(UserRole.ROLE_USER));

        // when
        TokenValidationResponse response = authService.validateToken(token);

        // then
        assertThat(response.isValid()).isTrue();
        assertThat(response.getUserId()).isEqualTo("testUser");
    }

    @Test
    @DisplayName("로그아웃")
    void logout_Success() {
        // given
        String token = "validToken";
        given(jwtTokenProvider.validateToken(token)).willReturn(true);
        given(jwtTokenProvider.extractUserId(token)).willReturn("testUser");

        // when
        authService.logout(token);

        // then
        verify(jwtTokenProvider).extractUserId(token);
    }
}
