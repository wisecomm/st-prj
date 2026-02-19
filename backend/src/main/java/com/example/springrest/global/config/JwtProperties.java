package com.example.springrest.global.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 설정 Properties
 * application.yml의 jwt.* 속성을 바인딩
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    /**
     * JWT 서명 비밀 키 (최소 256-bit)
     */
    private String secret;

    /**
     * JWT 만료 시간 (밀리초)
     * 기본값: 1800000 (30분)
     */
    private long expiration = 1800000;

    /**
     * Refresh Token 만료 시간 (밀리초)
     * 기본값: 604800000 (7일)
     */
    private long refreshExpiration = 604800000;
}
