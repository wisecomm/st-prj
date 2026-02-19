package com.example.springrest.domain.user.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 사용자에게 역할 부여 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleAssignRequest {
    @NotBlank(message = "사용자 ID는 필수입니다")
    private String userId;

    @NotNull(message = "역할 ID 목록은 필수입니다")
    private List<String> roleIds;
}
