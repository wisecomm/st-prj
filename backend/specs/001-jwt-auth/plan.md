# Implementation Plan: JWT 기반 사용자 인증

**Branch**: `001-jwt-auth` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-jwt-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

JWT(JSON Web Token) 기반 사용자 인증 시스템 구현. 사용자는 아이디/비밀번호로 로그인하여 30분 유효한 JWT 토큰을 발급받고, 이 토큰으로 보호된 API에 접근할 수 있다. Rate limiting(5회/5분), USER/ADMIN 권한 관리, 표준 JSON 응답 형식(`{"code", "message", "data"}`)을 지원하며, Swagger 문서화는 개발 환경에서만 제공한다. 소규모 시스템(1,000명 이하)을 대상으로 하며, Spring Security + JWT 라이브러리를 활용한 계층형 아키텍처로 구현한다.

## Technical Context

<!--
  이 프로젝트의 기술 스택은 헌장(.specify/memory/constitution.md)에 정의되어 있습니다.
  아래 항목 중 변경이 필요한 경우 헌장과 일치하는지 확인하세요.
-->

**Language/Version**: Java 21 (LTS)
**Framework**: Spring Boot 3.4.1 (Spring Web, Spring Boot Actuator, Spring Security)
**Build Tool**: Gradle 8.x
**Primary Dependencies**: 
- Spring Security 6.x (인증/인가)
- jjwt 0.12.x (JWT 토큰 생성/검증)
- MyBatis 3.x (데이터 접근)
- Lombok (보일러플레이트 제거)
- SpringDoc OpenAPI 2.x (Swagger 문서화)
**Storage**: PostgreSQL 15.x 이상
**Logging**: Log4j2 (비동기 Appender, MDC 추적)
**Testing**: JUnit 5, Mockito, Spring Boot Test, TestContainers (PostgreSQL)
**Target Platform**: Linux 서버 / Docker 컨테이너
**Project Type**: web (backend REST API)
**Performance Goals**: 
- 단일 로그인 요청: 3초 이내 응답
- 동시 100명 처리: 5초 이내(p95) 응답
**Constraints**: 
- Stateless 아키텍처 (JWT 기반, 세션 미사용)
- 소규모 시스템 (1,000명 이하)
- 단일 DB 인스턴스로 처리 가능
**Scale/Scope**: 
- 예상 사용자: 1,000명 이하
- API 엔드포인트: 3개 (로그인, 토큰 검증, 사용자 정보 조회)
- DB 테이블: 2개 (users, login_attempts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

다음 헌장 원칙 준수를 확인하세요 (`.specify/memory/constitution.md` 참조):

- [x] **I. API 우선 설계**: ✅ 3개의 RESTful API 엔드포인트 설계됨 (POST /api/v1/auth/login, GET /api/v1/auth/me, POST /api/v1/auth/validate). Swagger로 문서화 예정.
- [x] **II. 계층형 아키텍처**: ✅ AuthController → AuthService → UserMapper 계층 분리. JWT 유틸리티는 별도 util 패키지로 분리.
- [x] **III. 테스트 우선 개발**: ✅ 통합 테스트 시나리오가 spec.md에 정의됨. TDD 프로세스 준수 예정.
- [x] **IV. 통합 테스트**: ✅ 로그인 API, 토큰 검증, Rate limiting에 대한 통합 테스트 계획 포함.
- [x] **V. 관찰 가능성**: ✅ Log4j2 MDC를 통한 요청 ID 추적, 인증 이벤트(성공/실패/차단) 로깅, @ControllerAdvice 전역 예외 처리.
- [x] **VI. API 버전 관리**: ✅ URI 버저닝 사용 (/api/v1). 최초 버전이므로 Breaking Change 없음.
- [x] **VII. 단순성**: ✅ Stateless JWT 방식으로 세션 관리 복잡성 제거. refresh token 제외하여 초기 구현 단순화.

**위반 사항**: 없음

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  JWT 인증 기능을 위한 Spring Boot 프로젝트 구조입니다.
  패키지명은 실제 프로젝트에 맞게 조정하세요.
-->

```text
src/main/java/com/example/springrest/
├── controller/          # REST API 엔드포인트 (@RestController)
│   └── AuthController.java       # JWT 로그인/검증 API
├── service/             # 비즈니스 로직 (@Service)
│   └── AuthService.java          # 인증 로직 (로그인, 토큰 검증)
├── repository/          # 데이터 접근 계층 (MyBatis 매퍼)
│   ├── UserMapper.java           # 사용자 조회 인터페이스
│   └── LoginAttemptMapper.java   # Rate limiting 데이터 접근
├── model/               # 도메인 모델 및 DTO
│   ├── entity/          # DB 엔티티
│   │   ├── User.java             # 사용자 엔티티 (id, username, password, email, role)
│   │   └── LoginAttempt.java     # 로그인 시도 기록 (rate limiting용)
│   ├── dto/             # 요청/응답 객체
│   │   ├── LoginRequest.java     # 로그인 요청 DTO
│   │   ├── LoginResponse.java    # 로그인 응답 DTO (토큰 포함)
│   │   ├── TokenValidationRequest.java  # 토큰 검증 요청
│   │   ├── UserInfo.java # 사용자 정보 엔티티
│   │   └── ApiResponse.java      # 표준 응답 포맷 {"code", "message", "data"}
│   └── enums/           # 열거형
│       └── UserRole.java         # USER, ADMIN 역할
├── config/              # 설정 클래스 (@Configuration)
│   ├── SecurityConfig.java       # Spring Security + JWT 필터 설정
│   ├── SwaggerConfig.java        # Swagger 개발 모드 전용 설정
│   ├── MyBatisConfig.java        # MyBatis 설정
│   └── Log4j2Config.java         # Log4j2 MDC 설정
├── security/            # JWT 및 보안 관련
│   ├── JwtTokenProvider.java     # JWT 생성/검증 유틸리티 (HS256, 30분 만료)
│   ├── JwtAuthenticationFilter.java  # JWT 필터
│   └── CustomUserDetails.java    # Spring Security UserDetails 구현
├── exception/           # 예외 및 에러 핸들러
│   ├── GlobalExceptionHandler.java  # @ControllerAdvice 전역 예외 처리
│   ├── AuthenticationException.java # 인증 실패 예외
│   ├── TokenExpiredException.java   # 토큰 만료 예외
│   └── RateLimitException.java      # Rate limit 초과 예외
└── Application.java     # Spring Boot 메인 클래스

src/main/resources/
├── application.yml      # 기본 설정 (JWT secret, 만료 시간 30분)
├── application-dev.yml  # 개발 환경 (Swagger 활성화, H2/PostgreSQL)
├── application-prod.yml # 운영 환경 (Swagger 비활성화, PostgreSQL)
├── log4j2.xml           # Log4j2 비동기 로깅, MDC requestId 추적
└── mapper/              # MyBatis XML 매퍼
    ├── UserMapper.xml           # 사용자 조회 쿼리 (username으로 검색)
    └── LoginAttemptMapper.xml   # 로그인 시도 기록 CRUD

src/test/java/com/example/springrest/
├── controller/          # Controller 통합 테스트
│   └── AuthControllerTest.java   # JWT 로그인, 검증 API 테스트
├── service/             # Service 단위 테스트
│   └── AuthServiceTest.java      # 인증 로직 단위 테스트 (Mockito)
├── security/            # JWT 유틸리티 테스트
│   └── JwtTokenProviderTest.java # 토큰 생성/파싱/만료 테스트
└── repository/          # Repository 통합 테스트 (TestContainers)
    ├── UserMapperTest.java       # PostgreSQL TestContainer로 쿼리 테스트
    └── LoginAttemptMapperTest.java

build.gradle             # Gradle 빌드 설정 (Spring Security, jjwt, MyBatis, Lombok)
Dockerfile               # Docker 이미지 빌드 (JDK 21 base)
docker-compose.yml       # 로컬 개발 환경 (PostgreSQL 15, 초기 스키마/데이터)
```

**구조 결정 사항**: Spring Boot REST API 단일 프로젝트, 계층형 아키텍처 사용

## Complexity Tracking

> **Constitution Check에서 위반 사항이 있을 경우에만 작성**

**위반 사항 없음** - 이 섹션은 비워둡니다.
