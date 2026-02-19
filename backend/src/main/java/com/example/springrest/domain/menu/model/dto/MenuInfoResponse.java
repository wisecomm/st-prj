package com.example.springrest.domain.menu.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메뉴 정보 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuInfoResponse {
    private String menuId;
    private Integer menuLvl;
    private String menuUri;
    private String menuImgUri;
    private String menuName;
    private String upperMenuId;
    private String menuDesc;
    private Integer menuSeq;
    private String useYn;
    private LocalDateTime sysInsertDtm;
    private String sysInsertUserId;
    private LocalDateTime sysUpdateDtm;
    private String sysUpdateUserId;
}
