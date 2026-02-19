package com.example.springrest.domain.auth.service;

import com.example.springrest.domain.auth.model.entity.AuthUser;
import com.example.springrest.domain.auth.model.dto.LoginRequest;
import com.example.springrest.domain.auth.model.dto.LoginResponse;
import com.example.springrest.domain.auth.model.dto.TokenValidationResponse;
import com.example.springrest.domain.user.model.dto.UserInfoResponse;
import com.example.springrest.domain.user.model.enums.UserRole;
import com.example.springrest.global.security.JwtTokenProvider;
import com.example.springrest.global.exception.AuthenticationException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 서비스
 * 로그인, 토큰 생성 등 인증 관련 비즈니스 로직 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserDetailsProvider userDetailsProvider;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 사용자 로그인
     * 
     * @param request   로그인 요청 (username, password)
     * @param ipAddress 클라이언트 IP 주소
     * @param userAgent User-Agent 헤더
     * @return 로그인 응답 (JWT 토큰, 사용자 정보)
     * @throws IllegalArgumentException 인증 실패 시
     */
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String userId = request.getUserId();

        // 사용자 조회 (Provider 사용)
        AuthUser user = userDetailsProvider.findByUserId(userId)
                .orElseThrow(() -> new AuthenticationException("Invalid User ID or password"));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getUserPwd(), user.getUserPwd())) {
            throw new AuthenticationException("Invalid User ID or password");
        }

        // JWT 토큰 생성
        String token = jwtTokenProvider.generateToken(user.getUserId(), new java.util.HashSet<>(user.getRoles()));
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
        Long expiresIn = jwtTokenProvider.getExpirationMs();

        log.info("User {} logged in successfully with roles: {}", userId, user.getRoles());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(toUserInfoResponse(user))
                .build();
    }

    /**
     * 토큰 갱신
     * 
     * @param refreshToken 리프래쉬 토큰
     * @return 새로운 로그인 응답
     * @throws JwtException 토큰이 유효하지 않을 때
     */
    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
        // 리프래쉬 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new JwtException("Invalid refresh token");
        }

        // 사용자 아이디 추출
        String userId = jwtTokenProvider.extractUserId(refreshToken);

        // 사용자 조회
        AuthUser user = userDetailsProvider.findByUserId(userId)
                .orElseThrow(() -> new JwtException("User not found"));

        // 새로운 토큰 생성
        String newToken = jwtTokenProvider.generateToken(user.getUserId(), new java.util.HashSet<>(user.getRoles()));
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
        Long expiresIn = jwtTokenProvider.getExpirationMs();

        log.info("Token refreshed for user: {}", userId);

        return LoginResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(toUserInfoResponse(user))
                .build();
    }

    /**
     * 현재 인증된 사용자 정보 조회
     * 
     * @param userId 사용자 아이디
     * @return 사용자 정보
     * @throws IllegalArgumentException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserInfoResponse getCurrentUser(String userId) {
        AuthUser user = userDetailsProvider.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return toUserInfoResponse(user);
    }

    /**
     * 로그아웃 처리
     * 현재는 Stateless JWT이므로 별도의 토큰 무효화 로직(예: Redis Blacklist)이 없다면
     * 로그 기록 정도로만 사용됩니다.
     * 
     * @param token Access Token
     */
    public void logout(String token) {
        try {
            if (jwtTokenProvider.validateToken(token)) {
                String userId = jwtTokenProvider.extractUserId(token);
                log.info("User {} logged out", userId);
            }
        } catch (Exception e) {
            log.warn("Logout process warning: {}", e.getMessage());
        }
    }

    /**
     * JWT 토큰 검증
     * 
     * @param token JWT 토큰
     * @return 검증 결과 (유효 여부, 사용자 정보)
     */
    @Transactional(readOnly = true)
    public TokenValidationResponse validateToken(String token) {
        try {
            // 토큰 유효성 검증
            if (!jwtTokenProvider.validateToken(token)) {
                return TokenValidationResponse.invalid("Invalid token");
            }

            // 사용자 아이디와 역할 추출
            String userId = jwtTokenProvider.extractUserId(token);
            java.util.List<UserRole> roles = jwtTokenProvider.extractRoles(token);

            return TokenValidationResponse.valid(userId, roles);

        } catch (JwtException e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return TokenValidationResponse.invalid(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during token validation", e);
            return TokenValidationResponse.invalid("Token validation failed");
        }
    }

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    private final com.example.springrest.domain.user.repository.UserInfoMapper userInfoMapper;
    private final com.example.springrest.domain.user.service.UserService userService;

    /**
     * 구글 로그인
     * 
     * @param code 구글 인증 코드
     * @return 로그인 응답
     */
    @Transactional
    public LoginResponse googleLogin(String code) {
        // 1. 구글 토큰 가져오기
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String tokenUrl = "https://oauth2.googleapis.com/token";

        org.springframework.util.MultiValueMap<String, String> params = new org.springframework.util.LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> requestEntity = new org.springframework.http.HttpEntity<>(
                params, headers);

        org.springframework.http.ResponseEntity<com.example.springrest.domain.auth.model.dto.GoogleTokenResponse> response = restTemplate
                .postForEntity(tokenUrl, requestEntity,
                        com.example.springrest.domain.auth.model.dto.GoogleTokenResponse.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new AuthenticationException("Failed to get Google Access Token");
        }

        String accessToken = response.getBody().getAccessToken();

        // 2. 구글 사용자 정보 가져오기
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        org.springframework.http.HttpHeaders userInfoHeaders = new org.springframework.http.HttpHeaders();
        userInfoHeaders.setBearerAuth(accessToken);
        org.springframework.http.HttpEntity<Void> userInfoRequest = new org.springframework.http.HttpEntity<>(
                userInfoHeaders);

        org.springframework.http.ResponseEntity<com.example.springrest.domain.auth.model.dto.GoogleUserInfo> userInfoResponse = restTemplate
                .exchange(
                        userInfoUrl,
                        org.springframework.http.HttpMethod.GET,
                        userInfoRequest,
                        com.example.springrest.domain.auth.model.dto.GoogleUserInfo.class);

        if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
            throw new AuthenticationException("Failed to get Google User Info");
        }

        com.example.springrest.domain.auth.model.dto.GoogleUserInfo googleUser = userInfoResponse.getBody();

        // 3. 사용자 확인 및 가입/로그인 처리
        com.example.springrest.domain.user.model.entity.UserInfo userInfo = userInfoMapper
                .findByUserEmail(googleUser.getEmail());

        if (userInfo == null) {
            // 신규 가입
            String randomPwd = java.util.UUID.randomUUID().toString();
            String userId = googleUser.getEmail().split("@")[0] + "_"
                    + java.util.UUID.randomUUID().toString().substring(0, 5); // ID 중복 방지

            com.example.springrest.domain.user.model.dto.UserInfoRequest joinRequest = com.example.springrest.domain.user.model.dto.UserInfoRequest
                    .builder()
                    .userId(userId)
                    .userEmail(googleUser.getEmail())
                    .userName(googleUser.getName())
                    .userPwd(randomPwd)
                    .userNick(googleUser.getName())
                    .useYn("1")
                    .build();

            userService.createUser(joinRequest); // 비밀번호 암호화는 UserService에서 처리됨

            // PROVIDER, SNSID 업데이트 (UserService.createUser는 기본 필드만 매핑할 수 있으므로 별도 update
            // 필요하거나 Request에 필드 추가 필요)
            // UserInfoRequest에 provider, snsId가 없다면 직접 Entity 생성해서 넣는게 나을 수 있음.
            // 일단 createUser 호출 후 Update로 처리
            userInfo = userInfoMapper.findById(userId);
            userInfo.setUserProvider("GOOGLE");
            userInfo.setUserSnsid(googleUser.getId());
            userInfoMapper.update(userInfo);

            // 권한 부여 (기본 USER)
            userService.assignRoles(userId, java.util.List.of("ROLE_USER"));

        } else {
            // 기존 회원 - 정보 업데이트 (필요시)
            if (!"GOOGLE".equals(userInfo.getUserProvider())) {
                // 이미 다른 경로(LOCAL 등)로 가입된 이메일인 경우 정책 결정 필요.
                // 여기서는 GOOGLE 정보를 병합(업데이트)하는 것으로 처리
                userInfo.setUserProvider("GOOGLE");
                userInfo.setUserSnsid(googleUser.getId());
                userInfoMapper.update(userInfo);
            }
        }

        // 4. JWT 토큰 생성 및 반환
        // AuthUser 객체로 변환 (UserDetailsProvider 로직이나 직접 변환)
        java.util.Set<UserRole> roles = new java.util.HashSet<>(
                userService.getUserRoleIds(userInfo.getUserId()).stream()
                        .map(UserRole::valueOf)
                        .collect(java.util.stream.Collectors.toList()));

        String token = jwtTokenProvider.generateToken(userInfo.getUserId(), roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userInfo.getUserId());
        Long expiresIn = jwtTokenProvider.getExpirationMs();

        AuthUser authUser = AuthUser.builder()
                .userId(userInfo.getUserId())
                .userName(userInfo.getUserName())
                .email(userInfo.getUserEmail())
                .roles(new java.util.ArrayList<>(roles))
                .userProvider(userInfo.getUserProvider())
                .build();

        log.info("Google User {} logged in successfully", userInfo.getUserId());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(toUserInfoResponse(authUser))
                .build();
    }

    private UserInfoResponse toUserInfoResponse(AuthUser user) {
        return UserInfoResponse.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .userEmail(user.getEmail())
                .roles(new java.util.HashSet<>(user.getRoles()))
                .userProvider(user.getUserProvider())
                .build();
    }
}
