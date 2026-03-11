package com.example.springrest.domain.scheduler.repository;

import com.example.springrest.domain.scheduler.model.entity.ScheduleLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 동적 스케줄러 실행 로그 (SA_SYNC_SCHEDULE_LOG) MyBatis Mapper
 */
@Mapper
public interface ScheduleLogMapper {

    /**
     * 스케줄 로그 등록 (시작 시)
     */
    int insertLog(ScheduleLog scheduleLog);

    /**
     * 스케줄 로그 수정 (종료 시)
     */
    int updateLog(ScheduleLog scheduleLog);

    /**
     * 전체 스케줄 로그 목록 조회
     */
    List<ScheduleLog> findAllLogs();
}
