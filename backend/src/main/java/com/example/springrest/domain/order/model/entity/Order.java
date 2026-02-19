package com.example.springrest.domain.order.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 주문 Entity
 * Table: tb_orders
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private String orderId; // 주문 번호
    private String custNm; // 고객명
    private String orderNm; // 주문명
    private String orderStatus; // 주문 상태
    private Long orderAmt; // 주문 금액
    private LocalDateTime orderDate; // 주문 일시
    private String useYn; // 사용 여부

    private LocalDateTime sysInsertDtm;
    private String sysInsertUserId;
    private LocalDateTime sysUpdateDtm;
    private String sysUpdateUserId;
}
