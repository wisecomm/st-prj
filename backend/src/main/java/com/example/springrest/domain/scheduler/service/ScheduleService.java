package com.example.springrest.domain.scheduler.service;

import com.example.springrest.domain.scheduler.model.dto.ScheduleLogResponse;
import com.example.springrest.domain.scheduler.model.dto.ScheduleRequest;
import com.example.springrest.domain.scheduler.model.dto.ScheduleResponse;
import com.example.springrest.domain.scheduler.model.entity.Schedule;
import com.example.springrest.domain.scheduler.model.entity.ScheduleLog;
import com.example.springrest.domain.scheduler.repository.ScheduleLogMapper;
import com.example.springrest.domain.scheduler.repository.ScheduleMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleMapper scheduleMapper;
    private final ScheduleLogMapper scheduleLogMapper;
    private final ApplicationContext applicationContext;
    private final ThreadPoolTaskScheduler taskScheduler;

    // 실행 중인 스케줄 작업을 보관하는 맵 (단일 인스턴스 기준)
    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    // 스케줄 UID별 현재 실행 중인 스레드를 추적하는 맵 (DUP_STOP=true 시 기존 실행 중지용)
    private final Map<Long, Thread> runningScheduleThreads = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("데이터베이스에서 동적 스케줄러를 시작합니다...");
        List<Schedule> activeSchedules = scheduleMapper.findActiveSchedules();
        for (Schedule schedule : activeSchedules) {
            registerSchedule(schedule);
        }
        log.info("활성 스케줄 {}개를 로드했습니다.", activeSchedules.size());
    }

    // --- CRUD ---

    @Transactional(readOnly = true)
    public List<ScheduleLogResponse> getAllScheduleLogs() {
        return scheduleLogMapper.findAllLogs().stream()
                .map(ScheduleLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleMapper.findAll().stream()
                .map(ScheduleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(Long uid) {
        return scheduleMapper.findById(uid)
                .map(ScheduleResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Schedule not found with uid: " + uid));
    }

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        Schedule entity = request.toEntity();
        scheduleMapper.insert(entity);

        // 사용 여부가 1이면 스케줄 즉시 등록
        if (Boolean.TRUE.equals(entity.getUsed())) {
            registerSchedule(entity);
        }
        return ScheduleResponse.fromEntity(entity);
    }

    @Transactional
    public ScheduleResponse updateSchedule(Long uid, ScheduleRequest request) {
        Schedule existing = scheduleMapper.findById(uid)
                .orElseThrow(() -> new RuntimeException("Schedule not found with uid: " + uid));

        // 업데이트 수행
        Schedule updated = request.toEntity();
        updated.setUid(uid);
        scheduleMapper.update(updated);

        // 기존 스케줄 취소
        cancelSchedule(uid);

        // 변경 후 다시 조회해서 최신 상태로 등록
        Schedule refreshed = scheduleMapper.findById(uid).orElse(updated);
        if (Boolean.TRUE.equals(refreshed.getUsed())) {
            registerSchedule(refreshed);
        }

        return ScheduleResponse.fromEntity(refreshed);
    }

    @Transactional
    public void deleteSchedule(Long uid) {
        cancelSchedule(uid);
        scheduleMapper.delete(uid);
        log.info("스케줄 삭제 완료 -> uid={}", uid);
    }

    // --- Dynamic Execution Engine ---

    /**
     * 특정 빈의 실행 메서드를 스케줄러에 등록합니다.
     */
    private void registerSchedule(Schedule schedule) {
        if (schedule.getBeanName() == null || schedule.getCron() == null) {
            log.warn("빈 이름 또는 크론 표현식 누락으로 스케줄 건너뜀 -> uid={}", schedule.getUid());
            return;
        }

        Runnable task = createRunnableTask(schedule.getUid(), schedule.getBeanName(), schedule.getBeanParam(), "S",
                "system");

        try {
            ScheduledFuture<?> future = taskScheduler.schedule(task, new CronTrigger(schedule.getCron()));
            scheduledTasks.put(schedule.getUid(), future);
            log.info("동적 스케줄 등록 완료 -> uid={}, bean={}, cron={}", schedule.getUid(),
                    schedule.getBeanName(), schedule.getCron());
        } catch (Exception e) {
            log.error("스케줄 등록 실패 -> uid={}", schedule.getUid(), e);
        }
    }

    /**
     * 실행 중인 스케줄을 영구 취소합니다.
     */
    private void cancelSchedule(Long uid) {
        ScheduledFuture<?> future = scheduledTasks.remove(uid);
        if (future != null) {
            future.cancel(false); // 실행 중인 스레드를 강제로 인터럽트 하지 않음
            log.info("실행 중인 스케줄 취소 완료 -> uid={}", uid);
        }
    }

    /**
     * REST API 등으로 빈을 즉시 강제 실행합니다. 타이머와 무관합니다.
     */
    public void executeJobNow(Long uid) {
        Schedule schedule = scheduleMapper.findById(uid)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + uid));

        log.info("스케줄 수동 실행 요청 -> uid={}", uid);
        Runnable task = createRunnableTask(schedule.getUid(), schedule.getBeanName(), schedule.getBeanParam(), "D",
                "admin");

        // 별도 스레드풀에서 즉시 실행
        taskScheduler.execute(task);
    }

    /**
     * 실행 시점에 DB를 조회하여 DUP_STOP=true이면 기존 실행 중지 후 새로 실행하는 Runnable 생성
     */
    private Runnable createRunnableTask(Long uid, String beanName, String beanParam, String methodStr, String worker) {
        return () -> {
            try {
                // 매 실행마다 DB 상태 확인
                Schedule currentStatus = scheduleMapper.findById(uid).orElse(null);
                if (currentStatus == null) {
                    log.info("스케줄 uid={} 삭제됨. 스케줄 취소 중...", uid);
                    cancelSchedule(uid);
                    return;
                }

                // DUP_STOP=true: 이미 실행 중인 동일 스케줄이 있으면 중지 후 새로 실행, 없으면 그냥 실행
                // DUP_STOP=false: 무조건 실행
                if (Boolean.TRUE.equals(currentStatus.getDupStop())) {
                    Thread runningThread = runningScheduleThreads.get(uid);
                    if (runningThread != null && runningThread.isAlive()) {
                        log.info("스케줄 uid={} 이미 실행 중. DUP_STOP=true, 기존 실행 중지 후 재실행.", uid);
                        runningThread.interrupt();
                        try {
                            runningThread.join(5000); // 최대 5초 대기
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }

                // 현재 스레드를 실행 중 스레드로 등록
                runningScheduleThreads.put(uid, Thread.currentThread());

                ScheduleLog scheduleLog = ScheduleLog.builder()
                        .corpCode(null)
                        .beanName(beanName)
                        .method(methodStr)
                        .result("I")
                        .worker(worker)
                        .build();

                try {
                    scheduleLogMapper.insertLog(scheduleLog);
                } catch (Exception logEx) {
                    log.error("스케줄 시작 로그 저장 실패", logEx);
                }

                try {
                    log.info("동적 작업 실행 시작 -> uid={}, bean={}", uid, beanName);
                    Object bean = applicationContext.getBean(beanName);

                    // 실행할 메서드를 리플렉션으로 탐색
                    Method method = findExecuteMethod(bean);
                    if (method != null) {
                        Class<?>[] paramTypes = method.getParameterTypes();
                        if (paramTypes.length == 2) {
                            // execute(String beanParam, ScheduleLog scheduleLog)
                            method.invoke(bean, beanParam, scheduleLog);
                        } else if (paramTypes.length == 1) {
                            // execute(String beanParam)
                            method.invoke(bean, beanParam);
                        } else {
                            // execute()
                            method.invoke(bean);
                        }
                    } else {
                        throw new RuntimeException("스케줄 빈(" + beanName + ")에서 'execute' 메서드를 찾을 수 없습니다.");
                    }
                    log.info("스케줄 동적 작업 완료 -> uid={}, bean={}", uid, beanName);

                    if (scheduleLog.getUid() != null) {
                        try {
                            // Job에서 result를 설정하지 않았으면(여전히 "I") 기본값 "S" 설정
                            if ("I".equals(scheduleLog.getResult())) {
                                scheduleLog.setResult("S");
                                scheduleLog.setMessage("Success");
                            }
                            scheduleLogMapper.updateLog(scheduleLog);
                        } catch (Exception ignore) {
                        }
                    }
                } catch (Exception ex) {
                    log.error("스케줄 작업 실행 중 오류 발생 -> uid={}, bean={}", uid, beanName, ex);
                    if (scheduleLog.getUid() != null) {
                        try {
                            scheduleLog.setResult("F");
                            String errMsg = ex.getMessage();
                            if (ex.getCause() != null) {
                                errMsg = ex.getCause().getMessage();
                            }
                            scheduleLog.setMessage(errMsg != null ? errMsg.substring(0, Math.min(errMsg.length(), 500))
                                    : "Unknown Error");
                            scheduleLogMapper.updateLog(scheduleLog);
                        } catch (Exception ignore) {
                        }
                    }
                } finally {
                    runningScheduleThreads.remove(uid, Thread.currentThread());
                }

            } catch (Exception e) {
                log.error("스케줄 작업 진입 중 오류 발생 -> uid={}, bean={}", uid, beanName, e);
            }
        };
    }

    private Method findExecuteMethod(Object bean) {
        Method[] methods = bean.getClass().getMethods();
        Method fallback = null;
        for (Method m : methods) {
            if ("execute".equals(m.getName())) {
                Class<?>[] paramTypes = m.getParameterTypes();
                // (String, ScheduleLog) 시그니처 우선
                if (paramTypes.length == 2 && paramTypes[0] == String.class && paramTypes[1] == ScheduleLog.class) {
                    return m;
                }
                // (String) 또는 () 시그니처는 fallback
                if (paramTypes.length == 0 || (paramTypes.length == 1 && paramTypes[0] == String.class)) {
                    fallback = m;
                }
            }
        }
        return fallback;
    }
}
