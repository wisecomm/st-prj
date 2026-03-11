package com.example.springrest.domain.scheduler.model.dto;

import com.example.springrest.domain.scheduler.model.entity.ScheduleLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ScheduleLogResponse {
    private Long uid;
    private String corpCode;
    private String beanName;
    private String method; // S:스케줄실행, D:직접실행
    private String result; // S:성공, F:실패, I:진행중
    private String message;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String worker;

    public static ScheduleLogResponse fromEntity(ScheduleLog entity) {
        return ScheduleLogResponse.builder()
                .uid(entity.getUid())
                .corpCode(entity.getCorpCode())
                .beanName(entity.getBeanName())
                .method(entity.getMethod())
                .result(entity.getResult())
                .message(entity.getMessage())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .worker(entity.getWorker())
                .build();
    }
}
