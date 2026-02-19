package com.example.springrest.domain.auth.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "구글 로그인 요청 DTO")
public class GoogleLoginRequest {
    @Schema(description = "구글 인증 코드", example = "4/0A...")
    private String code;
}
