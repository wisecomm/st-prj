"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BoardMaster } from "./actions";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LayoutDashboard } from "lucide-react";

const boardFormSchema = z.object({
    brdId: z.string().min(1, "게시판 코드는 필수입니다.").max(20, "게시판 코드는 20자 이하여야 합니다."),
    brdNm: z.string().min(1, "게시판 명은 필수입니다.").max(100, "게시판 명은 100자 이하여야 합니다."),
    brdDesc: z.string(),
    replyUseYn: z.string(),
    fileUseYn: z.string(),
    fileMaxCnt: z.number().min(0).max(20),
    useYn: z.string(),
});

type BoardFormValues = z.infer<typeof boardFormSchema>;

interface BoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    board?: BoardMaster | null;
    onSubmit: (data: Partial<BoardMaster>) => Promise<void>;
}

export function BoardDialog({ open, onOpenChange, board, onSubmit }: BoardDialogProps) {
    const isEdit = !!board;

    const form = useForm<BoardFormValues>({
        resolver: zodResolver(boardFormSchema),
        defaultValues: {
            brdId: "",
            brdNm: "",
            brdDesc: "",
            replyUseYn: "1",
            fileUseYn: "1",
            fileMaxCnt: 5,
            useYn: "1",
        },
    });

    React.useEffect(() => {
        if (open) {
            if (board) {
                form.reset({
                    brdId: board.brdId || "",
                    brdNm: board.brdNm || "",
                    brdDesc: board.brdDesc || "",
                    replyUseYn: board.replyUseYn || "1",
                    fileUseYn: board.fileUseYn || "1",
                    fileMaxCnt: board.fileMaxCnt || 5,
                    useYn: board.useYn || "1",
                });
            } else {
                form.reset({
                    brdId: "",
                    brdNm: "",
                    brdDesc: "",
                    replyUseYn: "1",
                    fileUseYn: "1",
                    fileMaxCnt: 5,
                    useYn: "1",
                });
            }
        }
    }, [open, board, form]);

    const onFormSubmit = async (data: BoardFormValues) => {
        await onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} closeOnOutsideClick={false}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background dark:bg-card rounded-xl border-none shadow-2xl">
                <div className="bg-background dark:bg-card px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold leading-6 text-foreground dark:text-foreground flex items-center gap-2">
                        <LayoutDashboard className="text-primary w-6 h-6" />
                        {isEdit ? "게시판 수정" : "게시판 추가"}
                    </h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="px-6 py-6 space-y-5">
                        <FormField
                            control={form.control}
                            name="brdId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        게시판 코드 <span className="text-primary">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                            placeholder="예: NOTICE, FREE, QNA"
                                            {...field}
                                            disabled={isEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="brdNm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        게시판 명 <span className="text-primary">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                            placeholder="예: 공지사항, 자유게시판"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="brdDesc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        게시판 설명
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                            placeholder="게시판에 대한 설명을 입력하세요"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="replyUseYn"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">
                                            댓글 사용
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value === "1"}
                                                onCheckedChange={(checked) => field.onChange(checked ? "1" : "0")}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fileUseYn"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">
                                            파일 첨부
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value === "1"}
                                                onCheckedChange={(checked) => field.onChange(checked ? "1" : "0")}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="useYn"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">
                                            사용
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value === "1"}
                                                onCheckedChange={(checked) => field.onChange(checked ? "1" : "0")}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="fileMaxCnt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        최대 파일 첨부 수
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={20}
                                            className="w-24 sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
