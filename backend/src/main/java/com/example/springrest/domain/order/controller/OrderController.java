package com.example.springrest.domain.order.controller;

import com.example.springrest.domain.order.model.dto.OrderRequest;
import com.example.springrest.domain.order.model.dto.OrderResponse;
import com.example.springrest.domain.order.service.OrderService;
import com.example.springrest.global.model.dto.PageResponse;
import com.example.springrest.global.model.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Order - Order Management", description = "주문 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/mgmt/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "주문 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String custNm,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, size, custNm, startDate, endDate, sort)));
    }

    @Operation(summary = "주문 상세 조회")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return order != null ? ResponseEntity.ok(ApiResponse.success(order)) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "주문 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createOrder(@Valid @RequestBody OrderRequest request) {
        orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "주문 수정")
    @PutMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Void>> updateOrder(@PathVariable String orderId,
            @Valid @RequestBody OrderRequest request) {
        request.setOrderId(orderId);
        orderService.updateOrder(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "주문 삭제")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
