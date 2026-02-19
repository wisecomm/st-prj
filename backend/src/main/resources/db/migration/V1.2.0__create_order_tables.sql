-- tb_orders 테이블 생성
CREATE TABLE tb_orders (
    order_id            VARCHAR(20)  NOT NULL, -- 주문 번호 (PK)
    cust_nm             VARCHAR(100) NOT NULL, -- 고객명
    order_nm            VARCHAR(200) NOT NULL, -- 주문명 (상품명 등)
    order_status        VARCHAR(20)  NOT NULL DEFAULT 'ORDERED', -- 주문 상태 (ORDERED, PAID, SHIPPED, COMPLETED, CANCELLED)
    order_amt           NUMERIC(15, 0) NOT NULL DEFAULT 0, -- 주문 금액
    order_date          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 주문 일시
    use_yn              CHAR(1)      NOT NULL DEFAULT '1',
    sys_insert_dtm      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sys_insert_user_id  VARCHAR(50),
    sys_update_dtm      TIMESTAMP,
    sys_update_user_id  VARCHAR(50),
    CONSTRAINT pk_tb_orders PRIMARY KEY (order_id)
);

-- 코멘트 추가
COMMENT ON TABLE tb_orders IS '주문 정보';
COMMENT ON COLUMN tb_orders.order_id IS '주문 번호';
COMMENT ON COLUMN tb_orders.cust_nm IS '고객명';
COMMENT ON COLUMN tb_orders.order_nm IS '주문명';
COMMENT ON COLUMN tb_orders.order_status IS '주문 상태';
COMMENT ON COLUMN tb_orders.order_amt IS '주문 금액';
COMMENT ON COLUMN tb_orders.order_date IS '주문 일시';
