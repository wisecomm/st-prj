package com.example.springrest.domain.user.model.entity;

import com.example.springrest.domain.user.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * 사용자 상세 정보 엔티티
 * DB CHMM_USER_INFO 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String userId; // 사용자_아이디
    private Set<UserRole> roles; // 사용자_역할 목록
    private String userEmail; // 사용자_이메일
    private String userMobile; // 사용자_모바일
    private String userName; // 사용자_명
    private String userNick; // 사용자_닉네임
    @JsonIgnore
    private String userPwd; // 사용자_암호
    private String userMsg; // 사용자_메시지
    private String userDesc; // 사용자_설명
    private String userStatCd; // 사용자_상태_코드
    private String userSnsid; // 사용자_SNS_아이디
    private String useYn; // 사용 여부
    private LocalDateTime sysInsertDtm; // 시스템_입력_일시
    private String sysInsertUserId; // 시스템_입력_사용자_아이디
    private LocalDateTime sysUpdateDtm; // 시스템_수정_일시
    private String sysUpdateUserId; // 시스템_수정_사용자_아이디
    private String userProvider; // 사용자_구분 (LOCAL, GOOGLE, etc.)
}
