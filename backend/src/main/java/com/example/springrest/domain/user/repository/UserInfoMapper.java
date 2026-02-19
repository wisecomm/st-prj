package com.example.springrest.domain.user.repository;

import com.example.springrest.domain.user.model.entity.UserInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

import com.example.springrest.global.common.repository.BaseMapper;

/**
 * 사용자 상세 정보 데이터 접근 매퍼
 */
@Mapper
public interface UserInfoMapper extends BaseMapper<UserInfo, String> {
    UserInfo findById(@Param("userId") String userId);

    UserInfo findByUserEmail(@Param("userEmail") String userEmail);

    List<UserInfo> findAll();

    List<UserInfo> findAllWithSearch(@Param("userName") String userName, @Param("startDate") String startDate,
            @Param("endDate") String endDate, @Param("sort") String sort);

    int insert(UserInfo userInfo);

    int update(UserInfo userInfo);

    int delete(@Param("userId") String userId);
}
