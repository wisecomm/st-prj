package com.example.springrest.domain.scheduler.repository;

import com.example.springrest.domain.scheduler.model.entity.Schedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

/**
 * 동적 스케줄러 (SA_SYNC_SCHEDULE) MyBatis Mapper
 */
@Mapper
public interface ScheduleMapper {

    /**
     * 전체 스케줄 목록 조회
     */
    List<Schedule> findAll();

    /**
     * 사용 중인(USED=1) 스케줄 목록 조회
     */
    List<Schedule> findActiveSchedules();

    /**
     * ID로 스케줄 단건 조회
     */
    Optional<Schedule> findById(@Param("uid") Long uid);

    /**
     * 스케줄 등록
     */
    int insert(Schedule schedule);

    /**
     * 스케줄 수정
     */
    int update(Schedule schedule);

    /**
     * 스케줄 삭제
     */
    int delete(@Param("uid") Long uid);
}
