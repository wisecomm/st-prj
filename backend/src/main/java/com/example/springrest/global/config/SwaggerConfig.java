package com.example.springrest.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Swagger/OpenAPI 설정
 * 개발 환경에서만 활성화
 */
@Configuration
@Profile({ "local", "dev" })
public class SwaggerConfig {

        private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .servers(java.util.Arrays.asList(
                                                new io.swagger.v3.oas.models.servers.Server()
                                                                .url("/")
                                                                .description("Default Server")))
                                .info(new Info()
                                                .title("Spring REST API")
                                                .version("v1.0.0")
                                                .description("JWT-based REST API with Spring Boot"))
                                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                                .components(new Components()
                                                .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                                                new SecurityScheme()
                                                                                .name(SECURITY_SCHEME_NAME)
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("JWT token for authentication")));
        }

        @Bean
        public GroupedOpenApi authApi() {
                return GroupedOpenApi.builder()
                                .group("01. 인증 (Auth)")
                                .pathsToMatch("/api/v1/auth/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi allApi() {
                return GroupedOpenApi.builder()
                                .group("02. 전체 API")
                                .pathsToMatch("/api/v1/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi userApi() {
                return GroupedOpenApi.builder()
                                .group("03. 사용자 관리 (User)")
                                .pathsToMatch("/api/v1/mgmt/users/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi menuApi() {
                return GroupedOpenApi.builder()
                                .group("04. 메뉴 관리 (Menu)")
                                .pathsToMatch("/api/v1/mgmt/menus/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi roleApi() {
                return GroupedOpenApi.builder()
                                .group("05. 권한 관리 (Role)")
                                .pathsToMatch("/api/v1/mgmt/roles/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi boardApi() {
                return GroupedOpenApi.builder()
                                .group("06. 게시판 관리 (Board)")
                                .pathsToMatch("/api/v1/mgmt/boards/**")
                                .build();
        }
}
