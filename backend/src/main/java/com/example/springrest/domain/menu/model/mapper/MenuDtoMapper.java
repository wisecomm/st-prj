package com.example.springrest.domain.menu.model.mapper;

import com.example.springrest.domain.menu.model.dto.MenuInfoRequest;
import com.example.springrest.domain.menu.model.dto.MenuInfoResponse;
import com.example.springrest.domain.menu.model.entity.MenuInfo;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * 메뉴 정보 DTO 매퍼 (MapStruct)
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MenuDtoMapper {

    /**
     * Request -> Entity
     */
    MenuInfo toEntity(MenuInfoRequest request);

    /**
     * Entity -> Response DTO
     */
    MenuInfoResponse toResponse(MenuInfo entity);

    /**
     * Entity List -> Response DTO List
     */
    List<MenuInfoResponse> toResponseList(List<MenuInfo> entities);
}
