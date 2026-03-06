package com.example.springrest.domain.boards.board.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardRequest {
    @NotBlank(message = "게시판 ID는 필수입니다.")
    private String brdId;

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 1000, message = "제목은 1000자 이하여야 합니다.")
    private String title;

    private String contents;

    private String secretYn;
    private String useYn;

    private java.util.List<Integer> deleteFileIds; // 삭제할 파일 ID 목록
}
