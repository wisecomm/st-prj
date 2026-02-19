package com.example.springrest.global.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

/**
 * JWT 인증 필터
 * Authorization 헤더에서 JWT 토큰을 추출하고 검증하여 SecurityContext에 인증 정보 설정
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            try {
                // log.debug("Authorization Header: {}", bearerToken); // 필요한 경우 주석 해제
                String jwt = extractJwtFromRequest(request);
                log.debug("Extracted JWT: {}",
                        (jwt != null ? jwt.substring(0, Math.min(10, jwt.length())) + "..." : "null"));

                if (StringUtils.hasText(jwt)) {
                    if (jwtTokenProvider.validateToken(jwt)) {
                        String userId = jwtTokenProvider.extractUserId(jwt);
                        org.slf4j.MDC.put("userId", userId);

                        // UserDetails 생성 (간소화된 버전 - 실제로는 DB 조회 필요)
                        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                                .username(userId)
                                .password("") // JWT 검증 후이므로 비밀번호 불필요
                                .authorities(jwtTokenProvider.extractRoles(jwt).stream()
                                        .map(role -> new SimpleGrantedAuthority(role.name()))
                                        .collect(Collectors.toList()))
                                .build();

                        // Spring Security 인증 객체 생성
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // SecurityContext에 인증 정보 설정
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.debug("JWT authentication successful for user: {}", userId);
                    } else {
                        log.debug("JWT token validation failed");
                    }
                } else {
                    log.debug("No JWT token found in request");
                }
            } catch (Exception e) {
                log.error("JWT authentication failed: {}", e.getMessage(), e);
            }

            filterChain.doFilter(request, response);
        } finally {
            org.slf4j.MDC.remove("userId");
        }
    }

    /**
     * Authorization 헤더에서 JWT 토큰 추출
     * 
     * @param request HTTP 요청
     * @return JWT 토큰 (없으면 null)
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken)) {
            if (bearerToken.startsWith("Bearer ")) {
                // "Bearer Bearer token" 같은 이중 입력 케이스 처리 + 정상 케이스 처리
                String token = bearerToken.substring(7);
                if (token.startsWith("Bearer ")) {
                    return token.substring(7);
                }
                return token;
            }
            // "Bearer " 없이 토큰만 보낸 경우도 허용 (비표준이지만 편의성 등)
            return bearerToken;
        }
        return null;
    }
}
