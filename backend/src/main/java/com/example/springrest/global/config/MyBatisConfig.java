package com.example.springrest.global.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.example.springrest.domain.**.mapper")
public class MyBatisConfig {
}
