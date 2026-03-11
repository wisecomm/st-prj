package com.example.springrest.domain.scheduler.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 동적 스케줄러 엔티티 (SA_SYNC_SCHEDULE)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    private Long uid; // 일련번호
    private String beanName; // 스케줄 빈
    private String beanParam; // 스케줄 파라메터 (JSON)
    private Boolean used; // 사용여부 (1: true, 0: false)
    private Boolean dupStop; // 중복 실행 방지여부 (1: true, 0: false)
    private String cron; // 스케줄 (Cron expression)
    private String comment; // 스케줄 설명
    private LocalDateTime createTime; // 생성시간
    private String creator; // 생성자
    private LocalDateTime updateTime; // 수정시간
    private String updater; // 수정자
}
