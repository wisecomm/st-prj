-- 1. CHMM_USER_INFO (사용자 정보)
 CREATE TABLE CHMM_USER_INFO (
     USER_ID             VARCHAR(50) PRIMARY KEY,    -- 사용자_아이디 (기본 키)
     USER_EMAIL          VARCHAR(100),               -- 사용자_이메일
     USER_MOBILE         VARCHAR(20),                -- 사용자_모바일
     USER_NAME           VARCHAR(100) NOT NULL,      -- 사용자_명
     USER_NICK           VARCHAR(100),               -- 사용자_닉네임
     USER_PWD            VARCHAR(255),      -- 사용자_암호 (해시된 비밀번호)
     USER_MSG            TEXT,                       -- 사용자_메시지
     USER_DESC           TEXT,                       -- 사용자_설명
     USER_STAT_CD        VARCHAR(10),                -- 사용자_상태_코드 (예: 'ACTIVE', 'INACTIVE')
     USER_PROVIDER       VARCHAR(20) DEFAULT 'LOCAL',    -- 사용자 구분
     USER_SNSID          VARCHAR(100),               -- 사용자_SNS_아이디
     USE_YN              CHAR(1) DEFAULT '1' NOT NULL, -- 사용 여부 ('1': 사용, '0': 미사용)
     SYS_INSERT_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_입력_일시
     SYS_INSERT_USER_ID  VARCHAR(50),                -- 시스템_입력_사용자_아이디
     SYS_UPDATE_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_수정_일시
     SYS_UPDATE_USER_ID  VARCHAR(50)                 -- 시스템_수정_사용자_아이디
 );
 
 -- 2. CHMM_ROLE_INFO (역할 정보)
 CREATE TABLE CHMM_ROLE_INFO (
     ROLE_ID             VARCHAR(50) PRIMARY KEY,    -- 롤_아이디 (기본 키)
     ROLE_NAME           VARCHAR(100) NOT NULL,      -- 롤_명
     ROLE_DESC           TEXT,                       -- 롤_설명
     USE_YN              CHAR(1) DEFAULT '1' NOT NULL, -- 사용 여부 ('1': 사용, '0': 미사용)
     SYS_INSERT_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_입력_일시
     SYS_INSERT_USER_ID  VARCHAR(50),                -- 시스템_입력_사용자_아이디
     SYS_UPDATE_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_수정_일시
     SYS_UPDATE_USER_ID  VARCHAR(50)                 -- 시스템_수정_사용자_아이디
 );
 
 -- 3. CHMM_MENU_INFO (메뉴 정보)
 CREATE TABLE CHMM_MENU_INFO (
     MENU_ID             VARCHAR(50) PRIMARY KEY,    -- 메뉴_아이디 (기본 키)
     MENU_LVL            INTEGER NOT NULL,           -- 메뉴_레벨
     MENU_URI            VARCHAR(255),               -- 메뉴_URI
     MENU_IMG_URI        VARCHAR(255),               -- 메뉴_이미지_URI
     MENU_NAME           VARCHAR(100) NOT NULL,      -- 메뉴_명
     UPPER_MENU_ID       VARCHAR(50),                -- 상위_메뉴_아이디 (자기 참조 FK)
     MENU_DESC           TEXT,                       -- 메뉴_설명
     MENU_SEQ            INTEGER,                    -- 메뉴_순서
     USE_YN              CHAR(1) DEFAULT '1' NOT NULL, -- 사용 여부 ('1': 사용, '0': 미사용)
     SYS_INSERT_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_입력_일시
     SYS_INSERT_USER_ID  VARCHAR(50),                -- 시스템_입력_사용자_아이디
     SYS_UPDATE_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_수정_일시
     SYS_UPDATE_USER_ID  VARCHAR(50),                -- 시스템_수정_사용자_아이디
     FOREIGN KEY (UPPER_MENU_ID) REFERENCES CHMM_MENU_INFO(MENU_ID) ON UPDATE CASCADE -- 상위 메뉴 참조
 );
 
 -- 4. CHMM_ROLE_MENU_MAP (역할-메뉴 매핑)
 CREATE TABLE CHMM_ROLE_MENU_MAP (
     ROLE_ID             VARCHAR(50) NOT NULL,       -- 롤_아이디 (FK)
     MENU_ID             VARCHAR(50) NOT NULL,       -- 메뉴_아이디 (FK)
     USE_YN              CHAR(1) DEFAULT '1' NOT NULL, -- 사용 여부 ('1': 사용, '0': 미사용)
     SYS_INSERT_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_입력_일시
     PRIMARY KEY (ROLE_ID, MENU_ID),                 -- 복합 기본 키
     FOREIGN KEY (ROLE_ID) REFERENCES CHMM_ROLE_INFO(ROLE_ID) ON DELETE CASCADE ON UPDATE CASCADE, -- 역할 삭제 시 매핑 삭제
     FOREIGN KEY (MENU_ID) REFERENCES CHMM_MENU_INFO(MENU_ID) ON DELETE CASCADE ON UPDATE CASCADE  -- 메뉴 삭제 시 매핑 삭제
 );

-- 5. CHMM_USER_ROLE_MAP (사용자-역할 매핑)
 CREATE TABLE CHMM_USER_ROLE_MAP (
     USER_ID             VARCHAR(50) NOT NULL,       -- 사용자_아이디 (FK)
     ROLE_ID             VARCHAR(50) NOT NULL,       -- 롤_아이디 (FK)
     USE_YN              CHAR(1) DEFAULT '1' NOT NULL, -- 사용 여부 ('1': 사용, '0': 미사용)
     SYS_INSERT_DTM      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 시스템_입력_일시
     PRIMARY KEY (USER_ID, ROLE_ID),                 -- 복합 기본 키
     FOREIGN KEY (USER_ID) REFERENCES CHMM_USER_INFO(USER_ID) ON DELETE CASCADE ON UPDATE CASCADE, -- 사용자 삭제 시 매핑 삭제
     FOREIGN KEY (ROLE_ID) REFERENCES CHMM_ROLE_INFO(ROLE_ID) ON DELETE CASCADE ON UPDATE CASCADE  -- 역할 삭제 시 매핑 삭제
 );
 
 