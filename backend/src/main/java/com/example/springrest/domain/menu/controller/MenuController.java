package com.example.springrest.domain.menu.controller;

import com.example.springrest.global.model.dto.ApiResponse;
import com.example.springrest.global.model.dto.PageResponse;
import com.example.springrest.domain.menu.model.dto.MenuInfoRequest;
import com.example.springrest.domain.menu.model.dto.MenuInfoResponse;
import com.example.springrest.domain.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User - Menu Management", description = "메뉴 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/mgmt/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @Operation(summary = "메뉴 목록 조회 (페이지네이션)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MenuInfoResponse>>> getAllMenus(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchId) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getMenusWithPagination(page, size, searchId)));
    }

    @Operation(summary = "나의 권한 메뉴 조회")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<MenuInfoResponse>>> getMyMenus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        log.info("Fetching menus for current user: {}", userId);
        return ResponseEntity.ok(ApiResponse.success(menuService.getMenusByUserId(userId)));
    }

    @Operation(summary = "메뉴 상세 조회")
    @GetMapping("/{menuId}")
    public ResponseEntity<ApiResponse<MenuInfoResponse>> getMenuById(@PathVariable String menuId) {
        MenuInfoResponse menu = menuService.getMenuById(menuId);
        return menu != null ? ResponseEntity.ok(ApiResponse.success(menu)) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "메뉴 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createMenu(@Valid @RequestBody MenuInfoRequest request) {
        menuService.createMenu(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "메뉴 수정")
    @PutMapping("/{menuId}")
    public ResponseEntity<ApiResponse<Void>> updateMenu(@PathVariable String menuId,
            @Valid @RequestBody MenuInfoRequest request) {
        request.setMenuId(menuId);
        menuService.updateMenu(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "메뉴 삭제")
    @DeleteMapping("/{menuId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenu(@PathVariable String menuId) {
        menuService.deleteMenu(menuId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
