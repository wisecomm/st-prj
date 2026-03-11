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
import java.util.concurrent.atomic.AtomicInteger;
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

    // 스케줄 UID별 현재 실행 중인 스레드 개수를 추적하는 맵 (단일 인스턴스 기준 동시 실행 방지 처리용)
    private final Map<Long, AtomicInteger> runningScheduleCounts = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("Starting up dynamic schedulers from database...");
        List<Schedule> activeSchedules = scheduleMapper.findActiveSchedules();
        for (Schedule schedule : activeSchedules) {
            registerSchedule(schedule);
        }
        log.info("Loaded {} active schedules.", activeSchedules.size());
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
        if (Boolean.TRUE.equals(refreshed.getUsed()) && Boolean.FALSE.equals(refreshed.getStop())) {
            registerSchedule(refreshed);
        }

        return ScheduleResponse.fromEntity(refreshed);
    }

    @Transactional
    public void deleteSchedule(Long uid) {
        cancelSchedule(uid);
        scheduleMapper.delete(uid);
        log.info("Deleted schedule uid: {}", uid);
    }

    // --- Dynamic Execution Engine ---

    /**
     * 특정 빈의 실행 메서드를 스케줄러에 등록합니다.
     */
    private void registerSchedule(Schedule schedule) {
        if (schedule.getBeanName() == null || schedule.getCron() == null) {
            log.warn("Skipping schedule {} due to missing beanName or cron", schedule.getUid());
            return;
        }

        Runnable task = createRunnableTask(schedule.getUid(), schedule.getBeanName(), schedule.getBeanParam(), "S",
                "system");

        try {
            ScheduledFuture<?> future = taskScheduler.schedule(task, new CronTrigger(schedule.getCron()));
            scheduledTasks.put(schedule.getUid(), future);
            log.info("Registered dynamic schedule -> uid={}, bean={}, cron={}", schedule.getUid(),
                    schedule.getBeanName(), schedule.getCron());
        } catch (Exception e) {
            log.error("Failed to register schedule -> uid={}", schedule.getUid(), e);
        }
    }

    /**
     * 실행 중인 스케줄을 영구 취소합니다.
     */
    private void cancelSchedule(Long uid) {
        ScheduledFuture<?> future = scheduledTasks.remove(uid);
        if (future != null) {
            future.cancel(false); // 실행 중인 스레드를 강제로 인터럽트 하지 않음
            log.info("Canceled running schedule -> uid={}", uid);
        }
    }

    /**
     * REST API 등으로 빈을 즉시 강제 실행합니다. 타이머와 무관합니다.
     */
    public void executeJobNow(Long uid) {
        Schedule schedule = scheduleMapper.findById(uid)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + uid));

        log.info("Manual execution triggered for schedule uid={}", uid);
        Runnable task = createRunnableTask(schedule.getUid(), schedule.getBeanName(), schedule.getBeanParam(), "D",
                "admin");

        // 별도 스레드풀에서 즉시 실행
        taskScheduler.execute(task);
    }

    /**
     * 실행 시점에 DB를 조회하여 Stop=1 (종료여부) 이면 취소하는 Runnable 생성
     */
    private Runnable createRunnableTask(Long uid, String beanName, String beanParam, String methodStr, String worker) {
        return () -> {
            try {
                // 매 실행마다 DB 상태 확인
                Schedule currentStatus = scheduleMapper.findById(uid).orElse(null);
                if (currentStatus == null || Boolean.FALSE.equals(currentStatus.getUsed())) {
                    log.info("Schedule uid={} is deleted or USED=0. Canceling schedule...", uid);
                    cancelSchedule(uid);
                    return;
                }

                AtomicInteger count = runningScheduleCounts.computeIfAbsent(uid, k -> new AtomicInteger(0));

                // STOP=true 이면, 진행 중인 동일한 빈이 있을 때 방금 시작된 실행만 스킵하고 스케줄은 살려둠
                if (Boolean.TRUE.equals(currentStatus.getStop())) {
                    while (true) {
                        int current = count.get();
                        if (current > 0) {
                            log.info("Schedule uid={} already running. STOP=true, Skipping this execution.",
                                    uid);
                            return; // 스케줄 취소(cancelSchedule)를 안 하므로 다음 크론 주기는 유지됨
                        }
                        if (count.compareAndSet(current, current + 1)) {
                            break;
                        }
                    }
                } else {
                    count.incrementAndGet();
                }

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
                    log.error("Failed to insert schedule start log", logEx);
                }

                try {
                    log.info("Executing Dynamic Job -> uid={}, bean={}", uid, beanName);
                    Object bean = applicationContext.getBean(beanName);

                    // 실행할 메서드를 리플렉션으로 탐색 (문자열 beanParam을 유일한 인자로 받는 execute 메서드 우선 검색)
                    Method method = findExecuteMethod(bean);
                    if (method != null) {
                        if (method.getParameterCount() == 1) {
                            method.invoke(bean, beanParam);
                        } else {
                            method.invoke(bean);
                        }
                    } else {
                        throw new RuntimeException("스케줄 빈(" + beanName + ")에서 'execute' 메서드를 찾을 수 없습니다.");
                    }
                    log.info("스케줄 동적 작업 완료 -> uid={}, bean={}", uid, beanName);

                    if (scheduleLog.getUid() != null) {
                        try {
                            scheduleLog.setResult("S");
                            scheduleLog.setMessage("Success");
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
                    count.decrementAndGet();
                }

            } catch (Exception e) {
                log.error("스케줄 작업 진입 중 오류 발생 -> uid={}, bean={}", uid, beanName, e);
            }
        };
    }

    private Method findExecuteMethod(Object bean) {
        Method[] methods = bean.getClass().getMethods();
        for (Method m : methods) {
            // "execute" 라는 이름의 메서드를 찾습니다.
            if ("execute".equals(m.getName())) {
                Class<?>[] paramTypes = m.getParameterTypes();
                // 패라미터가 없거나, String 1개를 받는 경우 허용
                if (paramTypes.length == 0 || (paramTypes.length == 1 && paramTypes[0] == String.class)) {
                    return m;
                }
            }
        }
        return null;
    }
}
