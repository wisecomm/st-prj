package com.example.springrest.domain.user.service;

import com.example.springrest.domain.user.model.dto.UserInfoRequest;
import com.example.springrest.domain.user.model.dto.UserInfoResponse;
import com.example.springrest.domain.user.model.entity.UserInfo;
import com.example.springrest.domain.user.model.entity.UserRoleMap;
import com.example.springrest.domain.user.model.mapper.UserDtoMapper;
import com.example.springrest.domain.user.repository.UserInfoMapper;
import com.example.springrest.domain.user.repository.UserRoleMapper;
import com.example.springrest.global.model.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.apache.poi.ss.usermodel.Workbook;

import com.example.springrest.global.common.service.BaseService;
import com.example.springrest.global.util.SortValidator;

/**
 * 사용자 정보 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService extends BaseService<UserInfo, String, UserInfoMapper> {

    private final UserInfoMapper userInfoMapper;

    @Override
    protected UserInfoMapper getMapper() {
        return userInfoMapper;
    }

    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    private final UserDtoMapper userDtoMapper;

    private final SortValidator sortValidator;

    @Transactional(readOnly = true)
    public PageResponse<UserInfoResponse> getAllUsers(int page, int size, String userName, String startDate,
            String endDate,
            String sort) {
        PageHelper.startPage(page, size);

        if (startDate != null && !startDate.isEmpty()) {
            startDate = startDate + " 00:00:00";
        }
        if (endDate != null && !endDate.isEmpty()) {
            endDate = endDate + " 23:59:59";
        }

        // Sort validation
        String sortClause = null;
        if (sort != null && !sort.isEmpty()) {
            String[] parts = sort.split(",");
            if (parts.length == 2) {
                sortClause = sortValidator.validateAndConvert("users", parts[0], parts[1]);
            }
        }

        List<UserInfo> users = userInfoMapper.findAllWithSearch(userName, startDate, endDate, sortClause);
        List<UserInfoResponse> userResponses = userDtoMapper.toResponseList(users);

        PageInfo<UserInfo> originalPageInfo = new PageInfo<>(users);

        PageInfo<UserInfoResponse> responsePageInfo = new PageInfo<>();
        responsePageInfo.setList(userResponses);
        responsePageInfo.setTotal(originalPageInfo.getTotal());
        responsePageInfo.setPageNum(originalPageInfo.getPageNum());
        responsePageInfo.setPageSize(originalPageInfo.getPageSize());
        responsePageInfo.setPages(originalPageInfo.getPages());

        return PageResponse.of(responsePageInfo, userResponses);
    }

    // getUserById uses UserInfoResponse, so we keep logic but use super.findById
    // internally if we want,
    // but here we already use userInfoMapper.findById directly or via super.
    @Transactional(readOnly = true)
    public UserInfoResponse getUserById(String userId) {
        UserInfo user = super.findById(userId); // Use BaseService method

        // [Refactor] Manually populate roles to avoid MyBatis N+1 issue
        java.util.Set<com.example.springrest.domain.user.model.enums.UserRole> roles = userRoleMapper
                .findByUserId(userId).stream()
                .map(ur -> com.example.springrest.domain.user.model.enums.UserRole.valueOf(ur.getRoleId()))
                .collect(java.util.stream.Collectors.toSet());

        user.setRoles(roles);

        return userDtoMapper.toResponse(user);
    }

    @Transactional
    public void createUser(UserInfoRequest request) {
        if (super.findById(request.getUserId()) != null) {
            throw new IllegalArgumentException("이미 존재하는 사용자 ID입니다: " + request.getUserId());
        }
        UserInfo user = userDtoMapper.toEntity(request);
        user.setUserPwd(passwordEncoder.encode(request.getUserPwd()));
        // Use BaseService create
        super.create(user);
    }

    @Transactional
    public void updateUser(UserInfoRequest request) {
        // Update logic via MapStruct
        UserInfo user = userDtoMapper.toEntityForUpdate(request);

        if (request.getUserPwd() != null && !request.getUserPwd().isEmpty()) {
            user.setUserPwd(passwordEncoder.encode(request.getUserPwd()));
        }

        // Use BaseService update
        super.update(user);
    }

    @Transactional
    public void deleteUser(String userId) {
        userRoleMapper.deleteByUserId(userId);
        super.delete(userId);
    }

    @Transactional
    public void assignRoles(String userId, List<String> roleIds) {
        userRoleMapper.deleteByUserId(userId);
        for (String roleId : roleIds) {
            UserRoleMap mapping = UserRoleMap.builder()
                    .userId(userId)
                    .roleId(roleId)
                    .useYn("1")
                    .build();
            userRoleMapper.insert(mapping);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getUserRoleIds(String userId) {
        return userRoleMapper.findByUserId(userId).stream()
                .map(UserRoleMap::getRoleId)
                .toList();
    }

    public void downloadExcel(jakarta.servlet.http.HttpServletResponse response, String userName, String startDate,
            String endDate) throws java.io.IOException {
        if (startDate != null && !startDate.isEmpty()) {
            startDate = startDate + " 00:00:00";
        }
        if (endDate != null && !endDate.isEmpty()) {
            endDate = endDate + " 23:59:59";
        }

        List<UserInfo> users = userInfoMapper.findAllWithSearch(userName, startDate, endDate, null);

        List<com.example.springrest.domain.user.model.dto.UserExcelDto> excelData = users.stream()
                .map(userDtoMapper::toExcelDto)
                .collect(java.util.stream.Collectors.toList());

        Workbook workbook = com.example.springrest.common.excel.ExcelUtils
                .toExcel(excelData, com.example.springrest.domain.user.model.dto.UserExcelDto.class);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String fileName = java.net.URLEncoder.encode("사용자목록.xlsx", "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @Transactional
    public void uploadExcel(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        List<com.example.springrest.domain.user.model.dto.UserExcelDto> excelList = com.example.springrest.common.excel.ExcelUtils
                .fromExcel(file, com.example.springrest.domain.user.model.dto.UserExcelDto.class);

        for (com.example.springrest.domain.user.model.dto.UserExcelDto dto : excelList) {
            UserInfoRequest request = UserInfoRequest.builder()
                    .userId(dto.getUserId())
                    .userName(dto.getUserName())
                    .userEmail(dto.getUserEmail())
                    .userNick(dto.getUserNick())
                    .useYn(dto.getUseYn())
                    .userPwd(dto.getUserPwd() != null && !dto.getUserPwd().isEmpty() ? dto.getUserPwd() : "test1234")
                    .build();

            if (userInfoMapper.findById(dto.getUserId()) != null) {
                updateUser(request);
            } else {
                createUser(request);
            }
        }
    }
}
