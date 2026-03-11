package com.example.springrest.domain.scheduler.model.dto;

import com.example.springrest.domain.scheduler.model.entity.Schedule;
import lombok.Data;

@Data
public class ScheduleRequest {
    private String beanName;
    private String beanParam;
    private Boolean used;
    private Boolean dupStop;
    private String cron;
    private String comment;
    private String creator;
    private String updater;

    public Schedule toEntity() {
        return Schedule.builder()
                .beanName(this.beanName)
                .beanParam(this.beanParam)
                .used(this.used)
                .dupStop(this.dupStop)
                .cron(this.cron)
                .comment(this.comment)
                .creator(this.creator)
                .updater(this.updater)
                .build();
    }
}
