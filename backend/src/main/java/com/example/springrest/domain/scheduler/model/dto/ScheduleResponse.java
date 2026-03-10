package com.example.springrest.domain.scheduler.model.dto;

import com.example.springrest.domain.scheduler.model.entity.Schedule;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ScheduleResponse {
    private Long uid;
    private String beanName;
    private String beanParam;
    private Boolean used;
    private Boolean stop;
    private String cron;
    private String comment;
    private LocalDateTime createTime;
    private String creator;
    private LocalDateTime updateTime;
    private String updater;

    public static ScheduleResponse fromEntity(Schedule entity) {
        ScheduleResponse response = new ScheduleResponse();
        response.setUid(entity.getUid());
        response.setBeanName(entity.getBeanName());
        response.setBeanParam(entity.getBeanParam());
        response.setUsed(entity.getUsed());
        response.setStop(entity.getStop());
        response.setCron(entity.getCron());
        response.setComment(entity.getComment());
        response.setCreateTime(entity.getCreateTime());
        response.setCreator(entity.getCreator());
        response.setUpdateTime(entity.getUpdateTime());
        response.setUpdater(entity.getUpdater());
        return response;
    }
}
