package com.example.springrest.domain.boards.board.repository;

import com.example.springrest.domain.boards.board.model.dto.BoardSearchDto;
import com.example.springrest.domain.boards.board.model.entity.Board;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMapper {
    Board findById(@Param("boardId") Integer boardId);

    List<Board> findAll(BoardSearchDto searchDto);

    int insert(Board board);

    int update(Board board);

    int delete(@Param("boardId") Integer boardId);
}
