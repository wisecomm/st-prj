package com.example.springrest.domain.boards.board.repository;

import com.example.springrest.domain.boards.board.model.entity.BoardFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardFileMapper {
    void insert(BoardFile boardFile);

    List<BoardFile> findByBoardId(Integer boardId);

    BoardFile findById(Integer fileId);

    void delete(Integer fileId);

    void deleteByBoardId(Integer boardId);
}
