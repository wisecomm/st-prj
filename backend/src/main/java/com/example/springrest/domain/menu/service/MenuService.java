package com.example.springrest.domain.menu.service;

import com.example.springrest.domain.menu.model.dto.MenuInfoRequest;
import com.example.springrest.domain.menu.model.entity.MenuInfo;
import com.example.springrest.domain.menu.repository.MenuInfoMapper;
import com.example.springrest.global.model.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.example.springrest.global.common.service.BaseService;
import com.example.springrest.domain.menu.model.dto.MenuInfoResponse;
import com.example.springrest.domain.menu.model.mapper.MenuDtoMapper;

/**
 * 메뉴 정보 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService extends BaseService<MenuInfo, String, MenuInfoMapper> {

    private final MenuInfoMapper menuInfoMapper;
    private final MenuDtoMapper menuDtoMapper;

    @Override
    protected MenuInfoMapper getMapper() {
        return menuInfoMapper;
    }

    @Transactional(readOnly = true)
    public List<MenuInfoResponse> getAllMenus() {
        return menuDtoMapper.toResponseList(menuInfoMapper.findAll());
    }

    @Transactional(readOnly = true)
    public PageResponse<MenuInfoResponse> getMenusWithPagination(int page, int size, String searchId) {
        PageHelper.startPage(page, size);

        List<MenuInfo> menus = menuInfoMapper.findAllWithSearch(searchId);
        PageInfo<MenuInfo> pageInfo = new PageInfo<>(menus);

        return PageResponse.of(pageInfo, menuDtoMapper.toResponseList(menus));
    }

    @Transactional(readOnly = true)
    public List<MenuInfoResponse> getMenusByUserId(String userId) {
        return menuDtoMapper.toResponseList(menuInfoMapper.findByUserId(userId));
    }

    @Transactional(readOnly = true)
    public MenuInfoResponse getMenuById(String menuId) {
        return menuDtoMapper.toResponse(super.findById(menuId));
    }

    @Transactional
    public void createMenu(MenuInfoRequest request) {
        MenuInfo menu = menuDtoMapper.toEntity(request);
        super.create(menu);
    }

    @Transactional
    public void updateMenu(MenuInfoRequest request) {
        MenuInfo menu = menuDtoMapper.toEntity(request);
        super.update(menu);
    }

    @Transactional
    public void deleteMenu(String menuId) {
        super.delete(menuId);
    }
}
