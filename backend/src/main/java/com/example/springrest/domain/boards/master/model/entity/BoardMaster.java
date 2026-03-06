package com.example.springrest.domain.boards.master.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 게시판 마스터 엔티티
 * DB CHMM_BOARD_MASTER 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardMaster {
    private String brdId;           // 게시판 코드
    private String brdNm;           // 게시판 명
    private String brdDesc;         // 게시판 설명
    private String replyUseYn;      // 댓글 사용 여부
    private String fileUseYn;       // 파일 첨부 사용 여부
    private Integer fileMaxCnt;     // 최대 파일 첨부 개수
    private String useYn;           // 사용 여부
    private LocalDateTime sysInsertDtm;     // 등록 일시
    private String sysInsertUserId;         // 등록자 ID
    private LocalDateTime sysUpdateDtm;     // 수정 일시
    private String sysUpdateUserId;         // 수정자 ID
}
