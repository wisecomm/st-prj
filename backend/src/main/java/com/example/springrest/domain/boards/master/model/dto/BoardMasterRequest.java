package com.example.springrest.domain.boards.master.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게시판 마스터 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardMasterRequest {
    @NotBlank(message = "게시판 코드는 필수입니다.")
    @Size(max = 20, message = "게시판 코드는 20자 이하여야 합니다.")
    private String brdId;

    @NotBlank(message = "게시판 명은 필수입니다.")
    @Size(max = 100, message = "게시판 명은 100자 이하여야 합니다.")
    private String brdNm;

    private String brdDesc;
    private String replyUseYn;
    private String fileUseYn;
    private Integer fileMaxCnt;
    private String useYn;
}
