# Spring REST API - JWT Authentication

JWT 기반 사용자 인증 시스템을 구현한 Spring Boot REST API 프로젝트입니다.

## 🚀 기술 스택

### Backend Framework
- **Spring Boot 3.4.1** - Java 기반 웹 애플리케이션 프레임워크
- **Java 21 (LTS)** - Eclipse Temurin 배포판
- **Gradle 8.11.1** - 빌드 자동화 도구

### Security & Authentication
- **Spring Security** - 인증 및 권한 관리
- **JWT (jjwt 0.12.6)** - JSON Web Token 기반 인증
  - HS256 알고리즘
  - 30분 토큰 만료
- **BCrypt** - 비밀번호 암호화 (strength: 10)

### Database
- **PostgreSQL 15** - 관계형 데이터베이스
- **MyBatis 3.0.3** - SQL 매퍼 프레임워크
- **Flyway** - 데이터베이스 마이그레이션

### Logging & Monitoring
- **Log4j2** - 비동기 로깅 (MDC 지원)
- **Spring Boot Actuator** - 헬스체크 및 모니터링

### API Documentation
- **Swagger/OpenAPI 3.0** - API 문서화 (개발 환경에서만 활성화)

### Testing
- **JUnit 5** - 단위 테스트 프레임워크
- **Mockito** - 모의 객체 생성
- **AssertJ** - 유연한 assertion 라이브러리

---

## 📋 주요 기능

### User Story 1: 사용자 로그인 (MVP) ✅
- 아이디/비밀번호 기반 로그인
- JWT 토큰 발급 (30분 만료)
- Rate Limiting (5분간 5회 실패 시 차단)
- 로그인 시도 이력 기록 (IP, User-Agent)

### User Story 2: 토큰 만료 처리 ✅
- 만료된 토큰 감지 및 명확한 오류 응답
- ExpiredJwtException 처리
- TOKEN_EXPIRED 응답 코드

### User Story 3: 토큰 정보 조회 ✅
- JWT 토큰에서 사용자 정보 추출
- GET /api/v1/auth/me - 현재 사용자 정보 조회
- POST /api/v1/auth/validate - 토큰 유효성 검증
- 마지막 로그인 시각 추적

---

## 🛠️ 로컬 실행 방법

### 1. 사전 요구사항
- Java 21 (Eclipse Temurin 권장)
- Git

### 2. 프로젝트 클론
```bash
git clone <repository-url>
cd spring-rest
```

### 3. PostgreSQL 실행
로컬에 설치된 PostgreSQL이 실행 중이어야 합니다. Flyway가 자동으로 스키마를 생성하고 초기 데이터를 삽입합니다.

### 4. 애플리케이션 실행
```bash
./gradlew bootRun
```

또는 빌드 후 실행:
```bash
./gradlew build
java -jar build/libs/spring-rest-0.0.1-SNAPSHOT.jar
```

### 5. 헬스체크 확인
```bash
curl http://localhost:8080/actuator/health
```

응답 예시:
```json
{
  "status": "UP"
}
```

### 6. Swagger UI 접속
개발 환경에서는 Swagger UI를 통해 API를 테스트할 수 있습니다:
```
http://localhost:8080/swagger-ui/index.html
```

---

## � API 버전 관리 전략

### 버전 체계

본 프로젝트는 **URI Path Versioning** 방식을 사용합니다:

```
/api/v{major}/...
```

| 버전 | 상태 | 설명 |
|------|------|------|
| `v1` | **Current** | 현재 운영 버전 |
| `v2` | _Future_ | 다음 메이저 버전 (계획 시 추가) |

### 버전 변경 정책

#### 메이저 버전 변경 (v1 → v2)
**다음 상황에서 새 메이저 버전 생성:**
- 기존 API 응답 구조의 Breaking Change
- 필수 요청 파라미터 추가/제거
- 엔드포인트 경로 변경
- 인증 방식 변경

#### 하위 호환 변경 (버전 유지)
**다음 변경은 기존 버전 내에서 수행:**
- 새로운 엔드포인트 추가
- 응답에 새 필드 추가 (기존 필드 유지)
- 선택적(optional) 요청 파라미터 추가
- 버그 수정 및 성능 개선

### API 경로 구조

```
/api/v1/
├── auth/                    # 인증 (Public)
│   ├── POST   /login
│   ├── POST   /refresh
│   ├── POST   /logout
│   ├── POST   /validate
│   └── GET    /me
│
├── mgmt/                    # 관리 기능 (Authenticated)
│   ├── users/               # 사용자 관리
│   ├── roles/               # 역할 관리
│   ├── menus/               # 메뉴 관리
│   ├── orders/              # 주문 관리
│   └── boards/master/       # 게시판 마스터 관리
│
└── boards/                  # 게시판 (Authenticated)
    └── board/               # 게시물 CRUD
```

### Deprecation 정책

1. **6개월 사전 공지**: 구 버전 Deprecation 최소 6개월 전 공지
2. **헤더 알림**: `Deprecation: true`, `Sunset: <date>` 헤더 추가
3. **문서 업데이트**: Swagger에 deprecated 표시
4. **병행 운영**: 구/신 버전 최소 6개월 병행 운영

### 클라이언트 가이드

```typescript
// ✅ 권장: 버전을 명시적으로 지정
const API_BASE = '/api/v1';

// ❌ 비권장: 버전 없이 사용
const API_BASE = '/api';
```

---

## �📡 API 엔드포인트

### Authentication (인증)

#### POST /api/v1/auth/login
사용자 로그인 및 JWT 토큰 발급

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 1800000,
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00",
      "lastLoginAt": "2025-01-10T12:00:00"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid username or password
- `429` - Too many failed login attempts (Rate limit)

---

#### GET /api/v1/auth/me
현재 인증된 사용자 정보 조회 (JWT 토큰 필요)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00",
    "lastLoginAt": "2025-01-10T12:00:00"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (토큰 없음, 만료, 또는 유효하지 않음)

---

#### POST /api/v1/auth/validate
JWT 토큰 유효성 검증

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK) - Valid Token:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "username": "testuser",
    "role": "USER",
    "message": "Token is valid"
  }
}
```

**Response (200 OK) - Invalid Token:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "message": "Invalid token"
  }
}
```

---

### Monitoring (모니터링)

#### GET /actuator/health
애플리케이션 헬스체크

**Response (200 OK):**
```json
{
  "status": "UP"
}
```

---

## 🧪 테스트 실행

### 전체 테스트 실행
```bash
./gradlew test
```

### 특정 테스트 클래스 실행
```bash
./gradlew test --tests AuthServiceTest
./gradlew test --tests JwtTokenProviderTest
```

### 통합 테스트 실행
```bash
./gradlew test --tests '*IntegrationTest'
```

### 테스트 커버리지 확인
```bash
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

---

## 🗄️ 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
```

### login_attempts 테이블
```sql
CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    attempt_time TIMESTAMP NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 초기 테스트 계정
| Username | Password | Role | Email |
|----------|----------|------|-------|
| testuser | password123 | USER | test@example.com |
| admin | admin123 | ADMIN | admin@example.com |

---

## 🔧 환경 변수 설정

### 개발 환경 (application-dev.yml)
```yaml
jwt:
  secret: devSecretKeyForJwtTokenGenerationMustBe256BitsOrLonger12345678
  expiration: 1800000  # 30 minutes in milliseconds

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/springrest
    username: postgres
    password: postgres
```

### 프로덕션 환경 설정
환경 변수를 통한 민감 정보 외부화 권장:
```bash
export JWT_SECRET=your-production-secret-key
export DB_PASSWORD=your-database-password
```

---

## 🔐 보안 고려사항

### JWT Secret
- **개발**: 기본 secret 사용
- **프로덕션**: 환경 변수로 256비트 이상의 강력한 secret 설정 필수

### 비밀번호 정책
- BCrypt 해싱 (strength: 10)
- 최소 8자 이상 (Jakarta Validation)

### Rate Limiting
- 5분간 5회 실패 시 차단
- 메모리 캐시 (ConcurrentHashMap) + DB 이력

### CORS & 헤더 보안
- 프로덕션 환경에서 CORS 정책 설정 권장
- Security Headers (X-Frame-Options, X-Content-Type-Options 등) 적용

---

## 📊 로깅

### MDC (Mapped Diagnostic Context)
모든 요청에 고유한 `requestId`가 자동 할당되어 로그 추적이 용이합니다.

### 로그 레벨
- **개발**: DEBUG
- **프로덕션**: INFO

### 로그 예시
```
2025-01-10 12:00:00.123 [http-nio-8080-exec-1] INFO  [requestId=abc-123] c.e.s.c.AuthController - Login attempt for user: testuser
2025-01-10 12:00:00.456 [http-nio-8080-exec-1] INFO  [requestId=abc-123] c.e.s.s.AuthService - User testuser logged in successfully
```

---

## 🐛 문제 해결

### PostgreSQL 연결 실패
- PostgreSQL 서비스가 실행 중인지 확인
- `application-dev.yml`의 접속 정보(URL, Username, Password) 확인

### JWT 토큰 검증 실패
- Secret 키가 256비트 이상인지 확인
- 토큰 만료 시간 확인 (30분)
- Authorization 헤더 형식: `Bearer <token>`

### Rate Limiting 테스트
```bash
# 5회 연속 잘못된 비밀번호로 로그인 시도
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"wrong"}'
done

# 6번째 시도에서 429 응답 확인
```

---

## 📝 다음 단계

- [ ] **T014**: TestContainers 통합 테스트 완성
- [ ] **T041**: 토큰 만료 통합 테스트
- [ ] **T063**: AuthController User Story 3 통합 테스트
- [ ] **T069**: 환경 변수 외부화
- [ ] **T070**: 코드 리팩토링
- [ ] **T073**: CORS 및 보안 강화
- [ ] **T075**: CI/CD 파이프라인 구축

---

## 📄 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

---

## 👥 기여

문제 발견 시 Issue를 생성하거나 Pull Request를 보내주세요.
