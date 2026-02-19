package com.example.springrest.domain.menu.service;

import com.example.springrest.domain.menu.model.dto.MenuInfoRequest;
import com.example.springrest.domain.menu.model.dto.MenuInfoResponse;
import com.example.springrest.domain.menu.model.entity.MenuInfo;
import com.example.springrest.domain.menu.model.mapper.MenuDtoMapper;
import com.example.springrest.domain.menu.repository.MenuInfoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * MenuService 단위 테스트
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MenuService 테스트")
class MenuServiceTest {

    @Mock
    private MenuInfoMapper menuInfoMapper;

    @Mock
    private MenuDtoMapper menuDtoMapper;

    private MenuService menuService;

    private MenuInfo testMenu;
    private MenuInfoRequest testRequest;
    private MenuInfoResponse testResponse;

    @BeforeEach
    void setUp() {
        // Manually create MenuService and inject mocks
        menuService = new MenuService(menuInfoMapper, menuDtoMapper);

        testMenu = MenuInfo.builder()
                .menuId("MENU001")
                .menuName("대시보드")
                .menuUri("/dashboard")
                .menuLvl(1)
                .upperMenuId(null)
                .menuSeq(1)
                .useYn("1")
                .build();

        testRequest = MenuInfoRequest.builder()
                .menuId("MENU001")
                .menuName("대시보드")
                .menuUri("/dashboard")
                .menuLvl(1)
                .upperMenuId(null)
                .menuSeq(1)
                .useYn("1")
                .build();

        testResponse = MenuInfoResponse.builder()
                .menuId("MENU001")
                .menuName("대시보드")
                .menuUri("/dashboard")
                .menuLvl(1)
                .upperMenuId(null)
                .menuSeq(1)
                .useYn("1")
                .build();
    }

    @Nested
    @DisplayName("메뉴 조회")
    class GetMenus {

        @Test
        @DisplayName("전체 메뉴 조회 성공")
        void getAllMenus_Success() {
            // given
            given(menuInfoMapper.findAll()).willReturn(List.of(testMenu));
            given(menuDtoMapper.toResponseList(List.of(testMenu))).willReturn(List.of(testResponse));

            // when
            List<MenuInfoResponse> result = menuService.getAllMenus();

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getMenuId()).isEqualTo("MENU001");
        }

        @Test
        @DisplayName("메뉴 ID로 조회 성공")
        void getMenuById_Success() {
            // given
            given(menuInfoMapper.findById("MENU001")).willReturn(testMenu);
            given(menuDtoMapper.toResponse(testMenu)).willReturn(testResponse);

            // when
            MenuInfoResponse result = menuService.getMenuById("MENU001");

            // then
            assertThat(result).isNotNull();
            assertThat(result.getMenuId()).isEqualTo("MENU001");
            assertThat(result.getMenuName()).isEqualTo("대시보드");
        }

        @Test
        @DisplayName("존재하지 않는 메뉴 조회시 null 반환")
        void getMenuById_NotFound() {
            // given
            given(menuInfoMapper.findById("INVALID")).willReturn(null);
            given(menuDtoMapper.toResponse(null)).willReturn(null);

            // when
            MenuInfoResponse result = menuService.getMenuById("INVALID");

            // then
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("사용자별 메뉴 조회 성공")
        void getMenusByUserId_Success() {
            // given
            given(menuInfoMapper.findByUserId("user001")).willReturn(List.of(testMenu));
            given(menuDtoMapper.toResponseList(List.of(testMenu))).willReturn(List.of(testResponse));

            // when
            List<MenuInfoResponse> result = menuService.getMenusByUserId("user001");

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getMenuName()).isEqualTo("대시보드");
        }
    }

    @Nested
    @DisplayName("메뉴 생성")
    class CreateMenu {

        @Test
        @DisplayName("메뉴 생성 성공")
        void createMenu_Success() {
            // given
            given(menuDtoMapper.toEntity(testRequest)).willReturn(testMenu);
            given(menuInfoMapper.insert(any(MenuInfo.class))).willReturn(1);

            // when
            assertThatCode(() -> menuService.createMenu(testRequest))
                    .doesNotThrowAnyException();

            // then
            then(menuInfoMapper).should().insert(any(MenuInfo.class));
        }
    }

    @Nested
    @DisplayName("메뉴 수정")
    class UpdateMenu {

        @Test
        @DisplayName("메뉴 수정 성공")
        void updateMenu_Success() {
            // given
            given(menuDtoMapper.toEntity(testRequest)).willReturn(testMenu);
            given(menuInfoMapper.update(any(MenuInfo.class))).willReturn(1);

            // when
            assertThatCode(() -> menuService.updateMenu(testRequest))
                    .doesNotThrowAnyException();

            // then
            then(menuInfoMapper).should().update(any(MenuInfo.class));
        }
    }

    @Nested
    @DisplayName("메뉴 삭제")
    class DeleteMenu {

        @Test
        @DisplayName("메뉴 삭제 성공")
        void deleteMenu_Success() {
            // given
            given(menuInfoMapper.delete("MENU001")).willReturn(1);

            // when
            assertThatCode(() -> menuService.deleteMenu("MENU001"))
                    .doesNotThrowAnyException();

            // then
            then(menuInfoMapper).should().delete("MENU001");
        }
    }
}
