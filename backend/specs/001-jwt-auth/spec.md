# Feature Specification: JWT 기반 사용자 인증

**Feature Branch**: `001-jwt-auth`  
**Created**: 2025-11-10  
**Status**: Draft  
**Input**: User description: "사용자 인증을 위해 JWT 기반의 로그인 기능을 구현해야 한다"

## Clarifications

### Session 2025-11-10

- Q: What is the maximum acceptable response time for login requests when handling 100 concurrent users? → A: 5초 이내 응답 (p95)
- Q: Should the system implement rate limiting to prevent brute force login attempts? → A: 5회 실패 시 5분 차단
- Q: How should the system respond when the database is unavailable during login attempts? → A: 500 Internal Server Error - 일반적 서버 오류로 처리
- Q: JWT 토큰에 포함될 사용자 권한(role) 유형은 무엇인가요? → A: USER, ADMIN 두 가지 역할
- Q: 시스템의 예상 총 사용자 수는 얼마인가요? → A: 1,000명 이하 - 소규모 시스템

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 사용자 로그인 (Priority: P1)

사용자가 아이디와 비밀번호를 입력하여 로그인하면, 시스템은 JWT 토큰을 발급하고 사용자는 이 토큰으로 보호된 리소스에 접근할 수 있다.

**Why this priority**: 인증의 핵심 기능으로, 모든 후속 기능(토큰 갱신, 로그아웃 등)의 전제 조건이다. 이것 없이는 시스템에 접근할 수 없다.

**Independent Test**: 유효한 계정 정보로 로그인 API를 호출하면 JWT 토큰이 포함된 성공 응답을 받고, 해당 토큰으로 보호된 엔드포인트에 접근할 수 있다.

**Acceptance Scenarios**:

1. **Given** 등록된 사용자 계정(아이디: testuser, 비밀번호: password123)이 존재할 때, **When** 올바른 아이디와 비밀번호로 로그인 요청을 보내면, **Then** JWT 토큰이 포함된 성공 응답(code: 200, message: SUCCESS)을 받는다.
2. **Given** JWT 토큰을 받은 후, **When** Authorization 헤더에 토큰을 포함하여 보호된 API를 호출하면, **Then** 요청이 정상적으로 처리된다.
3. **Given** 잘못된 비밀번호를 입력했을 때, **When** 로그인 요청을 보내면, **Then** 인증 실패 응답(code: 401, message: "인증 실패")을 받는다.
4. **Given** 존재하지 않는 사용자 아이디를 입력했을 때, **When** 로그인 요청을 보내면, **Then** 인증 실패 응답(code: 401, message: "인증 실패")을 받는다.

---

### User Story 2 - 토큰 만료 처리 (Priority: P2)

JWT 토큰은 30분 후 만료되며, 만료된 토큰으로 접근 시도 시 사용자는 명확한 오류 메시지를 받고 재로그인할 수 있다.

**Why this priority**: 보안 강화를 위한 필수 기능이지만, 로그인 자체보다는 부차적이다. 로그인 기능이 먼저 구현되어야 의미가 있다.

**Independent Test**: 로그인 후 30분이 지난 토큰으로 API를 호출하면 토큰 만료 오류를 받고, 재로그인 시 새 토큰을 받아 정상 접근할 수 있다.

**Acceptance Scenarios**:

1. **Given** 30분이 경과한 JWT 토큰을 가지고 있을 때, **When** 보호된 API를 호출하면, **Then** 토큰 만료 응답(code: 401, message: "토큰이 만료되었습니다")을 받는다.
2. **Given** 토큰 만료 오류를 받은 후, **When** 다시 로그인하면, **Then** 새로운 JWT 토큰을 받고 정상적으로 API를 사용할 수 있다.
3. **Given** 유효한 토큰(만료 전)을 가지고 있을 때, **When** 보호된 API를 호출하면, **Then** 정상적으로 요청이 처리된다.

---

### User Story 3 - 토큰 정보 조회 (Priority: P3)

개발자나 다른 서비스는 유틸리티 함수를 사용하여 JWT 토큰에서 사용자 정보(아이디, 권한 등)를 추출할 수 있다.

**Why this priority**: 편의 기능으로, 로그인과 만료 처리가 동작하면 그 다음에 추가해도 된다. 시스템 내부 개발 편의를 위한 기능이다.

**Independent Test**: 유효한 JWT 토큰을 유틸리티 함수에 전달하면 토큰에 포함된 사용자 ID, 이메일, 권한 정보를 정확히 추출할 수 있다.

**Acceptance Scenarios**:

1. **Given** 유효한 JWT 토큰이 있을 때, **When** 토큰 정보 추출 유틸리티 함수를 호출하면, **Then** 사용자 ID, 이메일, 권한 등의 정보를 얻을 수 있다.
2. **Given** 만료된 토큰을 전달했을 때, **When** 유틸리티 함수를 호출하면, **Then** 토큰 만료 예외가 발생한다.
3. **Given** 잘못된 형식의 토큰을 전달했을 때, **When** 유틸리티 함수를 호출하면, **Then** 유효하지 않은 토큰 예외가 발생한다.

---

### Edge Cases

- 동일 사용자가 여러 기기에서 동시에 로그인할 경우 어떻게 처리하는가? (각 기기마다 독립적인 토큰 발급, 동시 세션 허용)
- 토큰 만료 직전(예: 29분 59초)에 API 호출 시 처리 중 만료되면 어떻게 되는가? (요청 시작 시점 기준 유효성 검증)
- 토큰이 탈취되었을 경우 무효화할 방법이 있는가? (현재 스펙에는 포함되지 않음, 향후 토큰 블랙리스트 기능 고려)
- 비밀번호를 여러 번 틀렸을 경우 계정 잠금 등의 보안 조치가 필요한가? (5회 실패 시 5분간 해당 계정 차단)
- 계정 차단 중에 로그인 시도 시 어떤 응답을 반환하는가? (code: 429, message: "Too Many Requests. 계정이 일시적으로 차단되었습니다")
- 데이터베이스 연결 실패 시 어떻게 처리하는가? (code: 500, message: "Internal Server Error. 일시적 오류가 발생했습니다")

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 사용자 아이디와 비밀번호를 입력받아 인증을 수행해야 한다.
- **FR-002**: 인증 성공 시 시스템은 JWT 토큰을 생성하여 응답에 포함해야 한다.
- **FR-003**: JWT 토큰의 만료 시간은 발급 시점으로부터 30분이어야 한다.
- **FR-004**: 시스템은 모든 보호된 엔드포인트에서 JWT 토큰의 유효성을 검증해야 한다.
- **FR-005**: 만료된 토큰으로 접근 시 시스템은 적절한 오류 응답을 반환해야 한다.
- **FR-006**: 시스템은 JWT 토큰에서 사용자 정보(사용자 ID, 이메일, 권한)를 추출하는 유틸리티 함수를 제공해야 한다.
- **FR-007**: 모든 API 응답은 표준화된 JSON 형식으로 반환되어야 한다: `{"code": "상태코드", "message": "메시지", "data": "데이터"}`
- **FR-008**: 인증 실패 시 시스템은 보안을 위해 구체적인 실패 사유(아이디 없음 vs 비밀번호 틀림)를 노출하지 않아야 한다.
- **FR-009**: 시스템은 동일 사용자 계정에 대해 5회 연속 로그인 실패 시 해당 계정을 5분간 차단해야 한다.
- **FR-010**: Swagger API 문서는 개발 환경(dev)에서만 활성화되어야 하며, 운영 환경(prod)에서는 비활성화되어야 한다.
- **FR-011**: 비밀번호는 평문으로 저장되지 않고 암호화되어 저장되어야 한다. (BCrypt 등 표준 해싱 알고리즘 사용)
- **FR-012**: 데이터베이스 연결 실패 등 시스템 오류 발생 시 500 Internal Server Error를 반환해야 한다.

### Key Entities

- **User (사용자)**: 시스템에 로그인하는 주체. 아이디, 비밀번호(암호화), 이메일, 권한(role) 정보를 포함한다. 권한은 USER(일반 사용자) 또는 ADMIN(관리자) 중 하나이다.
- **JwtToken (JWT 토큰)**: 인증 성공 시 발급되는 토큰. 사용자 식별 정보, 권한(USER/ADMIN), 발급 시간, 만료 시간을 포함한다.
- **LoginRequest (로그인 요청)**: 사용자가 제공하는 로그인 정보. 아이디와 비밀번호를 포함한다.
- **ApiResponse (API 응답)**: 모든 API의 표준 응답 형식. code(상태코드), message(메시지), data(실제 데이터)를 포함한다.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 사용자는 올바른 계정 정보로 3초 이내에 로그인하고 JWT 토큰을 받을 수 있다.
- **SC-002**: 시스템은 동시에 100명의 사용자 로그인 요청을 5초 이내(p95)에 처리할 수 있다.
- **SC-003**: 만료된 토큰으로 접근 시도하는 사용자의 95% 이상이 명확한 오류 메시지를 보고 재로그인할 수 있다.
- **SC-004**: 개발자는 유틸리티 함수를 사용하여 10줄 이내의 코드로 토큰에서 사용자 정보를 추출할 수 있다.
- **SC-005**: Swagger 문서는 개발 환경에서만 접근 가능하며, 운영 환경에서는 404 오류를 반환한다.
- **SC-006**: 인증 관련 보안 이벤트(로그인 성공/실패, 토큰 만료)의 100%가 로그에 기록된다.

## Assumptions *(optional)*

- 사용자 계정은 이미 시스템에 등록되어 있다고 가정한다. (회원가입 기능은 별도 구현)
- 데이터베이스에는 users 테이블이 존재하며 최소한 id, username, password(암호화), email, role 컬럼을 포함한다.
- 시스템은 소규모로 설계되며, 총 등록 사용자 수는 1,000명 이하를 목표로 한다.
- JWT 서명 알고리즘은 HS256(HMAC-SHA256)을 사용한다.
- JWT secret key는 환경 변수 또는 설정 파일에서 안전하게 관리된다.
- 토큰 갱신(refresh token) 기능은 현재 스펙에 포함되지 않으며, 만료 시 재로그인이 필요하다.
- 다중 기기 로그인을 지원하며, 각 세션은 독립적인 토큰을 사용한다.

## Dependencies *(optional)*

- PostgreSQL 데이터베이스가 구성되어 있어야 한다.
- 사용자 테이블(users)이 생성되고 최소 1개 이상의 테스트 계정이 등록되어 있어야 한다.
- Spring Security 프레임워크가 프로젝트에 포함되어야 한다.
- JWT 라이브러리(예: jjwt 또는 spring-security-jwt)가 의존성에 추가되어야 한다.
- 환경별 설정 파일(application-dev.yml, application-prod.yml)이 준비되어 있어야 한다.

## Out of Scope *(optional)*

다음 기능은 현재 스펙에 포함되지 않으며, 향후 별도 기능으로 고려될 수 있다:

- 회원가입 및 비밀번호 찾기 기능
- Refresh Token을 통한 토큰 갱신 메커니즘
- 소셜 로그인(OAuth2) 연동
- 다중 인증(Multi-Factor Authentication, MFA)
- 토큰 블랙리스트 및 강제 로그아웃
- 계정 잠금 및 비밀번호 정책(복잡도, 만료 기간)
- 로그인 이력 추적 및 감사 로그
- CAPTCHA를 통한 봇 방지
