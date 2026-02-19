package com.example.springrest.domain.user.repository;

import com.example.springrest.domain.user.model.entity.UserRoleMap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 사용자-역할 매핑 데이터 접근 매퍼
 */
@Mapper
public interface UserRoleMapper {
    List<UserRoleMap> findByUserId(@Param("userId") String userId);

    List<UserRoleMap> findByRoleId(@Param("roleId") String roleId);

    int insert(UserRoleMap userRoleMap);

    int delete(@Param("userId") String userId, @Param("roleId") String roleId);

    int deleteByUserId(@Param("userId") String userId);
}
