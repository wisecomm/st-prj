package com.example.springrest.domain.user.controller;

import com.example.springrest.global.model.dto.ApiResponse;
import com.example.springrest.domain.user.model.dto.UserInfoRequest;

import com.example.springrest.global.model.dto.PageResponse;
import com.example.springrest.domain.user.model.dto.UserRoleAssignRequest;
import com.example.springrest.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.springrest.domain.user.model.dto.UserInfoResponse;

@Tag(name = "User - User Management", description = "사용자 계정 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/v1/mgmt/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "사용자 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserInfoResponse>>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String sort) {
        log.info("getAllUsers called with sort: {}", sort);
        return ResponseEntity
                .ok(ApiResponse.success(userService.getAllUsers(page, size, userName, startDate, endDate, sort)));
    }

    @Operation(summary = "사용자 상세 조회")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getUserById(@PathVariable String userId) {
        UserInfoResponse user = userService.getUserById(userId);
        return user != null ? ResponseEntity.ok(ApiResponse.success(user)) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "사용자 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createUser(@Valid @RequestBody UserInfoRequest request) {
        userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "사용자 수정")
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable String userId,
            @Valid @RequestBody UserInfoRequest request) {
        request.setUserId(userId);
        userService.updateUser(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "사용자 삭제")
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "사용자 역할 부여/수정")
    @PostMapping("/assign-roles")
    public ResponseEntity<ApiResponse<Void>> assignRoles(@Valid @RequestBody UserRoleAssignRequest request) {
        userService.assignRoles(request.getUserId(), request.getRoleIds());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "사용자 역할 목록 조회")
    @GetMapping("/{userId}/roles")
    public ResponseEntity<ApiResponse<List<String>>> getUserRoles(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserRoleIds(userId)));
    }

    @Operation(summary = "엑셀 다운로드")
    @GetMapping("/excel/download")
    public void downloadExcel(jakarta.servlet.http.HttpServletResponse response,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws java.io.IOException {
        userService.downloadExcel(response, userName, startDate, endDate);
    }

    @Operation(summary = "엑셀 업로드")
    @PostMapping("/excel/upload")
    public ResponseEntity<ApiResponse<Void>> uploadExcel(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        userService.uploadExcel(file);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
