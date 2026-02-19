package com.example.springrest.domain.user.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoRequest {
    @NotBlank(message = "사용자 ID는 필수입니다")
    @Size(min = 3, max = 50, message = "사용자 ID는 3-50자여야 합니다")
    private String userId;

    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String userEmail;

    private String userMobile;

    @NotBlank(message = "사용자 이름은 필수입니다")
    private String userName;

    private String userNick;

    @Size(min = 4, max = 100, message = "비밀번호는 4-100자여야 합니다")
    private String userPwd;

    private String userMsg;
    private String userDesc;
    private String userStatCd;
    private String userSnsid;

    @NotBlank(message = "사용 여부는 필수입니다")
    private String useYn;
}
