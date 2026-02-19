package com.example.springrest.domain.menu.repository;

import com.example.springrest.domain.menu.model.entity.MenuInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

import com.example.springrest.global.common.repository.BaseMapper;

/**
 * 메뉴 정보 데이터 접근 매퍼
 */
@Mapper
public interface MenuInfoMapper extends BaseMapper<MenuInfo, String> {
    MenuInfo findById(@Param("menuId") String menuId);

    List<MenuInfo> findAll();

    List<MenuInfo> findAllWithSearch(@Param("searchId") String searchId);

    List<MenuInfo> findByUserId(@Param("userId") String userId);

    int insert(MenuInfo menuInfo);

    int update(MenuInfo menuInfo);

    int delete(@Param("menuId") String menuId);
}
