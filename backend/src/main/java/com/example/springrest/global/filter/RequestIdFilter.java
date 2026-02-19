package com.example.springrest.global.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * MDC RequestId 필터
 * 모든 HTTP 요청에 고유한 requestId를 생성하고 MDC에 저장하여 로그 추적 가능하게 함
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID = "requestId";
    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            // UUID 기반 요청 ID 생성 (8자리)
            String requestId = UUID.randomUUID().toString().substring(0, 8);

            // MDC에 저장 (로그에 자동 포함)
            MDC.put(REQUEST_ID, requestId);

            // 응답 헤더에도 포함
            response.setHeader(REQUEST_ID_HEADER, requestId);

            // 다음 필터로 전달
            filterChain.doFilter(request, response);
        } finally {
            // MDC 정리 (메모리 누수 방지)
            MDC.remove(REQUEST_ID);
        }
    }
}
