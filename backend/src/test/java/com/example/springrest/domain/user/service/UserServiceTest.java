package com.example.springrest.domain.user.service;

import com.example.springrest.domain.user.model.dto.UserInfoRequest;
import com.example.springrest.domain.user.model.dto.UserInfoResponse;
import com.example.springrest.domain.user.model.entity.UserInfo;
import com.example.springrest.domain.user.model.entity.UserRoleMap;
import com.example.springrest.domain.user.model.mapper.UserDtoMapper;
import com.example.springrest.domain.user.repository.UserInfoMapper;
import com.example.springrest.domain.user.repository.UserRoleMapper;
import com.example.springrest.global.util.SortValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * UserService 단위 테스트
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 테스트")
class UserServiceTest {

    @Mock
    private UserInfoMapper userInfoMapper;

    @Mock
    private UserRoleMapper userRoleMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserDtoMapper userDtoMapper;

    @Mock
    private SortValidator sortValidator;

    private UserService userService;

    private UserInfo testUser;
    private UserInfoRequest testRequest;
    private UserInfoResponse testResponse;

    @BeforeEach
    void setUp() {
        // Manually create UserService and inject mocks
        userService = new UserService(userInfoMapper, userRoleMapper, passwordEncoder, userDtoMapper, sortValidator);

        testUser = UserInfo.builder()
                .userId("user001")
                .userName("홍길동")
                .userEmail("hong@test.com")
                .userNick("길동이")
                .useYn("1")
                .build();

        testRequest = UserInfoRequest.builder()
                .userId("user001")
                .userName("홍길동")
                .userEmail("hong@test.com")
                .userNick("길동이")
                .userPwd("password123")
                .useYn("1")
                .build();

        testResponse = UserInfoResponse.builder()
                .userId("user001")
                .userName("홍길동")
                .userEmail("hong@test.com")
                .userNick("길동이")
                .useYn("1")
                .roles(Set.of())
                .build();
    }

    @Nested
    @DisplayName("사용자 조회")
    class GetUsers {

        @Test
        @DisplayName("사용자 ID로 조회 성공")
        void getUserById_Success() {
            // given
            given(userInfoMapper.findById("user001")).willReturn(testUser);
            given(userRoleMapper.findByUserId("user001")).willReturn(List.of());
            given(userDtoMapper.toResponse(any(UserInfo.class))).willReturn(testResponse);

            // when
            UserInfoResponse result = userService.getUserById("user001");

            // then
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo("user001");
            assertThat(result.getUserName()).isEqualTo("홍길동");
        }

        @Test
        @DisplayName("존재하지 않는 사용자 조회시 예외 또는 NPE")
        void getUserById_NotFound() {
            // given
            given(userInfoMapper.findById("invalid")).willReturn(null);

            // when & then - null이 반환되면 NPE 발생
            assertThatThrownBy(() -> userService.getUserById("invalid"))
                    .isInstanceOf(NullPointerException.class);
        }
    }

    @Nested
    @DisplayName("사용자 생성")
    class CreateUser {

        @Test
        @DisplayName("사용자 생성 성공")
        void createUser_Success() {
            // given
            given(userInfoMapper.findById("user001")).willReturn(null);
            given(userDtoMapper.toEntity(testRequest)).willReturn(testUser);
            given(passwordEncoder.encode("password123")).willReturn("encodedPassword");
            given(userInfoMapper.insert(any(UserInfo.class))).willReturn(1);

            // when
            assertThatCode(() -> userService.createUser(testRequest))
                    .doesNotThrowAnyException();

            // then
            then(userInfoMapper).should().insert(any(UserInfo.class));
            then(passwordEncoder).should().encode("password123");
        }

        @Test
        @DisplayName("중복 사용자 ID로 생성시 예외 발생")
        void createUser_DuplicateId() {
            // given
            given(userInfoMapper.findById("user001")).willReturn(testUser);

            // when & then
            assertThatThrownBy(() -> userService.createUser(testRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 존재하는 사용자 ID");
        }
    }

    @Nested
    @DisplayName("사용자 수정")
    class UpdateUser {

        @Test
        @DisplayName("사용자 수정 성공 (비밀번호 포함)")
        void updateUser_WithPassword() {
            // given
            given(userDtoMapper.toEntityForUpdate(testRequest)).willReturn(testUser);
            given(passwordEncoder.encode("password123")).willReturn("encodedPassword");
            given(userInfoMapper.update(any(UserInfo.class))).willReturn(1);

            // when
            assertThatCode(() -> userService.updateUser(testRequest))
                    .doesNotThrowAnyException();

            // then
            then(passwordEncoder).should().encode("password123");
            then(userInfoMapper).should().update(any(UserInfo.class));
        }

        @Test
        @DisplayName("사용자 수정 성공 (비밀번호 미포함)")
        void updateUser_WithoutPassword() {
            // given
            UserInfoRequest requestWithoutPwd = UserInfoRequest.builder()
                    .userId("user001")
                    .userName("홍길동 수정")
                    .userEmail("hong@test.com")
                    .useYn("1")
                    .build();

            given(userDtoMapper.toEntityForUpdate(requestWithoutPwd)).willReturn(testUser);
            given(userInfoMapper.update(any(UserInfo.class))).willReturn(1);

            // when
            assertThatCode(() -> userService.updateUser(requestWithoutPwd))
                    .doesNotThrowAnyException();

            // then
            then(passwordEncoder).shouldHaveNoInteractions();
        }
    }

    @Nested
    @DisplayName("사용자 삭제")
    class DeleteUser {

        @Test
        @DisplayName("사용자 삭제 성공")
        void deleteUser_Success() {
            // given
            given(userRoleMapper.deleteByUserId("user001")).willReturn(1);
            given(userInfoMapper.delete("user001")).willReturn(1);

            // when
            assertThatCode(() -> userService.deleteUser("user001"))
                    .doesNotThrowAnyException();

            // then
            then(userRoleMapper).should().deleteByUserId("user001");
            then(userInfoMapper).should().delete("user001");
        }
    }

    @Nested
    @DisplayName("역할 할당")
    class AssignRoles {

        @Test
        @DisplayName("역할 할당 성공")
        void assignRoles_Success() {
            // given
            List<String> roleIds = List.of("ROLE_USER", "ROLE_ADMIN");
            given(userRoleMapper.deleteByUserId("user001")).willReturn(1);
            given(userRoleMapper.insert(any(UserRoleMap.class))).willReturn(1);

            // when
            assertThatCode(() -> userService.assignRoles("user001", roleIds))
                    .doesNotThrowAnyException();

            // then
            then(userRoleMapper).should().deleteByUserId("user001");
            then(userRoleMapper).should(times(2)).insert(any(UserRoleMap.class));
        }

        @Test
        @DisplayName("역할 ID 목록 조회")
        void getUserRoleIds_Success() {
            // given
            UserRoleMap roleMap1 = UserRoleMap.builder().userId("user001").roleId("ROLE_USER").build();
            UserRoleMap roleMap2 = UserRoleMap.builder().userId("user001").roleId("ROLE_ADMIN").build();
            given(userRoleMapper.findByUserId("user001")).willReturn(List.of(roleMap1, roleMap2));

            // when
            List<String> result = userService.getUserRoleIds("user001");

            // then
            assertThat(result).hasSize(2);
            assertThat(result).containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
        }
    }
}
