package com.example.springrest.global.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis 설정
 * 매퍼 인터페이스 스캔 및 SqlSessionFactory 구성
 */
@Configuration
@MapperScan("com.example.springrest.domain.**.repository")
public class MyBatisConfig {
    // MapperScan 애노테이션으로 자동 설정됨
    // Spring Boot Auto-configuration이 나머지 설정을 처리함
}
