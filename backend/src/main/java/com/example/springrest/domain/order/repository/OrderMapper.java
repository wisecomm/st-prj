package com.example.springrest.domain.order.repository;

import com.example.springrest.domain.order.model.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

import com.example.springrest.global.common.repository.BaseMapper;

@Mapper
public interface OrderMapper extends BaseMapper<Order, String> {
    List<Order> findAll();

    List<Order> findAllWithSearch(@Param("custNm") String custNm,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("sort") String sort);

    Order findById(@Param("orderId") String orderId);

    int insert(Order order);

    int update(Order order);

    int delete(@Param("orderId") String orderId);
}
