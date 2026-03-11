-- V1.4.0__create_schedule_table.sql

CREATE TABLE SA_SYNC_SCHEDULE (
    UID           SERIAL PRIMARY KEY,                         -- 일련번호
    BEAN_NAME     VARCHAR(255) DEFAULT NULL,                  -- 스케줄 빈
    BEAN_PARAM    TEXT DEFAULT NULL,                          -- 스케줄 파라메터
    USED          BOOLEAN DEFAULT FALSE,                      -- 사용여부
    DUP_STOP      BOOLEAN DEFAULT FALSE,                      -- 실행시 종료여부
    CRON          VARCHAR(32) DEFAULT NULL,                   -- 스케줄
    COMMENT       VARCHAR(255) DEFAULT NULL,                  -- 스케줄 설명
    CREATE_TIME   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,         -- 생성시간
    CREATOR       VARCHAR(32) NOT NULL,                       -- 생성자
    UPDATE_TIME   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,         -- 수정시간
    UPDATER       VARCHAR(32) DEFAULT NULL                    -- 수정자
);

CREATE TABLE SA_SYNC_SCHEDULE_LOG (
    UID           SERIAL PRIMARY KEY,                         -- 일련번호
    CORP_CODE     VARCHAR(32) DEFAULT NULL,                   -- 회사코드
    BEAN_NAME     VARCHAR(255) DEFAULT NULL,                  -- 스케줄 빈
    METHOD        VARCHAR(1) NOT NULL,                        -- S:스케줄실행, D:직접실행
    RESULT        VARCHAR(1) NOT NULL,                        -- S:성공, F:실패, I:진행중
    MESSAGE       TEXT DEFAULT NULL,                          -- 성공 또는 실패 메시지
    START_TIME    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 작업 시작시간
    END_TIME      TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,   -- 작업 종료시간
    WORKER        VARCHAR(32) DEFAULT 'system'                -- 작업자
);
