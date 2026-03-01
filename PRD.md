# Product Requirements Document (PRD)

## 1. 프로젝트 개요 및 목표 (Project Background & Objectives)
- **프로젝트 명**: st-prj (Spring REST & Next.js Admin Portal)
- **개요**: JWT 기반의 안전한 로그인 시스템을 제공하는 백엔드 API 서버와, 최신 React 생태계(Next.js App Router, Tailwind CSS V4, React Query, Zustand 등)로 구현된 어드민 포털 웹 애플리케이션 개발 프로젝트입니다.
- **목표**: 
  - 권한에 따른 메뉴 접근 제어 및 체계적인 시스템(사용자/역할) 관리
  - 주문 상태 추적 및 관리 비즈니스 로직 제공
  - 게시판 형태의 데이터 관리 체계 구축
  - 확장성과 유지보수성이 뛰어난 모던 시스템 아키텍처(Next.js + Spring Boot) 구성

## 2. 핵심 사용자 및 유즈케이스 (Target Audience & Use Cases)
- **시스템 관리자 (Admin)**
  - 시스템에 접속하여 사용자 계정과 역할(Role)을 관리합니다.
  - 메뉴 체계를 구성(계층형)하고 역할별 메뉴 접근 권한을 맵핑합니다.
  - 전체 고객의 주문 내역을 조회하고 주문 상태를 변경(ORDERED, PAID, SHIPPED, COMPLETED, CANCELLED)합니다.
  - 게시판 마스터 권한으로 전사적 게시판 속성 및 게시물을 관리합니다.
- **일반 사용자 (User)**
  - 부여된 계정(혹은 가입)과 JWT 기반 로그인을 통해 시스템에 접속합니다.
  - 본인의 권한이 허용된 메뉴에 접근하여 서비스를 이용하고 데이터를 조회합니다.
  - 상품/서비스 주문을 생성하고 변경 로그를 포함한 자신의 주문 내역을 확인합니다.
- **게스트 (Guest)**
  - 로그인 전에 접근 가능한 공개 페이지(로그인 화면 등)를 탐색합니다.

## 3. 주요 기능 요구사항 (Functional Requirements)
### 3.1. 인증 및 인가 (Authentication & Authorization)
- ID/Password 기반 로그인 시스템 (Rate Limiting 적용: 5분 내 5회 실패 시 접속 차단)
- JWT (JSON Web Token) 액세스 토큰 발급 및 검증 (만료 기한 30분, 향후 Refresh Token 확장성 고려)
- 접근 권한(`USER`, `ADMIN` 등)에 기반하여 동적으로 API 엔드포인트 접근 제어 
- 프론트엔드는 NextAuth를 활용한 세션 정보 유지 및 `(guest)`와 `(admin)` 라우팅 분기 처리

### 3.2. 시스템 관리 로직 (System Management)
- **사용자 관리 (User Management)**: 사용자 정보 조회, 계정 상태변경, 비밀번호 초기화 (`CHMM_USER_INFO`)
- **권한 및 역할 관리 (Role Management)**
  - 직무에 따른 역할 생성 및 사용자-역할 매핑 (`CHMM_ROLE_INFO`, `CHMM_USER_ROLE_MAP`)
- **메뉴 관리 (Menu Management)**
  - 뎁스(Tree)를 가진 메뉴 마스터 데이터 관리, 역할별 접근 가능한 메뉴 연결 (`CHMM_MENU_INFO`, `CHMM_ROLE_MENU_MAP`)

### 3.3. 비즈니스 도메인 기능 (Business Domain)
- **주문 관리 (Order Management)**
  - 고객, 주문 명세, 금액으로 구성된 기본 주문 생성 및 관리 (`tb_orders`)
  - 주문 상태(Status) 변이 추적 관리
- **게시판 기능 (Board Management)**
  - 마스터 게시판 프로비저닝 및 개별 게시글의 CRUD 지원

## 4. 비기능 요구사항 (Non-Functional Requirements)
- **보안성(Security)**: 환경변수로 분리된 JWT Secret 키 관리, `BCrypt` (Strength: 10) 암호화 알고리즘 적용, CORS 정책 제어.
- **관측성(Observability)**: Mapped Diagnostic Context (MDC)를 통한 통합 요청 추적(고유 `requestId` 발급), Spring Boot Actuator로 인프라 헬스체크 지원.
- **버전 호환성(Versioning)**: URI Path 기준의 엄격한 버전 컨트롤(`/api/v1/`), 하위 호환성을 보장하지 못하는 파괴적 변경 발생 시 `v2` 릴리즈 체계 활용.
- **사용자 경험(UX/Performance)**: 프론트엔드는 `TanStack React Query`를 통해 서버 데이터를 캐싱하고, `Zustand`로 전역 상태를 효과적으로 관리함. 성능 저하를 방지하기 위해 `so-grid-react` 등의 고성능 데이터 그리드 컴포넌트 활용.

## 5. 기술 스택 및 아키텍처 (Tech Stack & Architecture)
### Backend Stack
- **Framework & Language**: Java 21 (LTS), Spring Boot 3.4.1, Gradle 8.11.1
- **Security**: Spring Security, JWT (jjwt 0.12.6), BCrypt
- **Database & Persistence**: PostgreSQL 15, MyBatis 3.0.3, Flyway (DB 마이그레이션 적용)
- **Testing**: JUnit 5, Mockito, TestContainers 사용을 통한 통합 테스트

### Frontend Stack
- **Framework & Language**: Next.js 16.1 (App Router), React 19, TypeScript
- **Styling UI**: Tailwind CSS v4, Radix UI 헤드리스 컴포넌트, `lucide-react`
- **State & Data Fetching**: Zustand, TanStack React Query v5, Axios
- **Form & Validation**: React Hook Form, Zod
- **Testing**: Vitest, Playwright (E2E 테스트 목적)
- **Authentication**: NextAuth 5 (beta)

### 아키텍처 개요
- **분리형 구조**: 프론트엔드 리포지토리와 백엔드 API 서버를 논리적, 물리적으로 분리하여 스케일링 유연성을 확보한 구조.
- **Database Schema Management**: 백엔드의 `Flyway` 마이그레이션 스크립트를 통해 스키마 무결성과 데이터 정합성을 버전 관리에 따라 안전하게 보장.
- **UI Architecture**: 서버/클라이언트 컴포넌트를 적절하게 혼용한 Next.js 최신 렌더링 매커니즘 준수.
