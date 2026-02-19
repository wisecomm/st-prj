package com.example.springrest.domain.order.service;

import com.example.springrest.domain.order.model.dto.OrderRequest;
import com.example.springrest.domain.order.model.entity.Order;
import com.example.springrest.domain.order.repository.OrderMapper;
import com.example.springrest.global.model.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.example.springrest.global.common.service.BaseService;
import com.example.springrest.domain.order.model.dto.OrderResponse;
import com.example.springrest.domain.order.model.mapper.OrderDtoMapper;
import com.example.springrest.global.util.SortValidator;

/**
 * 주문 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService extends BaseService<Order, String, OrderMapper> {

    private final OrderMapper orderMapper;
    private final OrderDtoMapper orderDtoMapper;
    private final SortValidator sortValidator;

    @Override
    protected OrderMapper getMapper() {
        return orderMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String custNm, String startDate, String endDate,
            String sort) {
        PageHelper.startPage(page, size);

        if (startDate != null && !startDate.isEmpty()) {
            startDate = startDate + " 00:00:00";
        }
        if (endDate != null && !endDate.isEmpty()) {
            endDate = endDate + " 23:59:59";
        }

        // Convert sort format if needed (e.g. from "camelCase,asc" to "snake_case asc")
        // Assuming sort comes as "colId,direction"
        // Sort validation
        String sortClause = null;
        if (sort != null && !sort.isEmpty()) {
            String[] parts = sort.split(",");
            if (parts.length == 2) {
                sortClause = sortValidator.validateAndConvert("orders", parts[0], parts[1]);
            }
        }

        List<Order> orders = orderMapper.findAllWithSearch(custNm, startDate, endDate, sortClause);
        PageInfo<Order> pageInfo = new PageInfo<>(orders);

        return PageResponse.of(pageInfo, orderDtoMapper.toResponseList(orders));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        return orderDtoMapper.toResponse(super.findById(orderId));
    }

    @Transactional
    public void createOrder(OrderRequest request) {
        if (super.findById(request.getOrderId()) != null) {
            throw new IllegalArgumentException("이미 존재하는 주문 번호입니다: " + request.getOrderId());
        }
        Order order = orderDtoMapper.toEntity(request);
        super.create(order);
    }

    @Transactional
    public void updateOrder(OrderRequest request) {
        Order order = orderDtoMapper.toEntity(request);
        super.update(order);
    }

    @Transactional
    public void deleteOrder(String orderId) {
        super.delete(orderId);
    }

}
