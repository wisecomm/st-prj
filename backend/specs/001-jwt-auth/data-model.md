# Phase 1: Data Model - JWT 인증 기능

## 개요

JWT 기반 로그인 시스템을 위한 데이터 모델을 정의합니다. PostgreSQL 15.x를 사용하며, MyBatis 3.x로 접근합니다.

---

## 1. Entity: User (사용자)

### 목적
시스템 사용자 정보를 저장하고, 로그인 인증의 기준이 됩니다.

### 테이블 정의

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,  -- BCrypt 해시 (60자 + 여유)
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,  -- 'USER' 또는 'ADMIN'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Java Entity

```java
package com.example.springrest.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private String password;  // BCrypt 해시 저장
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Enum: UserRole

```java
package com.example.springrest.model.enums;

public enum UserRole {
    USER,   // 일반 사용자
    ADMIN   // 관리자
}
```

### 검증 규칙

| 필드 | 제약 조건 | 설명 |
|------|-----------|------|
| username | NOT NULL, UNIQUE, 3-50자 | 로그인 ID, 영문/숫자/언더스코어만 허용 |
| password | NOT NULL, 60자 이상 | BCrypt 해시 저장 ($2a$10$...) |
| email | NOT NULL, UNIQUE, 이메일 형식 | 이메일 주소 |
| role | NOT NULL, ENUM(USER, ADMIN) | 역할 |

### 상태 전이
- **생성 시**: 기본 role=USER, password는 BCrypt 해싱 후 저장
- **업데이트 시**: updated_at 자동 갱신 (트리거 또는 애플리케이션 레벨)

### 초기 데이터 (테스트용)

```sql
-- 개발 환경 전용 (application-dev.yml 활성화 시)
INSERT INTO users (username, password, email, role) VALUES
  ('testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IVI9sW1kFGhaBsOXShVfUuQrU3YOi2', 'test@example.com', 'USER'),  -- 비밀번호: password123
  ('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'admin@example.com', 'ADMIN');  -- 비밀번호: admin123
```

---

## 2. Entity: LoginAttempt (로그인 시도 기록)

### 목적
Rate limiting을 위한 로그인 실패 이력을 저장하고, 감사 로그(audit log)로 활용합니다.

### 테이블 정의

```sql
CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    attempt_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),  -- IPv6 지원 (최대 45자)
    user_agent VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_username_time ON login_attempts(username, attempt_time DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
```

### Java Entity

```java
package com.example.springrest.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {
    private Long id;
    private String username;
    private LocalDateTime attemptTime;
    private Boolean success;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
```

### 검증 규칙

| 필드 | 제약 조건 | 설명 |
|------|-----------|------|
| username | NOT NULL | 로그인 시도한 사용자명 (존재하지 않아도 기록) |
| attempt_time | NOT NULL | 시도 시각 |
| success | NOT NULL | 성공 여부 (true/false) |
| ip_address | NULL 가능 | 클라이언트 IP (X-Forwarded-For 헤더에서 추출) |
| user_agent | NULL 가능 | User-Agent 헤더 값 |

### 데이터 보관 정책
- **개발 환경**: 무제한 보관
- **운영 환경**: 90일 이후 데이터 자동 삭제 (스케줄러 or DB 파티셔닝)

```sql
-- 90일 이전 데이터 삭제 (스케줄러 작업)
DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 3. DTO: LoginRequest (로그인 요청)

### 목적
클라이언트가 로그인 요청 시 전달하는 데이터 구조입니다.

### Java DTO

```java
package com.example.springrest.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    private String password;
}
```

### 검증 규칙
- username: 3-50자, 필수
- password: 8-100자, 필수 (BCrypt 해싱 전 평문)

---

## 4. DTO: LoginResponse (로그인 응답)

### 목적
로그인 성공 시 JWT 토큰과 사용자 정보를 반환합니다.

### Java DTO

```java
package com.example.springrest.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;         // JWT 토큰
    private String tokenType;     // "Bearer"
    private Long expiresIn;       // 만료 시간 (초 단위, 1800)
    private UserInfo user; // 사용자 기본 정보
}
```

### 예시 JSON 응답

```json
{
  "code": "200",
  "message": "SUCCESS",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER"
    }
  }
}
```

---

## 5. Entity: UserInfo (사용자 정보)

### 목적
JWT 토큰에서 추출한 사용자 정보를 반환합니다.

### Java DTO

```java
package com.example.springrest.model.dto;

import com.example.springrest.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String userId;
    private String userEmail;
    private UserRole userRole;
}
```

---

## 6. DTO: TokenValidationRequest (토큰 검증 요청)

### 목적
JWT 토큰의 유효성을 검증하는 API 요청입니다.

### Java DTO

```java
package com.example.springrest.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationRequest {
    @NotBlank(message = "Token is required")
    private String token;
}
```

---

## 7. DTO: ApiResponse<T> (표준 응답 포맷)

### 목적
모든 API 응답에 사용되는 표준 래퍼 객체입니다.

### Java DTO

```java
package com.example.springrest.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String code;      // HTTP 상태 코드 문자열 (예: "200", "401")
    private String message;   // 응답 메시지 (예: "SUCCESS", "INVALID_CREDENTIALS")
    private T data;           // 실제 데이터 (제네릭)
    
    // 편의 메서드
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .code("200")
            .message("SUCCESS")
            .data(data)
            .build();
    }
    
    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
            .code(code)
            .message(message)
            .data(null)
            .build();
    }
}
```

### 사용 예시

```java
// 성공 응답
return ResponseEntity.ok(ApiResponse.success(loginResponse));

// 실패 응답
return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
    .body(ApiResponse.error("401", "INVALID_CREDENTIALS"));
```

---

## 8. MyBatis 매퍼 인터페이스

### UserMapper

```java
package com.example.springrest.repository;

import com.example.springrest.model.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Optional;

@Mapper
public interface UserMapper {
    /**
     * username으로 사용자 조회
     * @param username 사용자명
     * @return 사용자 엔티티 (없으면 null)
     */
    User findByUsername(@Param("username") String username);
    
    /**
     * 사용자 생성 (테스트/초기화용)
     * @param user 사용자 엔티티
     * @return 생성된 row 수
     */
    int insert(User user);
}
```

### LoginAttemptMapper

```java
package com.example.springrest.repository;

import com.example.springrest.model.entity.LoginAttempt;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;

@Mapper
public interface LoginAttemptMapper {
    /**
     * 로그인 시도 기록 저장
     * @param loginAttempt 로그인 시도 엔티티
     * @return 생성된 row 수
     */
    int insert(LoginAttempt loginAttempt);
    
    /**
     * 특정 시간 이후의 실패 횟수 조회
     * @param username 사용자명
     * @param sinceTime 조회 시작 시간
     * @return 실패 횟수
     */
    int countFailedAttemptsSince(@Param("username") String username, 
                                  @Param("sinceTime") LocalDateTime sinceTime);
    
    /**
     * 90일 이전 데이터 삭제 (스케줄러용)
     * @param beforeTime 삭제 기준 시간
     * @return 삭제된 row 수
     */
    int deleteOldAttempts(@Param("beforeTime") LocalDateTime beforeTime);
}
```

---

## 9. MyBatis XML 매퍼 예시

### UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.springrest.repository.UserMapper">
    <resultMap id="UserResultMap" type="com.example.springrest.model.entity.User">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="password" column="password"/>
        <result property="email" column="email"/>
        <result property="role" column="role" typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <select id="findByUsername" resultMap="UserResultMap">
        SELECT id, username, password, email, role, created_at, updated_at
        FROM users
        WHERE username = #{username}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO users (username, password, email, role, created_at, updated_at)
        VALUES (#{username}, #{password}, #{email}, #{role}, NOW(), NOW())
    </insert>
</mapper>
```

### LoginAttemptMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.springrest.repository.LoginAttemptMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO login_attempts (username, attempt_time, success, ip_address, user_agent, created_at)
        VALUES (#{username}, #{attemptTime}, #{success}, #{ipAddress}, #{userAgent}, NOW())
    </insert>

    <select id="countFailedAttemptsSince" resultType="int">
        SELECT COUNT(*)
        FROM login_attempts
        WHERE username = #{username}
          AND success = false
          AND attempt_time >= #{sinceTime}
    </select>

    <delete id="deleteOldAttempts">
        DELETE FROM login_attempts
        WHERE created_at < #{beforeTime}
    </delete>
</mapper>
```

---

## 10. 관계도 (ERD)

```text
┌─────────────────────────┐
│ users                   │
├─────────────────────────┤
│ PK id (BIGSERIAL)       │
│    username (VARCHAR)   │
│    password (VARCHAR)   │
│    email (VARCHAR)      │
│    role (VARCHAR)       │
│    created_at           │
│    updated_at           │
└─────────────────────────┘
           │
           │ (참조하지 않음, username으로만 연결)
           │
           ▼
┌─────────────────────────┐
│ login_attempts          │
├─────────────────────────┤
│ PK id (BIGSERIAL)       │
│    username (VARCHAR)   │ ◄── users.username과 논리적 연관
│    attempt_time         │
│    success (BOOLEAN)    │
│    ip_address (VARCHAR) │
│    user_agent (VARCHAR) │
│    created_at           │
└─────────────────────────┘
```

**관계 설명**:
- `login_attempts.username`은 `users.username`과 논리적으로 연결되나, 외래키(FK) 제약은 없습니다.
- 이유: 존재하지 않는 사용자명으로도 로그인 시도를 기록해야 하므로 (보안 감사 목적)

---

## 11. 마이그레이션 스크립트 (Flyway/Liquibase)

### 권장 도구: Flyway

```sql
-- src/main/resources/db/migration/V1__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 개발 전용 테스트 계정
INSERT INTO users (username, password, email, role) VALUES
  ('testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IVI9sW1kFGhaBsOXShVfUuQrU3YOi2', 'test@example.com', 'USER'),
  ('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'admin@example.com', 'ADMIN');
```

```sql
-- src/main/resources/db/migration/V2__create_login_attempts_table.sql
CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    attempt_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_username_time ON login_attempts(username, attempt_time DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
```

---

## 12. 데이터 검증 전략

### 애플리케이션 레벨
- **Jakarta Validation (@Valid)**: DTO 필드 검증 (Controller 계층)
- **BCryptPasswordEncoder**: 비밀번호 해싱/검증 (Service 계층)

### 데이터베이스 레벨
- **NOT NULL 제약**: 필수 필드 보장
- **UNIQUE 제약**: username, email 중복 방지
- **인덱스**: 쿼리 성능 최적화 (username, attempt_time)

---

## 결론

데이터 모델 정의가 완료되었습니다. 다음 단계로 API 계약(contracts/) 작성이 필요합니다.
