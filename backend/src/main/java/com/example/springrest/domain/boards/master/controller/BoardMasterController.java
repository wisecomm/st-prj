package com.example.springrest.domain.boards.master.controller;

import com.example.springrest.global.model.dto.ApiResponse;
import com.example.springrest.domain.boards.master.model.dto.BoardMasterRequest;
import com.example.springrest.domain.boards.master.model.entity.BoardMaster;
import com.example.springrest.global.model.dto.PageResponse;
import com.example.springrest.domain.boards.master.service.BoardMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Board - Board Master Management", description = "게시판 마스터 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/mgmt/boards/master")
@RequiredArgsConstructor
public class BoardMasterController {

    private final BoardMasterService boardMasterService;

    @Operation(summary = "게시판 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BoardMaster>>> getAllBoards(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String brdNm,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity
                .ok(ApiResponse.success(boardMasterService.getAllBoards(page, size, brdNm, startDate, endDate)));
    }

    @Operation(summary = "게시판 상세 조회")
    @GetMapping("/{brdId}")
    public ResponseEntity<ApiResponse<BoardMaster>> getBoardById(@PathVariable String brdId) {
        BoardMaster board = boardMasterService.getBoardById(brdId);
        return board != null ? ResponseEntity.ok(ApiResponse.success(board)) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "게시판 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createBoard(@Valid @RequestBody BoardMasterRequest request) {
        boardMasterService.createBoard(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "게시판 수정")
    @PutMapping("/{brdId}")
    public ResponseEntity<ApiResponse<Void>> updateBoard(@PathVariable String brdId,
            @Valid @RequestBody BoardMasterRequest request) {
        request.setBrdId(brdId);
        boardMasterService.updateBoard(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "게시판 삭제")
    @DeleteMapping("/{brdId}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(@PathVariable String brdId) {
        boardMasterService.deleteBoard(brdId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
