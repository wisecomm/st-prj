package com.example.springrest.domain.boards.master.repository;

import com.example.springrest.domain.boards.master.model.entity.BoardMaster;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 게시판 마스터 데이터 접근 매퍼
 */
@Mapper
public interface BoardMasterMapper {
    BoardMaster findById(@Param("brdId") String brdId);

    List<BoardMaster> findAll(@Param("brdNm") String brdNm, @Param("startDate") String startDate,
            @Param("endDate") String endDate);

    int insert(BoardMaster boardMaster);

    int update(BoardMaster boardMaster);

    int delete(@Param("brdId") String brdId);
}
