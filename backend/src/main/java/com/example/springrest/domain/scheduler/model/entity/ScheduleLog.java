package com.example.springrest.domain.scheduler.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 동적 스케줄러 실행 로그 엔티티 (SA_SYNC_SCHEDULE_LOG)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleLog {
    private Long uid; // 일련번호
    private String corpCode; // 회사코드
    private String beanName; // 스케줄 빈
    private String method; // S:스케줄실행, D:직접실행
    private String result; // S:성공, F:실패, I:진행중
    private String message; // 성공 또는 실패 메시지
    private LocalDateTime startTime; // 작업 시작시간
    private LocalDateTime endTime; // 작업 종료시간
    private String worker; // 작업자
}
