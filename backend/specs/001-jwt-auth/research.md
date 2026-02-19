# Phase 0: Research - JWT 인증 기능

## 연구 목적

JWT 기반 인증 시스템 구현을 위한 기술적 결정사항을 조사하고, 불확실한 부분을 해결합니다.

---

## 1. Spring Security + JWT 통합 패턴

### 결정사항
- **Spring Security 6.x + jjwt 0.12.x** 조합 사용
- **HS256 알고리즘** (대칭키 방식)으로 JWT 서명
- **JwtAuthenticationFilter**를 Spring Security 필터 체인에 통합하여 모든 요청에서 JWT 검증

### 근거
- Spring Security 6.x는 Spring Boot 3.4.1과 완벽 호환
- jjwt 0.12.x는 Java 8+ 지원, 강력한 타입 안전성 제공
- HS256은 단일 서버 환경에서 성능이 우수하고 구현이 단순함 (현재 규모 1,000 유저에 적합)
- 필터 체인 통합으로 인증/인가를 중앙 집중식으로 관리

### 고려한 대안
- **RS256 (비대칭키 방식)**: 마이크로서비스 환경에서 유리하나, 단일 서버에서는 과도한 복잡성
- **OAuth2/OIDC**: 외부 IdP 통합 시 유리하나, 자체 인증 시스템에서는 불필요한 오버헤드
- **Session 기반 인증**: Stateful 방식으로 헌법 원칙(단순성) 위반

### 구현 패턴
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/**").authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

**참고 자료**:
- [Spring Security 6 공식 문서](https://docs.spring.io/spring-security/reference/6.0/index.html)
- [jjwt GitHub Repository](https://github.com/jwtk/jjwt)

---

## 2. Rate Limiting 구현 전략

### 결정사항
- **In-Memory 방식** (ConcurrentHashMap + Scheduled Cleanup)
- **5회 실패 시 5분 차단** 정책
- `LoginAttemptMapper`로 실패 이력을 PostgreSQL에 영구 저장 (감사 로그용)

### 근거
- 1,000 유저 규모에서 Redis 도입은 과도한 인프라 복잡성 증가
- ConcurrentHashMap은 동시성 안전하며, 100 동시 사용자 수준에서 충분한 성능
- DB 저장으로 감사 추적 가능성 확보 (헌법 V. 관찰 가능성 준수)

### 고려한 대안
- **Redis 기반 Rate Limiting**: 분산 환경에서 유리하나, 현재 단일 서버 환경에서는 불필요
- **Bucket4j 라이브러리**: 고급 rate limiting 기능 제공하나, 단순 카운터 방식으로 충분
- **Nginx/API Gateway Rate Limiting**: 인프라 수준 제어는 향후 고려 (초기 구현 제외)

### 구현 패턴
```java
@Service
public class LoginAttemptService {
    private final Map<String, AttemptInfo> attemptsCache = new ConcurrentHashMap<>();
    
    public void loginFailed(String username) {
        AttemptInfo info = attemptsCache.computeIfAbsent(username, k -> new AttemptInfo());
        info.incrementAttempts();
        
        // DB에 실패 기록 저장 (감사 로그)
        loginAttemptMapper.insert(LoginAttempt.builder()
            .username(username)
            .attemptTime(LocalDateTime.now())
            .success(false)
            .build());
    }
    
    public boolean isBlocked(String username) {
        AttemptInfo info = attemptsCache.get(username);
        return info != null && info.getAttempts() >= 5 && 
               Duration.between(info.getLastAttempt(), LocalDateTime.now()).toMinutes() < 5;
    }
    
    @Scheduled(fixedRate = 300000) // 5분마다 정리
    public void cleanupExpiredAttempts() {
        attemptsCache.entrySet().removeIf(entry -> 
            Duration.between(entry.getValue().getLastAttempt(), LocalDateTime.now()).toMinutes() >= 5);
    }
}
```

**참고 자료**:
- [Baeldung - Login Attempts Limiting](https://www.baeldung.com/spring-security-block-brute-force-authentication-attempts)

---

## 3. 비밀번호 암호화 (BCrypt)

### 결정사항
- **BCryptPasswordEncoder** (strength = 10) 사용
- 사용자 등록/로그인 시 비밀번호 해싱 적용

### 근거
- BCrypt는 Spring Security 표준 암호화 방식
- Strength 10은 보안과 성능의 균형점 (약 0.1초 소요)
- Salt가 자동 생성되어 레인보우 테이블 공격 방어

### 고려한 대안
- **Argon2**: 최신 알고리즘이나 Spring Security 기본 지원 부족
- **PBKDF2**: BCrypt보다 느리고 추가 이점 없음

### 구현 패턴
```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}

// 사용 예시
@Service
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.findByUsername(request.getUsername());
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid credentials");
        }
        // JWT 생성...
    }
}
```

**참고 자료**:
- [Spring Security PasswordEncoder](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)

---

## 4. MyBatis 설정 (사용자 인증 쿼리)

### 결정사항
- **Interface + XML Mapper** 방식 사용
- `UserMapper.findByUsername(String username)` 메서드로 사용자 조회
- **결과가 없을 경우** null 반환 (Optional 사용 고려)

### 근거
- XML 매퍼는 복잡한 쿼리 관리에 유리 (향후 확장성)
- Interface 방식은 타입 안전성 제공
- 헌법 II. 계층형 아키텍처 준수 (Repository 계층 분리)

### 구현 패턴
```java
// Interface
@Mapper
public interface UserMapper {
    User findByUsername(@Param("username") String username);
    int countLoginAttempts(@Param("username") String username, 
                           @Param("sinceTime") LocalDateTime sinceTime);
}
```

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.springrest.repository.UserMapper">
    <select id="findByUsername" resultType="User">
        SELECT id, username, password, email, role
        FROM users
        WHERE username = #{username}
    </select>
</mapper>
```

**참고 자료**:
- [MyBatis 3 공식 문서](https://mybatis.org/mybatis-3/)
- [Spring Boot + MyBatis 통합 가이드](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)

---

## 5. JWT 설정 (만료 시간, Secret Key 관리)

### 결정사항
- **만료 시간**: 30분 (1800000 ms)
- **Secret Key**: `application.yml`에 256-bit 이상 키 설정
- **개발/운영 환경 분리**: application-dev.yml, application-prod.yml 사용

### 근거
- 30분은 사용자 편의성과 보안의 균형점 (사양서 요구사항)
- 256-bit 키는 HS256 알고리즘 최소 요구사항
- 환경별 설정 파일로 Secret Key 보안 강화 (운영: 환경 변수 사용)

### 구현 패턴
```yaml
# application-dev.yml
jwt:
  secret: devSecretKeyForTestingPurposesOnlyMustBe256BitsOrMore
  expiration: 1800000  # 30분 (밀리초)

# application-prod.yml
jwt:
  secret: ${JWT_SECRET}  # 환경 변수에서 주입
  expiration: 1800000
```

```java
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long expiration;
    // getters, setters
}

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;
    
    public JwtTokenProvider(JwtProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = properties.getExpiration();
    }
    
    public String generateToken(String username, UserRole role) {
        return Jwts.builder()
            .subject(username)
            .claim("role", role.name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }
}
```

**참고 자료**:
- [jjwt 권장 Secret Key 길이](https://github.com/jwtk/jjwt#signature-algorithms-keys)

---

## 6. Swagger 개발 모드 전용 설정

### 결정사항
- **SpringDoc OpenAPI 2.x** 사용
- **@Profile("dev")** 어노테이션으로 개발 모드에서만 활성화
- 운영 환경에서는 Swagger UI 접근 차단

### 근거
- SpringDoc은 Spring Boot 3.x 공식 지원
- Profile 기반 설정으로 운영 환경 노출 방지 (보안)
- 헌법 I. API 우선 설계 준수 (개발 중 API 문서화 지원)

### 구현 패턴
```java
@Configuration
@Profile("dev")
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Spring REST API")
                .version("1.0.0")
                .description("JWT 인증 기능 API 문서"));
    }
}
```

```yaml
# application-prod.yml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

**참고 자료**:
- [SpringDoc OpenAPI 공식 문서](https://springdoc.org/)

---

## 7. Log4j2 MDC 설정 (요청 ID 추적)

### 결정사항
- **MDC (Mapped Diagnostic Context)**로 `requestId` 추적
- 필터에서 UUID 기반 requestId 생성/제거
- 모든 로그에 `[requestId]` 자동 포함

### 근거
- MDC는 스레드별 컨텍스트 저장으로 동시 요청 추적 가능
- UUID는 전역 고유성 보장
- 헌법 V. 관찰 가능성 준수 (분산 추적 준비)

### 구현 패턴
```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
    private static final String REQUEST_ID = "requestId";
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            MDC.put(REQUEST_ID, UUID.randomUUID().toString());
            response.setHeader("X-Request-ID", MDC.get(REQUEST_ID));
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(REQUEST_ID);
        }
    }
}
```

```xml
<!-- log4j2.xml -->
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{ISO8601} [%t] %-5level [%X{requestId}] %logger{36} - %msg%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

**참고 자료**:
- [Log4j2 MDC 공식 문서](https://logging.apache.org/log4j/2.x/manual/thread-context.html)

---

## 8. 성능 요구사항 검증 방법

### 결정사항
- **JUnit 5 + Spring Boot Test** 통합 테스트로 성능 검증
- **TestContainers PostgreSQL**로 실제 DB 환경 시뮬레이션
- **ExecutorService**로 100 동시 요청 테스트
- **p95 응답 시간 5초 이하** 검증

### 근거
- TestContainers는 실제 DB 환경과 동일한 조건 제공
- ExecutorService는 동시성 테스트에 표준적 방법
- 헌법 III. 테스트 우선 개발 준수

### 구현 패턴
```java
@SpringBootTest
@Testcontainers
class AuthControllerPerformanceTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void loginPerformance_100ConcurrentUsers() throws InterruptedException {
        int threadCount = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Long> responseTimes = Collections.synchronizedList(new ArrayList<>());
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                long start = System.currentTimeMillis();
                // POST /api/v1/auth/login 호출
                long duration = System.currentTimeMillis() - start;
                responseTimes.add(duration);
            });
        }
        
        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        
        // p95 계산
        responseTimes.sort(Long::compareTo);
        long p95 = responseTimes.get((int) (responseTimes.size() * 0.95));
        assertThat(p95).isLessThan(5000); // 5초 이하
    }
}
```

**참고 자료**:
- [TestContainers 공식 문서](https://www.testcontainers.org/)

---

## 결론

모든 기술적 불확실성이 해결되었습니다. Phase 1 설계 단계로 진행 가능합니다.
