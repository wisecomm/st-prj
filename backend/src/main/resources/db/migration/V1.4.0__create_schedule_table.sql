-- V1.4.0__create_schedule_table.sql

CREATE TABLE SA_SYNC_SCHEDULE (
    UID           SERIAL PRIMARY KEY,                         -- 일련번호
    BEAN_NAME     VARCHAR(255) DEFAULT NULL,                  -- 스케줄 빈
    BEAN_PARAM    TEXT DEFAULT NULL,                          -- 스케줄 파라메터
    USED          BOOLEAN DEFAULT FALSE,                      -- 사용여부
    STOP          BOOLEAN DEFAULT FALSE,                      -- 실행시 종료여부
    CRON          VARCHAR(32) DEFAULT NULL,                   -- 스케줄
    COMMENT       VARCHAR(255) DEFAULT NULL,                  -- 스케줄 설명
    CREATE_TIME   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,         -- 생성시간
    CREATOR       VARCHAR(32) NOT NULL,                       -- 생성자
    UPDATE_TIME   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,         -- 수정시간
);

CREATE TABLE sa_sync_schedule_log (
    uid           SERIAL PRIMARY KEY,                         -- 일련번호
    corp_code     VARCHAR(32) DEFAULT NULL,                   -- 회사코드
    bean_name     VARCHAR(255) DEFAULT NULL,                  -- 스케줄 빈
    method        VARCHAR(1) NOT NULL,                        -- S:스케줄실행, D:직접실행
    result        VARCHAR(1) NOT NULL,                        -- S:성공, F:실패, I:진행중
    message       TEXT DEFAULT NULL,                          -- 성공 또는 실패 메시지
    start_time    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 작업 시작시간
    end_time      TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,   -- 작업 종료시간
    worker        VARCHAR(32) DEFAULT 'system'                -- 작업자
);
