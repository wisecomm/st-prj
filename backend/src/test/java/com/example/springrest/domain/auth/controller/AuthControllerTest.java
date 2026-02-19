package com.example.springrest.domain.auth.controller;

import com.example.springrest.domain.auth.model.dto.LoginRequest;
import com.example.springrest.domain.auth.model.dto.LoginResponse;
import com.example.springrest.domain.auth.model.dto.TokenRefreshRequest;
import com.example.springrest.domain.auth.model.dto.TokenValidationRequest;
import com.example.springrest.domain.auth.model.dto.TokenValidationResponse;
import com.example.springrest.domain.auth.service.AuthService;
import com.example.springrest.domain.user.model.dto.UserInfoResponse;
import com.example.springrest.domain.user.model.enums.UserRole;
import com.example.springrest.global.exception.AuthenticationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.springrest.global.security.JwtAuthenticationFilter;
import org.springframework.test.context.TestPropertySource;

@WebMvcTest(controllers = AuthController.class)
@TestPropertySource(properties = {
                "app.cors.allowed-origins=http://localhost:3000",
                "spring.security.oauth2.client.registration.google.client-id=test",
                "spring.security.oauth2.client.registration.google.client-secret=test"
})
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private AuthService authService;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @org.junit.jupiter.api.BeforeEach
        void setUp() throws Exception {
                org.mockito.Mockito.doAnswer(invocation -> {
                        jakarta.servlet.FilterChain chain = invocation.getArgument(2);
                        chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
                        return null;
                }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
        }

        @Test
        @DisplayName("로그인 성공")
        @WithMockUser
        void login_Success() throws Exception {
                // given
                LoginRequest request = new LoginRequest("testUser", "password");
                LoginResponse response = LoginResponse.builder()
                                .token("accessToken")
                                .refreshToken("refreshToken")
                                .tokenType("Bearer")
                                .expiresIn(3600L)
                                .build();

                given(authService.login(any(LoginRequest.class), anyString(), any())).willReturn(response);

                // when & then
                mockMvc.perform(post("/api/v1/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value("200"))
                                .andExpect(jsonPath("$.data.token").value("accessToken"));
        }

        @Test
        @DisplayName("로그인 실패 - 유효성 검사")
        @WithMockUser
        void login_Failure_Validation() throws Exception {
                // given
                LoginRequest request = new LoginRequest("", ""); // Empty fields

                // when & then
                mockMvc.perform(post("/api/v1/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value("400")); // Or 400 based on validation handler
        }

        @Test
        @DisplayName("토큰 갱신 성공")
        @WithMockUser
        void refresh_Success() throws Exception {
                // given
                TokenRefreshRequest request = new TokenRefreshRequest();
                // Setter injection typically needed for DTOs if no AllArgs constructor used in
                // test
                // Assuming NoArgs+Setters or AllArgs exists. Let's rely on JSON mapping.
                // Actually TokenRefreshRequest might need reflection or proper construction.
                // Let's use string replacement in JSON or trust ObjectMapper.

                // Constructing request via trick or assuming standard bean
                // request.setRefreshToken("validRefreshToken");

                String requestJson = "{\"refreshToken\":\"validRefreshToken\"}";

                LoginResponse response = LoginResponse.builder()
                                .token("newAccessToken")
                                .refreshToken("newRefreshToken")
                                .build();

                given(authService.refreshToken("validRefreshToken")).willReturn(response);

                // when & then
                mockMvc.perform(post("/api/v1/auth/refresh")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.token").value("newAccessToken"));
        }

        @Test
        @DisplayName("현재 사용자 조회")
        @WithMockUser(username = "testUser")
        void getCurrentUser_Success() throws Exception {
                // given
                UserInfoResponse response = UserInfoResponse.builder()
                                .userId("testUser")
                                .userName("Test User")
                                .build();

                given(authService.getCurrentUser("testUser")).willReturn(response);

                // when & then
                mockMvc.perform(get("/api/v1/auth/me")
                                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.userId").value("testUser"));
        }

        @Test
        @DisplayName("토큰 검증")
        @WithMockUser
        void validateToken_Success() throws Exception {
                // given
                String requestJson = "{\"token\":\"validToken\"}";
                TokenValidationResponse response = TokenValidationResponse.valid("testUser",
                                java.util.List.of(UserRole.ROLE_USER));

                given(authService.validateToken("validToken")).willReturn(response);

                // when & then
                mockMvc.perform(post("/api/v1/auth/validate")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.valid").value(true))
                                .andExpect(jsonPath("$.data.userId").value("testUser"));
        }

        @Test
        @DisplayName("로그아웃")
        @WithMockUser
        void logout_Success() throws Exception {
                // given
                doNothing().when(authService).logout("validToken");

                // when & then
                mockMvc.perform(post("/api/v1/auth/logout")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .header("Authorization", "Bearer validToken"))
                                .andExpect(status().isOk());
        }
}
