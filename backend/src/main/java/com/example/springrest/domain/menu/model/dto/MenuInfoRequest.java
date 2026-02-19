package com.example.springrest.domain.menu.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 정보 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuInfoRequest {
    @NotBlank(message = "메뉴 ID는 필수입니다")
    private String menuId;

    @NotNull(message = "메뉴 레벨은 필수입니다")
    private Integer menuLvl;

    private String menuUri;
    private String menuImgUri;

    @NotBlank(message = "메뉴 이름은 필수입니다")
    private String menuName;

    private String upperMenuId;
    private String menuDesc;

    @NotNull(message = "메뉴 순서는 필수입니다")
    private Integer menuSeq;

    @NotBlank(message = "사용 여부는 필수입니다")
    private String useYn;
}
