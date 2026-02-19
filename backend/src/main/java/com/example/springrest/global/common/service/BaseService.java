package com.example.springrest.global.common.service;

import com.example.springrest.global.common.repository.BaseMapper;
import com.example.springrest.global.model.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Generic Base Service for standard CRUD operations.
 *
 * @param <T>  Entity type
 * @param <ID> Entity ID type
 * @param <M>  Mapper type extending BaseMapper
 */
public abstract class BaseService<T, ID, M extends BaseMapper<T, ID>> {

    protected abstract M getMapper();

    public PageResponse<T> findAll(int page, int size) {
        PageHelper.startPage(page, size);
        List<T> list = getMapper().findAll();
        PageInfo<T> pageInfo = new PageInfo<>(list);
        return PageResponse.of(pageInfo, list);
    }

    public T findById(ID id) {
        return getMapper().findById(id);
    }

    @Transactional
    public void create(T entity) {
        getMapper().insert(entity);
    }

    @Transactional
    public void update(T entity) {
        getMapper().update(entity);
    }

    @Transactional
    public void delete(ID id) {
        getMapper().delete(id);
    }
}
