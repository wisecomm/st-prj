package com.example.springrest.domain.menu.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메뉴 정보 엔티티
 * DB CHMM_MENU_INFO 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuInfo {
    private String menuId; // 메뉴_아이디
    private Integer menuLvl; // 메뉴_레벨
    private String menuUri; // 메뉴_URI
    private String menuImgUri; // 메뉴_이미지_URI
    private String menuName; // 메뉴_명
    private String upperMenuId; // 상위_메뉴_아이디
    private String menuDesc; // 메뉴_설명
    private Integer menuSeq; // 메뉴_순서
    private String useYn; // 사용 여부
    private LocalDateTime sysInsertDtm; // 시스템_입력_일시
    private String sysInsertUserId; // 시스템_입력_사용자_아이디
    private LocalDateTime sysUpdateDtm; // 시스템_수정_일시
    private String sysUpdateUserId; // 시스템_수정_사용자_아이디
}
