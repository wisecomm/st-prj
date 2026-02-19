package com.example.springrest.domain.auth.integration;

import com.example.springrest.domain.auth.model.dto.LoginRequest;
import com.example.springrest.domain.auth.model.dto.LoginResponse;
import com.example.springrest.domain.auth.model.entity.AuthUser;
import com.example.springrest.domain.user.model.enums.UserRole;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.example.springrest.domain.user.repository.UserInfoMapper userInfoMapper;

    @Autowired
    private com.example.springrest.domain.user.repository.UserRoleMapper userRoleMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Init DB with test user
        String userId = "testUser";
        userInfoMapper.delete(userId);
        userRoleMapper.deleteByUserId(userId);

        com.example.springrest.domain.user.model.entity.UserInfo user = com.example.springrest.domain.user.model.entity.UserInfo
                .builder()
                .userId(userId)
                .userPwd(passwordEncoder.encode("password123"))
                .userName("Test User")
                .useYn("Y")
                .build();

        userInfoMapper.insert(user);

        com.example.springrest.domain.user.model.entity.UserRoleMap roleMap = com.example.springrest.domain.user.model.entity.UserRoleMap
                .builder()
                .userId(userId)
                .roleId(UserRole.ROLE_USER.name())
                .useYn("Y")
                .build();

        userRoleMapper.insert(roleMap);
    }

    @Test
    @DisplayName("통합 테스트: 로그인 성공 후 내 정보 조회")
    void loginAndGetMe_Success() throws Exception {
        // 1. Login
        LoginRequest loginRequest = new LoginRequest("testUser", "password123");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).path("data").path("token").asText();

        // 2. Get Me
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value("testUser"));
    }

    @Test
    @DisplayName("통합 테스트: 비밀번호 오류 로그인 실패")
    void login_Failure_WrongPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("testUser", "wrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("401"));
    }

    @Test
    @DisplayName("통합 테스트: 토큰 갱신")
    void refreshToken_Success() throws Exception {
        // 1. Login to get refresh token
        LoginRequest loginRequest = new LoginRequest("testUser", "password123");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(responseBody).path("data").path("refreshToken").asText();

        // 2. Refresh
        String refreshJson = "{\"refreshToken\":\"" + refreshToken + "\"}";

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(refreshJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }
}
