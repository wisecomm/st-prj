package com.example.springrest.domain.boards.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardSearchDto {
    private String brdId; // 게시판 ID (필수)
    private String searchType; // 검색 유형 (title, contents, userId)
    private String keyword; // 검색어
    private String startDate; // 시작일
    private String endDate; // 종료일

    // Paging parameters passed separately usually, but can be here if passed to
    // mapper
    private int offset;
    private int limit;
}
