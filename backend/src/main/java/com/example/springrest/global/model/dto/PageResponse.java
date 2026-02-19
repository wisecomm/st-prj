package com.example.springrest.global.model.dto;

import com.github.pagehelper.PageInfo;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 페이징 응답 DTO
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PageResponse<T> {
    private List<T> list;
    private long total;
    private int pageNum;
    private int pageSize;
    private int pages;

    @Builder
    public PageResponse(List<T> list, long total, int pageNum, int pageSize, int pages) {
        this.list = list;
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.pages = pages;
    }

    /**
     * PageInfo 객체를 PageResponse로 변환 (데이터 변환 포함)
     *
     * @param pageInfo PageHelper의 PageInfo
     * @param content  변환된 데이터 리스트
     * @param <E>      엔티티 타입
     * @param <D>      DTO 타입
     * @return PageResponse
     */
    public static <E, D> PageResponse<D> of(PageInfo<E> pageInfo, List<D> content) {
        return PageResponse.<D>builder()
                .list(content)
                .total(pageInfo.getTotal())
                .pageNum(pageInfo.getPageNum())
                .pageSize(pageInfo.getPageSize())
                .pages(pageInfo.getPages())
                .build();
    }
}
