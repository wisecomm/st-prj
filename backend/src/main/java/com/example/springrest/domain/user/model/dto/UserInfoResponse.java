package com.example.springrest.domain.user.model.dto;

import com.example.springrest.domain.user.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * 사용자 정보 응답 DTO
 * UserInfo Entity를 대체하여 클라이언트에 반환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private String userId; // 사용자_아이디
    private Set<UserRole> roles; // 사용자_역할 목록
    private String userEmail; // 사용자_이메일
    private String userMobile; // 사용자_모바일
    private String userName; // 사용자_명
    private String userNick; // 사용자_닉네임

    // 비밀번호 필드 제거 (보안)

    private String userMsg; // 사용자_메시지
    private String userDesc; // 사용자_설명
    private String userStatCd; // 사용자_상태_코드
    private String userProvider; // 사용자_구분
    private String userSnsid; // 사용자_SNS_아이디
    private String useYn; // 사용 여부

    private LocalDateTime sysInsertDtm; // 시스템_입력_일시
    private String sysInsertUserId; // 시스템_입력_사용자_아이디
    private LocalDateTime sysUpdateDtm; // 시스템_수정_일시
    private String sysUpdateUserId; // 시스템_수정_사용자_아이디
}
