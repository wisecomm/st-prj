/**
 * useMenuManagement Hook
 * 
 * 메뉴 관리 페이지의 모든 비즈니스 로직을 캡슐화
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from './use-menu-query';
import { useToast } from '@/hooks/use-toast';
import { MenuInfo } from '../types';

/**
 * 메뉴 관리 훅 리턴 타입
 */
export interface UseMenuManagementReturn {
    // 데이터
    menus: MenuInfo[];
    isLoading: boolean;

    // 선택된 메뉴
    selectedMenu: MenuInfo | null;
    selectMenu: (menu: MenuInfo) => void;
    addChildMenu: (parentId: string, level: number) => void;

    // CRUD 작업
    handleCreate: (data: Partial<MenuInfo>) => Promise<void>;
    handleUpdate: (data: Partial<MenuInfo>) => Promise<void>;
    handleDelete: (menuId: string) => Promise<void>;
    handleSubmit: (data: Partial<MenuInfo>) => Promise<void>;
}

/**
 * 메뉴 관리 훅
 */
export function useMenuManagement(): UseMenuManagementReturn {
    const { toast } = useToast();

    // API 훅 - 메뉴는 트리 구조로 전체 목록이 필요하므로 큰 페이지 사이즈 사용
    const { data: menusData, isLoading, isError, error } = useMenus({ page: 0, size: 1000 });

    useEffect(() => {
        if (isError) {
            toast({
                title: '목록 조회 실패',
                description: error?.message || '메뉴 목록을 불러오는 중 오류가 발생했습니다.',
                variant: 'destructive',
            });
        }
    }, [isError, error, toast]);

    // 메뉴 데이터가 변경될 때만 재계산
    const menus = useMemo(() => menusData?.list ?? [], [menusData]);

    const createMutation = useCreateMenu();
    const updateMutation = useUpdateMenu();
    const deleteMutation = useDeleteMenu();

    /**
     * 초기 메뉴 선택 (첫 번째 루트 메뉴)
     * useMemo를 사용하여 초기 값을 derived state로 계산
     */
    const initialMenu = useMemo(() => {
        if (menus.length > 0) {
            return menus.find((m: MenuInfo) => !m.upperMenuId) || menus[0];
        }
        return null;
    }, [menus]);

    // 상태 - initialMenu가 변경되면 selectedMenu도 업데이트
    const [selectedMenu, setSelectedMenu] = useState<MenuInfo | null>(null);

    // initialMenu가 설정되고 selectedMenu가 아직 null인 경우에만 초기화
    const effectiveSelectedMenu = selectedMenu ?? initialMenu;

    /**
     * 메뉴 선택
     */
    const selectMenu = useCallback((menu: MenuInfo) => {
        setSelectedMenu(menu);
    }, []);

    /**
     * 하위 메뉴 추가
     */
    const addChildMenu = useCallback((parentId: string, level: number) => {
        setSelectedMenu({
            menuId: '',
            menuName: '',
            menuLvl: level,
            upperMenuId: parentId,
            leftMenuYn: 'Y',
            useYn: '1',
            adminMenuYn: 'N',
            personalDataYn: 'N',
        } as MenuInfo);
    }, []);

    /**
     * 메뉴 생성
     */
    const handleCreate = useCallback(async (data: Partial<MenuInfo>) => {
        try {
            await createMutation.mutateAsync(data);

            toast({
                title: '등록 완료',
                description: '새 메뉴가 등록되었습니다.',
                variant: 'success',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : '메뉴 등록에 실패했습니다.';
            toast({
                title: '등록 실패',
                description: message,
                variant: 'destructive',
            });
            throw error;
        }
    }, [createMutation, toast]);

    /**
     * 메뉴 수정
     */
    const handleUpdate = useCallback(async (data: Partial<MenuInfo>) => {
        if (!selectedMenu?.menuId) {
            throw new Error('선택된 메뉴가 없습니다.');
        }

        try {
            await updateMutation.mutateAsync({
                id: selectedMenu.menuId,
                data,
            });

            toast({
                title: '수정 완료',
                description: '메뉴 정보가 수정되었습니다.',
                variant: 'success',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : '메뉴 수정에 실패했습니다.';
            toast({
                title: '수정 실패',
                description: message,
                variant: 'destructive',
            });
            throw error;
        }
    }, [selectedMenu, updateMutation, toast]);

    /**
     * 메뉴 삭제
     */
    const handleDelete = useCallback(async (menuId: string) => {
        const confirmed = window.confirm(
            `메뉴 ${menuId}를 삭제하시겠습니까?`
        );

        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(menuId);

            setSelectedMenu(null);

            toast({
                title: '삭제 완료',
                description: '메뉴가 삭제되었습니다.',
                variant: 'success',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : '메뉴 삭제에 실패했습니다.';
            toast({
                title: '삭제 실패',
                description: message,
                variant: 'destructive',
            });
            throw error;
        }
    }, [deleteMutation, toast]);

    /**
     * 폼 제출 (생성 또는 수정)
     */
    const handleSubmit = useCallback(async (data: Partial<MenuInfo>) => {
        if (selectedMenu?.menuId) {
            await handleUpdate(data);
        } else {
            await handleCreate(data);
        }
    }, [selectedMenu, handleCreate, handleUpdate]);

    return {
        // 데이터
        menus,
        isLoading,

        // 선택된 메뉴
        selectedMenu: effectiveSelectedMenu,
        selectMenu,
        addChildMenu,

        // CRUD
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSubmit,
    };
}
