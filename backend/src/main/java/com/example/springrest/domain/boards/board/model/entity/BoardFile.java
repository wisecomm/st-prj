package com.example.springrest.domain.boards.board.model.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardFile {
    private Integer fileId;
    private Integer boardId;
    private String orgFileNm;
    private String strFileNm;
    private String filePath;
    private Long fileSize;
    private String fileExt;
    private String mimeType;
    private Integer downCnt;
    private String useYn;
    private LocalDateTime sysInsertDtm;
    private String sysInsertUserId;
    private LocalDateTime sysUpdateDtm;
    private String sysUpdateUserId;
}
