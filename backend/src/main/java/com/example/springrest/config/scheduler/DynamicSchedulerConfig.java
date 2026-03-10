package com.example.springrest.config.scheduler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * 전역 동적 스케줄링 설정 클래스
 */
@Configuration
@EnableScheduling
public class DynamicSchedulerConfig {

    @Bean
    public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        // 동시 실행 가능한 스케줄러 쓰레드 수 구성 (필요시 프로퍼티로 이관 가능)
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("dynamic-scheduler-");
        // Spring Context가 종료될 때 대기 중인 작업을 정상 종료하도록 설정
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(20);
        return scheduler;
    }
}
