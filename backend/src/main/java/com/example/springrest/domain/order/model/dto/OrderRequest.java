package com.example.springrest.domain.order.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 주문 요청 DTO
 */
@Data
public class OrderRequest {
    private String orderId; // 주문 번호
    private String custNm; // 고객명
    private String orderNm; // 주문명
    private String orderStatus; // 주문 상태
    private Long orderAmt; // 주문 금액
    private LocalDateTime orderDate; // 주문 일시
    private String useYn; // 사용 여부
}
