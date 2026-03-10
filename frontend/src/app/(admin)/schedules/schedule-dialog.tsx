"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Schedule, ScheduleRequest } from "@/types";
import { CheckSquare } from "lucide-react";
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

const scheduleFormSchema = z.object({
    beanName: z.string().min(1, "Bean Name is required."),
    cron: z.string().min(1, "Cron expression is required."),
    beanParam: z.string().optional(),
    comment: z.string().optional(),
    used: z.boolean(),
    stop: z.boolean(),
    creator: z.string().optional(),
    updater: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule?: Schedule | null;
    onSubmit: (data: ScheduleRequest) => Promise<void>;
}

export function ScheduleDialog({ open, onOpenChange, schedule, onSubmit }: ScheduleDialogProps) {
    const isEdit = !!schedule;

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            beanName: "",
            cron: "",
            beanParam: "",
            comment: "",
            used: false,
            stop: false,
            creator: "admin",
            updater: "admin",
        },
    });

    React.useEffect(() => {
        if (open) {
            if (schedule) {
                form.reset({
                    beanName: schedule.beanName || "",
                    cron: schedule.cron || "",
                    beanParam: schedule.beanParam || "",
                    comment: schedule.comment || "",
                    used: Boolean(schedule.used),
                    stop: Boolean(schedule.stop),
                    creator: schedule.creator || "admin",
                    updater: schedule.updater || "admin",
                });
            } else {
                form.reset({
                    beanName: "",
                    cron: "",
                    beanParam: "",
                    comment: "",
                    used: false,
                    stop: false,
                    creator: "admin",
                    updater: "admin",
                });
            }
        }
    }, [open, schedule, form]);

    const onFormSubmit = async (data: ScheduleFormValues) => {
        // Prepare request parameters
        const request: ScheduleRequest = {
            beanName: data.beanName,
            cron: data.cron,
            beanParam: data.beanParam,
            comment: data.comment,
            used: data.used,
            stop: data.stop,
            creator: data.creator,
            updater: data.updater,
        };
        await onSubmit(request);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} closeOnOutsideClick={false}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background dark:bg-card rounded-xl border-none shadow-2xl">
                <div className="bg-background dark:bg-card px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold leading-6 text-foreground dark:text-foreground flex items-center gap-2">
                        <CheckSquare className="text-primary w-6 h-6" />
                        {isEdit ? "스케줄 수정" : "스케줄 등록"}
                    </h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="px-6 py-6 space-y-5">
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="beanName"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                            스케줄 빈 이름 (Bean Name) <span className="text-primary">*</span>
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    placeholder="testPrintJob"
                                                    {...field}
                                                    className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cron"
                                render={({ field }) => (
                                    <FormItem className="w-[180px]">
                                        <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                            크론식 (Cron) <span className="text-primary">*</span>
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    placeholder="0 * * * * *"
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
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        스케줄 설명
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="이 스케줄의 목적이 무엇인지 간략히 설명하세요."
                                            {...field}
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="beanParam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                        스케줄 파라미터 (JSON 형태)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{"key": "value"}'
                                            {...field}
                                            className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground font-mono"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        실행되는 Bean 메서드에 첫번째 인자로 전달할 JSON 텍스트 내용입니다.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-8 border p-4 rounded-lg bg-slate-50 dark:bg-muted/10">
                            <FormField
                                control={form.control}
                                name="used"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg gap-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-bold text-foreground">사용 여부 (Used)</FormLabel>
                                            <FormDescription className="text-xs text-muted-foreground">
                                                서버의 스프링 스케줄러에 등록할지 여부를 결정합니다.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="w-px h-10 bg-slate-200 dark:bg-border"></div>

                            <FormField
                                control={form.control}
                                name="stop"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg gap-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-bold text-rose-600 dark:text-rose-400">강제 정지 (Stop)</FormLabel>
                                            <FormDescription className="text-xs text-muted-foreground">
                                                실행 도중 이면 강제로 정지시킵니다 (사용주의).
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
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
