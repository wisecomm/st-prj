import * as React from "react";
import { Settings } from "lucide-react";
import { MenuInfo } from "./types";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    Input,
    Button,
    Switch,
    Textarea,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Separator,
} from "@/components/ui";
import { useInputForm } from "./hooks/use-input-form";

export interface InputFormProps {
    item?: MenuInfo | null;
    allMenus: MenuInfo[];
    onSubmit: (data: Partial<MenuInfo>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export function InputForm({ item, allMenus, onSubmit, onDelete }: InputFormProps) {
    const { form, handleSubmit, isEdit } = useInputForm({ item, onSubmit });

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    {isEdit && item ? `메뉴 : ${item.menuName}` : (item?.upperMenuId && item.upperMenuId !== "none" ? "Add Child Menu" : "Create Root Menu")}
                </CardTitle>
                <CardDescription>
                    Configure menu settings and access control.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Information</h3>
                                <FormField
                                    control={form.control}
                                    name="menuId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>메뉴 아이디</FormLabel>
                                            <FormControl>
                                                <Input placeholder="예: M00001" {...field} disabled={isEdit} className="py-2.5" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="menuName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>메뉴 이름</FormLabel>
                                            <FormControl>
                                                <Input placeholder="메뉴 이름을 입력하세요" {...field} className="py-2.5" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="upperMenuId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>부모 메뉴</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="py-2.5">
                                                        <SelectValue placeholder="상위 메뉴 선택 (없음)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">상위 메뉴 선택 (없음)</SelectItem>
                                                    {allMenus
                                                        .filter(m => m.menuId !== item?.menuId) // Prevent self-parenting
                                                        .map(m => (
                                                            <SelectItem key={m.menuId} value={m.menuId}>
                                                                {m.menuName} ({m.menuId})
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Path & Sorting Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Path & Display</h3>
                                <FormField
                                    control={form.control}
                                    name="menuUri"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>메뉴 URI</FormLabel>
                                            <FormControl>
                                                <Input placeholder="/path/to/menu" {...field} className="py-2.5" />
                                            </FormControl>
                                            <FormDescription>Relative URL path for this menu.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="menuImgUri"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>메뉴 이미지 URI</FormLabel>
                                            <div className="flex gap-2 items-start">
                                                <FormControl className="flex-1">
                                                    <Input placeholder="/images/menus/icon.svg" {...field} className="py-2.5" />
                                                </FormControl>
                                                <Button type="button" variant="outline" size="icon" className="shrink-0 bg-background dark:bg-input">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <FormDescription>Path to the menu icon/image.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="menuLvl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>레벨</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="py-2.5" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="menuSeq"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>보여주기 순서</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="py-2.5" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Use Status and Description */}
                        <Separator className="border-border dark:border-border my-6" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-foreground dark:text-foreground">사용 여부</FormLabel>
                                <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                                    Enable or disable this menu.
                                </FormDescription>
                            </div>
                            <FormField
                                control={form.control}
                                name="useYn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Switch
                                                className="data-[state=checked]:bg-primary"
                                                checked={field.value === "1"}
                                                onCheckedChange={(checked: boolean) => field.onChange(checked ? "1" : "0")}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="menuDesc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>비고</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the purpose of this menu" {...field} className="p-3" rows={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-8 py-5 bg-muted dark:bg-muted border-t border-border dark:border-border flex items-center justify-end rounded-b-xl -mx-8 -mb-8 mt-10">
                            <div className="flex gap-2">
                                {isEdit && onDelete && item && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => onDelete(item.menuId)}
                                    >
                                        삭제
                                    </Button>
                                )}
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                    저장
                                </Button>
                            </div>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card >
    );
}
