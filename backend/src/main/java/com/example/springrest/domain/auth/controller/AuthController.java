package com.example.springrest.domain.auth.controller;

import com.example.springrest.global.model.dto.ApiResponse;
import com.example.springrest.domain.auth.model.dto.LoginRequest;
import com.example.springrest.domain.auth.model.dto.LoginResponse;
import com.example.springrest.domain.auth.model.dto.TokenRefreshRequest;
import com.example.springrest.domain.auth.model.dto.TokenValidationRequest;
import com.example.springrest.domain.auth.model.dto.TokenValidationResponse;
import com.example.springrest.domain.auth.model.dto.GoogleLoginRequest;

import com.example.springrest.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 컨트롤러
 * 로그인, 토큰 검증 등 인증 관련 API 엔드포인트 제공
 */
@Tag(name = "Auth - Authentication", description = "인증 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인 API
     * 
     * @param request     로그인 요청 (username, password)
     * @param httpRequest HTTP 요청 (IP, User-Agent 추출용)
     * @return 로그인 응답 (JWT 토큰, 사용자 정보)
     */
    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        log.info("Login attempt for user: {} from IP: {}", request.getUserId(), ipAddress);

        LoginResponse response = authService.login(request, ipAddress, userAgent);

        log.info("Login successful for user: {}", request.getUserId());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 토큰 갱신 API
     * 
     * @param request 토큰 갱신 요청 (refreshToken)
     * @return 새로운 토큰 정보
     */
    @Operation(summary = "토큰 갱신")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @Valid @RequestBody TokenRefreshRequest request) {

        log.info("Refresh token request");

        LoginResponse response = authService.refreshToken(request.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 클라이언트 IP 주소 추출
     * X-Forwarded-For 헤더 우선 확인 (프록시 환경 대응)
     * 
     * @param request HTTP 요청
     * @return IP 주소
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * 현재 사용자 정보 조회 API
     * 
     * @return 인증된 사용자 정보
     */
    @Operation(summary = "현재 사용자 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<com.example.springrest.domain.user.model.dto.UserInfoResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        log.info("Get current user info: {}", userId);

        com.example.springrest.domain.user.model.dto.UserInfoResponse response = authService.getCurrentUser(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 토큰 검증 API
     * 
     * @param request 토큰 검증 요청
     * @return 토큰 검증 결과
     */
    @Operation(summary = "토큰 검증")
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<TokenValidationResponse>> validateToken(
            @Valid @RequestBody TokenValidationRequest request) {

        log.info("Validate token request");

        TokenValidationResponse response = authService.validateToken(request.getToken());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 로그아웃 API
     * 
     * @param request HTTP 요청 (Authorization 헤더 추출용)
     * @return 성공 응답
     */
    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token != null) {
            authService.logout(token);
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 구글 로그인 API
     * 
     * @param request 구글 로그인 요청 (code)
     * @return 로그인 응답 (JWT 토큰)
     */
    @Operation(summary = "구글 로그인")
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {

        log.info("Google login request with code length: {}",
                request.getCode() != null ? request.getCode().length() : 0);

        LoginResponse response = authService.googleLogin(request.getCode());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Request Header에서 토큰 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
