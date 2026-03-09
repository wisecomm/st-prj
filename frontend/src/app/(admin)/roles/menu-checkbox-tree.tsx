"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MenuInfo } from "@/types";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MenuCheckboxTreeProps {
    items: MenuInfo[];
    selectedIds: string[];
    onCheckedChange: (checkedIds: string[]) => void;
}

export function MenuCheckboxTree({ items, selectedIds, onCheckedChange }: MenuCheckboxTreeProps) {
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const buildTree = (parentId?: string | null) => {
        return items
            .filter(item => item.upperMenuId === parentId || (!parentId && !item.upperMenuId))
            .sort((a, b) => (a.menuSeq || 0) - (b.menuSeq || 0));
    };



    const handleCheck = (menuId: string, checked: boolean) => {
        let nextIds = [...selectedIds];

        if (checked) {
            if (!nextIds.includes(menuId)) {
                nextIds.push(menuId);
            }
        } else {
            nextIds = nextIds.filter(id => id !== menuId);
        }

        onCheckedChange(nextIds);
    };

    const renderNode = (item: MenuInfo, level: number = 0) => {
        const children = buildTree(item.menuId);
        const hasChildren = children.length > 0;
        const isExpanded = expanded[item.menuId];
        const isChecked = selectedIds.includes(item.menuId);

        return (
            <div key={item.menuId} className="select-none">
                <div
                    className={cn(
                        "flex items-center py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors",
                        item.useYn === "0" && "opacity-50"
                    )}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                >
                    <div className="w-4 h-4 mr-1 flex items-center justify-center">
                        {hasChildren ? (
                            <div
                                onClick={(e) => toggleExpand(item.menuId, e)}
                                className="hover:bg-slate-300 dark:hover:bg-slate-700 rounded p-0.5 cursor-pointer"
                            >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </div>
                        ) : null}
                    </div>
                    <Checkbox
                        id={`menu-${item.menuId}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleCheck(item.menuId, !!checked)}
                        className="mr-2"
                    />
                    <div className="flex items-center flex-1 cursor-default">
                        {hasChildren ? (
                            <Folder className="w-4 h-4 mr-2 text-slate-400" />
                        ) : (
                            <File className="w-4 h-4 mr-2 text-slate-400" />
                        )}
                        <label
                            htmlFor={`menu-${item.menuId}`}
                            className="text-sm font-medium truncate cursor-pointer"
                        >
                            {item.menuName}
                        </label>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="mt-0.5">
                        {children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const rootItems = buildTree();

    return (
        <div className="space-y-1 max-h-[300px] overflow-y-auto border rounded-md p-2 bg-white dark:bg-slate-950">
            {rootItems.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">
                    No menus available.
                </div>
            ) : (
                rootItems.map(item => renderNode(item))
            )}
        </div>
    );
}
