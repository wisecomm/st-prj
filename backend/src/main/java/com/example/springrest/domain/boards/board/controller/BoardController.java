package com.example.springrest.domain.boards.board.controller;

import com.example.springrest.domain.boards.board.model.dto.BoardRequest;
import com.example.springrest.domain.boards.board.model.dto.BoardSearchDto;
import com.example.springrest.domain.boards.board.model.entity.Board;
import com.example.springrest.domain.boards.board.service.BoardService;
import com.example.springrest.global.model.dto.ApiResponse;
import com.example.springrest.global.model.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.example.springrest.domain.boards.board.model.entity.BoardFile;
import com.example.springrest.global.util.FileStore;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Tag(name = "Board - Post Management", description = "게시물 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/boards/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final FileStore fileStore;

    @Operation(summary = "게시물 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Board>>> getAllBoards(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute BoardSearchDto searchDto) {
        return ResponseEntity.ok(ApiResponse.success(boardService.getBoardList(page, size, searchDto)));
    }

    @Operation(summary = "게시물 상세 조회")
    @GetMapping("/{boardId}")
    public ResponseEntity<ApiResponse<Board>> getBoardById(@PathVariable Integer boardId) {
        Board board = boardService.getBoard(boardId);
        return board != null ? ResponseEntity.ok(ApiResponse.success(board)) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "게시물 생성")
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ApiResponse<Void>> createBoard(
            @RequestPart(value = "request") @Valid BoardRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {
        boardService.createBoard(request, files);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "게시물 수정")
    @PutMapping(value = "/{boardId}", consumes = { "multipart/form-data" })
    public ResponseEntity<ApiResponse<Void>> updateBoard(
            @PathVariable Integer boardId,
            @RequestPart(value = "request") @Valid BoardRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {
        boardService.updateBoard(boardId, request, files);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "파일 다운로드")
    @GetMapping("/files/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer fileId) throws Exception {
        BoardFile boardFile = boardService.getBoardFile(fileId);
        if (boardFile == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = fileStore.loadFileAsResource(boardFile.getFilePath() + boardFile.getStrFileNm());

        String encodedUploadFileName = URLEncoder.encode(boardFile.getOrgFileNm(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        String contentDisposition = "attachment; filename=\"" + encodedUploadFileName + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }

    @Operation(summary = "게시물 삭제")
    @DeleteMapping("/{boardId}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(@PathVariable Integer boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
