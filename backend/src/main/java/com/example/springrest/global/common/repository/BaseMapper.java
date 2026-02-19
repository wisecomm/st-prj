package com.example.springrest.global.common.repository;

import java.util.List;

/**
 * Generic Base Mapper interface for standard CRUD operations.
 *
 * @param <T>  Entity type
 * @param <ID> Entity ID type
 */
public interface BaseMapper<T, ID> {
    List<T> findAll();

    T findById(ID id);

    int insert(T entity);

    int update(T entity);

    int delete(ID id);
}
