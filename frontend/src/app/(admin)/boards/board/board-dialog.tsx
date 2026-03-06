"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Board, BoardFile, downloadBoardFile } from "./actions";
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
import { FileText } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useBoardPost } from "@/hooks/use-board-posts";

const boardFormSchema = z.object({
    brdId: z.string().min(1, "게시판을 선택해주세요."),
    title: z.string().min(1, "제목은 필수입니다.").max(1000, "제목은 1000자 이하여야 합니다."),
    contents: z.string().optional(),
    secretYn: z.string(),
    useYn: z.string(),
});

type BoardFormValues = z.infer<typeof boardFormSchema>;

interface BoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    board?: Board | null;
    defaultBrdId?: string;
    onSubmit: (data: Partial<Board> & { deleteFileIds?: number[] }, files: File[] | null) => Promise<void>;
}

export function BoardDialog({ open, onOpenChange, board, defaultBrdId, onSubmit }: BoardDialogProps) {
    const isEdit = !!board;

    // Board Selection Logic Removed - Implicitly handled by defaultBrdId

    const form = useForm<BoardFormValues>({
        resolver: zodResolver(boardFormSchema),
        defaultValues: {
            brdId: "",
            title: "",
            contents: "",
            secretYn: "0",
            useYn: "1",
        },
    });

    const { data: boardDetail } = useBoardPost(board?.boardId);
    const effectiveBoard = boardDetail || board;

    const [files, setFiles] = React.useState<File[]>([]);
    const [existingFiles, setExistingFiles] = React.useState<BoardFile[]>([]);
    const [deletedFileIds, setDeletedFileIds] = React.useState<number[]>([]);

    React.useEffect(() => {
        if (open) {
            setFiles([]); // Reset files on open
            setDeletedFileIds([]);
            if (effectiveBoard) {
                form.reset({
                    brdId: effectiveBoard.brdId || "",
                    title: effectiveBoard.title || "",
                    contents: effectiveBoard.contents || "",
                    secretYn: effectiveBoard.secretYn || "0",
                    useYn: effectiveBoard.useYn || "1",
                });
                setExistingFiles(effectiveBoard.fileList || []);
            } else {
                form.reset({
                    brdId: defaultBrdId || "",
                    title: "",
                    contents: "",
                    secretYn: "0",
                    useYn: "1",
                });
                setExistingFiles([]);
            }
        }
    }, [open, effectiveBoard, form, defaultBrdId]);



    const onFormSubmit = async (data: BoardFormValues) => {
        await onSubmit({ ...data, deleteFileIds: deletedFileIds }, files);
    };

    const handleDeleteExisting = (fileId: number) => {
        setExistingFiles((prev) => prev.filter((f) => f.fileId !== fileId));
        setDeletedFileIds((prev) => [...prev, fileId]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background dark:bg-card rounded-xl border-none shadow-2xl">
                <div className="bg-background dark:bg-card px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold leading-6 text-foreground dark:text-foreground flex items-center gap-2">
                        <FileText className="text-primary w-6 h-6" />
                        {isEdit ? "게시물 수정" : "게시물 작성"}
                    </h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="px-6 py-6 space-y-5">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Board ID is hidden/implicit via URL */}
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        제목 <span className="text-primary">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                            placeholder="제목을 입력하세요"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contents"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        내용
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground min-h-[150px]"
                                            placeholder="내용을 입력하세요"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FileUpload
                                files={files}
                                onFilesChange={setFiles}
                                existingFiles={existingFiles}
                                onDeleteExisting={handleDeleteExisting}
                                onDownloadExisting={async (fileId) => {
                                    const file = existingFiles.find(f => f.fileId === fileId);
                                    if (file) {
                                        await downloadBoardFile(fileId, file.orgFileNm);
                                    }
                                }}
                                maxSize={500 * 1024 * 1024} // 500MB
                            />
                        </div>

                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="secretYn"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">
                                            비밀글
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
