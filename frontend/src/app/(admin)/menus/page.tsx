"use client";

/**
 * Menus Page (Refactored)
 * 
 * 비즈니스 로직을 커스텀 훅으로 분리하여 간결하고 명확한 구조
 */

import { MenuTree } from "./menu-tree";
import { InputForm } from "./input-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMenuManagement } from "./hooks/use-menu-management";

export default function MenusPage() {
    // 모든 비즈니스 로직을 커스텀 훅에서 관리
    const {
        menus,
        isLoading,
        selectedMenu,
        selectMenu,
        addChildMenu,
        handleSubmit,
        handleDelete,
    } = useMenuManagement();

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-6">
            {/* Left Column: Menu Tree */}
            <div className="w-full lg:w-1/4 min-w-75 flex flex-col bg-background dark:bg-card rounded-xl shadow-sm border border-border dark:border-border overflow-hidden h-fit max-h-[calc(100vh-200px)]">
                <div className="p-4 bg-muted dark:bg-muted border-b border-border dark:border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground dark:text-muted-foreground">
                        <span className="text-base">최상위메뉴</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => addChildMenu("", 1)}
                        title="최상위 메뉴 추가"
                        aria-label="최상위 메뉴 추가"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="space-y-4 p-2">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <MenuTree
                            items={menus}
                            selectedId={selectedMenu?.menuId}
                            onSelect={selectMenu}
                            onAddChild={addChildMenu}
                        />
                    )}
                </div>
            </div>

            {/* Right Column: Menu Form */}
            <div className="flex-1 bg-background dark:bg-card rounded-xl shadow-sm border border-border dark:border-border overflow-hidden">
                {selectedMenu && (
                    <InputForm
                        item={selectedMenu}
                        allMenus={menus}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </div>
    );
}
