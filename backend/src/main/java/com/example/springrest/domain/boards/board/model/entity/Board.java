package com.example.springrest.domain.boards.board.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.example.springrest.domain.boards.board.model.entity.BoardFile;
import java.util.List;

/**
 * 게시물 엔티티
 * DB CHMM_BOARD 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Board {
    private Integer boardId; // 게시물 일련번호
    private String brdId; // 게시판 ID
    private String userId; // 작성자 ID
    private String title; // 제목
    private String contents; // 내용
    private Integer hitCnt; // 조회수
    private String secretYn; // 비밀글 여부
    private String useYn; // 사용 여부
    private LocalDateTime sysInsertDtm; // 등록 일시
    private String sysInsertUserId; // 등록자 ID (작성자 ID와 중복될 수 있으나 스키마 따름)
    private LocalDateTime sysUpdateDtm; // 수정 일시
    private String sysUpdateUserId; // 수정자 ID

    private List<BoardFile> fileList; // 첨부파일 목록 (DB 컬럼 아님, 매퍼에서 매핑 필요)
}
