
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MenuInfo } from "./types";
import { ChevronRight, ChevronDown, Plus, LayoutGrid, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuTreeProps {
    items: MenuInfo[];
    selectedId?: string;
    onSelect: (item: MenuInfo) => void;
    onAddChild: (parentId: string, level: number) => void;
}

export function MenuTree({ items, selectedId, onSelect, onAddChild }: MenuTreeProps) {
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    React.useEffect(() => {
        if (items.length > 0) {
            const initialExpanded: Record<string, boolean> = {};
            items.filter(item => !item.upperMenuId).forEach(item => {
                initialExpanded[item.menuId] = true;
            });
            setExpanded(prev => ({ ...initialExpanded, ...prev }));
        }
    }, [items]);

    const buildTree = (parentId?: string) => {
        return items
            .filter(item => item.upperMenuId === parentId || (!parentId && !item.upperMenuId))
            .sort((a, b) => (a.menuSeq || 0) - (b.menuSeq || 0));
    };

    const renderNode = (item: MenuInfo, level: number = 0) => {
        const children = buildTree(item.menuId);
        const hasChildren = children.length > 0;
        const isExpanded = expanded[item.menuId];
        const isSelected = selectedId === item.menuId;

        return (
            <div key={item.menuId} className="select-none">
                <div
                    className={cn(
                        "py-2 flex items-center gap-2 text-sm rounded cursor-pointer transition-colors group", // Added group for hover effect
                        isSelected
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => onSelect(item)}
                    style={{ paddingLeft: `${level * 16 + 16} px` }}
                >
                    {hasChildren ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 -ml-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.menuId);
                            }}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                        </Button>
                    ) : (
                        // Placeholder for alignment if no children
                        <div className="w-6 h-6 -ml-1 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        </div>
                    )}

                    {item.menuId === 'M10000' && <LayoutGrid className="w-4 h-4 text-muted-foreground" />}
                    {item.menuId === 'M20000' && <Settings className="w-4 h-4 text-muted-foreground" />}
                    {item.menuId === 'M30000' && <Info className="w-4 h-4 text-muted-foreground" />}

                    <span className="flex-1 truncate">{item.menuName}</span>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "w-6 h-6 ml-auto mr-1 transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(item.menuId, item.menuLvl + 1);
                        }}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
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
        <div className="space-y-1">
            {rootItems.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-10">
                    No menus found.
                </div>
            ) : (
                rootItems.map(item => renderNode(item))
            )}
        </div>
    );
}

