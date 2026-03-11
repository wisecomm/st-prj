package com.example.springrest.domain.scheduler.controller;

import com.example.springrest.domain.scheduler.model.dto.ScheduleLogResponse;
import com.example.springrest.domain.scheduler.model.dto.ScheduleRequest;
import com.example.springrest.domain.scheduler.model.dto.ScheduleResponse;
import com.example.springrest.domain.scheduler.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.springrest.global.model.dto.ApiResponse;

import java.util.List;

/**
 * 동적 스케줄러 관리 REST API (SA_SYNC_SCHEDULE)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/mgmt/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getAllSchedules() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAllSchedules()));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<ScheduleLogResponse>>> getAllScheduleLogs() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAllScheduleLogs()));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getSchedule(@PathVariable("uid") Long uid) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedule(uid)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(@RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.createSchedule(request)));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable("uid") Long uid,
            @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(uid, request)));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable("uid") Long uid) {
        scheduleService.deleteSchedule(uid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 특정 스케줄을 즉시 1회 실행합니다. (타이머 무시)
     */
    @PostMapping("/execute/{uid}")
    public ResponseEntity<ApiResponse<String>> executeJobNow(@PathVariable("uid") Long uid) {
        log.info("REST API triggered immediate execution for schedule uid: {}", uid);
        scheduleService.executeJobNow(uid);
        return ResponseEntity.ok(ApiResponse.success("Job execution triggered successfully."));
    }
}
