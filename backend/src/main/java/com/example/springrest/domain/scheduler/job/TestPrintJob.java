package com.example.springrest.domain.scheduler.job;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 동적 스케줄러 테스트용 Bean
 */
@Slf4j
@Component("testPrintJob")
public class TestPrintJob {

    /**
     * ScheduleService 의 리플렉션 로직이 "execute" 메서드를 찾아 실행합니다.
     * beanParam (JSON 문자열 등)을 인자로 받습니다.
     */
    public void execute(String beanParam) {
        log.info("==========================================");
        log.info(">>> TestPrintJob 실행 시작 <<<");
        log.info(">>> Received Parameter: {}", beanParam);
        log.info(">>> TestPrintJob 실행 완료 <<<");
        log.info("==========================================");
    }
}
