package com.example.springrest.domain.boards.board.service;

import com.example.springrest.domain.boards.board.model.dto.BoardRequest;
import com.example.springrest.domain.boards.board.model.dto.BoardSearchDto;
import com.example.springrest.domain.boards.board.model.entity.Board;
import com.example.springrest.domain.boards.board.repository.BoardMapper;
import com.example.springrest.global.model.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springrest.domain.boards.board.model.entity.BoardFile;
import com.example.springrest.domain.boards.board.repository.BoardFileMapper;
import com.example.springrest.global.util.FileStore;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardMapper boardMapper;
    private final BoardFileMapper boardFileMapper;
    private final FileStore fileStore;

    public PageResponse<Board> getBoardList(int page, int size, BoardSearchDto searchDto) {
        PageHelper.startPage(page, size);

        // Date handling if needed (adding time if only date provided)
        if (searchDto.getStartDate() != null && !searchDto.getStartDate().isEmpty()) {
            searchDto.setStartDate(searchDto.getStartDate() + " 00:00:00");
        }
        if (searchDto.getEndDate() != null && !searchDto.getEndDate().isEmpty()) {
            searchDto.setEndDate(searchDto.getEndDate() + " 23:59:59");
        }

        List<Board> boards = boardMapper.findAll(searchDto);
        PageInfo<Board> pageInfo = new PageInfo<>(boards);

        return PageResponse.of(pageInfo, boards);
    }

    public Board getBoard(Integer boardId) {
        // TODO: Hit count increment
        Board board = boardMapper.findById(boardId);
        if (board != null) {
            board.setFileList(boardFileMapper.findByBoardId(boardId));
        }
        return board;
    }

    public BoardFile getBoardFile(Integer fileId) {
        return boardFileMapper.findById(fileId);
    }

    @Transactional
    public void createBoard(BoardRequest request, List<MultipartFile> files) throws IOException {
        // TODO: Get real User ID from context
        String userId = "admin"; // Default for now

        Board board = Board.builder()
                .brdId(request.getBrdId())
                .userId(userId)
                .title(request.getTitle())
                .contents(request.getContents())
                .secretYn(request.getSecretYn() != null ? request.getSecretYn() : "0")
                .useYn("1")
                .sysInsertUserId(userId)
                .sysUpdateUserId(userId)
                .build();
        boardMapper.insert(board);

        // File Upload
        if (files != null && !files.isEmpty()) {
            List<BoardFile> boardFiles = fileStore.storeFiles(files, board.getBoardId());
            for (BoardFile boardFile : boardFiles) {
                boardFile.setSysInsertUserId(userId);
                boardFile.setSysUpdateUserId(userId);
                boardFileMapper.insert(boardFile);
            }
        }
    }

    @Transactional
    public void updateBoard(Integer boardId, BoardRequest request, List<MultipartFile> files) throws IOException {
        Board board = boardMapper.findById(boardId);
        if (board == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다: " + boardId);
        }

        String userId = "admin"; // Default for now

        board.setTitle(request.getTitle());
        board.setContents(request.getContents());
        board.setSecretYn(request.getSecretYn() != null ? request.getSecretYn() : "0");
        board.setUseYn(request.getUseYn() != null ? request.getUseYn() : "1");
        board.setSysUpdateUserId(userId);

        boardMapper.update(board);

        // File Deletion
        if (request.getDeleteFileIds() != null && !request.getDeleteFileIds().isEmpty()) {
            for (Integer fileId : request.getDeleteFileIds()) {
                // Optional: Verify file belongs to board?
                // For now, just delete
                boardFileMapper.delete(fileId);
                // TODO: Delete from physical storage if needed, or rely on batch cleanup
            }
        }

        // File Upload (Append new files)
        if (files != null && !files.isEmpty()) {
            List<BoardFile> boardFiles = fileStore.storeFiles(files, boardId);
            for (BoardFile boardFile : boardFiles) {
                boardFile.setSysInsertUserId(userId);
                boardFile.setSysUpdateUserId(userId);
                boardFileMapper.insert(boardFile);
            }
        }
    }

    @Transactional
    public void deleteBoard(Integer boardId) {
        boardMapper.delete(boardId);
        // Files are logically deleted by cascade or we can explictly delete them if
        // needed
        // For now, let's explicitly delete them logically using mapper
        boardFileMapper.deleteByBoardId(boardId);
    }
}
