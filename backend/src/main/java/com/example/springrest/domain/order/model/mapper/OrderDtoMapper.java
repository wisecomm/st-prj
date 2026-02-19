package com.example.springrest.domain.order.model.mapper;

import com.example.springrest.domain.order.model.dto.OrderRequest;
import com.example.springrest.domain.order.model.dto.OrderResponse;
import com.example.springrest.domain.order.model.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * 주문 DTO 매퍼 (MapStruct)
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderDtoMapper {

    /**
     * Request -> Entity
     */
    @Mapping(target = "useYn", defaultValue = "1")
    Order toEntity(OrderRequest request);

    /**
     * Entity -> Response DTO
     */
    OrderResponse toResponse(Order entity);

    /**
     * Entity List -> Response DTO List
     */
    List<OrderResponse> toResponseList(List<Order> entities);
}
