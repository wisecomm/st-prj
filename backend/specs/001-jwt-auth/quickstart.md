# Quickstart Guide - JWT 인증 기능

## 개요

이 가이드는 JWT 인증 기능을 로컬 개발 환경에서 빠르게 실행하고 테스트하는 방법을 설명합니다.

**소요 시간**: 약 10분

---

## 사전 요구사항

### 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 설치 확인 명령어 |
|-----------|----------|-----------------|
| JDK | 21 | `java -version` |
| Gradle | 8.x | `gradle --version` |
| Docker | 20.x | `docker --version` |
| Docker Compose | 2.x | `docker-compose --version` |

### 권장 도구 (선택사항)

- **Postman** 또는 **curl**: API 테스트용
- **IntelliJ IDEA** 또는 **VS Code**: 코드 편집기

---

## 1. 프로젝트 클론

```bash
# 저장소 클론 (실제 URL로 변경)
git clone https://github.com/example/spring-rest-api.git
cd spring-rest-api

# JWT 인증 기능 브랜치로 이동
git checkout 001-jwt-auth
```

---

## 2. 데이터베이스 실행 (Docker Compose)

### PostgreSQL 컨테이너 시작

```bash
# docker-compose.yml이 있는 디렉토리에서 실행
docker-compose up -d

# 컨테이너 상태 확인
docker-compose ps
```

**예상 출력**:
```text
NAME                SERVICE    STATUS      PORTS
postgres-db         postgres   running     0.0.0.0:5432->5432/tcp
```

### 데이터베이스 연결 확인

```bash
# PostgreSQL 컨테이너 접속
docker exec -it postgres-db psql -U postgres -d springrest

# SQL 테스트
springrest=# SELECT COUNT(*) FROM users;
 count 
-------
     2
(1 row)

# 종료
springrest=# \q
```

### docker-compose.yml 예시

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres-db
    environment:
      POSTGRES_DB: springrest
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./src/main/resources/db/migration:/docker-entrypoint-initdb.d
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 3. 애플리케이션 설정

### application-dev.yml 확인

`src/main/resources/application-dev.yml` 파일에서 다음 설정을 확인하세요:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/springrest
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  profiles:
    active: dev

jwt:
  secret: devSecretKeyForTestingPurposesOnlyMustBe256BitsOrMore
  expiration: 1800000  # 30분 (밀리초)

logging:
  level:
    com.example.springrest: DEBUG
    org.springframework.security: DEBUG

springdoc:
  api-docs:
    enabled: true
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
```

---

## 4. 애플리케이션 빌드 및 실행

### Gradle 빌드

```bash
# 의존성 다운로드 및 빌드
./gradlew clean build

# 테스트 제외 빌드 (빠른 실행)
./gradlew clean build -x test
```

### Spring Boot 애플리케이션 실행

```bash
# 개발 모드로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**예상 출력**:
```text
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.4.1)

2025-01-10 10:00:00.000  INFO 12345 --- [main] c.e.s.Application : Starting Application...
2025-01-10 10:00:05.000  INFO 12345 --- [main] o.s.b.w.e.tomcat.TomcatWebServer : Tomcat started on port(s): 8080 (http)
2025-01-10 10:00:05.100  INFO 12345 --- [main] c.e.s.Application : Application started successfully!
```

### 헬스 체크

```bash
curl http://localhost:8080/actuator/health
```

**응답**:
```json
{
  "status": "UP"
}
```

---

## 5. API 테스트

### 5.1. Swagger UI로 테스트 (권장)

브라우저에서 다음 URL을 엽니다:

```text
http://localhost:8080/swagger-ui.html
```

Swagger UI에서 다음 순서로 테스트:
1. **POST /api/v1/auth/login** 실행 → JWT 토큰 복사
2. **Authorize 버튼** 클릭 → 토큰 입력 (`Bearer <token>` 형식)
3. **GET /api/v1/auth/me** 실행 → 사용자 정보 확인

---

### 5.2. curl로 테스트

#### 로그인 (토큰 발급)

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**응답 예시**:
```json
{
  "code": "200",
  "message": "SUCCESS",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzA0ODc2MDAwLCJleHAiOjE3MDQ4Nzc4MDB9.signature",
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

#### 현재 사용자 정보 조회

```bash
# 위에서 받은 토큰을 JWT_TOKEN 환경변수에 저장
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**응답 예시**:
```json
{
  "code": "200",
  "message": "SUCCESS",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

#### 토큰 검증

```bash
curl -X POST http://localhost:8080/api/v1/auth/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$JWT_TOKEN\"
  }"
```

**응답 예시** (유효한 토큰):
```json
{
  "code": "200",
  "message": "SUCCESS",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

---

### 5.3. Postman Collection

**Postman Collection 가져오기**:
1. Postman 실행
2. File → Import → Link 탭
3. 입력: `http://localhost:8080/v3/api-docs`
4. Import 클릭

**테스트 시나리오**:
1. **로그인 요청** → 응답에서 `data.token` 복사
2. **Collection 설정** → Authorization 탭 → Type: Bearer Token → Token 입력
3. **사용자 정보 조회** 실행

---

## 6. 테스트 계정

| 사용자명 | 비밀번호 | 역할 | 용도 |
|---------|---------|------|------|
| testuser | password123 | USER | 일반 사용자 테스트 |
| admin | admin123 | ADMIN | 관리자 권한 테스트 |

---

## 7. 자동화 테스트 실행

### 단위 테스트 + 통합 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스만 실행
./gradlew test --tests AuthControllerTest

# 테스트 결과 확인
open build/reports/tests/test/index.html
```

### TestContainers 기반 통합 테스트

```bash
# TestContainers는 자동으로 PostgreSQL 컨테이너를 시작합니다
./gradlew test --tests AuthServiceIntegrationTest
```

**테스트 범위**:
- ✅ 로그인 API (성공/실패/Rate limiting)
- ✅ JWT 토큰 생성/파싱/만료
- ✅ 사용자 정보 조회 (인증 필요)
- ✅ MyBatis 매퍼 쿼리 (TestContainers PostgreSQL)

---

## 8. 로그 확인

### 애플리케이션 로그

```bash
# 콘솔 로그 (실시간)
./gradlew bootRun --args='--spring.profiles.active=dev'

# 로그 파일 (설정된 경우)
tail -f logs/application.log
```

### 로그 패턴 예시

```text
2025-01-10 10:05:00.123 [http-nio-8080-exec-1] INFO  [a1b2c3d4-e5f6-7890] c.e.s.controller.AuthController - Login attempt for user: testuser
2025-01-10 10:05:00.456 [http-nio-8080-exec-1] DEBUG [a1b2c3d4-e5f6-7890] c.e.s.security.JwtTokenProvider - Generating JWT token for user: testuser
2025-01-10 10:05:00.789 [http-nio-8080-exec-1] INFO  [a1b2c3d4-e5f6-7890] c.e.s.controller.AuthController - Login successful for user: testuser
```

**주요 항목**:
- `[a1b2c3d4-e5f6-7890]`: MDC requestId (요청 추적)
- `Login attempt for user`: 로그인 시도 로그
- `Login successful`: 로그인 성공 로그

---

## 9. 문제 해결 (Troubleshooting)

### 문제 1: PostgreSQL 연결 실패

**증상**:
```text
Caused by: org.postgresql.util.PSQLException: Connection refused
```

**해결**:
```bash
# Docker Compose 재시작
docker-compose down
docker-compose up -d

# PostgreSQL 로그 확인
docker logs postgres-db
```

---

### 문제 2: JWT 토큰 파싱 오류

**증상**:
```json
{
  "code": "401",
  "message": "INVALID_TOKEN"
}
```

**해결**:
1. `application-dev.yml`의 `jwt.secret` 길이 확인 (256-bit 이상)
2. Authorization 헤더 형식 확인: `Bearer <token>`

---

### 문제 3: Swagger UI 접근 불가

**증상**: `http://localhost:8080/swagger-ui.html` → 404 에러

**해결**:
1. `application-dev.yml`에서 `springdoc.swagger-ui.enabled=true` 확인
2. Profile이 `dev`로 설정되었는지 확인:
   ```bash
   ./gradlew bootRun --args='--spring.profiles.active=dev'
   ```

---

### 문제 4: Rate limiting 테스트

**테스트 시나리오**:
```bash
# 5회 연속 로그인 실패
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"wrongpassword"}';
  echo "";
done

# 6번째 시도 → 429 에러 예상
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**예상 응답** (6번째 시도):
```json
{
  "code": "429",
  "message": "TOO_MANY_FAILED_ATTEMPTS",
  "data": null
}
```

---

## 10. 환경 초기화

### 데이터베이스 초기화

```bash
# PostgreSQL 컨테이너 재시작 (데이터 유지)
docker-compose restart postgres

# 완전 초기화 (데이터 삭제)
docker-compose down -v
docker-compose up -d
```

### 빌드 캐시 삭제

```bash
./gradlew clean
rm -rf build/
```

---

## 11. 다음 단계

✅ JWT 인증 기능이 정상 작동합니다!

**추가 개발 방향**:
1. **Refresh Token 구현**: 토큰 갱신 기능 추가
2. **소셜 로그인 연동**: OAuth2 (Google, Kakao 등)
3. **이메일 인증**: 회원가입 시 이메일 인증
4. **2FA (Two-Factor Authentication)**: OTP 기반 2단계 인증

**운영 배포 준비**:
- `application-prod.yml`에서 `jwt.secret`를 환경 변수로 분리 (`${JWT_SECRET}`)
- HTTPS 적용 (Let's Encrypt, AWS ALB 등)
- Actuator 엔드포인트 보안 설정
- Swagger UI 비활성화 확인

---

## 12. 참고 자료

- [Spring Security 6 공식 문서](https://docs.spring.io/spring-security/reference/6.0/index.html)
- [jjwt GitHub Repository](https://github.com/jwtk/jjwt)
- [MyBatis 3 공식 문서](https://mybatis.org/mybatis-3/)
- [SpringDoc OpenAPI](https://springdoc.org/)
- [TestContainers 공식 문서](https://www.testcontainers.org/)

---

## 지원

문제가 발생하면 다음을 통해 문의하세요:
- **이메일**: support@example.com
- **GitHub Issues**: https://github.com/example/spring-rest-api/issues
- **Slack**: #spring-rest-api 채널
