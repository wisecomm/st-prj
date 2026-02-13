package com.example.springrest.domain.auth.service;

import com.example.springrest.domain.auth.dto.LoginRequest;
import com.example.springrest.domain.auth.dto.LoginResponse;
import com.example.springrest.domain.auth.dto.TokenRefreshRequest;
import com.example.springrest.domain.auth.dto.TokenRefreshResponse;
import com.example.springrest.global.exception.BusinessException;
import com.example.springrest.global.exception.ErrorCode;
import com.example.springrest.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Log4j2
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        log.info("User '{}' logged in successfully", request.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }

    public TokenRefreshResponse refresh(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            log.warn("Token refresh failed: invalid refresh token");
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Invalid refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
            log.warn("Token refresh failed: token is not a refresh token");
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Token is not a refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateAccessToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        log.info("Token refreshed for user '{}'", username);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    public void logout() {
        log.info("User logged out (client-side token invalidation)");
    }
}
