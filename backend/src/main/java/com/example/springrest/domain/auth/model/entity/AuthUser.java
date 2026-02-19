package com.example.springrest.domain.auth.model.entity;

import com.example.springrest.domain.user.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인증용 사용자 엔티티
 * 인증 프로세스에서 사용되는 사용자 정보
 */
@Data
@Builder
public class AuthUser {
    private String userId;
    private String userPwd;
    private String userName;
    private String email;
    private List<UserRole> roles;
    private LocalDateTime lastLoginDt;
    private String userProvider; // Added userProvider
}
