"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RoleInfo } from "@/types";
import { useMenus } from "@/app/(admin)/menus/hooks/use-menu-query";
import { useRoleMenus } from "@/app/(admin)/roles/hooks/useRoleQuery";
import { MenuCheckboxTree } from "./menu-checkbox-tree";
import { ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const roleFormSchema = z.object({
    roleId: z.string().min(2, "Role ID must be at least 2 characters."),
    roleName: z.string().min(1, "Name is required."),
    roleDesc: z.string().optional().or(z.literal("")),
    useYn: z.string().min(1),
    menuIds: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: RoleInfo | null;
    onSubmit: (data: Partial<RoleInfo>, menuIds: string[]) => Promise<void>;
}

export function RoleDialog({ open, onOpenChange, role, onSubmit }: RoleDialogProps) {
    const isEdit = !!role;

    const { data: menusData } = useMenus({ page: 1, size: 1000 });
    const allMenus = menusData?.list || [];
    const { data: fetchedRoleMenuIds, isLoading: isRoleMenusLoading } = useRoleMenus(role?.roleId);
    const roleMenuIds = React.useMemo(() => fetchedRoleMenuIds || [], [fetchedRoleMenuIds]);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: {
            roleId: "",
            roleName: "",
            roleDesc: "",
            useYn: "1",
            menuIds: [],
        },
    });

    // Reset form when role or menu data changes
    React.useEffect(() => {
        if (open) {
            if (role) {
                form.reset({
                    roleId: role.roleId || "",
                    roleName: role.roleName || "",
                    roleDesc: role.roleDesc || "",
                    useYn: role.useYn || "1",
                    menuIds: roleMenuIds,
                });
            } else {
                form.reset({
                    roleId: "",
                    roleName: "",
                    roleDesc: "",
                    useYn: "1",
                    menuIds: [],
                });
            }
        }
    }, [open, role, roleMenuIds, form]);

    const onFormSubmit = async (data: RoleFormValues) => {
        const { menuIds, ...roleData } = data;
        await onSubmit(roleData, menuIds);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} closeOnOutsideClick={false}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background dark:bg-card rounded-xl border-none shadow-2xl">
                <div className="bg-background dark:bg-card px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold leading-6 text-foreground dark:text-foreground flex items-center gap-2">
                        <ShieldCheck className="text-primary w-6 h-6" />
                        {isEdit ? "권한 수정" : "권한 추가"}
                    </h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="px-6 py-6 space-y-5">
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="roleId"
                                render={({ field }) => (
                                    <FormItem className="w-1/2">
                                        <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                            권한 ID <span className="text-primary">*</span>
                                        </FormLabel>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ShieldCheck className="text-muted-foreground w-5 h-5" />
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="ROLE_USER"
                                                    {...field}
                                                    disabled={isEdit}
                                                    className="block w-full pl-10 sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="roleName"
                                render={({ field }) => (
                                    <FormItem className="w-1/2">
                                        <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                            권한 이름 <span className="text-primary">*</span>
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    placeholder="일반 사용자"
                                                    {...field}
                                                    className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="roleDesc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        권한 설명
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="이 권한에 대한 설명을 입력하세요"
                                            {...field}
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="menuIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        메뉴 권한
                                    </FormLabel>
                                    <FormControl>
                                        <div className="bg-background dark:bg-card border border-border dark:border-border rounded-lg p-5 max-h-[300px] overflow-y-auto">
                                            {isRoleMenusLoading && isEdit ? (
                                                <div className="h-20 flex items-center justify-center text-sm text-slate-500">권한 로딩 중...</div>
                                            ) : (
                                                <MenuCheckboxTree
                                                    items={allMenus}
                                                    selectedIds={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-foreground dark:text-foreground">사용 여부</FormLabel>
                                <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                                    이 권한을 활성화하거나 비활성화합니다.
                                </FormDescription>
                            </div>
                            <FormField
                                control={form.control}
                                name="useYn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Switch
                                                className=""
                                                checked={field.value === "1"}
                                                onCheckedChange={(checked) => field.onChange(checked ? "1" : "0")}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-background dark:bg-card border-t border-border dark:border-border pt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="px-4 py-2 bg-background dark:bg-card text-muted-foreground dark:text-muted-foreground border border-border dark:border-border rounded-md text-sm font-bold hover:bg-muted dark:hover:bg-muted"
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                className="px-6 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-bold text-white hover:opacity-90 hover:bg-primary"
                            >
                                저장
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
