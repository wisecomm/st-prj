package com.example.springrest.domain.user.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자-역할 매핑 엔티티
 * DB CHMM_USER_ROLE_MAP 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleMap {
    private String userId; // 사용자_아이디
    private String roleId; // 롤_아이디
    private String useYn; // 사용 여부
    private LocalDateTime sysInsertDtm; // 시스템_입력_일시
}
