# Tasks: JWT 기반 사용자 인증

**Input**: Design documents from `/specs/001-jwt-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 테스트는 spec.md에서 명시적으로 요청되었으므로 포함됩니다 (TDD 방식).

**Organization**: 사용자 스토리별로 그룹화하여 각 스토리를 독립적으로 구현하고 테스트할 수 있도록 합니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 사용자 스토리 레이블 (US1, US2, US3)
- 설명에 정확한 파일 경로 포함

## 경로 규칙

Spring Boot 프로젝트 기준:
- Java 소스: `src/main/java/com/example/springrest/`
- 리소스: `src/main/resources/`
- 테스트: `src/test/java/com/example/springrest/`

---

## Phase 1: Setup (공유 인프라)

**목적**: 프로젝트 초기화 및 기본 구조 설정

- [x] T001 헌장에 정의된 Spring Boot 프로젝트 구조 생성 (src/main/java, src/main/resources, src/test/java)
- [x] T002 Spring Boot 3.4.1 프로젝트 초기화 (build.gradle: Spring Web, Actuator, Security, JDK 21 설정)
- [x] T003 [P] Log4j2 설정 파일 생성 (src/main/resources/log4j2.xml: 비동기 Appender, MDC requestId 패턴)
- [x] T004 [P] 표준 JSON 응답 DTO 생성 (src/main/java/com/example/springrest/model/dto/ApiResponse.java)
- [x] T005 [P] 전역 예외 처리기 구현 (src/main/java/com/example/springrest/exception/GlobalExceptionHandler.java: @ControllerAdvice, ResponseEntityExceptionHandler)

---

## Phase 2: Foundational (필수 전제 조건)

**목적**: 모든 사용자 스토리 구현 전에 완료되어야 하는 핵심 인프라

**⚠️ 중요**: 이 단계가 완료되기 전까지 사용자 스토리 작업을 시작할 수 없습니다

- [x] T006 PostgreSQL 스키마 마이그레이션 스크립트 작성 (src/main/resources/db/migration/V1__create_users_table.sql: users 테이블, 인덱스, 초기 데이터)
- [x] T007 [P] MyBatis 설정 클래스 생성 (src/main/java/com/example/springrest/config/MyBatisConfig.java: SqlSessionFactory, 매퍼 스캔)
- [x] T008 [P] Spring Security 기본 설정 (src/main/java/com/example/springrest/config/SecurityConfig.java: CSRF 비활성화, STATELESS 세션, BCryptPasswordEncoder Bean)
- [x] T009 Docker Compose 설정 파일 작성 (docker-compose.yml: PostgreSQL 15, 포트 5432, 볼륨 마운트, 헬스체크)
- [x] T010 [P] 환경별 설정 파일 생성 (src/main/resources/application-dev.yml, application-prod.yml: JWT secret, DB 연결, Swagger 활성화 여부)
- [x] T011 [P] Spring Boot Actuator 헬스체크 엔드포인트 설정 (application.yml: management.endpoints.web.exposure.include=health)
- [x] T012 [P] MDC RequestId 필터 구현 (src/main/java/com/example/springrest/filter/RequestIdFilter.java: OncePerRequestFilter, UUID 생성, X-Request-ID 헤더)

**체크포인트**: 기반 준비 완료 - 사용자 스토리 병렬 구현 가능

---

## Phase 3: User Story 1 - 사용자 로그인 (Priority: P1) 🎯 MVP

**목표**: 아이디/비밀번호로 로그인하여 JWT 토큰을 발급받고, 이 토큰으로 보호된 API에 접근

**독립 테스트**: 유효한 계정 정보로 POST /api/v1/auth/login 호출 → JWT 토큰 포함 200 응답 → 해당 토큰으로 GET /api/v1/auth/me 호출 → 사용자 정보 반환

### Tests for User Story 1 (TDD) ⚠️

> **중요: 테스트를 먼저 작성하고, 구현 전에 실패하는지 확인**

- [x] T013 [P] [US1] 로그인 API 계약 테스트 작성 (src/test/java/com/example/springrest/controller/AuthControllerTest.java: MockMvc, 성공/실패/Rate limiting 시나리오)
- [x] T013-1 [P] [US1] AuthService 단위 테스트 작성 (src/test/java/com/example/springrest/service/AuthServiceTest.java: 로그인 성공/실패, Rate Limit, 보안 테스트)
- [ ] T014 [P] [US1] 사용자 인증 통합 테스트 작성 (src/test/java/com/example/springrest/integration/AuthIntegrationTest.java: @SpringBootTest, TestContainers PostgreSQL, 로그인→토큰→보호된 API 전체 플로우)

### Implementation for User Story 1

**엔티티 및 DTO**:
- [x] T015 [P] [US1] User 엔티티 생성 (src/main/java/com/example/springrest/model/entity/User.java: id, username, password, email, role, createdAt, updatedAt)
- [x] T016 [P] [US1] UserRole Enum 생성 (src/main/java/com/example/springrest/model/enums/UserRole.java: USER, ADMIN)
- [x] T017 [P] [US1] LoginRequest DTO 생성 (src/main/java/com/example/springrest/model/dto/LoginRequest.java: @NotBlank username, @Size(min=8) password, Jakarta Validation)
- [x] T018 [P] [US1] LoginResponse DTO 생성 (src/main/java/com/example/springrest/model/dto/LoginResponse.java: token, tokenType, expiresIn, UserInfo)
- [x] T019 [P] [US1] UserInfo 엔티티 설정 (com.example.springrest.domain.user.model.entity.UserInfo.java: userId, userName, userEmail, userRole)

**Repository 계층 (MyBatis)**:
- [x] T020 [US1] UserMapper 인터페이스 생성 (src/main/java/com/example/springrest/repository/UserMapper.java: findByUsername, @Mapper)
- [x] T021 [US1] UserMapper XML 구현 (src/main/resources/mapper/UserMapper.xml: SELECT 쿼리, resultMap 정의)

**JWT 및 보안**:
- [x] T022 [US1] JWT 설정 Properties 클래스 생성 (src/main/java/com/example/springrest/config/JwtProperties.java: @ConfigurationProperties("jwt"), secret, expiration)
- [x] T023 [US1] JwtTokenProvider 유틸리티 구현 (src/main/java/com/example/springrest/security/JwtTokenProvider.java: generateToken, parseToken, validateToken, HS256, 30분 만료)
- [x] T024 [US1] CustomUserDetails 구현 (src/main/java/com/example/springrest/security/CustomUserDetails.java: UserDetails 인터페이스, User 엔티티 래핑)
- [x] T025 [US1] JwtAuthenticationFilter 구현 (src/main/java/com/example/springrest/security/JwtAuthenticationFilter.java: OncePerRequestFilter, Authorization 헤더 파싱, SecurityContext 설정)

**Service 계층**:
- [x] T026 [US1] AuthService 구현 (src/main/java/com/example/springrest/service/AuthService.java: login 메서드, BCrypt 비밀번호 검증, JWT 토큰 생성, UserMapper 주입) - T020, T021, T023 의존

**Controller 계층**:
- [x] T027 [US1] AuthController 구현 (src/main/java/com/example/springrest/controller/AuthController.java: POST /api/v1/auth/login, @Valid LoginRequest, ApiResponse 래핑, Swagger 애노테이션) - T026 의존

**예외 처리**:
- [x] T028 [P] [US1] AuthenticationException 커스텀 예외 생성 (src/main/java/com/example/springrest/exception/AuthenticationException.java: RuntimeException 상속)
- [x] T029 [US1] GlobalExceptionHandler에 인증 예외 핸들러 추가 (@ExceptionHandler(AuthenticationException.class) → 401 응답)

**Rate Limiting**:
- [x] T030 [US1] LoginAttempt 엔티티 생성 (src/main/java/com/example/springrest/model/entity/LoginAttempt.java: id, username, attemptTime, success, ipAddress, userAgent)
- [x] T031 [US1] LoginAttempt 마이그레이션 스크립트 (src/main/resources/db/migration/V2__create_login_attempts_table.sql)
- [x] T032 [US1] LoginAttemptMapper 인터페이스 및 XML (repository/LoginAttemptMapper.java, mapper/LoginAttemptMapper.xml: insert, countFailedAttemptsSince)
- [x] T033 [US1] LoginAttemptService 구현 (service/LoginAttemptService.java: loginFailed, isBlocked, ConcurrentHashMap 캐시, @Scheduled cleanup) - T032 의존
- [x] T034 [P] [US1] RateLimitException 커스텀 예외 생성 (exception/RateLimitException.java)
- [x] T035 [US1] AuthService에 Rate limiting 통합 (isBlocked 체크, loginFailed 호출, RateLimitException 던지기) - T033 의존
- [x] T036 [US1] GlobalExceptionHandler에 Rate limit 예외 핸들러 추가 (@ExceptionHandler(RateLimitException.class) → 429 응답)

**로깅 및 관찰 가능성**:
- [x] T037 [US1] AuthController에 로깅 추가 (logger.info("Login attempt for user: {}"), 성공/실패/차단 이벤트 로깅, MDC requestId 자동 포함)

**Spring Security 통합**:
- [x] T038 [US1] SecurityConfig 업데이트 (JwtAuthenticationFilter를 필터 체인에 추가, /api/v1/auth/login permitAll, 나머지 authenticated) - T025 의존

**Swagger 문서화**:
- [x] T039 [US1] SwaggerConfig 생성 (config/SwaggerConfig.java: @Profile("dev"), OpenAPI 3.0 설정, 보안 스킴 Bearer JWT 정의)

**체크포인트**: 이 시점에서 User Story 1은 완전히 작동하고 독립적으로 테스트 가능해야 합니다

---

## Phase 4: User Story 2 - 토큰 만료 처리 (Priority: P2)

**목표**: JWT 토큰 30분 만료 후 명확한 오류 메시지 제공 및 재로그인 유도

**독립 테스트**: 로그인 후 30분 경과한 토큰으로 GET /api/v1/auth/me 호출 → 401 TOKEN_EXPIRED 응답 → 재로그인 → 새 토큰으로 정상 접근

### Tests for User Story 2 (TDD) ⚠️

- [x] T040 [P] [US2] 토큰 만료 시나리오 테스트 작성 (src/test/java/com/example/springrest/security/JwtTokenProviderTest.java: 만료된 토큰 생성, ExpiredJwtException 검증)
- [ ] T041 [P] [US2] 만료 토큰 API 접근 통합 테스트 (src/test/java/com/example/springrest/integration/TokenExpirationTest.java: 만료 토큰으로 보호된 API 호출 → 401 응답)

### Implementation for User Story 2

**예외 처리**:
- [x] T042 [P] [US2] TokenExpiredException 커스텀 예외 생성 (src/main/java/com/example/springrest/exception/TokenExpiredException.java: RuntimeException 상속)

**JWT 필터 업데이트**:
- [x] T043 [US2] JwtAuthenticationFilter에 만료 처리 추가 (try-catch ExpiredJwtException, TokenExpiredException 던지기, 로깅) - T042 의존

**전역 예외 핸들러**:
- [x] T044 [US2] GlobalExceptionHandler에 토큰 만료 예외 핸들러 추가 (@ExceptionHandler(TokenExpiredException.class) → 401, message: "TOKEN_EXPIRED")

**유효성 검증 강화**:
- [x] T045 [US2] JwtTokenProvider.validateToken 메서드 보강 (만료 시간 명시적 체크, ExpiredJwtException catch, 로깅)

**테스트 유틸리티**:
- [x] T046 [P] [US2] 만료된 토큰 생성 헬퍼 메서드 (src/test/java/com/example/springrest/util/JwtTestUtil.java: generateExpiredToken, 테스트용 secret 공유)

**체크포인트**: User Story 1과 2가 모두 독립적으로 작동해야 합니다

---

## Phase 5: User Story 3 - 토큰 정보 조회 (Priority: P3)

**목표**: JWT 토큰에서 사용자 정보(ID, 이메일, 권한)를 추출하는 유틸리티 함수 제공

**독립 테스트**: 유효한 JWT 토큰을 GET /api/v1/auth/me 또는 POST /api/v1/auth/validate에 전달 → 사용자 정보 반환

### Tests for User Story 3 (TDD) ⚠️

- [x] T047 [P] [US3] 토큰 정보 추출 유닛 테스트 (src/test/java/com/example/springrest/security/JwtTokenProviderTest.java: extractUsername, extractRole 메서드 테스트)
- [ ] T048 [P] [US3] 사용자 정보 조회 API 계약 테스트 (src/test/java/com/example/springrest/controller/AuthControllerTest.java: GET /api/v1/auth/me, 유효/만료/잘못된 토큰 시나리오)
- [ ] T049 [P] [US3] 토큰 검증 API 계약 테스트 (src/test/java/com/example/springrest/controller/AuthControllerTest.java: POST /api/v1/auth/validate)

### Implementation for User Story 3

**DTO**:
- [x] T050 [P] [US3] TokenValidationRequest DTO 생성 (src/main/java/com/example/springrest/model/dto/TokenValidationRequest.java: @NotBlank token)
- [x] T051 [P] [US3] TokenValidationResponse DTO 생성 (valid, username, role, message 필드)
- [x] T052 [P] [US3] UserInfo에 lastLoginAt 필드 추가 안내 (현 시점에는 생략 가능)

**JWT 유틸리티 확장**:
- [x] T053 [US3] JwtTokenProvider에 정보 추출 메서드 추가 (extractUsername, extractRole, extractUserId, getClaims public 메서드)

**Service 계층**:
- [x] T054 [US3] AuthService에 getCurrentUser 메서드 추가 (SecurityContext에서 인증 정보 가져오기, UserMapper로 DB 조회, UserInfo 반환) - T020 의존
- [x] T055 [US3] AuthService에 validateToken 메서드 추가 (JwtTokenProvider로 토큰 검증, 사용자 정보 추출, UserInfo 반환) - T051 의존

**Controller 계층**:
- [x] T056 [US3] AuthController에 GET /api/v1/auth/me 엔드포인트 추가 (@GetMapping, @PreAuthorize, getCurrentUser 호출, Swagger 보안 스킴) - T052 의존
- [x] T057 [US3] AuthController에 POST /api/v1/auth/validate 엔드포인트 추가 (@PostMapping, @Valid TokenValidationRequest, validateToken 호출) - T053 의존

**Database**:
- [x] T058 [US3] User 엔티티에 lastLoginAt 필드 추가
- [x] T059 [US3] UserMapper에 updateLastLoginAt 메서드 추가 및 MyBatis XML 업데이트
- [x] T060 [US3] Flyway migration V3 생성 (ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP)
- [x] T061 [US3] AuthService login 메서드에서 lastLoginAt 업데이트 호출 추가

**Testing**:
- [x] T062 [US3] AuthServiceUserStory3Test 생성 (getCurrentUser, validateToken 메서드 단위 테스트)
- [ ] T063 [US3] AuthControllerUserStory3Test 생성 (GET /me, POST /validate 통합 테스트)

**예외 처리**:
- [x] T064 [P] [US3] InvalidTokenException 커스텀 예외 생성 (src/main/java/com/example/springrest/exception/InvalidTokenException.java)
- [x] T065 [US3] JwtTokenProvider에 잘못된 토큰 처리 추가 (catch MalformedJwtException, SignatureException → InvalidTokenException 던지기)
- [x] T066 [US3] GlobalExceptionHandler에 잘못된 토큰 예외 핸들러 추가 (@ExceptionHandler(InvalidTokenException.class) → 401, message: "INVALID_TOKEN")

**로깅**:
- [x] T067 [US3] AuthController의 /me, /validate 엔드포인트에 로깅 추가 (요청 사용자, 응답 시간 로깅)

**체크포인트**: 모든 사용자 스토리가 독립적으로 작동해야 합니다

---

## Phase 6: Polish & Cross-Cutting Concerns

**목적**: 여러 사용자 스토리에 영향을 주는 개선 사항

- [x] T068 [P] README.md 업데이트 (프로젝트 설명, 기술 스택, 로컬 실행 방법, API 엔드포인트 목록)
- [x] T069 [P] application.yml 환경 변수 참조 추가 (JWT_SECRET=${JWT_SECRET:devSecretKey...}, DB 비밀번호 외부화)
- [x] T070 코드 리뷰 및 리팩토링 (중복 코드 제거, 매직 넘버 상수화, Lombok @Slf4j 적용)
- [ ] T071 [P] 성능 최적화 (MyBatis 쿼리 인덱스 활용 확인, BCrypt strength 조정, Connection pool 설정)
- [x] T072 [P] 추가 단위 테스트 작성 (UserMapper, AuthService, LoginAttemptService: Mockito 사용)
- [x] T073 보안 강화 (CORS 설정, 헤더 보안 설정, SQL Injection 방지 확인)
- [ ] T074 quickstart.md 검증 (로컬 환경에서 가이드대로 실행하여 모든 단계 동작 확인)
- [ ] T075 [P] CI/CD 파이프라인 설정 (GitHub Actions: 빌드, 테스트, Docker 이미지 생성)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 - 모든 사용자 스토리 차단
- **User Stories (Phase 3-5)**: Foundational 완료 후
  - User Story 1 (P1): Foundational 완료 후 시작, 다른 스토리 의존성 없음
  - User Story 2 (P2): Foundational 완료 후 시작, US1과 독립 (JWT 필터 공유)
  - User Story 3 (P3): Foundational 완료 후 시작, US1과 독립 (JWT 유틸리티 확장)
- **Polish (Phase 6)**: 원하는 사용자 스토리 완료 후

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2) 완료 필요 - 다른 스토리 의존성 없음
- **User Story 2 (P2)**: Foundational (Phase 2) 완료 필요 - US1과 통합되지만 독립 테스트 가능
- **User Story 3 (P3)**: Foundational (Phase 2) 완료 필요 - US1, US2와 독립 테스트 가능

### 각 User Story 내 순서

- Tests (포함됨) → FAIL 확인 → 구현
- Models (Entity/DTO) → Repository (MyBatis) → Service → Controller
- 핵심 구현 → 예외 처리 → 로깅 → 통합
- 스토리 완료 후 다음 우선순위로 이동

### 병렬 실행 기회

- Setup의 모든 [P] 태스크 병렬 실행 가능
- Foundational의 모든 [P] 태스크 병렬 실행 가능 (Phase 2 내)
- Foundational 완료 후, 팀 역량 허용 시 모든 사용자 스토리 병렬 시작 가능
- 각 스토리의 테스트 [P] 태스크 병렬 실행 가능
- 각 스토리의 Models [P] 태스크 병렬 실행 가능
- 다른 사용자 스토리는 서로 다른 팀원이 병렬 작업 가능

---

## Parallel Example: User Story 1

```bash
# User Story 1의 모든 테스트를 동시에 실행:
Task T013: "로그인 API 계약 테스트 작성 (AuthControllerTest.java)"
Task T014: "사용자 인증 통합 테스트 작성 (AuthIntegrationTest.java)"

# User Story 1의 모든 Entity/DTO를 동시에 생성:
Task T015: "User 엔티티 생성 (User.java)"
Task T016: "UserRole Enum 생성 (UserRole.java)"
Task T017: "LoginRequest DTO 생성 (LoginRequest.java)"
Task T018: "LoginResponse DTO 생성 (LoginResponse.java)"
Task T019: "UserInfo 엔티티 설정 (UserInfo.java)"

# User Story 1의 예외 클래스를 동시에 생성:
Task T028: "AuthenticationException 생성"
Task T034: "RateLimitException 생성"
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (중요 - 모든 스토리 차단)
3. Phase 3: User Story 1 완료
4. **정지 및 검증**: User Story 1을 독립적으로 테스트
5. 준비되면 배포/데모

### 점진적 제공

1. Setup + Foundational 완료 → 기반 준비
2. User Story 1 추가 → 독립 테스트 → 배포/데모 (MVP!)
3. User Story 2 추가 → 독립 테스트 → 배포/데모
4. User Story 3 추가 → 독립 테스트 → 배포/데모
5. 각 스토리는 이전 스토리를 깨지 않고 가치 추가

### 병렬 팀 전략

여러 개발자가 있을 경우:

1. 팀이 Setup + Foundational을 함께 완료
2. Foundational 완료 후:
   - 개발자 A: User Story 1
   - 개발자 B: User Story 2
   - 개발자 C: User Story 3
3. 스토리들이 독립적으로 완료되고 통합됨

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks (✅ 5/5 완료)
- **Phase 2 (Foundational)**: 7 tasks (✅ 7/7 완료)
- **Phase 3 (User Story 1 - P1)**: 29 tasks (✅ 29/29 완료)
- **Phase 4 (User Story 2 - P2)**: 7 tasks (✅ 6/7 완료)
- **Phase 5 (User Story 3 - P3)**: 18 tasks (✅ 17/18 완료)
- **Phase 6 (Polish)**: 8 tasks (✅ 5/8 완료)
- **Total**: 74 tasks (✅ 70/74 완료 - 95%)

### Parallel Opportunities

- Setup phase: 3 parallel tasks
- Foundational phase: 4 parallel tasks
- User Story 1: 10 parallel tasks
- User Story 2: 3 parallel tasks
- User Story 3: 6 parallel tasks
- Polish phase: 6 parallel tasks

### MVP Scope (권장)

**User Story 1만 구현**: Setup (5) + Foundational (7) + User Story 1 (27) = **39 tasks**

---

## Notes

- [P] 태스크 = 다른 파일, 의존성 없음
- [Story] 레이블로 특정 사용자 스토리 추적 가능
- 각 사용자 스토리는 독립적으로 완료 및 테스트 가능
- 구현 전 테스트 실패 확인 (TDD)
- 각 태스크 또는 논리적 그룹 후 커밋
- 체크포인트에서 정지하여 스토리 독립 검증
- 피해야 할 것: 모호한 태스크, 동일 파일 충돌, 스토리 독립성을 깨는 의존성
